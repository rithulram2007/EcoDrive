import datetime
import random
from app.database import SessionLocal, engine, Base
from app.models import User, Trip, Badge, UserBadge, Challenge, UserChallenge
from app.services.co2_calculator import CO2Calculator
from app.services.scoring_engine import ScoringEngine
from app.services.gamification_engine import GamificationEngine
from app.services.challenge_engine import ChallengeEngine

def seed_database():
    print("Initializing EcoDrive database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding Badges...")
        badges_data = [
            {"code": "first_trip", "title": "First Journey", "description": "Logged your inaugural trip with EcoDrive", "category": "milestone", "icon": "Flag", "xp_reward": 50},
            {"code": "smooth_operator", "title": "Smooth Operator", "description": "Zero harsh acceleration or braking events recorded on a trip", "category": "smoothness", "icon": "Feather", "xp_reward": 100},
            {"code": "idle_crusher", "title": "Idle Crusher", "description": "Maintained stationary idling below 3% of trip duration", "category": "efficiency", "icon": "Clock", "xp_reward": 100},
            {"code": "fuel_saver", "title": "Energy Prodigy", "description": "Achieved an energy efficiency score of 90 or above", "category": "efficiency", "icon": "Zap", "xp_reward": 120},
            {"code": "low_carbon", "title": "Low Carbon Cruiser", "description": "Kept trip emissions below 1.0 kg CO2 on a qualifying journey", "category": "milestone", "icon": "Leaf", "xp_reward": 150},
            {"code": "streak_7", "title": "7-Day Eco Streak", "description": "Logged qualifying eco-driving journeys on 7 consecutive days", "category": "streak", "icon": "Flame", "xp_reward": 200},
            {"code": "eco_champion", "title": "Eco Champion", "description": "Attained Level 4 status with consistent high-efficiency driving", "category": "milestone", "icon": "Award", "xp_reward": 300},
        ]
        created_badges = {}
        for b in badges_data:
            badge_obj = Badge(**b)
            db.add(badge_obj)
            db.flush()
            created_badges[b["code"]] = badge_obj

        print("Seeding Challenges...")
        challenges_data = [
            {"code": "smooth_week", "title": "Smooth Operator Week", "description": "Complete 5 trips with an eco score above 80", "category": "weekly", "target_type": "trips_above_score", "target_value": 5, "reward_xp": 200, "icon": "Feather"},
            {"code": "idle_less", "title": "Idle Minimizer", "description": "Keep idle time below 5% across 3 distinct journeys", "category": "weekly", "target_type": "low_idle_trips", "target_value": 3, "reward_xp": 150, "icon": "Clock"},
            {"code": "carbon_cutter", "title": "Carbon Cutter", "description": "Complete 3 low-emission trips (< 1.5 kg CO2)", "category": "weekly", "target_type": "low_co2_trips", "target_value": 3, "reward_xp": 175, "icon": "Leaf"},
            {"code": "seven_day_streak", "title": "Consistency Master", "description": "Log qualifying trips on 7 consecutive calendar days", "category": "milestone", "target_type": "streak_days", "target_value": 7, "reward_xp": 250, "icon": "Flame"},
            {"code": "century_eco", "title": "Century Eco Driver", "description": "Accumulate 100 km of driving with average score >= 75", "category": "milestone", "target_type": "total_km", "target_value": 100, "reward_xp": 300, "icon": "Compass"},
        ]
        created_challenges = {}
        for c in challenges_data:
            chal_obj = Challenge(**c)
            db.add(chal_obj)
            db.flush()
            created_challenges[c["code"]] = chal_obj

        print("Seeding Primary User: Alex Rivera...")
        primary_user = User(
            name="Alex Rivera",
            email="alex.rivera@ecodrive.io",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            current_xp=1480,
            level=3,
            level_title="Green Driver",
            current_streak=6,
            best_streak=9,
            total_co2_saved_kg=48.6,
            is_demo=False
        )
        db.add(primary_user)
        db.flush()

        # Link challenges to Alex
        for chal in created_challenges.values():
            db.add(UserChallenge(
                user_id=primary_user.id,
                challenge_id=chal.id,
                current_progress=0.0,
                target_value=chal.target_value,
                is_completed=False
            ))
        db.flush()

        # Pre-award a few earned badges for Alex
        for bcode in ["first_trip", "smooth_operator", "idle_crusher"]:
            db.add(UserBadge(user_id=primary_user.id, badge_id=created_badges[bcode].id))

        print("Seeding 26 Realistic Varied Trips for Alex Rivera...")
        now = datetime.datetime.utcnow()

        # 26 realistic trips spanning 26 days to create a strong 6-day streak up to yesterday/today
        trip_specs = [
            # Day -25
            {"days_ago": 25, "vehicle": "Petrol", "dist": 14.5, "dur": 24.0, "avg_spd": 36.2, "max_spd": 68.0, "idle": 2.2, "h_accel": 1, "h_brake": 1, "fuel": 1.15, "energy": None, "note": "Suburban morning commute"},
            # Day -24
            {"days_ago": 24, "vehicle": "Petrol", "dist": 16.0, "dur": 28.0, "avg_spd": 34.3, "max_spd": 72.0, "idle": 3.1, "h_accel": 2, "h_brake": 2, "fuel": 1.35, "energy": None, "note": "Evening rush hour with signals"},
            # Day -23
            {"days_ago": 23, "vehicle": "Hybrid", "dist": 28.4, "dur": 38.0, "avg_spd": 44.8, "max_spd": 85.0, "idle": 1.8, "h_accel": 0, "h_brake": 0, "fuel": 1.10, "energy": None, "note": "Client site visit via ring road"},
            # Day -22
            {"days_ago": 22, "vehicle": "Hybrid", "dist": 8.2, "dur": 18.0, "avg_spd": 27.3, "max_spd": 55.0, "idle": 2.5, "h_accel": 1, "h_brake": 0, "fuel": 0.38, "energy": None, "note": "Supermarket and errand run"},
            # Day -21
            {"days_ago": 21, "vehicle": "Petrol", "dist": 45.0, "dur": 42.0, "avg_spd": 64.3, "max_spd": 118.0, "idle": 1.2, "h_accel": 3, "h_brake": 1, "fuel": 3.60, "energy": None, "note": "Highway drive to neighboring tech hub"},
            # Day -20
            {"days_ago": 20, "vehicle": "EV", "dist": 22.0, "dur": 32.0, "avg_spd": 41.2, "max_spd": 75.0, "idle": 1.0, "h_accel": 0, "h_brake": 0, "fuel": None, "energy": 3.2, "note": "Borrowed company Tesla Model 3"},
            # Day -19
            {"days_ago": 19, "vehicle": "EV", "dist": 31.5, "dur": 45.0, "avg_spd": 42.0, "max_spd": 82.0, "idle": 1.4, "h_accel": 0, "h_brake": 1, "fuel": None, "energy": 4.8, "note": "Return commute with regenerative braking"},
            # Day -18
            {"days_ago": 18, "vehicle": "Petrol", "dist": 11.2, "dur": 30.0, "avg_spd": 22.4, "max_spd": 52.0, "idle": 5.8, "h_accel": 2, "h_brake": 3, "fuel": 1.12, "energy": None, "note": "Heavy downtown construction delay"},
            # Day -17
            {"days_ago": 17, "vehicle": "Petrol", "dist": 15.0, "dur": 22.0, "avg_spd": 40.9, "max_spd": 70.0, "idle": 1.5, "h_accel": 0, "h_brake": 0, "fuel": 1.05, "energy": None, "note": "Smooth mid-day drive"},
            # Day -16
            {"days_ago": 16, "vehicle": "Petrol", "dist": 9.5, "dur": 16.0, "avg_spd": 35.6, "max_spd": 60.0, "idle": 0.8, "h_accel": 0, "h_brake": 1, "fuel": 0.70, "energy": None, "note": "Gym round trip"},
            # Day -15
            {"days_ago": 15, "vehicle": "Diesel", "dist": 62.0, "dur": 55.0, "avg_spd": 67.6, "max_spd": 105.0, "idle": 1.5, "h_accel": 1, "h_brake": 1, "fuel": 3.65, "energy": None, "note": "Weekend hiking trip in the hills"},
            # Day -14
            {"days_ago": 14, "vehicle": "Diesel", "dist": 58.0, "dur": 52.0, "avg_spd": 66.9, "max_spd": 100.0, "idle": 1.1, "h_accel": 0, "h_brake": 0, "fuel": 3.30, "energy": None, "note": "Return from hiking trip"},
            # Day -13
            {"days_ago": 13, "vehicle": "Petrol", "dist": 14.8, "dur": 25.0, "avg_spd": 35.5, "max_spd": 68.0, "idle": 2.0, "h_accel": 1, "h_brake": 0, "fuel": 1.10, "energy": None, "note": "Regular office commute"},
            # Day -12
            {"days_ago": 12, "vehicle": "Petrol", "dist": 15.2, "dur": 27.0, "avg_spd": 33.8, "max_spd": 65.0, "idle": 2.8, "h_accel": 1, "h_brake": 1, "fuel": 1.22, "energy": None, "note": "Rainy evening commute"},
            # Day -11
            {"days_ago": 11, "vehicle": "Hybrid", "dist": 19.4, "dur": 30.0, "avg_spd": 38.8, "max_spd": 74.0, "idle": 1.2, "h_accel": 0, "h_brake": 0, "fuel": 0.82, "energy": None, "note": "Smooth hybrid ride"},
            # Day -10
            {"days_ago": 10, "vehicle": "Hybrid", "dist": 7.5, "dur": 15.0, "avg_spd": 30.0, "max_spd": 50.0, "idle": 0.9, "h_accel": 0, "h_brake": 0, "fuel": 0.32, "energy": None, "note": "Short neighborhood drive"},
            # Day -9
            {"days_ago": 9, "vehicle": "Petrol", "dist": 38.0, "dur": 40.0, "avg_spd": 57.0, "max_spd": 98.0, "idle": 1.8, "h_accel": 1, "h_brake": 1, "fuel": 2.75, "energy": None, "note": "Interstate branch visit"},
            # Day -8
            {"days_ago": 8, "vehicle": "Petrol", "dist": 14.0, "dur": 23.0, "avg_spd": 36.5, "max_spd": 65.0, "idle": 1.6, "h_accel": 0, "h_brake": 0, "fuel": 1.02, "energy": None, "note": "Steady throttle office commute"},
            # Day -7
            {"days_ago": 7, "vehicle": "Petrol", "dist": 15.0, "dur": 26.0, "avg_spd": 34.6, "max_spd": 66.0, "idle": 2.2, "h_accel": 1, "h_brake": 1, "fuel": 1.15, "energy": None, "note": "Week start commute"},
            # Day -6 (Streak Day 1)
            {"days_ago": 6, "vehicle": "EV", "dist": 25.0, "dur": 35.0, "avg_spd": 42.8, "max_spd": 80.0, "idle": 1.0, "h_accel": 0, "h_brake": 0, "fuel": None, "energy": 3.75, "note": "Smooth electric drive"},
            # Day -5 (Streak Day 2)
            {"days_ago": 5, "vehicle": "EV", "dist": 27.5, "dur": 38.0, "avg_spd": 43.4, "max_spd": 78.0, "idle": 1.1, "h_accel": 0, "h_brake": 0, "fuel": None, "energy": 4.10, "note": "Efficient urban EV cruise"},
            # Day -4 (Streak Day 3)
            {"days_ago": 4, "vehicle": "Hybrid", "dist": 18.0, "dur": 26.0, "avg_spd": 41.5, "max_spd": 72.0, "idle": 1.0, "h_accel": 0, "h_brake": 0, "fuel": 0.74, "energy": None, "note": "Anticipating traffic stops perfectly"},
            # Day -3 (Streak Day 4)
            {"days_ago": 3, "vehicle": "Petrol", "dist": 15.5, "dur": 23.0, "avg_spd": 40.4, "max_spd": 68.0, "idle": 1.0, "h_accel": 0, "h_brake": 0, "fuel": 1.08, "energy": None, "note": "Zero harsh events commute"},
            # Day -2 (Streak Day 5)
            {"days_ago": 2, "vehicle": "Petrol", "dist": 21.0, "dur": 30.0, "avg_spd": 42.0, "max_spd": 75.0, "idle": 1.5, "h_accel": 1, "h_brake": 0, "fuel": 1.50, "energy": None, "note": "Suburban errand trip"},
            # Day -1 (Streak Day 6 - Yesterday)
            {"days_ago": 1, "vehicle": "Hybrid", "dist": 34.0, "dur": 44.0, "avg_spd": 46.3, "max_spd": 85.0, "idle": 1.8, "h_accel": 0, "h_brake": 0, "fuel": 1.45, "energy": None, "note": "Eco cruise along coastal highway"},
            # Today (Streak Day 7 - Morning)
            {"days_ago": 0, "vehicle": "Hybrid", "dist": 16.5, "dur": 22.0, "avg_spd": 45.0, "max_spd": 72.0, "idle": 0.9, "h_accel": 0, "h_brake": 0, "fuel": 0.68, "energy": None, "note": "Morning office arrival with optimal coasting"}
        ]

        for s in trip_specs:
            trip_time = now - datetime.timedelta(days=s["days_ago"], hours=random.randint(2, 6))
            co2_kg, resolved_fuel, resolved_energy = CO2Calculator.calculate_trip_emissions(
                s["vehicle"], s["dist"], s["fuel"], s["energy"]
            )
            score, s_smooth, s_speed, s_idle, s_eff, drop_reasons = ScoringEngine.calculate_scores(
                distance_km=s["dist"],
                duration_minutes=s["dur"],
                avg_speed_kmh=s["avg_spd"],
                max_speed_kmh=s["max_spd"],
                idle_minutes=s["idle"],
                harsh_accel_count=s["h_accel"],
                harsh_brake_count=s["h_brake"],
                vehicle_type=s["vehicle"],
                fuel_consumed_liters=resolved_fuel,
                energy_consumed_kwh=resolved_energy
            )

            trip_obj = Trip(
                user_id=primary_user.id,
                vehicle_type=s["vehicle"],
                distance_km=s["dist"],
                duration_minutes=s["dur"],
                avg_speed_kmh=s["avg_spd"],
                max_speed_kmh=s["max_spd"],
                idle_minutes=s["idle"],
                idle_ratio=round(s["idle"] / s["dur"], 3),
                harsh_accel_count=s["h_accel"],
                harsh_brake_count=s["h_brake"],
                fuel_consumed_liters=resolved_fuel,
                energy_consumed_kwh=resolved_energy,
                co2_emissions_kg=co2_kg,
                eco_score=score,
                score_smoothness=s_smooth,
                score_speed=s_speed,
                score_idle=s_idle,
                score_efficiency=s_eff,
                score_drop_reasons=drop_reasons,
                source="manual",
                notes=s["note"],
                created_at=trip_time
            )
            db.add(trip_obj)

        db.flush()

        # Update streak and challenge evaluations for Alex
        GamificationEngine.update_streak(primary_user, db)
        ChallengeEngine.evaluate_user_challenges(primary_user, db)

        print("Seeding Demo Leaderboard Competitors...")
        demo_competitors = [
            {"name": "Elena Rostova", "email": "elena.r@demo.ecodrive.io", "xp": 3150, "lvl": 5, "title": "Planet Saver", "streak": 14, "co2": 86.4, "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"},
            {"name": "Marcus Chen", "email": "marcus.c@demo.ecodrive.io", "xp": 2420, "lvl": 4, "title": "Eco Champion", "streak": 11, "co2": 64.2, "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"},
            {"name": "Sarah Jenkins", "email": "sarah.j@demo.ecodrive.io", "xp": 1890, "lvl": 4, "title": "Eco Champion", "streak": 8, "co2": 52.8, "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"},
            {"name": "David Okafor", "email": "david.o@demo.ecodrive.io", "xp": 980, "lvl": 3, "title": "Green Driver", "streak": 4, "co2": 28.5, "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"},
            {"name": "Priya Sharma", "email": "priya.s@demo.ecodrive.io", "xp": 750, "lvl": 2, "title": "Sprout", "streak": 3, "co2": 22.1, "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"},
            {"name": "Liam Vance", "email": "liam.v@demo.ecodrive.io", "xp": 520, "lvl": 2, "title": "Sprout", "streak": 2, "co2": 15.0, "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"},
            {"name": "Chloe Martin", "email": "chloe.m@demo.ecodrive.io", "xp": 210, "lvl": 1, "title": "Seedling", "streak": 1, "co2": 6.8, "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150"},
        ]

        for dc in demo_competitors:
            d_user = User(
                name=dc["name"],
                email=dc["email"],
                avatar_url=dc["avatar"],
                current_xp=dc["xp"],
                level=dc["lvl"],
                level_title=dc["title"],
                current_streak=dc["streak"],
                best_streak=dc["streak"] + 2,
                total_co2_saved_kg=dc["co2"],
                is_demo=True
            )
            db.add(d_user)
            db.flush()

            # Add 2 demo trips for demo users so their average score displays
            for i in range(2):
                db.add(Trip(
                    user_id=d_user.id,
                    vehicle_type="EV" if dc["xp"] > 2000 else "Hybrid",
                    distance_km=20.0 + (i * 10),
                    duration_minutes=25.0 + (i * 12),
                    avg_speed_kmh=45.0,
                    max_speed_kmh=75.0,
                    idle_minutes=1.2,
                    idle_ratio=0.04,
                    harsh_accel_count=0,
                    harsh_brake_count=0,
                    co2_emissions_kg=1.8,
                    eco_score=85.0 + random.randint(-5, 8),
                    score_smoothness=92.0,
                    score_speed=88.0,
                    score_idle=95.0,
                    score_efficiency=89.0,
                    score_drop_reasons=["Flawless eco-driving: Excellent throttle modulation, minimal idle, and ideal cruise speed."],
                    source="manual",
                    notes="Demonstration commute",
                    created_at=now - datetime.timedelta(days=i + 1)
                ))

        db.commit()
        print("Database successfully seeded with realistic trips, badges, challenges, and leaderboard!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
