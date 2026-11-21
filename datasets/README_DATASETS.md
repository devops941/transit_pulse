# TransitPulse - Madurai District Datasets Directory

This folder contains the complete CSV datasets specifically generated, cleaned, and analyzed for **Madurai District Public Bus Transport (TNSTC - Madurai Division)**.

---

## 📁 CSV Files in this Folder

| File Name | File Size | Description | Record Count |
| :--- | :--- | :--- | :--- |
| **`valid_observations_madurai.csv`** | ~7.4 MB | Cleaned, validated delay observations ready for analytics and reporting | **25,577 records** |
| **`actual_arrival_observations_madurai.csv`** | ~2.9 MB | Raw empirical bus arrival telemetry records across Madurai routes | **26,040 records** |
| **`rejected_observations_madurai.csv`** | ~87 KB | Quarantined anomalous/outlier records (missing timestamps, impossible speeds) | **463 records** |

---

## 🚌 Madurai Bus Corridors Covered

- **Route 77**: Periyar Bus Stand ⇄ Thirunagar Bus Stand (via Palanganatham, Pykara, Pasumalai, Thirupparankundram)
- **Route 48**: Mattuthavani MGR Bus Stand ⇄ Thirumangalam Bus Stand
- **Route 70**: Mattuthavani ⇄ Arapalayam Bus Stand (via Anna Bus Stand, Goripalayam)
- **Route 23**: Periyar Bus Stand ⇄ Viraganoor Ring Road (via Therku Vasal, Teppakulam)
- **Route 11**: Periyar Bus Stand ⇄ Othakadai (via Simmakkal, Goripalayam, K.K. Nagar, Mattuthavani)
- **Route 3**: Mattuthavani ⇄ Villapuram
- **Route 45**: Periyar Bus Stand ⇄ Alagar Kovil
- **Route 54**: Arapalayam ⇄ Vadipatti
- **Route 99**: Mattuthavani ⇄ AIIMS Thoppur
- **Route 102**: Periyar Bus Stand ⇄ Sholavandan

---

## 🏛️ Key Bus Stops Covered (32 Madurai Stops)
- `ST_MDU_PERIYAR` - Periyar Central Bus Stand
- `ST_MDU_MATTUTHAVANI` - Mattuthavani MGR Integrated Bus Terminus
- `ST_MDU_ARAPALAYAM` - Arapalayam Bus Stand
- `ST_MDU_GORIPALAYAM` - Goripalayam Junction
- `ST_MDU_SIMMAKKAL` - Simmakkal Bus Stop
- `ST_MDU_TEPPAKULAM` - Teppakulam Bus Stop
- `ST_MDU_THIRUPPARANKUNDRAM` - Thirupparankundram Temple Stop
- `ST_MDU_PALANGANATHAM` - Palanganatham Roundana
- ... and 24 other major intersections and stops across Madurai.

---

## 📊 CSV Column Definitions
- `observation_id`: Unique identifier for each arrival observation.
- `route_id`: Corresponds to GTFS route identifier (e.g., `TNSTC_77`).
- `route_short_name`: Public bus number displayed to commuters (e.g., `77`, `48`).
- `trip_id`: Trip identifier denoting specific schedule run.
- `stop_id`: Geocoded stop identifier (e.g., `ST_MDU_PERIYAR`).
- `stop_name`: Official name of the bus stop.
- `scheduled_arrival_time`: Timetable scheduled arrival timestamp (GTFS standard).
- `actual_arrival_time`: Empirical arrival timestamp recorded by telemetry/collector.
- `delay_minutes`: $\text{Actual Arrival Time} - \text{Scheduled Arrival Time}$. Negative = Early, 0 = On Time, Positive = Delayed.
- `delay_status`: Classified as `ON_TIME` ($\le 5\text{ min}$), `SLIGHT_DELAY` ($5\text{--}15\text{ min}$), `MODERATE_DELAY` ($15\text{--}30\text{ min}$), or `SEVERE_DELAY` ($> 30\text{ min}$).
