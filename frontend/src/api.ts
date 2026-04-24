import type { AdvancedVisualizationResponse, BatchComparisonResponse, BenzeneResponse, FlareResponse, MaintenanceResponse, RealtimeMonitoringResponse, YieldResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getYield: (hours: number = 24) => getJson<YieldResponse>(`/api/yield?hours=${hours}`),
  getMaintenance: () => getJson<MaintenanceResponse>("/api/maintenance"),
  getBenzene: () => getJson<BenzeneResponse>("/api/benzene"),
  getFlare: () => getJson<FlareResponse>("/api/flare"),
  getBatchComparison: () => getJson<BatchComparisonResponse>("/api/batch-comparison"),
  getRealtimeMonitoring: () => getJson<RealtimeMonitoringResponse>("/api/realtime-monitoring"),
  getAdvancedVisualization: () => getJson<AdvancedVisualizationResponse>("/api/advanced-visualization"),
};
