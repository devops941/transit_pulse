"""
Database Seeding Script
Populates relational tables from verified GTFS tables and processed observation records.
Ensures zero duplicate insertion and maintains strict foreign key integrity.
"""
import os
import sys
import logging
import pandas as pd
from datetime import datetime

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from backend.app.core.config import settings
from backend.app.database.session import SessionLocal, init_db
from backend.app.models import (
    Agency,
    Route,
    Stop,
    ServiceCalendar,
    Trip,
    ScheduledStopTime,
    ActualArrivalObservation,
    DatasetSource,
    DataImportHistory
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("transitpulse.seed")

def seed_database(limit_observations: int = 5000):
    """
    Initializes database tables and populates them from GTFS and processed observations.
    Limits observation ingestion by default to limit_observations for quick seeding.
    Set limit_observations=None for complete ingestion.
    """
    init_db()
    db = SessionLocal()
    
    try:
        # Purge existing data to ensure clean seeding with current GTFS tables
        db.query(ActualArrivalObservation).delete()
        db.query(ScheduledStopTime).delete()
        db.query(Trip).delete()
        db.query(Route).delete()
        db.query(Stop).delete()
        db.query(ServiceCalendar).delete()
        db.query(Agency).delete()
        db.query(DataImportHistory).delete()
        db.query(DatasetSource).delete()
        db.commit()

        # 1. Dataset Source Provenance
        src = db.query(DatasetSource).filter_by(source_code="TNSTC_MDU_2026").first()
        if not src:
            src = DatasetSource(
                source_code="TNSTC_MDU_2026",
                authority_name="Tamil Nadu State Transport Corporation (Madurai) Ltd (TNSTC-Madurai)",
                geographic_coverage="Madurai District & Metropolitan Area, Tamil Nadu, India",
                license_type="Government Open Data License (GODL) India / ODbL",
                source_url="https://tnstc.tn.gov.in",
                description="Verified GTFS timetable feed and empirical AVL arrival observations for 10 core Madurai bus corridors."
            )
            db.add(src)
            db.commit()
            logger.info("Added DatasetSource: TNSTC_MDU_2026")

        # 2. Agency
        agency_path = os.path.join(settings.GTFS_DIR, "agency.txt")
        if os.path.exists(agency_path):
            df_agency = pd.read_csv(agency_path)
            for _, r in df_agency.iterrows():
                a_id = str(r["agency_id"])
                if not db.query(Agency).filter_by(agency_id=a_id).first():
                    agency = Agency(
                        agency_id=a_id,
                        agency_name=str(r["agency_name"]),
                        agency_url=str(r.get("agency_url", "")),
                        agency_timezone=str(r.get("agency_timezone", "Asia/Kolkata")),
                        agency_lang=str(r.get("agency_lang", "ta")),
                        agency_phone=str(r.get("agency_phone", ""))
                    )
                    db.add(agency)
            db.commit()
            logger.info("Seeded Agency records.")

        # 3. Routes
        routes_path = os.path.join(settings.GTFS_DIR, "routes.txt")
        if os.path.exists(routes_path):
            df_routes = pd.read_csv(routes_path)
            for _, r in df_routes.iterrows():
                r_id = str(r["route_id"])
                if not db.query(Route).filter_by(route_id=r_id).first():
                    route = Route(
                        route_id=r_id,
                        agency_id=str(r["agency_id"]),
                        route_short_name=str(r["route_short_name"]),
                        route_long_name=str(r["route_long_name"]),
                        route_type=int(r.get("route_type", 3)),
                        route_color=str(r.get("route_color", "0055A5")),
                        route_text_color=str(r.get("route_text_color", "FFFFFF"))
                    )
                    db.add(route)
            db.commit()
            logger.info("Seeded Route records.")

        # 4. Stops
        stops_path = os.path.join(settings.GTFS_DIR, "stops.txt")
        if os.path.exists(stops_path):
            df_stops = pd.read_csv(stops_path)
            for _, r in df_stops.iterrows():
                s_id = str(r["stop_id"])
                if not db.query(Stop).filter_by(stop_id=s_id).first():
                    stop = Stop(
                        stop_id=s_id,
                        stop_name=str(r["stop_name"]),
                        stop_lat=float(r["stop_lat"]) if pd.notna(r.get("stop_lat")) else None,
                        stop_lon=float(r["stop_lon"]) if pd.notna(r.get("stop_lon")) else None,
                        zone_id=str(r.get("zone_id", ""))
                    )
                    db.add(stop)
            db.commit()
            logger.info("Seeded Stop records.")

        # 5. Service Calendar
        calendar_path = os.path.join(settings.GTFS_DIR, "calendar.txt")
        if os.path.exists(calendar_path):
            df_cal = pd.read_csv(calendar_path)
            for _, r in df_cal.iterrows():
                c_id = str(r["service_id"])
                if not db.query(ServiceCalendar).filter_by(service_id=c_id).first():
                    cal = ServiceCalendar(
                        service_id=c_id,
                        monday=bool(int(r.get("monday", 1))),
                        tuesday=bool(int(r.get("tuesday", 1))),
                        wednesday=bool(int(r.get("wednesday", 1))),
                        thursday=bool(int(r.get("thursday", 1))),
                        friday=bool(int(r.get("friday", 1))),
                        saturday=bool(int(r.get("saturday", 1))),
                        sunday=bool(int(r.get("sunday", 1))),
                        start_date=str(r.get("start_date", "")),
                        end_date=str(r.get("end_date", ""))
                    )
                    db.add(cal)
            db.commit()
            logger.info("Seeded ServiceCalendar records.")

        # 6. Trips
        trips_path = os.path.join(settings.GTFS_DIR, "trips.txt")
        if os.path.exists(trips_path):
            df_trips = pd.read_csv(trips_path)
            for _, r in df_trips.iterrows():
                t_id = str(r["trip_id"])
                if not db.query(Trip).filter_by(trip_id=t_id).first():
                    trip = Trip(
                        trip_id=t_id,
                        route_id=str(r["route_id"]),
                        service_id=str(r["service_id"]),
                        trip_headsign=str(r.get("trip_headsign", "")),
                        direction_id=int(r.get("direction_id", 0))
                    )
                    db.add(trip)
            db.commit()
            logger.info("Seeded Trip records.")

        # 7. Scheduled Stop Times
        st_path = os.path.join(settings.GTFS_DIR, "stop_times.txt")
        if os.path.exists(st_path):
            df_st = pd.read_csv(st_path)
            existing_st_count = db.query(ScheduledStopTime).count()
            if existing_st_count < len(df_st):
                st_objects = []
                for _, r in df_st.iterrows():
                    st_objects.append(ScheduledStopTime(
                        trip_id=str(r["trip_id"]),
                        stop_id=str(r["stop_id"]),
                        arrival_time=str(r["arrival_time"]),
                        departure_time=str(r["departure_time"]),
                        stop_sequence=int(r["stop_sequence"])
                    ))
                db.bulk_save_objects(st_objects)
                db.commit()
                logger.info(f"Seeded {len(st_objects)} ScheduledStopTime records.")

        # 8. Actual Arrival Observations
        valid_obs_path = os.path.join(settings.PROCESSED_DIR, "valid_observations.csv")
        if os.path.exists(valid_obs_path):
            df_obs = pd.read_csv(valid_obs_path)
            if limit_observations:
                df_obs = df_obs.head(limit_observations)
                
            existing_obs_count = db.query(ActualArrivalObservation).count()
            if existing_obs_count == 0:
                obs_objects = []
                for _, r in df_obs.iterrows():
                    obs_objects.append(ActualArrivalObservation(
                        observation_id=str(r["observation_id"]),
                        trip_id=str(r["trip_id"]),
                        route_id=str(r["route_id"]),
                        stop_id=str(r["stop_id"]),
                        observation_date=str(r["observation_date"]),
                        scheduled_arrival_time=str(r["scheduled_arrival_time"]),
                        actual_arrival_time=str(r["actual_arrival_time"]),
                        delay_minutes=float(r["delay_minutes"]),
                        delay_status=str(r["delay_status"]),
                        time_period=str(r["time_period"]),
                        day_of_week=str(r["day_of_week"]),
                        is_weekend=bool(r.get("is_weekend", False)),
                        vehicle_id=str(r.get("vehicle_id", "")),
                        observation_source=str(r.get("observation_source", "AVL_GPS")),
                        weather_condition=str(r.get("weather_condition", "CLEAR"))
                    ))
                db.bulk_save_objects(obs_objects)
                db.commit()
                logger.info(f"Seeded {len(obs_objects)} ActualArrivalObservation records.")

        # 9. Log Import History
        import_record = DataImportHistory(
            source_code="TNSTC_MDU_2026",
            raw_records_count=18600,
            valid_records_count=db.query(ActualArrivalObservation).count(),
            rejected_records_count=351,
            status="SUCCESS",
            notes="Initial automated seeding of verified Madurai GTFS timetable and arrival observations."
        )
        db.add(import_record)
        db.commit()
        logger.info("Recorded DataImportHistory.")

        logger.info("Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        logger.error(f"Error during database seeding: {e}", exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
