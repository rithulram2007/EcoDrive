import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, get_db, SessionLocal
from app.models import Trip
from app.seed import seed_database
from app.routers import dashboard, trips, analytics, gamification, insights, comparison

# Initialize database tables
Base.metadata.create_all(bind=engine)


# Seed database only if there are no trips
def initialize_demo_data():
    db = SessionLocal()
    try:
        trip_count = db.query(Trip).count()

        if trip_count == 0:
            print("No trips found. Seeding demo database...")
            seed_database()
            print("Demo database seeded successfully.")
        else:
            print(f"Database already contains {trip_count} trips. Skipping seed.")

    except Exception as e:
        print(f"Database initialization/seed error: {e}")
    finally:
        db.close()


# Run safe initialization
initialize_demo_data()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="EcoDrive API — Gamified eco-driving and carbon footprint coaching platform."
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health Check Endpoint
@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"

    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


# Mount Routers
app.include_router(dashboard.router)
app.include_router(trips.router)
app.include_router(analytics.router)
app.include_router(gamification.router)
app.include_router(insights.router)
app.include_router(comparison.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
