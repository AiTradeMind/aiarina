import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  indicatorDefinitionsTable, 
  indicatorValuesTable, 
  indicatorCacheTable, 
  indicatorHistoryTable, 
  signalEventsTable, 
  signalHistoryTable, 
  signalMetadataTable 
} from "../../../db/schema.ts";
import { 
  IndicatorDefinition, 
  IndicatorValue, 
  IndicatorCache, 
  IndicatorHistory, 
  SignalEvent, 
  SignalHistory, 
  SignalMetadata 
} from "../types/index.ts";

export async function ensureIndicatorTables(): Promise<void> {
  const db = getDb();
  console.log("[EP-04] Initializing Technical Indicator & Signal Engine tables (Self-Healing)...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS indicator_definitions (
        id SERIAL PRIMARY KEY,
        indicator_id VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        parameters JSONB DEFAULT '{}'::jsonb NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS indicator_values (
        id SERIAL PRIMARY KEY,
        indicator_id VARCHAR(100) NOT NULL,
        symbol VARCHAR(100) NOT NULL,
        timeframe VARCHAR(20) NOT NULL,
        value DOUBLE PRECISION NOT NULL,
        extra_data JSONB DEFAULT '{}'::jsonb,
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS indicator_cache (
        id SERIAL PRIMARY KEY,
        cache_key VARCHAR(255) NOT NULL UNIQUE,
        cache_value JSONB DEFAULT '{}'::jsonb NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS indicator_history (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(100) NOT NULL,
        timeframe VARCHAR(20) NOT NULL,
        indicator_type VARCHAR(50) NOT NULL,
        values JSONB DEFAULT '[]'::jsonb NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS signal_events (
        id SERIAL PRIMARY KEY,
        signal_id VARCHAR(100) NOT NULL UNIQUE,
        symbol VARCHAR(100) NOT NULL,
        timeframe VARCHAR(20) NOT NULL,
        type VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        confidence DOUBLE PRECISION NOT NULL,
        reason VARCHAR(500) NOT NULL,
        indicator_source VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS signal_history (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(100) NOT NULL,
        timeframe VARCHAR(20) NOT NULL,
        action VARCHAR(50) NOT NULL,
        confidence DOUBLE PRECISION NOT NULL,
        reason VARCHAR(500) NOT NULL,
        indicator_source VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS signal_metadata (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value JSONB DEFAULT '{}'::jsonb NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("[EP-04] Technical Indicator & Signal Engine tables initialized successfully.");
  } catch (err) {
    console.error("[EP-04] Failed to initialize indicator/signal tables dynamically, error:", err);
  }
}

export class IndicatorRepository {
  constructor() {
    // Self-healing database initialization
    ensureIndicatorTables().catch(err => {
      console.error("[IndicatorRepository] Async self-healing failed:", err);
    });
  }

  // ==========================================
  // INDICATOR DEFINITIONS
  // ==========================================
  async getDefinitions(): Promise<IndicatorDefinition[]> {
    const db = getDb();
    return await db.select().from(indicatorDefinitionsTable) as IndicatorDefinition[];
  }

  async saveDefinition(def: IndicatorDefinition): Promise<void> {
    const db = getDb();
    const rows = await db.select().from(indicatorDefinitionsTable)
      .where(eq(indicatorDefinitionsTable.indicatorId, def.indicatorId)).limit(1);

    if (rows.length > 0) {
      await db.update(indicatorDefinitionsTable)
        .set({
          name: def.name,
          type: def.type,
          parameters: def.parameters,
          updatedAt: new Date()
        })
        .where(eq(indicatorDefinitionsTable.indicatorId, def.indicatorId));
    } else {
      await db.insert(indicatorDefinitionsTable).values(def as any);
    }
  }

  // ==========================================
  // INDICATOR VALUES
  // ==========================================
  async getLatestValues(symbol: string, timeframe?: string): Promise<IndicatorValue[]> {
    const db = getDb();
    let query = db.select().from(indicatorValuesTable).where(eq(indicatorValuesTable.symbol, symbol));
    if (timeframe) {
      query = db.select().from(indicatorValuesTable).where(
        and(
          eq(indicatorValuesTable.symbol, symbol),
          eq(indicatorValuesTable.timeframe, timeframe)
        )
      ) as any;
    }
    const rows = await query;
    return rows.map(r => ({
      ...r,
      timestamp: new Date(r.timestamp),
      createdAt: new Date(r.createdAt)
    })) as IndicatorValue[];
  }

  async saveValue(val: IndicatorValue): Promise<void> {
    const db = getDb();
    await db.insert(indicatorValuesTable).values({
      ...val,
      timestamp: new Date(val.timestamp)
    } as any);
  }

  // ==========================================
  // INDICATOR CACHE
  // ==========================================
  async getCache(key: string): Promise<any | null> {
    const db = getDb();
    const rows = await db.select().from(indicatorCacheTable)
      .where(eq(indicatorCacheTable.cacheKey, key)).limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];

    // Check TTL
    if (new Date(r.expiresAt) < new Date()) {
      await db.delete(indicatorCacheTable).where(eq(indicatorCacheTable.cacheKey, key));
      return null;
    }
    return r.cacheValue;
  }

  async setCache(key: string, value: any, ttlSeconds: number): Promise<void> {
    const db = getDb();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // Evict old cache
    await db.delete(indicatorCacheTable).where(eq(indicatorCacheTable.cacheKey, key));

    await db.insert(indicatorCacheTable).values({
      cacheKey: key,
      cacheValue: value,
      expiresAt
    } as any);
  }

  // ==========================================
  // INDICATOR HISTORY
  // ==========================================
  async getHistory(symbol: string, timeframe: string, indicatorType: string): Promise<IndicatorHistory | null> {
    const db = getDb();
    const rows = await db.select().from(indicatorHistoryTable).where(
      and(
        eq(indicatorHistoryTable.symbol, symbol),
        eq(indicatorHistoryTable.timeframe, timeframe),
        eq(indicatorHistoryTable.indicatorType, indicatorType)
      )
    ).limit(1);

    if (rows.length === 0) return null;
    return rows[0] as IndicatorHistory;
  }

  async saveHistory(hist: IndicatorHistory): Promise<void> {
    const db = getDb();
    const rows = await db.select().from(indicatorHistoryTable).where(
      and(
        eq(indicatorHistoryTable.symbol, hist.symbol),
        eq(indicatorHistoryTable.timeframe, hist.timeframe),
        eq(indicatorHistoryTable.indicatorType, hist.indicatorType)
      )
    ).limit(1);

    if (rows.length > 0) {
      await db.update(indicatorHistoryTable)
        .set({
          values: hist.values,
          updatedAt: new Date()
        })
        .where(eq(indicatorHistoryTable.id, rows[0].id));
    } else {
      await db.insert(indicatorHistoryTable).values(hist as any);
    }
  }

  // ==========================================
  // SIGNAL EVENTS & HISTORY
  // ==========================================
  async getSignals(symbol?: string, timeframe?: string): Promise<SignalEvent[]> {
    const db = getDb();
    let conditions = [];
    if (symbol) conditions.push(eq(signalEventsTable.symbol, symbol));
    if (timeframe) conditions.push(eq(signalEventsTable.timeframe, timeframe));

    const query = conditions.length > 0 
      ? db.select().from(signalEventsTable).where(and(...conditions))
      : db.select().from(signalEventsTable);

    const rows = await query;
    return rows.map(r => ({
      ...r,
      timestamp: new Date(r.timestamp)
    })) as SignalEvent[];
  }

  async saveSignal(sig: SignalEvent): Promise<void> {
    const db = getDb();
    // Save to active signals
    await db.insert(signalEventsTable).values({
      ...sig,
      timestamp: new Date(sig.timestamp)
    } as any);

    // Append to signal history
    await db.insert(signalHistoryTable).values({
      symbol: sig.symbol,
      timeframe: sig.timeframe,
      action: sig.action,
      confidence: sig.confidence,
      reason: sig.reason,
      indicatorSource: sig.indicatorSource,
      timestamp: new Date(sig.timestamp)
    } as any);
  }

  async getSignalHistory(symbol?: string): Promise<SignalHistory[]> {
    const db = getDb();
    let query = db.select().from(signalHistoryTable);
    if (symbol) {
      query = db.select().from(signalHistoryTable).where(eq(signalHistoryTable.symbol, symbol)) as any;
    }
    const rows = await query;
    return rows.map(r => ({
      ...r,
      timestamp: new Date(r.timestamp)
    })) as SignalHistory[];
  }

  // ==========================================
  // SIGNAL METADATA
  // ==========================================
  async getMetadata(key: string): Promise<SignalMetadata | null> {
    const db = getDb();
    const rows = await db.select().from(signalMetadataTable)
      .where(eq(signalMetadataTable.key, key)).limit(1);

    if (rows.length === 0) return null;
    return rows[0] as SignalMetadata;
  }

  async saveMetadata(key: string, value: any): Promise<void> {
    const db = getDb();
    const rows = await db.select().from(signalMetadataTable)
      .where(eq(signalMetadataTable.key, key)).limit(1);

    if (rows.length > 0) {
      await db.update(signalMetadataTable)
        .set({ value, updatedAt: new Date() })
        .where(eq(signalMetadataTable.key, key));
    } else {
      await db.insert(signalMetadataTable).values({ key, value });
    }
  }
}

export const indicatorRepo = new IndicatorRepository();
