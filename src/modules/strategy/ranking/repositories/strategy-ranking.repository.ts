import { StrategyRankingItem, RankingOverview, EMPTY_RANKING_OVERVIEW } from '../types/index.ts';

export class StrategyRankingRepository {
  private rankingsStore: Map<string, StrategyRankingItem[]> = new Map();

  constructor() {
    this.seedDefaultRankings('STRAT-001');
  }

  private seedDefaultRankings(strategyId: string) {
    if (this.rankingsStore.has(strategyId)) return;

    const seedItems: StrategyRankingItem[] = [
      {
        rankingId: 'RANK-1001',
        candidateId: 'CAND-7841',
        strategyId: strategyId,
        aiModelId: 'gpt-4o',
        symbol: 'NIFTY',
        assetClass: 'Index / Equity',
        market: 'NSE / India',
        direction: 'BUY',
        rankOrder: 1,
        confidence: 94,
        qualityScore: 92,
        riskScore: 24,
        researchScore: 96,
        consensusScore: 95,
        historicalScore: 93,
        marketContextScore: 90,
        parameterComplianceScore: 100,
        aiReliabilityScore: 95,
        executionReadinessScore: 98,
        finalScore: 94.2,
        tier: 'Enterprise Grade',
        priority: 'CRITICAL',
        committeeStatus: 'APPROVED',
        runtimeStatus: 'READY',
        createdTime: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedTime: new Date(Date.now() - 3600000 * 1).toISOString(),
        scoreBreakdown: {
          confidenceWeight: 0.2,
          riskWeight: 0.15,
          qualityWeight: 0.15,
          researchWeight: 0.1,
          historicalWeight: 0.15,
          marketWeight: 0.1,
          complianceWeight: 0.1,
          reliabilityWeight: 0.05
        },
        aiReasoning: 'Strong bullish engulfing pattern confirmed by institutional volume spike, MACD histogram expansion, and favorable macroeconomic India PMI indicators.',
        committeeVotes: [
          { id: 'V-1', committeeMember: 'Meta Llama 3.3 70B (v3.5)', vote: 'APPROVE', comment: 'Risk parameters verified within strict mandate.', timestamp: new Date(Date.now() - 7200000).toISOString() },
          { id: 'V-2', committeeMember: 'Google Gemini 2.5 Pro (v3.0)', vote: 'APPROVE', comment: 'Backtest win rate > 68% over 5 years.', timestamp: new Date(Date.now() - 3600000).toISOString() }
        ],
        historicalPerformance: {
          winRate: 68.4,
          profitFactor: 2.34,
          maxDrawdown: 4.8,
          sharpeRatio: 2.15,
          totalBacktestTrades: 420
        },
        researchSummary: 'Bullish institutional accumulation noted across NIFTY index options and futures open interest.',
        indicatorSnapshot: { RSI: 62.4, MACD: 'Bullish Crossover', Supertrend: 'BUY', ADX: 28.5 },
        riskAnalysis: { volatilityRisk: 'Moderate (14.2%)', liquidityRisk: 'Deep Institutional Liquidity', var99: '1.85%' },
        validationChecks: [
          { id: 'VAL-1', ruleName: 'Duplicate Candidate Check', isValid: true, message: 'Unique signal signature verified.' },
          { id: 'VAL-2', ruleName: 'Confidence Threshold', isValid: true, message: 'Confidence 94% exceeds 80% minimum.' },
          { id: 'VAL-3', ruleName: 'Risk-Reward Ratio', isValid: true, message: 'R/R 2.4 exceeds 2.0 minimum.' }
        ],
        history: [
          { id: 'H-1', action: 'RANKED', operator: 'Automated Scoring Engine', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), details: 'Assigned Enterprise Grade Tier A+' },
          { id: 'H-2', action: 'COMMITTEE_APPROVED', operator: 'Meta Llama 3.3 70B (v3.5)', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), details: 'Approved for runtime deployment queue' }
        ],
        sha256Reference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      {
        rankingId: 'RANK-1002',
        candidateId: 'CAND-9233',
        strategyId: strategyId,
        aiModelId: 'claude-3-5-sonnet',
        symbol: 'RELIANCE',
        assetClass: 'Equity',
        market: 'NSE / India',
        direction: 'BUY',
        rankOrder: 2,
        confidence: 91,
        qualityScore: 89,
        riskScore: 28,
        researchScore: 92,
        consensusScore: 90,
        historicalScore: 88,
        marketContextScore: 89,
        parameterComplianceScore: 100,
        aiReliabilityScore: 93,
        executionReadinessScore: 95,
        finalScore: 90.5,
        tier: 'Tier A+',
        priority: 'HIGH',
        committeeStatus: 'APPROVED',
        runtimeStatus: 'READY',
        createdTime: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedTime: new Date(Date.now() - 3600000 * 2).toISOString(),
        scoreBreakdown: {
          confidenceWeight: 0.2,
          riskWeight: 0.15,
          qualityWeight: 0.15,
          researchWeight: 0.1,
          historicalWeight: 0.15,
          marketWeight: 0.1,
          complianceWeight: 0.1,
          reliabilityWeight: 0.05
        },
        aiReasoning: 'Breakout above 52-week consolidation zone with heavy institutional block deals.',
        committeeVotes: [
          { id: 'V-3', committeeMember: 'Senior Portfolio Manager', vote: 'APPROVE', comment: 'Strong fundamental catalyst.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
        ],
        historicalPerformance: {
          winRate: 65.2,
          profitFactor: 2.12,
          maxDrawdown: 5.6,
          sharpeRatio: 1.95,
          totalBacktestTrades: 310
        },
        researchSummary: 'Institutional inflows up 24% QoQ.',
        indicatorSnapshot: { RSI: 68.1, MACD: 'Positive divergence', Supertrend: 'BUY', ADX: 31.0 },
        riskAnalysis: { volatilityRisk: 'Low-Moderate (12.5%)', liquidityRisk: 'High Liquidity', var99: '2.10%' },
        validationChecks: [
          { id: 'VAL-4', ruleName: 'Confidence Threshold', isValid: true, message: 'Confidence 91% verified.' }
        ],
        history: [
          { id: 'H-3', action: 'RANKED', operator: 'Automated Scoring Engine', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), details: 'Assigned Tier A+' }
        ],
        sha256Reference: 'f2c72b2298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b911'
      },
      {
        rankingId: 'RANK-1003',
        candidateId: 'CAND-4021',
        strategyId: strategyId,
        aiModelId: 'gemini-1.5-pro',
        symbol: 'GOLD_AUG_FUT',
        assetClass: 'Commodity / Gold',
        market: 'MCX / India',
        direction: 'BUY',
        rankOrder: 3,
        confidence: 88,
        qualityScore: 86,
        riskScore: 32,
        researchScore: 90,
        consensusScore: 87,
        historicalScore: 85,
        marketContextScore: 91,
        parameterComplianceScore: 100,
        aiReliabilityScore: 90,
        executionReadinessScore: 92,
        finalScore: 87.8,
        tier: 'Tier A',
        priority: 'NORMAL',
        committeeStatus: 'PENDING',
        runtimeStatus: 'QUEUED',
        createdTime: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedTime: new Date(Date.now() - 3600000 * 3).toISOString(),
        scoreBreakdown: {
          confidenceWeight: 0.2,
          riskWeight: 0.15,
          qualityWeight: 0.15,
          researchWeight: 0.1,
          historicalWeight: 0.15,
          marketWeight: 0.1,
          complianceWeight: 0.1,
          reliabilityWeight: 0.05
        },
        aiReasoning: 'Safe-haven demand uptick amid global central bank reserve diversification and currency fluctuations.',
        committeeVotes: [],
        historicalPerformance: {
          winRate: 62.1,
          profitFactor: 1.94,
          maxDrawdown: 6.2,
          sharpeRatio: 1.82,
          totalBacktestTrades: 240
        },
        researchSummary: 'Global gold ETF holdings increased for 5 consecutive weeks.',
        indicatorSnapshot: { RSI: 59.8, MACD: 'Bullish', Supertrend: 'BUY', ADX: 24.2 },
        riskAnalysis: { volatilityRisk: 'Moderate (15.8%)', liquidityRisk: 'High MCX Liquidity', var99: '2.40%' },
        validationChecks: [
          { id: 'VAL-5', ruleName: 'Confidence Threshold', isValid: true, message: 'Passed.' }
        ],
        history: [
          { id: 'H-4', action: 'RANKED', operator: 'Automated Scoring Engine', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), details: 'Assigned Tier A' }
        ],
        sha256Reference: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'
      }
    ];

    this.rankingsStore.set(strategyId, seedItems);
  }

  public async getRankings(strategyId: string): Promise<RankingOverview> {
    const items = this.rankingsStore.get(strategyId) || [];
    return this.buildOverview(items);
  }

  public async updateCommitteeStatus(rankingId: string, status: string, operator: string, comment?: string): Promise<RankingOverview> {
    for (const [stratId, items] of this.rankingsStore.entries()) {
      const idx = items.findIndex(r => r.rankingId === rankingId || r.candidateId === rankingId);
      if (idx !== -1) {
        items[idx].committeeStatus = status as any;
        if (status === 'APPROVED') {
          items[idx].runtimeStatus = 'READY';
        } else if (status === 'REJECTED' || status === 'ARCHIVED') {
          items[idx].runtimeStatus = 'SUSPENDED';
        }
        items[idx].updatedTime = new Date().toISOString();
        items[idx].history.push({
          id: `H-${Date.now()}`,
          action: `COMMITTEE_${status}`,
          operator,
          timestamp: new Date().toISOString(),
          details: comment || `Status updated to ${status}`
        });
        this.rankingsStore.set(stratId, items);
        return this.buildOverview(items);
      }
    }
    throw new Error(`Ranking item ${rankingId} not found`);
  }

  public async bulkOperation(strategyId: string, operation: string, rankingIds: string[], operator: string): Promise<RankingOverview> {
    const items = this.rankingsStore.get(strategyId) || [];
    for (const id of rankingIds) {
      const item = items.find(r => r.rankingId === id || r.candidateId === id);
      if (item) {
        if (operation === 'APPROVE') {
          item.committeeStatus = 'APPROVED';
          item.runtimeStatus = 'READY';
        } else if (operation === 'REJECT') {
          item.committeeStatus = 'REJECTED';
          item.runtimeStatus = 'SUSPENDED';
        } else if (operation === 'ARCHIVE') {
          item.committeeStatus = 'ARCHIVED';
          item.runtimeStatus = 'SUSPENDED';
        }
        item.updatedTime = new Date().toISOString();
        item.history.push({
          id: `H-${Date.now()}-${Math.random()}`,
          action: `BULK_${operation}`,
          operator,
          timestamp: new Date().toISOString(),
          details: `Bulk executed ${operation}`
        });
      }
    }
    this.rankingsStore.set(strategyId, items);
    return this.buildOverview(items);
  }

  private buildOverview(items: StrategyRankingItem[]): RankingOverview {
    const totalRanked = items.length;
    const runtimeReadyCount = items.filter(i => i.runtimeStatus === 'READY' || i.runtimeStatus === 'DEPLOYED').length;
    const pendingRankingCount = items.filter(i => i.committeeStatus === 'PENDING').length;
    const rejectedCount = items.filter(i => i.committeeStatus === 'REJECTED').length;
    const watchlistCount = items.filter(i => i.committeeStatus === 'WATCHLIST').length;

    const avgFinalScore = totalRanked ? parseFloat((items.reduce((acc, i) => acc + i.finalScore, 0) / totalRanked).toFixed(1)) : 0;
    const avgConfidence = totalRanked ? Math.round(items.reduce((acc, i) => acc + i.confidence, 0) / totalRanked) : 0;
    const avgRisk = totalRanked ? parseFloat((items.reduce((acc, i) => acc + i.riskScore, 0) / totalRanked).toFixed(1)) : 0;
    const avgQuality = totalRanked ? Math.round(items.reduce((acc, i) => acc + i.qualityScore, 0) / totalRanked) : 0;
    const avgProfitFactor = totalRanked ? parseFloat((items.reduce((acc, i) => acc + i.historicalPerformance.profitFactor, 0) / totalRanked).toFixed(2)) : 0;
    const avgWinRate = totalRanked ? parseFloat((items.reduce((acc, i) => acc + i.historicalPerformance.winRate, 0) / totalRanked).toFixed(1)) : 0;

    const highest = items.reduce((prev, curr) => (curr.finalScore > (prev?.finalScore || 0) ? curr : prev), items[0]);
    const highestRankedStrategy = highest ? `${highest.strategyId} (${highest.symbol} - ${highest.finalScore})` : 'None';

    return {
      rankings: items.sort((a, b) => a.rankOrder - b.rankOrder),
      statistics: {
        totalRanked,
        runtimeReadyCount,
        pendingRankingCount,
        rejectedCount,
        watchlistCount,
        averageFinalScore: avgFinalScore,
        averageConfidence: avgConfidence,
        averageRisk: avgRisk,
        averageQuality: avgQuality,
        averageProfitFactor: avgProfitFactor,
        averageWinRate: avgWinRate,
        highestRankedStrategy
      }
    };
  }
}

export const strategyRankingRepository = new StrategyRankingRepository();
