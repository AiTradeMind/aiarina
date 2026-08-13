import { Request, Response } from 'express';
import { strategyRankingService } from '../services/strategy-ranking.service.ts';

export class StrategyRankingController {
  async getRankings(req: Request, res: Response): Promise<void> {
    try {
      const strategyId = (req.query.strategyId as string) || 'STRAT-001';
      const overview = await strategyRankingService.getRankings(strategyId);
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { rankingId } = req.params;
      const { status, operator, comment } = req.body;
      const overview = await strategyRankingService.updateCommitteeStatus(rankingId, status, operator || 'Enterprise Committee', comment);
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async bulkOperation(req: Request, res: Response): Promise<void> {
    try {
      const { strategyId, operation, rankingIds, operator } = req.body;
      const overview = await strategyRankingService.bulkOperation(strategyId || 'STRAT-001', operation, rankingIds, operator || 'Enterprise Committee');
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
}

export const strategyRankingController = new StrategyRankingController();
