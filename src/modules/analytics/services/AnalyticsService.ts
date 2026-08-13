import { analyticsRepository } from "../repositories/AnalyticsRepository";

export class AnalyticsService {
  async runAnalytics(entityId: string): Promise<any> {
    await analyticsRepository.ensureTables();
    return await analyticsRepository.getAiAnalyticsList();
  }

  async getAiAnalytics(): Promise<any[]> {
    return await analyticsRepository.getAiAnalyticsList();
  }

  async getAiAnalyticsById(id: string): Promise<any> {
    return await analyticsRepository.getAiAnalyticsById(id);
  }

  async getAiRankings(): Promise<any[]> {
    return await analyticsRepository.getAiRankings();
  }

  async getAiHealth(): Promise<any[]> {
    return await analyticsRepository.getAiHealth();
  }

  async getAiTrends(): Promise<any[]> {
    return await analyticsRepository.getAiTrends();
  }

  async getAiHistory(id: string): Promise<any[]> {
    return await analyticsRepository.getAiHistory(id);
  }

  async getAiCompare(aiIds: string[]): Promise<any[]> {
    return await analyticsRepository.getAiCompare(aiIds);
  }

  async getForecasts(): Promise<any[]> {
    return await analyticsRepository.getForecasts();
  }

  async getCorrelations(): Promise<any[]> {
    return await analyticsRepository.getCorrelations();
  }

  async getAnomalies(): Promise<any[]> {
    return await analyticsRepository.getAnomalies();
  }

  async getHeatmaps(): Promise<any[]> {
    return await analyticsRepository.getHeatmaps();
  }

  async getCrossModuleAggregation(): Promise<any> {
    return await analyticsRepository.getCrossModuleAggregation();
  }

  async resetAnalyticsTestData({ confirm, resetState }: { confirm: boolean; resetState: string }) {
    if (!confirm || resetState !== "ON") {
      throw new Error("Reset confirmation required. resetState must be ON and confirm must be true.");
    }

    const resetRunId = `RST-ANALYTICS-${Date.now()}`;
    return {
      module: "ANALYTICS",
      resetRunId,
      status: "COMPLETED",
      recordsCleared: 0,
      timestamp: new Date().toISOString()
    };
  }
}

export const analyticsService = new AnalyticsService();
