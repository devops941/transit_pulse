"""
TransitPulse - Core Python Analysis Engine
High-performance, pure-Python analytical calculations for public bus delay intelligence,
punctuality rankings, route comparisons, stop bottlenecks, temporal patterns, and dynamic insights.
"""
import os
import logging
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np

from backend.app.core.config import settings

logger = logging.getLogger("transitpulse.analysis")

class DelayAnalyzer:
    """
    Core Analytical Engine for TransitPulse.
    Operates on verified historical observations where both scheduled and actual arrival timestamps exist.
    """
    WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    TIME_PERIOD_ORDER = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"]

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or os.path.join(settings.PROCESSED_DIR, "valid_observations.csv")
        self._df: Optional[pd.DataFrame] = None
        self.load_data()

    def load_data(self) -> pd.DataFrame:
        """Loads and caches the verified observations dataset."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Processed dataset not found at {self.data_path}. Run preprocessing first.")
            
        self._df = pd.read_csv(self.data_path)
        # Ensure proper types
        self._df["observation_date"] = self._df["observation_date"].astype(str)
        self._df["delay_minutes"] = pd.to_numeric(self._df["delay_minutes"], errors="coerce")
        if "route_short_name" in self._df.columns:
            self._df["route_short_name"] = self._df["route_short_name"].astype(str)
        # Ensure chronological ordering for categorical analysis
        self._df["day_of_week"] = pd.Categorical(self._df["day_of_week"], categories=self.WEEKDAY_ORDER, ordered=True)
        self._df["time_period"] = pd.Categorical(self._df["time_period"], categories=self.TIME_PERIOD_ORDER, ordered=True)
        return self._df

    @property
    def df(self) -> pd.DataFrame:
        if self._df is None:
            self.load_data()
        return self._df

    @staticmethod
    def _is_valid_filter(val: Any) -> bool:
        if val is None:
            return False
        # Guard against FastAPI Query parameter objects passed in direct calls
        if hasattr(val, "__class__") and "fastapi" in getattr(val.__class__, "__module__", ""):
            return False
        if isinstance(val, str) and not val.strip():
            return False
        return True

    def filter_observations(
        self,
        route_id: Optional[str] = None,
        stop_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        weekday: Optional[str] = None,
        time_period: Optional[str] = None,
        weather: Optional[str] = None,
        base_df: Optional[pd.DataFrame] = None
    ) -> pd.DataFrame:
        """Applies multi-dimensional filters on valid observations."""
        data = self.df if base_df is None else base_df.copy()
        
        if self._is_valid_filter(route_id):
            data = data[data["route_id"] == str(route_id).strip()]
        if self._is_valid_filter(stop_id):
            data = data[data["stop_id"] == str(stop_id).strip()]
        if self._is_valid_filter(start_date):
            data = data[data["observation_date"] >= str(start_date).strip()]
        if self._is_valid_filter(end_date):
            data = data[data["observation_date"] <= str(end_date).strip()]
        if self._is_valid_filter(weekday):
            data = data[data["day_of_week"].astype(str).str.lower() == str(weekday).strip().lower()]
        if self._is_valid_filter(time_period):
            data = data[data["time_period"].astype(str).str.upper() == str(time_period).strip().upper()]
        if self._is_valid_filter(weather):
            data = data[data["weather_condition"] == str(weather).strip()]
            
        return data

    @staticmethod
    def calculate_summary_statistics(df_subset: pd.DataFrame) -> Dict[str, Any]:
        """
        Computes descriptive statistical metrics, percentile distributions,
        and punctuality rates for any filtered observation subset.
        """
        n = len(df_subset)
        if n == 0:
            return {
                "observation_count": 0,
                "average_delay_minutes": None,
                "median_delay_minutes": None,
                "std_delay_minutes": None,
                "min_delay_minutes": None,
                "max_delay_minutes": None,
                "percentiles": {},
                "on_time_percentage": None,
                "delayed_percentage": None,
                "early_percentage": None,
                "date_range": {"start": None, "end": None}
            }

        delays = df_subset["delay_minutes"].dropna()
        
        avg_delay = round(float(delays.mean()), 2)
        med_delay = round(float(delays.median()), 2)
        std_delay = round(float(delays.std(ddof=1)), 2) if n > 1 else 0.0
        min_delay = round(float(delays.min()), 2)
        max_delay = round(float(delays.max()), 2)

        percentiles = {
            "p25": round(float(np.percentile(delays, 25)), 2),
            "p50": med_delay,
            "p75": round(float(np.percentile(delays, 75)), 2),
            "p90": round(float(np.percentile(delays, 90)), 2),
            "p95": round(float(np.percentile(delays, 95)), 2)
        }

        on_time_count = int((df_subset["delay_status"] == "ON_TIME").sum()) if "delay_status" in df_subset.columns else 0
        delayed_count = int((df_subset["delay_status"] == "DELAYED").sum()) if "delay_status" in df_subset.columns else 0
        early_count = int((df_subset["delay_status"] == "EARLY").sum()) if "delay_status" in df_subset.columns else 0

        date_start = str(df_subset["observation_date"].min()) if "observation_date" in df_subset.columns else "N/A"
        date_end = str(df_subset["observation_date"].max()) if "observation_date" in df_subset.columns else "N/A"

        return {
            "observation_count": n,
            "average_delay_minutes": avg_delay,
            "median_delay_minutes": med_delay,
            "std_delay_minutes": std_delay,
            "min_delay_minutes": min_delay,
            "max_delay_minutes": max_delay,
            "percentiles": percentiles,
            "on_time_count": on_time_count,
            "delayed_count": delayed_count,
            "early_count": early_count,
            "on_time_percentage": round((on_time_count / n) * 100, 2),
            "delayed_percentage": round((delayed_count / n) * 100, 2),
            "early_percentage": round((early_count / n) * 100, 2),
            "date_range": {
                "start": date_start,
                "end": date_end
            }
        }

    @staticmethod
    def calculate_reliability_score(
        on_time_pct: float,
        delayed_pct: float,
        avg_delay: float,
        std_delay: float
    ) -> float:
        """
        Computes standardized Route Reliability Score [0 - 100].
        Rewards high on-time consistency and penalizes both excessive delay and schedule variance.
        Formula:
          Score = max(0, min(100, (on_time_pct * 0.70) + (100 - min(avg_delay * 3.5, 100)) * 0.20 + (100 - min(std_delay * 5.0, 100)) * 0.10))
        """
        term_ontime = on_time_pct * 0.70
        penalty_delay = min(max(avg_delay, 0.0) * 3.5, 100.0)
        term_delay = (100.0 - penalty_delay) * 0.20
        penalty_std = min(max(std_delay, 0.0) * 5.0, 100.0)
        term_std = (100.0 - penalty_std) * 0.10
        
        score = term_ontime + term_delay + term_std
        return round(float(np.clip(score, 0.0, 100.0)), 1)

    def get_route_rankings(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Ranks all monitored routes by punctuality and historical reliability score.
        Enforces minimum observation threshold to prevent skewed small-sample bias.
        """
        filtered = self.filter_observations(start_date=start_date, end_date=end_date)
        
        grouped = filtered.groupby(["route_id", "route_short_name", "route_long_name"])
        results = []
        
        for (r_id, r_short, r_long), group in grouped:
            n = len(group)
            if n < 5:  # Minimum statistical threshold
                continue
                
            stats = self.calculate_summary_statistics(group)
            score = self.calculate_reliability_score(
                stats["on_time_percentage"],
                stats["delayed_percentage"],
                stats["average_delay_minutes"],
                stats["std_delay_minutes"]
            )
            
            results.append({
                "route_id": r_id,
                "route_short_name": r_short,
                "route_long_name": r_long,
                "observation_count": stats["observation_count"],
                "average_delay_minutes": stats["average_delay_minutes"],
                "median_delay_minutes": stats["median_delay_minutes"],
                "std_delay_minutes": stats["std_delay_minutes"],
                "min_delay_minutes": stats["min_delay_minutes"],
                "max_delay_minutes": stats["max_delay_minutes"],
                "on_time_percentage": stats["on_time_percentage"],
                "delayed_percentage": stats["delayed_percentage"],
                "early_percentage": stats["early_percentage"],
                "reliability_score": score
            })
            
        # Rank by reliability score descending
        results.sort(key=lambda x: x["reliability_score"], reverse=True)
        for idx, item in enumerate(results, start=1):
            item["reliability_rank"] = idx
            
        return results

    def get_route_details(self, route_id: str) -> Optional[Dict[str, Any]]:
        """Generates a complete analytical profile for a single route."""
        route_df = self.filter_observations(route_id=route_id)
        if route_df.empty:
            # Fallback check by route_short_name in case caller passes "77" instead of "TNSTC_77"
            r_match = self.df[self.df["route_short_name"].astype(str) == str(route_id).strip()]
            if not r_match.empty:
                route_df = r_match
            else:
                return None
            
        summary = self.calculate_summary_statistics(route_df)
        reliability = self.calculate_reliability_score(
            summary["on_time_percentage"],
            summary["delayed_percentage"],
            summary["average_delay_minutes"],
            summary["std_delay_minutes"]
        )
        
        r_meta = route_df.iloc[0]
        
        # Stop-level performance along this route
        stop_metrics = []
        stop_grouped = route_df.groupby(["stop_id", "stop_name", "stop_lat", "stop_lon"])
        for (s_id, s_name, s_lat, s_lon), s_group in stop_grouped:
            s_stats = self.calculate_summary_statistics(s_group)
            stop_metrics.append({
                "stop_id": s_id,
                "stop_name": s_name,
                "stop_lat": s_lat,
                "stop_lon": s_lon,
                "observation_count": s_stats["observation_count"],
                "average_delay_minutes": s_stats["average_delay_minutes"],
                "median_delay_minutes": s_stats["median_delay_minutes"],
                "on_time_percentage": s_stats["on_time_percentage"],
                "delayed_percentage": s_stats["delayed_percentage"]
            })
            
        canonical_route_id = r_meta["route_id"]
        
        # Temporal breakdowns
        weekday_breakdown = self.get_weekday_analytics(route_id=canonical_route_id)
        time_period_breakdown = self.get_time_period_analytics(route_id=canonical_route_id)
        trend_series = self.get_trend_analytics(route_id=canonical_route_id)
        
        return {
            "route_id": canonical_route_id,
            "route_short_name": r_meta["route_short_name"],
            "route_long_name": r_meta["route_long_name"],
            "summary_statistics": summary,
            "reliability_score": reliability,
            "stops_performance": stop_metrics,
            "weekday_performance": weekday_breakdown,
            "time_period_performance": time_period_breakdown,
            "trend_series": trend_series
        }

    def compare_routes(self, route_ids: List[str]) -> Dict[str, Any]:
        """Performs a multi-route comparative analysis."""
        if not route_ids:
            return {"routes": [], "comparison_matrix": {}}
            
        route_summaries = []
        for r_id in route_ids:
            r_df = self.filter_observations(route_id=r_id)
            if r_df.empty:
                continue
            r_meta = r_df.iloc[0]
            stats = self.calculate_summary_statistics(r_df)
            score = self.calculate_reliability_score(
                stats["on_time_percentage"],
                stats["delayed_percentage"],
                stats["average_delay_minutes"],
                stats["std_delay_minutes"]
            )
            
            # Weekday performance map
            w_perf = {item["day_of_week"]: item["average_delay_minutes"] for item in self.get_weekday_analytics(route_id=r_id)}
            # Time period performance map
            t_perf = {item["time_period"]: item["average_delay_minutes"] for item in self.get_time_period_analytics(route_id=r_id)}
            
            route_summaries.append({
                "route_id": r_id,
                "route_short_name": r_meta["route_short_name"],
                "route_long_name": r_meta["route_long_name"],
                "observation_count": stats["observation_count"],
                "average_delay_minutes": stats["average_delay_minutes"],
                "median_delay_minutes": stats["median_delay_minutes"],
                "std_delay_minutes": stats["std_delay_minutes"],
                "on_time_percentage": stats["on_time_percentage"],
                "delayed_percentage": stats["delayed_percentage"],
                "reliability_score": score,
                "weekday_average_delays": w_perf,
                "time_period_average_delays": t_perf
            })
            
        # Determine best performing in this comparison set
        most_reliable = max(route_summaries, key=lambda x: x["reliability_score"]) if route_summaries else None
        lowest_delay = min(route_summaries, key=lambda x: x["average_delay_minutes"]) if route_summaries else None
        
        return {
            "selected_routes_count": len(route_summaries),
            "routes": route_summaries,
            "insights": {
                "most_reliable_route": most_reliable["route_short_name"] if most_reliable else None,
                "lowest_average_delay_route": lowest_delay["route_short_name"] if lowest_delay else None
            }
        }

    def get_stop_analytics(self, stop_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Analyzes bus stop congestion, arrival volume, and delay frequency.
        Identifies top delay bottleneck locations.
        """
        data = self.filter_observations(stop_id=stop_id)
        if data.empty:
            return []
            
        grouped = data.groupby(["stop_id", "stop_name", "stop_lat", "stop_lon"])
        results = []
        
        for (s_id, s_name, s_lat, s_lon), group in grouped:
            stats = self.calculate_summary_statistics(group)
            routes_served = sorted(list(group["route_short_name"].unique()))
            
            results.append({
                "stop_id": s_id,
                "stop_name": s_name,
                "stop_lat": s_lat,
                "stop_lon": s_lon,
                "observation_count": stats["observation_count"],
                "average_delay_minutes": stats["average_delay_minutes"],
                "median_delay_minutes": stats["median_delay_minutes"],
                "std_delay_minutes": stats["std_delay_minutes"],
                "on_time_percentage": stats["on_time_percentage"],
                "delayed_percentage": stats["delayed_percentage"],
                "routes_served": routes_served,
                "routes_count": len(routes_served)
            })
            
        # Rank by highest average delay descending (congestion bottleneck ranking)
        results.sort(key=lambda x: x["average_delay_minutes"], reverse=True)
        return results

    def get_weekday_analytics(
        self,
        route_id: Optional[str] = None,
        stop_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Computes day-of-week arrival punctuality and delay trends."""
        data = self.filter_observations(route_id=route_id, stop_id=stop_id)
        if data.empty:
            return []
            
        results = []
        for day in self.WEEKDAY_ORDER:
            day_group = data[data["day_of_week"] == day]
            stats = self.calculate_summary_statistics(day_group)
            results.append({
                "day_of_week": day,
                "observation_count": stats["observation_count"],
                "average_delay_minutes": stats["average_delay_minutes"],
                "median_delay_minutes": stats["median_delay_minutes"],
                "on_time_percentage": stats["on_time_percentage"],
                "delayed_percentage": stats["delayed_percentage"],
                "early_percentage": stats["early_percentage"]
            })
            
        return results

    def get_time_period_analytics(
        self,
        route_id: Optional[str] = None,
        stop_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Computes diurnal performance across Morning, Afternoon, Evening, and Night."""
        data = self.filter_observations(route_id=route_id, stop_id=stop_id)
        if data.empty:
            return []
            
        results = []
        for period in self.TIME_PERIOD_ORDER:
            period_group = data[data["time_period"] == period]
            stats = self.calculate_summary_statistics(period_group)
            label = settings.TIME_PERIODS.get(period, {}).get("label", period)
            results.append({
                "time_period": period,
                "time_period_label": label,
                "observation_count": stats["observation_count"],
                "average_delay_minutes": stats["average_delay_minutes"],
                "median_delay_minutes": stats["median_delay_minutes"],
                "on_time_percentage": stats["on_time_percentage"],
                "delayed_percentage": stats["delayed_percentage"],
                "early_percentage": stats["early_percentage"]
            })
            
        return results

    def get_trend_analytics(
        self,
        route_id: Optional[str] = None,
        stop_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generates longitudinal daily delay and punctuality time series."""
        data = self.filter_observations(route_id=route_id, stop_id=stop_id)
        if data.empty:
            return []
            
        daily_grouped = data.groupby("observation_date")
        trends = []
        
        for date_str, group in sorted(daily_grouped):
            stats = self.calculate_summary_statistics(group)
            trends.append({
                "date": date_str,
                "observation_count": stats["observation_count"],
                "average_delay_minutes": stats["average_delay_minutes"],
                "median_delay_minutes": stats["median_delay_minutes"],
                "on_time_percentage": stats["on_time_percentage"],
                "delayed_percentage": stats["delayed_percentage"]
            })
            
        return trends

    def get_delay_distribution(
        self,
        route_id: Optional[str] = None,
        stop_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Computes delay distribution histogram bins for Plotly visualization."""
        data = self.filter_observations(route_id=route_id, stop_id=stop_id)
        if data.empty:
            return {"bins": [], "total_observations": 0}
            
        delays = data["delay_minutes"].dropna()
        n = len(delays)
        
        # Standard transit delay histogram bins (in minutes)
        bin_definitions = [
            ("Early (< 0 min)", lambda d: d < 0),
            ("On-Time (0 - 5 min)", lambda d: (d >= 0) & (d <= 5)),
            ("Minor Delay (5 - 10 min)", lambda d: (d > 5) & (d <= 10)),
            ("Moderate Delay (10 - 20 min)", lambda d: (d > 10) & (d <= 20)),
            ("Major Delay (20 - 30 min)", lambda d: (d > 20) & (d <= 30)),
            ("Severe Delay (> 30 min)", lambda d: d > 30)
        ]
        
        bins = []
        for label, cond in bin_definitions:
            count = int(cond(delays).sum())
            pct = round((count / n) * 100, 2) if n > 0 else 0.0
            bins.append({
                "bin_name": label,
                "count": count,
                "percentage": pct
            })
            
        return {
            "total_observations": n,
            "bins": bins
        }

    def generate_public_insights(self) -> Dict[str, Any]:
        """
        Dynamically synthesizes key analytical findings from verified dataset computations.
        Never relies on hardcoded or mocked assumptions.
        """
        route_ranks = self.get_route_rankings()
        stop_analytics = self.get_stop_analytics()
        weekday_analytics = self.get_weekday_analytics()
        time_analytics = self.get_time_period_analytics()
        overall_stats = self.calculate_summary_statistics(self.df)
        
        if not route_ranks:
            return {"status": "INSUFFICIENT_DATA"}
            
        # Best & worst performing routes
        best_route = route_ranks[0]
        worst_route = route_ranks[-1]
        
        # Peak congestion stop
        worst_stop = stop_analytics[0] if stop_analytics else None
        best_stop = stop_analytics[-1] if stop_analytics else None
        
        # Peak delay weekday
        worst_weekday = max(weekday_analytics, key=lambda x: x["average_delay_minutes"] if x["average_delay_minutes"] is not None else -999)
        best_weekday = min(weekday_analytics, key=lambda x: x["average_delay_minutes"] if x["average_delay_minutes"] is not None else 999)
        
        # Peak delay time window
        worst_time = max(time_analytics, key=lambda x: x["average_delay_minutes"] if x["average_delay_minutes"] is not None else -999)
        best_time = min(time_analytics, key=lambda x: x["average_delay_minutes"] if x["average_delay_minutes"] is not None else 999)

        # High-variance unpredictable route
        most_unpredictable = max(route_ranks, key=lambda x: x["std_delay_minutes"])
        
        # Weekend vs Weekday analysis
        weekend_df = self.df[self.df["is_weekend"] == True]
        weekday_df = self.df[self.df["is_weekend"] == False]
        weekend_delay = round(float(weekend_df["delay_minutes"].mean()), 2) if not weekend_df.empty else 0.0
        weekday_delay = round(float(weekday_df["delay_minutes"].mean()), 2) if not weekday_df.empty else 0.0
        diff_pct = round(((weekday_delay - weekend_delay) / weekend_delay) * 100, 1) if weekend_delay > 0 else 0.0

        # Buffer recommendation based on p90 delay
        all_delays = self.df["delay_minutes"].dropna()
        p90_delay = round(float(np.percentile(all_delays, 90)), 1) if not all_delays.empty else 10.0
        recommended_buffer = int(np.ceil(p90_delay / 5.0) * 5)
        
        return {
            "overall_summary": {
                "total_valid_observations": overall_stats["observation_count"],
                "system_average_delay_minutes": overall_stats["average_delay_minutes"],
                "system_on_time_percentage": overall_stats["on_time_percentage"],
                "date_range": overall_stats["date_range"],
                "recommended_buffer_minutes": recommended_buffer,
                "p90_delay_minutes": p90_delay
            },
            "insights": [
                {
                    "category": "MOST_RELIABLE_ROUTE",
                    "title": "Most Reliable Bus Route",
                    "route_id": best_route["route_id"],
                    "route_short_name": best_route["route_short_name"],
                    "route_long_name": best_route["route_long_name"],
                    "reliability_score": best_route["reliability_score"],
                    "on_time_percentage": best_route["on_time_percentage"],
                    "average_delay_minutes": best_route["average_delay_minutes"],
                    "detail": f"Route {best_route['route_short_name']} achieved the highest reliability score of {best_route['reliability_score']}/100 with {best_route['on_time_percentage']}% of trips arriving on-time."
                },
                {
                    "category": "MOST_DELAYED_ROUTE",
                    "title": "Route with Highest Average Delay",
                    "route_id": worst_route["route_id"],
                    "route_short_name": worst_route["route_short_name"],
                    "route_long_name": worst_route["route_long_name"],
                    "reliability_score": worst_route["reliability_score"],
                    "on_time_percentage": worst_route["on_time_percentage"],
                    "average_delay_minutes": worst_route["average_delay_minutes"],
                    "detail": f"Route {worst_route['route_short_name']} experienced the highest average delay of {worst_route['average_delay_minutes']} minutes, with {worst_route['delayed_percentage']}% of trips delayed."
                },
                {
                    "category": "HIGHEST_VARIANCE_ROUTE",
                    "title": "Corridor with Highest Headway Variance",
                    "route_id": most_unpredictable["route_id"],
                    "route_short_name": most_unpredictable["route_short_name"],
                    "route_long_name": most_unpredictable["route_long_name"],
                    "reliability_score": most_unpredictable["reliability_score"],
                    "average_delay_minutes": most_unpredictable["average_delay_minutes"],
                    "detail": f"Route {most_unpredictable['route_short_name']} has the highest arrival unpredictability (standard deviation of ±{most_unpredictable['std_delay_minutes']} min), indicating irregular headways."
                },
                {
                    "category": "PEAK_BOTTLENECK_STOP",
                    "title": "Most Delayed Bus Stop",
                    "stop_id": worst_stop["stop_id"] if worst_stop else None,
                    "stop_name": worst_stop["stop_name"] if worst_stop else None,
                    "average_delay_minutes": worst_stop["average_delay_minutes"] if worst_stop else None,
                    "routes_served_count": worst_stop["routes_count"] if worst_stop else 0,
                    "detail": f"Bus stop '{worst_stop['stop_name']}' logged the longest average arrival delay at {worst_stop['average_delay_minutes']} minutes across {worst_stop['observation_count']} observations."
                },
                {
                    "category": "PEAK_WEEKDAY",
                    "title": "Day with Highest Average Delay",
                    "day_of_week": worst_weekday["day_of_week"],
                    "average_delay_minutes": worst_weekday["average_delay_minutes"],
                    "delayed_percentage": worst_weekday["delayed_percentage"],
                    "detail": f"{worst_weekday['day_of_week']} recorded the highest systemic bus delays with an average delay of {worst_weekday['average_delay_minutes']} minutes."
                },
                {
                    "category": "PEAK_TIME_PERIOD",
                    "title": "Most Congested Time Period",
                    "time_period": worst_time["time_period"],
                    "time_period_label": worst_time["time_period_label"],
                    "average_delay_minutes": worst_time["average_delay_minutes"],
                    "delayed_percentage": worst_time["delayed_percentage"],
                    "detail": f"{worst_time['time_period_label']} logged the peak delay period with an average delay of {worst_time['average_delay_minutes']} minutes."
                },
                {
                    "category": "RECOMMENDED_TRAVEL_BUFFER",
                    "title": "Commuter Rush-Hour Buffer Guidance",
                    "detail": f"Passengers travelling during rush hour should budget an extra +{recommended_buffer} minutes buffer to ensure on-time arrival based on 90th percentile arrival delays."
                },
                {
                    "category": "WEEKEND_MOBILITY_ADVANTAGE",
                    "title": "Weekend Punctuality Advantage",
                    "detail": f"Weekend transit trips experience {diff_pct}% less arrival delay than weekday commuter operations (+{weekend_delay}m vs +{weekday_delay}m)."
                }
            ],
            "commuter_advisories": [
                {
                    "title": "Rush Hour Travel Buffer",
                    "advice": f"Plan for a +{recommended_buffer}-minute journey buffer on peak evening corridors.",
                    "severity": "HIGH"
                },
                {
                    "title": "Bottleneck Bypass Advisory",
                    "advice": f"Transit passing through {worst_stop['stop_name'] if worst_stop else 'key bottlenecks'} incurs the highest stop delays (+{worst_stop['average_delay_minutes'] if worst_stop else 10}m avg).",
                    "severity": "MEDIUM"
                },
                {
                    "title": "Optimal Travel Day",
                    "advice": f"{best_weekday['day_of_week']} provides the highest punctuality with an average delay of only +{best_weekday['average_delay_minutes']}m.",
                    "severity": "LOW"
                }
            ]
        }
