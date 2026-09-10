import pytest
from app.services.co2_calculator import CO2Calculator
from app.config import settings

def test_petrol_co2_calculation():
    # 2.0 Liters of Petrol -> 2.0 * 2.31 = 4.62 kg CO2
    co2, fuel, energy = CO2Calculator.calculate_trip_emissions(
        vehicle_type="Petrol",
        distance_km=25.0,
        fuel_consumed_liters=2.0
    )
    assert co2 == 4.62
    assert fuel == 2.0
    assert energy is None

def test_ev_co2_calculation():
    # 4.0 kWh of EV energy -> 4.0 * 0.385 = 1.54 kg CO2
    co2, fuel, energy = CO2Calculator.calculate_trip_emissions(
        vehicle_type="EV",
        distance_km=25.0,
        energy_consumed_kwh=4.0
    )
    assert co2 == 1.54
    assert energy == 4.0
    assert fuel is None

def test_estimated_emissions_when_fuel_omitted():
    # 100 km Petrol should estimate from baseline 7.5 L -> 7.5 * 2.31 = 17.32 kg CO2
    co2, fuel, energy = CO2Calculator.calculate_trip_emissions(
        vehicle_type="Petrol",
        distance_km=100.0
    )
    assert fuel == 7.5
    assert co2 == round(7.5 * settings.EMISSION_FACTOR_PETROL_KG_PER_LITER, 2)

def test_powertrain_comparison():
    res = CO2Calculator.compare_vehicle_modes(distance_km=100.0)
    assert res["distance_km"] == 100.0
    # EV emissions should be significantly lower than Petrol
    assert res["ev_co2_kg"] < res["ice_petrol_co2_kg"]
    assert res["co2_savings_kg"] > 0
    assert res["cost_savings_usd"] > 0
