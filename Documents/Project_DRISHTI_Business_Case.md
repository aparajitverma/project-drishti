# Project DRISHTI: Business Case & Strategic Overview
**Digital Refinery Intelligence & Safety Holistic Tracking Initiative**

## Executive Summary
Project DRISHTI is a strategic, AI-powered initiative designed to transform refinery operations from reactive to predictive. By leveraging advanced machine learning and real-time sensor data, DRISHTI provides an intelligent control layer that sits above existing systems. The primary objective is to **maximize shareholder value** by consistently driving higher profit margins, eliminating costly unplanned downtimes, safeguarding physical assets, and ensuring strict compliance with Environmental, Social, and Governance (ESG) mandates.

This document outlines the strategic Problem-Solution-Value (PSV) framework for the platform, detailing the ML/AI concepts, data correlations, and system features that ensure clear alignment between technical capabilities and high-level business objectives.

---

## 1. Project Goals
- **Maximize Profitability:** Capture millions in previously lost margins by optimizing product yields (Diesel/Petrol) in real-time.
- **Ensure Asset Reliability:** Transition from schedule-based to predictive maintenance, targeting zero unplanned outages for critical rotating equipment.
- **Enhance Operational Safety:** Protect infrastructure from extreme weather conditions (e.g., Benzene pipeline freezing) through dynamic forecasting.
- **Guarantee ESG Compliance:** Proactively manage and mitigate flare gas emissions to avoid heavy regulatory fines and minimize the refinery's carbon footprint.

---

## 2. Problem-Solution-Value (PSV) & AI/ML Framework

The DRISHTI platform correlates massive volumes of both historical (training) data and live real-time sensor streams to power its intelligence.

### 2.1 Yield Optimization (Margin Capture)
* **Problem:** Traditional laboratory quality results arrive hours after the product is processed. This delay forces operators to run sub-optimal, overly conservative parameters, resulting in significant "margin leakage" every shift.
* **Solution:** DRISHTI deploys "Soft Sensors" that continuously infer final blend quality from intermediate thermal streams, instantly linking operational levers (Furnace Temp, Pressure) to their exact economic impact.
* **AI/ML Concepts:** The module uses **Ensemble Machine Learning** (e.g., Random Forests, Gradient Boosting). It correlates historical lab samples with live Distributed Control System (DCS) data to generate a dynamic 3D Response Surface.
* **Data Scenarios:** 
  * **Real-time Data:** Live Furnace Outlet Temperature, Column Pressure, Feed Flow Rate, and Reflux Ratio.
  * **Historical Data:** Past 3-5 years of lab quality reports matched with their corresponding process conditions.
* **Shareholder Value:** Guarantees that the plant operates at the absolute optimal economic point without risking off-spec product, directly increasing daily top-line revenue.

### 2.2 Predictive Maintenance (Asset Reliability)
* **Problem:** Unexpected failures of critical pumps or compressors force multi-day, multi-million-dollar unplanned outages and require carrying bloated, expensive spare parts inventories.
* **Solution:** The platform generates a dynamic "Remaining Useful Life" (RUL) curve for every critical asset, providing 48-to-72-hour early warnings for anomalies.
* **AI/ML Concepts:** Utilizes **Time-Series Anomaly Detection** and **Clustering Algorithms** (e.g., Autoencoders or DBSCAN). These models learn the "normal" operational signature of a machine and flag subtle deviations indicative of wear before catastrophic failure occurs.
* **Data Scenarios:**
  * **Real-time Data:** Live high-frequency vibration signals (mm/s), pump discharge pressures, and bearing temperatures.
  * **Historical Data:** Logs of past maintenance cycles, breakdown events, and degradation curves across the asset's lifecycle.
* **Shareholder Value:** Eliminates the catastrophic financial impact of unplanned downtime. It optimizes maintenance schedules and reduces the capital tied up in spare parts.

### 2.3 Benzene Safety (Winterization Guard)
* **Problem:** Benzene solidifies in pipelines at 5.5°C. During unpredictable winter cold snaps, this leads to extreme pipeline blockages, physical stress on the infrastructure, and highly expensive production halts.
* **Solution:** A thermal profile tracker that dynamically maps pipeline bottlenecks, alerting operators to route steam-tracing heat only where and when it is needed.
* **AI/ML Concepts:** Uses **Multivariate Regression Models** that correlate weather patterns with physical pipeline heat loss. The model forecasts near-future surface temperature drops across localized segments (1200m+).
* **Data Scenarios:**
  * **Real-time Data:** Live ambient temperatures, local wind chill sensors, and current steam tracing flow percentages.
  * **Historical Data:** Past winter records mapping the thermal inertia of specific pipeline segments against historical cold fronts.
* **Shareholder Value:** Guarantees process continuity during adverse weather. It prevents millions of dollars in potential physical damage while simultaneously optimizing steam-tracing energy costs.

### 2.4 Flare & ESG Tracker (Regulatory Conformance)
* **Problem:** Unplanned process disturbances cause excess gas to be purged via the flare system. This burns valuable hydrocarbon product and results in massive ESG penalties.
* **Solution:** The platform predicts flare drum overflows 30 minutes in advance, providing an intelligent recommendation to dynamically open gas recovery valves and reroute the gas.
* **AI/ML Concepts:** Leverages **Time-Series Forecasting** (e.g., ARIMA or LSTM Neural Networks). It identifies the specific upstream pressure wave patterns that statistically precede a flare event.
* **Data Scenarios:**
  * **Real-time Data:** Live upstream vessel pressures, compressor seal leak rates, and immediate background flaring volumes.
  * **Historical Data:** Historical process upset logs documenting the time delay between an upstream pressure spike and the subsequent flare relief valve opening.
* **Shareholder Value:** Directly avoids crippling regulatory fines and improves the company's ESG standing. It recovers volatile gas back into the system to be processed and sold, turning a liability into revenue.

---

## 3. Project Scope

**In-Scope:**
- Deployment of the DRISHTI backend predictive engine (FastAPI/Python) integrated with simulated or live DCS (Distributed Control System) data.
- Implementation of the high-performance Executive & Operator Dashboard (React/Vite) with interactive 3D visualizations.
- Continuous monitoring of the four core modules: Yield Optimizer, Predictive Maintenance, Benzene Safety, and Flare Tracking.

---

## 4. High-Level Requirements & System Features

### 4.1 Business & Operational Features
- **Executive Financial Dashboard:** The platform visually translates complex multi-variable engineering data into clear, financially-focused metrics (e.g., displaying "Net Margin Uplift" and "Daily Profit Impact").
- **Prescriptive Intelligence:** Rather than simply alerting operators to issues, the system calculates and recommends specific, actionable tuning parameters (e.g., "Reduce furnace delta by 2°C to move back below caution limit").
- **Dynamic Risk Adjustment:** The platform allows operators to simulate changes (like increasing pump load) and immediately see the shifted risk profile before making physical changes.

### 4.2 Technical System Capabilities
- **Millisecond ML Inference:** The backend engine continuously streams high-frequency data and executes machine learning inferences rapidly, providing truly "live" operational feedback.
- **Interactive 3D Topology:** The frontend utilizes advanced charting libraries (Plotly.js) to map multi-dimensional quality response surfaces, giving engineers a visual understanding of the "sweet spot" for optimization.
- **Role-Based Access Control:** The platform operates securely behind administrative walls, ensuring that only authorized personnel can initialize systems or access critical forecasting intelligence.

---

## Conclusion
Project DRISHTI is not merely an IT upgrade; it is a fundamental shift toward an AI-driven, high-margin operational model. By adopting this Problem-Solution-Value framework and correlating historical data with real-time ML intelligence, the refinery will maximize its physical asset yields, ensure regulatory safety, and ultimately deliver superior, sustainable returns to shareholders.
