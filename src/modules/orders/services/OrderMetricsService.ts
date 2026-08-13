import { orderMetricsRepository } from "../repositories/OrderMetricsRepository.ts";

export class OrderMetricsService {
  public async recordEvent(organizationId: string, eventType: string, volume: number = 0): Promise<void> {
    try {
      await orderMetricsRepository.incrementMetric(organizationId, eventType, 1, volume);
    } catch (error) {
      console.error("Failed to record order metric:", error);
    }
  }

  public async getMetrics(organizationId: string, date?: string): Promise<any> {
    if (date) {
      return await orderMetricsRepository.getMetricsByDate(organizationId, date);
    }
    
    // Default to today
    const today = new Date().toISOString().split('T')[0];
    return await orderMetricsRepository.getMetricsByDate(organizationId, today);
  }

  public async getMetricsRange(organizationId: string, startDate: string, endDate: string): Promise<any[]> {
    return await orderMetricsRepository.getMetricsRange(organizationId, startDate, endDate);
  }
}

export const orderMetricsService = new OrderMetricsService();
