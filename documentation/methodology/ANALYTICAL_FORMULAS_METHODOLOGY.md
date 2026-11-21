# TransitPulse – Analytical Formulas & Metric Methodology

**Platform:** TransitPulse – Public Bus Delay Intelligence & Route Reliability Analysis  
**Document Version:** 1.0.0  
**Effective Date:** November 20, 2026  
**Audience:** Public Users, Transport Planners, and Transit Data Researchers

---

## 1. Core Mathematical Formulations

TransitPulse calculates transit performance metrics strictly from verified observation records where both scheduled and empirical actual arrival timestamps are present.

### 1.1 Arrival Delay ($\Delta$)
For an observation with scheduled arrival timestamp $T_{\text{sched}}$ and actual arrival timestamp $T_{\text{actual}}$:

$$\Delta = \frac{T_{\text{actual}} - T_{\text{sched}}}{60} \quad (\text{minutes})$$

Where:
- $\Delta > 0$: Bus arrived behind schedule (delayed).
- $\Delta < 0$: Bus arrived ahead of schedule (early).
- $\Delta = 0$: Bus arrived precisely on schedule.

### 1.2 Delay Classification
Using standard transit operating tolerances:
- **On-Time:** $-1.0 \le \Delta \le 5.0$ minutes
- **Delayed:** $\Delta > 5.0$ minutes
- **Early:** $\Delta < -1.0$ minutes

---

## 2. Statistical Aggregations

Let $\{ \Delta_1, \Delta_2, \dots, \Delta_N \}$ be the valid delay values for a selected route, stop, or temporal window.

### 2.1 Average (Mean) Delay ($\bar{\Delta}$)
$$\bar{\Delta} = \frac{1}{N} \sum_{i=1}^N \Delta_i$$

### 2.2 Median Delay ($\tilde{\Delta}$)
$$\tilde{\Delta} = \text{Median}(\{ \Delta_1, \Delta_2, \dots, \Delta_N \})$$
The 50th percentile provides a robust central tendency metric that is resistant to single-event extreme traffic disruptions.

### 2.3 Sample Standard Deviation ($s$)
$$s = \sqrt{\frac{1}{N - 1} \sum_{i=1}^N (\Delta_i - \bar{\Delta})^2}$$
Measures schedule variance and headway unpredictability along the route corridor.

### 2.4 Percentile Delays ($p_{25}, p_{50}, p_{75}, p_{90}, p_{95}$)
- **$p_{75}$:** Upper quartile delay.
- **$p_{90}$ & $p_{95}$:** 90th and 95th percentile buffer delays, indicating the worst-case travel buffer passengers should budget during peak periods.

---

## 3. TransitPulse Route Reliability Score (RRS)

To provide public passengers with an intuitive, single-number rating of route punctuality, TransitPulse computes the **Route Reliability Score (RRS)** on a normalized $[0 - 100]$ scale:

$$\text{RRS} = \min\left(100, \max\left(0, W_1 \cdot \text{OnTime\%} + W_2 \cdot P_{\text{delay}} + W_3 \cdot P_{\text{variance}}\right)\right)$$

Where:
1. **On-Time Weight ($W_1 = 0.70$):**
   $$\text{Term}_{\text{ontime}} = 0.70 \times \text{OnTime\%}$$
2. **Delay Penalty ($W_2 = 0.20$):**
   $$P_{\text{delay}} = 100 - \min(\max(\bar{\Delta}, 0) \times 3.5, 100)$$
   $$\text{Term}_{\text{delay}} = 0.20 \times P_{\text{delay}}$$
3. **Variance Penalty ($W_3 = 0.10$):**
   $$P_{\text{variance}} = 100 - \min(\max(s, 0) \times 5.0, 100)$$
   $$\text{Term}_{\text{variance}} = 0.10 \times P_{\text{variance}}$$

### Interpretation of Scores:
- **85.0 – 100.0:** Excellent reliability. Route operates strictly on schedule with minimal headway variance.
- **70.0 – 84.9:** Good reliability. Minor delays during peak hours, generally predictable.
- **50.0 – 69.9:** Moderate reliability. Noticeable peak delays, travel buffers recommended.
- **Below 50.0:** Poor reliability. High congestion corridor with frequent significant delays.

---

## 4. Temporal and Dimensional Segmentations

### 4.1 Diurnal Windows (Time-of-Day)
- **Morning Peak & Off-Peak:** `06:00:00` to `10:59:59`
- **Afternoon (Midday):** `11:00:00` to `15:59:59`
- **Evening Peak:** `16:00:00` to `20:59:59`
- **Night:** `21:00:00` to `05:59:59`

### 4.2 Weekday Grouping
Observations are aggregated chronologically across Monday through Sunday to evaluate weekday rush-hour patterns versus weekend mobility profiles.

---

## 5. Statistical Significance Thresholds

To eliminate sample-size bias in public rankings:
- Routes or bus stops with fewer than $N < 5$ valid historical observations are excluded from reliability ranking tables and public insights, displaying an "Insufficient Observation Data" notice.
