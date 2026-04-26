# Functional Requirements Document (FRD)
**Project DRISHTI: Digital Refinery Intelligence & Safety Holistic Tracking Initiative**

## 1. System Overview
DRISHTI is a full-stack platform acting as an advisory layer over the refinery's Distributed Control System (DCS). It ingests real-time sensor data, processes it through ML models, and outputs prescriptive intelligence via a web dashboard.

## 2. Functional Requirements by Module

### 2.1 Authentication & Security
- **FR1.1:** The system shall restrict access via an administrative login wall.
- **FR1.2:** The system shall validate predefined credentials before granting access to the main operational dashboard.

### 2.2 Yield Optimization
- **FR2.1:** The system shall ingest live DCS data including Furnace Temp, Column Pressure, Reflux Ratio, and Feed Flow.
- **FR2.2:** The system shall calculate the predicted Diesel and Petrol quality indices using Ensemble Machine Learning models based on historical correlations.
- **FR2.3:** The system shall render an interactive 3D Response Surface Map indicating the absolute optimal profit zone based on the current tuning parameters.
- **FR2.4:** The system shall provide prescriptive text recommendations dynamically (e.g., "Increase furnace outlet temperature by +3°C for higher diesel yield").

### 2.3 Predictive Maintenance
- **FR3.1:** The system shall ingest equipment data representing mechanical stress (e.g., Pump Load %, Cooling Water Temp, Vibration Levels).
- **FR3.2:** The system shall calculate the Remaining Useful Life (RUL) in hours for tracked physical assets based on anomaly detection models.
- **FR3.3:** The system shall trigger a visual critical alert if any asset's RUL falls below the 72-hour risk threshold.

### 2.4 Benzene Safety
- **FR4.1:** The system shall ingest meteorological data (ambient temperature) and operational data (steam tracing flow).
- **FR4.2:** The system shall predict the surface temperature of 12 distinct pipeline segments over a 1200m distance.
- **FR4.3:** The system shall flag any segment dropping below the 5.5°C threshold as "High Risk" and issue a warning log.

### 2.5 Flare & ESG Tracking
- **FR5.1:** The system shall ingest upstream vessel pressure and current flare flow volumes.
- **FR5.2:** The system shall forecast the expected flare volume in 5-minute increments up to 30 minutes in the future using Time-Series Forecasting.
- **FR5.3:** The system shall dynamically recalculate and flatten the forecast curve in real-time based on the user's interaction with the "Recycle Valve" slider.

## 3. Data Interface Requirements
- **FR6.1:** The frontend platform shall poll the backend API for real-time monitoring updates at a standard interval (e.g., every 5 seconds).
- **FR6.2:** The system shall maintain the last known good state and display health indicators (e.g., DCS Connectivity, Sensor Status, Data Latency) to warn operators if data feeds are interrupted.
