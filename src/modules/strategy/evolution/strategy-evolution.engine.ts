import logger from '../../../lib/logger';

export enum StrategyRankStatus {
  CHAMPION = 'CHAMPION',
  CHALLENGER = 'CHALLENGER',
  EVALUATING = 'EVALUATING',
  DEMOTED = 'DEMOTED',
  RETIRED = 'RETIRED'
}

export interface StrategyEvolutionRecord {
  strategyId: string;
  name: string;
  version: string;
  status: StrategyRankStatus;
  winRate: number;
  totalPnL: number;
  sharpeRatio: number;
  evaluationCount: number;
  lastUpdated: Date;
}

export class StrategyEvolutionEngine {
  private static instance: StrategyEvolutionEngine;
  private rankings: Map<string, StrategyEvolutionRecord> = new Map();

  private constructor() {
    this.initDefaultRankings();
  }

  public static getInstance(): StrategyEvolutionEngine {
    if (!StrategyEvolutionEngine.instance) {
      StrategyEvolutionEngine.instance = new StrategyEvolutionEngine();
    }
    return StrategyEvolutionEngine.instance;
  }

  private initDefaultRankings(): void {
    this.rankings.set('strat_momentum_v1', {
      strategyId: 'strat_momentum_v1',
      name: 'Enterprise Momentum Alpha',
      version: '1.2.0',
      status: StrategyRankStatus.CHAMPION,
      winRate: 0.68,
      totalPnL: 45200.50,
      sharpeRatio: 2.35,
      evaluationCount: 142,
      lastUpdated: new Date()
    });
    this.rankings.set('strat_mean_reversion_v2', {
      strategyId: 'strat_mean_reversion_v2',
      name: 'Statistical Mean Reversion',
      version: '2.0.1',
      status: StrategyRankStatus.CHALLENGER,
      winRate: 0.61,
      totalPnL: 18400.00,
      sharpeRatio: 1.85,
      evaluationCount: 95,
      lastUpdated: new Date()
    });
  }

  public getRankings(): StrategyEvolutionRecord[] {
    return Array.from(this.rankings.values());
  }

  public promoteStrategy(strategyId: string): void {
    const record = this.rankings.get(strategyId);
    if (!record) {
      throw new Error(`Strategy not found for evolution: ${strategyId}`);
    }

    // Demote current champion
    for (const [id, r] of this.rankings.entries()) {
      if (r.status === StrategyRankStatus.CHAMPION) {
        r.status = StrategyRankStatus.CHALLENGER;
        logger.info({ strategyId: id }, 'Previous champion demoted to challenger');
      }
    }

    record.status = StrategyRankStatus.CHAMPION;
    record.lastUpdated = new Date();
    logger.info({ strategyId }, 'Strategy promoted to CHAMPION');
  }

  public retireStrategy(strategyId: string): void {
    const record = this.rankings.get(strategyId);
    if (record) {
      record.status = StrategyRankStatus.RETIRED;
      record.lastUpdated = new Date();
      logger.info({ strategyId }, 'Strategy retired');
    }
  }
}
