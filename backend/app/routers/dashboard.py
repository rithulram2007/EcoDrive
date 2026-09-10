import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models import User, Trip, Challenge, UserChallenge
from app.schemas import DashboardResponse, UserProfileResponse, ChallengeResponse, TripResponse
from app.routers.trips import get_current_user
from app.services.scoring_engine import ScoringEngine
from app.services.gamification_engine import GamificationEngine
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all user trips ordered newest first
    trips = (
        db.query(Trip)
        .filter(Trip.user_id == current_user.id)
        .order_by(Trip.created_at.desc())
        .all()
    )

    total_trips = len(trips)
    total_distance = sum(t.distance_km for t in trips)
    total_co2 = sum(t.co2_emissions_kg for t in trips)
    
    # Calculate weighted average recent score
    if trips:
        # Give more weight to last 10 trips
        recent_10 = trips[:10]
        current_score = round(sum(t.eco_score for t in recent_10) / len(recent_10), 1)
        avg_smoothness = round(sum(t.score_smoothness for t in recent_10) / len(recent_10), 1)
        avg_speed = round(sum(t.score_speed for t in recent_10) / len(recent_10), 1)
        avg_idle = round(sum(t.score_idle for t in recent_10) / len(recent_10), 1)
        avg_eff = round(sum(t.score_efficiency for t in recent_10) / len(recent_10), 1)
        
        avg_speed_overall = round(sum(t.avg_speed_kmh for t in trips) / total_trips, 1)
        total_duration = sum(t.duration_minutes for t in trips)
        total_idle_min = sum(t.idle_minutes for t in trips)
        overall_idle_pct = round((total_idle_min / total_duration * 100.0), 1) if total_duration > 0 else 0.0
    else:
        current_score = 0.0
        avg_smoothness = 0.0
        avg_speed = 0.0
        avg_idle = 0.0
        avg_eff = 0.0
        avg_speed_overall = 0.0
        overall_idle_pct = 0.0

    score_rating = ScoringEngine.get_score_rating(current_score) if trips else "No Data"

    # User Profile & Gamification Stats
    level_info = GamificationEngine.get_level_info(current_user.current_xp)
    user_profile = UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        avatar_url=current_user.avatar_url,
        current_xp=current_user.current_xp,
        level=level_info["level"],
        level_title=level_info["level_title"],
        xp_for_next_level=level_info["next_level_xp"],
        level_progress_percent=level_info["progress_percentage"],
        current_streak=current_user.current_streak or 0,
        best_streak=current_user.best_streak or 0,
        total_co2_saved_kg=round(current_user.total_co2_saved_kg or 0.0, 1),
        total_distance_km=round(total_distance, 1),
        total_trips_count=total_trips,
        average_eco_score=current_score
    )

    # Active Challenges
    user_challenges = (
        db.query(UserChallenge)
        .filter(UserChallenge.user_id == current_user.id)
        .all()
    )
    active_challenges = []
    for uc in user_challenges:
        c = uc.challenge
        prog_pct = round(min(100.0, (uc.current_progress / c.target_value) * 100.0), 1) if c.target_value > 0 else 0.0
        active_challenges.append(
            ChallengeResponse(
                id=c.id,
                code=c.code,
                title=c.title,
                description=c.description,
                category=c.category,
                target_type=c.target_type,
                target_value=c.target_value,
                current_progress=round(uc.current_progress, 1),
                progress_percentage=prog_pct,
                reward_xp=c.reward_xp,
                badge_code=c.badge_code,
                icon=c.icon,
                is_completed=uc.is_completed,
                completed_at=uc.completed_at
            )
        )

    # Weekly Trend Data (last 7 days grouped by day)
    today = datetime.datetime.utcnow().date()
    weekly_trend = []
    for i in range(6, -1, -1):
        day_date = today - datetime.timedelta(days=i)
        day_trips = [t for t in trips if t.created_at.date() == day_date]
        day_score = round(sum(t.eco_score for t in day_trips) / len(day_trips), 1) if day_trips else None
        day_distance = round(sum(t.distance_km for t in day_trips), 1)
        day_co2 = round(sum(t.co2_emissions_kg for t in day_trips), 2)
        weekly_trend.append({
            "date": day_date.strftime("%a"),
            "full_date": day_date.strftime("%Y-%m-%d"),
            "score": day_score if day_score is not None else 0,
            "has_trips": len(day_trips) > 0,
            "distance_km": day_distance,
            "co2_kg": day_co2
        })

    # Personalized Coaching Insight
    coaching_tips = RecommendationEngine.generate_tips_for_trips(trips)
    primary_tip = coaching_tips[0]["tip"] if coaching_tips else "Keep maintaining steady acceleration and cruise speeds."

    # Environmental impact statement
    trees_equivalent = round(user_profile.total_co2_saved_kg / 21.0, 1) # ~21kg CO2 absorbed per mature tree per year
    impact_statement = f"You have prevented {user_profile.total_co2_saved_kg} kg of CO₂ from entering the atmosphere — equivalent to the annual absorption of ~{trees_equivalent} mature trees."

    return DashboardResponse(
        user=user_profile,
        current_eco_score=current_score,
        score_rating=score_rating,
        score_breakdown={
            "smoothness": avg_smoothness,
            "speed_efficiency": avg_speed,
            "idle_efficiency": avg_idle,
            "energy_efficiency": avg_eff
        },
        total_co2_kg=round(total_co2, 2),
        total_distance_km=round(total_distance, 1),
        average_speed_kmh=avg_speed_overall,
        idle_percentage=overall_idle_pct,
        recent_trips=[TripResponse.model_validate(t) for t in trips[:6]],
        active_challenges=active_challenges[:4],
        weekly_trend=weekly_trend,
        personalized_tip=primary_tip,
        eco_impact_statement=impact_statement
    )
