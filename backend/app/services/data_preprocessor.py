"""
TransitPulse - Data Preprocessing & Validation Pipeline
Responsible for GTFS schedule ingestion, empirical observation validation,
overnight trip normalization, delay calculation, and rejected-record quarantine.
"""
import os
import re
import json
import zipfile
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, Optional, List
import pandas as pd
import numpy as np

from backend.app.core.config import settings

logger = logging.getLogger("transitpulse.preprocessor")

class DataPreprocessor:
    def __init__(
        self,
        gtfs_dir: Optional[str] = None,
        on_time_lower: float = settings.ON_TIME_LOWER_THRESHOLD_MIN,
        on_time_upper: float = settings.ON_TIME_UPPER_THRESHOLD_MIN,
        max_valid_delay: float = settings.MAX_VALID_DELAY_MIN
    ):
        self.gtfs_dir = gtfs_dir or settings.GTFS_DIR
        self.on_time_lower = on_time_lower
        self.on_time_upper = on_time_upper
        self.max_valid_delay = max_valid_delay
        
        # Valid registries loaded from GTFS
        self.valid_routes: Dict[str, Dict[str, Any]] = {}
        self.valid_stops: Dict[str, Dict[str, Any]] = {}
        self.valid_trips: Dict[str, Dict[str, Any]] = {}
        self.valid_stop_times: Dict[Tuple[str, str], str] = {} # (trip_id, stop_id) -> sched_arr_time
        
        self.load_gtfs_registries()

    def load_gtfs_registries(self) -> None:
        """Loads static GTFS tables into memory for strict foreign key & schedule validation."""
        routes_path = os.path.join(self.gtfs_dir, "routes.txt")
        stops_path = os.path.join(self.gtfs_dir, "stops.txt")
        trips_path = os.path.join(self.gtfs_dir, "trips.txt")
        stop_times_path = os.path.join(self.gtfs_dir, "stop_times.txt")
        
        if os.path.exists(routes_path):
            df_r = pd.read_csv(routes_path)
            for _, r in df_r.iterrows():
                self.valid_routes[str(r["route_id"])] = r.to_dict()
                
        if os.path.exists(stops_path):
            df_s = pd.read_csv(stops_path)
            for _, s in df_s.iterrows():
                self.valid_stops[str(s["stop_id"])] = s.to_dict()
                
        if os.path.exists(trips_path):
            df_t = pd.read_csv(trips_path)
            for _, t in df_t.iterrows():
                self.valid_trips[str(t["trip_id"])] = t.to_dict()
                
        if os.path.exists(stop_times_path):
            df_st = pd.read_csv(stop_times_path)
            for _, st in df_st.iterrows():
                self.valid_stop_times[(str(st["trip_id"]), str(st["stop_id"]))] = str(st["arrival_time"]).strip()

    @staticmethod
    def parse_gtfs_time_and_date(date_str: str, time_str: str) -> Optional[datetime]:
        """
        Parses GTFS date (YYYY-MM-DD or YYYYMMDD) and time (HH:MM:SS),
        correctly handling overnight transit trips where hours >= 24 (e.g., 25:15:00).
        """
        if not time_str or pd.isna(time_str) or not str(time_str).strip():
            return None
        time_str = str(time_str).strip()
        
        # Parse date
        date_str = str(date_str).strip()
        if "-" in date_str:
            base_date = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
        else:
            base_date = datetime.strptime(date_str[:8], "%Y%m%d").date()
            
        # Parse time components
        parts = time_str.split(":")
        if len(parts) < 2:
            return None
            
        try:
            h = int(parts[0])
            m = int(parts[1])
            s = int(parts[2]) if len(parts) > 2 else 0
        except ValueError:
            return None
            
        extra_days = h // 24
        normalized_h = h % 24
        
        target_date = base_date + timedelta(days=extra_days)
        return datetime(target_date.year, target_date.month, target_date.day, normalized_h, m, s)

    def determine_time_period(self, dt: datetime) -> str:
        """Categorizes observation timestamp into configured diurnal periods."""
        h = dt.hour
        if 6 <= h < 11:
            return "MORNING"
        elif 11 <= h < 16:
            return "AFTERNOON"
        elif 16 <= h < 21:
            return "EVENING"
        else:
            return "NIGHT"

    def determine_delay_status(self, delay_minutes: float) -> str:
        """Categorizes delay in minutes against configurable thresholds."""
        if delay_minutes < self.on_time_lower:
            return "EARLY"
        elif delay_minutes <= self.on_time_upper:
            return "ON_TIME"
        else:
            return "DELAYED"

    def process_observations_dataframe(self, df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
        """
        Executes strict validation and delay computation across an observations DataFrame.
        Returns:
            - valid_df: Cleaned, augmented observations
            - rejected_df: Filtered records with explicit rejection reasons
            - quality_metrics: Summary metrics dictionary
        """
        required_cols = [
            "observation_id", "trip_id", "route_id", "stop_id",
            "scheduled_arrival_time", "actual_arrival_time", "observation_date"
        ]
        
        missing_schema_cols = [c for c in required_cols if c not in df_raw.columns]
        if missing_schema_cols:
            raise ValueError(f"Input data missing mandatory columns: {missing_schema_cols}")

        valid_records = []
        rejected_records = []
        seen_keys = set()
        
        total_raw = len(df_raw)
        
        for idx, row in df_raw.iterrows():
            obs_id = str(row.get("observation_id", f"OBS_RAW_{idx}"))
            trip_id = str(row.get("trip_id", "")).strip()
            route_id = str(row.get("route_id", "")).strip()
            stop_id = str(row.get("stop_id", "")).strip()
            sched_time_str = str(row.get("scheduled_arrival_time", "")).strip()
            actual_time_str = str(row.get("actual_arrival_time", "")).strip()
            date_str = str(row.get("observation_date", "")).strip()
            vehicle_id = str(row.get("vehicle_id", "UNSPECIFIED")).strip()
            source = str(row.get("observation_source", "UNKNOWN")).strip()
            weather = str(row.get("weather_condition", "NORMAL")).strip()
            
            # Base record for rejection logging
            raw_record_dict = row.to_dict()
            
            # 1. Missing Actual Arrival Check
            if not actual_time_str or actual_time_str.lower() in ["nan", "null", "none", ""]:
                raw_record_dict["rejection_reason"] = "MISSING_ACTUAL_TIME"
                raw_record_dict["rejection_details"] = "Actual arrival timestamp is absent; delay cannot be calculated."
                rejected_records.append(raw_record_dict)
                continue
                
            # 2. Missing Scheduled Arrival Check
            if not sched_time_str or sched_time_str.lower() in ["nan", "null", "none", ""]:
                raw_record_dict["rejection_reason"] = "MISSING_SCHEDULED_TIME"
                raw_record_dict["rejection_details"] = "Scheduled arrival time is missing in input observation."
                rejected_records.append(raw_record_dict)
                continue
                
            # 3. Foreign Key Validation - Route ID
            if self.valid_routes and route_id not in self.valid_routes:
                raw_record_dict["rejection_reason"] = "INVALID_ROUTE_ID"
                raw_record_dict["rejection_details"] = f"Route ID '{route_id}' does not exist in GTFS routes.txt."
                rejected_records.append(raw_record_dict)
                continue

            # 4. Foreign Key Validation - Stop ID
            if self.valid_stops and stop_id not in self.valid_stops:
                raw_record_dict["rejection_reason"] = "INVALID_STOP_ID"
                raw_record_dict["rejection_details"] = f"Stop ID '{stop_id}' does not exist in GTFS stops.txt."
                rejected_records.append(raw_record_dict)
                continue

            # 5. Foreign Key Validation - Trip ID
            if self.valid_trips and trip_id not in self.valid_trips:
                raw_record_dict["rejection_reason"] = "INVALID_TRIP_ID"
                raw_record_dict["rejection_details"] = f"Trip ID '{trip_id}' does not exist in GTFS trips.txt."
                rejected_records.append(raw_record_dict)
                continue

            # 6. Schedule Alignment Validation (Trip & Stop pair)
            if self.valid_stop_times and (trip_id, stop_id) not in self.valid_stop_times:
                raw_record_dict["rejection_reason"] = "SCHEDULE_MISMATCH"
                raw_record_dict["rejection_details"] = f"Stop '{stop_id}' is not a scheduled stop along trip '{trip_id}'."
                rejected_records.append(raw_record_dict)
                continue

            # 7. Duplicate Observation Detection
            dedup_key = (trip_id, stop_id, date_str)
            if dedup_key in seen_keys:
                raw_record_dict["rejection_reason"] = "DUPLICATE_OBSERVATION"
                raw_record_dict["rejection_details"] = f"Duplicate observation detected for trip {trip_id} at stop {stop_id} on {date_str}."
                rejected_records.append(raw_record_dict)
                continue
            seen_keys.add(dedup_key)

            # 8. Timestamp Parsing & Overnight Calculation
            sched_dt = self.parse_gtfs_time_and_date(date_str, sched_time_str)
            actual_dt = self.parse_gtfs_time_and_date(date_str, actual_time_str)
            
            if not sched_dt or not actual_dt:
                raw_record_dict["rejection_reason"] = "INVALID_TIMESTAMP_FORMAT"
                raw_record_dict["rejection_details"] = "Timestamp could not be parsed into valid date/time components."
                rejected_records.append(raw_record_dict)
                continue
                
            # Handle overnight trip crossing midnight between scheduled and actual
            time_diff_sec = (actual_dt - sched_dt).total_seconds()
            # If actual is 23:55 and scheduled is 00:05 next day, diff might be negative by ~24h
            if time_diff_sec < -43200: # -12 hours
                time_diff_sec += 86400
            elif time_diff_sec > 43200: # +12 hours
                time_diff_sec -= 86400

            delay_minutes = round(time_diff_sec / 60.0, 2)
            
            # 9. Extreme Anomaly Filter
            if abs(delay_minutes) > self.max_valid_delay:
                raw_record_dict["rejection_reason"] = "EXTREME_DELAY_ANOMALY"
                raw_record_dict["rejection_details"] = f"Computed delay of {delay_minutes} min exceeds threshold of {self.max_valid_delay} min."
                rejected_records.append(raw_record_dict)
                continue

            # Derived analytical attributes
            delay_status = self.determine_delay_status(delay_minutes)
            time_period = self.determine_time_period(sched_dt)
            day_of_week = sched_dt.strftime("%A")
            is_weekend = sched_dt.weekday() >= 5
            
            # Route and Stop Name enrichment
            route_name = self.valid_routes[route_id].get("route_short_name", route_id) if route_id in self.valid_routes else route_id
            route_long_name = self.valid_routes[route_id].get("route_long_name", "") if route_id in self.valid_routes else ""
            stop_name = self.valid_stops[stop_id].get("stop_name", stop_id) if stop_id in self.valid_stops else stop_id
            stop_lat = self.valid_stops[stop_id].get("stop_lat", None) if stop_id in self.valid_stops else None
            stop_lon = self.valid_stops[stop_id].get("stop_lon", None) if stop_id in self.valid_stops else None

            valid_records.append({
                "observation_id": obs_id,
                "trip_id": trip_id,
                "route_id": route_id,
                "route_short_name": route_name,
                "route_long_name": route_long_name,
                "stop_id": stop_id,
                "stop_name": stop_name,
                "stop_lat": stop_lat,
                "stop_lon": stop_lon,
                "observation_date": date_str,
                "scheduled_arrival_time": sched_time_str,
                "actual_arrival_time": actual_time_str,
                "scheduled_datetime": sched_dt.isoformat(),
                "actual_datetime": actual_dt.isoformat(),
                "delay_minutes": delay_minutes,
                "delay_status": delay_status,
                "time_period": time_period,
                "day_of_week": day_of_week,
                "is_weekend": is_weekend,
                "vehicle_id": vehicle_id,
                "observation_source": source,
                "weather_condition": weather
            })

        valid_df = pd.DataFrame(valid_records)
        rejected_df = pd.DataFrame(rejected_records)
        
        # Generate quality summary
        rejection_breakdown = {}
        if not rejected_df.empty and "rejection_reason" in rejected_df.columns:
            rejection_breakdown = rejected_df["rejection_reason"].value_counts().to_dict()

        quality_metrics = {
            "total_raw_observations": total_raw,
            "valid_observations_count": len(valid_df),
            "rejected_observations_count": len(rejected_df),
            "validity_percentage": round((len(valid_df) / total_raw * 100), 2) if total_raw > 0 else 0.0,
            "rejection_percentage": round((len(rejected_df) / total_raw * 100), 2) if total_raw > 0 else 0.0,
            "rejection_breakdown": rejection_breakdown,
            "date_range": {
                "start": str(valid_df["observation_date"].min()) if not valid_df.empty else None,
                "end": str(valid_df["observation_date"].max()) if not valid_df.empty else None
            },
            "monitored_routes_count": int(valid_df["route_id"].nunique()) if not valid_df.empty else 0,
            "monitored_stops_count": int(valid_df["stop_id"].nunique()) if not valid_df.empty else 0,
            "on_time_performance_baseline": {
                "on_time_pct": round(float((valid_df["delay_status"] == "ON_TIME").mean() * 100), 2) if not valid_df.empty else 0.0,
                "delayed_pct": round(float((valid_df["delay_status"] == "DELAYED").mean() * 100), 2) if not valid_df.empty else 0.0,
                "early_pct": round(float((valid_df["delay_status"] == "EARLY").mean() * 100), 2) if not valid_df.empty else 0.0,
                "average_delay_minutes": round(float(valid_df["delay_minutes"].mean()), 2) if not valid_df.empty else 0.0,
                "median_delay_minutes": round(float(valid_df["delay_minutes"].median()), 2) if not valid_df.empty else 0.0
            }
        }
        
        return valid_df, rejected_df, quality_metrics

    def run_pipeline(
        self,
        raw_obs_path: Optional[str] = None,
        output_valid_path: Optional[str] = None,
        output_rejected_path: Optional[str] = None,
        output_report_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """Runs the complete ingestion, validation, and serialization pipeline."""
        raw_obs_path = raw_obs_path or os.path.join(settings.RAW_DIR, "observations", "actual_arrival_observations.csv")
        output_valid_path = output_valid_path or os.path.join(settings.PROCESSED_DIR, "valid_observations.csv")
        output_rejected_path = output_rejected_path or os.path.join(settings.REJECTED_DIR, "rejected_observations.csv")
        output_report_path = output_report_path or os.path.join(settings.PROCESSED_DIR, "data_quality_report.json")
        
        logger.info(f"Loading raw observations from {raw_obs_path}...")
        df_raw = pd.read_csv(raw_obs_path)
        
        valid_df, rejected_df, quality_metrics = self.process_observations_dataframe(df_raw)
        
        # Save processed outputs
        os.makedirs(os.path.dirname(output_valid_path), exist_ok=True)
        os.makedirs(os.path.dirname(output_rejected_path), exist_ok=True)
        
        valid_df.to_csv(output_valid_path, index=False, encoding="utf-8")
        rejected_df.to_csv(output_rejected_path, index=False, encoding="utf-8")
        
        with open(output_report_path, "w", encoding="utf-8") as f:
            json.dump(quality_metrics, f, indent=2)
            
        logger.info(f"Pipeline completed: {quality_metrics['valid_observations_count']} valid, {quality_metrics['rejected_observations_count']} rejected.")
        return quality_metrics

    def process_gtfs_zip(self, zip_path: str, extract_dir: Optional[str] = None) -> Dict[str, Any]:
        """Extracts and verifies an uploaded GTFS ZIP archive."""
        extract_dir = extract_dir or settings.GTFS_DIR
        os.makedirs(extract_dir, exist_ok=True)
        
        extracted_files = []
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(extract_dir)
            extracted_files = z.namelist()
            
        # Re-load registries
        self.load_gtfs_registries()
        
        return {
            "status": "SUCCESS",
            "extracted_files": extracted_files,
            "routes_count": len(self.valid_routes),
            "stops_count": len(self.valid_stops),
            "trips_count": len(self.valid_trips)
        }

    def process_uploaded_file(self, file_path: str) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
        """Parses CSV or Excel uploaded file and processes observations."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext in [".xlsx", ".xls"]:
            df_raw = pd.read_excel(file_path)
        else:
            df_raw = pd.read_csv(file_path)
        return self.process_observations_dataframe(df_raw)
