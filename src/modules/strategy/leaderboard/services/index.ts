import { LeaderboardRepository } from "../repositories/index.ts";

export class LeaderboardService {
  private repository: LeaderboardRepository;

  constructor() {
    this.repository = new LeaderboardRepository();
  }

  async getLeaderboards() {
    return this.repository.getLeaderboards();
  }

  async getRankings(leaderboardId?: string) {
    return this.repository.getRankings(leaderboardId);
  }

  async getCategories() {
    const leaderboards = await this.repository.getLeaderboards();
    const categories = Array.from(new Set(leaderboards.map(l => l.category)));
    return categories;
  }

  async getBenchmarks(strategyId?: string) {
    return this.repository.getBenchmarks(strategyId);
  }

  async getHistory(strategyId: string) {
    return this.repository.getRatingHistory(strategyId);
  }

  async getAwards(strategyId?: string) {
    return this.repository.getAwards(strategyId);
  }
  
  async getSeasons() {
    return this.repository.getSeasons();
  }
  
  async getScorecards(strategyId?: string) {
    return this.repository.getScorecards(strategyId);
  }

  async recalculateLeaderboard() {
    return this.repository.recalculateLeaderboard();
  }
}
