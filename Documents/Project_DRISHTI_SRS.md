# Software Requirements Specification (SRS)
**Project DRISHTI: Digital Refinery Intelligence & Safety Holistic Tracking Initiative**

## 1. Introduction
This document specifies the software architecture, technical stack, API interfaces, and non-functional requirements for the Project DRISHTI platform.

## 2. Overall Architecture
The system follows a modern decoupled client-server architecture designed for high-frequency data calculation:
- **Frontend (Client):** A Single Page Application (SPA) built with React, TypeScript, and Vite. It utilizes Plotly.js for WebGL-accelerated 2D and 3D data visualizations.
- **Backend (Server):** A RESTful API built with Python and FastAPI, operating under Uvicorn. Handles data simulation, ML inference logic, and state management.
- **Communication:** HTTP/REST over JSON, with specific endpoints configured for rapid polling to simulate real-time DCS streams.

## 3. API & Endpoint Specifications
The backend must expose the following core REST endpoints to support the frontend modules:
- `GET /health`: Lightweight system health check returning operational status.
- `GET /api/yield`: Returns timeseries quality predictions, profit lever boundaries, KPI calculations, and 3D tuning model constraints.
- `GET /api/batch-comparison`: Returns historical batch performance metrics, profit margins, and off-spec incident logs.
- `GET /api/advanced-visualization`: Returns the computed 3D mesh arrays (X, Y, Z coordinates) and correlation matrices for the Quality Response Surface.
- `GET /api/maintenance`: Returns historical degradation arrays and current asset Remaining Useful Life (RUL) ratios.
- `GET /api/benzene`: Returns simulated segment mapping for pipeline temperatures and risk thresholds based on ambient conditions.
- `GET /api/flare`: Returns current flare volume, 30-minute forecasting array, and source breakdown percentages.
- `GET /api/realtime-monitoring`: A rapid-polling endpoint returning system health, active alerts, and immediate sensor snapshots.

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance & Latency
- **NFR1:** The backend API must respond to the `/api/realtime-monitoring` endpoint in under 100 milliseconds to seamlessly support the frontend's 5-second polling interval.
- **NFR2:** The frontend UI must utilize hardware acceleration (WebGL) to render the 3D Plotly graphs at a minimum of 30 frames per second during user rotation and interaction.

### 4.2 Availability & Reliability
- **NFR3:** The backend service must be designed for 99.9% uptime. It should utilize a stateless architecture to allow for immediate horizontal scaling or rapid restart via Docker/Kubernetes without data corruption.

### 4.3 Security
- **NFR4:** All API endpoints must enforce Cross-Origin Resource Sharing (CORS) policies, restricting access to authorized frontend domains.
- **NFR5:** (Future Implementation) Hardcoded frontend credentials must be migrated to secure backend authentication (e.g., JWT/OAuth2) utilizing encrypted password hashing before production deployment.

### 4.4 Maintainability
- **NFR6:** The frontend codebase must strictly adhere to TypeScript typing (`types.ts`) for all API payloads and responses to ensure type safety, enable IDE intellisense, and reduce runtime errors.
- **NFR7:** The Python backend must be managed via a virtual environment with strict dependency pinning (`requirements.txt`) to guarantee deterministic builds across development and production environments.
