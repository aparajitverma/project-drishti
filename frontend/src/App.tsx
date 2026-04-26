import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { api } from "./api";
import type { AdvancedVisualizationResponse, BatchComparisonResponse, BenzeneResponse, FlareResponse, MaintenanceResponse, RealtimeMonitoringResponse, YieldResponse } from "./types";

const IOCL_SAFFRON = "#FF9933";
const IOCL_BLUE = "#003366";
const ALERT_RED = "#D62728";

type WorkflowProjectKey = "yield" | "maintenance" | "benzene" | "flare";

type WorkflowModel = {
  name: string;
  type: string;
  accuracy: number;
  rmse: number;
  r2: number;
  inferenceMs: number;
  description: string;
};

type WorkflowSensor = {
  icon: string;
  name: string;
  detail: string;
};

type WorkflowPipelineStep = {
  icon: string;
  label: string;
  desc: string;
};

type WorkflowProjectData = {
  title: string;
  subtitle: string;
  pipeline: WorkflowPipelineStep[];
  sensors: WorkflowSensor[];
  models: WorkflowModel[];
  defaultModel: number;
  confidenceDesc: string;
};

const WORKFLOW_DATA: Record<WorkflowProjectKey, WorkflowProjectData> = {
  yield: {
    title: "Yield Optimizer — AI/ML (Artificial Intelligence / Machine Learning) Workflow",
    subtitle: "Soft-Sensor Ensemble Pipeline for Real-Time Blend Quality Prediction",
    pipeline: [
      { icon: "📡", label: "Data Ingestion", desc: "Live DCS (Distributed Control System) feeds from furnace, column, and flow sensors at 1-second intervals" },
      { icon: "🔧", label: "Preprocessing", desc: "Outlier removal, normalization, lag-feature engineering on 24h rolling windows" },
      { icon: "🧠", label: "Model Training", desc: "Ensemble of XGBoost (eXtreme Gradient Boosting) + LSTM (Long Short-Term Memory) trained on 6 months of historical lab-validated data" },
      { icon: "⚡", label: "Inference", desc: "Real-time quality prediction every 60s with confidence scoring" },
      { icon: "📊", label: "Output & Action", desc: "Predicted yield quality index fed to APC (Advanced Process Control) for closed-loop furnace optimization" },
    ],
    sensors: [
      { icon: "🌡️", name: "Furnace Outlet Temperature", detail: "TI-101 | Range: 310–350°C | Update: 1s" },
      { icon: "⚖️", name: "Column Pressure", detail: "PI-201 | Range: 4.0–5.5 bar | Update: 1s" },
      { icon: "🔄", name: "Reflux Ratio", detail: "FRC-301 | Range: 1.8–3.2 | Update: 5s" },
      { icon: "💧", name: "Feed Flow Rate", detail: "FI-401 | Range: 750–950 m³/h | Update: 1s" },
      { icon: "🧪", name: "Diesel Lab Sample", detail: "LAB-D | Frequency: Every 4 hours" },
      { icon: "🧪", name: "Petrol Lab Sample", detail: "LAB-P | Frequency: Every 4 hours" },
    ],
    models: [
      { name: "XGBoost (eXtreme Gradient Boosting) Ensemble", type: "Gradient Boosting", accuracy: 94.2, rmse: 0.38, r2: 0.93, inferenceMs: 12, description: "Best balance of accuracy and speed for tabular process data" },
      { name: "LSTM (Long Short-Term Memory) Autoencoder", type: "Deep Learning", accuracy: 93.8, rmse: 0.41, r2: 0.91, inferenceMs: 45, description: "Captures temporal dependencies in sequential furnace cycles" },
      { name: "Random Forest", type: "Ensemble Trees", accuracy: 92.1, rmse: 0.47, r2: 0.89, inferenceMs: 8, description: "Fast, interpretable model for baseline quality estimation" },
      { name: "Ridge Regression", type: "Linear Model", accuracy: 88.5, rmse: 0.62, r2: 0.84, inferenceMs: 3, description: "Lightweight linear baseline for comparison and drift detection" },
    ],
    defaultModel: 0,
    confidenceDesc: "Based on 6-month rolling validation against lab results. Confidence recalibrated weekly.",
  },
  maintenance: {
    title: "Predictive Maintenance — AI/ML Workflow",
    subtitle: "Equipment Degradation & RUL (Remaining Useful Life) Prediction Pipeline",
    pipeline: [
      { icon: "📡", label: "Sensor Fusion", desc: "Vibration, temperature, current, and pressure sensors sampled at 500 Hz" },
      { icon: "🔧", label: "Feature Extraction", desc: "FFT (Fast Fourier Transform) decomposition, statistical aggregation, rolling kurtosis & RMS (Root Mean Square)" },
      { icon: "🧠", label: "Anomaly Detection", desc: "Isolation Forest flags regime changes; LSTM (Long Short-Term Memory) predicts RUL trajectory" },
      { icon: "⚡", label: "Risk Scoring", desc: "Multi-model voting produces risk scores updated every 15 minutes" },
      { icon: "🛡️", label: "Alert & Schedule", desc: "Proactive maintenance orders triggered 48h before predicted failure" },
    ],
    sensors: [
      { icon: "📳", name: "Vibration Accelerometer", detail: "VIB-P101 | Axis: Tri-axial | Sampling: 500 Hz" },
      { icon: "🌡️", name: "Bearing Temperature", detail: "TI-P102 | Range: 40–120°C | Update: 5s" },
      { icon: "⚡", name: "Motor Current Draw", detail: "II-P103 | Range: 0–200 A | Update: 1s" },
      { icon: "💨", name: "Pump Discharge Pressure", detail: "PI-P104 | Range: 5–12 bar | Update: 1s" },
      { icon: "🔊", name: "Acoustic Emission", detail: "AE-C12 | Frequency: 100 kHz–1 MHz" },
      { icon: "🧲", name: "Oil Debris Monitor", detail: "OD-P105 | Particle count per cycle" },
    ],
    models: [
      { name: "LSTM (Long Short-Term Memory) Time-Series", type: "RNN (Recurrent Neural Network)", accuracy: 95.1, rmse: 18.2, r2: 0.94, inferenceMs: 38, description: "Best at capturing long-term degradation trends from vibration sequences" },
      { name: "Isolation Forest", type: "Anomaly Detection", accuracy: 91.3, rmse: 28.5, r2: 0.87, inferenceMs: 5, description: "Unsupervised anomaly scoring for detecting novel failure modes" },
      { name: "XGBoost (eXtreme Gradient Boosting) Classifier", type: "Gradient Boosting", accuracy: 93.7, rmse: 21.0, r2: 0.92, inferenceMs: 10, description: "Fast multi-class failure mode classification from extracted features" },
      { name: "1D-CNN (Convolutional Neural Network)", type: "Convolutional Network", accuracy: 94.5, rmse: 19.8, r2: 0.93, inferenceMs: 22, description: "Raw signal pattern recognition for early fault signature detection" },
    ],
    defaultModel: 0,
    confidenceDesc: "Validated against 2 years of maintenance logs covering 47 recorded failure events.",
  },
  benzene: {
    title: "Benzene Safety — AI/ML Workflow",
    subtitle: "Winterization Risk Prediction & Steam Routing Pipeline",
    pipeline: [
      { icon: "🌤️", label: "Weather Ingest", desc: "Real-time IMD (India Meteorological Department) weather feeds, on-site ambient probes, wind chill calculations" },
      { icon: "🔧", label: "Thermal Modeling", desc: "Physics-informed feature engineering: insulation factor, sun exposure, pipe diameter" },
      { icon: "🧠", label: "Regression", desc: "Gradient Boosted Regressor predicts surface temp 6h ahead per segment" },
      { icon: "⚡", label: "Risk Mapping", desc: "Segment-level freeze probability mapped against 5.5°C solidification threshold" },
      { icon: "♨️", label: "Steam Routing", desc: "Automated steam-tracing activation commands sent to at-risk segments" },
    ],
    sensors: [
      { icon: "🌡️", name: "Surface Temperature Probe", detail: "TE-B1xx | 12 segments | Update: 30s" },
      { icon: "🌤️", name: "Ambient Temperature", detail: "AT-MET01 | Range: -10 to 50°C | Update: 60s" },
      { icon: "💨", name: "Wind Speed & Direction", detail: "WS-MET02 | Anemometer | Update: 60s" },
      { icon: "♨️", name: "Steam Flow Meter", detail: "FI-STM01 | Range: 0–100% | Update: 5s" },
      { icon: "📏", name: "Pipe Insulation Sensor", detail: "INS-B1xx | Thermal conductivity | Static" },
      { icon: "☁️", name: "Cloud Cover / Solar", detail: "SOL-MET03 | W/m² | Update: 300s" },
    ],
    models: [
      { name: "Gradient Boosted Regressor", type: "Ensemble Trees", accuracy: 93.8, rmse: 0.72, r2: 0.92, inferenceMs: 8, description: "Best overall accuracy for surface temperature prediction" },
      { name: "ARIMA (AutoRegressive Integrated Moving Average) Weather Model", type: "Statistical", accuracy: 89.2, rmse: 1.15, r2: 0.85, inferenceMs: 2, description: "Classical time-series model for ambient temperature trend" },
      { name: "Random Forest", type: "Ensemble Trees", accuracy: 91.5, rmse: 0.89, r2: 0.89, inferenceMs: 6, description: "Robust general-purpose model with good interpretability" },
      { name: "SVR (Support Vector Regression) with RBF (Radial Basis Function) Kernel", type: "Support Vector", accuracy: 90.1, rmse: 0.98, r2: 0.87, inferenceMs: 15, description: "Non-linear regression effective for small segment datasets" },
    ],
    defaultModel: 0,
    confidenceDesc: "Calibrated on 3 winter seasons of pipeline temperature data across all 12 segments.",
  },
  flare: {
    title: "Flare & ESG (Environmental, Social, and Governance) Tracker — AI/ML Workflow",
    subtitle: "Predictive Flare Surge Forecasting & Gas Recovery Pipeline",
    pipeline: [
      { icon: "📡", label: "Pressure Ingest", desc: "Upstream pressure, drum level, and compressor discharge at 1s intervals" },
      { icon: "🔧", label: "Signal Processing", desc: "Rolling Z-score, derivative features, pressure ramp-rate calculation" },
      { icon: "🧠", label: "Forecasting", desc: "Prophet + LSTM (Long Short-Term Memory) ensemble produces 30-minute flare volume forecast" },
      { icon: "⚡", label: "Threshold Check", desc: "Predicted volume compared against ESG regulatory limits in real time" },
      { icon: "🔁", label: "Compressor Action", desc: "Automated recycle valve opening to redirect gas and reduce flaring" },
    ],
    sensors: [
      { icon: "⚖️", name: "Upstream Pressure Gauge", detail: "PI-FL01 | Range: 3.0–7.0 bar | Update: 1s" },
      { icon: "🔥", name: "Flare Flow Meter", detail: "FI-FL02 | Range: 0–500 kg/h | Update: 1s" },
      { icon: "💨", name: "Compressor Discharge", detail: "PI-C07 | Range: 8–15 bar | Update: 1s" },
      { icon: "📏", name: "Drum Level Sensor", detail: "LI-FL03 | Range: 0–100% | Update: 5s" },
      { icon: "🌡️", name: "Flare Tip Temperature", detail: "TI-FL04 | Range: 200–1200°C | Update: 10s" },
      { icon: "📊", name: "Gas Composition Analyzer", detail: "AI-FL05 | CH₄ (Methane), H₂S (Hydrogen Sulfide), CO₂ (Carbon Dioxide) | Update: 60s" },
    ],
    models: [
      { name: "Prophet Forecasting", type: "Additive Model", accuracy: 92.5, rmse: 8.3, r2: 0.91, inferenceMs: 18, description: "Best for capturing daily/weekly flaring seasonality patterns" },
      { name: "LSTM (Long Short-Term Memory) Sequence", type: "Deep Learning", accuracy: 94.1, rmse: 6.9, r2: 0.93, inferenceMs: 42, description: "Excels at rapid pressure surge prediction from sequential data" },
      { name: "XGBoost (eXtreme Gradient Boosting) Regressor", type: "Gradient Boosting", accuracy: 91.8, rmse: 9.1, r2: 0.89, inferenceMs: 7, description: "Fast, reliable model using engineered pressure-derivative features" },
      { name: "ARIMA (AutoRegressive Integrated Moving Average)", type: "Statistical", accuracy: 87.3, rmse: 12.4, r2: 0.82, inferenceMs: 3, description: "Simple statistical baseline for trend-following forecast" },
    ],
    defaultModel: 1,
    confidenceDesc: "Validated against 12 months of actual flare events, including 23 surge incidents.",
  },
};

const AiWorkflowModal = ({
  projectKey,
  onClose,
}: {
  projectKey: WorkflowProjectKey;
  onClose: () => void;
}) => {
  const data = WORKFLOW_DATA[projectKey];
  const [selectedModel, setSelectedModel] = useState(data.defaultModel);

  const activeModel = data.models[selectedModel];

  return (
    <div className="workflow-overlay" onClick={onClose}>
      <div className="workflow-modal" onClick={e => e.stopPropagation()}>
        <div className="workflow-modal-header">
          <div>
            <h2>{data.title}</h2>
            <p className="modal-subtitle">{data.subtitle}</p>
          </div>
          <button className="workflow-close-btn" onClick={onClose} type="button">✕</button>
        </div>

        <div className="workflow-modal-body">
          {/* ── Pipeline Flow ── */}
          <div>
            <h4 className="wf-section-title">AI/ML Pipeline Flow</h4>
            <div className="pipeline-steps">
              {data.pipeline.map((step, i) => (
                <>
                  <div className="pipeline-step" key={step.label}>
                    <span className="step-icon">{step.icon}</span>
                    <span className="step-label">{step.label}</span>
                    <span className="step-desc">{step.desc}</span>
                  </div>
                  {i < data.pipeline.length - 1 && (
                    <span className="pipeline-arrow" key={`arrow-${step.label}`}>→</span>
                  )}
                </>
              ))}
            </div>
          </div>

          {/* ── Data Sensors & Sources ── */}
          <div>
            <h4 className="wf-section-title">Data Sensors & Sources</h4>
            <div className="sensor-source-grid">
              {data.sensors.map(s => (
                <div className="sensor-source-card" key={s.name}>
                  <span className="sensor-icon">{s.icon}</span>
                  <div className="sensor-info">
                    <span className="sensor-name">{s.name}</span>
                    <span className="sensor-detail">{s.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Model Comparison ── */}
          <div>
            <h4 className="wf-section-title">Model Performance Comparison</h4>
            <div className="model-table-wrapper">
              <table className="model-comparison-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Type</th>
                    <th>Accuracy (%)</th>
                    <th>RMSE</th>
                    <th>R²</th>
                    <th>Inference (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.models.map((m, i) => {
                    const bestAccuracy = Math.max(...data.models.map(x => x.accuracy));
                    const bestRmse = Math.min(...data.models.map(x => x.rmse));
                    const bestR2 = Math.max(...data.models.map(x => x.r2));
                    const bestInference = Math.min(...data.models.map(x => x.inferenceMs));
                    return (
                      <tr key={m.name} style={i === selectedModel ? { background: "#fff9f2" } : undefined}>
                        <td><strong>{m.name}</strong></td>
                        <td>{m.type}</td>
                        <td className={m.accuracy === bestAccuracy ? "best-value" : ""}>{m.accuracy}%</td>
                        <td className={m.rmse === bestRmse ? "best-value" : ""}>{m.rmse}</td>
                        <td className={m.r2 === bestR2 ? "best-value" : ""}>{m.r2}</td>
                        <td className={m.inferenceMs === bestInference ? "best-value" : ""}>{m.inferenceMs} ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Admin Model Selection ── */}
          <div>
            <h4 className="wf-section-title">Select Active Model</h4>
            <div className="model-cards-grid">
              {data.models.map((m, i) => (
                <div
                  key={m.name}
                  className={`model-select-card ${i === selectedModel ? "selected" : ""}`}
                  onClick={() => setSelectedModel(i)}
                >
                  <div className="model-name">{m.name}</div>
                  <div className="model-type">{m.type}</div>
                  <div className="model-stats">
                    <div className="model-stat">
                      <span>Accuracy</span>
                      <span>{m.accuracy}%</span>
                    </div>
                    <div className="model-stat">
                      <span>RMSE</span>
                      <span>{m.rmse}</span>
                    </div>
                    <div className="model-stat">
                      <span>R²</span>
                      <span>{m.r2}</span>
                    </div>
                    <div className="model-stat">
                      <span>Inference</span>
                      <span>{m.inferenceMs} ms</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "13px", color: "#42536b", marginTop: "8px", marginBottom: 0, lineHeight: 1.35 }}>
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Prediction Confidence ── */}
          <div className="confidence-section">
            <div className="confidence-header">
              <span className="conf-label">Selected Model: {activeModel.name}</span>
              <span className="conf-value">{activeModel.accuracy}%</span>
            </div>
            <div className="confidence-bar-track">
              <div
                className="confidence-bar-fill"
                style={{ width: `${activeModel.accuracy}%` }}
              />
            </div>
            <p className="confidence-desc">{data.confidenceDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

type ModuleKey =
  | "Yield Optimizer"
  | "Predictive Maintenance"
  | "Benzene Safety (Winterization)"
  | "Flare & ESG Tracker";

type YieldOptimizerTab =
  | "optimization"
  | "batch-comparison"
  | "realtime-monitoring"
  | "advanced-viz";

const modules: ModuleKey[] = [
  "Yield Optimizer",
  "Predictive Maintenance",
  "Benzene Safety (Winterization)",
  "Flare & ESG Tracker",
];

const getViridisColor = (val: number, min = 88, max = 94) => {
  const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
  if (t < 0.5) {
    const t2 = t * 2;
    const r = Math.round(68 + t2 * (33 - 68));
    const g = Math.round(1 + t2 * (145 - 1));
    const b = Math.round(84 + t2 * (140 - 84));
    return `rgb(${r},${g},${b})`;
  } else {
    const t2 = (t - 0.5) * 2;
    const r = Math.round(33 + t2 * (253 - 33));
    const g = Math.round(145 + t2 * (231 - 145));
    const b = Math.round(140 + t2 * (37 - 140));
    return `rgb(${r},${g},${b})`;
  }
};

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Raygain" && password === "!Raygain@123") {
      onLogin();
    } else {
      setError("Invalid administrative credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Project DRISHTI</h1>
        <h3>Digital Refinery Intelligence & Safety Holistic Tracking Initiative</h3>
        <p className="login-desc">
          An advanced AI/ML-driven full-stack simulation dashboard designed to provide actionable intelligence, optimize process yield, enforce process safety, and track Environmental, Social, and Governance (ESG) compliance.
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Admin ID"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit">Initialize System</button>
        </form>
      </div>
      <div className="powered-by">
        <span>Powered by:</span>
        <img src="/logo.webp" alt="Raygain Logo" />
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleKey>("Yield Optimizer");
  const [workflowProject, setWorkflowProject] = useState<WorkflowProjectKey | null>(null);
  const [activeYieldTab, setActiveYieldTab] = useState<YieldOptimizerTab>("optimization");
  const [yieldData, setYieldData] = useState<YieldResponse | null>(null);
  const [batchData, setBatchData] = useState<BatchComparisonResponse | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeMonitoringResponse | null>(null);
  const [advancedVizData, setAdvancedVizData] = useState<AdvancedVisualizationResponse | null>(null);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceResponse | null>(null);
  const [benzeneData, setBenzeneData] = useState<BenzeneResponse | null>(null);
  const [flareData, setFlareData] = useState<FlareResponse | null>(null);
  const [furnaceDelta, setFurnaceDelta] = useState(5);
  const [timeRange, setTimeRange] = useState(24);
  const [profitLevers, setProfitLevers] = useState({
    furnace_temp: 0,
    column_pressure: 0,
    reflux_ratio: 0,
    feed_flow_rate: 0
  });

  const [maintenanceLevers, setMaintenanceLevers] = useState({ pump_load_pct: 0, cooling_temp: 0 });
  const [benzeneLevers, setBenzeneLevers] = useState({ steam_flow_pct: 0, ambient_offset: 0 });
  const [flareLevers, setFlareLevers] = useState({ recycle_valve: 0, upstream_pressure_offset: 0 });

  useEffect(() => {
    void Promise.all([
      api.getYield(timeRange).then(setYieldData),
      api.getBatchComparison().then(setBatchData),
      api.getRealtimeMonitoring().then(setRealtimeData),
      api.getAdvancedVisualization().then(setAdvancedVizData),
      api.getMaintenance().then(setMaintenanceData),
      api.getBenzene().then(setBenzeneData),
      api.getFlare().then(setFlareData),
    ]);
  }, [timeRange]);

  // Set up real-time updates
  useEffect(() => {
    if (activeModule === "Yield Optimizer" && activeYieldTab === "realtime-monitoring") {
      const interval = setInterval(() => {
        void api.getRealtimeMonitoring().then(setRealtimeData);
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [activeModule, activeYieldTab]);

  const margin = useMemo(() => {
    if (!yieldData) return 0;
    let totalMargin = yieldData.base_profit_margin + yieldData.profit_per_degree * furnaceDelta;

    // Add profit lever impacts
    if (yieldData.profit_levers) {
      totalMargin += profitLevers.furnace_temp * yieldData.profit_levers.furnace_temp.impact_per_unit;
      totalMargin += profitLevers.column_pressure * yieldData.profit_levers.column_pressure.impact_per_unit;
      totalMargin += profitLevers.reflux_ratio * yieldData.profit_levers.reflux_ratio.impact_per_unit;
      totalMargin += profitLevers.feed_flow_rate * yieldData.profit_levers.feed_flow_rate.impact_per_unit;
    }

    return totalMargin;
  }, [yieldData, furnaceDelta, profitLevers]);

  const yieldDynamics = useMemo(() => {
    if (!yieldData) {
      return null;
    }
    const model = yieldData.tuning_model;
    const positiveDelta = Math.max(0, furnaceDelta);
    const extraCautionDelta = Math.max(0, furnaceDelta - model.caution_delta_upper);
    const dataUncertainty = (yieldData.kpis.diesel_gap_avg + yieldData.kpis.petrol_gap_avg) * 8;

    const energyPenalty =
      positiveDelta * model.energy_penalty_per_degree +
      extraCautionDelta * model.extra_energy_penalty_after_caution;
    const offspecRisk = Math.min(
      100,
      model.base_offspec_risk + positiveDelta * model.offspec_risk_per_degree + dataUncertainty
    );
    const tripRisk = Math.min(100, Math.max(1, 2 + Math.max(0, furnaceDelta - model.safe_delta_upper) * 4.3));
    const netMargin = margin - energyPenalty - offspecRisk * 0.01;

    let zone: "Safe" | "Caution" | "High Risk";
    if (furnaceDelta <= model.safe_delta_upper) {
      zone = "Safe";
    } else if (furnaceDelta <= model.caution_delta_upper) {
      zone = "Caution";
    } else {
      zone = "High Risk";
    }

    const recommendations: string[] = [];
    if (zone === "Safe") {
      recommendations.push("Maintain APC in optimization mode; current setting is inside safe thermal envelope.");
      recommendations.push("Capture gains by tightening cut-point control and monitoring diesel endpoint every cycle.");
    } else if (zone === "Caution") {
      recommendations.push("Run increased watch on tube metal temperature and pressure drop to avoid early coking.");
      recommendations.push("Increase lab validation frequency to every 2 hours until prediction-lab gaps normalize.");
    } else {
      recommendations.push("Reduce furnace delta by 2-4°C to move back below caution limit and protect heater integrity.");
      recommendations.push("Keep operations/safety approval mandatory before sustaining this setpoint beyond 30 minutes.");
    }
    if (offspecRisk > 30) {
      recommendations.push("Trigger product quality hold logic: switch to tighter diesel/petrol blend control.");
    }

    return { energyPenalty, offspecRisk, tripRisk, netMargin, zone, recommendations };
  }, [yieldData, furnaceDelta, margin]);

  const dynamicMaintenance = useMemo(() => {
    if (!maintenanceData) return null;
    const { pump_load_pct, cooling_temp } = maintenanceLevers;
    const updatedAssets = maintenanceData.assets.map(a => {
      const drop = (pump_load_pct * a.base_degradation_rate) + (cooling_temp * 1.5);
      const new_hours = Math.max(0, a.hours_remaining - drop);
      const risk = new_hours < 72 ? "alert" : "normal";
      return { ...a, hours_remaining: Math.round(new_hours), status: risk, rul_ratio: Math.min(1, new_hours / 450) };
    });

    const updatedHistory = maintenanceData.degradation_history.map(pt => {
      return {
        ...pt,
        rul_predicted: Math.max(0, pt.rul_predicted - (pump_load_pct * 3) - (cooling_temp * 2))
      };
    });

    return { assets: updatedAssets, history: updatedHistory };
  }, [maintenanceData, maintenanceLevers]);

  const dynamicBenzene = useMemo(() => {
    if (!benzeneData) return null;
    const { steam_flow_pct, ambient_offset } = benzeneLevers;
    const updatedSegments = benzeneData.segments.map(seg => {
      const new_ambient = seg.ambient_temp + ambient_offset;
      const new_surface = seg.surface_temp + ambient_offset + (steam_flow_pct * 0.05);
      return { ...seg, ambient_temp: Number(new_ambient.toFixed(2)), surface_temp: Number(new_surface.toFixed(2)), risk: new_surface <= benzeneData.threshold ? "High" : "Normal" };
    });
    return { segments: updatedSegments };
  }, [benzeneData, benzeneLevers]);

  const dynamicFlare = useMemo(() => {
    if (!flareData) return null;
    const { recycle_valve, upstream_pressure_offset } = flareLevers;

    const valve_reduction = recycle_valve * 1.2;
    const pressure_increase = upstream_pressure_offset * 40;

    const new_current = Math.max(0, flareData.current_flare - valve_reduction + pressure_increase);

    const updatedForecast = flareData.forecast.map((pt, i) => {
      const time_factor = (i / 6.0);
      return { ...pt, flare_predicted: Math.max(0, pt.flare_predicted - (valve_reduction * time_factor) + (pressure_increase * time_factor)) };
    });

    let sources = [...flareData.sources];
    if (recycle_valve > 0) {
      sources = sources.map(s => {
        if (s.source === "Unit A Relief" || s.source === "Unit B Purge") {
          return { ...s, volume_pct: Math.max(5, s.volume_pct - (recycle_valve * 0.1)) };
        }
        return s;
      });
    }

    return { current_flare: new_current, forecast: updatedForecast, sources };
  }, [flareData, flareLevers]);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Project DRISHTI</h2>
        <p className="subtitle">Digital Refinery Intelligence & Safety Holistic Tracking Initiative</p>
        {modules.map((module) => (
          <button
            type="button"
            key={module}
            className={activeModule === module ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveModule(module)}
          >
            {module}
          </button>
        ))}
        <button
          className="nav-btn logout-btn"
          type="button"
          onClick={() => setIsAuthenticated(false)}
        >
          Logout
        </button>
      </aside>
      <main className="content">
        {activeModule === "Yield Optimizer" && yieldData && (
          <section>
            <h3>Yield Optimizer</h3>
            <div className="mini-project-banner">
              <span>Project #1</span>
              <strong>AI Yield Optimization Cockpit</strong>
            </div>

            <div className="yield-tabs">
              <button
                className={activeYieldTab === "optimization" ? "active" : ""}
                onClick={() => setActiveYieldTab("optimization")}
              >
                Optimization Control
              </button>
              <button
                className={activeYieldTab === "batch-comparison" ? "active" : ""}
                onClick={() => setActiveYieldTab("batch-comparison")}
              >
                Batch Analysis
              </button>
              <button
                className={activeYieldTab === "realtime-monitoring" ? "active" : ""}
                onClick={() => setActiveYieldTab("realtime-monitoring")}
              >
                Real-time Monitor
              </button>
              <button
                className={activeYieldTab === "advanced-viz" ? "active" : ""}
                onClick={() => setActiveYieldTab("advanced-viz")}
              >
                Advanced Analytics
              </button>
            </div>

            {activeYieldTab === "optimization" && (
              <div>
                <div className="psv-grid">
                  <div className="psv-card">
                    <h4>Problem</h4>
                    <p>{yieldData.problem_solution_value.problem}</p>
                  </div>
                  <div className="psv-card">
                    <h4>Solution</h4>
                    <p>{yieldData.problem_solution_value.solution}</p>
                  </div>
                  <div className="psv-card value">
                    <h4>Value</h4>
                    <p>{yieldData.problem_solution_value.value}</p>
                  </div>
                  <div className="psv-card ai-impact">
                    <h4>AI/ML Impact</h4>
                    <p>{yieldData.problem_solution_value.ml_usecase}</p>
                    <span className="view-workflow-link" onClick={() => setWorkflowProject("yield")}>
                      View Workflow <span className="arrow">→</span>
                    </span>
                  </div>
                </div>

                <div className="kpi-grid">
                  <div className="kpi-card">
                    <p>Model Confidence</p>
                    <strong>{yieldData.kpis.model_confidence_pct}%</strong>
                  </div>
                  <div className="kpi-card">
                    <p>
                      Diesel Pred-Lab Gap
                      <span
                        className="hint"
                        title="Average absolute difference between soft-sensor diesel prediction and lab result over 24h. Lower is better."
                      >
                        i
                      </span>
                    </p>
                    <strong>{yieldData.kpis.diesel_gap_avg}</strong>
                  </div>
                  <div className="kpi-card">
                    <p>
                      Petrol Pred-Lab Gap
                      <span
                        className="hint"
                        title="Average absolute difference between soft-sensor petrol prediction and lab result over 24h. Lower is better."
                      >
                        i
                      </span>
                    </p>
                    <strong>{yieldData.kpis.petrol_gap_avg}</strong>
                  </div>
                  <div className="kpi-card uplift">
                    <p>Potential Daily Uplift</p>
                    <strong>INR {yieldData.kpis.estimated_daily_uplift_inr_lakh} Lakh</strong>
                  </div>
                </div>

                <Plot
                  data={[
                    {
                      x: yieldData.timeseries.map((d) => d.timestamp),
                      y: yieldData.timeseries.map((d) => d.diesel_pred),
                      name: "Diesel Predicted",
                      type: "scatter",
                      mode: "lines",
                      line: { color: IOCL_BLUE, width: 3 },
                    },
                    {
                      x: yieldData.timeseries.map((d) => d.timestamp),
                      y: yieldData.timeseries.map((d) => d.diesel_lab),
                      name: "Diesel Lab",
                      type: "scatter",
                      mode: "lines+markers",
                      line: { color: IOCL_SAFFRON, dash: "dot" },
                    },
                    {
                      x: yieldData.timeseries.map((d) => d.timestamp),
                      y: yieldData.timeseries.map((d) => d.petrol_pred),
                      name: "Petrol Predicted",
                      type: "scatter",
                      mode: "lines",
                      line: { color: "#4C78A8", width: 2 },
                    },
                    {
                      x: yieldData.timeseries.map((d) => d.timestamp),
                      y: yieldData.timeseries.map((d) => d.petrol_lab),
                      name: "Petrol Lab",
                      type: "scatter",
                      mode: "lines+markers",
                      line: { color: "#F58518", dash: "dot" },
                    },
                  ]}
                  layout={{
                    title: { text: "Soft Sensor Feed: Predicted vs Lab Results" },
                    paper_bgcolor: "white",
                    plot_bgcolor: "white",
                    yaxis: { title: { text: "Yield Quality Index" } },
                    height: 450,
                    dragmode: false,
                    modebar: {
                      remove: ['select2d', 'lasso2d']
                    }
                  }}
                  style={{ width: "100%" }}
                />
                <p className="axis-note">
                  Y-axis: Yield Quality Index
                  <span
                    className="hint"
                    title="Composite quality indicator derived from relevant product quality predictors. It is dimensionless and used for relative optimization."
                  >
                    i
                  </span>
                </p>
                <div className="time-range-selector">
                  <h4>Time Range Analysis</h4>
                  <div className="time-range-buttons">
                    <button
                      className={timeRange === 24 ? "active" : ""}
                      onClick={() => setTimeRange(24)}
                    >
                      Last 24h
                    </button>
                    <button
                      className={timeRange === 168 ? "active" : ""}
                      onClick={() => setTimeRange(168)}
                    >
                      Last 7 days
                    </button>
                    <button
                      className={timeRange === 720 ? "active" : ""}
                      onClick={() => setTimeRange(720)}
                    >
                      Last 30 days
                    </button>
                  </div>
                  <p className="data-points">
                    Showing {yieldData?.timeseries.length} data points
                  </p>
                </div>
                <div className="profit-levers-panel">
                  <h4>Multi-Lever Optimization Control</h4>
                  <div className="levers-grid">
                    <div className="lever-control">
                      <label htmlFor="furnace-temp">
                        Furnace Temp Delta ({furnaceDelta}°C)
                        <span className="hint" title="Higher temperature improves conversion but increases energy cost">
                          i
                        </span>
                      </label>
                      <input
                        id="furnace-temp"
                        type="range"
                        min={yieldData.tuning_model.slider_min}
                        max={yieldData.tuning_model.slider_max}
                        step={1}
                        value={furnaceDelta}
                        onChange={(e) => setFurnaceDelta(Number(e.target.value))}
                      />
                      <span className="lever-value">Δ{furnaceDelta}°C</span>
                    </div>

                    {yieldData.profit_levers && (
                      <>
                        <div className="lever-control">
                          <label htmlFor="pressure">
                            Column Pressure ({profitLevers.column_pressure > 0 ? '+' : ''}{profitLevers.column_pressure} bar)
                            <span className="hint" title={yieldData.profit_levers.column_pressure.description}>
                              i
                            </span>
                          </label>
                          <input
                            id="pressure"
                            type="range"
                            min={-0.6}
                            max={0.7}
                            step={0.1}
                            value={profitLevers.column_pressure}
                            onChange={(e) => setProfitLevers(prev => ({ ...prev, column_pressure: Number(e.target.value) }))}
                          />
                          <span className="lever-value">{(yieldData.profit_levers.column_pressure.current + profitLevers.column_pressure).toFixed(1)} bar</span>
                        </div>

                        <div className="lever-control">
                          <label htmlFor="reflux">
                            Reflux Ratio ({profitLevers.reflux_ratio > 0 ? '+' : ''}{profitLevers.reflux_ratio})
                            <span className="hint" title={yieldData.profit_levers.reflux_ratio.description}>
                              i
                            </span>
                          </label>
                          <input
                            id="reflux"
                            type="range"
                            min={-0.7}
                            max={0.7}
                            step={0.1}
                            value={profitLevers.reflux_ratio}
                            onChange={(e) => setProfitLevers(prev => ({ ...prev, reflux_ratio: Number(e.target.value) }))}
                          />
                          <span className="lever-value">{(yieldData.profit_levers.reflux_ratio.current + profitLevers.reflux_ratio).toFixed(1)}</span>
                        </div>

                        <div className="lever-control">
                          <label htmlFor="flow">
                            Feed Flow Rate ({profitLevers.feed_flow_rate > 0 ? '+' : ''}{profitLevers.feed_flow_rate} m³/h)
                            <span className="hint" title={yieldData.profit_levers.feed_flow_rate.description}>
                              i
                            </span>
                          </label>
                          <input
                            id="flow"
                            type="range"
                            min={-100}
                            max={100}
                            step={10}
                            value={profitLevers.feed_flow_rate}
                            onChange={(e) => setProfitLevers(prev => ({ ...prev, feed_flow_rate: Number(e.target.value) }))}
                          />
                          <span className="lever-value">{(yieldData.profit_levers.feed_flow_rate.current + profitLevers.feed_flow_rate)} m³/h</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="metric">Total Gross Profit Margin: {margin.toFixed(2)}%</div>
                </div>
                {yieldDynamics && (
                  <div className="risk-grid">
                    <div className="kpi-card">
                      <p>Energy Penalty</p>
                      <strong>-{yieldDynamics.energyPenalty.toFixed(2)}%</strong>
                    </div>
                    <div className="kpi-card">
                      <p>Off-Spec Risk</p>
                      <strong>{yieldDynamics.offspecRisk.toFixed(1)}%</strong>
                    </div>
                    <div className="kpi-card">
                      <p>Heater Trip/Coking Risk</p>
                      <strong>{yieldDynamics.tripRisk.toFixed(1)}%</strong>
                    </div>
                    <div className={`kpi-card ${yieldDynamics.zone === "High Risk" ? "risk-high" : yieldDynamics.zone === "Caution" ? "risk-caution" : "risk-safe"}`}>
                      <p>Operating Zone</p>
                      <strong>{yieldDynamics.zone}</strong>
                    </div>
                    <div className="kpi-card uplift">
                      <p>Net Margin (Risk Adjusted)</p>
                      <strong>{yieldDynamics.netMargin.toFixed(2)}%</strong>
                    </div>
                  </div>
                )}
                {yieldDynamics && (
                  <div className="recommendation-card">
                    <h4>Executive Recommendations (Dynamic)</h4>
                    <ul>
                      {yieldDynamics.recommendations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="recommendation-card">
                  <h4>Base Operating Recommendations</h4>
                  <ul>
                    {yieldData.recommended_actions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeYieldTab === "batch-comparison" && batchData && (
              <div>
                <h4>Batch Comparison Analysis</h4>
                <div className="mini-project-banner">
                  <span>Project #2</span>
                  <strong>Historical Batch Performance Intelligence</strong>
                </div>

                <div className="batch-summary-grid">
                  <div className="kpi-card">
                    <p>Total Batches Analyzed</p>
                    <strong>{batchData.summary.total_batches}</strong>
                  </div>
                  <div className="kpi-card">
                    <p>Average Profit Margin</p>
                    <strong>{batchData.summary.avg_profit_margin}%</strong>
                  </div>
                  <div className="kpi-card">
                    <p>Average Efficiency</p>
                    <strong>{batchData.summary.avg_efficiency}%</strong>
                  </div>
                  <div className="kpi-card">
                    <p>Off-Spec Incidents</p>
                    <strong>{batchData.summary.total_offspec_incidents}</strong>
                  </div>
                </div>

                <div className="grade-distribution">
                  <h4>Batch Grade Distribution</h4>
                  <div className="grade-bars">
                    <div className="grade-item">
                      <span className="grade-label">Grade A</span>
                      <div className="grade-bar">
                        <div
                          className="grade-fill grade-a"
                          style={{ width: `${(batchData.summary.grade_distribution.A / batchData.summary.total_batches) * 100}%` }}
                        />
                      </div>
                      <span className="grade-count">{batchData.summary.grade_distribution.A}</span>
                    </div>
                    <div className="grade-item">
                      <span className="grade-label">Grade B</span>
                      <div className="grade-bar">
                        <div
                          className="grade-fill grade-b"
                          style={{ width: `${(batchData.summary.grade_distribution.B / batchData.summary.total_batches) * 100}%` }}
                        />
                      </div>
                      <span className="grade-count">{batchData.summary.grade_distribution.B}</span>
                    </div>
                    <div className="grade-item">
                      <span className="grade-label">Grade C</span>
                      <div className="grade-bar">
                        <div
                          className="grade-fill grade-c"
                          style={{ width: `${(batchData.summary.grade_distribution.C / batchData.summary.total_batches) * 100}%` }}
                        />
                      </div>
                      <span className="grade-count">{batchData.summary.grade_distribution.C}</span>
                    </div>
                  </div>
                </div>

                <Plot
                  data={[
                    {
                      x: batchData.batches.map(b => b.batch_id),
                      y: batchData.batches.map(b => b.profit_margin),
                      name: "Profit Margin (%)",
                      type: "bar",
                      marker: {
                        color: batchData.batches.map(b =>
                          b.grade === "A" ? "#22a06b" : b.grade === "B" ? "#ff9933" : "#d62728"
                        )
                      },
                    },
                    {
                      x: batchData.batches.map(b => b.batch_id),
                      y: batchData.batches.map(b => b.efficiency),
                      name: "Efficiency (%)",
                      type: "scatter",
                      mode: "lines+markers",
                      line: { color: IOCL_BLUE, width: 2 },
                      yaxis: "y2",
                    },
                  ]}
                  layout={{
                    title: { text: "Batch Performance Comparison" },
                    paper_bgcolor: "white",
                    plot_bgcolor: "white",
                    xaxis: { title: { text: "Batch ID" } },
                    yaxis: {
                      title: { text: "Profit Margin (%)" },
                      side: "left"
                    },
                    yaxis2: {
                      title: { text: "Efficiency (%)" },
                      side: "right",
                      overlaying: "y"
                    },
                    height: 400,
                    dragmode: false,
                    modebar: {
                      remove: ['select2d', 'lasso2d']
                    }
                  }}
                  style={{ width: "100%" }}
                />

                <div className="batch-details-grid">
                  {batchData.batches.map((batch) => (
                    <div key={batch.batch_id} className={`batch-card grade-${batch.grade.toLowerCase()}`}>
                      <div className="batch-header">
                        <strong>{batch.batch_id}</strong>
                        <span className={`grade-badge grade-${batch.grade.toLowerCase()}`}>{batch.grade}</span>
                      </div>
                      <div className="batch-metrics">
                        <div className="metric-row">
                          <span>Duration:</span>
                          <strong>{batch.duration}h</strong>
                        </div>
                        <div className="metric-row">
                          <span>Diesel Quality:</span>
                          <strong>{batch.diesel_quality}</strong>
                        </div>
                        <div className="metric-row">
                          <span>Petrol Quality:</span>
                          <strong>{batch.petrol_quality}</strong>
                        </div>
                        <div className="metric-row">
                          <span>Energy:</span>
                          <strong>{batch.energy_consumption}</strong>
                        </div>
                      </div>
                      {batch.offspec_incidents > 0 && (
                        <div className="alert-text">Off-spec incidents: {batch.offspec_incidents}</div>
                      )}
                      <div className="batch-recommendations">
                        <h5>Recommendations:</h5>
                        <ul>
                          {batch.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeYieldTab === "realtime-monitoring" && realtimeData && (
              <div>
                <h4>Real-time Monitoring Dashboard</h4>
                <div className="mini-project-banner">
                  <span>Project #3</span>
                  <strong>Live Operations Intelligence Center</strong>
                </div>

                <div className="system-health-bar">
                  <div className="health-indicator">
                    <span className="health-label">DCS Connectivity:</span>
                    <span className={`health-status ${realtimeData.system_health.dcs_connectivity}`}>
                      {realtimeData.system_health.dcs_connectivity}
                    </span>
                  </div>
                  <div className="health-indicator">
                    <span className="health-label">Sensor Status:</span>
                    <span className={`health-status ${realtimeData.system_health.sensor_status}`}>
                      {realtimeData.system_health.sensor_status}
                    </span>
                  </div>
                  <div className="health-indicator">
                    <span className="health-label">Uptime:</span>
                    <span className="health-status">{realtimeData.system_health.uptime_percentage}%</span>
                  </div>
                  <div className="health-indicator">
                    <span className="health-label">Last Update:</span>
                    <span className="health-status">
                      {new Date(realtimeData.system_health.last_update).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {realtimeData.active_alerts.length > 0 && (
                  <div className="alerts-panel">
                    <h4>Active Alerts</h4>
                    {realtimeData.active_alerts.map((alert, idx) => (
                      <div key={idx} className={`alert-item ${alert.level}`}>
                        <span className="alert-level">{alert.level.toUpperCase()}</span>
                        <span className="alert-message">{alert.message}</span>
                        <span className="alert-time">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="realtime-grid">
                  <div className="sensor-card">
                    <h4>Process Parameters</h4>
                    <div className="sensor-reading">
                      <span>Furnace Outlet Temp</span>
                      <strong>{realtimeData.current_readings.furnace_outlet_temp}°C</strong>
                      <span className={`trend ${realtimeData.trend_indicators.furnace_temp_trend}`}>
                        {realtimeData.trend_indicators.furnace_temp_trend}
                      </span>
                    </div>
                    <div className="sensor-reading">
                      <span>Column Pressure</span>
                      <strong>{realtimeData.current_readings.column_pressure} bar</strong>
                    </div>
                    <div className="sensor-reading">
                      <span>Reflux Ratio</span>
                      <strong>{realtimeData.current_readings.reflux_ratio}</strong>
                    </div>
                    <div className="sensor-reading">
                      <span>Feed Flow Rate</span>
                      <strong>{realtimeData.current_readings.feed_flow_rate} m³/h</strong>
                    </div>
                  </div>

                  <div className="sensor-card">
                    <h4>Quality Metrics</h4>
                    <div className="sensor-reading">
                      <span>Diesel Quality Index</span>
                      <strong>{realtimeData.current_readings.diesel_quality_index}</strong>
                      <span className={`trend ${realtimeData.trend_indicators.quality_trend}`}>
                        {realtimeData.trend_indicators.quality_trend}
                      </span>
                    </div>
                    <div className="sensor-reading">
                      <span>Petrol Quality Index</span>
                      <strong>{realtimeData.current_readings.petrol_quality_index}</strong>
                    </div>
                    <div className="sensor-reading">
                      <span>Energy Consumption</span>
                      <strong>{realtimeData.current_readings.energy_consumption}</strong>
                    </div>
                    <div className="sensor-reading">
                      <span>Flare Rate</span>
                      <strong>{realtimeData.current_readings.flare_rate} Nm³/h</strong>
                    </div>
                  </div>

                  <div className="sensor-card">
                    <h4>Equipment Health</h4>
                    <div className="sensor-reading">
                      <span>Compressor Vibration</span>
                      <strong>{realtimeData.current_readings.compressor_vibration} mm/s</strong>
                    </div>
                    <div className="sensor-reading">
                      <span>Pump Discharge Pressure</span>
                      <strong>{realtimeData.current_readings.pump_discharge_pressure} bar</strong>
                    </div>
                    <div className="sensor-reading">
                      <span>Model Inference Time</span>
                      <strong>{realtimeData.system_health.model_inference_time_ms} ms</strong>
                    </div>
                    <div className="sensor-reading">
                      <span>Data Latency</span>
                      <strong>{realtimeData.system_health.data_latency_seconds} s</strong>
                    </div>
                  </div>
                </div>

                <div className="performance-metrics">
                  <h4>Performance Metrics</h4>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <span>Prediction Accuracy</span>
                      <strong>{realtimeData.performance_metrics.prediction_accuracy}%</strong>
                    </div>
                    <div className="metric-card">
                      <span>Optimization Uptime</span>
                      <strong>{realtimeData.performance_metrics.optimization_uptime}</strong>
                    </div>
                    <div className="metric-card">
                      <span>Daily Profit Impact</span>
                      <strong>INR {realtimeData.performance_metrics.daily_profit_impact} Lakh</strong>
                    </div>
                    <div className="metric-card">
                      <span>Energy Efficiency</span>
                      <strong>{realtimeData.performance_metrics.energy_efficiency}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeYieldTab === "advanced-viz" && advancedVizData && (
              <div>
                <h4>Advanced Visualization Analytics</h4>
                <div className="mini-project-banner">
                  <span>Project #4</span>
                  <strong>Multi-Dimensional Optimization Intelligence</strong>
                </div>

                <div className="optimal-point-card">
                  <h4>Optimal Operating Point</h4>
                  <div className="optimal-metrics">
                    <div className="optimal-metric">
                      <span>Furnace Temperature</span>
                      <strong>{advancedVizData.optimal_operating_point.furnace_temp}°C</strong>
                    </div>
                    <div className="optimal-metric">
                      <span>Column Pressure</span>
                      <strong>{advancedVizData.optimal_operating_point.column_pressure} bar</strong>
                    </div>
                    <div className="optimal-metric">
                      <span>Expected Profit</span>
                      <strong>{advancedVizData.optimal_operating_point.expected_profit}%</strong>
                    </div>
                    <div className="optimal-metric">
                      <span>Confidence</span>
                      <strong>{advancedVizData.optimal_operating_point.confidence}%</strong>
                    </div>
                  </div>
                </div>

                <div className="viz-grid" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div className="viz-card">
                    <h4>Profit Surface Contour Map</h4>
                    <Plot
                      data={[
                        {
                          z: advancedVizData.heat_map.profit_surface,
                          x: advancedVizData.heat_map.furnace_temps,
                          y: advancedVizData.heat_map.column_pressures,
                          type: 'contour',
                          colorscale: [
                            [0, '#2E4057'],
                            [0.25, '#048A81'],
                            [0.5, '#54C6EB'],
                            [0.75, '#8FC93A'],
                            [1, '#F18F01']
                          ],
                          contours: {
                            coloring: 'heatmap',
                            showlabels: true,
                            labelfont: { size: 12, color: 'white' }
                          },
                          line: { smoothing: 0.85 },
                          colorbar: {
                            title: { text: "Profit Margin (%)", side: "right" }
                          }
                        }
                      ]}
                      layout={{
                        title: { text: "Profit Landscape: Temperature vs Pressure" },
                        xaxis: { title: { text: "Furnace Temperature (°C)" } },
                        yaxis: { title: { text: "Column Pressure (bar)" } },
                        height: 400,
                        dragmode: false,
                        modebar: {
                          remove: ['select2d', 'lasso2d']
                        }
                      }}
                      useResizeHandler={true}
                      style={{ width: "100%", height: "100%" }}
                    />
                    <div className="graph-interpretation">
                      <h5>ℹ️ Graph Interpretation</h5>
                      <p><strong>X & Y Axes:</strong> Represent the Furnace Temperature and Column Pressure tuning levers.</p>
                      <p><strong>Contours & Color:</strong> The topographic gradient maps the absolute profitability. Target the "orange" peaks for optimal operating conditions where yields are maximized against energy costs.</p>
                    </div>
                  </div>

                  <div className="viz-card">
                    <h4>3D Quality Response Surface</h4>
                    <Plot
                      data={[
                        {
                          x: advancedVizData.surface_3d.map(d => d.furnace_temp),
                          y: advancedVizData.surface_3d.map(d => d.column_pressure),
                          z: advancedVizData.surface_3d.map(d => d.diesel_quality),
                          type: 'mesh3d',
                          opacity: 0.8,
                          intensity: advancedVizData.surface_3d.map(d => d.diesel_quality),
                          colorscale: 'Viridis',
                          showscale: true,
                          colorbar: { title: { text: "Diesel Quality", font: { color: "#1a202c" } }, x: 1.10 },
                          name: "Diesel Quality",
                          hoverinfo: "x+y+z+name",
                          hoverlabel: {
                            bgcolor: advancedVizData.surface_3d.map(d => getViridisColor(d.diesel_quality)),
                            font: { color: 'white' }
                          }
                        } as any,
                        {
                          x: advancedVizData.surface_3d.map(d => d.furnace_temp),
                          y: advancedVizData.surface_3d.map(d => d.column_pressure),
                          z: advancedVizData.surface_3d.map(d => d.petrol_quality),
                          type: 'scatter3d',
                          mode: 'markers',
                          marker: {
                            size: 6,
                            color: advancedVizData.surface_3d.map(d => d.petrol_quality),
                            colorscale: 'Plasma',
                            showscale: true,
                            opacity: 0.9,
                            line: { width: 1, color: 'white' },
                            colorbar: { title: { text: "Petrol Quality", font: { color: "#1a202c" } }, x: -0.15 }
                          },
                          name: "Petrol Quality",
                          hoverinfo: "x+y+z+name"
                        }
                      ]}
                      layout={{
                        title: { text: "Advanced Quality Topology", font: { color: "#003366", family: "Inter", size: 16 } },
                        font: { color: "#1a202c", family: "Inter", size: 11 },
                        scene: {
                          xaxis: { title: { text: "Furnace Temp (°C)", font: { size: 10 } }, tickfont: { size: 9 } },
                          yaxis: { title: { text: "Pressure (bar)", font: { size: 10 } }, tickfont: { size: 9 } },
                          zaxis: { title: { text: "Quality", font: { size: 10 } }, tickfont: { size: 9 } },
                          camera: {
                            eye: { x: 1.6, y: 1.6, z: 1.2 }
                          }
                        },
                        margin: { l: 10, r: 10, b: 10, t: 40 },
                        legend: { title: { text: 'Key', font: { size: 10 } }, x: 0.02, y: 0.98, xanchor: 'left', yanchor: 'top', font: { size: 9 } },
                        autosize: true,
                        dragmode: "turntable",
                        modebar: {
                          remove: ['select2d', 'lasso2d']
                        }
                      }}
                      useResizeHandler={true}
                      style={{ width: "100%", height: "100%" }}
                    />
                    <div className="graph-interpretation">
                      <h5>ℹ️ Comprehensive Graph Interpretation</h5>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <p style={{ margin: 0 }}><strong>The Continuous 3D Mesh (Diesel Quality):</strong></p>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4c5d74' }}>
                          <li><strong>What it represents:</strong> The flowing 3D landscape maps out the predicted Diesel Quality Index.</li>
                          <li><strong>Right-Side Colorbar (Yellow to Purple):</strong> The legend for the mesh. <strong>Bright Yellow</strong> represents the highest peaks (best Diesel Quality). <strong>Purple/Blue</strong> represents the valleys (worst Diesel Quality).</li>
                        </ul>

                        <p style={{ margin: 0 }}><strong>The Data Points (Petrol Quality):</strong></p>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4c5d74' }}>
                          <li><strong>What they represent:</strong> The floating scatter dots plotted over the graph represent predicted Petrol Quality at those exact same coordinates.</li>
                          <li><strong>Yellow/Red vs Purple:</strong> The dots use their own color scale (legend on the left). <strong>Yellow dots</strong> indicate exceptional Petrol Quality, <strong>Red/Magenta</strong> is medium, and <strong>Dark Purple</strong> is low.</li>
                        </ul>

                        <p style={{ margin: 0 }}><strong>How to Use This (Trade-off Intelligence):</strong></p>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4c5d74' }}>
                          <li>To maximize total yield, hunt for the "Sweet Spot": an area where the <strong>3D mesh peaks (Yellow)</strong> AND the <strong>floating points around it are also Yellow/Red</strong>.</li>
                          <li>If you tune exclusively for a yellow peak on the mesh, but the dots there are dark purple, it signifies a bad trade-off (great diesel, off-spec petrol).</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="correlation-matrix">
                  <h4>Parameter Correlations</h4>
                  <div className="correlation-grid">
                    <div className="correlation-item">
                      <span>Furnace Temp ↔ Diesel Quality</span>
                      <div className="correlation-bar">
                        <div
                          className="correlation-fill positive"
                          style={{ width: `${Math.abs(advancedVizData.correlations.furnace_temp_vs_diesel) * 100}%` }}
                        />
                      </div>
                      <strong>{advancedVizData.correlations.furnace_temp_vs_diesel}</strong>
                    </div>
                    <div className="correlation-item">
                      <span>Furnace Temp ↔ Petrol Quality</span>
                      <div className="correlation-bar">
                        <div
                          className="correlation-fill positive"
                          style={{ width: `${Math.abs(advancedVizData.correlations.furnace_temp_vs_petrol) * 100}%` }}
                        />
                      </div>
                      <strong>{advancedVizData.correlations.furnace_temp_vs_petrol}</strong>
                    </div>
                    <div className="correlation-item">
                      <span>Pressure ↔ Diesel Quality</span>
                      <div className="correlation-bar">
                        <div
                          className="correlation-fill negative"
                          style={{ width: `${Math.abs(advancedVizData.correlations.pressure_vs_diesel) * 100}%` }}
                        />
                      </div>
                      <strong>{advancedVizData.correlations.pressure_vs_diesel}</strong>
                    </div>
                    <div className="correlation-item">
                      <span>Pressure ↔ Petrol Quality</span>
                      <div className="correlation-bar">
                        <div
                          className="correlation-fill"
                          style={{ width: `${Math.abs(advancedVizData.correlations.pressure_vs_petrol) * 100}%` }}
                        />
                      </div>
                      <strong>{advancedVizData.correlations.pressure_vs_petrol}</strong>
                    </div>
                    <div className="correlation-item">
                      <span>Flow Rate ↔ Diesel Quality</span>
                      <div className="correlation-bar">
                        <div
                          className="correlation-fill positive"
                          style={{ width: `${Math.abs(advancedVizData.correlations.flow_vs_diesel) * 100}%` }}
                        />
                      </div>
                      <strong>{advancedVizData.correlations.flow_vs_diesel}</strong>
                    </div>
                    <div className="correlation-item">
                      <span>Flow Rate ↔ Petrol Quality</span>
                      <div className="correlation-bar">
                        <div
                          className="correlation-fill positive"
                          style={{ width: `${Math.abs(advancedVizData.correlations.flow_vs_petrol) * 100}%` }}
                        />
                      </div>
                      <strong>{advancedVizData.correlations.flow_vs_petrol}</strong>
                    </div>
                    <div className="correlation-item">
                      <span>Reflux Ratio ↔ Diesel Quality</span>
                      <div className="correlation-bar">
                        <div
                          className="correlation-fill positive"
                          style={{ width: `${Math.abs(advancedVizData.correlations.reflux_vs_diesel) * 100}%` }}
                        />
                      </div>
                      <strong>{advancedVizData.correlations.reflux_vs_diesel}</strong>
                    </div>
                    <div className="correlation-item">
                      <span>Reflux Ratio ↔ Petrol Quality</span>
                      <div className="correlation-bar">
                        <div
                          className="correlation-fill positive"
                          style={{ width: `${Math.abs(advancedVizData.correlations.reflux_vs_petrol) * 100}%` }}
                        />
                      </div>
                      <strong>{advancedVizData.correlations.reflux_vs_petrol}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeModule === "Predictive Maintenance" && maintenanceData && dynamicMaintenance && (
          <section>
            <h3>Predictive Maintenance</h3>
            <div className="mini-project-banner">
              <span>Project #5</span>
              <strong>AI Equipment Reliability Center</strong>
            </div>

            <div className="psv-grid">
              <div className="psv-card">
                <h4>Problem</h4>
                <p>{maintenanceData.problem_solution_value.problem}</p>
              </div>
              <div className="psv-card">
                <h4>Solution</h4>
                <p>{maintenanceData.problem_solution_value.solution}</p>
              </div>
              <div className="psv-card value">
                <h4>Value</h4>
                <p>{maintenanceData.problem_solution_value.value}</p>
              </div>
              <div className="psv-card value">
                <h4>ML / AI Impact</h4>
                <p>{maintenanceData.problem_solution_value.ml_usecase}</p>
                <span className="view-workflow-link" onClick={() => setWorkflowProject("maintenance")}>
                  View Workflow <span className="arrow">→</span>
                </span>
              </div>
            </div>

            <div className="profit-levers-panel">
              <h4>Dynamic Operational Levers</h4>
              <div className="levers-grid">
                <div className="lever-control">
                  <label htmlFor="pump-load">
                    Pump Load Adjustment ({maintenanceLevers.pump_load_pct > 0 ? '+' : ''}{maintenanceLevers.pump_load_pct}%)
                  </label>
                  <input
                    id="pump-load"
                    type="range"
                    min={-35}
                    max={25}
                    step={5}
                    value={maintenanceLevers.pump_load_pct}
                    onChange={(e) => setMaintenanceLevers(prev => ({ ...prev, pump_load_pct: Number(e.target.value) }))}
                  />
                  <span className="lever-value">{(maintenanceData.levers.pump_load_pct.current + maintenanceLevers.pump_load_pct)}%</span>
                </div>
                <div className="lever-control">
                  <label htmlFor="cooling-temp">
                    Cooling Water Temp Delta ({maintenanceLevers.cooling_temp > 0 ? '+' : ''}{maintenanceLevers.cooling_temp}°C)
                  </label>
                  <input
                    id="cooling-temp"
                    type="range"
                    min={-7}
                    max={13}
                    step={1}
                    value={maintenanceLevers.cooling_temp}
                    onChange={(e) => setMaintenanceLevers(prev => ({ ...prev, cooling_temp: Number(e.target.value) }))}
                  />
                  <span className="lever-value">{(maintenanceData.levers.cooling_temp.current + maintenanceLevers.cooling_temp)}°C</span>
                </div>
              </div>
            </div>

            <Plot
              data={[
                {
                  x: dynamicMaintenance.history.map((d) => d.day),
                  y: dynamicMaintenance.history.map((d) => d.rul_predicted),
                  name: "Predicted RUL",
                  type: "scatter",
                  mode: "lines",
                  line: { color: IOCL_BLUE, width: 3 },
                },
                {
                  x: dynamicMaintenance.history.map((d) => d.day),
                  y: dynamicMaintenance.history.map((d) => 72),
                  name: "Critical Alert Threshold (< 72hrs)",
                  type: "scatter",
                  mode: "lines",
                  line: { color: ALERT_RED, dash: "dash" },
                }
              ]}
              layout={{
                title: { text: "Average Fleet Degradation Curve vs Expected RUL" },
                paper_bgcolor: "white",
                plot_bgcolor: "white",
                xaxis: { title: { text: "Days (0 = Today)" } },
                yaxis: { title: { text: "Remaining Useful Life (Hours)" } },
                height: 350,
              }}
              style={{ width: "100%", marginBottom: "20px" }}
            />
            <div className="graph-interpretation" style={{ marginBottom: "20px" }}>
              <h5>ℹ️ Graph Interpretation</h5>
              <p><strong>Blue Line (Predicted RUL):</strong> Shows the AI-predicted degradation of the fleet's Remaining Useful Life over the coming days based on dynamic variables like pump load and cooling temperature.</p>
              <p><strong>Red Dashed Line:</strong> The 72-hour critical alert threshold. An intersection warns of impending mandatory maintenance downtime.</p>
            </div>

            <div className="grid-cards">
              {dynamicMaintenance.assets.map((asset) => (
                <div key={asset.name} className="asset-card">
                  <div className="asset-top">
                    <strong>{asset.name}</strong>
                    <span style={{ color: asset.status === "alert" ? ALERT_RED : IOCL_BLUE }}>
                      {asset.hours_remaining} hrs
                    </span>
                  </div>
                  <progress max={1} value={asset.rul_ratio} className={asset.status === "alert" ? "alert" : ""} />
                  {asset.status === "alert" && (
                    <p className="alert-text">ALERT: Failure predicted within 72 hours window.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeModule === "Benzene Safety (Winterization)" && benzeneData && dynamicBenzene && (
          <section>
            <h3>Benzene Safety (Winterization)</h3>
            <div className="mini-project-banner">
              <span>Project #6</span>
              <strong>Predictive Winterization Guard</strong>
            </div>

            <div className="psv-grid">
              <div className="psv-card">
                <h4>Problem</h4>
                <p>{benzeneData.problem_solution_value.problem}</p>
              </div>
              <div className="psv-card">
                <h4>Solution</h4>
                <p>{benzeneData.problem_solution_value.solution}</p>
              </div>
              <div className="psv-card value">
                <h4>Value</h4>
                <p>{benzeneData.problem_solution_value.value}</p>
              </div>
              <div className="psv-card value">
                <h4>ML / AI Impact</h4>
                <p>{benzeneData.problem_solution_value.ml_usecase}</p>
                <span className="view-workflow-link" onClick={() => setWorkflowProject("benzene")}>
                  View Workflow <span className="arrow">→</span>
                </span>
              </div>
            </div>

            <div className="profit-levers-panel">
              <h4>Weather & Response Simulator</h4>
              <div className="levers-grid">
                <div className="lever-control">
                  <label htmlFor="steam-flow">
                    Steam Tracing Flow Offset (+{benzeneLevers.steam_flow_pct}%)
                  </label>
                  <input
                    id="steam-flow"
                    type="range"
                    min={0}
                    max={60}
                    step={5}
                    value={benzeneLevers.steam_flow_pct}
                    onChange={(e) => setBenzeneLevers(prev => ({ ...prev, steam_flow_pct: Number(e.target.value) }))}
                  />
                  <span className="lever-value">{(benzeneData.levers.steam_flow_pct.current + benzeneLevers.steam_flow_pct)}%</span>
                </div>
                <div className="lever-control">
                  <label htmlFor="ambient-offset">
                    Ambient Temp Offset ({benzeneLevers.ambient_offset > 0 ? '+' : ''}{benzeneLevers.ambient_offset}°C)
                  </label>
                  <input
                    id="ambient-offset"
                    type="range"
                    min={-15}
                    max={15}
                    step={1}
                    value={benzeneLevers.ambient_offset}
                    onChange={(e) => setBenzeneLevers(prev => ({ ...prev, ambient_offset: Number(e.target.value) }))}
                  />
                  <span className="lever-value">{(10 + benzeneLevers.ambient_offset)}°C</span>
                </div>
              </div>
            </div>

            <Plot
              data={[
                {
                  x: dynamicBenzene.segments.map((d) => d.distance_m),
                  y: dynamicBenzene.segments.map((d) => d.surface_temp),
                  name: "Pipe Surface Temp",
                  type: "scatter",
                  mode: "lines+markers",
                  line: { color: IOCL_SAFFRON, width: 3 },
                },
                {
                  x: dynamicBenzene.segments.map((d) => d.distance_m),
                  y: dynamicBenzene.segments.map((d) => d.ambient_temp),
                  name: "Ambient Temp",
                  type: "scatter",
                  mode: "lines",
                  line: { color: "#4C78A8", dash: "dot" },
                },
                {
                  x: dynamicBenzene.segments.map((d) => d.distance_m),
                  y: dynamicBenzene.segments.map((d) => benzeneData.threshold),
                  name: "Solidification Threshold (5.5°C)",
                  type: "scatter",
                  mode: "lines",
                  line: { color: ALERT_RED },
                }
              ]}
              layout={{
                title: { text: "Temperature Profile Along Benzene Transfer Line" },
                paper_bgcolor: "white",
                plot_bgcolor: "white",
                xaxis: { title: { text: "Pipeline Distance (m)" } },
                yaxis: { title: { text: "Temperature (°C)" } },
                height: 350,
              }}
              style={{ width: "100%", marginBottom: "20px" }}
            />
            <div className="graph-interpretation" style={{ marginBottom: "20px" }}>
              <h5>ℹ️ Graph Interpretation</h5>
              <p><strong>Saffron Line (Surface Temp):</strong> The simulated outer pipe temperature along the benzene transfer line segments.</p>
              <p><strong>Red Line (Solidification Threshold):</strong> Benzene freezes below 5.5°C. Operators must use steam tracing levers to keep the surface temp above this line to prevent pipeline blockages.</p>
            </div>

            <div className="grid-cards">
              {dynamicBenzene.segments.map((segment) => (
                <div key={segment.segment} className={segment.risk === "High" ? "pipe-card high" : "pipe-card"}>
                  <h4>{segment.segment}</h4>
                  <p>Ambient: {segment.ambient_temp}°C</p>
                  <p>Surface: {segment.surface_temp}°C</p>
                  <p className="risk-text">Risk: {segment.risk}</p>
                </div>
              ))}
            </div>
            <div className="alert-log">{benzeneData.alert_log}</div>
          </section>
        )}

        {activeModule === "Flare & ESG Tracker" && flareData && dynamicFlare && (
          <section>
            <h3>Flare & ESG Tracker</h3>
            <div className="mini-project-banner">
              <span>Project #7</span>
              <strong>AI ESG Conformance Guardian</strong>
            </div>

            <div className="psv-grid">
              <div className="psv-card">
                <h4>Problem</h4>
                <p>{flareData.problem_solution_value.problem}</p>
              </div>
              <div className="psv-card">
                <h4>Solution</h4>
                <p>{flareData.problem_solution_value.solution}</p>
              </div>
              <div className="psv-card value">
                <h4>Value</h4>
                <p>{flareData.problem_solution_value.value}</p>
              </div>
              <div className="psv-card value">
                <h4>ML / AI Impact</h4>
                <p>{flareData.problem_solution_value.ml_usecase}</p>
                <span className="view-workflow-link" onClick={() => setWorkflowProject("flare")}>
                  View Workflow <span className="arrow">→</span>
                </span>
              </div>
            </div>

            <div className="profit-levers-panel">
              <h4>ESG Intervention Simulator</h4>
              <div className="levers-grid">
                <div className="lever-control">
                  <label htmlFor="recycle-valve">
                    Compressor Recycle Valve Op (+{flareLevers.recycle_valve}%)
                  </label>
                  <input
                    id="recycle-valve"
                    type="range"
                    min={0}
                    max={65}
                    step={5}
                    value={flareLevers.recycle_valve}
                    onChange={(e) => setFlareLevers(prev => ({ ...prev, recycle_valve: Number(e.target.value) }))}
                  />
                  <span className="lever-value">{(flareData.levers.recycle_valve.current + flareLevers.recycle_valve)}%</span>
                </div>
                <div className="lever-control">
                  <label htmlFor="flare-pressure">
                    Upstream Surge ({flareLevers.upstream_pressure_offset > 0 ? '+' : ''}{flareLevers.upstream_pressure_offset} bar)
                  </label>
                  <input
                    id="flare-pressure"
                    type="range"
                    min={-1.5}
                    max={1.5}
                    step={0.1}
                    value={flareLevers.upstream_pressure_offset}
                    onChange={(e) => setFlareLevers(prev => ({ ...prev, upstream_pressure_offset: Number(e.target.value) }))}
                  />
                  <span className="lever-value">{(4.8 + flareLevers.upstream_pressure_offset).toFixed(1)} bar</span>
                </div>
              </div>
            </div>

            <div className="two-col-grid">
              <Plot
                data={[
                  {
                    type: "indicator",
                    mode: "gauge+number",
                    value: dynamicFlare.current_flare,
                    title: { text: "Flaring Volume (Nm³/h)" },
                    gauge: {
                      axis: { range: [0, 300] },
                      bar: { color: IOCL_SAFFRON },
                      threshold: { line: { color: ALERT_RED, width: 4 }, value: flareData.threshold },
                    },
                  },
                ]}
                layout={{ height: 350, margin: { t: 80, b: 20, l: 40, r: 40 } }}
                useResizeHandler={true}
                style={{ width: "100%" }}
              />
              <Plot
                data={[
                  {
                    values: dynamicFlare.sources.map(s => s.volume_pct),
                    labels: dynamicFlare.sources.map(s => s.source),
                    type: 'pie',
                    hole: 0.4,
                    marker: {
                      colors: ['#2E4057', '#F58518', '#048A81', '#E15759']
                    }
                  }
                ]}
                layout={{
                  title: { text: "Flaring Sources Breakdown" },
                  height: 350,
                  margin: { t: 60, b: 40, l: 20, r: 20 },
                  legend: { orientation: 'h', y: -0.2 }
                }}
                useResizeHandler={true}
                style={{ width: "100%" }}
              />
              <Plot
                data={[
                  {
                    x: flareData.recent_actual.map((d) => d.timestamp),
                    y: flareData.recent_actual.map((d) => d.flare_actual),
                    mode: "lines",
                    type: "scatter",
                    name: "Actual History",
                    line: { color: IOCL_BLUE, width: 3 },
                  },
                  {
                    x: dynamicFlare.forecast.map((d) => d.timestamp),
                    y: dynamicFlare.forecast.map((d) => d.flare_predicted),
                    mode: "lines",
                    type: "scatter",
                    name: "ML Forecast",
                    line: { color: ALERT_RED, width: 3, dash: "dot" },
                  },
                ]}
                layout={{ title: { text: "30-Minute AI Forecast vs Actual" }, height: 350 }}
                useResizeHandler={true}
                className="full-span"
                style={{ width: "100%" }}
              />
            </div>
            <div className="graph-interpretation" style={{ marginBottom: "20px" }}>
              <h5>ℹ️ Multi-Graph Interpretation</h5>
              <p><strong>Gauge:</strong> Real-time flaring volume with a red threshold indicating the maximum ESG quota.</p>
              <p><strong>Pie Chart:</strong> Breakdown of contributing sources causing current flare pressure.</p>
              <p><strong>30-Minute AI Forecast:</strong> The blue line shows actual history, while the dotted red line projects future flaring given the current simulated surges. Use the recycle valve to bend this forecast safely below limits.</p>
            </div>
            {dynamicFlare.current_flare > flareData.threshold ? (
              <p className="alert-text">CRITICAL BREACH: Flaring volume has exceeded ESG quota limits!</p>
            ) : (
              <p className="alert-text">{flareData.message}</p>
            )}
          </section>
        )}
      </main>
      {workflowProject && (
        <AiWorkflowModal
          projectKey={workflowProject}
          onClose={() => setWorkflowProject(null)}
        />
      )}
    </div>
  );
}

export default App;
