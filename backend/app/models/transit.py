"""
TransitPulse Relational Database Models - Public Transit Entities
"""
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey,
    UniqueConstraint, Index, Text
)
from sqlalchemy.orm import relationship
from backend.app.models.base import Base

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    agency_id = Column(String(50), unique=True, nullable=False, index=True)
    agency_name = Column(String(255), nullable=False)
    agency_url = Column(String(255), nullable=True)
    agency_timezone = Column(String(50), default="Asia/Kolkata")
    agency_lang = Column(String(10), default="ta")
    agency_phone = Column(String(50), nullable=True)

    # Relationships
    routes = relationship("Route", back_populates="agency", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Agency {self.agency_id}: {self.agency_name}>"


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    route_id = Column(String(50), unique=True, nullable=False, index=True)
    agency_id = Column(String(50), ForeignKey("agencies.agency_id"), nullable=False, index=True)
    route_short_name = Column(String(50), nullable=False, index=True)
    route_long_name = Column(String(255), nullable=False)
    route_type = Column(Integer, default=3)  # 3 = Bus in GTFS
    route_color = Column(String(10), default="0055A5")
    route_text_color = Column(String(10), default="FFFFFF")

    # Relationships
    agency = relationship("Agency", back_populates="routes")
    trips = relationship("Trip", back_populates="route", cascade="all, delete-orphan")
    observations = relationship("ActualArrivalObservation", back_populates="route")

    def __repr__(self):
        return f"<Route {self.route_id} ({self.route_short_name})>"


class Stop(Base):
    __tablename__ = "stops"

    id = Column(Integer, primary_key=True, autoincrement=True)
    stop_id = Column(String(50), unique=True, nullable=False, index=True)
    stop_name = Column(String(255), nullable=False, index=True)
    stop_lat = Column(Float, nullable=True)
    stop_lon = Column(Float, nullable=True)
    zone_id = Column(String(50), nullable=True)

    # Relationships
    scheduled_stop_times = relationship("ScheduledStopTime", back_populates="stop")
    observations = relationship("ActualArrivalObservation", back_populates="stop")

    def __repr__(self):
        return f"<Stop {self.stop_id}: {self.stop_name}>"


class ServiceCalendar(Base):
    __tablename__ = "service_calendars"

    id = Column(Integer, primary_key=True, autoincrement=True)
    service_id = Column(String(50), unique=True, nullable=False, index=True)
    monday = Column(Boolean, default=True)
    tuesday = Column(Boolean, default=True)
    wednesday = Column(Boolean, default=True)
    thursday = Column(Boolean, default=True)
    friday = Column(Boolean, default=True)
    saturday = Column(Boolean, default=True)
    sunday = Column(Boolean, default=True)
    start_date = Column(String(10), nullable=False)
    end_date = Column(String(10), nullable=False)

    # Relationships
    trips = relationship("Trip", back_populates="service_calendar")

    def __repr__(self):
        return f"<ServiceCalendar {self.service_id}>"


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(String(50), unique=True, nullable=False, index=True)
    route_id = Column(String(50), ForeignKey("routes.route_id"), nullable=False, index=True)
    service_id = Column(String(50), ForeignKey("service_calendars.service_id"), nullable=False)
    trip_headsign = Column(String(255), nullable=True)
    direction_id = Column(Integer, default=0)

    # Relationships
    route = relationship("Route", back_populates="trips")
    service_calendar = relationship("ServiceCalendar", back_populates="trips")
    stop_times = relationship("ScheduledStopTime", back_populates="trip", cascade="all, delete-orphan")
    observations = relationship("ActualArrivalObservation", back_populates="trip")

    def __repr__(self):
        return f"<Trip {self.trip_id} on Route {self.route_id}>"


class ScheduledStopTime(Base):
    __tablename__ = "scheduled_stop_times"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(String(50), ForeignKey("trips.trip_id"), nullable=False, index=True)
    stop_id = Column(String(50), ForeignKey("stops.stop_id"), nullable=False, index=True)
    arrival_time = Column(String(10), nullable=False)   # HH:MM:SS
    departure_time = Column(String(10), nullable=False) # HH:MM:SS
    stop_sequence = Column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint("trip_id", "stop_sequence", name="uq_trip_stop_seq"),
        Index("ix_stop_times_trip_stop", "trip_id", "stop_id"),
    )

    # Relationships
    trip = relationship("Trip", back_populates="stop_times")
    stop = relationship("Stop", back_populates="scheduled_stop_times")

    def __repr__(self):
        return f"<StopTime {self.trip_id} at {self.stop_id} seq={self.stop_sequence}>"


class ActualArrivalObservation(Base):
    __tablename__ = "actual_arrival_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    observation_id = Column(String(50), unique=True, nullable=False, index=True)
    trip_id = Column(String(50), ForeignKey("trips.trip_id"), nullable=False, index=True)
    route_id = Column(String(50), ForeignKey("routes.route_id"), nullable=False, index=True)
    stop_id = Column(String(50), ForeignKey("stops.stop_id"), nullable=False, index=True)
    observation_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    
    scheduled_arrival_time = Column(String(10), nullable=False)
    actual_arrival_time = Column(String(10), nullable=False)
    delay_minutes = Column(Float, nullable=False, index=True)
    delay_status = Column(String(20), nullable=False, index=True)  # ON_TIME, DELAYED, EARLY
    
    time_period = Column(String(20), nullable=False, index=True)   # MORNING, AFTERNOON, EVENING, NIGHT
    day_of_week = Column(String(20), nullable=False, index=True)   # Monday, Tuesday, ...
    is_weekend = Column(Boolean, default=False)
    
    vehicle_id = Column(String(50), nullable=True)
    observation_source = Column(String(50), default="AVL_GPS")     # AVL_GPS, STATION_LOG, MANUAL_OBSERVER
    weather_condition = Column(String(50), default="CLEAR")        # CLEAR, RAIN, OVERCAST

    __table_args__ = (
        UniqueConstraint("trip_id", "stop_id", "observation_date", name="uq_obs_trip_stop_date"),
        Index("ix_obs_route_date", "route_id", "observation_date"),
        Index("ix_obs_stop_date", "stop_id", "observation_date"),
    )

    # Relationships
    trip = relationship("Trip", back_populates="observations")
    route = relationship("Route", back_populates="observations")
    stop = relationship("Stop", back_populates="observations")

    def __repr__(self):
        return f"<Obs {self.observation_id}: Route {self.route_id} Stop {self.stop_id} Delay={self.delay_minutes}m>"
