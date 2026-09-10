from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class VehicleTypeEnum(str):
    PETROL = "Petrol"
    DIESEL = "Diesel"
    HYBRID = "Hybrid"
    EV = "EV"

# --- Trip Schemas ---
class TripBase(BaseModel):
    vehicle_type: str = Field(..., description="Petrol, Diesel, Hybrid, or EV")
    distance_km: float = Field(..., gt=0, description="Distance traveled in kilometers")
    duration_minutes: float = Field(..., gt=0, description="Trip duration in minutes")
    avg_speed_kmh: float = Field(..., ge=0, description="Average speed in km/h")
    max_speed_kmh: float = Field(..., ge=0, description="Maximum speed in km/h")
    idle_minutes: float = Field(0.0, ge=0, description="Time spent stationary with engine on / active")
    harsh_accel_count: int = Field(0, ge=0, description="Count of aggressive acceleration events (>2.5 m/s²)")
    harsh_brake_count: int = Field(0, ge=0, description="Count of hard braking events (<-2.8 m/s²)")
    fuel_consumed_liters: Optional[float] = Field(None, ge=0, description="Fuel consumed in liters (for ICE/Hybrid)")
    energy_consumed_kwh: Optional[float] = Field(None, ge=0, description="Energy consumed in kWh (for EV)")
    notes: Optional[str] = None

    @field_validator("vehicle_type")
    def validate_vehicle_type(cls, v):
        allowed = ["Petrol", "Diesel", "Hybrid", "EV"]
        v_clean = v.strip().capitalize() if v.lower() != "ev" else "EV"
        if v_clean not in allowed:
            raise ValueError(f"Vehicle type must be one of {allowed}")
        return v_clean

    @field_validator("max_speed_kmh")
    def validate_speeds(cls, v, info):
        avg = info.data.get("avg_speed_kmh", 0)
        if v < avg:
            raise ValueError("Maximum speed cannot be lower than average speed")
        return v

    @field_validator("idle_minutes")
    def validate_idle(cls, v, info):
        dur = info.data.get("duration_minutes", 0)
        if dur and v > dur:
            raise ValueError("Idle time cannot exceed total trip duration")
        return v


class TripCreate(TripBase):
    pass


class TripResponse(TripBase):
    id: int
    user_id: int
    idle_ratio: float
    co2_emissions_kg: float
    eco_score: float
    score_smoothness: float
    score_speed: float
    score_idle: float
    score_efficiency: float
    score_drop_reasons: List[str]
    source: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- User & Gamification Schemas ---
class BadgeResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    category: str
    icon: str
    xp_reward: int
    is_unlocked: bool = False
    awarded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChallengeResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    category: str
    target_type: str
    target_value: float
    current_progress: float
    progress_percentage: float
    reward_xp: int
    badge_code: Optional[str]
    icon: str
    is_completed: bool
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str]
    current_xp: int
    level: int
    level_title: str
    xp_for_next_level: int
    level_progress_percent: float
    current_streak: int
    best_streak: int
    total_co2_saved_kg: float
    total_distance_km: float
    total_trips_count: int
    average_eco_score: float

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    name: str
    avatar_url: Optional[str]
    level: int
    level_title: str
    current_xp: int
    average_eco_score: float
    badges_count: int
    is_current_user: bool = False
    is_demo: bool = True


# --- Analytics & Dashboard Schemas ---
class MetricSummary(BaseModel):
    current_value: float
    previous_value: float
    change_percentage: float
    unit: str
    is_positive_good: bool


class DashboardResponse(BaseModel):
    user: UserProfileResponse
    current_eco_score: float
    score_rating: str # Excellent, Good, Fair, Needs Improvement
    score_breakdown: Dict[str, float]
    total_co2_kg: float
    total_distance_km: float
    average_speed_kmh: float
    idle_percentage: float
    recent_trips: List[TripResponse]
    active_challenges: List[ChallengeResponse]
    weekly_trend: List[Dict[str, Any]]
    personalized_tip: str
    eco_impact_statement: str


class AnalyticsResponse(BaseModel):
    trips_trend: List[Dict[str, Any]] # date, score, co2, distance, idle_ratio
    metrics_comparison: Dict[str, MetricSummary]
    vehicle_breakdown: Dict[str, Dict[str, float]]
    smoothness_stats: Dict[str, Any]


class WeeklyInsightsResponse(BaseModel):
    week_start: str
    week_end: str
    trips_count: int
    total_distance_km: float
    total_co2_kg: float
    average_eco_score: float
    average_efficiency: float # L/100km or equivalent
    score_change_vs_last_week: float
    co2_change_vs_last_week: float
    best_trip: Optional[TripResponse]
    biggest_improvement_area: str
    actionable_recommendations: List[Dict[str, Any]]


class EvVsIceComparisonResponse(BaseModel):
    distance_km: float
    ice_petrol_co2_kg: float
    ice_diesel_co2_kg: float
    hybrid_co2_kg: float
    ev_co2_kg: float
    co2_savings_kg: float
    co2_reduction_percentage: float
    ice_cost_usd: float
    ev_cost_usd: float
    cost_savings_usd: float
    assumptions: Dict[str, Any]
