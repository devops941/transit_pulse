# 🚌 TransitPulse @2026
### Public Bus Delay Intelligence & Route Reliability Analysis Platform — Madurai District (TNSTC)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB.svg?style=flat&logo=python)](https://www.python.org)
[![Tests](https://img.shields.io/badge/Tests-61%20Passed-success.svg?style=flat)](https://github.com/devops941/transit_pulse)
[![License](https://img.shields.io/badge/License-GODL--India-blue.svg?style=flat)](https://data.gov.in)

TransitPulse is a high-performance, open-access public transport analytics platform designed to analyze empirical bus arrival delays, corridor punctuality indices, and bus stop bottlenecks across **Madurai District (Tamil Nadu State Transport Corporation - TNSTC Madurai Division)**.

---

## 🌟 Key Features

- **Empirically Grounded Delay Metrics:** Delay is strictly computed as $\text{Delay} = \text{Actual Arrival Time} - \text{Scheduled Timetable}$. Zero mock or fabricated numbers.
- **Dedicated Presentation Landing Page & Command Dashboard:** Smooth UX gateway featuring a live bus moving & delay motion animation, followed by a command dashboard with a 6-portal analytics hub.
- **Modern Glassmorphic Left Sidebar (Side Navbar):** Frosted glass styling with real-time transit telemetry indicators and responsive mobile drawer.
- **Bidirectional Corridor Search:** Instant lookup between any origin and destination stops across both outbound and return services.
- **Stop Bottleneck Detection:** Stop-level latency accretion identifying choke points at critical junctions (Goripalayam, Simmakkal, Therku Vasal).
- **Head-to-Head Route Benchmarking:** Compare parallel transit corridors across median delay, variance, and 95th-percentile commuter buffer needs.
- **Audit-Ready Reports:** 1-Click generation of publication-quality PDF dossiers (ReportLab) and 5-sheet analytical Excel workbooks (OpenPyXL).

---

## 🚌 Madurai Bus Corridors Covered

| Route Number | Route Identifier | Corridor Name | Key Intersections |
| :---: | :---: | :--- | :--- |
| **77** | `TNSTC_77` | Periyar Central ⇄ Thirunagar | Palanganatham, Pykara, Pasumalai, Thirupparankundram |
| **48** | `TNSTC_48` | Mattuthavani MGR Terminus ⇄ Thirumangalam | K.K. Nagar, Anna Bus Stand, Goripalayam, Periyar |
| **70** | `TNSTC_70` | Mattuthavani MGR Terminus ⇄ Arapalayam | Anna Bus Stand, Goripalayam, Simmakkal |
| **23** | `TNSTC_23` | Periyar Central ⇄ Viraganoor Ring Road | Therku Vasal, Teppakulam, Velammal Hospital |
| **11** | `TNSTC_11` | Periyar Central ⇄ Othakadai / High Court | Simmakkal, Goripalayam, Tallakulam, K. Pudur |
| **3** | `TNSTC_3` | Mattuthavani ⇄ Villapuram / Avaniyapuram | Teppakulam, Therku Vasal, Avaniyapuram Market |
| **45** | `TNSTC_45` | Periyar Central ⇄ Alagar Kovil Foothills | Goripalayam, Tallakulam, K. Pudur, Appanthirupathi |
| **54** | `TNSTC_54` | Arapalayam ⇄ Vadipatti Bus Stand | Fatima College, Paravai Market, Samayanallur |
| **99** | `TNSTC_99` | Mattuthavani ⇄ Thoppur AIIMS Hospital | Viraganoor, Avaniyapuram, Madurai Airport Gate |
| **102** | `TNSTC_102` | Periyar Central ⇄ Sholavandan | Arapalayam, Nagamalai Pudukkottai, Samayanallur |

---

## 🛠️ Tech Stack & Architecture

```
TransitPulse/
├── backend/
│   ├── app/
│   │   ├── analysis/       # DelayAnalyzer (Pandas & NumPy analytical engine)
│   │   ├── api/v1/         # FastAPI REST routes (overview, routes, stops, compare, reports)
│   │   ├── database/       # SQLAlchemy ORM models, migrations & SQLite/Postgres seeders
│   │   ├── schemas/        # Pydantic v2 data envelopes and response models
│   │   └── services/       # ReportLab PDF & OpenPyXL Excel reporting generators
│   ├── datasets/           # Raw GTFS tables, cleaned valid telemetry (25,577 records)
│   └── tests/              # 61 automated test suites (100% passing)
├── frontend/
│   ├── src/
│   │   ├── components/     # Frosted glass cards, Sidebar, Navbar, BusDelayAnimation
│   │   ├── pages/          # LandingPage, DashboardPage, Routes, Stops, Compare, Analytics
│   │   └── styles/         # Glassmorphism & Transit Motion Design System
│   └── vite.config.js      # Vite build configuration with API reverse proxy
├── datasets/               # Direct root CSV datasets (valid, raw, quarantined observations)
├── run_backend.bat / .ps1  # 1-Click backend startup scripts
└── run_frontend.bat / .ps1 # 1-Click frontend startup scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Start Backend (Terminal 1)
```powershell
# From project root directory
.\run_backend.ps1
# Or using batch script
run_backend.bat
```
* **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Start Frontend (Terminal 2)
```powershell
# From project root directory
.\run_frontend.ps1
# Or manual
cd frontend && npm run dev
```
* **Web UI:** [http://localhost:5173](http://localhost:5173)

### 4. Run Test Suite
```powershell
$env:PYTHONPATH = (Get-Location).Path
python -m unittest discover -s backend/tests -p "test_*.py" -v
```

---

## 📄 License
This project complies with the **Government Open Data License (GODL) - India** for public transport GTFS timetables and open observational records.
