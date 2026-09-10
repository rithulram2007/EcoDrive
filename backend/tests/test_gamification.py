import pytest
from app.services.gamification_engine import GamificationEngine
from app.models import Trip

def test_xp_calculation():
    # Pristine trip (90 score, 0 harsh events)
    trip = Trip(
        eco_score=90.0,
        distance_km=20.0,
        harsh_accel_count=0,
        harsh_brake_count=0
    )
    xp = GamificationEngine.calculate_trip_xp(trip)
    # Base 50 + (90-50)*2 (=80) + min(30, 20*1.5)(=30) + 25 = 185
    assert xp == 185

def test_levels_and_titles():
    lvl1 = GamificationEngine.get_level_info(150)
    assert lvl1["level"] == 1
    assert lvl1["level_title"] == "Seedling"

    lvl2 = GamificationEngine.get_level_info(450)
    assert lvl2["level"] == 2
    assert lvl2["level_title"] == "Sprout"

    lvl3 = GamificationEngine.get_level_info(1100)
    assert lvl3["level"] == 3
    assert lvl3["level_title"] == "Green Driver"

    lvl4 = GamificationEngine.get_level_info(2000)
    assert lvl4["level"] == 4
    assert lvl4["level_title"] == "Eco Champion"

    lvl5 = GamificationEngine.get_level_info(3500)
    assert lvl5["level"] == 5
    assert lvl5["level_title"] == "Planet Saver"
