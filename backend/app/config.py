from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    APP_NAME: str = "EcoDrive API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database: Default SQLite for effortless local development, PostgreSQL compatible
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ecodrive.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    
    # Documented CO2 Emission Factors
    # Standard EPA/DEFRA benchmarks:
    # - Petrol: 2.31 kg CO2 per liter
    # - Diesel: 2.68 kg CO2 per liter
    # - Hybrid: Estimated blended factor ~1.42 kg CO2 per liter (ICE + regenerative electric assist)
    # - EV: 0.385 kg CO2 per kWh (Average grid emission intensity factor; configurable)
    EMISSION_FACTOR_PETROL_KG_PER_LITER: float = 2.31
    EMISSION_FACTOR_DIESEL_KG_PER_LITER: float = 2.68
    EMISSION_FACTOR_HYBRID_KG_PER_LITER: float = 1.42
    EMISSION_FACTOR_EV_KG_PER_KWH: float = 0.385
    
    # Average baseline fuel/energy efficiencies (L/100km or kWh/100km)
    BASELINE_PETROL_L_PER_100KM: float = 7.5
    BASELINE_DIESEL_L_PER_100KM: float = 6.2
    BASELINE_HYBRID_L_PER_100KM: float = 4.5
    BASELINE_EV_KWH_PER_100KM: float = 16.0
    
    # Energy cost estimates (USD per Liter / kWh for comparison features)
    COST_PETROL_PER_LITER: float = 1.35
    COST_DIESEL_PER_LITER: float = 1.45
    COST_ELECTRICITY_PER_KWH: float = 0.16
    
    # Eco Score Weighting (sum = 1.0)
    WEIGHT_SMOOTHNESS: float = 0.30
    WEIGHT_IDLE: float = 0.25
    WEIGHT_SPEED: float = 0.20
    WEIGHT_EFFICIENCY: float = 0.25

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
