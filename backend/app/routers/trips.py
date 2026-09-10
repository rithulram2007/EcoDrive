from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from app.database import get_db
from app.models import User, Trip
from app.schemas import TripCreate, TripResponse
from app.services.co2_calculator import CO2Calculator
from app.services.scoring_engine import ScoringEngine
from app.services.gamification_engine import GamificationEngine
from app.services.challenge_engine import ChallengeEngine
from app.services.csv_parser import CSVTelemetryParser

router = APIRouter(prefix="/api/trips", tags=["Trips"])

def get_current_user(db: Session = Depends(get_db)) -> User:
    # EcoDrive provides a designated primary active user ("Alex Rivera")
    user = db.query(User).filter(User.is_demo == False).first()
    if not user:
        user = db.query(User).first()
    if not user:
        # Create default primary user if DB empty
        user = User(
            name="Alex Rivera",
            email="alex.rivera@ecodrive.io",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            current_xp=450,
            level=2,
            level_title="Sprout",
            current_streak=3,
            best_streak=5,
            total_co2_saved_kg=14.2,
            is_demo=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def process_and_save_trip(
    trip_data: TripCreate,
    user: User,
    db: Session,
    source: str = "manual"
) -> Trip:
    # 1. CO2 Calculation
    co2_kg, resolved_fuel, resolved_energy = CO2Calculator.calculate_trip_emissions(
        vehicle_type=trip_data.vehicle_type,
        distance_km=trip_data.distance_km,
        fuel_consumed_liters=trip_data.fuel_consumed_liters,
        energy_consumed_kwh=trip_data.energy_consumed_kwh
    )

    # 2. Transparent Composite Eco Score Calculation
    eco_score, s_smooth, s_speed, s_idle, s_eff, drop_reasons = ScoringEngine.calculate_scores(
        distance_km=trip_data.distance_km,
        duration_minutes=trip_data.duration_minutes,
        avg_speed_kmh=trip_data.avg_speed_kmh,
        max_speed_kmh=trip_data.max_speed_kmh,
        idle_minutes=trip_data.idle_minutes,
        harsh_accel_count=trip_data.harsh_accel_count,
        harsh_brake_count=trip_data.harsh_brake_count,
        vehicle_type=trip_data.vehicle_type,
        fuel_consumed_liters=resolved_fuel,
        energy_consumed_kwh=resolved_energy
    )

    idle_ratio = round((trip_data.idle_minutes / trip_data.duration_minutes), 3) if trip_data.duration_minutes > 0 else 0.0

    # 3. Create DB Record
    new_trip = Trip(
        user_id=user.id,
        vehicle_type=trip_data.vehicle_type,
        distance_km=round(trip_data.distance_km, 2),
        duration_minutes=round(trip_data.duration_minutes, 1),
        avg_speed_kmh=round(trip_data.avg_speed_kmh, 1),
        max_speed_kmh=round(trip_data.max_speed_kmh, 1),
        idle_minutes=round(trip_data.idle_minutes, 1),
        idle_ratio=idle_ratio,
        harsh_accel_count=trip_data.harsh_accel_count,
        harsh_brake_count=trip_data.harsh_brake_count,
        fuel_consumed_liters=resolved_fuel,
        energy_consumed_kwh=resolved_energy,
        co2_emissions_kg=co2_kg,
        eco_score=eco_score,
        score_smoothness=s_smooth,
        score_speed=s_speed,
        score_idle=s_idle,
        score_efficiency=s_eff,
        score_drop_reasons=drop_reasons,
        source=source,
        notes=trip_data.notes,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_trip)
    db.flush()

    # 4. Update Gamification: XP
    xp_earned = GamificationEngine.calculate_trip_xp(new_trip)
    user.current_xp += xp_earned

    # 5. Update Streak
    GamificationEngine.update_streak(user, db)

    # 6. Evaluate Badges
    GamificationEngine.evaluate_badges(user, new_trip, db)

    # 7. Evaluate Challenges
    ChallengeEngine.evaluate_user_challenges(user, db)

    # 8. Update cumulative CO2 saved vs baseline
    co2_saved = CO2Calculator.calculate_co2_savings_vs_benchmark(co2_kg, trip_data.distance_km)
    user.total_co2_saved_kg = round((user.total_co2_saved_kg or 0.0) + co2_saved, 2)

    # Level info sync
    lvl_info = GamificationEngine.get_level_info(user.current_xp)
    user.level = lvl_info["level"]
    user.level_title = lvl_info["level_title"]

    db.commit()
    db.refresh(new_trip)
    return new_trip


@router.post("", response_model=TripResponse, status_code=201)
def create_trip(
    trip_data: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log a new driving trip with telemetry/aggregate metrics.
    Calculates eco score, emissions, updates user XP, streak, badges, and challenges.
    """
    trip = process_and_save_trip(trip_data, current_user, db, source="manual")
    return trip


@router.post("/upload", response_model=TripResponse, status_code=201)
async def upload_trip_csv(
    file: UploadFile = File(...),
    vehicle_type: str = Form("Petrol"),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a CSV file containing trip telemetry.
    Parses time-series speed/acceleration/idle data, calculates aggregates and logs the trip.
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .csv files are supported.")

    content = await file.read()
    telemetry_summary = CSVTelemetryParser.parse_telemetry_csv(content, vehicle_type=vehicle_type)
    if notes:
        telemetry_summary["notes"] = notes

    trip_create = TripCreate(**telemetry_summary)
    trip = process_and_save_trip(trip_create, current_user, db, source="csv")
    return trip


@router.get("", response_model=List[TripResponse])
def get_trips(
    vehicle_type: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve filterable driving trip history for current user.
    """
    query = db.query(Trip).filter(Trip.user_id == current_user.id)

    if vehicle_type:
        query = query.filter(Trip.vehicle_type == vehicle_type)
    if min_score is not None:
        query = query.filter(Trip.eco_score >= min_score)
    if max_score is not None:
        query = query.filter(Trip.eco_score <= max_score)

    trips = query.order_by(Trip.created_at.desc()).offset(offset).limit(limit).all()
    return trips


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip_detail(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get in-depth analysis for a specific trip.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip
