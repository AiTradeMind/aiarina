import { monitoringEngine } from "../engines/MonitoringEngine";

export class MonitoringService {
  async getHealth(): Promise<any> {
    return await monitoringEngine.getSystemHealth();
  }

  async getMetrics(): Promise<any> {
    return await monitoringEngine.getMetrics();
  }
}

export const monitoringService = new MonitoringService();
