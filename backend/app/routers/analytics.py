import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.database import get_db
from app.models import User, Trip
from app.schemas import AnalyticsResponse, MetricSummary
from app.routers.trips import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponse)
def get_analytics(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.datetime.utcnow()
    start_date = now - datetime.timedelta(days=days)
    seven_days_ago = now - datetime.timedelta(days=7)
    fourteen_days_ago = now - datetime.timedelta(days=14)

    # All trips in date range
    trips = (
        db.query(Trip)
        .filter(Trip.user_id == current_user.id, Trip.created_at >= start_date)
        .order_by(Trip.created_at.asc())
        .all()
    )

    # Time series data points
    trips_trend = []
    for t in trips:
        trips_trend.append({
            "id": t.id,
            "date": t.created_at.strftime("%b %d"),
            "full_timestamp": t.created_at.isoformat(),
            "score": t.eco_score,
            "co2_kg": t.co2_emissions_kg,
            "distance_km": t.distance_km,
            "idle_ratio_pct": round(t.idle_ratio * 100.0, 1),
            "vehicle_type": t.vehicle_type,
            "smoothness": t.score_smoothness,
            "efficiency": t.score_efficiency
        })

    # Week-over-week comparisons: Last 7 days vs Prior 7 days (7-14 days ago)
    curr_week_trips = [t for t in trips if t.created_at >= seven_days_ago]
    prev_week_trips = (
        db.query(Trip)
        .filter(Trip.user_id == current_user.id, Trip.created_at >= fourteen_days_ago, Trip.created_at < seven_days_ago)
        .all()
    )

    def calc_delta(curr: float, prev: float, is_positive_good: bool, unit: str) -> MetricSummary:
        if prev == 0.0:
            pct_change = 0.0 if curr == 0.0 else 100.0
        else:
            pct_change = round(((curr - prev) / prev) * 100.0, 1)
        return MetricSummary(
            current_value=round(curr, 2),
            previous_value=round(prev, 2),
            change_percentage=pct_change,
            unit=unit,
            is_positive_good=is_positive_good
        )

    # 1. Average Eco Score
    curr_score = (sum(t.eco_score for t in curr_week_trips) / len(curr_week_trips)) if curr_week_trips else 0.0
    prev_score = (sum(t.eco_score for t in prev_week_trips) / len(prev_week_trips)) if prev_week_trips else curr_score
    score_metric = calc_delta(curr_score, prev_score, is_positive_good=True, unit="pts")

    # 2. Total CO2 (lower is better)
    curr_co2 = sum(t.co2_emissions_kg for t in curr_week_trips)
    prev_co2 = sum(t.co2_emissions_kg for t in prev_week_trips)
    co2_metric = calc_delta(curr_co2, prev_co2, is_positive_good=False, unit="kg")

    # 3. Average Idle Ratio (lower is better)
    curr_idle = ((sum(t.idle_minutes for t in curr_week_trips) / sum(t.duration_minutes for t in curr_week_trips)) * 100.0) if curr_week_trips and sum(t.duration_minutes for t in curr_week_trips) > 0 else 0.0
    prev_idle = ((sum(t.idle_minutes for t in prev_week_trips) / sum(t.duration_minutes for t in prev_week_trips)) * 100.0) if prev_week_trips and sum(t.duration_minutes for t in prev_week_trips) > 0 else curr_idle
    idle_metric = calc_delta(curr_idle, prev_idle, is_positive_good=False, unit="%")

    # 4. Total Distance
    curr_dist = sum(t.distance_km for t in curr_week_trips)
    prev_dist = sum(t.distance_km for t in prev_week_trips)
    dist_metric = calc_delta(curr_dist, prev_dist, is_positive_good=True, unit="km")

    # Breakdown by vehicle type
    vehicle_breakdown: Dict[str, Dict[str, float]] = {}
    for v_type in ["Petrol", "Diesel", "Hybrid", "EV"]:
        v_trips = [t for t in trips if t.vehicle_type == v_type]
        if v_trips:
            vehicle_breakdown[v_type] = {
                "trips_count": len(v_trips),
                "total_km": round(sum(t.distance_km for t in v_trips), 1),
                "avg_score": round(sum(t.eco_score for t in v_trips) / len(v_trips), 1),
                "total_co2_kg": round(sum(t.co2_emissions_kg for t in v_trips), 2),
                "co2_per_km": round(sum(t.co2_emissions_kg for t in v_trips) / sum(t.distance_km for t in v_trips), 3) if sum(t.distance_km for t in v_trips) > 0 else 0.0
            }

    # Smoothness statistics
    total_accel = sum(t.harsh_accel_count for t in trips)
    total_brake = sum(t.harsh_brake_count for t in trips)
    smoothness_stats = {
        "harsh_accelerations_total": total_accel,
        "harsh_braking_total": total_brake,
        "events_per_100km": round(((total_accel + total_brake) / (sum(t.distance_km for t in trips) / 100.0)), 1) if trips and sum(t.distance_km for t in trips) > 0 else 0.0
    }

    return AnalyticsResponse(
        trips_trend=trips_trend,
        metrics_comparison={
            "eco_score": score_metric,
            "co2_emissions": co2_metric,
            "idle_percentage": idle_metric,
            "distance": dist_metric
        },
        vehicle_breakdown=vehicle_breakdown,
        smoothness_stats=smoothness_stats
    )
