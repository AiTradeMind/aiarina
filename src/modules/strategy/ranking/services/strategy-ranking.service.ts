import { strategyRankingRepository } from '../repositories/strategy-ranking.repository.ts';
import { RankingOverview } from '../types/index.ts';

export class StrategyRankingService {
  async getRankings(strategyId: string = 'STRAT-001'): Promise<RankingOverview> {
    return await strategyRankingRepository.getRankings(strategyId);
  }

  async updateCommitteeStatus(rankingId: string, status: string, operator: string, comment?: string): Promise<RankingOverview> {
    return await strategyRankingRepository.updateCommitteeStatus(rankingId, status, operator, comment);
  }

  async bulkOperation(strategyId: string, operation: string, rankingIds: string[], operator: string): Promise<RankingOverview> {
    return await strategyRankingRepository.bulkOperation(strategyId, operation, rankingIds, operator);
  }
}

export const strategyRankingService = new StrategyRankingService();
