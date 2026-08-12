
import { LeaderboardRepository } from "../repositories";
import { AiLeaderboard, AiRanking, AiScorecard, AiPerformanceHistory, AiBenchmark } from "../types";
import { randomUUID } from "crypto";
import { RankingEngineService } from "./ranking-engine";

export class LeaderboardService {
  private repo = new LeaderboardRepository();
  private rankingEngine = new RankingEngineService();

  async getLeaderboards(): Promise<AiLeaderboard[]> {
    return await this.repo.getLeaderboards();
  }

  async getLeaderboardDetails(categoryId: string): Promise<{ leaderboard: AiLeaderboard | null, rankings: AiRanking[] }> {
    const leaderboard = await this.repo.getLeaderboardByCategory(categoryId);
    if (!leaderboard) {
      return { leaderboard: null, rankings: [] };
    }
    const rankings = await this.repo.getRankings(leaderboard.id);
    return { leaderboard, rankings };
  }

  async getModelScorecard(modelId: string): Promise<AiScorecard | null> {
    return await this.repo.getScorecard(modelId);
  }

  async getModelHistory(modelId: string): Promise<AiPerformanceHistory[]> {
    return await this.repo.getPerformanceHistory(modelId);
  }

  async getBenchmarks(): Promise<AiBenchmark[]> {
    return await this.repo.getBenchmarks();
  }

  async recalculateRankings(categoryId: string, organizationId: string): Promise<void> {
    console.log(`Recalculating rankings for category: ${categoryId} and org: ${organizationId}`);
    
    // In real system, we'd fetch all models and calculate score using RankingEngineService.
    const score = await this.rankingEngine.calculateCompositeScore(organizationId);
    
    // Then update rankings...
    console.log(`Calculated composite score: ${score}`);
  }

  async seedInitialData(): Promise<void> {
    // Initialization logic if needed in future, currently not required.
  }
}
