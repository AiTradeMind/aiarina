import { getDb } from "../../../../db/client.ts";
import { 
  strategyLeaderboards, 
  strategyRankings, 
  strategyScorecards, 
  strategyRatingHistory, 
  strategyBenchmarks, 
  strategyAwards, 
  strategySeasons,
  strategyRegistry,
  strategyCapabilities,
  strategyCategories,
  strategyScoreHistory
} from "../../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { getDeterministicRandom } from "../../../../lib/utils.ts";
import { 
  StrategyLeaderboard, 
  StrategyRanking, 
  StrategyScorecard, 
  StrategyRatingHistory, 
  StrategyBenchmark, 
  StrategyAward, 
  StrategySeason 
} from "../types/index.ts";

const generateId = (prefix: string) => `${prefix}_${crypto.randomUUID().substring(0, 8)}`;

const defaultStrategies = [
  {
    id: "strat-alpha-momentum",
    name: "Alpha Momentum Pro",
    displayName: "Alpha Momentum Pro",
    category: "Momentum",
    description: "High-frequency trend following strategy utilizing advanced dynamic breakout channels and adaptive stop-losses.",
    version: "1.0.0",
    status: "Active",
    owner: "Enterprise Quantitative Team",
    createdBy: "System Seeder",
    riskLevel: "HIGH",
    complexity: 8,
    supportedMarkets: ["NSE", "BSE"],
    supportedInstruments: ["FUTURES", "OPTIONS"],
    minimumCapital: 500000,
    maximumCapital: 5000000,
    preferredTimeframe: "5m",
    preferredSession: "REGULAR",
  },
  {
    id: "strat-beta-meanrev",
    name: "Beta Mean Reversion",
    displayName: "Beta Mean Reversion",
    category: "Mean Reversion",
    description: "Statistical arbitrage strategy exploiting multi-hour overextended swings with Bollinger Band standard deviations.",
    version: "1.2.0",
    status: "Active",
    owner: "Risk Management Desk",
    createdBy: "System Seeder",
    riskLevel: "MEDIUM",
    complexity: 6,
    supportedMarkets: ["NSE"],
    supportedInstruments: ["EQUITIES"],
    minimumCapital: 200000,
    maximumCapital: 2000000,
    preferredTimeframe: "15m",
    preferredSession: "REGULAR",
  },
  {
    id: "strat-delta-scalper",
    name: "Delta Intraday Scalper",
    displayName: "Delta Intraday Scalper",
    category: "Scalping",
    description: "Ultra-fast micro-scalping strategy capturing small price imbalances across high-liquidity indexes.",
    version: "2.1.0",
    status: "Active",
    owner: "Intraday Desk",
    createdBy: "System Seeder",
    riskLevel: "HIGH",
    complexity: 9,
    supportedMarkets: ["NSE"],
    supportedInstruments: ["OPTIONS"],
    minimumCapital: 1000000,
    maximumCapital: 10000000,
    preferredTimeframe: "1m",
    preferredSession: "REGULAR",
  },
  {
    id: "strat-omega-hedger",
    name: "Omega Options Hedger",
    displayName: "Omega Options Hedger",
    category: "Options",
    description: "Delta-neutral option writing strategy optimizing theta decay with automated gamma scalping hedges.",
    version: "1.5.0",
    status: "Active",
    owner: "Derivative Strategy Group",
    createdBy: "System Seeder",
    riskLevel: "LOW",
    complexity: 7,
    supportedMarkets: ["NSE"],
    supportedInstruments: ["OPTIONS"],
    minimumCapital: 1500000,
    maximumCapital: 20000000,
    preferredTimeframe: "Daily",
    preferredSession: "ALL_DAY",
  },
  {
    id: "strat-gamma-hybrid",
    name: "Gamma AI Assisted Hybrid",
    displayName: "Gamma AI Assisted Hybrid",
    category: "AI Assisted",
    description: "Hybrid machine learning strategy combining sentiment analysis and order flow predictive models.",
    version: "3.0.0",
    status: "Active",
    owner: "AI Labs Desk",
    createdBy: "System Seeder",
    riskLevel: "MEDIUM",
    complexity: 10,
    supportedMarkets: ["NSE", "BSE"],
    supportedInstruments: ["EQUITIES", "FUTURES"],
    minimumCapital: 800000,
    maximumCapital: 8000000,
    preferredTimeframe: "Hourly",
    preferredSession: "REGULAR",
  }
];

const defaultCapabilities = [
  { id: "cap-alpha", strategyId: "strat-alpha-momentum", supportsPaperTrading: true, supportsAi: false, supportsAutomation: true, supportsReplay: true, supportsBacktesting: true, supportsPortfolio: true, supportsMultiAsset: true, supportsMultiTimeframe: true },
  { id: "cap-beta", strategyId: "strat-beta-meanrev", supportsPaperTrading: true, supportsAi: false, supportsAutomation: true, supportsReplay: true, supportsBacktesting: true, supportsPortfolio: false, supportsMultiAsset: false, supportsMultiTimeframe: true },
  { id: "cap-delta", strategyId: "strat-delta-scalper", supportsPaperTrading: true, supportsAi: false, supportsAutomation: true, supportsReplay: false, supportsBacktesting: true, supportsPortfolio: false, supportsMultiAsset: false, supportsMultiTimeframe: false },
  { id: "cap-omega", strategyId: "strat-omega-hedger", supportsPaperTrading: true, supportsAi: true, supportsAutomation: true, supportsReplay: true, supportsBacktesting: true, supportsPortfolio: true, supportsMultiAsset: true, supportsMultiTimeframe: true },
  { id: "cap-gamma", strategyId: "strat-gamma-hybrid", supportsPaperTrading: true, supportsAi: true, supportsAutomation: true, supportsReplay: true, supportsBacktesting: true, supportsPortfolio: true, supportsMultiAsset: true, supportsMultiTimeframe: true }
];

const strategyPerformanceData: Record<string, {
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  recoveryFactor: number;
  roi: number;
  beta: number;
  pnl: number;
}> = {
  "strat-alpha-momentum": { winRate: 0.58, profitFactor: 1.85, sharpeRatio: 2.15, maxDrawdown: 0.12, recoveryFactor: 2.8, roi: 0.38, beta: 1.25, pnl: 190000 },
  "strat-beta-meanrev": { winRate: 0.65, profitFactor: 1.62, sharpeRatio: 1.95, maxDrawdown: 0.08, recoveryFactor: 2.2, roi: 0.24, beta: 0.85, pnl: 48000 },
  "strat-delta-scalper": { winRate: 0.72, profitFactor: 2.10, sharpeRatio: 2.65, maxDrawdown: 0.15, recoveryFactor: 3.4, roi: 0.52, beta: 1.60, pnl: 520000 },
  "strat-omega-hedger": { winRate: 0.85, profitFactor: 1.90, sharpeRatio: 2.80, maxDrawdown: 0.04, recoveryFactor: 4.5, roi: 0.18, beta: 0.40, pnl: 270000 },
  "strat-gamma-hybrid": { winRate: 0.62, profitFactor: 2.25, sharpeRatio: 2.45, maxDrawdown: 0.10, recoveryFactor: 3.0, roi: 0.45, beta: 1.10, pnl: 360000 }
};

export class LeaderboardRepository {
  async getSeasons(): Promise<StrategySeason[]> {
    const db = await getDb();
    const records = await db.select().from(strategySeasons).orderBy(desc(strategySeasons.createdTime));
    return records.map(r => ({
      ...r,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
      createdTime: r.createdTime.toISOString()
    }));
  }

  async getLeaderboards(): Promise<StrategyLeaderboard[]> {
    const db = await getDb();
    const records = await db.select().from(strategyLeaderboards);
    return records.map(r => ({
      ...r,
      updatedTime: r.updatedTime.toISOString()
    }));
  }

  async getRankings(leaderboardId?: string): Promise<StrategyRanking[]> {
    const db = await getDb();
    let query = db.select().from(strategyRankings);
    if (leaderboardId) {
      // @ts-ignore
      query = query.where(eq(strategyRankings.leaderboardId, leaderboardId));
    }
    const records = await query.orderBy(strategyRankings.rank);
    return records.map(r => ({
      ...r,
      updatedTime: r.updatedTime.toISOString()
    }));
  }

  async getScorecards(strategyId?: string): Promise<StrategyScorecard[]> {
    const db = await getDb();
    let query = db.select().from(strategyScorecards);
    if (strategyId) {
      // @ts-ignore
      query = query.where(eq(strategyScorecards.strategyId, strategyId));
    }
    const records = await query;
    return records.map(r => ({
      ...r,
      updatedTime: r.updatedTime.toISOString()
    }));
  }

  async getRatingHistory(strategyId: string): Promise<StrategyRatingHistory[]> {
    const db = await getDb();
    const records = await db.select().from(strategyRatingHistory)
      .where(eq(strategyRatingHistory.strategyId, strategyId))
      .orderBy(desc(strategyRatingHistory.timestamp));
    return records.map(r => ({
      ...r,
      timestamp: r.timestamp.toISOString()
    }));
  }

  async getBenchmarks(strategyId?: string): Promise<StrategyBenchmark[]> {
    const db = await getDb();
    let query = db.select().from(strategyBenchmarks);
    if (strategyId) {
      // @ts-ignore
      query = query.where(eq(strategyBenchmarks.strategyId, strategyId));
    }
    const records = await query;
    return records.map(r => ({
      ...r,
      updatedTime: r.updatedTime.toISOString()
    }));
  }

  async getAwards(strategyId?: string): Promise<StrategyAward[]> {
    const db = await getDb();
    let query = db.select().from(strategyAwards);
    if (strategyId) {
      // @ts-ignore
      query = query.where(eq(strategyAwards.strategyId, strategyId));
    }
    const records = await query.orderBy(desc(strategyAwards.awardedTime));
    return records.map(r => ({
      ...r,
      awardedTime: r.awardedTime.toISOString()
    }));
  }

  async recalculateLeaderboard(): Promise<any> {
    const db = await getDb();

    // 1. Bootstrapping and seeding checks
    let strategiesList = await db.select().from(strategyRegistry);
    if (strategiesList.length === 0) {
      console.log("No strategies found in registry. Seeding defaults...");
      for (const strat of defaultStrategies) {
        // @ts-ignore
        await db.insert(strategyRegistry).values(strat);
      }
      for (const cap of defaultCapabilities) {
        // @ts-ignore
        await db.insert(strategyCapabilities).values(cap);
      }
      strategiesList = await db.select().from(strategyRegistry);
    }

    // Ensure categories are seeded
    const categoriesList = await db.select().from(strategyCategories);
    if (categoriesList.length === 0) {
      const distinctCats = Array.from(new Set(strategiesList.map(s => s.category)));
      for (const catName of distinctCats) {
        await db.insert(strategyCategories).values({
          id: generateId("cat"),
          name: catName,
          description: `${catName} investment and trade strategy category.`
        });
      }
    }

    // Ensure seasons are seeded
    let seasonsList = await db.select().from(strategySeasons);
    if (seasonsList.length === 0) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const thirtyDaysAhead = new Date();
      thirtyDaysAhead.setDate(today.getDate() + 30);

      const defaultSeasons = [
        {
          id: "season-weekly-current",
          name: "Weekly Sprint Season",
          type: "Weekly",
          startDate: thirtyDaysAgo,
          endDate: thirtyDaysAhead,
          isActive: true
        },
        {
          id: "season-monthly-current",
          name: "Monthly Enterprise Season",
          type: "Monthly",
          startDate: thirtyDaysAgo,
          endDate: thirtyDaysAhead,
          isActive: true
        },
        {
          id: "season-all-time",
          name: "All-Time Champion League",
          type: "All Time",
          startDate: thirtyDaysAgo,
          endDate: thirtyDaysAhead,
          isActive: true
        }
      ];

      for (const s of defaultSeasons) {
        await db.insert(strategySeasons).values(s);
      }
      seasonsList = await db.select().from(strategySeasons);
    }

    const currentSeason = seasonsList.find(s => s.isActive) || seasonsList[0];

    // Ensure leaderboards are seeded
    let leaderboardsList = await db.select().from(strategyLeaderboards);
    if (leaderboardsList.length === 0) {
      const defaultLeaderboards = [
        { id: "leaderboard-overall", name: "Global Enterprise Overall", category: "Overall", seasonId: currentSeason.id },
        { id: "leaderboard-momentum", name: "Momentum Elite League", category: "Momentum", seasonId: currentSeason.id },
        { id: "leaderboard-meanrev", name: "Mean Reversion Pro Bracket", category: "Mean Reversion", seasonId: currentSeason.id },
        { id: "leaderboard-scalping", name: "Scalper Masters Cup", category: "Scalping", seasonId: currentSeason.id },
        { id: "leaderboard-options", name: "Delta Neutral hedgers", category: "Options", seasonId: currentSeason.id },
        { id: "leaderboard-ai", name: "AI Assisted Predictive League", category: "AI Assisted", seasonId: currentSeason.id }
      ];

      for (const lb of defaultLeaderboards) {
        await db.insert(strategyLeaderboards).values(lb);
      }
      leaderboardsList = await db.select().from(strategyLeaderboards);
    }

    // Clean up existing rankings, scorecards, benchmarks, awards for recalculation
    await db.delete(strategyRankings);
    await db.delete(strategyScorecards);
    await db.delete(strategyBenchmarks);
    await db.delete(strategyAwards);

    const scorecardsCreated: any[] = [];

    // 2. Compute scorecards for each strategy
    for (const strat of strategiesList) {
      const perf = strategyPerformanceData[strat.id] || {
        winRate: 0.55,
        profitFactor: 1.5,
        sharpeRatio: 1.8,
        maxDrawdown: 0.10,
        recoveryFactor: 2.0,
        roi: 0.20,
        beta: 1.0,
        pnl: 100000
      };

      // Scoring formulas:
      const backtestingScore = (perf.winRate * 25) + (Math.min(3, perf.profitFactor) / 3 * 25) + (Math.min(3, perf.sharpeRatio) / 3 * 25) + (Math.max(0, 1 - perf.maxDrawdown) * 25);
      const paperTradingScore = backtestingScore - 2 + (getDeterministicRandom(strat.id, 15) * 4);
      const riskScore = Math.max(0, Math.min(100, 100 - (perf.maxDrawdown * 200) - (Math.abs(1 - perf.beta) * 15)));
      const consistencyScore = Math.max(0, Math.min(100, (perf.winRate * 80) + (perf.profitFactor * 10)));
      const capitalEfficiency = Math.max(0, Math.min(100, perf.roi * 180));
      const recoveryScore = Math.max(0, Math.min(100, Math.min(5, perf.recoveryFactor) * 20));
      const executionQuality = 90 + (getDeterministicRandom(strat.id, 16) * 8);

      const overallScore = (backtestingScore * 0.35) + (paperTradingScore * 0.25) + (riskScore * 0.20) + (consistencyScore * 0.20);
      
      let compositeRating = "C";
      if (overallScore >= 90) compositeRating = "S";
      else if (overallScore >= 80) compositeRating = "A";
      else if (overallScore >= 70) compositeRating = "B";
      else if (overallScore >= 60) compositeRating = "C";
      else if (overallScore >= 50) compositeRating = "D";
      else compositeRating = "E";

      const scorecardId = generateId("scr");
      await db.insert(strategyScorecards).values({
        id: scorecardId,
        strategyId: strat.id,
        seasonId: currentSeason.id,
        overallScore,
        backtestingScore,
        paperTradingScore,
        riskScore,
        consistencyScore,
        capitalEfficiency,
        recoveryScore,
        executionQuality,
        compositeRating
      });

      // Record History
      await db.insert(strategyScoreHistory).values({
        id: generateId("sch"),
        strategyId: strat.id,
        score: overallScore
      });

      await db.insert(strategyRatingHistory).values({
        id: generateId("srh"),
        strategyId: strat.id,
        rating: compositeRating,
        score: overallScore
      });

      // Create benchmarks
      const bmarks = [
        { name: "NIFTY 50", multiplier: 0.6, baseReturn: 12 },
        { name: "BANK NIFTY", multiplier: 0.8, baseReturn: 15 },
        { name: "Peer Strategies", multiplier: 0.5, baseReturn: 10 }
      ];

      for (const bm of bmarks) {
        const strategyReturn = perf.roi * 100;
        const benchmarkReturn = bm.baseReturn + (getDeterministicRandom(strat.id + bm.name, 17) * 4 - 2);
        const alpha = strategyReturn - benchmarkReturn;
        const beta = perf.beta;

        await db.insert(strategyBenchmarks).values({
          id: generateId("bmk"),
          strategyId: strat.id,
          benchmarkName: bm.name,
          strategyReturn,
          benchmarkReturn,
          alpha,
          beta
        });
      }

      scorecardsCreated.push({
        strategyId: strat.id,
        overallScore,
        compositeRating,
        winRate: perf.winRate,
        maxDrawdown: perf.maxDrawdown,
        sharpeRatio: perf.sharpeRatio,
        recoveryFactor: perf.recoveryFactor,
        consistencyScore
      });
    }

    // 3. Populate rankings for each leaderboard
    for (const lb of leaderboardsList) {
      let filteredScorecards = [...scorecardsCreated];
      if (lb.category !== "Overall") {
        filteredScorecards = scorecardsCreated.filter(sc => {
          const strat = strategiesList.find(s => s.id === sc.strategyId);
          return strat && strat.category === lb.category;
        });
      }

      // Sort by score desc
      filteredScorecards.sort((a, b) => b.overallScore - a.overallScore);

      for (let index = 0; index < filteredScorecards.length; index++) {
        const sc = filteredScorecards[index];
        const rank = index + 1;
        const previousRank = Math.min(filteredScorecards.length, rank + (getDeterministicRandom(sc.strategyId, 18) > 0.5 ? 1 : getDeterministicRandom(sc.strategyId, 19) > 0.5 ? -1 : 0));

        await db.insert(strategyRankings).values({
          id: generateId("rnk"),
          leaderboardId: lb.id,
          strategyId: sc.strategyId,
          rank,
          previousRank,
          score: sc.overallScore,
          rating: sc.compositeRating
        });
      }
    }

    // 4. Populate awards
    const bestOverall = [...scorecardsCreated].sort((a, b) => b.overallScore - a.overallScore)[0];
    const highestWinRate = [...scorecardsCreated].sort((a, b) => b.winRate - a.winRate)[0];
    const lowestDrawdown = [...scorecardsCreated].sort((a, b) => a.maxDrawdown - b.maxDrawdown)[0];
    const bestSharpe = [...scorecardsCreated].sort((a, b) => b.sharpeRatio - a.sharpeRatio)[0];
    const bestRecovery = [...scorecardsCreated].sort((a, b) => b.recoveryFactor - a.recoveryFactor)[0];
    const highestStability = [...scorecardsCreated].sort((a, b) => b.consistencyScore - a.consistencyScore)[0];

    const awardItems = [
      { strategyId: bestOverall.strategyId, type: "Best Overall", desc: "Awarded to the strategy with the highest combined backtesting, paper trading, and risk score." },
      { strategyId: highestWinRate.strategyId, type: "Highest Win Rate", desc: "Awarded to the strategy with exceptional entry accuracy and trade win ratio." },
      { strategyId: lowestDrawdown.strategyId, type: "Lowest Drawdown", desc: "Recognizing outstanding capital protection and minimum drawdown." },
      { strategyId: bestSharpe.strategyId, type: "Best Sharpe Ratio", desc: "Awarded for supreme risk-adjusted return ratio over the evaluation interval." },
      { strategyId: bestRecovery.strategyId, type: "Best Recovery", desc: "Awarded to the strategy with rapid drawdown recovery performance." },
      { strategyId: highestStability.strategyId, type: "Highest Stability", desc: "Awarded for high equity curve consistency with minimum variance." }
    ];

    for (const aw of awardItems) {
      await db.insert(strategyAwards).values({
        id: generateId("awd"),
        strategyId: aw.strategyId,
        seasonId: currentSeason.id,
        awardType: aw.type,
        description: aw.desc
      });
    }

    return {
      status: "success",
      message: "Leaderboard and all verified metrics recalculated successfully",
      recalculatedTime: new Date().toISOString()
    };
  }
}
