import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    avatar_url = Column(String(255), nullable=True)
    current_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    level_title = Column(String(50), default="Seedling")
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    total_co2_saved_kg = Column(Float, default=0.0)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan", order_by="desc(Trip.created_at)")
    user_badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    user_challenges = relationship("UserChallenge", back_populates="user", cascade="all, delete-orphan")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vehicle_type = Column(String(20), nullable=False) # Petrol, Diesel, Hybrid, EV
    distance_km = Column(Float, nullable=False)
    duration_minutes = Column(Float, nullable=False)
    avg_speed_kmh = Column(Float, nullable=False)
    max_speed_kmh = Column(Float, nullable=False)
    idle_minutes = Column(Float, default=0.0)
    idle_ratio = Column(Float, default=0.0) # idle_minutes / duration_minutes
    harsh_accel_count = Column(Integer, default=0)
    harsh_brake_count = Column(Integer, default=0)
    fuel_consumed_liters = Column(Float, nullable=True)
    energy_consumed_kwh = Column(Float, nullable=True)
    co2_emissions_kg = Column(Float, nullable=False)
    
    # Composite Eco Score and Components (0-100)
    eco_score = Column(Float, nullable=False)
    score_smoothness = Column(Float, nullable=False)
    score_speed = Column(Float, nullable=False)
    score_idle = Column(Float, nullable=False)
    score_efficiency = Column(Float, nullable=False)
    
    # Transparent score deduction explanations stored as list of strings
    score_drop_reasons = Column(JSON, default=list)
    source = Column(String(20), default="manual") # manual, csv
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="trips")


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    category = Column(String(50), default="general") # streak, smoothness, efficiency, milestone
    icon = Column(String(50), default="Award")
    xp_reward = Column(Integer, default=100)

    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False, index=True)
    awarded_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="user_badges")
    badge = relationship("Badge", back_populates="user_badges")


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(120), nullable=False)
    description = Column(String(255), nullable=False)
    category = Column(String(50), default="weekly")
    target_type = Column(String(50), nullable=False) # e.g. trips_above_score, low_idle_trips, streak_days, total_km
    target_value = Column(Float, nullable=False)
    reward_xp = Column(Integer, default=150)
    badge_code = Column(String(50), nullable=True)
    icon = Column(String(50), default="Target")

    user_challenges = relationship("UserChallenge", back_populates="challenge")


class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False, index=True)
    current_progress = Column(Float, default=0.0)
    target_value = Column(Float, nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="user_challenges")
    challenge = relationship("Challenge", back_populates="user_challenges")
