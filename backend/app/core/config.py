"""
TransitPulse - Core Configuration & Settings
"""
import os
try:
    from pydantic_settings import BaseSettings
except ImportError:
    class BaseSettings:
        pass

class Settings:
    PROJECT_NAME: str = "TransitPulse"
    API_V1_STR: str = "/api"
    
    # Base directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATASETS_DIR: str = os.path.join(BASE_DIR, "datasets")
    RAW_DIR: str = os.path.join(DATASETS_DIR, "raw")
    PROCESSED_DIR: str = os.path.join(DATASETS_DIR, "processed")
    REJECTED_DIR: str = os.path.join(DATASETS_DIR, "rejected")
    TEMPLATES_DIR: str = os.path.join(DATASETS_DIR, "templates")
    GTFS_DIR: str = os.path.join(RAW_DIR, "gtfs")
    
    # Analytical Parameters (Configurable)
    ON_TIME_LOWER_THRESHOLD_MIN: float = -1.0  # arrivals up to 1 min early are on-time
    ON_TIME_UPPER_THRESHOLD_MIN: float = 5.0   # arrivals up to 5 min late are on-time
    MAX_VALID_DELAY_MIN: float = 180.0         # outliers > 3 hours rejected as telemetry error
    
    # Time Period Windows (Configurable 24-hr format)
    TIME_PERIODS = {
        "MORNING":   {"start": 6,  "end": 11, "label": "Morning (06:00 - 11:00)"},
        "AFTERNOON": {"start": 11, "end": 16, "label": "Afternoon (11:00 - 16:00)"},
        "EVENING":   {"start": 16, "end": 21, "label": "Evening (16:00 - 21:00)"},
        "NIGHT":     {"start": 21, "end": 6,  "label": "Night (21:00 - 06:00)"}
    }
    
    # Database URL (dual engine: PostgreSQL primary, SQLite fallback for dev)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'transitpulse_dev.db')}")

settings = Settings()
