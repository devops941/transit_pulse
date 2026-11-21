"""
Unit Tests for DelayAnalyzer (Core Python Analysis Engine)
Tests all analytical algorithms, summary statistics, reliability scores, route rankings,
comparative matrices, stop analyses, temporal breakdowns, and dynamic public insights.
"""
import unittest
import pandas as pd
from backend.app.analysis.delay_analyzer import DelayAnalyzer

class TestDelayAnalyzer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.analyzer = DelayAnalyzer()

    def test_data_loaded(self):
        """Verify verified observations are loaded into memory."""
        self.assertIsNotNone(self.analyzer.df)
        self.assertGreater(len(self.analyzer.df), 20000)

    def test_calculate_summary_statistics(self):
        """Verify calculation of statistical metrics."""
        stats = self.analyzer.calculate_summary_statistics(self.analyzer.df)
        self.assertGreater(stats["observation_count"], 0)
        self.assertIsInstance(stats["average_delay_minutes"], float)
        self.assertIsInstance(stats["median_delay_minutes"], float)
        self.assertIsInstance(stats["std_delay_minutes"], float)
        self.assertIn("p50", stats["percentiles"])
        self.assertIn("p95", stats["percentiles"])
        self.assertAlmostEqual(
            stats["on_time_percentage"] + stats["delayed_percentage"] + stats["early_percentage"],
            100.0,
            delta=0.5
        )

    def test_reliability_score_bounds(self):
        """Reliability score must stay strictly bounded in [0, 100]."""
        # Perfect route: 100% on time, 0 delay, 0 variance -> 100.0
        score_perfect = self.analyzer.calculate_reliability_score(100.0, 0.0, 0.0, 0.0)
        self.assertEqual(score_perfect, 100.0)
        
        # Terrible route: 0% on time, 100% delayed, 60 min delay, 20 min variance -> 0.0
        score_worst = self.analyzer.calculate_reliability_score(0.0, 100.0, 60.0, 20.0)
        self.assertEqual(score_worst, 0.0)
        
        # Realistic route: 75% on time, 25% delayed, 4.0 min delay, 3.0 min variance
        score_mid = self.analyzer.calculate_reliability_score(75.0, 25.0, 4.0, 3.0)
        self.assertTrue(0.0 <= score_mid <= 100.0)

    def test_route_rankings(self):
        """Verify route rankings list and ordering."""
        rankings = self.analyzer.get_route_rankings()
        self.assertGreaterEqual(len(rankings), 5)
        # Verify descending order by reliability_score
        scores = [r["reliability_score"] for r in rankings]
        self.assertEqual(scores, sorted(scores, reverse=True))
        # Verify rank 1 is present
        self.assertEqual(rankings[0]["reliability_rank"], 1)

    def test_route_details(self):
        """Verify detailed route profile generation."""
        details = self.analyzer.get_route_details("TNSTC_77")
        self.assertIsNotNone(details)
        self.assertEqual(details["route_id"], "TNSTC_77")
        self.assertIn("stops_performance", details)
        self.assertIn("weekday_performance", details)
        self.assertIn("time_period_performance", details)
        self.assertIn("trend_series", details)
        self.assertGreater(len(details["stops_performance"]), 0)

    def test_compare_routes(self):
        """Verify comparison of multiple routes."""
        comparison = self.analyzer.compare_routes(["TNSTC_77", "TNSTC_48", "TNSTC_70"])
        self.assertEqual(comparison["selected_routes_count"], 3)
        self.assertIn("insights", comparison)
        self.assertIsNotNone(comparison["insights"]["most_reliable_route"])

    def test_stop_analytics(self):
        """Verify bus stop congestion rankings."""
        stops = self.analyzer.get_stop_analytics()
        self.assertGreater(len(stops), 0)
        # Should be ordered by average_delay_minutes descending
        avg_delays = [s["average_delay_minutes"] for s in stops]
        self.assertEqual(avg_delays, sorted(avg_delays, reverse=True))
        self.assertIn("routes_served", stops[0])

    def test_weekday_analytics(self):
        """Verify weekday analysis preserves chronological Monday to Sunday order."""
        weekdays = self.analyzer.get_weekday_analytics()
        self.assertEqual(len(weekdays), 7)
        day_names = [w["day_of_week"] for w in weekdays]
        self.assertEqual(day_names, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])

    def test_time_period_analytics(self):
        """Verify time period analysis order."""
        periods = self.analyzer.get_time_period_analytics()
        self.assertEqual(len(periods), 4)
        period_names = [p["time_period"] for p in periods]
        self.assertEqual(period_names, ["MORNING", "AFTERNOON", "EVENING", "NIGHT"])

    def test_delay_distribution_bins(self):
        """Verify histogram bins sum up to total valid observations."""
        dist = self.analyzer.get_delay_distribution()
        self.assertGreater(dist["total_observations"], 0)
        sum_counts = sum(b["count"] for b in dist["bins"])
        self.assertEqual(sum_counts, dist["total_observations"])

    def test_dynamic_public_insights(self):
        """Verify dynamic generation of public transport insights."""
        insights = self.analyzer.generate_public_insights()
        self.assertIn("insights", insights)
        categories = [item["category"] for item in insights["insights"]]
        self.assertIn("MOST_RELIABLE_ROUTE", categories)
        self.assertIn("MOST_DELAYED_ROUTE", categories)
        self.assertIn("PEAK_BOTTLENECK_STOP", categories)
        self.assertIn("PEAK_WEEKDAY", categories)
        self.assertIn("PEAK_TIME_PERIOD", categories)

if __name__ == "__main__":
    unittest.main()
