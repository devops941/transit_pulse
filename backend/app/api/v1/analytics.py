"""
Analytics API Endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from backend.app.schemas.common import ResponseEnvelope
from backend.app.analysis.delay_analyzer import DelayAnalyzer
from backend.app.api.deps import get_analyzer

router = APIRouter()

@router.get("/analytics/delay", response_model=ResponseEnvelope[dict])
def get_delay_analytics(
    route_id: Optional[str] = Query(None),
    stop_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    weekday: Optional[str] = Query(None),
    time_period: Optional[str] = Query(None),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Computes overall delay metrics with multi-dimensional filtering."""
    filtered_df = analyzer.filter_observations(
        route_id=route_id,
        stop_id=stop_id,
        start_date=start_date,
        end_date=end_date,
        weekday=weekday,
        time_period=time_period
    )
    stats = analyzer.calculate_summary_statistics(filtered_df)
    return ResponseEnvelope(
        success=True,
        message="Delay analytics retrieved successfully",
        data=stats
    )

@router.get("/analytics/weekday", response_model=ResponseEnvelope[List[dict]])
def get_weekday_analytics(
    route_id: Optional[str] = Query(None),
    stop_id: Optional[str] = Query(None),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Analyzes Monday-Sunday arrival delay and punctuality."""
    results = analyzer.get_weekday_analytics(route_id=route_id, stop_id=stop_id)
    return ResponseEnvelope(
        success=True,
        message="Weekday analytics retrieved successfully",
        data=results
    )

@router.get("/analytics/time-period", response_model=ResponseEnvelope[List[dict]])
def get_time_period_analytics(
    route_id: Optional[str] = Query(None),
    stop_id: Optional[str] = Query(None),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Analyzes Morning, Afternoon, Evening, Night delay patterns."""
    results = analyzer.get_time_period_analytics(route_id=route_id, stop_id=stop_id)
    return ResponseEnvelope(
        success=True,
        message="Time period analytics retrieved successfully",
        data=results
    )

@router.get("/analytics/trends", response_model=ResponseEnvelope[List[dict]])
def get_trend_analytics(
    route_id: Optional[str] = Query(None),
    stop_id: Optional[str] = Query(None),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Returns daily longitudinal delay and reliability time series."""
    results = analyzer.get_trend_analytics(route_id=route_id, stop_id=stop_id)
    return ResponseEnvelope(
        success=True,
        message="Trend analytics retrieved successfully",
        data=results
    )

@router.get("/analytics/comparison", response_model=ResponseEnvelope[dict])
def compare_routes_endpoint(
    routes: str = Query(..., description="Comma-separated route IDs (e.g. MTC_570,MTC_21G)"),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Performs side-by-side comparison across multiple bus routes."""
    route_id_list = [r.strip() for r in routes.split(",") if r.strip()]
    results = analyzer.compare_routes(route_id_list)
    return ResponseEnvelope(
        success=True,
        message="Route comparison completed successfully",
        data=results
    )

@router.get("/analytics/distribution", response_model=ResponseEnvelope[dict])
def get_delay_distribution_endpoint(
    route_id: Optional[str] = Query(None),
    stop_id: Optional[str] = Query(None),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Returns histogram bin data for delay distributions."""
    results = analyzer.get_delay_distribution(route_id=route_id, stop_id=stop_id)
    return ResponseEnvelope(
        success=True,
        message="Delay distribution retrieved successfully",
        data=results
    )
