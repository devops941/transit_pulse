# TransitPulse – Database Design & Schema Specification

**Platform:** TransitPulse – Public Bus Delay Intelligence & Route Reliability Analysis  
**Version:** 1.0.0  
**Effective Date:** November 21, 2026  
**ORM:** SQLAlchemy 2.0+  
**Migrations:** Alembic  
**Dialect Compatibility:** PostgreSQL (Staging / Production), SQLite (Local Development)

---

## 1. Entity-Relationship Architecture

```mermaid
erDiagram
    DatasetSource ||--o{ DataImportHistory : "audits"
    Agency ||--o{ Route : "operates"
    Route ||--o{ Trip : "schedules"
    ServiceCalendar ||--o{ Trip : "governs"
    Trip ||--o{ ScheduledStopTime : "defines"
    Stop ||--o{ ScheduledStopTime : "located_at"
    Trip ||--o{ ActualArrivalObservation : "monitors"
    Route ||--o{ ActualArrivalObservation : "aggregates"
    Stop ||--o{ ActualArrivalObservation : "records"

    DatasetSource {
        int id PK
        string source_code UK
        string authority_name
        string geographic_coverage
        string license_type
        string source_url
        text description
    }

    Agency {
        int id PK
        string agency_id UK
        string agency_name
        string agency_url
        string agency_timezone
        string agency_lang
        string agency_phone
    }

    Route {
        int id PK
        string route_id UK
        string agency_id FK
        string route_short_name
        string route_long_name
        int route_type
        string route_color
        string route_text_color
    }

    Stop {
        int id PK
        string stop_id UK
        string stop_name
        float stop_lat
        float stop_lon
        string zone_id
    }

    ServiceCalendar {
        int id PK
        string service_id UK
        boolean monday
        boolean tuesday
        boolean wednesday
        boolean thursday
        boolean friday
        boolean saturday
        boolean sunday
        string start_date
        string end_date
    }

    Trip {
        int id PK
        string trip_id UK
        string route_id FK
        string service_id FK
        string trip_headsign
        int direction_id
    }

    ScheduledStopTime {
        int id PK
        string trip_id FK
        string stop_id FK
        string arrival_time
        string departure_time
        int stop_sequence
    }

    ActualArrivalObservation {
        int id PK
        string observation_id UK
        string trip_id FK
        string route_id FK
        string stop_id FK
        string observation_date
        string scheduled_arrival_time
        string actual_arrival_time
        float delay_minutes
        string delay_status
        string time_period
        string day_of_week
        boolean is_weekend
        string vehicle_id
        string observation_source
        string weather_condition
    }

    DataImportHistory {
        int id PK
        datetime import_timestamp
        string source_code FK
        int raw_records_count
        int valid_records_count
        int rejected_records_count
        string status
        text notes
    }
```

---

## 2. Relational Table Definitions

### 2.1 `dataset_sources`
Tracks data provenance, authority jurisdiction, and open data licensing.
- `source_code`: Unique identifier (e.g., `CUMTA_MTC_2026`).
- `license_type`: E.g., `Government Open Data License (GODL) India`.

### 2.2 `agencies`
Transit operator metadata (Metropolitan Transport Corporation Ltd).

### 2.3 `routes`
Corridor information:
- `route_id`: E.g., `MTC_570`, `MTC_21G`.
- `route_short_name`: Public corridor number (`570`, `21G`, `47A`).
- `route_long_name`: Origin and terminus descriptor.

### 2.4 `stops`
Physical stop coordinates and naming.

### 2.5 `trips` & `scheduled_stop_times`
Timetable definitions with sequence numbers and planned arrival times.
- `uq_trip_stop_seq`: UniqueConstraint preventing duplicate sequences within a single trip.

### 2.6 `actual_arrival_observations`
Empirical observation records with calculated delay minutes and categorizations.
- `uq_obs_trip_stop_date`: UniqueConstraint preventing duplicate arrival logs for the same trip, stop, and calendar date.
- Indexes: `ix_obs_route_date`, `ix_obs_stop_date`, `delay_minutes`, `delay_status`, `time_period`.

### 2.7 `data_import_history`
Audit trail of ETL imports, valid counts, and quarantined anomaly counts.

---

## 3. Database Migration & Alembic Execution

- **Alembic Configuration:** [`backend/alembic.ini`](file:///D:/collegeprojects/TransitPulse/backend/alembic.ini)
- **Initial Migration:** [`backend/alembic/versions/001_initial_transitpulse_schema.py`](file:///D:/collegeprojects/TransitPulse/backend/alembic/versions/001_initial_transitpulse_schema.py)
- **Seeder Script:** [`backend/app/database/seed_db.py`](file:///D:/collegeprojects/TransitPulse/backend/app/database/seed_db.py)
