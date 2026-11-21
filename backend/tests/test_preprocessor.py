"""
Unit Tests for DataPreprocessor
Tests overnight trip normalization, rejection criteria, delay calculation, and threshold categorization.
"""
import unittest
from datetime import datetime
import pandas as pd
from backend.app.services.data_preprocessor import DataPreprocessor

class TestDataPreprocessor(unittest.TestCase):
    def setUp(self):
        self.preprocessor = DataPreprocessor()

    def test_overnight_time_parsing(self):
        """GTFS allows times >= 24:00:00 to represent trips past midnight."""
        dt1 = self.preprocessor.parse_gtfs_time_and_date("2026-10-01", "24:15:00")
        self.assertEqual(dt1, datetime(2026, 10, 2, 0, 15, 0))

        dt2 = self.preprocessor.parse_gtfs_time_and_date("2026-10-01", "25:45:30")
        self.assertEqual(dt2, datetime(2026, 10, 2, 1, 45, 30))

        dt_regular = self.preprocessor.parse_gtfs_time_and_date("2026-10-01", "08:30:00")
        self.assertEqual(dt_regular, datetime(2026, 10, 1, 8, 30, 0))

    def test_delay_status_classification(self):
        """Verify on-time, delayed, and early status logic."""
        # On-time: [-1.0, 5.0]
        self.assertEqual(self.preprocessor.determine_delay_status(0.0), "ON_TIME")
        self.assertEqual(self.preprocessor.determine_delay_status(4.9), "ON_TIME")
        self.assertEqual(self.preprocessor.determine_delay_status(-0.5), "ON_TIME")
        
        # Delayed: > 5.0
        self.assertEqual(self.preprocessor.determine_delay_status(5.1), "DELAYED")
        self.assertEqual(self.preprocessor.determine_delay_status(25.0), "DELAYED")
        
        # Early: < -1.0
        self.assertEqual(self.preprocessor.determine_delay_status(-1.5), "EARLY")
        self.assertEqual(self.preprocessor.determine_delay_status(-5.0), "EARLY")

    def test_time_period_classification(self):
        """Verify Morning, Afternoon, Evening, Night periods."""
        self.assertEqual(self.preprocessor.determine_time_period(datetime(2026, 10, 1, 8, 0)), "MORNING")
        self.assertEqual(self.preprocessor.determine_time_period(datetime(2026, 10, 1, 13, 30)), "AFTERNOON")
        self.assertEqual(self.preprocessor.determine_time_period(datetime(2026, 10, 1, 18, 45)), "EVENING")
        self.assertEqual(self.preprocessor.determine_time_period(datetime(2026, 10, 1, 22, 15)), "NIGHT")
        self.assertEqual(self.preprocessor.determine_time_period(datetime(2026, 10, 1, 4, 30)), "NIGHT")

    def test_rejection_of_missing_actual_arrival(self):
        """Observations lacking actual arrival must be quarantined without fabricating delay."""
        df_test = pd.DataFrame([{
            "observation_id": "TEST_001",
            "trip_id": "TRIP_TNSTC_77_03",
            "route_id": "TNSTC_77",
            "stop_id": "ST_MDU_PERIYAR",
            "scheduled_arrival_time": "08:00:00",
            "actual_arrival_time": "",  # Missing
            "observation_date": "2026-10-01",
            "vehicle_id": "TN-58-N-1234",
            "observation_source": "AVL_GPS",
            "weather_condition": "CLEAR"
        }])
        valid_df, rejected_df, metrics = self.preprocessor.process_observations_dataframe(df_test)
        self.assertEqual(len(valid_df), 0)
        self.assertEqual(len(rejected_df), 1)
        self.assertEqual(rejected_df.iloc[0]["rejection_reason"], "MISSING_ACTUAL_TIME")

    def test_rejection_of_invalid_stop_id(self):
        """Stop IDs outside the GTFS stop registry must be quarantined."""
        df_test = pd.DataFrame([{
            "observation_id": "TEST_002",
            "trip_id": "TRIP_TNSTC_77_03",
            "route_id": "TNSTC_77",
            "stop_id": "ST_UNKNOWN_RANDOM",
            "scheduled_arrival_time": "08:00:00",
            "actual_arrival_time": "08:05:00",
            "observation_date": "2026-10-01",
            "vehicle_id": "TN-58-N-1234",
            "observation_source": "AVL_GPS",
            "weather_condition": "CLEAR"
        }])
        valid_df, rejected_df, metrics = self.preprocessor.process_observations_dataframe(df_test)
        self.assertEqual(len(valid_df), 0)
        self.assertEqual(len(rejected_df), 1)
        self.assertEqual(rejected_df.iloc[0]["rejection_reason"], "INVALID_STOP_ID")

if __name__ == "__main__":
    unittest.main()
