import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import User, Trip
from app.schemas import WeeklyInsightsResponse, TripResponse

class RecommendationEngine:
    """
    Rule-based deterministic coaching and weekly performance insight engine.
    """

    @classmethod
    def generate_tips_for_trips(cls, trips: List[Trip]) -> List[Dict[str, Any]]:
        if not trips:
            return [{
                "title": "Welcome to EcoDrive",
                "category": "Getting Started",
                "impact": "High",
                "tip": "Log your first driving trip or upload telemetry data to unlock personalized coaching insights."
            }]

        tips = []
        recent_trips = trips[:5]
        
        # 1. Idle time analysis
        avg_idle_ratio = sum(t.idle_ratio for t in recent_trips) / len(recent_trips)
        if avg_idle_ratio > 0.08:
            idle_pct = round(avg_idle_ratio * 100, 1)
            tips.append({
                "title": "Mitigate Prolonged Idling",
                "category": "Idle Efficiency",
                "impact": "High",
                "tip": f"Idle time averaged {idle_pct}% across recent trips. Idling consumes ~0.8–1.2 L/hr without moving. Turn off your ignition during stops longer than 30 seconds."
            })

        # 2. Harsh acceleration / throttle modulation
        total_harsh_accel = sum(t.harsh_accel_count for t in recent_trips)
        if total_harsh_accel >= 3:
            tips.append({
                "title": "Modulate Throttle Progression",
                "category": "Smoothness",
                "impact": "Medium",
                "tip": f"Detected {total_harsh_accel} aggressive acceleration events. Easing into the throttle over 5 seconds saves up to 15% in fuel and energy."
            })

        # 3. Harsh braking / anticipatory driving
        total_harsh_brake = sum(t.harsh_brake_count for t in recent_trips)
        if total_harsh_brake >= 3:
            tips.append({
                "title": "Anticipate Traffic Deceleration",
                "category": "Anticipation",
                "impact": "High",
                "tip": f"Detected {total_harsh_brake} hard braking events. Increase your following distance by 1–2 seconds to coast smoothly into stops and maximize regenerative braking (EV/Hybrid)."
            })

        # 4. Highway cruising speed & aerodynamic drag
        fast_trips = [t for t in recent_trips if t.max_speed_kmh > 115.0]
        if fast_trips:
            max_spd = round(max(t.max_speed_kmh for t in fast_trips), 1)
            tips.append({
                "title": "Optimize Highway Cruise Speed",
                "category": "Speed Efficiency",
                "impact": "Medium",
                "tip": f"Peak speed reached {max_spd} km/h. Aerodynamic drag increases quadratically. Driving at 100 km/h instead of 120 km/h improves fuel economy by ~12-18%."
            })

        # 5. Electric Vehicle / Hybrid regenerative advice
        ev_trips = [t for t in recent_trips if t.vehicle_type in ["EV", "Hybrid"]]
        if ev_trips:
            tips.append({
                "title": "Maximize One-Pedal Regenerative Braking",
                "category": "EV Optimization",
                "impact": "Low",
                "tip": "When driving your EV/Hybrid, use high regenerative braking modes in urban traffic to capture kinetic energy and extend range."
            })

        # Default fallback tip if driving is already pristine
        if not tips:
            tips.append({
                "title": "Maintain Exemplary Eco Habits",
                "category": "Consistency",
                "impact": "Low",
                "tip": "Your recent driving exhibits smooth throttle control, optimal speeds, and low idle times. Keep up the high score streak!"
            })

        return tips

    @classmethod
    def generate_weekly_report(cls, user_id: int, db: Session) -> WeeklyInsightsResponse:
        now = datetime.datetime.utcnow()
        seven_days_ago = now - datetime.timedelta(days=7)
        fourteen_days_ago = now - datetime.timedelta(days=14)

        current_trips = (
            db.query(Trip)
            .filter(Trip.user_id == user_id, Trip.created_at >= seven_days_ago)
            .order_by(Trip.created_at.desc())
            .all()
        )
        previous_trips = (
            db.query(Trip)
            .filter(Trip.user_id == user_id, Trip.created_at >= fourteen_days_ago, Trip.created_at < seven_days_ago)
            .all()
        )

        curr_count = len(current_trips)
        curr_distance = sum(t.distance_km for t in current_trips)
        curr_co2 = sum(t.co2_emissions_kg for t in current_trips)
        curr_avg_score = (sum(t.eco_score for t in current_trips) / curr_count) if curr_count > 0 else 0.0

        prev_count = len(previous_trips)
        prev_co2 = sum(t.co2_emissions_kg for t in previous_trips)
        prev_avg_score = (sum(t.eco_score for t in previous_trips) / prev_count) if prev_count > 0 else curr_avg_score

        # Deltas
        score_delta = round(curr_avg_score - prev_avg_score, 1)
        co2_delta = round(curr_co2 - prev_co2, 1)

        # Best trip
        best_trip = max(current_trips, key=lambda t: t.eco_score) if current_trips else None

        # Determine biggest improvement area
        improvement_area = "Idle Time Reduction"
        if current_trips:
            avg_smooth = sum(t.score_smoothness for t in current_trips) / curr_count
            avg_idle = sum(t.score_idle for t in current_trips) / curr_count
            avg_speed = sum(t.score_speed for t in current_trips) / curr_count
            lowest = min([("Throttle & Brake Smoothness", avg_smooth), ("Stationary Idle Reduction", avg_idle), ("Cruising Speed Efficiency", avg_speed)], key=lambda x: x[1])
            improvement_area = lowest[0]

        tips = cls.generate_tips_for_trips(current_trips)

        return WeeklyInsightsResponse(
            week_start=seven_days_ago.strftime("%b %d"),
            week_end=now.strftime("%b %d, %Y"),
            trips_count=curr_count,
            total_distance_km=round(curr_distance, 1),
            total_co2_kg=round(curr_co2, 2),
            average_eco_score=round(curr_avg_score, 1),
            average_efficiency=round((curr_co2 / curr_distance) * 100.0, 1) if curr_distance > 0 else 0.0,
            score_change_vs_last_week=score_delta,
            co2_change_vs_last_week=co2_delta,
            best_trip=TripResponse.model_validate(best_trip) if best_trip else None,
            biggest_improvement_area=improvement_area,
            actionable_recommendations=tips
        )
