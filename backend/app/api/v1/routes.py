"""
Routes API Endpoints
"""
import os
import pandas as pd
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.schemas.common import ResponseEnvelope
from backend.app.schemas.routes import RouteSummary, RouteDetail, RouteReliability
from backend.app.analysis.delay_analyzer import DelayAnalyzer
from backend.app.core.config import settings
from backend.app.api.deps import get_analyzer

router = APIRouter()

@router.get("/routes", response_model=ResponseEnvelope[List[RouteSummary]])
def list_routes(
    sort_by: str = Query("reliability_score", description="Field to sort by: reliability_score, average_delay_minutes, route_short_name"),
    order: str = Query("desc", description="Sort order: asc, desc"),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Lists all monitored bus routes with their punctuality metrics and reliability rankings."""
    routes = analyzer.get_route_rankings()
    
    reverse = (order.lower() == "desc")
    if sort_by in ["average_delay_minutes", "median_delay_minutes", "on_time_percentage", "reliability_score"]:
        routes.sort(key=lambda x: x.get(sort_by) or 0.0, reverse=reverse)
    elif sort_by == "route_short_name":
        routes.sort(key=lambda x: x.get("route_short_name", ""), reverse=reverse)
        
    return ResponseEnvelope(
        success=True,
        message=f"Retrieved {len(routes)} routes",
        data=routes,
        meta={"total": len(routes)}
    )

@router.get("/routes/search/query", response_model=ResponseEnvelope[List[dict]])
def search_routes(
    source_stop_id: str = Query(..., description="Origin stop ID (e.g. ST_CMBT)"),
    dest_stop_id: str = Query(..., description="Destination stop ID (e.g. ST_KELAMBAKKAM)"),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Searches routes connecting source and destination with intermediate stop details."""
    stop_times_path = os.path.join(settings.GTFS_DIR, "stop_times.txt")
    trips_path = os.path.join(settings.GTFS_DIR, "trips.txt")
    stops_path = os.path.join(settings.GTFS_DIR, "stops.txt")
    
    if not (os.path.exists(stop_times_path) and os.path.exists(trips_path)):
        raise HTTPException(status_code=500, detail="GTFS timetable data not found.")
        
    df_st = pd.read_csv(stop_times_path)
    df_trips = pd.read_csv(trips_path)
    df_stops = pd.read_csv(stops_path)
    stops_map = dict(zip(df_stops["stop_id"], df_stops["stop_name"]))
    
    # Map trip_id to route_id
    trip_route_map = dict(zip(df_trips["trip_id"], df_trips["route_id"]))
    
    # Find trips serving source and dest in proper sequence
    routes_found = {}
    grouped = df_st.groupby("trip_id")
    
    for trip_id, t_df in grouped:
        t_stops = t_df.sort_values("stop_sequence")["stop_id"].tolist()
        if source_stop_id in t_stops and dest_stop_id in t_stops:
            src_idx = t_stops.index(source_stop_id)
            dst_idx = t_stops.index(dest_stop_id)
            route_id = trip_route_map.get(trip_id)
            if not route_id:
                continue

            if src_idx < dst_idx:
                # Direct Outbound Direction
                if route_id not in routes_found or routes_found[route_id].get("is_return"):
                    intermediate_ids = t_stops[src_idx+1:dst_idx]
                    intermediate_names = [stops_map.get(s, s) for s in intermediate_ids]
                    routes_found[route_id] = {
                        "source_stop_name": stops_map.get(source_stop_id, source_stop_id),
                        "dest_stop_name": stops_map.get(dest_stop_id, dest_stop_id),
                        "intermediate_stops": intermediate_names,
                        "intermediate_count": len(intermediate_names),
                        "direction": "Outbound",
                        "is_return": False
                    }
            elif src_idx > dst_idx:
                # Return / Inbound Direction along the same Corridor
                if route_id not in routes_found:
                    intermediate_ids = t_stops[dst_idx+1:src_idx][::-1]
                    intermediate_names = [stops_map.get(s, s) for s in intermediate_ids]
                    routes_found[route_id] = {
                        "source_stop_name": stops_map.get(source_stop_id, source_stop_id),
                        "dest_stop_name": stops_map.get(dest_stop_id, dest_stop_id),
                        "intermediate_stops": intermediate_names,
                        "intermediate_count": len(intermediate_names),
                        "direction": "Return Service",
                        "is_return": True
                    }
                    
    # Enrich with performance metrics
    all_ranks = {r["route_id"]: r for r in analyzer.get_route_rankings()}
    search_results = []
    
    for r_id, path_info in routes_found.items():
        if r_id in all_ranks:
            r_meta = all_ranks[r_id]
            search_results.append({
                "route_id": r_id,
                "route_short_name": r_meta["route_short_name"],
                "route_long_name": r_meta["route_long_name"],
                "source_stop": path_info["source_stop_name"],
                "destination_stop": path_info["dest_stop_name"],
                "intermediate_stops_count": path_info["intermediate_count"],
                "intermediate_stops": path_info["intermediate_stops"],
                "reliability_score": r_meta["reliability_score"],
                "average_delay_minutes": r_meta["average_delay_minutes"],
                "on_time_percentage": r_meta["on_time_percentage"],
                "delayed_percentage": r_meta["delayed_percentage"]
            })
            
    search_results.sort(key=lambda x: x["reliability_score"], reverse=True)
    return ResponseEnvelope(
        success=True,
        message=f"Found {len(search_results)} matching routes",
        data=search_results
    )

@router.get("/routes/{route_id}", response_model=ResponseEnvelope[RouteDetail])
def get_route_detail(route_id: str, analyzer: DelayAnalyzer = Depends(get_analyzer)):
    """Retrieves full analytical dossier for a single route."""
    details = analyzer.get_route_details(route_id)
    if not details:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found in observation records.")
    return ResponseEnvelope(
        success=True,
        message="Route details retrieved successfully",
        data=details
    )

@router.get("/routes/{route_id}/reliability", response_model=ResponseEnvelope[RouteReliability])
def get_route_reliability(route_id: str, analyzer: DelayAnalyzer = Depends(get_analyzer)):
    """Returns reliability score, tier, and confidence rating for a route."""
    details = analyzer.get_route_details(route_id)
    if not details:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found.")
        
    stats = details["summary_statistics"]
    score = details["reliability_score"]
    
    tier = "EXCELLENT" if score >= 80 else ("GOOD" if score >= 65 else ("MODERATE" if score >= 50 else "POOR"))
    sample_size = stats["observation_count"]
    conf = "HIGH" if sample_size > 500 else ("MEDIUM" if sample_size > 100 else "LOW")
    
    data = {
        "route_id": route_id,
        "route_short_name": details["route_short_name"],
        "reliability_score": score,
        "on_time_percentage": stats["on_time_percentage"],
        "delayed_percentage": stats["delayed_percentage"],
        "early_percentage": stats["early_percentage"],
        "average_delay_minutes": stats["average_delay_minutes"],
        "median_delay_minutes": stats["median_delay_minutes"],
        "std_delay_minutes": stats["std_delay_minutes"],
        "sample_size": sample_size,
        "confidence_level": conf,
        "reliability_tier": tier
    }
    return ResponseEnvelope(
        success=True,
        message="Route reliability retrieved successfully",
        data=data
    )

@router.get("/routes/{route_id}/stops", response_model=ResponseEnvelope[List[dict]])
def get_route_stops(route_id: str, analyzer: DelayAnalyzer = Depends(get_analyzer)):
    """Retrieves stop-level delay metrics along a route corridor."""
    details = analyzer.get_route_details(route_id)
    if not details:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found.")
    return ResponseEnvelope(
        success=True,
        message="Route stops retrieved successfully",
        data=details["stops_performance"]
    )
