export type YieldPoint = {
  timestamp: string;
  diesel_pred: number;
  diesel_lab: number;
  petrol_pred: number;
  petrol_lab: number;
  furnace_temp: number;
};

export type ProfitLever = {
  current: number;
  min: number;
  max: number;
  unit: string;
  impact_per_unit: number;
  description: string;
};

export type YieldResponse = {
  timeseries: YieldPoint[];
  base_profit_margin: number;
  profit_per_degree: number;
  problem_solution_value: {
    problem: string;
    solution: string;
    value: string;
    ml_usecase: string;
  };
  kpis: {
    model_confidence_pct: number;
    diesel_gap_avg: number;
    petrol_gap_avg: number;
    estimated_daily_uplift_inr_lakh: number;
  };
  recommended_actions: string[];
  tuning_model: {
    slider_min: number;
    slider_max: number;
    safe_delta_upper: number;
    caution_delta_upper: number;
    energy_penalty_per_degree: number;
    extra_energy_penalty_after_caution: number;
    offspec_risk_per_degree: number;
    base_offspec_risk: number;
  };
  profit_levers: {
    furnace_temp: ProfitLever;
    column_pressure: ProfitLever;
    reflux_ratio: ProfitLever;
    feed_flow_rate: ProfitLever;
  };
};

export type PSVAndML = {
  problem: string;
  solution: string;
  value: string;
  ml_usecase: string;
};

export type MaintenanceAsset = {
  name: string;
  rul_ratio: number;
  hours_remaining: number;
  status: "normal" | "alert";
  base_degradation_rate: number;
};

export type MaintenanceResponse = {
  problem_solution_value: PSVAndML;
  levers: {
    pump_load_pct: ProfitLever;
    cooling_temp: ProfitLever;
  };
  degradation_history: Array<{
    day: number;
    rul_predicted: number;
    vibration_level: number;
  }>;
  assets: MaintenanceAsset[];
};

export type BenzeneSegment = {
  segment: string;
  distance_m: number;
  ambient_temp: number;
  surface_temp: number;
  risk: "High" | "Normal";
};

export type BenzeneResponse = {
  problem_solution_value: PSVAndML;
  levers: {
    steam_flow_pct: ProfitLever;
    ambient_offset: ProfitLever;
  };
  threshold: number;
  segments: BenzeneSegment[];
  alert_log: string;
};

export type FlarePoint = {
  timestamp: string;
  flare_actual: number;
  upstream_pressure: number;
};

export type FlareForecastPoint = {
  timestamp: string;
  flare_predicted: number;
};

export type BatchData = {
  batch_id: string;
  start_time: string;
  duration: number;
  diesel_quality: number;
  petrol_quality: number;
  profit_margin: number;
  efficiency: number;
  offspec_incidents: number;
  energy_consumption: number;
  grade: "A" | "B" | "C";
  recommendations: string[];
};

export type BatchComparisonResponse = {
  batches: BatchData[];
  summary: {
    total_batches: number;
    avg_profit_margin: number;
    avg_efficiency: number;
    total_offspec_incidents: number;
    grade_distribution: {
      A: number;
      B: number;
      C: number;
    };
  };
};

export type RealtimeMonitoringResponse = {
  current_readings: {
    furnace_outlet_temp: number;
    column_pressure: number;
    reflux_ratio: number;
    feed_flow_rate: number;
    diesel_quality_index: number;
    petrol_quality_index: number;
    energy_consumption: number;
    flare_rate: number;
    compressor_vibration: number;
    pump_discharge_pressure: number;
  };
  system_health: {
    dcs_connectivity: string;
    sensor_status: string;
    model_inference_time_ms: number;
    data_latency_seconds: number;
    last_update: string;
    uptime_percentage: number;
  };
  active_alerts: Array<{
    level: "warning" | "alert";
    message: string;
    timestamp: string;
  }>;
  performance_metrics: {
    prediction_accuracy: number;
    optimization_uptime: string;
    daily_profit_impact: number;
    energy_efficiency: number;
  };
  trend_indicators: {
    furnace_temp_trend: string;
    quality_trend: string;
    efficiency_trend: string;
  };
};

export type AdvancedVisualizationResponse = {
  heat_map: {
    furnace_temps: number[];
    column_pressures: number[];
    profit_surface: number[][];
  };
  surface_3d: Array<{
    furnace_temp: number;
    column_pressure: number;
    diesel_quality: number;
    petrol_quality: number;
    energy_cost: number;
  }>;
  correlations: {
    furnace_temp_vs_diesel: number;
    furnace_temp_vs_petrol: number;
    pressure_vs_diesel: number;
    pressure_vs_petrol: number;
    flow_vs_diesel: number;
    flow_vs_petrol: number;
    reflux_vs_diesel: number;
    reflux_vs_petrol: number;
  };
  optimal_operating_point: {
    furnace_temp: number;
    column_pressure: number;
    expected_profit: number;
    confidence: number;
  };
};

export type FlareResponse = {
  problem_solution_value: PSVAndML;
  levers: {
    recycle_valve: ProfitLever;
    upstream_pressure_offset: ProfitLever;
  };
  sources: Array<{
    source: string;
    volume_pct: number;
  }>;
  current_flare: number;
  threshold: number;
  recent_actual: FlarePoint[];
  forecast: FlareForecastPoint[];
  message: string;
};
