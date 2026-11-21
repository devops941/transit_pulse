# TRANSITPULSE
*Public Bus Delay Intelligence & Route Reliability Analysis Platform — Madurai District (TNSTC)*

---

### PROJECT OVERVIEW
**TRANSITPULSE** is a full-stack public transit analytics and delay intelligence platform designed for commuters and urban transport researchers in Madurai District. Grounded on 25,500+ verified historical arrival records across 10 high-frequency TNSTC bus corridors and 32 bus stops, it computes empirical delay deviations ($\text{Delay} = \text{Actual Arrival Time} - \text{Scheduled Timetable}$) with strictly zero simulated data. The platform provides transparent route punctuality rankings, bus stop congestion accretion heatmaps, bidirectional route discovery, interactive Plotly visualizations, and 1-click audit-ready PDF/Excel dossiers.

---

### PROBLEM STATEMENT
Static public bus timetables (GTFS) define planned schedules but fail to reflect real-world road congestion, peak-hour bottlenecks, and junction delays. Commuters frequently face unpredictable wait times without knowing the necessary departure buffer, while transit planners lack stop-level delay accretion visibility. Furthermore, existing transit portals often gate delay information behind passenger logins or present synthetic mock delays. TRANSITPULSE solves this by providing open, login-free, empirically verified delay intelligence and corridor reliability analytics.

---

### PROJECT OBJECTIVES
* Quantify empirical bus arrival delays across Madurai corridors based on verified open transit records ($\text{GODL}$ compliance).
* Identify critical bottleneck stops (e.g., Goripalayam, Simmakkal, Therku Vasal) experiencing severe delay accretion.
* Provide an interactive bidirectional corridor search supporting both outbound and return transit services.
* Compute dynamic commuter advisories, optimal travel windows, and 95th-percentile ($\text{P95}$) commuter safety buffers.
* Stream publication-quality PDF executive briefs and 5-sheet OpenPyXL analytical Excel workbooks for researchers.

---

### KEY MODULES & FEATURES
* **Presentation Landing Page & Live Transit Motion:** Features a real-time animated bus moving along a transit track with dynamic time delay accretion ($+0\text{m} \rightarrow +16\text{m}$).
* **Left Glassmorphic Side Navbar & Command Dashboard:** Adaptive navigation featuring an interactive 6-portal analytics exploration hub.
* **Bidirectional Corridor & Stop Finder:** Instant lookup connecting any two stops in outbound or return directions with delay minutes and on-time percentages.
* **Corridor Reliability Dossier:** Detailed route analysis featuring stop-by-stop delay accretion tables, percentile distributions ($\text{P25}$ to $\text{P95}$), and peak vs off-peak comparisons.
* **Bus Stop Congestion Explorer:** Micro-level analysis across 32 geocoded Madurai bus stands displaying recent arrival observations and delay categories.
* **Head-to-Head Route Benchmarking:** Direct comparative analysis evaluating parallel routes across punctuality, standard deviation, and delay variance.
* **Dynamic Commuter Intelligence:** Automated heuristic advisories delivering optimal departure tips, buffer minutes, and congestion alerts.
* **1-Click Audit-Ready Reporting:** Automated generation of multi-page ReportLab PDF dossiers (embedded charts) and multi-sheet Excel workbooks.

---

### TECHNOLOGY STACK
* **Frontend:** React 18, Vite 6, React-Bootstrap 2.10, Lucide Icons, Plotly.js
* **Backend:** Python 3.12, FastAPI, Uvicorn (Asynchronous ASGI Architecture)
* **Database & ORM:** SQLite / PostgreSQL, SQLAlchemy 2.0 ORM, Alembic Migrations (9 Relational Tables)
* **Analytics Engine:** Pandas, NumPy (Mathematical Delay Normalization & Quarantine Engine)
* **Reporting Services:** ReportLab (PDF with `NumberedCanvas`), OpenPyXL (Excel Data Workbooks), Matplotlib
* **Testing & Quality Assurance:** Python Unittest (61 Automated Test Suites — 100% Passed)
* **Design System:** Custom Modern Glassmorphism with Dynamic Ambient Lighting Blobs & Transit Motion CSS

---

### PROJECT LINKS & DETAILS
* **GitHub Repository:** [https://github.com/devops941/transit_pulse](https://github.com/devops941/transit_pulse)
* **Web Application URL:** `http://localhost:5173`
* **Interactive API Documentation:** `http://localhost:8000/docs`
* **Domain:** Intelligent Transportation Systems (ITS) / Urban Mobility Analytics
* **Application Type:** Full-Stack Web Analytics Platform
