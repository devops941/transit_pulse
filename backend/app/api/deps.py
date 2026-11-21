"""
Shared API Dependencies
"""
from typing import Optional
from backend.app.analysis.delay_analyzer import DelayAnalyzer

_analyzer_instance: Optional[DelayAnalyzer] = None

def get_analyzer() -> DelayAnalyzer:
    """Returns singleton DelayAnalyzer instance, preventing repeated disk reads."""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = DelayAnalyzer()
    return _analyzer_instance
