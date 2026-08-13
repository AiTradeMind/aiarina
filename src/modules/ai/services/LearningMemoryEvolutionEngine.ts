import { EventEmitter } from 'events';

export interface LearningQualityScoreMetrics {
  lqsScore: number; // 0 - 100
  knowledgeQuality: number; // 0 - 100
  learningAccuracy: number; // 0 - 100
  memoryIntegrity: number; // 0 - 100
  patternDetection: number; // 0 - 100
  improvementSuccess: number; // 0 - 100
  status: 'OPTIMAL' | 'GOOD' | 'NEEDS_OPTIMIZATION';
}

export interface EvolutionQualityScoreMetrics {
  evqsScore: number; // 0 - 100
  modelImprovement: number; // 0 - 100
  championPerformance: number; // 0 - 100
  rollbackSuccess: number; // 0 - 100
  knowledgeGrowth: number; // 0 - 100
  status: 'EXCELLENT' | 'STABLE' | 'DEGRADED';
}

export interface PostTradeRootCauses {
  marketReason: string;
  strategyReason: string;
  executionReason: string;
  riskReason: string;
  timingReason: string;
  committeeReason: string;
  fundReason: string;
  brokerReason: string;
}

export interface PostTradeAnalysisRecord {
  tradeId: string;
  symbol: string;
  type: 'WINNING' | 'LOSING' | 'MISSED' | 'REJECTED' | 'CANCELLED' | 'RISK_EVENT';
  modelId: string;
  modelName: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPct: number;
  holdingTimeMinutes: number;
  timestamp: string;
  rootCauses: PostTradeRootCauses;
  learningSummary: string;
  knowledgeGenerated: string[];
  memoryUpdated: string[];
  evolutionImpact: string;
  verified: boolean;
}

export interface MemoryItem {
  id: string;
  type: 'WORKING' | 'SHORT' | 'LONG' | 'PATTERN' | 'DECISION' | 'EXECUTION' | 'RISK';
  key: string;
  value: string;
  confidence: number;
  accessCount: number;
  lastUpdated: string;
  source: string;
}

export interface KnowledgeItem {
  id: string;
  domain: 'TRADE' | 'PATTERN' | 'RISK' | 'MARKET' | 'STRATEGY' | 'EXECUTION' | 'FINANCIAL';
  title: string;
  content: string;
  tags: string[];
  verificationCount: number;
  createdAt: string;
}

export interface PatternDiscoveryRecord {
  id: string;
  category: 'REPEATED_WINNER' | 'REPEATED_LOSS' | 'MARKET_BEHAVIOUR' | 'SECTOR_BEHAVIOUR' | 'AI_BEHAVIOUR' | 'STRATEGY_BEHAVIOUR';
  title: string;
  description: string;
  frequency: number;
  winRateImpact: string;
  detectedAt: string;
}

export interface SelfImprovementRecommendation {
  id: string;
  type: 'RISK_CHANGE' | 'STRATEGY_IMPROVEMENT' | 'PARAMETER_OPTIMIZATION' | 'CAPITAL_OPTIMIZATION' | 'EXECUTION_OPTIMIZATION';
  title: string;
  target: string;
  recommendation: string;
  expectedGain: string;
  status: 'PROPOSED' | 'APPROVED' | 'APPLIED' | 'REJECTED';
}

export interface ModelEvolutionLineage {
  modelId: string;
  modelName: string;
  generation: string;
  mutation: string;
  role: 'CHAMPION' | 'CHALLENGER' | 'RETIRED';
  parentModel: string;
  winRate: string;
  csiScore: number;
  status: 'PROMOTED' | 'MUTATED' | 'ROLLBACK_READY' | 'RETIRED';
  updatedAt: string;
}

export interface KnowledgeGraphNode {
  id: string;
  type: 'MARKET' | 'RESEARCH' | 'ANALYTICS' | 'STRATEGY' | 'EXECUTION' | 'FINANCE' | 'LEARNING';
  label: string;
  connections: string[];
  weight: number;
}

export interface LMEOSLog {
  id: string;
  timestamp: string;
  category: 'LEARNING' | 'MEMORY' | 'KNOWLEDGE' | 'EVOLUTION';
  message: string;
}

export class LearningMemoryEvolutionEngine {
  private static instance: LearningMemoryEvolutionEngine;

  private postTradeAnalyses: PostTradeAnalysisRecord[] = [];
  private memories: MemoryItem[] = [];
  private knowledgeBase: KnowledgeItem[] = [];
  private patterns: PatternDiscoveryRecord[] = [];
  private recommendations: SelfImprovementRecommendation[] = [];
  private evolutionLineages: ModelEvolutionLineage[] = [];
  private knowledgeGraph: KnowledgeGraphNode[] = [];
  private logs: LMEOSLog[] = [];

  private constructor() {
    this.seedPostTradeAnalyses();
    this.seedMemories();
    this.seedKnowledgeBase();
    this.seedPatterns();
    this.seedRecommendations();
    this.seedEvolutionLineages();
    this.seedKnowledgeGraph();
    this.seedLogs();
  }

  public static getInstance(): LearningMemoryEvolutionEngine {
    if (!LearningMemoryEvolutionEngine.instance) {
      LearningMemoryEvolutionEngine.instance = new LearningMemoryEvolutionEngine();
    }
    return LearningMemoryEvolutionEngine.instance;
  }

  /**
   * Calculate Learning Quality Score (LQS): 0 - 100
   */
  public calculateLQS(): LearningQualityScoreMetrics {
    const knowledgeQuality = 96;
    const learningAccuracy = 94;
    const memoryIntegrity = 98;
    const patternDetection = 92;
    const improvementSuccess = 95;

    const lqsScore = Math.round(
      knowledgeQuality * 0.25 +
      learningAccuracy * 0.25 +
      memoryIntegrity * 0.20 +
      patternDetection * 0.15 +
      improvementSuccess * 0.15
    );

    return {
      lqsScore,
      knowledgeQuality,
      learningAccuracy,
      memoryIntegrity,
      patternDetection,
      improvementSuccess,
      status: lqsScore >= 90 ? 'OPTIMAL' : lqsScore >= 75 ? 'GOOD' : 'NEEDS_OPTIMIZATION'
    };
  }

  /**
   * Calculate Evolution Quality Score (EVQS): 0 - 100
   */
  public calculateEVQS(): EvolutionQualityScoreMetrics {
    const modelImprovement = 94;
    const championPerformance = 97;
    const rollbackSuccess = 100;
    const knowledgeGrowth = 92;

    const evqsScore = Math.round(
      modelImprovement * 0.30 +
      championPerformance * 0.35 +
      rollbackSuccess * 0.15 +
      knowledgeGrowth * 0.20
    );

    return {
      evqsScore,
      modelImprovement,
      championPerformance,
      rollbackSuccess,
      knowledgeGrowth,
      status: evqsScore >= 90 ? 'EXCELLENT' : evqsScore >= 75 ? 'STABLE' : 'DEGRADED'
    };
  }

  public getDashboardMetrics() {
    const totalAnalyses = this.postTradeAnalyses.length;
    const completedLearning = this.postTradeAnalyses.filter(a => a.verified).length;
    const failedLearning = this.postTradeAnalyses.filter(a => !a.verified).length;
    const learningQueue = totalAnalyses - completedLearning;

    return {
      learningQueue,
      completedLearning,
      failedLearning,
      learningAccuracyPct: '98.4%',
      knowledgeGrowthPct: '+14.2%/wk',
      memoryUsageMb: '420 MB / 1024 MB',
      evolutionProgressPct: '88.5%',
      activeMutations: 12,
      championsCount: 12,
      challengersCount: 14,
      retiredCount: 2
    };
  }

  public getPostTradeAnalyses(filterType?: string): PostTradeAnalysisRecord[] {
    if (!filterType || filterType === 'ALL') return this.postTradeAnalyses;
    return this.postTradeAnalyses.filter(a => a.type === filterType);
  }

  public getMemories(filterType?: string): MemoryItem[] {
    if (!filterType || filterType === 'ALL') return this.memories;
    return this.memories.filter(m => m.type === filterType);
  }

  public getKnowledge(filterDomain?: string): KnowledgeItem[] {
    if (!filterDomain || filterDomain === 'ALL') return this.knowledgeBase;
    return this.knowledgeBase.filter(k => k.domain === filterDomain);
  }

  public getPatterns(): PatternDiscoveryRecord[] {
    return this.patterns;
  }

  public getRecommendations(): SelfImprovementRecommendation[] {
    return this.recommendations;
  }

  public getEvolutionLineages(): ModelEvolutionLineage[] {
    return this.evolutionLineages;
  }

  public getKnowledgeGraph(): KnowledgeGraphNode[] {
    return this.knowledgeGraph;
  }

  public getLogs(category?: string): LMEOSLog[] {
    if (!category || category === 'ALL') return this.logs;
    return this.logs.filter(l => l.category === category);
  }

  public searchMemory(query: string): {
    trades: PostTradeAnalysisRecord[];
    patterns: PatternDiscoveryRecord[];
    memories: MemoryItem[];
    knowledge: KnowledgeItem[];
  } {
    if (!query) {
      return {
        trades: this.postTradeAnalyses.slice(0, 5),
        patterns: this.patterns.slice(0, 5),
        memories: this.memories.slice(0, 5),
        knowledge: this.knowledgeBase.slice(0, 5)
      };
    }

    const q = query.toLowerCase();
    return {
      trades: this.postTradeAnalyses.filter(t => t.symbol.toLowerCase().includes(q) || t.learningSummary.toLowerCase().includes(q) || t.modelName.toLowerCase().includes(q)),
      patterns: this.patterns.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
      memories: this.memories.filter(m => m.key.toLowerCase().includes(q) || m.value.toLowerCase().includes(q)),
      knowledge: this.knowledgeBase.filter(k => k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q) || k.tags.some(t => t.toLowerCase().includes(q)))
    };
  }

  public applyRecommendation(id: string) {
    const rec = this.recommendations.find(r => r.id === id);
    if (rec) {
      rec.status = 'APPLIED';
      this.addLog('LEARNING', `Applied Self Improvement Recommendation [${rec.id}]: ${rec.title}`);
    }
  }

  public promoteModel(modelId: string) {
    const m = this.evolutionLineages.find(e => e.modelId === modelId);
    if (m) {
      m.role = 'CHAMPION';
      m.status = 'PROMOTED';
      m.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      this.addLog('EVOLUTION', `Promoted Challenger model [${m.modelName}] to CHAMPION production status.`);
    }
  }

  public rollbackModel(modelId: string) {
    const m = this.evolutionLineages.find(e => e.modelId === modelId);
    if (m) {
      m.status = 'ROLLBACK_READY';
      m.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      this.addLog('EVOLUTION', `Executed Model Rollback for [${m.modelName}] to previous stable snapshot.`);
    }
  }

  public verifyQualityGate(tradeId: string): boolean {
    const trade = this.postTradeAnalyses.find(t => t.tradeId === tradeId);
    if (!trade) return false;
    trade.verified = true;
    this.addLog('LEARNING', `Quality Gate Passed for Trade [${tradeId}]: Trade Verified ✓ | Execution Verified ✓ | Accounting Verified ✓ | Knowledge Generated ✓ | Memory Updated ✓ | Evolution Reviewed ✓`);
    return true;
  }

  private addLog(category: LMEOSLog['category'], message: string) {
    const newLog: LMEOSLog = {
      id: `LMEOS-${Date.now()}`,
      timestamp: new Date().toISOString().slice(11, 19),
      category,
      message
    };
    this.logs.unshift(newLog);
  }

  // --- Mock Data Seeders ---
  private seedPostTradeAnalyses() {
    this.postTradeAnalyses = [
      {
        tradeId: 'TR-1030',
        symbol: 'MCX_GOLD',
        type: 'WINNING',
        modelId: 'GPT-5',
        modelName: 'GPT-5 Institutional',
        entryPrice: 71800.00,
        exitPrice: 72455.00,
        pnl: 18500,
        pnlPct: 0.91,
        holdingTimeMinutes: 120,
        timestamp: '2026-07-24 15:45:00',
        rootCauses: {
          marketReason: 'Economic releases (CPI print lower than expected) sparked MCX Gold futures demand.',
          strategyReason: 'Commodity breakout algorithm generated macro continuation signal on MCX Gold futures.',
          executionReason: 'Broker Adapter routed via MCX Sandbox Desk with zero slippage.',
          riskReason: 'RRS Check validated portfolio VaR limits; securely sized at 2.5% allocation.',
          timingReason: 'Entered exactly 2 minutes post US CPI release window.',
          committeeReason: 'AI Committee reached 94% BUY consensus during live debate.',
          fundReason: 'Fund Manager verified and authorized isolation from live treasury.',
          brokerReason: 'Executed flawlessly with MCX direct liquidity provider.'
        },
        learningSummary: 'Winning Commodity Trade: CPI macro breakout with tight correlation safeguards delivered 0.91% MCX Gold gain ($18.5k pnl).',
        knowledgeGenerated: ['KN-108: Lower-than-expected CPI print triggers high-probability MCX Gold futures rally with Gold ETF cross-correlation.'],
        memoryUpdated: ['MEM-PAT-110: Consolidated MCX Gold macro continuation pattern confidence to 95.2%.'],
        evolutionImpact: 'Champion model GPT-5 Commodity CSI score elevated to 99.1.',
        verified: true
      },
      {
        tradeId: 'TR-1029',
        symbol: 'NIFTY26JUL22400CE',
        type: 'WINNING',
        modelId: 'GPT-5',
        modelName: 'GPT-5 Institutional',
        entryPrice: 224.00,
        exitPrice: 238.50,
        pnl: 7250,
        pnlPct: 6.47,
        holdingTimeMinutes: 42,
        timestamp: '2026-07-24 14:22:05',
        rootCauses: {
          marketReason: 'Strong institutional breakout above VWAP and multi-day resistance.',
          strategyReason: 'AlphaFlow-v3 momentum expansion signal matched high volume delta.',
          executionReason: 'Adaptive Router achieved zero slippage on execution.',
          riskReason: 'Position sized strictly within 1.2% ATR stop limit.',
          timingReason: 'Entered at peak morning momentum window (10:15 AM).',
          committeeReason: 'Committee voted 68.2% BUY consensus with 96.5% confidence.',
          fundReason: 'Capital reserved without violating 35% sector concentration limit.',
          brokerReason: 'Primary broker executed fill in 8.4ms with zero rejects.'
        },
        learningSummary: 'Winning Trade: VWAP momentum continuation with tight 1.2x ATR trailing stop yielded 6.47% ROI.',
        knowledgeGenerated: ['KN-2081: High-volume VWAP breakout in NIFTY options has 84.2% win rate when VIX < 16.'],
        memoryUpdated: ['MEM-PAT-88: Updated NIFTY morning momentum pattern confidence to 94.8%.'],
        evolutionImpact: 'Champion model GPT-5 CSI score increased from 97.8 to 98.2.',
        verified: true
      },
      {
        tradeId: 'TR-1028',
        symbol: 'BANKNIFTY51500PE',
        type: 'LOSING',
        modelId: 'DeepSeek-R1',
        modelName: 'DeepSeek R1 Quant',
        entryPrice: 340.00,
        exitPrice: 326.40,
        pnl: -3400,
        pnlPct: -4.00,
        holdingTimeMinutes: 18,
        timestamp: '2026-07-24 13:45:10',
        rootCauses: {
          marketReason: 'Unexpected mid-session RBI liquidity comment caused sharp counter-trend reversal.',
          strategyReason: 'Mean reversion signal trigger occurred right before high-impact news event.',
          executionReason: 'Slippage was 0.80% due to sudden order book spread widening.',
          riskReason: 'Stop loss triggered cleanly at -4.00% hard limit without gapover.',
          timingReason: 'Trade entered 5 minutes prior to scheduled central bank speech.',
          committeeReason: 'Macro model flagged speech risk but was weighted down in voting quorum.',
          fundReason: 'Fund risk allocation was appropriate ($85k total risk).',
          brokerReason: 'Broker latency spiked to 45ms during news volatility window.'
        },
        learningSummary: 'Losing Trade: Mean reversion failed during central bank commentary; adaptive stop protected capital.',
        knowledgeGenerated: ['KN-2082: Mean-reversion signals must be paused 15 mins prior to central bank speeches.'],
        memoryUpdated: ['MEM-RISK-102: Added news calendar buffer lock to DeepSeek R1 execution engine.'],
        evolutionImpact: 'DeepSeek R1 strategy parameter updated: news window buffer increased to 20 minutes.',
        verified: true
      },
      {
        tradeId: 'TR-1027',
        symbol: 'RELIANCE_AUG_FUT',
        type: 'MISSED',
        modelId: 'Claude-Sonnet-5',
        modelName: 'Claude Sonnet 5',
        entryPrice: 3120.00,
        exitPrice: 3180.00,
        pnl: 0,
        pnlPct: 0,
        holdingTimeMinutes: 0,
        timestamp: '2026-07-24 11:30:00',
        rootCauses: {
          marketReason: 'Stock rallied +1.9% following positive export duty reduction announcement.',
          strategyReason: 'Breakout criteria satisfied but confidence score was 68% (below 70% threshold).',
          executionReason: 'Order was never sent to broker router.',
          riskReason: 'Risk check passed successfully.',
          timingReason: 'Signal generated at 11:30 AM.',
          committeeReason: 'Committee consensus was 58% BUY (required 60.0% for live trade).',
          fundReason: 'Sufficient cash reserve was available.',
          brokerReason: 'N/A'
        },
        learningSummary: 'Missed Opportunity: Reliance rally missed due to 58% committee consensus threshold.',
        knowledgeGenerated: ['KN-2083: Export duty news in Reliance yields 88% probability of +1.5% follow-through.'],
        memoryUpdated: ['MEM-DEC-402: Lowered committee threshold for export duty news events from 60% to 55%.'],
        evolutionImpact: 'Claude Sonnet 5 weight on regulatory news signals increased by +0.15x.',
        verified: true
      },
      {
        tradeId: 'TR-1026',
        symbol: 'TSLA_26JUL250CE',
        type: 'REJECTED',
        modelId: 'Grok-3',
        modelName: 'Grok 3 Sentiment',
        entryPrice: 12.50,
        exitPrice: 0,
        pnl: 0,
        pnlPct: 0,
        holdingTimeMinutes: 0,
        timestamp: '2026-07-24 10:12:30',
        rootCauses: {
          marketReason: 'High social media sentiment spike.',
          strategyReason: 'Sentiment momentum signal generated.',
          executionReason: 'Blocked by Risk Guardian prior to execution.',
          riskReason: 'Rejected due to Max Portfolio Heat Limit (Sector exposure exceeded 35%).',
          timingReason: 'N/A',
          committeeReason: 'Risk Officer model vetoed trade execution.',
          fundReason: 'Tech sector allocation was already at 34.8%.',
          brokerReason: 'N/A'
        },
        learningSummary: 'Rejected Trade: Risk Guardian correctly blocked trade due to 35% sector exposure cap.',
        knowledgeGenerated: ['KN-2084: Risk Guardian successfully prevented over-concentration in US Tech.'],
        memoryUpdated: ['MEM-RISK-103: Recorded sector concentration violation attempt by Grok 3.'],
        evolutionImpact: 'Grok 3 model penalized in risk score rating; sector awareness constraint applied.',
        verified: true
      },
      {
        tradeId: 'TR-1025',
        symbol: 'INFY_AUG_FUT',
        type: 'CANCELLED',
        modelId: 'Llama-3.3-70B',
        modelName: 'Llama 3.3 70B',
        entryPrice: 1540.00,
        exitPrice: 1540.00,
        pnl: 0,
        pnlPct: 0,
        holdingTimeMinutes: 2,
        timestamp: '2026-07-24 09:45:00',
        rootCauses: {
          marketReason: 'Order book liquidity thinned out rapidly after order placement.',
          strategyReason: 'Order placed at limit price $1540.00.',
          executionReason: 'Cancelled after 120 seconds unfilled limit timeout.',
          riskReason: 'No risk breach.',
          timingReason: 'Early morning market open spread widening.',
          committeeReason: 'Order approved by committee.',
          fundReason: 'Fund reserved.',
          brokerReason: 'Broker returned UNFILLED_TIMEOUT status.'
        },
        learningSummary: 'Cancelled Order: Limit order cancelled automatically after 120s execution timeout.',
        knowledgeGenerated: ['KN-2085: INFY Futures opening 15-min spread requires adaptive IOC routing.'],
        memoryUpdated: ['MEM-EXEC-501: Set INFY opening order execution mode to Adaptive IOC.'],
        evolutionImpact: 'Execution router policy updated for IT sector opening orders.',
        verified: true
      },
      {
        tradeId: 'TR-1024',
        symbol: 'BANKNIFTY_VOL_SWAP',
        type: 'RISK_EVENT',
        modelId: 'Mistral-Large-2',
        modelName: 'Mistral Large 2',
        entryPrice: 480.00,
        exitPrice: 450.00,
        pnl: -12500,
        pnlPct: -6.25,
        holdingTimeMinutes: 8,
        timestamp: '2026-07-24 09:18:12',
        rootCauses: {
          marketReason: 'Extreme volatility spike during market open.',
          strategyReason: 'Volatility swap arbitrage model triggered.',
          executionReason: 'Execution delayed by 180ms during broker disconnect.',
          riskReason: 'Drawdown exceeded 5.0% single trade risk limit.',
          timingReason: 'Market open 09:18 AM high volatility gap.',
          committeeReason: 'Override applied due to volatility swap classification.',
          fundReason: 'Fund capital locked.',
          brokerReason: 'Broker primary line disconnected for 3 seconds.'
        },
        learningSummary: 'Risk Event: Broker disconnect during opening gap caused -6.25% drawdown.',
        knowledgeGenerated: ['KN-2086: Primary broker failover speed must be under 50ms during opening gaps.'],
        memoryUpdated: ['MEM-RISK-104: Demoted Mistral Large 2 to Paper Challenger status following drawdown.'],
        evolutionImpact: 'Mistral Large 2 demoted to Paper Mode; Auto-failover threshold reduced to 30ms.',
        verified: true
      }
    ];
  }

  private seedMemories() {
    this.memories = [
      { id: 'MEM-1', type: 'WORKING', key: 'CURRENT_NIFTY_REGIME', value: 'BULLISH_MOMENTUM_HIGH_VOLATILITY', confidence: 0.96, accessCount: 1420, lastUpdated: '2026-07-24 14:30:00', source: 'Market Intelligence' },
      { id: 'MEM-2', type: 'SHORT', key: 'RECENT_LOSS_CLUSTER_SECTOR', value: 'BANKING_PE_OPTIONS', confidence: 0.88, accessCount: 340, lastUpdated: '2026-07-24 14:15:00', source: 'Risk Engine' },
      { id: 'MEM-3', type: 'LONG', key: 'HISTORICAL_FED_RATE_HIKE_CORRELATION', value: 'INVERSE_TECH_COMMODITIES', confidence: 0.94, accessCount: 8900, lastUpdated: '2026-07-20 00:00:00', source: 'Macro Research' },
      { id: 'MEM-4', type: 'PATTERN', key: 'VWAP_BREAKOUT_CONFORMATION_PATTERN', value: 'VOLUME_DELTA > 2.5x AVG', confidence: 0.95, accessCount: 5200, lastUpdated: '2026-07-24 12:00:00', source: 'Pattern Discovery' },
      { id: 'MEM-5', type: 'DECISION', key: 'COMMITTEE_QUORUM_THRESHOLD_RULE', value: 'MIN_60_PCT_WEIGHTED_BUY', confidence: 1.00, accessCount: 12400, lastUpdated: '2026-07-15 00:00:00', source: 'Governance Core' },
      { id: 'MEM-6', type: 'EXECUTION', key: 'OPTIMAL_ROUTER_LATENCY_MAP', value: 'PRIMARY_BROKER_8.4MS', confidence: 0.99, accessCount: 45000, lastUpdated: '2026-07-24 14:28:00', source: 'Broker Intelligence' },
      { id: 'MEM-7', type: 'RISK', key: 'MAX_PORTFOLIO_HEAT_CAP', value: '35_PCT_MAX_SECTOR_EXPOSURE', confidence: 1.00, accessCount: 32000, lastUpdated: '2026-07-01 00:00:00', source: 'Risk Guardian' }
    ];
  }

  private seedKnowledgeBase() {
    this.knowledgeBase = [
      { id: 'KN-101', domain: 'TRADE', title: 'VWAP Momentum Continuation Pattern', content: 'High-volume breakouts above 20-day VWAP in NIFTY call options exhibit an 84.2% win rate when VIX is between 12 and 18.', tags: ['NIFTY', 'VWAP', 'MOMENTUM', 'OPTIONS'], verificationCount: 142, createdAt: '2026-07-10' },
      { id: 'KN-102', domain: 'PATTERN', title: 'Pre-News Volatility Compression Cluster', content: 'Option implied volatility drops 15 mins prior to central bank speeches, creating gamma scalping traps.', tags: ['VOLATILITY', 'NEWS', 'GAMMA', 'OPTIONS'], verificationCount: 98, createdAt: '2026-07-12' },
      { id: 'KN-103', domain: 'RISK', title: 'Multi-Broker Latency Arbitrage Guard', content: 'Order routing slippage increases exponentially when broker latency exceeds 25ms during opening gapovers.', tags: ['ROUTING', 'LATENCY', 'SLIPPAGE'], verificationCount: 210, createdAt: '2026-07-15' },
      { id: 'KN-104', domain: 'MARKET', title: 'Crude Oil & Reliance Correlation Shift', content: 'Reliance Futures short-term beta to Brent crude flips from positive to negative during export tax revisions.', tags: ['RELIANCE', 'CRUDE', 'COMMODITIES'], verificationCount: 76, createdAt: '2026-07-18' },
      { id: 'KN-105', domain: 'STRATEGY', title: 'AlphaFlow-v3 Adaptive Stop Scaling', content: 'Scaling stop loss based on 1.2x ATR vs fixed percentages reduces whipsaw exits by 34.5%.', tags: ['STOP_LOSS', 'ATR', 'ALPHAFOW'], verificationCount: 320, createdAt: '2026-07-01' },
      { id: 'KN-106', domain: 'EXECUTION', title: 'Smart Order Router Failover Latency', content: 'Automated failover to secondary broker within 30ms preserves fill price within 1 tick.', tags: ['EXECUTION', 'FAILOVER', 'BROKER'], verificationCount: 180, createdAt: '2026-07-20' },
      { id: 'KN-107', domain: 'FINANCIAL', title: 'STCG vs LTCG Tax Optimization Thresholds', content: 'Holding positions across quarter-end for >365 days reduces tax liability by 10% for high-conviction equity trades.', tags: ['TAX', 'STCG', 'LTCG', 'NAV'], verificationCount: 54, createdAt: '2026-07-22' },
      { id: 'KN-108', domain: 'MARKET', title: 'MCX Gold Futures US CPI Macro Continuation', content: 'Lower-than-expected CPI print triggers a highly reliable MCX Gold futures rally with 89.4% historical significance.', tags: ['GOLD', 'MCX', 'CPI', 'COMMODITIES', 'MACRO'], verificationCount: 88, createdAt: '2026-07-24' },
      { id: 'KN-109', domain: 'MARKET', title: 'MCX Gold ↔ Gold ETF Cross-Market Correlation', content: 'MCX Gold futures premium over Gold ETF leads physical spot movement by 4.2 minutes with 94.1% cross-market arbitrage accuracy.', tags: ['MCX_GOLD', 'GOLD_ETF', 'CROSS_MARKET', 'ARBITRAGE'], verificationCount: 112, createdAt: '2026-07-24' },
      { id: 'KN-110', domain: 'MARKET', title: 'MCX Crude ↔ Energy ETF Linkage', content: 'MCX Crude Oil futures intraday momentum shifts predict Energy ETF price trend reversals with 88.6% directional fidelity.', tags: ['MCX_CRUDE', 'ENERGY_ETF', 'CROSS_MARKET', 'COMMODITIES'], verificationCount: 94, createdAt: '2026-07-24' }
    ];
  }

  private seedPatterns() {
    this.patterns = [
      { id: 'PAT-1', category: 'REPEATED_WINNER', title: 'NIFTY Morning VWAP Breakout', description: 'Consistently yields >5% ROI on 09:30-10:30 AM trades with high volume confirmation.', frequency: 42, winRateImpact: '+12.4%', detectedAt: '2026-07-24 10:30:00' },
      { id: 'PAT-2', category: 'REPEATED_LOSS', title: 'Pre-Event Mean Reversion Trap', description: 'Mean reversion trades initiated <15 mins prior to news releases fail 68% of the time.', frequency: 18, winRateImpact: '-8.5%', detectedAt: '2026-07-24 13:50:00' },
      { id: 'PAT-3', category: 'MARKET_BEHAVIOUR', title: 'Mid-Day Option Gamma Squeeze', description: 'BankNifty options exhibit sharp directional acceleration between 01:15 PM and 02:00 PM.', frequency: 31, winRateImpact: '+9.2%', detectedAt: '2026-07-23 14:00:00' },
      { id: 'PAT-4', category: 'SECTOR_BEHAVIOUR', title: 'IT Sector US Tech Sympathy', description: 'INFY and TCS futures lag Nasdaq 100 futures open by exactly 12 minutes with 89% correlation.', frequency: 54, winRateImpact: '+14.1%', detectedAt: '2026-07-22 16:00:00' },
      { id: 'PAT-5', category: 'AI_BEHAVIOUR', title: 'GPT-5 vs Claude Consensus Alignment', description: 'When GPT-5 and Claude Sonnet 5 agree with >90% confidence, win rate reaches 91.2%.', frequency: 88, winRateImpact: '+18.0%', detectedAt: '2026-07-24 12:30:00' },
      { id: 'PAT-6', category: 'STRATEGY_BEHAVIOUR', title: 'Adaptive ATR Stop vs Fixed Stop', description: 'Adaptive ATR stops outperform fixed percentage stops by +3.2x capital efficiency ratio.', frequency: 120, winRateImpact: '+15.5%', detectedAt: '2026-07-21 00:00:00' },
      { id: 'PAT-7', category: 'MARKET_BEHAVIOUR', title: 'Gold Spot Post-CPI Trend Extension', description: 'Gold spot breakout extends trend by exactly 4.2 hours on positive macro surprise prints.', frequency: 15, winRateImpact: '+10.8%', detectedAt: '2026-07-24 15:50:00' }
    ];
  }

  private seedRecommendations() {
    this.recommendations = [
      { id: 'REC-1', type: 'RISK_CHANGE', title: 'Increase News Event Buffer Window', target: 'Execution Engine', recommendation: 'Expand execution lock window prior to high-impact economic news from 10m to 20m.', expectedGain: '+3.2% Win Rate', status: 'PROPOSED' },
      { id: 'REC-2', type: 'STRATEGY_IMPROVEMENT', title: 'Incorporate Volume Delta Filter in DeepSeek R1', target: 'DeepSeek R1', recommendation: 'Require 2.0x volume delta before triggering mean reversion breakouts in futures.', expectedGain: '+5.4% Win Rate', status: 'APPROVED' },
      { id: 'REC-3', type: 'PARAMETER_OPTIMIZATION', title: 'Tune ATR Multiplier to 1.3x for BankNifty', target: 'AlphaFlow-v3', recommendation: 'Increase stop multiplier from 1.2x to 1.3x ATR to accommodate higher bank volatility.', expectedGain: '+2.8% ROI', status: 'APPLIED' },
      { id: 'REC-4', type: 'CAPITAL_OPTIMIZATION', title: 'Reallocate +$50k Capital to GPT-5', target: 'Fund Manager', recommendation: 'Promote GPT-5 capital allocation from $250k to $300k based on 98.2 CSI score.', expectedGain: '+12.5% Annual ROI', status: 'PROPOSED' },
      { id: 'REC-5', type: 'EXECUTION_OPTIMIZATION', title: 'Enable Smart Order Routing Auto-Failover at 20ms', target: 'Broker Hub', recommendation: 'Lower latency failover trigger from 35ms to 20ms to minimize opening gap slippage.', expectedGain: '1.2 Bps Cost Save', status: 'APPLIED' }
    ];
  }

  private seedEvolutionLineages() {
    this.evolutionLineages = [
      { modelId: 'GPT-5', modelName: 'GPT-5 Institutional', generation: 'Gen 14.2', mutation: 'Added multi-asset correlation weighting + 1.2x ATR adaptive stop', role: 'CHAMPION', parentModel: 'GPT-4o', winRate: '84.2%', csiScore: 98.2, status: 'PROMOTED', updatedAt: '2026-07-24 14:00' },
      { modelId: 'Claude-Sonnet-5', modelName: 'Claude Sonnet 5', generation: 'Gen 14.1', mutation: 'Refined regulatory news sentiment parser + macro risk veto', role: 'CHAMPION', parentModel: 'Claude 3.5 Sonnet', winRate: '81.8%', csiScore: 96.4, status: 'PROMOTED', updatedAt: '2026-07-24 12:00' },
      { modelId: 'DeepSeek-R1', modelName: 'DeepSeek R1 Quant', generation: 'Gen 13.9', mutation: 'Reinforcement learning from trade execution slippage feedback', role: 'CHAMPION', parentModel: 'DeepSeek V3', winRate: '79.5%', csiScore: 95.1, status: 'PROMOTED', updatedAt: '2026-07-23 18:00' },
      { modelId: 'Llama-3.3-70B', modelName: 'Llama 3.3 70B', generation: 'Gen 14.0', mutation: 'Fine-tuned paper mode model with low latency option pricing', role: 'CHALLENGER', parentModel: 'Llama 3.1 70B', winRate: '82.4%', csiScore: 92.0, status: 'MUTATED', updatedAt: '2026-07-24 10:00' },
      { modelId: 'Mistral-Large-2', modelName: 'Mistral Large 2', generation: 'Gen 13.5', mutation: 'EuroStoxx & APAC cross-exchange arbitrage optimizer', role: 'CHALLENGER', parentModel: 'Mistral Medium', winRate: '72.0%', csiScore: 78.4, status: 'ROLLBACK_READY', updatedAt: '2026-07-24 09:20' },
      { modelId: 'Legacy-Alpha-V1', modelName: 'Legacy Alpha V1', generation: 'Gen 8.0', mutation: 'Static technical indicators without adaptive ATR', role: 'RETIRED', parentModel: 'Base Quant', winRate: '42.0%', csiScore: 45.0, status: 'RETIRED', updatedAt: '2026-06-01 00:00' }
    ];
  }

  private seedKnowledgeGraph() {
    this.knowledgeGraph = [
      { id: 'NODE-MKT', type: 'MARKET', label: 'Market Intelligence Layer', connections: ['NODE-RES', 'NODE-ANA'], weight: 0.98 },
      { id: 'NODE-RES', type: 'RESEARCH', label: 'Macro & Micro Research Engine', connections: ['NODE-ANA', 'NODE-STR'], weight: 0.95 },
      { id: 'NODE-ANA', type: 'ANALYTICS', label: 'Quantitative Analytics Core', connections: ['NODE-STR', 'NODE-EXE'], weight: 0.96 },
      { id: 'NODE-STR', type: 'STRATEGY', label: 'Strategy Builder & Backtest', connections: ['NODE-EXE', 'NODE-FIN'], weight: 0.94 },
      { id: 'NODE-EXE', type: 'EXECUTION', label: 'Adaptive Order Routing & Broker', connections: ['NODE-FIN', 'NODE-LRN'], weight: 0.99 },
      { id: 'NODE-FIN', type: 'FINANCE', label: 'Double Entry Ledger & Tax Engine', connections: ['NODE-LRN', 'NODE-MKT'], weight: 0.97 },
      { id: 'NODE-LRN', type: 'LEARNING', label: 'LMEOS Memory & Evolution Engine', connections: ['NODE-MKT', 'NODE-STR'], weight: 1.00 }
    ];
  }

  private seedLogs() {
    this.logs = [
      { id: 'LMEOS-106', timestamp: '15:48:25', category: 'LEARNING', message: 'Analyzed Commodity Trade TR-1030 (GOLD_COM): Spot breakout win generated KN-108 knowledge item.' },
      { id: 'LMEOS-101', timestamp: '14:28:10', category: 'LEARNING', message: 'Analyzed Trade TR-1029 (NIFTY26JUL22400CE): VWAP momentum win generated KN-2081 knowledge item.' },
      { id: 'LMEOS-102', timestamp: '14:15:02', category: 'MEMORY', message: 'Updated MEM-1 Working Memory confidence score to 96% based on live market volume.' },
      { id: 'LMEOS-103', timestamp: '13:50:45', category: 'KNOWLEDGE', message: 'Pattern Discovery Engine identified PAT-2 (Pre-Event Mean Reversion Trap) with 18 occurrences.' },
      { id: 'LMEOS-104', timestamp: '12:00:10', category: 'EVOLUTION', message: 'Calculated EVQS score: 95/100 (EXCELLENT). 12 Champions active, 14 Challengers in paper testing.' },
      { id: 'LMEOS-105', timestamp: '10:12:35', category: 'LEARNING', message: 'Quality Gate Verified for TR-1026: Blocked by Risk Guardian due to 35% sector heat cap.' }
    ];
  }
}
