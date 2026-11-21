"""
Analytics Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class DelaySummary(BaseModel):
    observation_count: int
    average_delay_minutes: Optional[float] = None
    median_delay_minutes: Optional[float] = None
    std_delay_minutes: Optional[float] = None
    min_delay_minutes: Optional[float] = None
    max_delay_minutes: Optional[float] = None
    percentiles: Dict[str, float] = {}
    on_time_percentage: Optional[float] = None
    delayed_percentage: Optional[float] = None
    early_percentage: Optional[float] = None
    date_range: Dict[str, Optional[str]] = {}

class WeekdayItem(BaseModel):
    day_of_week: str
    observation_count: int
    average_delay_minutes: Optional[float] = None
    median_delay_minutes: Optional[float] = None
    on_time_percentage: Optional[float] = None
    delayed_percentage: Optional[float] = None
    early_percentage: Optional[float] = None

class TimePeriodItem(BaseModel):
    time_period: str
    time_period_label: str
    observation_count: int
    average_delay_minutes: Optional[float] = None
    median_delay_minutes: Optional[float] = None
    on_time_percentage: Optional[float] = None
    delayed_percentage: Optional[float] = None
    early_percentage: Optional[float] = None

class TrendPoint(BaseModel):
    date: str
    observation_count: int
    average_delay_minutes: Optional[float] = None
    median_delay_minutes: Optional[float] = None
    on_time_percentage: Optional[float] = None
    delayed_percentage: Optional[float] = None

class DelayDistributionBin(BaseModel):
    bin_name: str
    count: int
    percentage: float

class DelayDistribution(BaseModel):
    total_observations: int
    bins: List[DelayDistributionBin]

class RouteComparisonMatrix(BaseModel):
    selected_routes_count: int
    routes: List[Dict[str, Any]]
    insights: Dict[str, Optional[str]]
