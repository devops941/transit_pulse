"""
Stop Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class StopSummary(BaseModel):
    stop_id: str
    stop_name: str
    stop_lat: Optional[float] = None
    stop_lon: Optional[float] = None
    observation_count: int
    average_delay_minutes: float
    median_delay_minutes: float
    std_delay_minutes: float
    on_time_percentage: float
    delayed_percentage: float
    routes_served: List[str]
    routes_count: int

class StopDetail(BaseModel):
    stop_id: str
    stop_name: str
    stop_lat: Optional[float] = None
    stop_lon: Optional[float] = None
    summary_statistics: Dict[str, Any]
    routes_served: List[str]
    routes_count: int
    weekday_performance: List[Dict[str, Any]]
    time_period_performance: List[Dict[str, Any]]
    recent_observations_sample: List[Dict[str, Any]]
