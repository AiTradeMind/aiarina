import { getDb } from "../../../../db/client.ts";
import { sql, eq, and, desc, or } from "drizzle-orm";
import {
  strategyRegistry,
  strategyScorecards,
  strategyAnalytics,
  strategyPerformanceSummary,
  strategyDailyMetrics,
  strategyMonthlyMetrics,
  strategyYearlyMetrics,
  strategyMetricHistory,
  strategyAttribution,
  strategyComparison,
  strategyReports,
  strategyDashboardCache
} from "../../../../db/schema.ts";
import {
  StrategyPerformanceSummary,
  StrategyDailyMetrics,
  StrategyMonthlyMetrics,
  StrategyYearlyMetrics,
  StrategyMetricHistory,
  StrategyAttribution,
  StrategyComparison,
  StrategyReport,
  StrategyAnalyticsDashboard
} from "../types/index.ts";

const generateId = (prefix: string) => `${prefix}_${crypto.randomUUID().substring(0, 8)}`;

// Helper to get deterministic "random" value 0-1
const getDeterministicRandom = (input: string, seed: number) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(Math.sin(hash + seed) * 10000) % 1;
};

export class AnalyticsRepository {
  private tablesVerified = false;

  async ensureTablesExist(): Promise<void> {
    if (this.tablesVerified) return;
    const db = await getDb();

    try {
      // 1. strategy_analytics
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_analytics (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          total_trades INTEGER DEFAULT 0,
          profit_factor DOUBLE PRECISION DEFAULT 0,
          win_rate DOUBLE PRECISION DEFAULT 0,
          max_drawdown DOUBLE PRECISION DEFAULT 0,
          roi DOUBLE PRECISION DEFAULT 0,
          sharpe_ratio DOUBLE PRECISION DEFAULT 0,
          updated_time TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 2. strategy_performance_summary
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_performance_summary (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          net_profit DOUBLE PRECISION DEFAULT 0 NOT NULL,
          gross_profit DOUBLE PRECISION DEFAULT 0 NOT NULL,
          gross_loss DOUBLE PRECISION DEFAULT 0 NOT NULL,
          roi DOUBLE PRECISION DEFAULT 0 NOT NULL,
          cagr DOUBLE PRECISION DEFAULT 0 NOT NULL,
          profit_factor DOUBLE PRECISION DEFAULT 0 NOT NULL,
          sharpe_ratio DOUBLE PRECISION DEFAULT 0 NOT NULL,
          sortino_ratio DOUBLE PRECISION DEFAULT 0 NOT NULL,
          calmar_ratio DOUBLE PRECISION DEFAULT 0 NOT NULL,
          win_rate DOUBLE PRECISION DEFAULT 0 NOT NULL,
          loss_rate DOUBLE PRECISION DEFAULT 0 NOT NULL,
          average_trade DOUBLE PRECISION DEFAULT 0 NOT NULL,
          recovery_factor DOUBLE PRECISION DEFAULT 0 NOT NULL,
          max_drawdown DOUBLE PRECISION DEFAULT 0 NOT NULL,
          average_holding_time DOUBLE PRECISION DEFAULT 0 NOT NULL,
          capital_utilization DOUBLE PRECISION DEFAULT 0 NOT NULL,
          strategy_stability DOUBLE PRECISION DEFAULT 0 NOT NULL,
          execution_efficiency DOUBLE PRECISION DEFAULT 0 NOT NULL,
          updated_time TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 3. strategy_daily_metrics
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_daily_metrics (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          date TIMESTAMP NOT NULL,
          pnl DOUBLE PRECISION DEFAULT 0 NOT NULL,
          roi DOUBLE PRECISION DEFAULT 0 NOT NULL,
          drawdown DOUBLE PRECISION DEFAULT 0 NOT NULL,
          trades_count INTEGER DEFAULT 0 NOT NULL
        )
      `);

      // 4. strategy_monthly_metrics
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_monthly_metrics (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          year INTEGER NOT NULL,
          month INTEGER NOT NULL,
          pnl DOUBLE PRECISION DEFAULT 0 NOT NULL,
          roi DOUBLE PRECISION DEFAULT 0 NOT NULL,
          max_drawdown DOUBLE PRECISION DEFAULT 0 NOT NULL
        )
      `);

      // 5. strategy_yearly_metrics
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_yearly_metrics (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          year INTEGER NOT NULL,
          pnl DOUBLE PRECISION DEFAULT 0 NOT NULL,
          roi DOUBLE PRECISION DEFAULT 0 NOT NULL,
          max_drawdown DOUBLE PRECISION DEFAULT 0 NOT NULL
        )
      `);

      // 6. strategy_metric_history
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_metric_history (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          metric_name VARCHAR(100) NOT NULL,
          metric_value DOUBLE PRECISION NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 7. strategy_attribution
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_attribution (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          entry_logic_contribution DOUBLE PRECISION DEFAULT 0 NOT NULL,
          exit_logic_contribution DOUBLE PRECISION DEFAULT 0 NOT NULL,
          risk_engine_contribution DOUBLE PRECISION DEFAULT 0 NOT NULL,
          ai_brain_contribution DOUBLE PRECISION DEFAULT 0 NOT NULL,
          optimizer_contribution DOUBLE PRECISION DEFAULT 0 NOT NULL,
          paper_trading_contribution DOUBLE PRECISION DEFAULT 0 NOT NULL,
          market_conditions_contribution DOUBLE PRECISION DEFAULT 0 NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 8. strategy_comparison
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_comparison (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id_a VARCHAR(50) NOT NULL,
          strategy_id_b VARCHAR(50) NOT NULL,
          metric_name VARCHAR(100) NOT NULL,
          value_a DOUBLE PRECISION,
          value_b DOUBLE PRECISION,
          comparison_result TEXT,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 9. strategy_reports
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_reports (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50),
          report_type VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          content JSONB NOT NULL,
          created_by VARCHAR(100),
          created_time TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 10. strategy_dashboard_cache
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_dashboard_cache (
          id VARCHAR(50) PRIMARY KEY,
          cache_key VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          updated_time TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      this.tablesVerified = true;
      console.log("Strategy Analytics database tables verified/created successfully.");
    } catch (error) {
      console.error("Failed to verify/create Strategy Analytics tables:", error);
    }
  }

  async populateMetricsIfEmpty(): Promise<void> {
    await this.ensureTablesExist();
    const db = await getDb();

    const existingSummary = await db.select().from(strategyPerformanceSummary);
    if (existingSummary.length > 0) return;

    console.log("Analytics tables empty. Seeding deterministic metrics...");
    const strategies = await db.select().from(strategyRegistry);
    const scorecards = await db.select().from(strategyScorecards);

    for (const strat of strategies) {
      const sc = scorecards.find(s => s.strategyId === strat.id) || {
        overallScore: 75,
        backtestingScore: 78,
        paperTradingScore: 74,
        riskScore: 80,
        consistencyScore: 72,
        capitalEfficiency: 70,
        recoveryScore: 75,
        executionQuality: 92
      };

      // Map backtesting scorecard to robust analytics performance summary
      const roi = (sc.capitalEfficiency || 70) / 200; // e.g. 35% ROI
      const winRate = (sc.consistencyScore || 72) / 110; // e.g. 65% win rate
      const maxDrawdown = 0.25 - ((sc.riskScore || 80) / 1000 * 2); // e.g. 9% drawdown
      const profitFactor = 1.2 + ((sc.overallScore - 50) / 25); // e.g. 2.2 PF
      const sharpeRatio = 1.0 + ((sc.overallScore - 50) / 20); // e.g. 2.25 Sharpe
      const netProfit = (strat.minimumCapital || 500000) * roi;
      const grossProfit = netProfit * 1.5;
      const grossLoss = grossProfit - netProfit;

      const summaryId = generateId("aps");
      await db.insert(strategyPerformanceSummary).values({
        id: summaryId,
        strategyId: strat.id,
        netProfit,
        grossProfit,
        grossLoss,
        roi,
        cagr: roi * 0.9,
        profitFactor,
        sharpeRatio,
        sortinoRatio: sharpeRatio * 1.2,
        calmarRatio: roi / Math.max(0.01, maxDrawdown),
        winRate,
        lossRate: 1 - winRate,
        averageTrade: netProfit / 120,
        recoveryFactor: 2.5 + (sc.recoveryScore || 75) / 50,
        maxDrawdown,
        averageHoldingTime: 15 + getDeterministicRandom(strat.id, 1) * 240, 
        capitalUtilization: 0.65 + getDeterministicRandom(strat.id, 2) * 0.3,
        strategyStability: (sc.consistencyScore || 75) / 100,
        executionEfficiency: (sc.executionQuality || 90) / 100
      });

      // Populate strategy_analytics helper table
      await db.insert(strategyAnalytics).values({
        id: generateId("ana"),
        strategyId: strat.id,
        totalTrades: 120,
        profitFactor,
        winRate,
        maxDrawdown,
        roi,
        sharpeRatio
      });

      // Populate daily metrics for last 30 days
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dailyRoi = (roi / 30) + (getDeterministicRandom(strat.id + i, 3) * 0.04 - 0.018); 
        const dailyPnl = (strat.minimumCapital || 500000) * dailyRoi;

        await db.insert(strategyDailyMetrics).values({
          id: generateId("adm"),
          strategyId: strat.id,
          date,
          pnl: dailyPnl,
          roi: dailyRoi,
          drawdown: Math.max(0, maxDrawdown * (0.3 + getDeterministicRandom(strat.id + i, 4) * 0.7)),
          tradesCount: Math.floor(2 + getDeterministicRandom(strat.id + i, 5) * 10)
        });

        // Insert some historic metrics
        await db.insert(strategyMetricHistory).values({
          id: generateId("smh"),
          strategyId: strat.id,
          metricName: "ROI",
          metricValue: dailyRoi,
          timestamp: date
        });
      }

      // Populate monthly metrics for 2026
      const months = [1, 2, 3, 4, 5, 6, 7];
      for (const m of months) {
        const monthlyRoi = (roi / 7) + (getDeterministicRandom(strat.id + m, 6) * 0.08 - 0.035);
        await db.insert(strategyMonthlyMetrics).values({
          id: generateId("smm"),
          strategyId: strat.id,
          year: 2026,
          month: m,
          pnl: (strat.minimumCapital || 500000) * monthlyRoi,
          roi: monthlyRoi,
          maxDrawdown: maxDrawdown * (0.6 + getDeterministicRandom(strat.id + m, 7) * 0.4)
        });
      }

      // Populate attribution
      await db.insert(strategyAttribution).values({
        id: generateId("att"),
        strategyId: strat.id,
        entryLogicContribution: 0.25 + getDeterministicRandom(strat.id, 8) * 0.2,
        exitLogicContribution: 0.20 + getDeterministicRandom(strat.id, 9) * 0.2,
        riskEngineContribution: 0.15 + getDeterministicRandom(strat.id, 10) * 0.15,
        aiBrainContribution: strat.category === "AI Assisted" ? 0.35 : 0.05 + getDeterministicRandom(strat.id, 11) * 0.1,
        optimizerContribution: 0.10 + getDeterministicRandom(strat.id, 12) * 0.1,
        paperTradingContribution: 0.05 + getDeterministicRandom(strat.id, 13) * 0.05,
        marketConditionsContribution: 0.08 + getDeterministicRandom(strat.id, 14) * 0.1
      });
    }
    // ... rest remains same


    // Generate comparison records
    for (let i = 0; i < strategies.length; i++) {
      for (let j = i + 1; j < strategies.length; j++) {
        const sA = strategies[i];
        const sB = strategies[j];
        await db.insert(strategyComparison).values({
          id: generateId("cmp"),
          strategyIdA: sA.id,
          strategyIdB: sB.id,
          metricName: "ROI",
          valueA: roiFromStratId(sA.id),
          valueB: roiFromStratId(sB.id),
          comparisonResult: `ROI Comparison: ${sA.name} vs ${sB.name}`
        });
      }
    }

    function roiFromStratId(id: string) {
      if (id.includes("alpha")) return 0.38;
      if (id.includes("beta")) return 0.24;
      if (id.includes("delta")) return 0.52;
      if (id.includes("omega")) return 0.18;
      return 0.45;
    }

    // Generate Default Reports
    await db.insert(strategyReports).values({
      id: "report-executive-init",
      strategyId: null,
      reportType: "Executive",
      name: "Institutional Quarter 2 Strategy Portfolio Overview",
      content: {
        highlights: "Delta Intraday Scalper leads across high-liquidity options. Omega Option Hedger maintains extremely stable risk profile.",
        aggregateRoi: 0.354,
        sharpeRatio: 2.39,
        maxDrawdown: 0.09
      },
      createdBy: "System Seeder"
    });
  }

  async getDashboard(): Promise<StrategyAnalyticsDashboard> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    const strategies = await db.select().from(strategyRegistry);
    const summaries = await db.select().from(strategyPerformanceSummary);

    const totalStrategies = strategies.length;
    const activeStrategies = strategies.filter(s => s.status === "Active").length;

    let aggregatePnl = 0;
    let sumRoi = 0;
    let sumSharpe = 0;
    let sumWinRate = 0;
    let sumDrawdown = 0;

    for (const s of summaries) {
      aggregatePnl += s.netProfit;
      sumRoi += s.roi;
      sumSharpe += s.sharpeRatio;
      sumWinRate += s.winRate;
      sumDrawdown += s.maxDrawdown;
    }

    const count = summaries.length || 1;

    const topPerformers = summaries
      .map(s => {
        const strat = strategies.find(st => st.id === s.strategyId);
        return {
          strategyId: s.strategyId,
          name: strat?.displayName || strat?.name || s.strategyId,
          roi: s.roi,
          pnl: s.netProfit,
          sharpeRatio: s.sharpeRatio,
          winRate: s.winRate,
          category: strat?.category || "Unknown"
        };
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);

    // Get recent activity using daily metrics
    const recentMetrics = await db.select().from(strategyDailyMetrics)
      .orderBy(desc(strategyDailyMetrics.date))
      .limit(5);

    const recentActivity = recentMetrics.map(m => {
      const strat = strategies.find(s => s.id === m.strategyId);
      return {
        strategyId: m.strategyId,
        name: strat?.displayName || strat?.name || m.strategyId,
        timestamp: m.date.toISOString(),
        metricValue: m.pnl,
        metricName: "Daily PnL"
      };
    });

    return {
      summary: {
        totalStrategies,
        activeStrategies,
        aggregateRoi: sumRoi / count,
        aggregatePnl,
        averageSharpe: sumSharpe / count,
        averageWinRate: sumWinRate / count,
        averageDrawdown: sumDrawdown / count
      },
      topPerformers,
      recentActivity
    };
  }

  async getPerformanceSummary(strategyId?: string): Promise<StrategyPerformanceSummary[]> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    let query = db.select().from(strategyPerformanceSummary);
    if (strategyId) {
      // @ts-ignore
      query = query.where(eq(strategyPerformanceSummary.strategyId, strategyId));
    }
    const records = await query;
    return records.map(r => ({
      ...r,
      updatedTime: r.updatedTime.toISOString()
    }));
  }

  async getDailyMetrics(strategyId: string): Promise<StrategyDailyMetrics[]> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    const records = await db.select().from(strategyDailyMetrics)
      .where(eq(strategyDailyMetrics.strategyId, strategyId))
      .orderBy(desc(strategyDailyMetrics.date));

    return records.map(r => ({
      ...r,
      date: r.date.toISOString()
    }));
  }

  async getMonthlyMetrics(strategyId: string): Promise<StrategyMonthlyMetrics[]> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    const records = await db.select().from(strategyMonthlyMetrics)
      .where(eq(strategyMonthlyMetrics.strategyId, strategyId));

    return records;
  }

  async getYearlyMetrics(strategyId: string): Promise<StrategyYearlyMetrics[]> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    const records = await db.select().from(strategyYearlyMetrics)
      .where(eq(strategyYearlyMetrics.strategyId, strategyId));

    return records;
  }

  async getHistory(strategyId: string, metricName?: string): Promise<StrategyMetricHistory[]> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    let query;
    if (metricName) {
      query = db.select().from(strategyMetricHistory)
        .where(and(
          eq(strategyMetricHistory.strategyId, strategyId),
          eq(strategyMetricHistory.metricName, metricName)
        ));
    } else {
      query = db.select().from(strategyMetricHistory)
        .where(eq(strategyMetricHistory.strategyId, strategyId));
    }

    const records = await query.orderBy(desc(strategyMetricHistory.timestamp));
    return records.map(r => ({
      ...r,
      timestamp: r.timestamp.toISOString()
    }));
  }

  async getAttribution(strategyId: string): Promise<StrategyAttribution[]> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    const records = await db.select().from(strategyAttribution)
      .where(eq(strategyAttribution.strategyId, strategyId))
      .orderBy(desc(strategyAttribution.timestamp));

    return records.map(r => ({
      ...r,
      timestamp: r.timestamp.toISOString()
    }));
  }

  async getComparison(strategyIdA: string, strategyIdB: string): Promise<StrategyComparison[]> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    const records = await db.select().from(strategyComparison)
      .where(or(
        and(eq(strategyComparison.strategyIdA, strategyIdA), eq(strategyComparison.strategyIdB, strategyIdB)),
        and(eq(strategyComparison.strategyIdA, strategyIdB), eq(strategyComparison.strategyIdB, strategyIdA))
      ));

    return records.map(r => ({
      ...r,
      timestamp: r.timestamp.toISOString()
    }));
  }

  async getReports(strategyId?: string): Promise<StrategyReport[]> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    let query = db.select().from(strategyReports);
    if (strategyId) {
      // @ts-ignore
      query = query.where(eq(strategyReports.strategyId, strategyId));
    }
    const records = await query.orderBy(desc(strategyReports.createdTime));
    return records.map(r => ({
      ...r,
      createdTime: r.createdTime.toISOString()
    }));
  }

  async generateReport(
    strategyId: string | null,
    reportType: string,
    name: string,
    createdBy: string
  ): Promise<StrategyReport> {
    await this.populateMetricsIfEmpty();
    const db = await getDb();

    let content: any = {};
    const uuid = generateId("rep");

    if (strategyId) {
      const summaries = await db.select().from(strategyPerformanceSummary)
        .where(eq(strategyPerformanceSummary.strategyId, strategyId))
        .limit(1);

      const summary = summaries[0];
      const stratList = await db.select().from(strategyRegistry).where(eq(strategyRegistry.id, strategyId)).limit(1);
      const strat = stratList[0];

      content = {
        strategyName: strat?.displayName || strat?.name || strategyId,
        strategyCategory: strat?.category || "Unknown",
        reportType,
        netProfit: summary?.netProfit || 0,
        roi: summary?.roi || 0,
        sharpeRatio: summary?.sharpeRatio || 0,
        winRate: summary?.winRate || 0,
        maxDrawdown: summary?.maxDrawdown || 0,
        profitFactor: summary?.profitFactor || 0,
        avgHoldingTime: summary?.averageHoldingTime || 0,
        stabilityScore: summary?.strategyStability || 0,
        efficiencyScore: summary?.executionEfficiency || 0,
        executiveNotes: `Enterprise report analyzing ${strat?.displayName || strategyId}. Under current market regimes, the strategy exhibits stable behavior with Sharpe of ${(summary?.sharpeRatio || 0).toFixed(2)}.`
      };
    } else {
      const dashboard = await this.getDashboard();
      content = {
        reportType,
        totalStrategies: dashboard.summary.totalStrategies,
        aggregateRoi: dashboard.summary.aggregateRoi,
        aggregatePnl: dashboard.summary.aggregatePnl,
        averageSharpe: dashboard.summary.averageSharpe,
        executiveNotes: "Aggregate portfolio analytics indicate consistent returns across alpha/beta portfolios with a diversified options neutral exposure."
      };
    }

    const record = {
      id: uuid,
      strategyId,
      reportType,
      name,
      content,
      createdBy,
      createdTime: new Date()
    };

    await db.insert(strategyReports).values(record);

    return {
      ...record,
      createdTime: record.createdTime.toISOString()
    };
  }
}
