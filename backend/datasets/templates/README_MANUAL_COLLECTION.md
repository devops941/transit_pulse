# TransitPulse - Manual Observation Collection Guide

This guide describes how field surveyors, transit researchers, and passengers can log empirical bus arrival observations for ingestion into the TransitPulse analytics platform.

---

## 1. Objective

TransitPulse strictly maintains that **static scheduled times are not actual arrival times**.
To calculate real delay, the platform requires empirical arrival observations collected via Automated Vehicle Location (AVL) GPS feeds, station dispatcher logs, or verified manual field observations.

$$\text{Delay Minutes} = \text{Actual Arrival Time} - \text{Scheduled Arrival Time}$$

---

## 2. File Format and Column Definitions

Submissions must adhere to the comma-separated format provided in `manual_observation_collection_template.csv`.

| Column | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `observation_id` | String | Yes | Unique identifier for the observation record | `OBS_MAN_20261120_001` |
| `trip_id` | String | Yes | Scheduled Trip ID from GTFS schedule | `TRIP_MTC_570_03` |
| `route_id` | String | Yes | Valid Route ID corresponding to GTFS | `MTC_570` |
| `stop_id` | String | Yes | Valid Stop ID corresponding to GTFS | `ST_CMBT` |
| `scheduled_arrival_time` | String (HH:MM:SS) | Yes | Time the bus was scheduled to arrive (24-hr format) | `08:00:00` |
| `actual_arrival_time` | String (HH:MM:SS) | Yes | Empirical time the bus arrived at the stop | `08:05:40` |
| `observation_date` | String (YYYY-MM-DD) | Yes | Date the observation was logged | `2026-11-20` |
| `vehicle_id` | String | No | Registration plate or vehicle fleet number | `TN-01-N-4215` |
| `observation_source` | String | Yes | Must be `MANUAL_OBSERVER`, `STATION_LOG`, or `AVL_GPS` | `MANUAL_OBSERVER` |
| `weather_condition` | String | No | `CLEAR`, `OVERCAST`, `RAIN`, or `HEAVY_RAIN` | `CLEAR` |
| `observer_notes` | String | No | Optional contextual remarks (accidents, boarding crowds) | `Heavy passenger queue at bay 4` |

---

## 3. Data Integrity Rules

1. **Stop Alignment:** The `stop_id` must match a verified stop in `stops.txt`.
2. **Time Precision:** Log actual arrival in standard 24-hour format (`HH:MM:SS`). Arrival is defined as the moment the bus comes to a complete halt at the boarding bay.
3. **Missing Arrivals:** If a scheduled bus did not arrive or the surveyor could not observe the trip, leave `actual_arrival_time` blank or omit the record. The validation pipeline will safely identify and categorize unobserved trips without fabricating fake delay values.
4. **Encoding:** Save files in UTF-8 with standard comma separation.
