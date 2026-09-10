from typing import Dict, List, Tuple
from app.config import settings

class ScoringEngine:
    """
    Transparent Composite Eco-Driving Scoring Engine.
    Computes component scores (0-100) and provides human-intelligible deduction reasons.
    
    Weights:
    - Smoothness: 30%
    - Idle Efficiency: 25%
    - Speed Efficiency: 20%
    - Energy/Fuel Efficiency: 25%
    """

    @classmethod
    def calculate_scores(
        cls,
        distance_km: float,
        duration_minutes: float,
        avg_speed_kmh: float,
        max_speed_kmh: float,
        idle_minutes: float,
        harsh_accel_count: int,
        harsh_brake_count: int,
        vehicle_type: str,
        fuel_consumed_liters: float = None,
        energy_consumed_kwh: float = None
    ) -> Tuple[float, float, float, float, float, List[str]]:
        """
        Returns:
            (composite_score, smoothness_score, speed_score, idle_score, efficiency_score, drop_reasons)
        """
        drop_reasons: List[str] = []

        # 1. Smoothness Score (0 - 100)
        # Ideal: 0 harsh events. Every harsh event per 10km reduces smoothness.
        dist_factor = max(1.0, distance_km / 10.0)
        harsh_rate = (harsh_accel_count + harsh_brake_count) / dist_factor
        smoothness_score = max(20.0, 100.0 - (harsh_rate * 12.0))

        if harsh_accel_count > 0:
            drop_reasons.append(
                f"Lost {min(15, harsh_accel_count * 3)} pts: {harsh_accel_count} harsh acceleration event(s) recorded."
            )
        if harsh_brake_count > 0:
            drop_reasons.append(
                f"Lost {min(15, harsh_brake_count * 3)} pts: {harsh_brake_count} harsh braking event(s) recorded."
            )

        # 2. Idle Efficiency Score (0 - 100)
        # Normal traffic expects <= 5% idle (signals, crossings). Above 5%, idle drops score.
        idle_ratio = (idle_minutes / duration_minutes) if duration_minutes > 0 else 0.0
        if idle_ratio <= 0.05:
            idle_score = 100.0
        else:
            excess_idle = idle_ratio - 0.05
            idle_score = max(15.0, 100.0 - (excess_idle * 220.0))
            idle_pct = round(idle_ratio * 100.0, 1)
            pts_lost = round(100.0 - idle_score, 1)
            drop_reasons.append(
                f"Lost {pts_lost} pts: Idle time accounted for {idle_pct}% of the trip (target < 5%)."
            )

        # 3. Speed Efficiency Score (0 - 100)
        speed_score = 100.0
        # Aerodynamic drag penalty above 110 km/h (drag increases with velocity squared)
        if max_speed_kmh > 110.0:
            excess_speed = max_speed_kmh - 110.0
            drag_penalty = min(30.0, excess_speed * 1.5)
            speed_score -= drag_penalty
            drop_reasons.append(
                f"Lost {round(drag_penalty, 1)} pts: High speeds reached {round(max_speed_kmh, 1)} km/h (>110 km/h aero drag threshold)."
            )
        
        # Severe stop-and-go creeping penalty (very low average speed with moderate duration)
        if avg_speed_kmh < 18.0 and duration_minutes > 15.0:
            creep_penalty = min(20.0, (18.0 - avg_speed_kmh) * 1.8)
            speed_score -= creep_penalty
            drop_reasons.append(
                f"Lost {round(creep_penalty, 1)} pts: Congestion crawling pace ({round(avg_speed_kmh, 1)} km/h average speed)."
            )
        speed_score = max(25.0, min(100.0, speed_score))

        # 4. Energy / Fuel Efficiency Score (0 - 100)
        # Determine baseline for vehicle type
        v_type = vehicle_type.strip().capitalize() if vehicle_type.lower() != "ev" else "EV"
        if v_type == "Petrol":
            baseline_per_100km = settings.BASELINE_PETROL_L_PER_100KM
            actual_per_100km = (fuel_consumed_liters / distance_km * 100.0) if (fuel_consumed_liters and distance_km > 0) else baseline_per_100km
            unit = "L/100km"
        elif v_type == "Diesel":
            baseline_per_100km = settings.BASELINE_DIESEL_L_PER_100KM
            actual_per_100km = (fuel_consumed_liters / distance_km * 100.0) if (fuel_consumed_liters and distance_km > 0) else baseline_per_100km
            unit = "L/100km"
        elif v_type == "Hybrid":
            baseline_per_100km = settings.BASELINE_HYBRID_L_PER_100KM
            actual_per_100km = (fuel_consumed_liters / distance_km * 100.0) if (fuel_consumed_liters and distance_km > 0) else baseline_per_100km
            unit = "L/100km"
        else: # EV
            baseline_per_100km = settings.BASELINE_EV_KWH_PER_100KM
            actual_per_100km = (energy_consumed_kwh / distance_km * 100.0) if (energy_consumed_kwh and distance_km > 0) else baseline_per_100km
            unit = "kWh/100km"

        # Baseline gets ~80 pts. 15% better = 100 pts. 25% worse = 50 pts.
        ratio = actual_per_100km / baseline_per_100km
        if ratio <= 0.85:
            efficiency_score = 100.0
        elif ratio <= 1.0:
            efficiency_score = 80.0 + (1.0 - ratio) / 0.15 * 20.0
        else:
            efficiency_score = max(20.0, 80.0 - (ratio - 1.0) * 80.0)

        if ratio > 1.08:
            excess_pct = round((ratio - 1.0) * 100.0, 1)
            drop_reasons.append(
                f"Lost {round(80.0 - efficiency_score, 1)} pts: Consumption rate ({round(actual_per_100km, 1)} {unit}) was {excess_pct}% above class baseline ({baseline_per_100km} {unit})."
            )

        efficiency_score = max(20.0, min(100.0, efficiency_score))

        # Composite Weighted Score
        composite_score = (
            settings.WEIGHT_SMOOTHNESS * smoothness_score +
            settings.WEIGHT_IDLE * idle_score +
            settings.WEIGHT_SPEED * speed_score +
            settings.WEIGHT_EFFICIENCY * efficiency_score
        )
        composite_score = round(max(15.0, min(100.0, composite_score)), 1)

        if not drop_reasons:
            drop_reasons.append("Flawless eco-driving: Excellent throttle modulation, minimal idle, and ideal cruise speed.")

        return (
            composite_score,
            round(smoothness_score, 1),
            round(speed_score, 1),
            round(idle_score, 1),
            round(efficiency_score, 1),
            drop_reasons
        )

    @classmethod
    def get_score_rating(cls, score: float) -> str:
        if score >= 85.0:
            return "Excellent"
        elif score >= 70.0:
            return "Good"
        elif score >= 55.0:
            return "Fair"
        else:
            return "Needs Improvement"
