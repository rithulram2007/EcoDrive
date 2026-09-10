from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Challenge, UserChallenge, Badge, UserBadge, Trip
from app.schemas import (
    ChallengeResponse, BadgeResponse, LeaderboardEntry, UserProfileResponse
)
from app.routers.trips import get_current_user
from app.services.gamification_engine import GamificationEngine

router = APIRouter(prefix="/api", tags=["Gamification"])

@router.get("/challenges", response_model=List[ChallengeResponse])
def get_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all available challenges and current user progress.
    """
    user_challenges = (
        db.query(UserChallenge)
        .filter(UserChallenge.user_id == current_user.id)
        .all()
    )
    results = []
    for uc in user_challenges:
        c = uc.challenge
        prog_pct = round(min(100.0, (uc.current_progress / c.target_value) * 100.0), 1) if c.target_value > 0 else 0.0
        results.append(
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
    return results


@router.get("/badges", response_model=List[BadgeResponse])
def get_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all badges with user unlock status.
    """
    all_badges = db.query(Badge).all()
    user_badges_map = {
        ub.badge_id: ub.awarded_at
        for ub in db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    }

    results = []
    for b in all_badges:
        is_unlocked = b.id in user_badges_map
        results.append(
            BadgeResponse(
                id=b.id,
                code=b.code,
                title=b.title,
                description=b.description,
                category=b.category,
                icon=b.icon,
                xp_reward=b.xp_reward,
                is_unlocked=is_unlocked,
                awarded_at=user_badges_map.get(b.id)
            )
        )
    return results


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get driver leaderboard ranked by XP with demo indicators.
    """
    users = db.query(User).order_by(User.current_xp.desc()).limit(20).all()
    
    entries = []
    for rank, u in enumerate(users, start=1):
        trips = db.query(Trip).filter(Trip.user_id == u.id).all()
        avg_score = round(sum(t.eco_score for t in trips) / len(trips), 1) if trips else 0.0
        badge_count = db.query(UserBadge).filter(UserBadge.user_id == u.id).count()

        entries.append(
            LeaderboardEntry(
                rank=rank,
                user_id=u.id,
                name=u.name,
                avatar_url=u.avatar_url,
                level=u.level,
                level_title=u.level_title,
                current_xp=u.current_xp,
                average_eco_score=avg_score,
                badges_count=badge_count,
                is_current_user=(u.id == current_user.id),
                is_demo=bool(u.is_demo)
            )
        )
    return entries


@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get profile, level, streak, and lifetime statistics for the current user.
    """
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    total_km = sum(t.distance_km for t in trips)
    avg_score = round(sum(t.eco_score for t in trips) / len(trips), 1) if trips else 0.0
    level_info = GamificationEngine.get_level_info(current_user.current_xp)

    return UserProfileResponse(
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
        total_distance_km=round(total_km, 1),
        total_trips_count=len(trips),
        average_eco_score=avg_score
    )
