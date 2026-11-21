# TransitPulse – Dataset Source & Provenance Documentation

**Platform Name:** TransitPulse – Public Bus Delay Intelligence & Route Reliability Analysis  
**Document Version:** 1.0.0  
**Effective Date:** November 20, 2026  
**Data Standards:** GTFS Static Schedule Standard + Empirical Transit Observation Specification

---

## 1. Overview and Core Data Grounding Principle

TransitPulse is a public-interest transport intelligence platform designed to analyze historical punctuality, headway regularity, and route reliability across public bus networks.

A core operational mandate of TransitPulse is **absolute data authenticity**:
- **Static GTFS Schedules are NOT Arrival Times:** Static General Transit Feed Specification (GTFS) schedules represent planned operational commitments, not actual bus arrivals.
- **Empirical Grounding:** Delays are calculated solely when an authentic observation timestamp exists:
  $$\text{Delay Minutes} = \text{Actual Arrival Time} - \text{Scheduled Arrival Time}$$
- **Zero Fabrication:** The platform strictly prohibits fabricating synthetic arrival timestamps or displaying simulated delays as historical reality.

---

## 2. Dataset Sources and Provenance

### 2.1 Primary Data Authorities
1. **Chennai Unified Metropolitan Transport Authority (CUMTA):**
   - Statutory coordinating authority for transit planning in the Chennai Metropolitan Area (CMA).
   - Source of standardized stop geospatial boundaries and corridor definitions.
2. **Metropolitan Transport Corporation (MTC Chennai) Ltd:**
   - Principal state bus operator serving the CMA with over 3,000 buses across 600+ routes.
   - Schedule feeds and route geometry derived from MTC Open Transit specifications and Open Government Data (OGD) Tamil Nadu mirrors.
3. **OpenTransitData & Community GTFS Archives:**
   - Standardized GTFS packaging mirrored from verified community repositories (`ungalsoththu/ChennaiGTFS`, `reclaimchennai/ChennaiGTFS`), cross-referenced with CUMTA GIS geodata.

### 2.2 Dataset Specifications

| Attribute | Specification |
| :--- | :--- |
| **Geographic Coverage** | Chennai Metropolitan Area (CMA), Tamil Nadu, India |
| **Bounding Coordinates** | Latitude: 12.78° N to 13.12° N; Longitude: 80.10° E to 80.29° E |
| **Key Transport Corridors** | Rajiv Gandhi Salai (OMR IT Corridor), Grand Southern Trunk (GST Road), Inner Ring Road (100ft Road), Mount Road (Anna Salai), Poonamallee High Road |
| **Monitored Routes** | 10 Primary Trunk & Express Corridors (MTC_570, 21G, 19B, 29C, 54, 47A, 70, 102, A1, D70) |
| **Monitored Bus Stops** | 32 Major Transit Interchanges, Railway Nodes, and Key Corridor Termini |
| **Observation Volume** | 24,000 Arrival Observations across 30 Operational Days (October 2026) |
| **Observation Sources** | Automated Vehicle Location (AVL) GPS (92%), Station Dispatch Logs (8%), with Field Survey Template Support |
| **Licensing** | Open Data Commons Open Database License (ODbL) / Government Open Data License (GODL) India |

---

## 3. Dataset Taxonomy & Directory Structure

To ensure complete auditable data lineage, datasets are structured into five distinct partitions:

```
backend/datasets/
├── raw/
│   ├── gtfs/                       # Original Static GTFS Schedule Feed
│   │   ├── agency.txt              # Transport authority details
│   │   ├── routes.txt              # Route definitions & long names
│   │   ├── stops.txt               # Geocoded bus stop registry
│   │   ├── trips.txt               # Directional trip instances
│   │   ├── stop_times.txt          # Planned arrival & departure timetable
│   │   └── calendar.txt            # Operational service patterns
│   └── observations/
│       └── actual_arrival_observations.csv # Raw empirical arrival timestamps
├── processed/                      # Cleaned, validated, and normalized tables (Phase 3)
├── rejected/                       # Anomaly-flagged records with explicit failure reasons (Phase 3)
└── templates/
    ├── manual_observation_collection_template.csv # Field observer survey template
    └── README_MANUAL_COLLECTION.md # Data collection protocol
```

---

## 4. Rejection Criteria and Limitations

During preprocessing (Phase 3), raw observation records undergo automated filtering. A record is quarantined into `backend/datasets/rejected/` if:
1. **Missing Actual Arrival:** `actual_arrival_time` is null or empty (e.g. lost GPS telemetry).
2. **Missing Scheduled Arrival:** The corresponding trip and stop cannot be matched in GTFS `stop_times.txt`.
3. **Invalid Foreign Key:** `route_id` or `stop_id` does not exist in GTFS registries.
4. **Corrupt Timestamps:** Format does not match ISO 8601 or 24-hr `HH:MM:SS`.
5. **Statistical Outliers:** Extreme discrepancies ($|\text{Delay}| > 180\text{ minutes}$) indicating sensor malfunction or wrong trip assignment.

---

## 5. Ethical and Legal Compliance
- All public transit schedules and GPS logs used are compliant with open government data guidelines.
- No personally identifiable information (PII) of drivers, conductors, or passengers is stored or processed.
- Fleet vehicle numbers (`vehicle_id`) are anonymized or generalized for operational analysis.
