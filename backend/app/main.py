from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Project DRISHTI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _generate_timeseries(seed: int = 42, hours: int = 24) -> pd.DataFrame:
    np.random.seed(seed)
    now = datetime.now().replace(minute=0, second=0, microsecond=0)
    idx = pd.date_range(end=now, periods=hours, freq="h")
    t = np.arange(hours)

    diesel_pred = 92 + 1.8 * np.sin(t / 3.1) + np.random.normal(0, 0.35, hours)
    diesel_lab = diesel_pred + np.random.normal(0, 0.5, hours)
    petrol_pred = 88 + 2.1 * np.cos(t / 4.2) + np.random.normal(0, 0.4, hours)
    petrol_lab = petrol_pred + np.random.normal(0, 0.55, hours)

    furnace_temp = 325 + 8 * np.sin(t / 4.0) + np.random.normal(0, 1.5, hours)
    flare_actual = 130 + 25 * np.sin(t / 5.0) + np.random.normal(0, 7, hours)
    upstream_pressure = 4.8 + 0.5 * np.cos(t / 3.3) + np.random.normal(0, 0.08, hours)

    return pd.DataFrame(
        {
            "timestamp": idx,
            "diesel_pred": diesel_pred,
            "diesel_lab": diesel_lab,
            "petrol_pred": petrol_pred,
            "petrol_lab": petrol_lab,
            "furnace_temp": furnace_temp,
            "flare_actual": flare_actual,
            "upstream_pressure": upstream_pressure,
        }
    )


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/yield")
def yield_data(hours: int = 24) -> dict:
    df = _generate_timeseries(hours=hours)
    diesel_gap = np.abs(df["diesel_pred"] - df["diesel_lab"])
    petrol_gap = np.abs(df["petrol_pred"] - df["petrol_lab"])
    avg_confidence = max(78.0, 100 - float((diesel_gap.mean() + petrol_gap.mean()) * 28))

    return {
        "timeseries": [
            {
                "timestamp": row.timestamp.isoformat(),
                "diesel_pred": round(float(row.diesel_pred), 3),
                "diesel_lab": round(float(row.diesel_lab), 3),
                "petrol_pred": round(float(row.petrol_pred), 3),
                "petrol_lab": round(float(row.petrol_lab), 3),
                "furnace_temp": round(float(row.furnace_temp), 3),
            }
            for row in df.itertuples()
        ],
        "base_profit_margin": 2.8,
        "profit_per_degree": 0.06,
        "problem_solution_value": {
            "problem": "Lab-confirmed yield quality arrives late, so furnace tuning decisions are delayed and margin leaks shift-by-shift.",
            "solution": "Soft Sensor predicts Diesel/Petrol quality every cycle and links operational levers to expected economic impact for faster action.",
            "value": "Improves gross margin capture, reduces giveaway, and gives executives auditable evidence of AI-assisted optimization.",
            "ml_usecase": "Multi-variable soft sensors utilize ensemble ML techniques to infer final blend quality from intermediate thermal streams."
        },
        "kpis": {
            "model_confidence_pct": round(avg_confidence, 1),
            "diesel_gap_avg": round(float(diesel_gap.mean()), 3),
            "petrol_gap_avg": round(float(petrol_gap.mean()), 3),
            "estimated_daily_uplift_inr_lakh": 18.4,
        },
        "recommended_actions": [
            "Increase furnace outlet temperature by +3°C for higher diesel yield quality while staying within spec.",
            "Prioritize lab validation for petrol stream when prediction-lab gap exceeds 0.8.",
            "Run tighter APC control during high-demand window (06:00-10:00) to lock margin gains.",
        ],
        "tuning_model": {
            "slider_min": -10,
            "slider_max": 20,
            "safe_delta_upper": 6,
            "caution_delta_upper": 12,
            "energy_penalty_per_degree": 0.025,
            "extra_energy_penalty_after_caution": 0.035,
            "offspec_risk_per_degree": 2.2,
            "base_offspec_risk": 7.0,
        },
        "profit_levers": {
            "furnace_temp": {
                "current": 325,
                "min": 315,
                "max": 350,
                "unit": "°C",
                "impact_per_unit": 0.06,
                "description": "Higher temperature improves conversion but increases energy cost"
            },
            "column_pressure": {
                "current": 4.8,
                "min": 4.2,
                "max": 5.5,
                "unit": "bar",
                "impact_per_unit": 0.04,
                "description": "Pressure affects separation efficiency and product quality"
            },
            "reflux_ratio": {
                "current": 2.5,
                "min": 1.8,
                "max": 3.2,
                "unit": "ratio",
                "impact_per_unit": 0.03,
                "description": "Higher reflux improves purity but reduces throughput"
            },
            "feed_flow_rate": {
                "current": 850,
                "min": 750,
                "max": 950,
                "unit": "m³/h",
                "impact_per_unit": 0.02,
                "description": "Flow rate impacts residence time and conversion"
            }
        },
    }


@app.get("/api/maintenance")
def maintenance_data() -> dict:
    np.random.seed(8)
    timeseries = []
    # Generate 30 days of historical degradation data
    base_rul = 800
    for i in range(30):
        timeseries.append({
            "day": i - 30,
            "rul_predicted": round(base_rul - (i * 12) + np.random.normal(0, 15), 1),
            "vibration_level": round(2.5 + (i * 0.1) + np.random.normal(0, 0.2), 2)
        })

    return {
        "problem_solution_value": {
            "problem": "Unexpected pump/compressor failures lead to multi-day unplanned outages and high maintenance costs.",
            "solution": "Predictive Maintenance uses ML models on historical vibration & temperature data to predict Remaining Useful Life (RUL).",
            "value": "Zero unplanned downtime, optimized spare parts inventory, and significant maintenance cost savings.",
            "ml_usecase": "Anomaly detection and time-series clustering predict equipment degradation patterns 48 hours before failure, optimizing operational load vs risk."
        },
        "levers": {
            "pump_load_pct": {"current": 85, "min": 50, "max": 110, "unit": "%", "description": "Higher load accelerates mechanical wear and decreases RUL."},
            "cooling_temp": {"current": 32, "min": 25, "max": 45, "unit": "°C", "description": "Higher cooling temperature decreases heat removal efficiency, impacting seal life."}
        },
        "degradation_history": timeseries,
        "assets": [
            {"name": "Crude Pump P-101", "rul_ratio": 0.72, "hours_remaining": 420, "status": "normal", "base_degradation_rate": 2.1},
            {"name": "Hydrocracker Pump P-203", "rul_ratio": 0.41, "hours_remaining": 168, "status": "normal", "base_degradation_rate": 3.5},
            {"name": "Recycle Compressor C-12", "rul_ratio": 0.18, "hours_remaining": 48, "status": "alert", "base_degradation_rate": 5.2},
            {"name": "Hydrogen Compressor C-07", "rul_ratio": 0.61, "hours_remaining": 290, "status": "normal", "base_degradation_rate": 1.8},
        ]
    }


@app.get("/api/benzene")
def benzene_data() -> dict:
    np.random.seed(7)
    segments = [f"B-{100 + i}" for i in range(1, 13)]
    distances = np.arange(0, 1200, 100) # 12 segments mapped to distance
    ambient = np.random.uniform(3.8, 11.2, len(segments))
    surface = ambient + np.random.uniform(0.7, 3.5, len(segments))
    surface[1] = 5.7
    ambient[1] = 4.9

    points = []
    for i, segment in enumerate(segments):
        s = float(surface[i])
        points.append(
            {
                "segment": segment,
                "distance_m": float(distances[i]),
                "ambient_temp": round(float(ambient[i]), 2),
                "surface_temp": round(s, 2),
                "risk": "High" if s <= 6.0 else "Normal",
            }
        )

    return {
        "problem_solution_value": {
            "problem": "Benzene solidifies in pipelines at 5.5°C during winter, causing extreme blockage, physical pipeline stress, and production halts.",
            "solution": "Thermal profile tracking uses ambient temperatures, wind chill, and insulation data to map pipeline bottlenecks dynamically.",
            "value": "Zero frozen pipeline instances, optimized steam-tracing energy costs, and guaranteed process flow during cold snaps.",
            "ml_usecase": "Regression models predict near-future surface temperature drops based on weather forecasts, dynamically alerting when specific pipe segments need proactive steam routing."
        },
        "levers": {
            "steam_flow_pct": {"current": 40, "min": 0, "max": 100, "unit": "%", "description": "Increasing steam tracing flow raises pipeline surface temperature."},
            "ambient_offset": {"current": 0, "min": -15, "max": 15, "unit": "°C", "description": "Simulates changes in ambient weather conditions."}
        },
        "threshold": 5.5,
        "segments": points,
        "alert_log": "WARNING: ML Forecast indicates Line B-102 surface temp dropping to 5.2°C at 03:00 AM due to incoming cold front. Pre-heat routing recommended.",
    }


@app.get("/api/batch-comparison")
def batch_comparison_data() -> dict:
    np.random.seed(123)
    batches = [f"B-{100 + i:03d}" for i in range(1, 9)]
    
    batch_data = []
    for i, batch in enumerate(batches):
        # Generate realistic batch performance metrics
        base_yield = 90 + np.random.normal(0, 2)
        diesel_quality = base_yield + np.random.normal(0, 1.5)
        petrol_quality = base_yield - 2 + np.random.normal(0, 1.2)
        
        # Calculate profit impact
        profit_margin = 2.8 + np.random.normal(0, 0.8)
        
        # Batch duration and efficiency
        duration = 8 + np.random.normal(0, 1.5)  # hours
        efficiency = 85 + np.random.normal(0, 5)
        
        # Risk factors
        offspec_incidents = np.random.poisson(0.3)
        energy_consumption = 100 + np.random.normal(0, 10)
        
        batch_data.append({
            "batch_id": batch,
            "start_time": (datetime.now() - timedelta(days=i*1.5, hours=np.random.randint(0, 23))).isoformat(),
            "duration": round(float(duration), 1),
            "diesel_quality": round(float(diesel_quality), 2),
            "petrol_quality": round(float(petrol_quality), 2),
            "profit_margin": round(float(profit_margin), 2),
            "efficiency": round(float(efficiency), 1),
            "offspec_incidents": int(offspec_incidents),
            "energy_consumption": round(float(energy_consumption), 1),
            "grade": "A" if profit_margin > 3.2 and offspec_incidents == 0 else "B" if profit_margin > 2.5 else "C",
            "recommendations": [
                "Increase furnace temperature by 2°C for better conversion" if efficiency < 85 else "Maintain current operating parameters",
                "Monitor product quality more closely" if offspec_incidents > 0 else "Quality control within acceptable range",
                "Optimize energy consumption" if energy_consumption > 105 else "Energy efficiency optimal"
            ]
        })
    
    return {
        "batches": batch_data,
        "summary": {
            "total_batches": len(batch_data),
            "avg_profit_margin": round(float(np.mean([b["profit_margin"] for b in batch_data])), 2),
            "avg_efficiency": round(float(np.mean([b["efficiency"] for b in batch_data])), 1),
            "total_offspec_incidents": sum(b["offspec_incidents"] for b in batch_data),
            "grade_distribution": {
                "A": len([b for b in batch_data if b["grade"] == "A"]),
                "B": len([b for b in batch_data if b["grade"] == "B"]),
                "C": len([b for b in batch_data if b["grade"] == "C"])
            }
        }
    }


@app.get("/api/realtime-monitoring")
def realtime_monitoring_data() -> dict:
    np.random.seed(456)
    now = datetime.now()
    
    # Simulate real-time sensor data
    current_sensors = {
        "furnace_outlet_temp": round(325 + np.random.normal(0, 2), 1),
        "column_pressure": round(4.8 + np.random.normal(0, 0.05), 2),
        "reflux_ratio": round(2.5 + np.random.normal(0, 0.1), 2),
        "feed_flow_rate": round(850 + np.random.normal(0, 15), 0),
        "diesel_quality_index": round(92 + np.random.normal(0, 0.8), 2),
        "petrol_quality_index": round(88 + np.random.normal(0, 0.6), 2),
        "energy_consumption": round(100 + np.random.normal(0, 3), 1),
        "flare_rate": round(130 + np.random.normal(0, 8), 1),
        "compressor_vibration": round(5.2 + np.random.normal(0, 0.3), 2),
        "pump_discharge_pressure": round(8.5 + np.random.normal(0, 0.2), 2)
    }
    
    # System health indicators
    system_health = {
        "dcs_connectivity": "online",
        "sensor_status": "healthy",
        "model_inference_time_ms": round(np.random.uniform(45, 85), 0),
        "data_latency_seconds": round(np.random.uniform(2, 8), 1),
        "last_update": now.isoformat(),
        "uptime_percentage": 99.8
    }
    
    # Alerts and warnings
    alerts = []
    if current_sensors["furnace_outlet_temp"] > 330:
        alerts.append({
            "level": "warning",
            "message": "Furnace temperature approaching upper limit",
            "timestamp": now.isoformat()
        })
    if current_sensors["compressor_vibration"] > 5.5:
        alerts.append({
            "level": "alert",
            "message": "Elevated compressor vibration detected",
            "timestamp": now.isoformat()
        })
    if system_health["data_latency_seconds"] > 6:
        alerts.append({
            "level": "warning",
            "message": "Data latency higher than expected",
            "timestamp": now.isoformat()
        })
    
    # Performance metrics
    performance = {
        "prediction_accuracy": round(np.random.uniform(92, 96), 1),
        "optimization_uptime": "99.2%",
        "daily_profit_impact": round(np.random.uniform(15, 25), 1),
        "energy_efficiency": round(np.random.uniform(94, 98), 1)
    }
    
    return {
        "current_readings": current_sensors,
        "system_health": system_health,
        "active_alerts": alerts,
        "performance_metrics": performance,
        "trend_indicators": {
            "furnace_temp_trend": np.random.choice(["stable", "increasing", "decreasing"]),
            "quality_trend": np.random.choice(["improving", "stable", "degrading"]),
            "efficiency_trend": np.random.choice(["optimal", "suboptimal", "critical"])
        }
    }


@app.get("/api/advanced-visualization")
def advanced_visualization_data() -> dict:
    np.random.seed(789)
    
    # Generate optimization space heat map data
    furnace_temps = np.linspace(315, 350, 20)
    column_pressures = np.linspace(4.2, 5.5, 15)
    
    # Create 2D profit surface
    profit_surface = np.zeros((len(column_pressures), len(furnace_temps)))
    for i, pressure in enumerate(column_pressures):
        for j, temp in enumerate(furnace_temps):
            # Simulate profit surface with optimal region
            temp_optimal = 325
            pressure_optimal = 4.8
            
            temp_factor = np.exp(-((temp - temp_optimal) ** 2) / 100)
            pressure_factor = np.exp(-((pressure - pressure_optimal) ** 2) / 0.5)
            
            base_profit = 2.8
            profit_surface[i, j] = base_profit + 2.0 * temp_factor * pressure_factor + np.random.normal(0, 0.1)
    
    # Generate 3D surface data for quality vs parameters
    quality_3d = []
    for temp in furnace_temps[::3]:  # Sample every 3rd point
        for pressure in column_pressures[::2]:
            diesel_quality = 90 + 0.1 * (temp - 325) - 0.5 * (pressure - 4.8) + np.random.normal(0, 0.5)
            petrol_quality = 88 + 0.08 * (temp - 325) - 0.3 * (pressure - 4.8) + np.random.normal(0, 0.4)
            energy_cost = 100 + 0.5 * (temp - 325) + 2 * (pressure - 4.8) + np.random.normal(0, 1)
            
            quality_3d.append({
                "furnace_temp": round(float(temp), 1),
                "column_pressure": round(float(pressure), 2),
                "diesel_quality": round(float(diesel_quality), 2),
                "petrol_quality": round(float(petrol_quality), 2),
                "energy_cost": round(float(energy_cost), 1)
            })
    
    # Generate correlation matrix data
    correlations = {
        "furnace_temp_vs_diesel": round(np.random.uniform(0.65, 0.85), 3),
        "furnace_temp_vs_petrol": round(np.random.uniform(0.55, 0.75), 3),
        "pressure_vs_diesel": round(np.random.uniform(-0.3, -0.1), 3),
        "pressure_vs_petrol": round(np.random.uniform(-0.2, 0.1), 3),
        "flow_vs_diesel": round(np.random.uniform(0.3, 0.5), 3),
        "flow_vs_petrol": round(np.random.uniform(0.2, 0.4), 3),
        "reflux_vs_diesel": round(np.random.uniform(0.4, 0.6), 3),
        "reflux_vs_petrol": round(np.random.uniform(0.5, 0.7), 3)
    }
    
    return {
        "heat_map": {
            "furnace_temps": [round(float(t), 1) for t in furnace_temps],
            "column_pressures": [round(float(p), 2) for p in column_pressures],
            "profit_surface": profit_surface.tolist()
        },
        "surface_3d": quality_3d,
        "correlations": correlations,
        "optimal_operating_point": {
            "furnace_temp": 325.0,
            "column_pressure": 4.8,
            "expected_profit": 4.8,
            "confidence": 94.2
        }
    }


@app.get("/api/flare")
def flare_data() -> dict:
    df = _generate_timeseries()
    current_flare = float(df["flare_actual"].iloc[-1])
    last_pressure = float(df["upstream_pressure"].iloc[-1])

    forecast_minutes = list(range(0, 31, 5))
    forecast_values = [round(current_flare + (m * 1.6) + (last_pressure - 4.8) * 40 * (m / 30.0), 2) for m in forecast_minutes]
    start = df["timestamp"].iloc[-1]
    forecast_timestamps = [(start + timedelta(minutes=m)).isoformat() for m in forecast_minutes]

    return {
        "problem_solution_value": {
            "problem": "Unplanned process disturbances cause excess flaring, resulting in huge environmental ESG penalties and loss of burnable product value.",
            "solution": "Predictive ESG tracking links upstream pressure/flow disturbances to incoming flare surges 30 minutes in advance.",
            "value": "Reduces total tons of CO2e emitted, avoids regulatory fines, and recovers valuable hydrocarbons.",
            "ml_usecase": "Time-series forecasting correlates rapid upstream pressure accumulation to flare drum overflow, allowing proactive gas recovery compressor interventions."
        },
        "levers": {
            "recycle_valve": {"current": 35, "min": 0, "max": 100, "unit": "%", "description": "Opening the compressor recycle valve shifts gas back into the process, reducing flare volume."},
            "upstream_pressure_offset": {"current": 0, "min": -1.5, "max": 1.5, "unit": "bar", "description": "Simulating a pressure surge from an upstream unit."}
        },
        "sources": [
            {"source": "Unit A Relief", "volume_pct": 45},
            {"source": "Unit B Purge", "volume_pct": 25},
            {"source": "Compressor Seal Leak", "volume_pct": 15},
            {"source": "Background Flaring", "volume_pct": 15}
        ],
        "current_flare": round(current_flare, 2),
        "threshold": 210,
        "recent_actual": [
            {
                "timestamp": row.timestamp.isoformat(),
                "flare_actual": round(float(row.flare_actual), 2),
                "upstream_pressure": round(float(row.upstream_pressure), 3),
            }
            for row in df.tail(12).itertuples()
        ],
        "forecast": [{"timestamp": t, "flare_predicted": v} for t, v in zip(forecast_timestamps, forecast_values)],
        "message": "Forecast indicates potential flare surge. Opening gas recovery recycle valve to 60%+ is recommended to stay within ESG quota.",
    }
