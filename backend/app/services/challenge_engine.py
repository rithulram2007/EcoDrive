import datetime
from sqlalchemy.orm import Session
from app.models import User, Trip, Challenge, UserChallenge

class ChallengeEngine:
    """
    Evaluates and updates challenge progress from persisted trip history.
    """

    @classmethod
    def evaluate_user_challenges(cls, user: User, db: Session) -> list:
        user_challenges = db.query(UserChallenge).filter(UserChallenge.user_id == user.id).all()
        trips = db.query(Trip).filter(Trip.user_id == user.id).order_by(Trip.created_at.desc()).all()
        
        completed_challenges = []

        for uc in user_challenges:
            if uc.is_completed:
                continue

            challenge = uc.challenge
            code = challenge.code
            target = challenge.target_value
            progress = 0.0

            if code == "smooth_week":
                # Complete 5 trips with eco_score >= 80
                progress = len([t for t in trips if t.eco_score >= 80.0])

            elif code == "idle_less":
                # Keep idle time below 5% for 3 trips
                progress = len([t for t in trips if t.idle_ratio <= 0.05])

            elif code == "carbon_cutter":
                # 3 trips with CO2 < 1.5 kg
                progress = len([t for t in trips if t.co2_emissions_kg <= 1.5])

            elif code == "seven_day_streak":
                # 7 days streak
                progress = float(user.current_streak or 0)

            elif code == "century_eco":
                # 100 km driven with score >= 75
                qualifying_km = sum(t.distance_km for t in trips if t.eco_score >= 75.0)
                progress = round(qualifying_km, 1)

            else:
                progress = uc.current_progress

            uc.current_progress = min(target, progress)

            if uc.current_progress >= target and not uc.is_completed:
                uc.is_completed = True
                uc.completed_at = datetime.datetime.utcnow()
                user.current_xp += challenge.reward_xp
                completed_challenges.append(challenge)

        return completed_challenges
