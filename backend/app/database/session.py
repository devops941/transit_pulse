"""
Database Engine & Session Management
Supports PostgreSQL for staging/production and SQLite for local development.
"""
import os
import logging
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from backend.app.core.config import settings
from backend.app.models.base import Base
# Import all models so metadata is complete
import backend.app.models

logger = logging.getLogger("transitpulse.database")

db_url = settings.DATABASE_URL

# Configure engine with appropriate dialect arguments
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        echo=False
    )
    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL configuration
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db() -> None:
    """Creates database schema tables if not already present."""
    logger.info("Initializing relational database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")

def get_db() -> Generator[Session, None, None]:
    """Dependency injection generator yielding isolated database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
