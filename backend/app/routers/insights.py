from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import WeeklyInsightsResponse
from app.routers.trips import get_current_user
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/api/insights", tags=["Insights"])

@router.get("", response_model=WeeklyInsightsResponse)
def get_weekly_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate weekly executive performance report and personalized coaching tips based on persisted database trips.
    """
    return RecommendationEngine.generate_weekly_report(current_user.id, db)
