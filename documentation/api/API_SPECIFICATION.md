# TransitPulse – REST API Specification

**Service:** TransitPulse Analytics Engine  
**Version:** 1.0.0  
**Base URL:** `/api`  
**OpenAPI Docs:** `/docs` (Swagger UI) and `/redoc` (ReDoc)  
**Response Envelope:** All standard responses are wrapped in a uniform JSON envelope:
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... },
  "meta": { ... }
}
```

---

## 1. System & Health Endpoints

### 1.1 `GET /api/health`
Checks backend service availability and timestamp.
- **Response:**
  ```json
  {
    "success": true,
    "message": "TransitPulse Analytics API operational",
    "data": {
      "status": "HEALTHY",
      "timestamp": "2026-11-20T18:15:00.000",
      "version": "1.0.0"
    }
  }
  ```

### 1.2 `GET /api/overview`
Retrieves aggregated macro KPIs for the public landing page.
- **Response:**
  - `total_valid_observations`: Number of verified records.
  - `monitored_routes_count`: Count of active corridors.
  - `monitored_stops_count`: Count of monitored transit nodes.
  - `system_average_delay_minutes`: Overall average delay.
  - `system_on_time_percentage`: Overall on-time performance rate.
  - `top_reliable_routes`: Top 3 routes ranked by reliability score.
  - `most_delayed_routes`: Top 3 corridors with highest delays.
  - `top_bottleneck_stops`: Top 3 bus stops with highest arrival delays.

---

## 2. Bus Routes Endpoints

### 2.1 `GET /api/routes`
Lists all transit routes with summary metrics and reliability ranks.
- **Query Parameters:**
  - `sort_by` (optional, default: `reliability_score`): `reliability_score`, `average_delay_minutes`, `route_short_name`.
  - `order` (optional, default: `desc`): `asc`, `desc`.

### 2.2 `GET /api/routes/{route_id}`
Detailed analytical profile for a single route corridor.
- **Path Parameters:**
  - `route_id` (e.g. `MTC_570`)
- **Returns:**
  - `summary_statistics`: Mean, median, std, percentiles (p25, p50, p75, p90, p95).
  - `reliability_score`: Composite reliability rating [0-100].
  - `stops_performance`: Stop-by-stop arrival delay breakdown.
  - `weekday_performance`: Monday–Sunday punctuality distribution.
  - `time_period_performance`: Morning, Afternoon, Evening, Night breakdown.
  - `trend_series`: Longitudinal daily performance.

### 2.3 `GET /api/routes/{route_id}/reliability`
Concise reliability scoring dossier with tier classification (`EXCELLENT`, `GOOD`, `MODERATE`, `POOR`) and statistical sample confidence rating.

### 2.4 `GET /api/routes/{route_id}/stops`
Sequential list of stops along the route corridor with individual arrival metrics and coordinates.

### 2.5 `GET /api/routes/search/query`
Origin-to-destination route finder from verified timetable stops.
- **Query Parameters:**
  - `source_stop_id` (e.g. `ST_CMBT`)
  - `dest_stop_id` (e.g. `ST_KELAMBAKKAM`)
- **Returns:**
  Matching routes serving both stops in chronological sequence with intermediate stops count and reliability metrics.

---

## 3. Bus Stops Endpoints

### 3.1 `GET /api/stops`
Lists bus stops with historical congestion metrics and connected routes.
- **Query Parameters:**
  - `search` (optional): Filter by stop name or identifier.
  - `sort_by` (optional, default: `average_delay_minutes`): `average_delay_minutes`, `observation_count`, `stop_name`.

### 3.2 `GET /api/stops/{stop_id}`
Comprehensive congestion dossier for an individual stop, including connected routes, weekday metrics, and recent arrival observation samples.

---

## 4. Multi-Dimensional Analytics Endpoints

### 4.1 `GET /api/analytics/delay`
Multi-filter delay query engine.
- **Query Parameters:**
  - `route_id`, `stop_id`, `start_date`, `end_date`, `weekday`, `time_period`.

### 4.2 `GET /api/analytics/weekday`
Monday through Sunday performance trends.

### 4.3 `GET /api/analytics/time-period`
Diurnal breakdown: Morning (06:00-11:00), Afternoon (11:00-16:00), Evening (16:00-21:00), Night (21:00-06:00).

### 4.4 `GET /api/analytics/trends`
Daily time-series of average delays, median delays, and trip counts.

### 4.5 `GET /api/analytics/comparison`
Side-by-side comparative matrix.
- **Query Parameters:**
  - `routes` (required, comma-separated, e.g. `MTC_570,MTC_21G,MTC_29C`).

### 4.6 `GET /api/analytics/distribution`
Histogram bin counts for Plotly visualizer (`Early`, `On-Time`, `Minor Delay`, `Moderate Delay`, `Major Delay`, `Severe Delay`).

---

## 5. Public Insights & Reports

### 5.1 `GET /api/insights`
Dynamically synthesized plain-English insights (most reliable route, worst delayed route, top bottleneck stop, peak delay weekday, peak time window).

### 5.2 `GET /api/reports/summary`
Structured exportable summary for PDF and Excel generation.
- **Query Parameters:**
  - `route_id` (optional): Filter to individual route dossier or return network-wide summary.
