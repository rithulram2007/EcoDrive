import datetime
from sqlalchemy.orm import Session
from app.models import User, Trip, Badge, UserBadge

LEVELS = [
    (1, "Seedling", 0, 300),
    (2, "Sprout", 300, 800),
    (3, "Green Driver", 800, 1600),
    (4, "Eco Champion", 1600, 2800),
]

class GamificationEngine:
    """
    Gamification Engine managing XP, driver levels, daily streaks, and badge evaluation.
    """

    @classmethod
    def calculate_trip_xp(cls, trip: Trip) -> int:
        base_xp = 50
        # Score bonus: drivers scoring above 50 get 2 XP per extra point
        score_bonus = max(0, int((trip.eco_score - 50.0) * 2))
        # Distance bonus (up to 30 XP)
        distance_bonus = min(30, int(trip.distance_km * 1.5))
        # Smoothness bonus (zero harsh events)
        smooth_bonus = 25 if (trip.harsh_accel_count == 0 and trip.harsh_brake_count == 0) else 0

        total_xp = base_xp + score_bonus + distance_bonus + smooth_bonus
        return total_xp

    @classmethod
    def get_level_info(cls, current_xp: int) -> dict:
        for lvl, title, min_xp, next_xp in LEVELS:
            if current_xp < next_xp:
                range_span = next_xp - min_xp
                progress_in_lvl = current_xp - min_xp
                percent = round(min(100.0, (progress_in_lvl / range_span) * 100.0), 1)
                return {
                    "level": lvl,
                    "level_title": title,
                    "next_level_xp": next_xp,
                    "progress_percentage": percent
                }
        # Max Level (Planet Saver: 2800+ XP milestone)
        return {
            "level": 5,
            "level_title": "Planet Saver",
            "next_level_xp": 2800,
            "progress_percentage": 100.0
        }

    @classmethod
    def update_streak(cls, user: User, db: Session) -> int:
        """
        Calculates user streak based on consecutive calendar days with qualifying trips (eco_score >= 65).
        """
        trips = (
            db.query(Trip)
            .filter(Trip.user_id == user.id, Trip.eco_score >= 65)
            .order_by(Trip.created_at.desc())
            .all()
        )
        if not trips:
            user.current_streak = 0
            return 0

        # Unique active days sorted descending
        trip_dates = sorted(list({t.created_at.date() for t in trips}), reverse=True)
        today = datetime.datetime.utcnow().date()
        yesterday = today - datetime.timedelta(days=1)

        if trip_dates[0] < yesterday:
            # Streak broken
            user.current_streak = 1 if trip_dates[0] == today else 0
            return user.current_streak

        # Count consecutive days
        streak = 1
        for i in range(len(trip_dates) - 1):
            if (trip_dates[i] - trip_dates[i + 1]).days == 1:
                streak += 1
            else:
                break

        user.current_streak = streak
        if streak > (user.best_streak or 0):
            user.best_streak = streak

        return streak

    @classmethod
    def evaluate_badges(cls, user: User, latest_trip: Trip, db: Session) -> list:
        """
        Evaluates criteria and awards new badges to user.
        Returns list of newly awarded badges.
        """
        existing_badge_ids = {
            ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user.id).all()
        }
        all_badges = db.query(Badge).all()
        badge_map = {b.code: b for b in all_badges}

        newly_awarded = []
        user_trips_count = db.query(Trip).filter(Trip.user_id == user.id).count()

        def award(code: str):
            badge = badge_map.get(code)
            if badge and badge.id not in existing_badge_ids:
                user_badge = UserBadge(user_id=user.id, badge_id=badge.id)
                db.add(user_badge)
                existing_badge_ids.add(badge.id)
                user.current_xp += badge.xp_reward
                newly_awarded.append(badge)

        # 1. First Trip
        if user_trips_count >= 1:
            award("first_trip")

        # 2. Smooth Operator: 0 harsh events on a trip >= 5 km
        if latest_trip.distance_km >= 5.0 and latest_trip.harsh_accel_count == 0 and latest_trip.harsh_brake_count == 0:
            award("smooth_operator")

        # 3. Idle Crusher: idle ratio < 3% for a trip >= 10 mins
        if latest_trip.duration_minutes >= 10.0 and latest_trip.idle_ratio < 0.03:
            award("idle_crusher")

        # 4. Fuel Saver: efficiency score >= 90
        if latest_trip.score_efficiency >= 90.0:
            award("fuel_saver")

        # 5. Low Carbon: emissions < 1.0 kg on trip >= 5km
        if latest_trip.distance_km >= 5.0 and latest_trip.co2_emissions_kg < 1.0:
            award("low_carbon")

        # 6. 7-Day Streak
        if (user.current_streak or 0) >= 7:
            award("streak_7")

        # 7. Eco Champion: Level 4 or >= 20 trips with high score
        if user.level >= 4 or (user_trips_count >= 15 and user.current_xp >= 1600):
            award("eco_champion")

        # Update level information if XP changed
        level_info = cls.get_level_info(user.current_xp)
        user.level = level_info["level"]
        user.level_title = level_info["level_title"]

        return newly_awarded
