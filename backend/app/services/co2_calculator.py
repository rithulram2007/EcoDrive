from app.config import settings
from typing import Optional, Tuple

class CO2Calculator:
    """
    CO2 Emissions Calculator using transparent, documented emission factors:
    - Petrol: 2.31 kg CO2 / liter (EPA/DEFRA benchmark)
    - Diesel: 2.68 kg CO2 / liter (EPA/DEFRA benchmark)
    - Hybrid: 1.42 kg CO2 / liter (effective blended combustion + regenerative electric assist)
    - EV: 0.385 kg CO2 / kWh (national average electricity grid emission intensity)
    """

    @classmethod
    def calculate_trip_emissions(
        cls,
        vehicle_type: str,
        distance_km: float,
        fuel_consumed_liters: Optional[float] = None,
        energy_consumed_kwh: Optional[float] = None
    ) -> Tuple[float, float, float]:
        """
        Returns:
            (co2_kg, resolved_fuel_liters, resolved_energy_kwh)
        """
        v_type = vehicle_type.strip().capitalize() if vehicle_type.lower() != "ev" else "EV"
        co2_kg = 0.0
        resolved_fuel = fuel_consumed_liters
        resolved_energy = energy_consumed_kwh

        if v_type == "Petrol":
            if resolved_fuel is None or resolved_fuel <= 0:
                # Estimate from baseline 7.5 L / 100km
                resolved_fuel = round((distance_km / 100.0) * settings.BASELINE_PETROL_L_PER_100KM, 2)
            co2_kg = resolved_fuel * settings.EMISSION_FACTOR_PETROL_KG_PER_LITER

        elif v_type == "Diesel":
            if resolved_fuel is None or resolved_fuel <= 0:
                resolved_fuel = round((distance_km / 100.0) * settings.BASELINE_DIESEL_L_PER_100KM, 2)
            co2_kg = resolved_fuel * settings.EMISSION_FACTOR_DIESEL_KG_PER_LITER

        elif v_type == "Hybrid":
            if resolved_fuel is None or resolved_fuel <= 0:
                resolved_fuel = round((distance_km / 100.0) * settings.BASELINE_HYBRID_L_PER_100KM, 2)
            co2_kg = resolved_fuel * settings.EMISSION_FACTOR_HYBRID_KG_PER_LITER

        elif v_type == "EV":
            if resolved_energy is None or resolved_energy <= 0:
                # Estimate from baseline 16.0 kWh / 100km
                resolved_energy = round((distance_km / 100.0) * settings.BASELINE_EV_KWH_PER_100KM, 2)
            co2_kg = resolved_energy * settings.EMISSION_FACTOR_EV_KG_PER_KWH

        return round(co2_kg, 2), resolved_fuel, resolved_energy

    @classmethod
    def calculate_co2_savings_vs_benchmark(
        cls,
        actual_co2_kg: float,
        distance_km: float
    ) -> float:
        """
        Compares actual trip CO2 against an unoptimized typical ICE petrol benchmark (8.5 L/100km).
        Returns positive kg CO2 saved, or 0 if actual emitted more.
        """
        benchmark_liters = (distance_km / 100.0) * 8.5
        benchmark_co2 = benchmark_liters * settings.EMISSION_FACTOR_PETROL_KG_PER_LITER
        savings = benchmark_co2 - actual_co2_kg
        return round(max(0.0, savings), 2)

    @classmethod
    def compare_vehicle_modes(cls, distance_km: float) -> dict:
        """
        Produces side-by-side comparison across all vehicle powertrains for a given distance.
        """
        petrol_liters = (distance_km / 100.0) * settings.BASELINE_PETROL_L_PER_100KM
        diesel_liters = (distance_km / 100.0) * settings.BASELINE_DIESEL_L_PER_100KM
        hybrid_liters = (distance_km / 100.0) * settings.BASELINE_HYBRID_L_PER_100KM
        ev_kwh = (distance_km / 100.0) * settings.BASELINE_EV_KWH_PER_100KM

        petrol_co2 = petrol_liters * settings.EMISSION_FACTOR_PETROL_KG_PER_LITER
        diesel_co2 = diesel_liters * settings.EMISSION_FACTOR_DIESEL_KG_PER_LITER
        hybrid_co2 = hybrid_liters * settings.EMISSION_FACTOR_HYBRID_KG_PER_LITER
        ev_co2 = ev_kwh * settings.EMISSION_FACTOR_EV_KG_PER_KWH

        petrol_cost = petrol_liters * settings.COST_PETROL_PER_LITER
        ev_cost = ev_kwh * settings.COST_ELECTRICITY_PER_KWH

        co2_savings = petrol_co2 - ev_co2
        reduction_pct = (co2_savings / petrol_co2 * 100.0) if petrol_co2 > 0 else 0.0
        cost_savings = petrol_cost - ev_cost

        return {
            "distance_km": distance_km,
            "ice_petrol_co2_kg": round(petrol_co2, 2),
            "ice_diesel_co2_kg": round(diesel_co2, 2),
            "hybrid_co2_kg": round(hybrid_co2, 2),
            "ev_co2_kg": round(ev_co2, 2),
            "co2_savings_kg": round(co2_savings, 2),
            "co2_reduction_percentage": round(reduction_pct, 1),
            "ice_cost_usd": round(petrol_cost, 2),
            "ev_cost_usd": round(ev_cost, 2),
            "cost_savings_usd": round(cost_savings, 2),
            "assumptions": {
                "petrol_baseline": f"{settings.BASELINE_PETROL_L_PER_100KM} L/100km @ ${settings.COST_PETROL_PER_LITER}/L",
                "diesel_baseline": f"{settings.BASELINE_DIESEL_L_PER_100KM} L/100km @ ${settings.COST_DIESEL_PER_LITER}/L",
                "ev_baseline": f"{settings.BASELINE_EV_KWH_PER_100KM} kWh/100km @ ${settings.COST_ELECTRICITY_PER_KWH}/kWh",
                "grid_carbon_intensity": f"{settings.EMISSION_FACTOR_EV_KG_PER_KWH} kg CO2/kWh"
            }
        }
