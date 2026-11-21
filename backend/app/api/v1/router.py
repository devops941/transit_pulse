"""
API v1 Router Mount
"""
from fastapi import APIRouter
from backend.app.api.v1 import (
    health,
    overview,
    routes,
    stops,
    analytics,
    insights,
    reports
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(overview.router, tags=["Overview"])
api_router.include_router(routes.router, tags=["Routes"])
api_router.include_router(stops.router, tags=["Stops"])
api_router.include_router(analytics.router, tags=["Analytics"])
api_router.include_router(insights.router, tags=["Insights"])
api_router.include_router(reports.router, tags=["Reports"])
