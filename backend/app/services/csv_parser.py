import io
import pandas as pd
from typing import Dict, Any, Tuple
from fastapi import HTTPException

class CSVTelemetryParser:
    """
    Parses and aggregates driving telemetry time-series CSV data.
    Expected/Flexible format:
    timestamp,speed,acceleration,idle_seconds,distance_km
    """

    @classmethod
    def parse_telemetry_csv(cls, file_bytes: bytes, vehicle_type: str = "Petrol") -> Dict[str, Any]:
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        try:
            # Read into pandas DataFrame
            df = pd.read_csv(io.BytesIO(file_bytes))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

        if df.empty:
            raise HTTPException(status_code=400, detail="CSV contains no data rows.")

        # Normalize column names: strip whitespace and lowercase
        df.columns = [str(c).strip().lower() for c in df.columns]

        # Column resolution with alias support
        speed_col = next((c for c in df.columns if "speed" in c), None)
        accel_col = next((c for c in df.columns if "accel" in c), None)
        idle_col = next((c for c in df.columns if "idle" in c), None)
        dist_col = next((c for c in df.columns if "dist" in c), None)
        time_col = next((c for c in df.columns if "time" in c or "date" in c), None)

        if not speed_col:
            raise HTTPException(status_code=400, detail="Missing required telemetry column: 'speed' (km/h)")

        # Convert numeric columns, coerce errors
        df[speed_col] = pd.to_numeric(df[speed_col], errors='coerce').fillna(0)
        
        # Clean speeds (negative speeds clamped to 0, unrealistic > 250 clamped)
        df[speed_col] = df[speed_col].clip(lower=0, upper=250)

        # Acceleration
        if accel_col:
            df[accel_col] = pd.to_numeric(df[accel_col], errors='coerce').fillna(0)
        else:
            # Estimate acceleration from speed delta if absent (assuming 1-sec intervals)
            df['accel_est'] = (df[speed_col].diff().fillna(0) * 1000.0 / 3600.0)
            accel_col = 'accel_est'

        # Idle seconds
        if idle_col:
            df[idle_col] = pd.to_numeric(df[idle_col], errors='coerce').fillna(0)
            df[idle_col] = df[idle_col].clip(lower=0)
        else:
            # Infer idle where speed < 1.5 km/h
            df['idle_est'] = (df[speed_col] < 1.5).astype(int)
            idle_col = 'idle_est'

        # Distance
        if dist_col:
            df[dist_col] = pd.to_numeric(df[dist_col], errors='coerce').fillna(0)
            df[dist_col] = df[dist_col].clip(lower=0)
            # Check if distance is cumulative or incremental
            if df[dist_col].is_monotonic_increasing and df[dist_col].max() > 0:
                total_distance_km = float(df[dist_col].max() - df[dist_col].min())
            else:
                total_distance_km = float(df[dist_col].sum())
        else:
            # Estimate distance from speed (assuming 1-second ticks if time not parsed)
            total_distance_km = float((df[speed_col] / 3600.0).sum())

        # If total distance computed is 0, give minimal fallback
        if total_distance_km <= 0.01:
            total_distance_km = max(0.1, round(float(df[speed_col].mean() * (len(df) / 3600.0)), 2))

        # Duration
        if time_col:
            try:
                times = pd.to_datetime(df[time_col])
                delta_sec = (times.iloc[-1] - times.iloc[0]).total_seconds()
                duration_minutes = max(1.0, round(delta_sec / 60.0, 1))
            except Exception:
                duration_minutes = max(1.0, round(len(df) / 60.0, 1))
        else:
            duration_minutes = max(1.0, round(len(df) / 60.0, 1))

        # Speeds
        avg_speed_kmh = round(float(df[speed_col].mean()), 1)
        max_speed_kmh = round(float(df[speed_col].max()), 1)
        if max_speed_kmh < avg_speed_kmh:
            max_speed_kmh = avg_speed_kmh

        # Idle minutes
        total_idle_seconds = float(df[idle_col].sum())
        idle_minutes = round(min(duration_minutes, total_idle_seconds / 60.0), 1)

        # Harsh events (accel > 2.5 m/s², brake < -2.8 m/s²)
        harsh_accel_count = int((df[accel_col] > 2.5).sum())
        harsh_brake_count = int((df[accel_col] < -2.8).sum())

        return {
            "vehicle_type": vehicle_type,
            "distance_km": round(total_distance_km, 2),
            "duration_minutes": duration_minutes,
            "avg_speed_kmh": avg_speed_kmh,
            "max_speed_kmh": max_speed_kmh,
            "idle_minutes": idle_minutes,
            "harsh_accel_count": harsh_accel_count,
            "harsh_brake_count": harsh_brake_count,
            "fuel_consumed_liters": None,
            "energy_consumed_kwh": None,
            "notes": f"Imported from CSV telemetry ({len(df)} data points)"
        }
