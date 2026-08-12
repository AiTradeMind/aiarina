import { eq, like, and, or, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  exchanges, 
  instrumentTypes, 
  instruments, 
  marketStatus,
  exchangeRegistryTable,
  marketConnectivityTable,
  instrumentMasterTable,
  symbolMasterTable,
  isinMasterTable,
  derivativeMasterTable,
  expiryMasterTable,
  lotSizeMasterTable,
  tickSizeMasterTable,
  sectorMasterTable,
  marketFeedTable,
  marketCacheTable,
  marketMetadataTable,
  marketEventsTable,
  marketVersionsTable,
  instrumentLifecycleHistoryTable,
  masterDataProposalsTable,
  marketLineageTable,
  marketAuditChainTable,
  feedQualityMetricsTable,
  connectivityCertificatesTable,
  marketRecoveryJobsTable,
  marketDependencyRegistryTable
} from "../../../db/schema.ts";
import { 
  Exchange, 
  InstrumentType, 
  Instrument, 
  MarketStatus, 
  InstrumentSearchFilters,
  MarketStatusType,
  ExchangeRegistry,
  MarketConnectivity,
  InstrumentMaster,
  SymbolMaster,
  IsinMaster,
  DerivativeMaster,
  ExpiryMaster,
  LotSizeMaster,
  TickSizeMaster,
  SectorMaster,
  MarketFeed,
  MarketCache,
  MarketMetadata,
  MarketEvent
} from "../types/index.ts";

// ====================================================
// STARTUP SCHEMA SYNC & SEEDING (MODULE 20)
// ====================================================

export async function ensureMarketTablesAndMasterData(): Promise<void> {
  const db = getDb();
  console.log("[EP04] Initializing Market Master Data tables...");

  try {
    // 1. Create Tables if missing
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exchange_registry (
        id VARCHAR(100) PRIMARY KEY,
        exchange_id VARCHAR(100) NOT NULL UNIQUE,
        exchange_code VARCHAR(50) NOT NULL,
        exchange_name VARCHAR(100) NOT NULL,
        timezone VARCHAR(50) DEFAULT 'Asia/Kolkata' NOT NULL,
        country VARCHAR(50) DEFAULT 'India' NOT NULL,
        currency VARCHAR(20) DEFAULT 'INR' NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
        version VARCHAR(50) DEFAULT '1.0.0' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_connectivity (
        id VARCHAR(100) PRIMARY KEY,
        exchange_id VARCHAR(100) NOT NULL UNIQUE,
        primary_feed_url VARCHAR(255) NOT NULL,
        secondary_feed_url VARCHAR(255) NOT NULL,
        health_status VARCHAR(50) DEFAULT 'HEALTHY' NOT NULL,
        feed_status VARCHAR(50) DEFAULT 'CONNECTED' NOT NULL,
        reconnect_count INTEGER DEFAULT 0 NOT NULL,
        failover_active BOOLEAN DEFAULT FALSE NOT NULL,
        last_heartbeat_at TIMESTAMP DEFAULT NOW() NOT NULL,
        latency_ms INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS instrument_master (
        id VARCHAR(100) PRIMARY KEY,
        instrument_id VARCHAR(100) NOT NULL UNIQUE,
        instrument_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
        exchange_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS symbol_master (
        id VARCHAR(100) PRIMARY KEY,
        instrument_id VARCHAR(100) NOT NULL,
        trading_symbol VARCHAR(100) NOT NULL,
        display_symbol VARCHAR(100) NOT NULL,
        exchange_symbol VARCHAR(100) NOT NULL,
        broker_symbol VARCHAR(100) NOT NULL,
        internal_symbol VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS isin_master (
        id VARCHAR(100) PRIMARY KEY,
        isin VARCHAR(50) NOT NULL UNIQUE,
        security_name VARCHAR(255) NOT NULL,
        exchange_mapping VARCHAR(100) NOT NULL,
        listing_status VARCHAR(50) DEFAULT 'LISTED' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS derivative_master (
        id VARCHAR(100) PRIMARY KEY,
        instrument_id VARCHAR(100) NOT NULL,
        underlying VARCHAR(100) NOT NULL,
        option_type VARCHAR(50),
        future_type VARCHAR(50),
        strike NUMERIC(20, 4),
        expiry TIMESTAMP,
        contract VARCHAR(100),
        series VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS expiry_master (
        id VARCHAR(100) PRIMARY KEY,
        expiry_date TIMESTAMP NOT NULL,
        expiry_type VARCHAR(50) NOT NULL,
        is_weekly BOOLEAN DEFAULT FALSE NOT NULL,
        is_monthly BOOLEAN DEFAULT FALSE NOT NULL,
        is_quarterly BOOLEAN DEFAULT FALSE NOT NULL,
        is_commodity BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lot_size_master (
        id VARCHAR(100) PRIMARY KEY,
        instrument_id VARCHAR(100) NOT NULL,
        lot_size INTEGER DEFAULT 1 NOT NULL,
        freeze_quantity INTEGER DEFAULT 0 NOT NULL,
        maximum_quantity INTEGER DEFAULT 0 NOT NULL,
        minimum_quantity INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tick_size_master (
        id VARCHAR(100) PRIMARY KEY,
        instrument_id VARCHAR(100) NOT NULL,
        tick_size NUMERIC(10, 4) DEFAULT 0.05 NOT NULL,
        price_precision INTEGER DEFAULT 2 NOT NULL,
        quantity_precision INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sector_master (
        id VARCHAR(100) PRIMARY KEY,
        instrument_id VARCHAR(100) NOT NULL,
        sector VARCHAR(100) NOT NULL,
        industry VARCHAR(100) NOT NULL,
        sub_industry VARCHAR(100) NOT NULL,
        market_cap_category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_feed (
        id VARCHAR(100) PRIMARY KEY,
        feed_status VARCHAR(50) DEFAULT 'CONNECTED' NOT NULL,
        feed_health VARCHAR(50) DEFAULT 'HEALTHY' NOT NULL,
        feed_version VARCHAR(50) DEFAULT '1.0.0' NOT NULL,
        feed_source VARCHAR(100) DEFAULT 'DIRECT' NOT NULL,
        feed_quality VARCHAR(50) DEFAULT 'HIGH' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_cache (
        id VARCHAR(100) PRIMARY KEY,
        cache_key VARCHAR(255) NOT NULL UNIQUE,
        cache_value JSONB NOT NULL DEFAULT '{}',
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_metadata (
        id VARCHAR(100) PRIMARY KEY,
        created_by VARCHAR(100) DEFAULT 'SYSTEM' NOT NULL,
        updated_by VARCHAR(100) DEFAULT 'SYSTEM' NOT NULL,
        source VARCHAR(100) DEFAULT 'NSE_FEED' NOT NULL,
        version VARCHAR(50) DEFAULT '1.0.0' NOT NULL,
        checksum VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_events (
        id VARCHAR(100) PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        exchange_id VARCHAR(100),
        payload JSONB DEFAULT '{}'::jsonb NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_versions (
        id VARCHAR(100) PRIMARY KEY,
        master_version VARCHAR(50) NOT NULL,
        schema_version VARCHAR(50) NOT NULL,
        data_version VARCHAR(50) NOT NULL,
        exchange_version VARCHAR(50) NOT NULL,
        feed_version VARCHAR(50) NOT NULL,
        rollback_payload TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_by VARCHAR(100) NOT NULL,
        checksum VARCHAR(255) NOT NULL,
        version_audit TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS instrument_lifecycle_history (
        id VARCHAR(100) PRIMARY KEY,
        instrument_id VARCHAR(100) NOT NULL,
        old_state VARCHAR(50) NOT NULL,
        new_state VARCHAR(50) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        operator VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS master_data_proposals (
        id VARCHAR(100) PRIMARY KEY,
        status VARCHAR(50) NOT NULL,
        payload TEXT NOT NULL,
        errors TEXT,
        operator VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        validated_at TIMESTAMP,
        approved_at TIMESTAMP,
        synchronized_at TIMESTAMP,
        correlation_id VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_lineage (
        id VARCHAR(100) PRIMARY KEY,
        correlation_id VARCHAR(100) NOT NULL,
        source VARCHAR(100) NOT NULL,
        import_operator VARCHAR(100) NOT NULL,
        import_at TIMESTAMP NOT NULL,
        validation_status VARCHAR(50) NOT NULL,
        validation_at TIMESTAMP NOT NULL,
        approval_operator VARCHAR(100),
        approval_at TIMESTAMP,
        publication_at TIMESTAMP,
        consumers TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_audit_chain (
        id VARCHAR(100) PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        payload_hash VARCHAR(128) NOT NULL,
        previous_hash VARCHAR(128) NOT NULL,
        current_hash VARCHAR(128) NOT NULL,
        operator VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS feed_quality_metrics (
        id VARCHAR(100) PRIMARY KEY,
        exchange_id VARCHAR(100) NOT NULL,
        latency_ms INTEGER NOT NULL,
        packet_loss NUMERIC(5,2) NOT NULL,
        duplicate_ticks INTEGER NOT NULL,
        missing_ticks INTEGER NOT NULL,
        feed_delay_ms INTEGER NOT NULL,
        feed_confidence NUMERIC(5,2) NOT NULL,
        quality_score NUMERIC(5,2) NOT NULL,
        health_state VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS connectivity_certificates (
        id VARCHAR(100) PRIMARY KEY,
        certificate_type VARCHAR(50) NOT NULL,
        exchange_id VARCHAR(100),
        feed_url VARCHAR(255),
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
        sha256_hash VARCHAR(128) NOT NULL,
        digital_signature VARCHAR(256) NOT NULL,
        verification_status VARCHAR(50) DEFAULT 'VERIFIED' NOT NULL
      );

      CREATE TABLE IF NOT EXISTS market_recovery_jobs (
        id VARCHAR(100) PRIMARY KEY,
        failure_type VARCHAR(100) NOT NULL,
        recovery_action VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        audit_trail TEXT NOT NULL,
        certificate_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        completed_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS market_dependency_registry (
        id VARCHAR(100) PRIMARY KEY,
        consumer_workspace VARCHAR(100) NOT NULL UNIQUE,
        registered_at TIMESTAMP DEFAULT NOW() NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL
      );
    `);

    // 2. Seed initial core data if empty
    const registryCheck = await db.select().from(exchangeRegistryTable).limit(1);
    if (registryCheck.length === 0) {
      console.log("[EP04] Database contains empty registries. Executing premium seed process...");

      // Seeds Exchanges
      await db.insert(exchangeRegistryTable).values([
        { id: "reg-nse", exchangeId: "NSE", exchangeCode: "NSE", exchangeName: "National Stock Exchange", timezone: "Asia/Kolkata", country: "India", currency: "INR", status: "ACTIVE", version: "2.1.0" },
        { id: "reg-bse", exchangeId: "BSE", exchangeCode: "BSE", exchangeName: "Bombay Stock Exchange", timezone: "Asia/Kolkata", country: "India", currency: "INR", status: "ACTIVE", version: "2.1.0" },
        { id: "reg-comm", exchangeId: "COMMODITY", exchangeCode: "COMMODITY", exchangeName: "Commodity Asset Class", timezone: "Asia/Kolkata", country: "India", currency: "INR", status: "ACTIVE", version: "1.5.0" }
      ] as any);

      // Seeds Connectivity
      await db.insert(marketConnectivityTable).values([
        { id: "conn-nse", exchangeId: "NSE", primaryFeedUrl: "wss://feed.nseindia.com/live", secondaryFeedUrl: "wss://feed-backup.nseindia.com/live", healthStatus: "HEALTHY", feedStatus: "CONNECTED", reconnectCount: 0, failoverActive: false, latencyMs: 2 },
        { id: "conn-bse", exchangeId: "BSE", primaryFeedUrl: "wss://feed.bseindia.com/live", secondaryFeedUrl: "wss://feed-backup.bseindia.com/live", healthStatus: "HEALTHY", feedStatus: "CONNECTED", reconnectCount: 0, failoverActive: false, latencyMs: 3 },
        { id: "conn-comm", exchangeId: "COMMODITY", primaryFeedUrl: "wss://feed.brokeradapter.com/commodity/live", secondaryFeedUrl: "wss://feed-backup.brokeradapter.com/commodity/live", healthStatus: "HEALTHY", feedStatus: "CONNECTED", reconnectCount: 0, failoverActive: false, latencyMs: 4 }
      ] as any);

      // Seeds Core Indian Instruments
      await db.insert(instrumentMasterTable).values([
        { id: "inst-nse-rel", instrumentId: "RELIANCE", instrumentType: "EQUITY", status: "ACTIVE", exchangeId: "NSE" },
        { id: "inst-nse-tcs", instrumentId: "TCS", instrumentType: "EQUITY", status: "ACTIVE", exchangeId: "NSE" },
        { id: "inst-nse-hdfc", instrumentId: "HDFCBANK", instrumentType: "EQUITY", status: "ACTIVE", exchangeId: "NSE" },
        { id: "inst-nse-sbin", instrumentId: "SBIN", instrumentType: "EQUITY", status: "ACTIVE", exchangeId: "NSE" },
        { id: "inst-comm-gold", instrumentId: "GOLD_FUT", instrumentType: "COMMODITY", status: "ACTIVE", exchangeId: "COMMODITY" },
        { id: "inst-nse-nifty-fut", instrumentId: "NIFTY_26JUL_FUT", instrumentType: "INDEX_FUTURES", status: "ACTIVE", exchangeId: "NSE" },
        { id: "inst-nse-nifty-ce", instrumentId: "NIFTY_26JUL_24000_CE", instrumentType: "INDEX_OPTIONS", status: "ACTIVE", exchangeId: "NSE" }
      ] as any);

      // Seeds Symbols mappings
      await db.insert(symbolMasterTable).values([
        { id: "sym-nse-rel", instrumentId: "RELIANCE", tradingSymbol: "RELIANCE", displaySymbol: "Reliance Industries", exchangeSymbol: "RELIANCE", brokerSymbol: "RELIANCE_EQ", internalSymbol: "ARINA:RELIANCE:NSE" },
        { id: "sym-nse-tcs", instrumentId: "TCS", tradingSymbol: "TCS", displaySymbol: "Tata Consultancy", exchangeSymbol: "TCS", brokerSymbol: "TCS_EQ", internalSymbol: "ARINA:TCS:NSE" },
        { id: "sym-comm-gold", instrumentId: "GOLD_FUT", tradingSymbol: "GOLD_FUT", displaySymbol: "Gold Commodity Futures", exchangeSymbol: "GOLD", brokerSymbol: "GOLD_COMM_FUT", internalSymbol: "ARINA:GOLD:COMMODITY" }
      ] as any);

      // Seeds ISIN
      await db.insert(isinMasterTable).values([
        { id: "isin-rel", isin: "INE002A01018", securityName: "Reliance Industries Ltd", exchangeMapping: "NSE,BSE", listingStatus: "LISTED" },
        { id: "isin-tcs", isin: "INE467B01029", securityName: "Tata Consultancy Services Ltd", exchangeMapping: "NSE,BSE", listingStatus: "LISTED" }
      ] as any);

      // Seeds Expiry Master
      await db.insert(expiryMasterTable).values([
        { id: "exp-26jul", expiryDate: new Date("2026-07-26T10:00:00Z"), expiryType: "MONTHLY", isWeekly: false, isMonthly: true, isQuarterly: false, isCommodity: false },
        { id: "exp-weekly", expiryDate: new Date("2026-07-19T10:00:00Z"), expiryType: "WEEKLY", isWeekly: true, isMonthly: false, isQuarterly: false, isCommodity: false }
      ] as any);

      // Seeds Lots
      await db.insert(lotSizeMasterTable).values([
        { id: "lot-rel", instrumentId: "RELIANCE", lotSize: 1, freezeQuantity: 100, maximumQuantity: 500, minimumQuantity: 1 },
        { id: "lot-tcs", instrumentId: "TCS", lotSize: 1, freezeQuantity: 100, maximumQuantity: 500, minimumQuantity: 1 },
        { id: "lot-nifty", instrumentId: "NIFTY_26JUL_FUT", lotSize: 50, freezeQuantity: 500, maximumQuantity: 2500, minimumQuantity: 50 }
      ] as any);

      // Seeds Ticks
      await db.insert(tickSizeMasterTable).values([
        { id: "tick-rel", instrumentId: "RELIANCE", tickSize: "0.05", pricePrecision: 2, quantityPrecision: 0 },
        { id: "tick-tcs", instrumentId: "TCS", tickSize: "0.05", pricePrecision: 2, quantityPrecision: 0 },
        { id: "tick-gold", instrumentId: "GOLD_FUT", tickSize: "1.00", pricePrecision: 0, quantityPrecision: 0 }
      ] as any);

      // Seeds Sectors
      await db.insert(sectorMasterTable).values([
        { id: "sec-rel", instrumentId: "RELIANCE", sector: "Energy", industry: "Oil & Gas", subIndustry: "Refining & Marketing", marketCapCategory: "LARGE" },
        { id: "sec-tcs", instrumentId: "TCS", sector: "Technology", industry: "IT Services", subIndustry: "Consulting", marketCapCategory: "LARGE" }
      ] as any);

      // Seeds Feed Configuration Engine
      await db.insert(marketFeedTable).values([
        { id: "feed-eng-01", feedStatus: "CONNECTED", feedHealth: "HEALTHY", feedVersion: "2.1.0", feedSource: "FIBER_LEASED_LINE", feedQuality: "HIGH" }
      ] as any);

      // Seeds Metadata
      await db.insert(marketMetadataTable).values([
        { id: "meta-init", createdBy: "AI_ARINA_SYSTEM", updatedBy: "AI_ARINA_SYSTEM", source: "EXCHANGE_DIRECT", version: "1.0.0", checksum: "8f93e2b34a984f1a238495a86d2e4fbc87a1d35f29e1c2a0b3f88c7161e1b2f4" }
      ] as any);

      // Seeds Initial Audit Event
      await db.insert(marketEventsTable).values([
        { id: "evt-init", eventType: "FeedStarted", exchangeId: null, payload: { message: "System activated initial market connectivity modules successfully." } }
      ] as any);

      console.log("[EP04] Core seeds placed successfully!");
    }
  } catch (err) {
    console.error("[EP04] Startup seed crashed, error details:", err);
  }
}

// ====================================================
// REPOSITORY LAYER IMPLEMENTATIONS
// ====================================================

export class ExchangeRepository {
  async findAll(): Promise<Exchange[]> {
    const db = getDb();
    const rows = await db.select().from(exchanges);
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      timezone: r.timezone || 'Asia/Kolkata',
      isOpen: r.isOpen || false
    }));
  }
}

export class InstrumentTypeRepository {
  async findAll(): Promise<InstrumentType[]> {
    const db = getDb();
    return await db.select().from(instrumentTypes) as InstrumentType[];
  }
}

export class InstrumentRepository {
  async findById(id: number): Promise<Instrument | null> {
    const db = getDb();
    const res = await db.select().from(instruments).where(eq(instruments.id, id)).limit(1);
    if (!res[0]) return null;
    return {
      ...res[0],
      expiryDate: res[0].expiryDate ? res[0].expiryDate.toISOString() : null,
      createdAt: res[0].createdAt.toISOString()
    };
  }

  async search(filters: InstrumentSearchFilters): Promise<Instrument[]> {
    const db = getDb();
    let query = db.select().from(instruments);
    const conditions = [];

    if (filters.symbol) {
      conditions.push(like(instruments.symbol, `%${filters.symbol}%`));
    }
    if (filters.name) {
      conditions.push(like(instruments.name, `%${filters.name}%`));
    }
    if (filters.exchangeId) {
      conditions.push(eq(instruments.exchangeId, filters.exchangeId));
    }
    if (filters.typeId) {
      conditions.push(eq(instruments.typeId, filters.typeId));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(instruments.isActive, filters.isActive));
    }

    const rows = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    return rows.map(r => ({
      ...r,
      expiryDate: r.expiryDate ? r.expiryDate.toISOString() : null,
      createdAt: r.createdAt.toISOString()
    }));
  }
}

export class MarketStatusRepository {
  async findCurrentByExchange(exchangeId: string): Promise<MarketStatus | null> {
    const db = getDb();
    const res = await db.select().from(marketStatus)
      .where(eq(marketStatus.exchangeId, exchangeId))
      .orderBy(sql`${marketStatus.updatedAt} DESC`)
      .limit(1);

    if (!res[0]) return null;
    return {
      ...res[0],
      status: res[0].status as MarketStatusType,
      updatedAt: res[0].updatedAt.toISOString()
    };
  }

  async getAllCurrentStatus(): Promise<MarketStatus[]> {
    const db = getDb();
    const rows = await db.select().from(marketStatus);
    return rows.map(r => ({
      ...r,
      status: r.status as MarketStatusType,
      updatedAt: r.updatedAt.toISOString()
    }));
  }
}

// ====================================================
// EP04: SPECIFIC DATA REPOSITORY CLASSES
// ====================================================

export class ExchangeRegistryRepository {
  async getAll(): Promise<ExchangeRegistry[]> {
    const db = getDb();
    return await db.select().from(exchangeRegistryTable) as ExchangeRegistry[];
  }

  async findById(exchangeId: string): Promise<ExchangeRegistry | null> {
    const db = getDb();
    const res = await db.select().from(exchangeRegistryTable).where(eq(exchangeRegistryTable.exchangeId, exchangeId)).limit(1);
    return (res[0] as ExchangeRegistry) || null;
  }

  async insert(data: ExchangeRegistry): Promise<void> {
    const db = getDb();
    await db.insert(exchangeRegistryTable).values(data as any);
  }
}

export class MarketConnectivityRepository {
  async getAll(): Promise<MarketConnectivity[]> {
    const db = getDb();
    return await db.select().from(marketConnectivityTable) as MarketConnectivity[];
  }

  async updateFeedStatus(exchangeId: string, feedStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING', healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY', latencyMs: number): Promise<void> {
    const db = getDb();
    await db.update(marketConnectivityTable)
      .set({ feedStatus, healthStatus, latencyMs, lastHeartbeatAt: new Date(), updatedAt: new Date() })
      .where(eq(marketConnectivityTable.exchangeId, exchangeId));
  }

  async incrementReconnect(exchangeId: string): Promise<void> {
    const db = getDb();
    const row = await db.select().from(marketConnectivityTable).where(eq(marketConnectivityTable.exchangeId, exchangeId)).limit(1);
    if (row[0]) {
      await db.update(marketConnectivityTable)
        .set({ reconnectCount: row[0].reconnectCount + 1, updatedAt: new Date() })
        .where(eq(marketConnectivityTable.exchangeId, exchangeId));
    }
  }

  async toggleFailover(exchangeId: string, failoverActive: boolean): Promise<void> {
    const db = getDb();
    await db.update(marketConnectivityTable)
      .set({ failoverActive, updatedAt: new Date() })
      .where(eq(marketConnectivityTable.exchangeId, exchangeId));
  }
}

export class InstrumentMasterRepository {
  async getAll(): Promise<InstrumentMaster[]> {
    const db = getDb();
    return await db.select().from(instrumentMasterTable) as InstrumentMaster[];
  }

  async findById(instrumentId: string): Promise<InstrumentMaster | null> {
    const db = getDb();
    const res = await db.select().from(instrumentMasterTable).where(eq(instrumentMasterTable.instrumentId, instrumentId)).limit(1);
    return (res[0] as InstrumentMaster) || null;
  }

  async insert(data: InstrumentMaster): Promise<void> {
    const db = getDb();
    await db.insert(instrumentMasterTable).values(data as any);
  }

  async setStatus(instrumentId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<void> {
    const db = getDb();
    await db.update(instrumentMasterTable).set({ status, updatedAt: new Date() }).where(eq(instrumentMasterTable.instrumentId, instrumentId));
  }
}

export class SymbolMasterRepository {
  async getAll(): Promise<SymbolMaster[]> {
    const db = getDb();
    return await db.select().from(symbolMasterTable) as SymbolMaster[];
  }

  async findByInstrumentId(instrumentId: string): Promise<SymbolMaster[]> {
    const db = getDb();
    return await db.select().from(symbolMasterTable).where(eq(symbolMasterTable.instrumentId, instrumentId)) as SymbolMaster[];
  }

  async insert(data: SymbolMaster): Promise<void> {
    const db = getDb();
    await db.insert(symbolMasterTable).values(data as any);
  }
}

export class IsinMasterRepository {
  async getAll(): Promise<IsinMaster[]> {
    const db = getDb();
    return await db.select().from(isinMasterTable) as IsinMaster[];
  }

  async findByIsin(isin: string): Promise<IsinMaster | null> {
    const db = getDb();
    const res = await db.select().from(isinMasterTable).where(eq(isinMasterTable.isin, isin)).limit(1);
    return (res[0] as IsinMaster) || null;
  }

  async insert(data: IsinMaster): Promise<void> {
    const db = getDb();
    await db.insert(isinMasterTable).values(data as any);
  }
}

export class DerivativeMasterRepository {
  async getAll(): Promise<DerivativeMaster[]> {
    const db = getDb();
    return await db.select().from(derivativeMasterTable) as DerivativeMaster[];
  }

  async findByInstrumentId(instrumentId: string): Promise<DerivativeMaster[]> {
    const db = getDb();
    return await db.select().from(derivativeMasterTable).where(eq(derivativeMasterTable.instrumentId, instrumentId)) as DerivativeMaster[];
  }

  async insert(data: DerivativeMaster): Promise<void> {
    const db = getDb();
    await db.insert(derivativeMasterTable).values({
      ...data,
      strike: data.strike ? String(data.strike) : null,
      expiry: data.expiry ? new Date(data.expiry) : null
    } as any);
  }
}

export class ExpiryMasterRepository {
  async getAll(): Promise<ExpiryMaster[]> {
    const db = getDb();
    return await db.select().from(expiryMasterTable) as ExpiryMaster[];
  }

  async insert(data: ExpiryMaster): Promise<void> {
    const db = getDb();
    await db.insert(expiryMasterTable).values({
      ...data,
      expiryDate: new Date(data.expiryDate)
    } as any);
  }
}

export class LotSizeMasterRepository {
  async getAll(): Promise<LotSizeMaster[]> {
    const db = getDb();
    return await db.select().from(lotSizeMasterTable) as LotSizeMaster[];
  }

  async findByInstrumentId(instrumentId: string): Promise<LotSizeMaster | null> {
    const db = getDb();
    const res = await db.select().from(lotSizeMasterTable).where(eq(lotSizeMasterTable.instrumentId, instrumentId)).limit(1);
    return (res[0] as LotSizeMaster) || null;
  }

  async insert(data: LotSizeMaster): Promise<void> {
    const db = getDb();
    await db.insert(lotSizeMasterTable).values(data as any);
  }
}

export class TickSizeMasterRepository {
  async getAll(): Promise<TickSizeMaster[]> {
    const db = getDb();
    return await db.select().from(tickSizeMasterTable) as TickSizeMaster[];
  }

  async findByInstrumentId(instrumentId: string): Promise<TickSizeMaster | null> {
    const db = getDb();
    const res = await db.select().from(tickSizeMasterTable).where(eq(tickSizeMasterTable.instrumentId, instrumentId)).limit(1);
    if (!res[0]) return null;
    return res[0] as TickSizeMaster;
  }

  async insert(data: TickSizeMaster): Promise<void> {
    const db = getDb();
    await db.insert(tickSizeMasterTable).values({
      ...data,
      tickSize: String(data.tickSize)
    } as any);
  }
}

export class SectorMasterRepository {
  async getAll(): Promise<SectorMaster[]> {
    const db = getDb();
    return await db.select().from(sectorMasterTable) as SectorMaster[];
  }

  async findByInstrumentId(instrumentId: string): Promise<SectorMaster[]> {
    const db = getDb();
    return await db.select().from(sectorMasterTable).where(eq(sectorMasterTable.instrumentId, instrumentId)) as SectorMaster[];
  }

  async insert(data: SectorMaster): Promise<void> {
    const db = getDb();
    await db.insert(sectorMasterTable).values(data as any);
  }
}

export class MarketFeedRepository {
  async getFeed(): Promise<MarketFeed | null> {
    const db = getDb();
    const res = await db.select().from(marketFeedTable).limit(1);
    return (res[0] as MarketFeed) || null;
  }

  async updateFeedEngine(data: Partial<MarketFeed>): Promise<void> {
    const db = getDb();
    await db.update(marketFeedTable).set({
      ...data,
      updatedAt: new Date()
    } as any);
  }
}

export class MarketCacheRepository {
  async get(key: string): Promise<any | null> {
    const db = getDb();
    const res = await db.select().from(marketCacheTable).where(eq(marketCacheTable.cacheKey, key)).limit(1);
    if (!res[0]) return null;
    
    // Check expiry
    if (res[0].expiresAt && new Date(res[0].expiresAt) < new Date()) {
      await db.delete(marketCacheTable).where(eq(marketCacheTable.cacheKey, key));
      return null;
    }
    return res[0].cacheValue;
  }

  async set(key: string, value: any, ttlSec = 300): Promise<void> {
    const db = getDb();
    const expiresAt = new Date(Date.now() + ttlSec * 1000);
    
    // Delete existing if any
    await db.delete(marketCacheTable).where(eq(marketCacheTable.cacheKey, key));
    
    await db.insert(marketCacheTable).values({
      id: `cache-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      cacheKey: key,
      cacheValue: value,
      expiresAt
    } as any);
  }

  async clear(): Promise<void> {
    const db = getDb();
    await db.delete(marketCacheTable);
  }
}

export class MarketMetadataRepository {
  async get(): Promise<MarketMetadata | null> {
    const db = getDb();
    const res = await db.select().from(marketMetadataTable).limit(1);
    return (res[0] as MarketMetadata) || null;
  }

  async updateChecksum(checksum: string, version: string): Promise<void> {
    const db = getDb();
    await db.update(marketMetadataTable).set({
      checksum,
      version,
      updatedBy: "AI_ARINA_OPERATOR",
      updatedAt: new Date()
    });
  }
}

export class MarketEventsRepository {
  async getHistory(): Promise<MarketEvent[]> {
    const db = getDb();
    const rows = await db.select().from(marketEventsTable).orderBy(sql`${marketEventsTable.createdAt} DESC`).limit(100);
    return rows as MarketEvent[];
  }

  async logEvent(eventType: MarketEvent['eventType'], exchangeId: string | null, payload: any): Promise<void> {
    const db = getDb();
    await db.insert(marketEventsTable).values({
      id: `m-evt-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      eventType,
      exchangeId,
      payload
    });
  }
}

// Relocated Transactional Synchronization
export async function executeMarketMasterSync(payload: {
  registry: ExchangeRegistry[];
  instruments: InstrumentMaster[];
  symbols: SymbolMaster[];
  lotSizes: LotSizeMaster[];
  tickSizes: TickSizeMaster[];
  expirities: ExpiryMaster[];
  sectors: SectorMaster[];
  isins: IsinMaster[];
  derivatives: DerivativeMaster[];
}): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    // Clear old registries (Atomic clean slate)
    await tx.delete(exchangeRegistryTable);
    await tx.delete(marketConnectivityTable);
    await tx.delete(instrumentMasterTable);
    await tx.delete(symbolMasterTable);
    await tx.delete(isinMasterTable);
    await tx.delete(derivativeMasterTable);
    await tx.delete(expiryMasterTable);
    await tx.delete(lotSizeMasterTable);
    await tx.delete(tickSizeMasterTable);
    await tx.delete(sectorMasterTable);

    // Insert new elements as cast objects to avoid schema constraint issues
    if (payload.registry && payload.registry.length > 0) {
      await tx.insert(exchangeRegistryTable).values(payload.registry as any);
      
      const conns = payload.registry.map(r => ({
        id: `conn-sync-${r.exchangeId.toLowerCase()}`,
        exchangeId: r.exchangeId,
        primaryFeedUrl: `wss://feed.${r.exchangeId.toLowerCase()}india.com/live`,
        secondaryFeedUrl: `wss://feed-backup.${r.exchangeId.toLowerCase()}india.com/live`,
        healthStatus: 'HEALTHY',
        feedStatus: 'CONNECTED',
        reconnectCount: 0,
        failoverActive: false,
        latencyMs: 5
      }));
      await tx.insert(marketConnectivityTable).values(conns as any);
    }

    if (payload.instruments && payload.instruments.length > 0) {
      await tx.insert(instrumentMasterTable).values(payload.instruments as any);
    }
    if (payload.symbols && payload.symbols.length > 0) {
      await tx.insert(symbolMasterTable).values(payload.symbols as any);
    }
    if (payload.isins && payload.isins.length > 0) {
      await tx.insert(isinMasterTable).values(payload.isins as any);
    }
    if (payload.expirities && payload.expirities.length > 0) {
      const expDates = payload.expirities.map(e => ({
        ...e,
        expiryDate: new Date(e.expiryDate)
      }));
      await tx.insert(expiryMasterTable).values(expDates as any);
    }
    if (payload.lotSizes && payload.lotSizes.length > 0) {
      await tx.insert(lotSizeMasterTable).values(payload.lotSizes as any);
    }
    if (payload.tickSizes && payload.tickSizes.length > 0) {
      const formattedTicks = payload.tickSizes.map(t => ({
        ...t,
        tickSize: String(t.tickSize)
      }));
      await tx.insert(tickSizeMasterTable).values(formattedTicks as any);
    }
    if (payload.sectors && payload.sectors.length > 0) {
      await tx.insert(sectorMasterTable).values(payload.sectors as any);
    }
    if (payload.derivatives && payload.derivatives.length > 0) {
      const formattedDerivs = payload.derivatives.map(d => ({
        ...d,
        strike: d.strike ? String(d.strike) : null,
        expiry: d.expiry ? new Date(d.expiry) : null
      }));
      await tx.insert(derivativeMasterTable).values(formattedDerivs as any);
    }
  });
}

// ====================================================
// EP04.1: ENTERPRISE MARKET CONNECTIVITY REPOSITORY
// ====================================================

export class MarketEnterpriseRepository {
  async getVersions(): Promise<any[]> {
    const db = getDb();
    return db.select().from(marketVersionsTable).orderBy(sql`${marketVersionsTable.createdAt} DESC`);
  }

  async createVersion(version: any): Promise<void> {
    const db = getDb();
    await db.insert(marketVersionsTable).values(version);
  }

  async getLifecycleHistory(instrumentId?: string): Promise<any[]> {
    const db = getDb();
    if (instrumentId) {
      return db.select().from(instrumentLifecycleHistoryTable)
        .where(eq(instrumentLifecycleHistoryTable.instrumentId, instrumentId))
        .orderBy(sql`${instrumentLifecycleHistoryTable.createdAt} DESC`);
    }
    return db.select().from(instrumentLifecycleHistoryTable).orderBy(sql`${instrumentLifecycleHistoryTable.createdAt} DESC`);
  }

  async createLifecycleHistory(record: any): Promise<void> {
    const db = getDb();
    await db.insert(instrumentLifecycleHistoryTable).values(record);
  }

  async getProposals(): Promise<any[]> {
    const db = getDb();
    return db.select().from(masterDataProposalsTable).orderBy(sql`${masterDataProposalsTable.createdAt} DESC`);
  }

  async getProposalById(id: string): Promise<any | null> {
    const db = getDb();
    const rows = await db.select().from(masterDataProposalsTable).where(eq(masterDataProposalsTable.id, id)).limit(1);
    return rows[0] || null;
  }

  async createProposal(proposal: any): Promise<void> {
    const db = getDb();
    await db.insert(masterDataProposalsTable).values(proposal);
  }

  async updateProposalStatus(
    id: string, 
    status: string, 
    fields: { errors?: string | null, validatedAt?: Date, approvedAt?: Date, synchronizedAt?: Date } = {}
  ): Promise<void> {
    const db = getDb();
    const updateObj: any = { status };
    if (fields.errors !== undefined) updateObj.errors = fields.errors;
    if (fields.validatedAt !== undefined) updateObj.validatedAt = fields.validatedAt;
    if (fields.approvedAt !== undefined) updateObj.approvedAt = fields.approvedAt;
    if (fields.synchronizedAt !== undefined) updateObj.synchronizedAt = fields.synchronizedAt;

    await db.update(masterDataProposalsTable).set(updateObj).where(eq(masterDataProposalsTable.id, id));
  }

  async getLineage(correlationId?: string): Promise<any[]> {
    const db = getDb();
    if (correlationId) {
      return db.select().from(marketLineageTable).where(eq(marketLineageTable.correlationId, correlationId));
    }
    return db.select().from(marketLineageTable).orderBy(sql`${marketLineageTable.importAt} DESC`);
  }

  async createLineage(record: any): Promise<void> {
    const db = getDb();
    await db.insert(marketLineageTable).values(record);
  }

  async updateLineage(correlationId: string, updates: any): Promise<void> {
    const db = getDb();
    await db.update(marketLineageTable).set(updates).where(eq(marketLineageTable.correlationId, correlationId));
  }

  async getAuditChain(): Promise<any[]> {
    const db = getDb();
    return db.select().from(marketAuditChainTable).orderBy(sql`${marketAuditChainTable.createdAt} DESC`);
  }

  async getLatestAuditRecord(): Promise<any | null> {
    const db = getDb();
    const rows = await db.select().from(marketAuditChainTable).orderBy(sql`${marketAuditChainTable.createdAt} DESC`).limit(1);
    return rows[0] || null;
  }

  async createAuditRecord(record: any): Promise<void> {
    const db = getDb();
    await db.insert(marketAuditChainTable).values(record);
  }

  async getFeedMetrics(): Promise<any[]> {
    const db = getDb();
    return db.select().from(feedQualityMetricsTable).orderBy(sql`${feedQualityMetricsTable.createdAt} DESC`);
  }

  async createOrUpdateFeedMetrics(metrics: any): Promise<void> {
    const db = getDb();
    // Try updating first
    const rows = await db.select().from(feedQualityMetricsTable).where(eq(feedQualityMetricsTable.exchangeId, metrics.exchangeId)).limit(1);
    if (rows.length > 0) {
      await db.update(feedQualityMetricsTable).set(metrics).where(eq(feedQualityMetricsTable.exchangeId, metrics.exchangeId));
    } else {
      await db.insert(feedQualityMetricsTable).values(metrics);
    }
  }

  async getCertificates(): Promise<any[]> {
    const db = getDb();
    return db.select().from(connectivityCertificatesTable).orderBy(sql`${connectivityCertificatesTable.timestamp} DESC`);
  }

  async createCertificate(cert: any): Promise<void> {
    const db = getDb();
    await db.insert(connectivityCertificatesTable).values(cert);
  }

  async getRecoveryJobs(): Promise<any[]> {
    const db = getDb();
    return db.select().from(marketRecoveryJobsTable).orderBy(sql`${marketRecoveryJobsTable.createdAt} DESC`);
  }

  async createRecoveryJob(job: any): Promise<void> {
    const db = getDb();
    await db.insert(marketRecoveryJobsTable).values(job);
  }

  async updateRecoveryJob(
    id: string, 
    status: string, 
    auditTrail: string, 
    certificateId?: string | null, 
    completedAt?: Date
  ): Promise<void> {
    const db = getDb();
    const updateObj: any = { status, auditTrail };
    if (certificateId !== undefined) updateObj.certificateId = certificateId;
    if (completedAt !== undefined) updateObj.completedAt = completedAt;

    await db.update(marketRecoveryJobsTable).set(updateObj).where(eq(marketRecoveryJobsTable.id, id));
  }

  async getDependencies(): Promise<any[]> {
    const db = getDb();
    return db.select().from(marketDependencyRegistryTable).orderBy(sql`${marketDependencyRegistryTable.registeredAt} ASC`);
  }

  async registerDependency(workspace: string): Promise<void> {
    const db = getDb();
    // Insert if not exists
    const rows = await db.select().from(marketDependencyRegistryTable).where(eq(marketDependencyRegistryTable.consumerWorkspace, workspace)).limit(1);
    if (rows.length === 0) {
      await db.insert(marketDependencyRegistryTable).values({
        id: `dep-${workspace.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        consumerWorkspace: workspace,
        registeredAt: new Date(),
        status: 'ACTIVE'
      });
    }
  }
}

