"""
Platform Overview API Endpoint
"""
from fastapi import APIRouter, Depends
from backend.app.schemas.common import ResponseEnvelope
from backend.app.analysis.delay_analyzer import DelayAnalyzer
from backend.app.api.deps import get_analyzer

router = APIRouter()

@router.get("/overview", response_model=ResponseEnvelope[dict])
def get_system_overview(analyzer: DelayAnalyzer = Depends(get_analyzer)):
    """Provides high-level system metrics for public dashboard landing page."""
    df = analyzer.df
    summary = analyzer.calculate_summary_statistics(df)
    route_ranks = analyzer.get_route_rankings()
    stop_bottlenecks = analyzer.get_stop_analytics()
    
    top_reliable = route_ranks[:3] if len(route_ranks) >= 3 else route_ranks
    top_delayed = route_ranks[-3:][::-1] if len(route_ranks) >= 3 else route_ranks
    top_stops = stop_bottlenecks[:3] if len(stop_bottlenecks) >= 3 else stop_bottlenecks
    
    return ResponseEnvelope(
        success=True,
        message="System overview retrieved successfully",
        data={
            "total_valid_observations": summary["observation_count"],
            "monitored_routes_count": len(route_ranks),
            "monitored_stops_count": len(stop_bottlenecks),
            "system_average_delay_minutes": summary["average_delay_minutes"],
            "system_median_delay_minutes": summary["median_delay_minutes"],
            "system_on_time_percentage": summary["on_time_percentage"],
            "system_delayed_percentage": summary["delayed_percentage"],
            "date_range": summary["date_range"],
            "top_reliable_routes": top_reliable,
            "most_delayed_routes": top_delayed,
            "top_bottleneck_stops": top_stops
        }
    )
