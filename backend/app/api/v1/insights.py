"""
Public Insights API Endpoint
"""
from fastapi import APIRouter, Depends
from backend.app.schemas.common import ResponseEnvelope
from backend.app.schemas.insights import PublicInsightsResponse
from backend.app.analysis.delay_analyzer import DelayAnalyzer
from backend.app.api.deps import get_analyzer

router = APIRouter()

@router.get("/insights", response_model=ResponseEnvelope[PublicInsightsResponse])
def get_public_insights(analyzer: DelayAnalyzer = Depends(get_analyzer)):
    """Returns dynamic, verified insights regarding best/worst performing routes, bottlenecks, and peak congestion."""
    insights = analyzer.generate_public_insights()
    return ResponseEnvelope(
        success=True,
        message="Public transit insights generated successfully",
        data=insights
    )
