import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  analyticsSnapshots, 
  analyticsMetrics, 
  analyticsPerformance, 
  analyticsDashboards, 
  analyticsReports,
  marketStatisticsTable,
  trendStatisticsTable,
  volumeStatisticsTable,
  volatilityStatisticsTable,
  correlationMatrixTable,
  marketHealthTable,
  analyticsHistoryTable,
  organizations
} from "../../../db/schema.ts";
import { 
  AnalyticsSnapshot, 
  AnalyticsMetric, 
  AnalyticsPerformance, 
  AnalyticsDashboard, 
  AnalyticsReport,
  MarketStatistics,
  TrendStatistics,
  VolumeStatistics,
  VolatilityStatistics,
  CorrelationMatrix,
  MarketHealth,
  AnalyticsHistoryEntry
} from "../types/index.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";

export async function ensureAnalyticsTables(): Promise<void> {
  const db = getDb();
  console.log("[EP-06] Initializing Market Analytics Engine tables (Self-Healing)...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS market_statistics (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50),
        symbol VARCHAR(50) NOT NULL,
        average_price DOUBLE PRECISION NOT NULL,
        median_price DOUBLE PRECISION NOT NULL,
        vwap DOUBLE PRECISION NOT NULL,
        price_distribution JSONB NOT NULL,
        std_dev DOUBLE PRECISION NOT NULL,
        variance DOUBLE PRECISION NOT NULL,
        range_analysis JSONB NOT NULL,
        market_breadth JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trend_statistics (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50),
        symbol VARCHAR(50) NOT NULL,
        trend_strength DOUBLE PRECISION NOT NULL,
        trend_duration INTEGER NOT NULL,
        trend_stability DOUBLE PRECISION NOT NULL,
        reversal_detected BOOLEAN DEFAULT FALSE NOT NULL,
        trend_persistence DOUBLE PRECISION NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS volume_statistics (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50),
        symbol VARCHAR(50) NOT NULL,
        average_volume DOUBLE PRECISION NOT NULL,
        relative_volume DOUBLE PRECISION NOT NULL,
        volume_profile JSONB NOT NULL,
        liquidity_score DOUBLE PRECISION NOT NULL,
        participation_score DOUBLE PRECISION NOT NULL,
        volume_distribution JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS volatility_statistics (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50),
        symbol VARCHAR(50) NOT NULL,
        atr DOUBLE PRECISION NOT NULL,
        realized_volatility DOUBLE PRECISION NOT NULL,
        historical_volatility DOUBLE PRECISION NOT NULL,
        volatility_rank DOUBLE PRECISION NOT NULL,
        volatility_percentile DOUBLE PRECISION NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS correlation_matrix (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50),
        symbols JSONB NOT NULL,
        matrix JSONB NOT NULL,
        sector_correlation JSONB NOT NULL,
        index_correlation JSONB NOT NULL,
        rolling_correlation JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_health (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50),
        breadth_score DOUBLE PRECISION NOT NULL,
        liquidity_index DOUBLE PRECISION NOT NULL,
        momentum_index DOUBLE PRECISION NOT NULL,
        volatility_index DOUBLE PRECISION NOT NULL,
        participation_index DOUBLE PRECISION NOT NULL,
        composite_score DOUBLE PRECISION NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS analytics_history (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50),
        symbol VARCHAR(50),
        metric_name VARCHAR(100) NOT NULL,
        metric_value DOUBLE PRECISION NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("[EP-06] Market Analytics Engine tables verified successfully.");
  } catch (error) {
    console.error("[EP-06] Failed to initialize self-healing tables:", error);
  }
}

export class AnalyticsRepository {
  async getDashboard(organizationId: string): Promise<AnalyticsDashboard | null> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID: Repository rejection before building SQL");
    }
    const db = getDb();
    const result = await db.select().from(analyticsDashboards)
      .where(and(eq(analyticsDashboards.organizationId, organizationId), eq(analyticsDashboards.isDefault, true)))
      .limit(1);
    
    if (!result[0]) return null;
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
    };
  }

  async getPerformance(organizationId: string): Promise<AnalyticsPerformance[]> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID: Repository rejection before building SQL");
    }
    const db = getDb();
    const result = await db.select().from(analyticsPerformance)
      .where(eq(analyticsPerformance.organizationId, organizationId));
    
    return result.map(r => ({
      ...r,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async getMetrics(organizationId: string): Promise<AnalyticsMetric[]> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID: Repository rejection before building SQL");
    }
    const db = getDb();
    const result = await db.select().from(analyticsMetrics)
      .where(eq(analyticsMetrics.organizationId, organizationId))
      .orderBy(desc(analyticsMetrics.timestamp))
      .limit(50);
    
    return result.map(r => ({
      ...r,
      timestamp: r.timestamp.toISOString(),
    }));
  }

  async createSnapshot(data: any): Promise<void> {
    if (!data || !data.organizationId || isInvalidOrg(data.organizationId)) {
      throw new Error("Invalid organization ID: Repository rejection before building SQL");
    }
    const db = getDb();
    await db.insert(analyticsSnapshots).values(data);
  }

  async createMetric(data: any): Promise<void> {
    if (!data || !data.organizationId || isInvalidOrg(data.organizationId)) {
      throw new Error("Invalid organization ID: Repository rejection before building SQL");
    }
    const db = getDb();
    await db.insert(analyticsMetrics).values(data);
  }

  // --- EP-06 Core Analytics persistence operations ---

  async saveMarketStatistics(data: MarketStatistics): Promise<void> {
    if (!data.organizationId || isInvalidOrg(data.organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    // Simple logic: delete existing stats for this symbol & org to avoid duplicates, then insert
    await db.delete(marketStatisticsTable)
      .where(and(
        eq(marketStatisticsTable.organizationId, data.organizationId),
        eq(marketStatisticsTable.symbol, data.symbol)
      ));
    
    await db.insert(marketStatisticsTable).values({
      organizationId: data.organizationId,
      symbol: data.symbol,
      averagePrice: data.averagePrice,
      medianPrice: data.medianPrice,
      vwap: data.vwap,
      priceDistribution: data.priceDistribution,
      stdDev: data.stdDev,
      variance: data.variance,
      rangeAnalysis: data.rangeAnalysis,
      marketBreadth: data.marketBreadth,
      updatedAt: new Date()
    });
  }

  async getMarketStatistics(symbol: string, organizationId: string): Promise<MarketStatistics | null> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(marketStatisticsTable)
      .where(and(
        eq(marketStatisticsTable.organizationId, organizationId),
        eq(marketStatisticsTable.symbol, symbol)
      ))
      .limit(1);

    if (!result[0]) return null;
    return {
      ...result[0],
      priceDistribution: result[0].priceDistribution as any,
      rangeAnalysis: result[0].rangeAnalysis as any,
      marketBreadth: result[0].marketBreadth as any,
      updatedAt: result[0].updatedAt.toISOString()
    };
  }

  async getAllMarketStatistics(organizationId: string): Promise<MarketStatistics[]> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(marketStatisticsTable)
      .where(eq(marketStatisticsTable.organizationId, organizationId));

    return result.map(r => ({
      ...r,
      priceDistribution: r.priceDistribution as any,
      rangeAnalysis: r.rangeAnalysis as any,
      marketBreadth: r.marketBreadth as any,
      updatedAt: r.updatedAt.toISOString()
    }));
  }

  async saveTrendStatistics(data: TrendStatistics): Promise<void> {
    if (!data.organizationId || isInvalidOrg(data.organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    await db.delete(trendStatisticsTable)
      .where(and(
        eq(trendStatisticsTable.organizationId, data.organizationId),
        eq(trendStatisticsTable.symbol, data.symbol)
      ));
    
    await db.insert(trendStatisticsTable).values({
      organizationId: data.organizationId,
      symbol: data.symbol,
      trendStrength: data.trendStrength,
      trendDuration: data.trendDuration,
      trendStability: data.trendStability,
      reversalDetected: data.reversalDetected,
      trendPersistence: data.trendPersistence,
      updatedAt: new Date()
    });
  }

  async getTrendStatistics(symbol: string, organizationId: string): Promise<TrendStatistics | null> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(trendStatisticsTable)
      .where(and(
        eq(trendStatisticsTable.organizationId, organizationId),
        eq(trendStatisticsTable.symbol, symbol)
      ))
      .limit(1);

    if (!result[0]) return null;
    return {
      ...result[0],
      updatedAt: result[0].updatedAt.toISOString()
    };
  }

  async getAllTrendStatistics(organizationId: string): Promise<TrendStatistics[]> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(trendStatisticsTable)
      .where(eq(trendStatisticsTable.organizationId, organizationId));

    return result.map(r => ({
      ...r,
      updatedAt: r.updatedAt.toISOString()
    }));
  }

  async saveVolumeStatistics(data: VolumeStatistics): Promise<void> {
    if (!data.organizationId || isInvalidOrg(data.organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    await db.delete(volumeStatisticsTable)
      .where(and(
        eq(volumeStatisticsTable.organizationId, data.organizationId),
        eq(volumeStatisticsTable.symbol, data.symbol)
      ));
    
    await db.insert(volumeStatisticsTable).values({
      organizationId: data.organizationId,
      symbol: data.symbol,
      averageVolume: data.averageVolume,
      relativeVolume: data.relativeVolume,
      volumeProfile: data.volumeProfile,
      liquidityScore: data.liquidityScore,
      participationScore: data.participationScore,
      volumeDistribution: data.volumeDistribution,
      updatedAt: new Date()
    });
  }

  async getVolumeStatistics(symbol: string, organizationId: string): Promise<VolumeStatistics | null> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(volumeStatisticsTable)
      .where(and(
        eq(volumeStatisticsTable.organizationId, organizationId),
        eq(volumeStatisticsTable.symbol, symbol)
      ))
      .limit(1);

    if (!result[0]) return null;
    return {
      ...result[0],
      volumeProfile: result[0].volumeProfile as any,
      volumeDistribution: result[0].volumeDistribution as any,
      updatedAt: result[0].updatedAt.toISOString()
    };
  }

  async getAllVolumeStatistics(organizationId: string): Promise<VolumeStatistics[]> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(volumeStatisticsTable)
      .where(eq(volumeStatisticsTable.organizationId, organizationId));

    return result.map(r => ({
      ...r,
      volumeProfile: r.volumeProfile as any,
      volumeDistribution: r.volumeDistribution as any,
      updatedAt: r.updatedAt.toISOString()
    }));
  }

  async saveVolatilityStatistics(data: VolatilityStatistics): Promise<void> {
    if (!data.organizationId || isInvalidOrg(data.organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    await db.delete(volatilityStatisticsTable)
      .where(and(
        eq(volatilityStatisticsTable.organizationId, data.organizationId),
        eq(volatilityStatisticsTable.symbol, data.symbol)
      ));
    
    await db.insert(volatilityStatisticsTable).values({
      organizationId: data.organizationId,
      symbol: data.symbol,
      atr: data.atr,
      realizedVolatility: data.realizedVolatility,
      historicalVolatility: data.historicalVolatility,
      volatilityRank: data.volatilityRank,
      volatilityPercentile: data.volatilityPercentile,
      updatedAt: new Date()
    });
  }

  async getVolatilityStatistics(symbol: string, organizationId: string): Promise<VolatilityStatistics | null> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(volatilityStatisticsTable)
      .where(and(
        eq(volatilityStatisticsTable.organizationId, organizationId),
        eq(volatilityStatisticsTable.symbol, symbol)
      ))
      .limit(1);

    if (!result[0]) return null;
    return {
      ...result[0],
      updatedAt: result[0].updatedAt.toISOString()
    };
  }

  async getAllVolatilityStatistics(organizationId: string): Promise<VolatilityStatistics[]> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(volatilityStatisticsTable)
      .where(eq(volatilityStatisticsTable.organizationId, organizationId));

    return result.map(r => ({
      ...r,
      updatedAt: r.updatedAt.toISOString()
    }));
  }

  async saveCorrelationMatrix(data: CorrelationMatrix): Promise<void> {
    if (!data.organizationId || isInvalidOrg(data.organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    await db.delete(correlationMatrixTable)
      .where(eq(correlationMatrixTable.organizationId, data.organizationId));
    
    await db.insert(correlationMatrixTable).values({
      organizationId: data.organizationId,
      symbols: data.symbols,
      matrix: data.matrix,
      sectorCorrelation: data.sectorCorrelation,
      indexCorrelation: data.indexCorrelation,
      rollingCorrelation: data.rollingCorrelation,
      updatedAt: new Date()
    });
  }

  async getCorrelationMatrix(organizationId: string): Promise<CorrelationMatrix | null> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(correlationMatrixTable)
      .where(eq(correlationMatrixTable.organizationId, organizationId))
      .orderBy(desc(correlationMatrixTable.updatedAt))
      .limit(1);

    if (!result[0]) return null;
    return {
      ...result[0],
      symbols: result[0].symbols as any,
      matrix: result[0].matrix as any,
      sectorCorrelation: result[0].sectorCorrelation as any,
      indexCorrelation: result[0].indexCorrelation as any,
      rollingCorrelation: result[0].rollingCorrelation as any,
      updatedAt: result[0].updatedAt.toISOString()
    };
  }

  async saveMarketHealth(data: MarketHealth): Promise<void> {
    if (!data.organizationId || isInvalidOrg(data.organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    await db.delete(marketHealthTable)
      .where(eq(marketHealthTable.organizationId, data.organizationId));
    
    await db.insert(marketHealthTable).values({
      organizationId: data.organizationId,
      breadthScore: data.breadthScore,
      liquidityIndex: data.liquidityIndex,
      momentumIndex: data.momentumIndex,
      volatilityIndex: data.volatilityIndex,
      participationIndex: data.participationIndex,
      compositeScore: data.compositeScore,
      updatedAt: new Date()
    });
  }

  async getMarketHealth(organizationId: string): Promise<MarketHealth | null> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(marketHealthTable)
      .where(eq(marketHealthTable.organizationId, organizationId))
      .orderBy(desc(marketHealthTable.updatedAt))
      .limit(1);

    if (!result[0]) return null;
    return {
      ...result[0],
      updatedAt: result[0].updatedAt.toISOString()
    };
  }

  async saveHistoryEntry(data: AnalyticsHistoryEntry): Promise<void> {
    if (!data.organizationId || isInvalidOrg(data.organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    await db.insert(analyticsHistoryTable).values({
      organizationId: data.organizationId,
      symbol: data.symbol,
      metricName: data.metricName,
      metricValue: data.metricValue,
      timestamp: new Date()
    });
  }

  async getHistoryEntries(organizationId: string, metricName?: string, symbol?: string): Promise<AnalyticsHistoryEntry[]> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    let conditions = [eq(analyticsHistoryTable.organizationId, organizationId)];
    
    if (metricName) {
      conditions.push(eq(analyticsHistoryTable.metricName, metricName));
    }
    if (symbol) {
      conditions.push(eq(analyticsHistoryTable.symbol, symbol));
    }

    const result = await db.select().from(analyticsHistoryTable)
      .where(and(...conditions))
      .orderBy(desc(analyticsHistoryTable.timestamp))
      .limit(100);

    return result.map(r => ({
      ...r,
      timestamp: r.timestamp.toISOString()
    }));
  }

  async getReports(organizationId: string): Promise<AnalyticsReport[]> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    const result = await db.select().from(analyticsReports)
      .where(eq(analyticsReports.organizationId, organizationId))
      .orderBy(desc(analyticsReports.createdAt))
      .limit(20);

    return result.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString()
    }));
  }

  async saveReport(organizationId: string, report: Omit<AnalyticsReport, "id" | "createdAt">): Promise<void> {
    if (!organizationId || isInvalidOrg(organizationId)) {
      throw new Error("Invalid organization ID");
    }
    const db = getDb();
    await db.insert(analyticsReports).values({
      organizationId,
      userId: report.userId,
      title: report.title,
      config: report.config,
      status: report.status,
      fileUrl: report.fileUrl,
      createdAt: new Date()
    });
  }
}

export const analyticsRepo = new AnalyticsRepository();
