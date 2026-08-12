import { recommendationEngine } from "../engines/RecommendationEngine";
import { insightEngine } from "../engines/InsightEngine";

export class RecommendationService {
  async getRecommendations(entityId: string, type: any): Promise<any> {
    return await recommendationEngine.generate(entityId, type);
  }

  async getInsights(entityId: string): Promise<any> {
    return await insightEngine.generate(entityId);
  }
}
export const recommendationService = new RecommendationService();
