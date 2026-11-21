"""
Unit Tests for Database Models, Relationships, Seeding, and Integrity Constraints
"""
import unittest
import os
from sqlalchemy.exc import IntegrityError
from backend.app.database.session import SessionLocal, init_db, engine
from backend.app.models.base import Base
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
from backend.app.database.seed_db import seed_database

class TestDatabase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        # Seed a small batch for testing
        seed_database(limit_observations=200)

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_tables_created(self):
        """Verifies that all 9 required tables are registered in metadata."""
        table_names = list(Base.metadata.tables.keys())
        expected = [
            "agencies", "routes", "stops", "service_calendars", "trips",
            "scheduled_stop_times", "actual_arrival_observations",
            "dataset_sources", "data_import_history"
        ]
        for t in expected:
            self.assertIn(t, table_names)

    def test_agency_and_routes_relationship(self):
        """Verifies Agency query and its relationship to Routes."""
        agency = self.db.query(Agency).filter_by(agency_id="TNSTC_MDU").first()
        self.assertIsNotNone(agency)
        self.assertGreater(len(agency.routes), 0)
        route_ids = [r.route_id for r in agency.routes]
        self.assertIn("TNSTC_77", route_ids)

    def test_route_and_trips_relationship(self):
        """Verifies Route query and its relationship to Trips."""
        route = self.db.query(Route).filter_by(route_id="TNSTC_77").first()
        self.assertIsNotNone(route)
        self.assertGreater(len(route.trips), 0)
        self.assertEqual(route.agency_id, "TNSTC_MDU")

    def test_trip_and_stop_times_relationship(self):
        """Verifies Trip query and scheduled stop times."""
        trip = self.db.query(Trip).filter_by(trip_id="TRIP_TNSTC_77_01").first()
        self.assertIsNotNone(trip)
        self.assertGreater(len(trip.stop_times), 0)
        first_stop = trip.stop_times[0]
        self.assertEqual(first_stop.stop_sequence, 1)

    def test_observations_queried(self):
        """Verifies arrival observations and delay attributes."""
        obs = self.db.query(ActualArrivalObservation).first()
        self.assertIsNotNone(obs)
        self.assertIsInstance(obs.delay_minutes, float)
        self.assertIn(obs.delay_status, ["ON_TIME", "DELAYED", "EARLY"])
        self.assertIn(obs.time_period, ["MORNING", "AFTERNOON", "EVENING", "NIGHT"])

    def test_dataset_source_and_audit(self):
        """Verifies dataset provenance and import audit history."""
        source = self.db.query(DatasetSource).filter_by(source_code="TNSTC_MDU_2026").first()
        self.assertIsNotNone(source)
        self.assertIn("TNSTC", source.authority_name)
        self.assertGreater(len(source.import_history), 0)
        audit = source.import_history[0]
        self.assertEqual(audit.status, "SUCCESS")

    def test_duplicate_observation_rejected(self):
        """Verifies unique constraint uq_obs_trip_stop_date prevents duplicate arrival logs."""
        existing = self.db.query(ActualArrivalObservation).first()
        self.assertIsNotNone(existing)

        duplicate = ActualArrivalObservation(
            observation_id="OBS_DUPLICATE_TEST",
            trip_id=existing.trip_id,
            route_id=existing.route_id,
            stop_id=existing.stop_id,
            observation_date=existing.observation_date,
            scheduled_arrival_time="08:00:00",
            actual_arrival_time="08:10:00",
            delay_minutes=10.0,
            delay_status="DELAYED",
            time_period="MORNING",
            day_of_week="Monday"
        )
        self.db.add(duplicate)
        with self.assertRaises(IntegrityError):
            self.db.commit()
        self.db.rollback()

if __name__ == "__main__":
    unittest.main()
