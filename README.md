# Project DRISHTI Overview

**Digital Refinery Intelligence & Safety Holistic Tracking Initiative**

---

## What is Project DRISHTI?
Project DRISHTI is an advanced, AI/ML-driven full-stack simulation dashboard designed to provide actionable intelligence, optimize process yield, enforce process safety, and track Environmental, Social, and Governance (ESG) compliance for modern oil refineries. By utilizing simulated refinery sensor streams and machine learning logic, the application allows operators and executives to visualize predictive events and intervene *before* they manifest physically in operations.

## System Architecture
The application leverages a robust full-stack architecture tailored for high-frequency data calculation and display:

- **Backend (`/backend`)**: A Python-based **FastAPI** server that simulates downstream distillation operation data. It manages the mathematical models for equipment degradation routines, predictive timeseries forecasting, multi-variable logic limits, and real-time response generation.
- **Frontend (`/frontend`)**: A **React + TypeScript** web application (bundled by Vite) that serves as the operator control board. It leverages **Plotly.js** for high-performance interactive 2D/3D data visualization, ensuring that predictive graphing responds seamlessly to interactive sliders.

---

## Core Modules & AI Interventions

### 1. Yield Optimizer
A multi-tab command interface simulating the primary crude unit.
- **Problem**: Laboratory results arrive too late to act on margin seepage, resulting in sub-optimal operations between tests.
- **Solution**: Evaluates soft-sensor outputs to predict Diesel and Petrol quality in real-time, matching them securely against dynamic economic sliders for Furnace delta, Reflux Ratio, and Column Pressure.
- **AI/ML Impact**: ML models drive a complex 3D Response Surface Heatmap that isolates the absolute optimal efficiency point for max margin capture without triggering an off-spec risk.

### 2. Predictive Maintenance (AI Equipment Reliability Center)
- **Problem**: Unexpected process-pump or compressor failures force multi-day unplanned outages.
- **Solution**: Tracks pump loads, cooling water temperatures, and vibration logs to extrapolate a Remaining Useful Life (RUL) curve.
- **AI/ML Impact**: Anomaly detection and time-series clustering isolate subtle machine wear. Operators can run practical simulations (e.g., increasing `Pump Load by 15%`) to visually observe the shifted risk-failure threshold before scheduling an overhaul shutdown within a 72-hour window.

### 3. Benzene Safety (Winterization Guard)
- **Problem**: Benzene inherently freezes in long-run transfer pipes if temperatures drop below 5.5°C during cold fronts, leading to devastating blockages.
- **Solution**: Aggregates a dynamic representation of Ambient vs Pipe Surface temperatures over localized pipeline segments (1200m+).
- **AI/ML Impact**: Employs weather-based regression models to simulate cold snaps, issuing alerts before physical conditions meet freezing parameters. Operators interact with Steam Tracing adjustments to guarantee temperatures are held above critical thresholds.

### 4. Flare & ESG Tracker (Conformance Guardian)
- **Problem**: Unplanned gas purges overwhelm the routing systems, resulting in heavy relief flaring, massive CO2e penalties, and lost chemical product.
- **Solution**: Provides continuous ML forecasting models observing minor surges in upstream buffering vessels.
- **AI/ML Impact**: Cross-correlates vessel pressure spikes and gas seal leak volumes to project a 30-minute flare-surge path. Given the advanced warning, operators utilize an interactive Compressor Recycle Valve slider to dynamically route volatile gas back into the process system, keeping total flare volumes strictly underneath ESG quota thresholds.

---

## Getting Started

1. **Start the Backend Engine**:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Launch the Dashboard**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
Navigate to the hosted URL (usually `http://localhost:5173`) to interact with the DRISHTI intelligence platform.
