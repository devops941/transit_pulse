"""
Health API Endpoint
"""
from datetime import datetime
from fastapi import APIRouter
from backend.app.schemas.common import ResponseEnvelope

router = APIRouter()

@router.get("/health", response_model=ResponseEnvelope[dict])
def health_check():
    """Returns platform operational health and timestamp."""
    return ResponseEnvelope(
        success=True,
        message="TransitPulse Analytics API operational",
        data={
            "status": "HEALTHY",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "environment": "production"
        }
    )
