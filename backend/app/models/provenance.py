"""
TransitPulse Relational Database Models - Provenance & Audit Entities
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.models.base import Base

class DatasetSource(Base):
    __tablename__ = "dataset_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_code = Column(String(50), unique=True, nullable=False, index=True)
    authority_name = Column(String(255), nullable=False)
    geographic_coverage = Column(String(255), nullable=False)
    license_type = Column(String(100), nullable=False)
    source_url = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    import_history = relationship("DataImportHistory", back_populates="dataset_source")

    def __repr__(self):
        return f"<DatasetSource {self.source_code}: {self.authority_name}>"


class DataImportHistory(Base):
    __tablename__ = "data_import_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    import_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    source_code = Column(String(50), ForeignKey("dataset_sources.source_code"), nullable=False, index=True)
    raw_records_count = Column(Integer, default=0)
    valid_records_count = Column(Integer, default=0)
    rejected_records_count = Column(Integer, default=0)
    status = Column(String(20), default="SUCCESS")  # SUCCESS, FAILED
    notes = Column(Text, nullable=True)

    # Relationships
    dataset_source = relationship("DatasetSource", back_populates="import_history")

    def __repr__(self):
        return f"<DataImportHistory {self.id} on {self.import_timestamp} status={self.status}>"
