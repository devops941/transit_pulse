"""
Common Pydantic Schemas & Generic API Response Wrappers
"""
from typing import Generic, TypeVar, Optional, List, Any, Dict
from pydantic import BaseModel, Field

T = TypeVar("T")

class ResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: Optional[T] = None
    meta: Optional[Dict[str, Any]] = None

class PaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int

class DateRangeFilter(BaseModel):
    start_date: Optional[str] = Field(None, description="Start date YYYY-MM-DD")
    end_date: Optional[str] = Field(None, description="End date YYYY-MM-DD")
