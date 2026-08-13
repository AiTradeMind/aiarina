import { AnalyticsRepository } from "../repositories/index.ts";

export class AnalyticsService {
  private repository: AnalyticsRepository;

  constructor() {
    this.repository = new AnalyticsRepository();
  }

  async getDashboard() {
    return this.repository.getDashboard();
  }

  async getPerformance(strategyId?: string) {
    return this.repository.getPerformanceSummary(strategyId);
  }

  async getDailyMetrics(strategyId: string) {
    return this.repository.getDailyMetrics(strategyId);
  }

  async getMonthlyMetrics(strategyId: string) {
    return this.repository.getMonthlyMetrics(strategyId);
  }

  async getYearlyMetrics(strategyId: string) {
    return this.repository.getYearlyMetrics(strategyId);
  }

  async getHistory(strategyId: string, metricName?: string) {
    return this.repository.getHistory(strategyId, metricName);
  }

  async getAttribution(strategyId: string) {
    return this.repository.getAttribution(strategyId);
  }

  async getComparison(strategyIdA: string, strategyIdB: string) {
    return this.repository.getComparison(strategyIdA, strategyIdB);
  }

  async getReports(strategyId?: string) {
    return this.repository.getReports(strategyId);
  }

  async generateReport(strategyId: string | null, reportType: string, name: string, createdBy: string) {
    return this.repository.generateReport(strategyId, reportType, name, createdBy);
  }
}
