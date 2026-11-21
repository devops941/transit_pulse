"""
Dynamic Public Insights Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class InsightItem(BaseModel):
    category: str
    title: str
    route_id: Optional[str] = None
    route_short_name: Optional[str] = None
    route_long_name: Optional[str] = None
    stop_id: Optional[str] = None
    stop_name: Optional[str] = None
    day_of_week: Optional[str] = None
    time_period: Optional[str] = None
    time_period_label: Optional[str] = None
    reliability_score: Optional[float] = None
    on_time_percentage: Optional[float] = None
    average_delay_minutes: Optional[float] = None
    delayed_percentage: Optional[float] = None
    routes_served_count: Optional[int] = None
    detail: str

class PublicInsightsResponse(BaseModel):
    overall_summary: Dict[str, Any]
    insights: List[InsightItem]
    commuter_advisories: Optional[List[Dict[str, Any]]] = None
