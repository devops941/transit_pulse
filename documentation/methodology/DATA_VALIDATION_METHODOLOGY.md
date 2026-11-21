# TransitPulse – Data Validation & Preprocessing Methodology

**Version:** 1.0.0  
**Effective Date:** November 20, 2026  
**Subject:** Transit Timetable Normalization, Empirical Arrival Verification, and Rejection Taxonomy

---

## 1. Grounding Principles & The Delay Formulation

TransitPulse models public bus arrival performance by strictly coupling static General Transit Feed Specification (GTFS) schedules with verified empirical arrival timestamps.

### 1.1 Delay Formulation
For any observed transit trip $i$ at bus stop $j$ on date $d$:

$$\text{Delay Minutes}(i, j, d) = \frac{T_{\text{actual}}(i, j, d) - T_{\text{scheduled}}(i, j, d)}{60}$$

Where:
- $T_{\text{actual}}(i, j, d)$ is the epoch timestamp (in seconds) of the vehicle arrival.
- $T_{\text{scheduled}}(i, j, d)$ is the scheduled timetable timestamp (in seconds) defined in GTFS `stop_times.txt`.

### 1.2 Delay Status Classification
Transit arrival punctuality is categorized using configurable thresholds:

$$\text{Status}(delay) = \begin{cases}
\text{EARLY}, & \text{if } delay < \theta_{\text{lower}} \quad (\text{default: } -1.0\text{ min}) \\
\text{ON\_TIME}, & \text{if } \theta_{\text{lower}} \le delay \le \theta_{\text{upper}} \quad (\text{default: } [-1.0, +5.0]\text{ min}) \\
\text{DELAYED}, & \text{if } delay > \theta_{\text{upper}} \quad (\text{default: } +5.0\text{ min})
\end{cases}$$

---

## 2. Overnight Trip Handling (> 24:00:00)

Transit timetables adhere to the GTFS convention where service operating past midnight is denoted by hour values $\ge 24$ (e.g., `25:30:00` represents `01:30:00` on the subsequent calendar day).

### Normalization Algorithm:
1. Parse time string components: $(H, M, S) = \text{split}(time\_str, ":")$.
2. Compute day overflow: $\Delta_{\text{days}} = \lfloor H / 24 \rfloor$.
3. Compute normalized hour: $H_{\text{norm}} = H \pmod{24}$.
4. Construct normalized calendar date: $\text{Date}_{\text{target}} = \text{Date}_{\text{base}} + \Delta_{\text{days}}$.
5. Compute timestamp: $\text{Datetime} = (\text{Date}_{\text{target}}, H_{\text{norm}}, M, S)$.

---

## 3. Rejection Taxonomy & Quarantining Protocol

Raw arrival logs are strictly quarantined into `backend/datasets/rejected/` whenever they violate data integrity rules:

| Rejection Code | Description | Consequence |
| :--- | :--- | :--- |
| `MISSING_ACTUAL_TIME` | Actual arrival timestamp is null, empty, or unrecorded (e.g. GPS drop). | Quarantined. Delay is never estimated or simulated. |
| `MISSING_SCHEDULED_TIME` | Scheduled arrival time is missing from the record. | Quarantined. |
| `INVALID_ROUTE_ID` | `route_id` does not exist in GTFS `routes.txt`. | Quarantined. |
| `INVALID_STOP_ID` | `stop_id` does not exist in GTFS `stops.txt`. | Quarantined. |
| `INVALID_TRIP_ID` | `trip_id` does not exist in GTFS `trips.txt`. | Quarantined. |
| `SCHEDULE_MISMATCH` | The `(trip_id, stop_id)` pair is not a valid sequence in `stop_times.txt`. | Quarantined. |
| `DUPLICATE_OBSERVATION` | Multiple logs exist for the exact same `(trip_id, stop_id, observation_date)`. | Quarantined to preserve unique observation weights. |
| `EXTREME_DELAY_ANOMALY` | Calculated delay $|delay| > 180\text{ minutes}$ ($> 3\text{ hours}$). | Quarantined as telemetry or manual transcription error. |

---

## 4. Diurnal & Temporal Partitioning

Observations are segmented into four standard operational windows:
- **Morning:** `06:00:00` to `10:59:59`
- **Afternoon:** `11:00:00` to `15:59:59`
- **Evening:** `16:00:00` to `20:59:59`
- **Night:** `21:00:00` to `05:59:59`
