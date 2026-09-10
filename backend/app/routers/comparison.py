from fastapi import APIRouter, Query
from app.schemas import EvVsIceComparisonResponse
from app.services.co2_calculator import CO2Calculator

router = APIRouter(prefix="/api/compare", tags=["Comparison"])

@router.get("", response_model=EvVsIceComparisonResponse)
def compare_ev_ice(
    distance_km: float = Query(25.0, gt=0, le=5000, description="Trip or commute distance in kilometers")
):
    """
    Compare estimated CO2 emissions and fuel/electricity energy costs across Petrol, Diesel, Hybrid, and EV powertrains.
    """
    result = CO2Calculator.compare_vehicle_modes(distance_km)
    return EvVsIceComparisonResponse(**result)
