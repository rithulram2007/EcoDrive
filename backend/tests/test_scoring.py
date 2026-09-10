import pytest
from app.services.scoring_engine import ScoringEngine

def test_pristine_trip_scoring():
    score, smooth, speed, idle, eff, reasons = ScoringEngine.calculate_scores(
        distance_km=20.0,
        duration_minutes=25.0,
        avg_speed_kmh=48.0,
        max_speed_kmh=75.0,
        idle_minutes=1.0,
        harsh_accel_count=0,
        harsh_brake_count=0,
        vehicle_type="Petrol",
        fuel_consumed_liters=1.35
    )
    assert score >= 88.0
    assert smooth == 100.0
    assert idle == 100.0
    assert speed == 100.0
    assert eff >= 85.0
    assert any("Flawless" in r or len(reasons) > 0 for r in reasons)

def test_aggressive_trip_penalties():
    score, smooth, speed, idle, eff, reasons = ScoringEngine.calculate_scores(
        distance_km=15.0,
        duration_minutes=18.0,
        avg_speed_kmh=50.0,
        max_speed_kmh=130.0,
        idle_minutes=0.5,
        harsh_accel_count=4,
        harsh_brake_count=3,
        vehicle_type="Petrol",
        fuel_consumed_liters=2.2
    )
    assert score < 70.0
    assert smooth < 60.0
    assert speed < 80.0 # high speed aero drag penalty
    # Assert drop reasons clearly explain the penalties
    assert any("harsh acceleration" in r for r in reasons)
    assert any("harsh braking" in r for r in reasons)
    assert any("aero drag" in r or "High speeds" in r for r in reasons)

def test_heavy_idle_trip_penalties():
    score, smooth, speed, idle, eff, reasons = ScoringEngine.calculate_scores(
        distance_km=8.0,
        duration_minutes=30.0,
        avg_speed_kmh=16.0,
        max_speed_kmh=45.0,
        idle_minutes=12.0, # 40% idle
        harsh_accel_count=0,
        harsh_brake_count=0,
        vehicle_type="Petrol"
    )
    assert idle < 50.0
    assert score <= 75.0
    assert any("Idle time accounted for" in r for r in reasons)
