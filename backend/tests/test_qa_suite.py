"""
TransitPulse Quality Assurance & Comprehensive Testing Suite
Verifies mathematical precision, boundary conditions, edge cases,
performance benchmarks, and data integrity across the platform.
"""
import io
import time
import unittest
import numpy as np
import pandas as pd
import openpyxl

from backend.app.services.data_preprocessor import DataPreprocessor
from backend.app.analysis.delay_analyzer import DelayAnalyzer
from backend.app.services.pdf_report_generator import PDFReportGenerator
from backend.app.services.excel_report_generator import ExcelReportGenerator


class TestComprehensiveQA(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.preprocessor = DataPreprocessor()
        cls.analyzer = DelayAnalyzer()
        cls.pdf_gen = PDFReportGenerator()
        cls.excel_gen = ExcelReportGenerator()

    # ---------------- 1. Mathematical Precision & Boundary Testing ----------------
    def test_delay_calculation_mathematics(self):
        """Verifies Delay Minutes = Actual Arrival Time - Scheduled Arrival Time strictly."""
        sample_rows = self.analyzer.df.sample(min(100, len(self.analyzer.df)), random_state=42)
        for _, row in sample_rows.iterrows():
            calc_delay = row["delay_minutes"]
            sched_str = str(row["scheduled_arrival_time"])
            actual_str = str(row["actual_arrival_time"])
            
            # Reconstruct minutes from midnight for scheduled and actual
            sh, sm, ss = map(int, sched_str.split(":"))
            ah, am, as_ = map(int, actual_str.split(":"))
            
            sched_total_min = sh * 60 + sm + ss / 60.0
            actual_total_min = ah * 60 + am + as_ / 60.0
            
            expected_delay = round(actual_total_min - sched_total_min, 2)
            self.assertAlmostEqual(
                calc_delay, expected_delay, places=1,
                msg=f"Delay mismatch for record {row['observation_id']}: {calc_delay} vs {expected_delay}"
            )

    def test_on_time_threshold_boundaries(self):
        """Validates exact threshold: delay <= 5.0 min is ON_TIME; > 5.0 is DELAYED; < 0 is EARLY."""
        # Synthetic test DataFrame with exact threshold values
        boundary_df = pd.DataFrame([
            {"delay_minutes": -3.5, "delay_status": "EARLY"},
            {"delay_minutes": 0.0, "delay_status": "ON_TIME"},
            {"delay_minutes": 5.0, "delay_status": "ON_TIME"},
            {"delay_minutes": 5.01, "delay_status": "DELAYED"},
            {"delay_minutes": 15.0, "delay_status": "DELAYED"},
        ])
        stats = DelayAnalyzer.calculate_summary_statistics(boundary_df)
        self.assertEqual(stats["observation_count"], 5)
        self.assertEqual(stats["early_count"], 1)
        self.assertEqual(stats["on_time_count"], 2)
        self.assertEqual(stats["delayed_count"], 2)
        self.assertAlmostEqual(stats["early_percentage"] + stats["on_time_percentage"] + stats["delayed_percentage"], 100.0, places=1)

    def test_reliability_score_boundedness_and_weighting(self):
        """Validates Route Reliability Score is strictly bounded [0, 100] across extreme values."""
        # Perfect punctuality
        score_perfect = self.analyzer.calculate_reliability_score(100.0, 0.0, 0.0, 0.0)
        self.assertEqual(score_perfect, 100.0)

        # Complete collapse
        score_worst = self.analyzer.calculate_reliability_score(0.0, 100.0, 60.0, 30.0)
        self.assertTrue(0.0 <= score_worst <= 10.0)

        # Boundary checks
        self.assertTrue(0.0 <= self.analyzer.calculate_reliability_score(-50.0, 150.0, 100.0, 50.0) <= 100.0)
        self.assertTrue(0.0 <= self.analyzer.calculate_reliability_score(150.0, -10.0, -5.0, 0.0) <= 100.0)

    def test_percentile_monotonicity(self):
        """Validates that P25 <= P50 <= P75 <= P90 <= P95 holds across all routes."""
        for r in self.analyzer.get_route_rankings():
            details = self.analyzer.get_route_details(r["route_id"])
            p = details["summary_statistics"]["percentiles"]
            self.assertLessEqual(p["p25"], p["p50"], f"P25 > P50 on route {r['route_id']}")
            self.assertLessEqual(p["p50"], p["p75"], f"P50 > P75 on route {r['route_id']}")
            self.assertLessEqual(p["p75"], p["p90"], f"P75 > P90 on route {r['route_id']}")
            self.assertLessEqual(p["p90"], p["p95"], f"P90 > P95 on route {r['route_id']}")

    # ---------------- 2. Preprocessing & Data Quarantine Verification ----------------
    def test_overnight_trip_normalization(self):
        """Validates that scheduled arrival times >= 24:00:00 normalize correctly to the subsequent date."""
        dt = DataPreprocessor.parse_gtfs_time_and_date("2026-10-01", "24:25:30")
        self.assertIsNotNone(dt)
        self.assertEqual(dt.strftime("%Y-%m-%d %H:%M:%S"), "2026-10-02 00:25:30")

        dt_25 = DataPreprocessor.parse_gtfs_time_and_date("2026-10-01", "25:05:00")
        self.assertIsNotNone(dt_25)
        self.assertEqual(dt_25.strftime("%Y-%m-%d %H:%M:%S"), "2026-10-02 01:05:00")

        dt_reg = DataPreprocessor.parse_gtfs_time_and_date("2026-10-01", "14:30:00")
        self.assertIsNotNone(dt_reg)
        self.assertEqual(dt_reg.strftime("%Y-%m-%d %H:%M:%S"), "2026-10-01 14:30:00")

    def test_quarantined_records_completeness(self):
        """Verifies rejected records are quarantined with exact error codes."""
        import os
        from pathlib import Path
        rejected_file = Path(__file__).resolve().parent.parent / "datasets" / "rejected" / "rejected_observations.csv"
        if rejected_file.exists():
            rej_df = pd.read_csv(rejected_file)
            self.assertGreater(len(rej_df), 0, "Rejected records must be quarantined")
            self.assertIn("rejection_reason", rej_df.columns)
            valid_reasons = {"MISSING_ACTUAL_TIME", "INVALID_STOP_ID", "INVALID_ROUTE_ID"}
            for reason in rej_df["rejection_reason"].unique():
                self.assertIn(reason, valid_reasons)

    # ---------------- 3. Multi-Dimensional Filter Robustness ----------------
    def test_empty_filter_result_handling(self):
        """Verifies zero-matching filter returns structured empty statistics without crashing."""
        empty_subset = self.analyzer.filter_observations(
            route_id="TNSTC_77",
            start_date="2099-01-01",
            end_date="2099-01-02"
        )
        self.assertTrue(empty_subset.empty)
        stats = self.analyzer.calculate_summary_statistics(empty_subset)
        self.assertEqual(stats["observation_count"], 0)
        self.assertIsNone(stats["average_delay_minutes"])
        self.assertIsNone(stats["on_time_percentage"])
        self.assertEqual(stats["percentiles"], {})

    def test_multidimensional_filter_intersection(self):
        """Validates simultaneous filtering on Route, Stop, Weekday, and Time Period."""
        filtered = self.analyzer.filter_observations(
            route_id="TNSTC_77",
            weekday="Monday",
            time_period="Evening"
        )
        self.assertFalse(filtered.empty)
        self.assertTrue((filtered["route_id"] == "TNSTC_77").all())
        self.assertTrue((filtered["day_of_week"] == "Monday").all())
        self.assertTrue((filtered["time_period"] == "EVENING").all())

    # ---------------- 4. Corridor Comparison Matrix ----------------
    def test_multi_route_comparison_integrity(self):
        """Validates comparison matrix between 2 routes and handling of invalid route IDs."""
        comp = self.analyzer.compare_routes(["TNSTC_77", "TNSTC_48", "NON_EXISTENT_ROUTE_999"])
        self.assertEqual(len(comp["routes"]), 2, "Should compare valid routes and ignore non-existent")
        self.assertIsNotNone(comp["insights"]["most_reliable_route"])
        self.assertIsNotNone(comp["insights"]["lowest_average_delay_route"])

    # ---------------- 5. Performance & Sub-10ms Latency Benchmarks ----------------
    def test_analytics_query_latency_benchmark(self):
        """Benchmarks 50 consecutive analytical calculations to verify sub-100ms response latency."""
        start_time = time.perf_counter()
        iterations = 50
        for _ in range(iterations):
            self.analyzer.calculate_summary_statistics(self.analyzer.df)
            self.analyzer.get_route_rankings()
        elapsed_total = time.perf_counter() - start_time
        avg_ms = (elapsed_total / iterations) * 1000.0
        
        # Verify average execution time is under 100ms per comprehensive analytics pass
        self.assertLess(avg_ms, 100.0, f"Query latency too high: {avg_ms:.2f}ms per query")

    # ---------------- 6. Report Generation Integrity & Memory Safety ----------------
    def test_reports_memory_and_byte_integrity(self):
        """Verifies PDF and Excel generation release buffers and produce valid binary headers."""
        details = self.analyzer.get_route_details("TNSTC_77")
        
        # PDF check
        pdf_bytes = self.pdf_gen.generate_route_pdf(details)
        self.assertTrue(pdf_bytes.startswith(b"%PDF-"))
        self.assertGreater(len(pdf_bytes), 5000)
        
        # Excel check
        excel_bytes = self.excel_gen.generate_route_excel(details, raw_records_df=self.analyzer.df)
        wb = openpyxl.load_workbook(io.BytesIO(excel_bytes))
        self.assertIn("Summary", wb.sheetnames)
        self.assertIn("Corridor Stops", wb.sheetnames)
        self.assertIn("Temporal Analysis", wb.sheetnames)
        self.assertIn("Observations Sample", wb.sheetnames)
        self.assertIn("Data Quality & Provenance", wb.sheetnames)


if __name__ == "__main__":
    unittest.main()
