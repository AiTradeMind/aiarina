import { analyticsRepository } from "../repositories/AnalyticsRepository";
import { analyticsAggregator } from "./AnalyticsAggregator";

export class AnalyticsEngine {
  async processAnalytics(entityId: string): Promise<any> {
    await analyticsRepository.ensureTables();
    return await analyticsAggregator.aggregate(entityId);
  }
}
export const analyticsEngine = new AnalyticsEngine();
