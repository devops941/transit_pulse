"""
Bus Stops API Endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.schemas.common import ResponseEnvelope
from backend.app.schemas.stops import StopSummary, StopDetail
from backend.app.analysis.delay_analyzer import DelayAnalyzer
from backend.app.api.deps import get_analyzer

router = APIRouter()

@router.get("/stops", response_model=ResponseEnvelope[List[StopSummary]])
def list_stops(
    search: Optional[str] = Query(None, description="Search by stop name or ID"),
    sort_by: str = Query("average_delay_minutes", description="average_delay_minutes, observation_count, stop_name"),
    order: str = Query("desc", description="asc, desc"),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Lists bus stops with historical congestion metrics and connected route counts."""
    stops = analyzer.get_stop_analytics()
    
    if search:
        q = search.lower()
        stops = [s for s in stops if q in s["stop_name"].lower() or q in s["stop_id"].lower()]
        
    reverse = (order.lower() == "desc")
    if sort_by in ["average_delay_minutes", "observation_count", "on_time_percentage"]:
        stops.sort(key=lambda x: x.get(sort_by) or 0.0, reverse=reverse)
    elif sort_by == "stop_name":
        stops.sort(key=lambda x: x.get("stop_name", ""), reverse=reverse)
        
    return ResponseEnvelope(
        success=True,
        message=f"Retrieved {len(stops)} bus stops",
        data=stops,
        meta={"total": len(stops)}
    )

@router.get("/stops/{stop_id}", response_model=ResponseEnvelope[dict])
def get_stop_detail(stop_id: str, analyzer: DelayAnalyzer = Depends(get_analyzer)):
    """Retrieves comprehensive historical metrics, weekday trends, and diurnal performance for a bus stop."""
    stop_df = analyzer.filter_observations(stop_id=stop_id)
    if stop_df.empty:
        raise HTTPException(status_code=404, detail=f"Bus stop '{stop_id}' not found in observations.")
        
    stats = analyzer.calculate_summary_statistics(stop_df)
    meta = stop_df.iloc[0]
    
    routes_served = sorted(list(stop_df["route_short_name"].unique()))
    weekday_perf = analyzer.get_weekday_analytics(stop_id=stop_id)
    time_perf = analyzer.get_time_period_analytics(stop_id=stop_id)
    
    # Sample recent arrivals
    recent_sample = stop_df.tail(10)[[
        "observation_id", "route_short_name", "observation_date",
        "scheduled_arrival_time", "actual_arrival_time", "delay_minutes",
        "delay_status", "weather_condition"
    ]].to_dict(orient="records")
    
    data = {
        "stop_id": stop_id,
        "stop_name": meta["stop_name"],
        "stop_lat": meta["stop_lat"],
        "stop_lon": meta["stop_lon"],
        "summary_statistics": stats,
        "routes_served": routes_served,
        "routes_count": len(routes_served),
        "weekday_performance": weekday_perf,
        "time_period_performance": time_perf,
        "recent_observations_sample": recent_sample
    }
    
    return ResponseEnvelope(
        success=True,
        message="Stop details retrieved successfully",
        data=data
    )
