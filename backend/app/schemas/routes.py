"""
Route Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class RouteSummary(BaseModel):
    route_id: str
    route_short_name: str
    route_long_name: str
    observation_count: int
    average_delay_minutes: float
    median_delay_minutes: float
    std_delay_minutes: float
    min_delay_minutes: float
    max_delay_minutes: float
    on_time_percentage: float
    delayed_percentage: float
    early_percentage: float
    reliability_score: float
    reliability_rank: int

class RouteStopItem(BaseModel):
    stop_id: str
    stop_name: str
    stop_lat: Optional[float] = None
    stop_lon: Optional[float] = None
    observation_count: int
    average_delay_minutes: Optional[float] = None
    median_delay_minutes: Optional[float] = None
    on_time_percentage: Optional[float] = None
    delayed_percentage: Optional[float] = None

class RouteReliability(BaseModel):
    route_id: str
    route_short_name: str
    reliability_score: float
    on_time_percentage: float
    delayed_percentage: float
    early_percentage: float
    average_delay_minutes: float
    median_delay_minutes: float
    std_delay_minutes: float
    sample_size: int
    confidence_level: str
    reliability_tier: str

class RouteDetail(BaseModel):
    route_id: str
    route_short_name: str
    route_long_name: str
    summary_statistics: Dict[str, Any]
    reliability_score: float
    stops_performance: List[RouteStopItem]
    weekday_performance: List[Dict[str, Any]]
    time_period_performance: List[Dict[str, Any]]
    trend_series: List[Dict[str, Any]]

class RouteSearchResult(BaseModel):
    route_id: str
    route_short_name: str
    route_long_name: str
    source_stop: str
    destination_stop: str
    intermediate_stops_count: int
    intermediate_stops: List[str]
    reliability_score: float
    average_delay_minutes: float
    on_time_percentage: float
