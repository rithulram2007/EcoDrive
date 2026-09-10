from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_get_dashboard():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "current_eco_score" in data
    assert "score_breakdown" in data
    assert "recent_trips" in data
    assert "weekly_trend" in data

def test_get_trips():
    response = client.get("/api/trips?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "eco_score" in data[0]

def test_create_manual_trip():
    payload = {
        "vehicle_type": "Hybrid",
        "distance_km": 18.5,
        "duration_minutes": 25.0,
        "avg_speed_kmh": 44.4,
        "max_speed_kmh": 72.0,
        "idle_minutes": 1.2,
        "harsh_accel_count": 0,
        "harsh_brake_count": 0,
        "fuel_consumed_liters": 0.75,
        "notes": "Test automated trip"
    }
    response = client.post("/api/trips", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["distance_km"] == 18.5
    assert data["eco_score"] >= 80.0
    assert "score_drop_reasons" in data

def test_upload_csv_trip():
    csv_content = """timestamp,speed,acceleration,idle_seconds,distance_km
2026-09-10T10:00:00,0.0,0.0,5,0.00
2026-09-10T10:01:00,35.0,1.2,0,0.58
2026-09-10T10:02:00,50.0,0.8,0,1.41
2026-09-10T10:03:00,55.0,0.2,0,2.32
2026-09-10T10:04:00,40.0,-0.8,0,3.00
2026-09-10T10:05:00,0.0,-1.2,10,3.00
"""
    files = {"file": ("test_run.csv", csv_content.encode("utf-8"), "text/csv")}
    response = client.post("/api/trips/upload", files=files, data={"vehicle_type": "Petrol"})
    assert response.status_code == 201
    data = response.json()
    assert data["distance_km"] > 0
    assert data["eco_score"] > 0

def test_get_challenges():
    response = client.get("/api/challenges")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    assert "progress_percentage" in data[0]

def test_get_leaderboard():
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    assert data[0]["rank"] == 1
    assert data[0]["current_xp"] >= data[1]["current_xp"]

def test_get_analytics():
    response = client.get("/api/analytics?days=30")
    assert response.status_code == 200
    data = response.json()
    assert "trips_trend" in data
    assert "metrics_comparison" in data
    assert "vehicle_breakdown" in data

def test_get_compare():
    response = client.get("/api/compare?distance_km=50")
    assert response.status_code == 200
    data = response.json()
    assert data["distance_km"] == 50
    assert data["ev_co2_kg"] < data["ice_petrol_co2_kg"]
