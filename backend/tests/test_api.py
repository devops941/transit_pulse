"""
API Endpoint Integration Tests
Tests all required REST endpoints, schemas, parameters, and error handlers directly and cleanly.
"""
import unittest
from fastapi import HTTPException
from backend.app.main import root
from backend.app.api.deps import get_analyzer
from backend.app.api.v1.health import health_check
from backend.app.api.v1.overview import get_system_overview
from backend.app.api.v1.routes import (
    list_routes,
    get_route_detail,
    get_route_reliability,
    get_route_stops,
    search_routes
)
from backend.app.api.v1.stops import list_stops, get_stop_detail
from backend.app.api.v1.analytics import (
    get_delay_analytics,
    get_weekday_analytics,
    get_time_period_analytics,
    get_trend_analytics,
    compare_routes_endpoint,
    get_delay_distribution_endpoint
)
from backend.app.api.v1.insights import get_public_insights
from backend.app.api.v1.reports import get_report_summary

class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.analyzer = get_analyzer()

    def test_root_endpoint(self):
        res = root()
        self.assertEqual(res["platform"], "TransitPulse")
        self.assertIn("/api/health", res["health_check"])

    def test_health_check(self):
        envelope = health_check()
        self.assertTrue(envelope.success)
        self.assertEqual(envelope.data["status"], "HEALTHY")

    def test_overview_endpoint(self):
        envelope = get_system_overview(self.analyzer)
        self.assertTrue(envelope.success)
        data = envelope.data
        self.assertGreater(data["total_valid_observations"], 20000)
        self.assertIn("top_reliable_routes", data)
        self.assertIn("most_delayed_routes", data)
        self.assertIn("top_bottleneck_stops", data)

    def test_list_routes(self):
        envelope = list_routes(sort_by="reliability_score", order="desc", analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        routes = envelope.data
        self.assertGreaterEqual(len(routes), 10)
        self.assertGreater(routes[0]["reliability_score"], 0)
        self.assertEqual(routes[0]["reliability_rank"], 1)

    def test_route_detail_and_not_found(self):
        envelope = get_route_detail("TNSTC_77", analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertEqual(envelope.data["route_id"], "TNSTC_77")

        # 404 Exception check
        with self.assertRaises(HTTPException) as ctx:
            get_route_detail("INVALID_ROUTE_XYZ", analyzer=self.analyzer)
        self.assertEqual(ctx.exception.status_code, 404)

    def test_route_reliability(self):
        envelope = get_route_reliability("TNSTC_48", analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertEqual(envelope.data["route_id"], "TNSTC_48")
        self.assertIn(envelope.data["reliability_tier"], ["EXCELLENT", "GOOD", "MODERATE", "POOR"])

    def test_route_stops(self):
        envelope = get_route_stops("TNSTC_77", analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertGreater(len(envelope.data), 0)

    def test_route_search(self):
        envelope = search_routes(source_stop_id="ST_MDU_PERIYAR", dest_stop_id="ST_MDU_THIRUNAGAR", analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertGreater(len(envelope.data), 0)
        route_ids = [r["route_id"] for r in envelope.data]
        self.assertIn("TNSTC_77", route_ids)

    def test_list_stops(self):
        envelope = list_stops(search=None, sort_by="average_delay_minutes", order="desc", analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertGreaterEqual(len(envelope.data), 30)

        # Search filter
        search_envelope = list_stops(search="Periyar", sort_by="average_delay_minutes", order="desc", analyzer=self.analyzer)
        self.assertTrue(search_envelope.success)
        self.assertGreater(len(search_envelope.data), 0)

    def test_stop_detail(self):
        envelope = get_stop_detail("ST_MDU_PERIYAR", analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertEqual(envelope.data["stop_id"], "ST_MDU_PERIYAR")
        self.assertIn("routes_served", envelope.data)

        # 404 check
        with self.assertRaises(HTTPException) as ctx:
            get_stop_detail("ST_NONEXISTENT", analyzer=self.analyzer)
        self.assertEqual(ctx.exception.status_code, 404)

    def test_analytics_delay(self):
        envelope = get_delay_analytics(route_id="TNSTC_77", analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertGreater(envelope.data["observation_count"], 0)

    def test_analytics_weekday(self):
        envelope = get_weekday_analytics(analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertEqual(len(envelope.data), 7)

    def test_analytics_time_period(self):
        envelope = get_time_period_analytics(analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertEqual(len(envelope.data), 4)

    def test_analytics_trends(self):
        envelope = get_trend_analytics(analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertGreater(len(envelope.data), 20)

    def test_analytics_comparison(self):
        envelope = compare_routes_endpoint("TNSTC_77,TNSTC_48", analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertEqual(envelope.data["selected_routes_count"], 2)

    def test_analytics_distribution(self):
        envelope = get_delay_distribution_endpoint(analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertGreater(len(envelope.data["bins"]), 0)

    def test_public_insights(self):
        envelope = get_public_insights(analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        insights = envelope.data["insights"]
        self.assertGreater(len(insights), 0)

    def test_reports_summary(self):
        # Network summary
        envelope = get_report_summary(route_id=None, analyzer=self.analyzer)
        self.assertTrue(envelope.success)
        self.assertEqual(envelope.data["report_type"], "SYSTEM_NETWORK_SUMMARY")

        # Specific route summary
        route_envelope = get_report_summary(route_id="TNSTC_77", analyzer=self.analyzer)
        self.assertTrue(route_envelope.success)
        self.assertEqual(route_envelope.data["report_type"], "ROUTE_PERFORMANCE_DOSSIER")

if __name__ == "__main__":
    unittest.main()
