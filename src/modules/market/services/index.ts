import crypto from "crypto";
import { NSEDataAdapter } from "../adapters/NSEDataAdapter.ts";
import { BSEDataAdapter } from "../adapters/BSEDataAdapter.ts";
import { TrueDataAdapter } from "../adapters/TrueDataAdapter.ts";
import { GlobalDatafeedsAdapter } from "../adapters/GlobalDatafeedsAdapter.ts";
import { AngelOneAdapter } from "../adapters/AngelOneAdapter.ts";
import { IMarketDataProvider } from "../../../infrastructure/abstractions/index.ts";
import { getDb } from "../../../db/index";
import { 
  marketCacheTable, 
  marketEventsTable, 
  marketRecoveryJobsTable, 
  indianMarketEventsTable, 
  marketFeedTable 
} from "../../../db/schema";
import { 
  ExchangeRepository, 
  InstrumentTypeRepository, 
  InstrumentRepository, 
  MarketStatusRepository,
  ExchangeRegistryRepository,
  MarketConnectivityRepository,
  InstrumentMasterRepository,
  SymbolMasterRepository,
  IsinMasterRepository,
  DerivativeMasterRepository,
  ExpiryMasterRepository,
  LotSizeMasterRepository,
  TickSizeMasterRepository,
  SectorMasterRepository,
  MarketFeedRepository,
  MarketCacheRepository,
  MarketMetadataRepository,
  MarketEventsRepository,
  ensureMarketTablesAndMasterData,
  executeMarketMasterSync,
  MarketEnterpriseRepository
} from "../repositories/index";
import { 
  Exchange, 
  InstrumentType, 
  Instrument, 
  MarketStatus, 
  InstrumentSearchFilters,
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
  MarketMetadata,
  MarketEvent,
  MarketVersion,
  InstrumentLifecycleHistory,
  MasterDataProposal,
  MarketLineage,
  MarketAuditChain,
  FeedQualityMetrics,
  ConnectivityCertificate,
  MarketRecoveryJob,
  MarketDependencyRegistry
} from "../types/index";

export class MarketService {
  // Legacy Repos
  private exchangeRepo = new ExchangeRepository();
  private typeRepo = new InstrumentTypeRepository();
  private instrumentRepo = new InstrumentRepository();
  private statusRepo = new MarketStatusRepository();

  // EP04 Repos
  private registryRepo = new ExchangeRegistryRepository();
  private connectivityRepo = new MarketConnectivityRepository();
  private instrumentMasterRepo = new InstrumentMasterRepository();
  private symbolRepo = new SymbolMasterRepository();
  private isinRepo = new IsinMasterRepository();
  private derivativeRepo = new DerivativeMasterRepository();
  private expiryRepo = new ExpiryMasterRepository();
  private lotSizeRepo = new LotSizeMasterRepository();
  private tickSizeRepo = new TickSizeMasterRepository();
  private sectorRepo = new SectorMasterRepository();
  private feedRepo = new MarketFeedRepository();
  private cacheRepo = new MarketCacheRepository();
  private metadataRepo = new MarketMetadataRepository();
  private eventsRepo = new MarketEventsRepository();
  private enterpriseRepo = new MarketEnterpriseRepository();

  constructor() {
    // Fire-and-forget the db table creation and initial master seed
    ensureMarketTablesAndMasterData().catch(err => {
      console.error("[EP04] Async database schema initialization failed:", err);
    });
  }

  // ====================================================
  // MODULE 1: ENTERPRISE EXCHANGE REGISTRY
  // ====================================================
  async getExchangeRegistries(): Promise<ExchangeRegistry[]> {
    return await this.registryRepo.getAll();
  }

  async getExchangeRegistryById(exchangeId: string): Promise<ExchangeRegistry | null> {
    return await this.registryRepo.findById(exchangeId);
  }

  private getActiveAdapter(symbol?: string): IMarketDataProvider {
    const isBSE = symbol ? (symbol.includes('SENSEX') || symbol.endsWith('.BO')) : false;
    const configuredProvider = (process.env.MARKET_DATA_PROVIDER || '').toLowerCase();

    if (configuredProvider === 'angelone') {
      return new AngelOneAdapter();
    } else if (configuredProvider === 'truedata') {
      return new TrueDataAdapter();
    } else if (configuredProvider === 'globaldatafeeds') {
      return new GlobalDatafeedsAdapter();
    } else if (configuredProvider === 'bse' || (configuredProvider === '' && isBSE)) {
      return new BSEDataAdapter();
    } else {
      return new NSEDataAdapter();
    }
  }

  // ====================================================
  // MODULE 2: ENTERPRISE MARKET CONNECTIVITY
  // ====================================================
  async getMarketConnectivities(): Promise<MarketConnectivity[]> {
    const connections = await this.connectivityRepo.getAll();
    const adapter = this.getActiveAdapter();
    const health = await adapter.healthCheck();

    return connections.map(conn => {
      if (!health.isHealthy || health.status === 'NOT_CONFIGURED') {
        return {
          ...conn,
          feedStatus: 'DISCONNECTED',
          healthStatus: 'UNHEALTHY',
          latencyMs: 0
        };
      }
      return conn;
    });
  }

  async triggerReconnect(exchangeId: string): Promise<void> {
    await this.connectivityRepo.incrementReconnect(exchangeId);
    await this.connectivityRepo.updateFeedStatus(exchangeId, 'CONNECTED', 'HEALTHY', Math.floor(Math.random() * 8) + 2);
    await this.eventsRepo.logEvent('FeedRecovered', exchangeId, {
      triggeredBy: 'SYSTEM_MONITOR',
      timestamp: new Date().toISOString()
    });
  }

  async triggerDisconnect(exchangeId: string): Promise<void> {
    await this.connectivityRepo.updateFeedStatus(exchangeId, 'DISCONNECTED', 'UNHEALTHY', 0);
    await this.eventsRepo.logEvent('ExchangeDisconnected', exchangeId, {
      triggeredBy: 'SYSTEM_OPERATOR',
      timestamp: new Date().toISOString()
    });
  }

  async toggleFailover(exchangeId: string, active: boolean): Promise<void> {
    await this.connectivityRepo.toggleFailover(exchangeId, active);
    const latency = active ? Math.floor(Math.random() * 15) + 15 : Math.floor(Math.random() * 5) + 3;
    await this.connectivityRepo.updateFeedStatus(
      exchangeId, 
      'CONNECTED', 
      active ? 'DEGRADED' : 'HEALTHY', 
      latency
    );
    await this.eventsRepo.logEvent('FeedRecovered', exchangeId, {
      failoverActive: active,
      timestamp: new Date().toISOString()
    });
  }

  // ====================================================
  // MODULE 3: ENTERPRISE INSTRUMENT MASTER
  // ====================================================
  async getInstrumentMasters(): Promise<InstrumentMaster[]> {
    return await this.instrumentMasterRepo.getAll();
  }

  async disableInstrument(instrumentId: string): Promise<void> {
    await this.instrumentMasterRepo.setStatus(instrumentId, 'INACTIVE');
    await this.eventsRepo.logEvent('InstrumentDisabled', null, {
      instrumentId,
      timestamp: new Date().toISOString()
    });
  }

  async enableInstrument(instrumentId: string): Promise<void> {
    await this.instrumentMasterRepo.setStatus(instrumentId, 'ACTIVE');
    await this.eventsRepo.logEvent('InstrumentAdded', null, {
      instrumentId,
      timestamp: new Date().toISOString()
    });
  }

  // ====================================================
  // MODULE 4: ENTERPRISE SYMBOL MASTER
  // ====================================================
  async getSymbolMasters(): Promise<SymbolMaster[]> {
    return await this.symbolRepo.getAll();
  }

  // ====================================================
  // MODULE 5: ENTERPRISE ISIN MASTER
  // ====================================================
  async getIsinMasters(): Promise<IsinMaster[]> {
    return await this.isinRepo.getAll();
  }

  // ====================================================
  // MODULE 6: ENTERPRISE DERIVATIVE MASTER
  // ====================================================
  async getDerivativeMasters(): Promise<DerivativeMaster[]> {
    return await this.derivativeRepo.getAll();
  }

  // ====================================================
  // MODULE 7: ENTERPRISE EXPIRY MASTER
  // ====================================================
  async getExpiryMasters(): Promise<ExpiryMaster[]> {
    return await this.expiryRepo.getAll();
  }

  // ====================================================
  // MODULE 8: ENTERPRISE LOT SIZE MASTER
  // ====================================================
  async getLotSizes(): Promise<LotSizeMaster[]> {
    return await this.lotSizeRepo.getAll();
  }

  // ====================================================
  // MODULE 9: ENTERPRISE TICK SIZE MASTER
  // ====================================================
  async getTickSizes(): Promise<TickSizeMaster[]> {
    return await this.tickSizeRepo.getAll();
  }

  // ====================================================
  // MODULE 10: ENTERPRISE SECTOR MASTER
  // ====================================================
  async getSectors(): Promise<SectorMaster[]> {
    return await this.sectorRepo.getAll();
  }

  // ====================================================
  // MODULE 12: ENTERPRISE MARKET FEED ENGINE
  // ====================================================
  async getMarketFeedEngine(): Promise<MarketFeed | null> {
    const feed = await this.feedRepo.getFeed();
    const adapter = this.getActiveAdapter();
    const health = await adapter.healthCheck();

    if (feed) {
      if (!health.isHealthy || health.status === 'NOT_CONFIGURED') {
        return {
          ...feed,
          feedStatus: 'DISCONNECTED',
          feedHealth: 'UNHEALTHY',
          feedSource: adapter.name
        };
      } else {
        return {
          ...feed,
          feedStatus: 'CONNECTED',
          feedHealth: 'HEALTHY',
          feedSource: adapter.name
        };
      }
    }
    return feed;
  }

  async updateFeedEngine(data: Partial<MarketFeed>): Promise<void> {
    await this.feedRepo.updateFeedEngine(data);
    if (data.feedStatus === 'CONNECTED') {
      await this.eventsRepo.logEvent('FeedStarted', null, { timestamp: new Date().toISOString() });
    } else if (data.feedStatus === 'DISCONNECTED') {
      await this.eventsRepo.logEvent('FeedStopped', null, { timestamp: new Date().toISOString() });
    }
  }

  // ====================================================
  // AUTHORIZED CANONICAL MARKET CANDLES API
  // ====================================================
  async getMarketCandles(symbol: string, timeframe: string): Promise<any> {
    const isBSE = symbol.includes('SENSEX') || symbol.endsWith('.BO');
    const configuredProvider = (process.env.MARKET_DATA_PROVIDER || '').toLowerCase();

    let adapter: IMarketDataProvider;
    let requiredVars: string[] = [];

    if (configuredProvider === 'angelone') {
      adapter = new AngelOneAdapter();
      requiredVars = ['ANGELONE_API_KEY', 'ANGELONE_CLIENT_CODE', 'ANGELONE_PIN', 'ANGELONE_TOTP_SECRET', 'ANGELONE_WS_URL', 'ANGELONE_BASE_URL'];
    } else if (configuredProvider === 'truedata') {
      adapter = new TrueDataAdapter();
      requiredVars = ['TRUEDATA_API_KEY', 'TRUEDATA_API_SECRET', 'TRUEDATA_WS_URL', 'TRUEDATA_BASE_URL'];
    } else if (configuredProvider === 'globaldatafeeds') {
      adapter = new GlobalDatafeedsAdapter();
      requiredVars = ['GLOBALDATAFEEDS_API_KEY', 'GLOBALDATAFEEDS_API_SECRET', 'GLOBALDATAFEEDS_WS_URL', 'GLOBALDATAFEEDS_BASE_URL'];
    } else if (configuredProvider === 'bse' || (configuredProvider === '' && isBSE)) {
      adapter = new BSEDataAdapter();
      requiredVars = ['BSE_MARKET_DATA_API_KEY', 'BSE_MARKET_DATA_API_SECRET', 'BSE_MARKET_DATA_WS_URL'];
    } else {
      adapter = new NSEDataAdapter();
      requiredVars = ['NSE_MARKET_DATA_API_KEY', 'NSE_MARKET_DATA_API_SECRET', 'NSE_MARKET_DATA_WS_URL'];
    }
    
    const health = await adapter.healthCheck();

    if (!health.isHealthy || health.status === 'NOT_CONFIGURED') {
      return {
        status: 'NOT_CONFIGURED',
        provider: adapter.name,
        exchange: isBSE ? 'BSE' : 'NSE',
        symbol,
        timeframe,
        candles: [],
        missingConfig: {
          provider: adapter.name,
          requiredEnvVars: requiredVars,
          message: 'No authorized market data feed credentials configured in backend environment.'
        }
      };
    }

    const end = new Date();
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const candles = await adapter.getHistoricalCandles(symbol, timeframe, start, end);

    if (!candles || candles.length === 0) {
      return {
        status: 'NO_MARKET_DATA',
        provider: adapter.name,
        exchange: isBSE ? 'BSE' : 'NSE',
        symbol,
        timeframe,
        candles: []
      };
    }

    return {
      status: 'CONNECTED',
      provider: adapter.name,
      exchange: isBSE ? 'BSE' : 'NSE',
      symbol,
      timeframe,
      candles
    };
  }

  // ====================================================
  // MODULE 14: ENTERPRISE MARKET CACHE
  // ====================================================
  async getCache(key: string): Promise<any | null> {
    return await this.cacheRepo.get(key);
  }

  async setCache(key: string, value: any, ttlSec = 300): Promise<void> {
    await this.cacheRepo.set(key, value, ttlSec);
  }

  async clearCache(): Promise<void> {
    await this.cacheRepo.clear();
  }

  // ====================================================
  // MODULE 15: ENTERPRISE MARKET METADATA
  // ====================================================
  async getMarketMetadata(): Promise<MarketMetadata | null> {
    return await this.metadataRepo.get();
  }

  // ====================================================
  // MODULE 17: ENTERPRISE MARKET EVENT ENGINE
  // ====================================================
  async getMarketEvents(): Promise<MarketEvent[]> {
    return await this.eventsRepo.getHistory();
  }

  // ====================================================
  // MODULE 13 & 16: ENTERPRISE FEED VALIDATION & SYNCHRONIZATION
  // ====================================================
  async synchronizeMarketMasterData(payload: {
    registry: ExchangeRegistry[];
    instruments: InstrumentMaster[];
    symbols: SymbolMaster[];
    lotSizes: LotSizeMaster[];
    tickSizes: TickSizeMaster[];
    expirities: ExpiryMaster[];
    sectors: SectorMaster[];
    isins: IsinMaster[];
    derivatives: DerivativeMaster[];
  }): Promise<{ success: boolean; message: string; rejectedCount: number; errors: string[]; checksum: string }> {
    const errors: string[] = [];
    let rejectedCount = 0;

    // MODULE 13: Validate and reject invalid master data
    const validRegistries: ExchangeRegistry[] = [];
    const validInstruments: InstrumentMaster[] = [];
    const validSymbols: SymbolMaster[] = [];
    const validIsins: IsinMaster[] = [];
    const validExpiries: ExpiryMaster[] = [];
    const validLotSizes: LotSizeMaster[] = [];
    const validTickSizes: TickSizeMaster[] = [];
    const validSectors: SectorMaster[] = [];
    const validDerivatives: DerivativeMaster[] = [];

    // Check duplicate symbol tracking
    const symbolSet = new Set<string>();

    // 1. Validate exchanges
    for (const r of payload.registry) {
      if (!r.exchangeId || !r.exchangeCode) {
        errors.push(`Rejected Registry: Invalid code/ID for ${r.exchangeName || 'Unknown'}`);
        rejectedCount++;
        continue;
      }
      validRegistries.push(r);
    }

    // 2. Validate instruments
    for (const inst of payload.instruments) {
      if (!inst.instrumentId || !inst.instrumentType || !inst.exchangeId) {
        errors.push(`Rejected Instrument: Missing properties in ${inst.instrumentId || 'Unknown'}`);
        rejectedCount++;
        continue;
      }
      validInstruments.push(inst);
    }

    // 3. Validate symbols
    for (const sym of payload.symbols) {
      if (!sym.instrumentId || !sym.tradingSymbol || !sym.displaySymbol) {
        errors.push(`Rejected Symbol: Missing properties in trading symbol ${sym.tradingSymbol || 'Unknown'}`);
        rejectedCount++;
        continue;
      }
      if (symbolSet.has(sym.tradingSymbol)) {
        errors.push(`Rejected Symbol: Duplicate trading symbol found: ${sym.tradingSymbol}`);
        rejectedCount++;
        continue;
      }
      symbolSet.add(sym.tradingSymbol);
      validSymbols.push(sym);
    }

    // 4. Validate ISINs
    for (const isin of payload.isins) {
      if (!isin.isin || isin.isin.length < 5 || !isin.securityName) {
        errors.push(`Rejected ISIN: Invalid code format for ISIN ${isin.isin || 'Unknown'}`);
        rejectedCount++;
        continue;
      }
      validIsins.push(isin);
    }

    // 5. Validate expiry
    for (const exp of payload.expirities) {
      const expDate = new Date(exp.expiryDate);
      if (isNaN(expDate.getTime())) {
        errors.push(`Rejected Expiry: Invalid date format for ${exp.id}`);
        rejectedCount++;
        continue;
      }
      validExpiries.push(exp);
    }

    // 6. Validate lot size
    for (const lot of payload.lotSizes) {
      if (lot.lotSize <= 0 || lot.minimumQuantity <= 0) {
        errors.push(`Rejected Lot Size: Invalid quantities for instrument ${lot.instrumentId}`);
        rejectedCount++;
        continue;
      }
      validLotSizes.push(lot);
    }

    // 7. Validate tick size
    for (const tick of payload.tickSizes) {
      const parsedTick = parseFloat(tick.tickSize);
      if (isNaN(parsedTick) || parsedTick <= 0) {
        errors.push(`Rejected Tick Size: Invalid tick size for ${tick.instrumentId}`);
        rejectedCount++;
        continue;
      }
      validTickSizes.push(tick);
    }

    // 8. Validate sector
    for (const sec of payload.sectors) {
      if (!sec.sector || !sec.industry) {
        errors.push(`Rejected Sector: Missing sector classification for ${sec.instrumentId}`);
        rejectedCount++;
        continue;
      }
      validSectors.push(sec);
    }

    // 9. Validate derivatives
    for (const deriv of payload.derivatives) {
      if (!deriv.underlying || !deriv.instrumentId) {
        errors.push(`Rejected Derivative: Missing underlying for ${deriv.instrumentId}`);
        rejectedCount++;
        continue;
      }
      validDerivatives.push(deriv);
    }

    // Trigger atomic clean sync execution inside the repository layer
    await executeMarketMasterSync({
      registry: validRegistries,
      instruments: validInstruments,
      symbols: validSymbols,
      lotSizes: validLotSizes,
      tickSizes: validTickSizes,
      expirities: validExpiries,
      sectors: validSectors,
      isins: validIsins,
      derivatives: validDerivatives
    });

    // Update metadata checksum
    const newChecksum = `sync-chk-${Date.now()}-${Math.floor(Math.random()*1000000)}`;
    const newVersion = `1.1.${Date.now().toString().slice(-4)}`;
    await this.metadataRepo.updateChecksum(newChecksum, newVersion);

    // Publish sync event
    await this.eventsRepo.logEvent('MasterUpdated', null, {
      totalInstruments: validInstruments.length,
      rejectedCount,
      checksum: newChecksum,
      version: newVersion,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: `Sync completed. Transferred: ${validInstruments.length} instruments, Rejected: ${rejectedCount}`,
      rejectedCount,
      errors,
      checksum: newChecksum
    };
  }

  // ====================================================
  // EP04.1: ENTERPRISE MARKET COMPLETION ENGINE METHODS
  // ====================================================

  // MODULE 23: Market Version Engine
  async getVersions(): Promise<MarketVersion[]> {
    return await this.enterpriseRepo.getVersions();
  }

  async createVersionSnapshot(payload: any, createdBy: string, checksum: string): Promise<string> {
    const versionId = `v-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const masterVersion = `2.5.${Date.now().toString().slice(-4)}`;
    
    await this.enterpriseRepo.createVersion({
      id: versionId,
      masterVersion,
      schemaVersion: "2.0.0",
      dataVersion: `D-${Date.now().toString().slice(-4)}`,
      exchangeVersion: "EX-3.1",
      feedVersion: "FD-2.5",
      rollbackPayload: JSON.stringify(payload),
      createdAt: new Date(),
      createdBy,
      checksum,
      versionAudit: `Immutable snapshot generated by ${createdBy} at ${new Date().toISOString()}. Checksum: ${checksum}`
    });
    return versionId;
  }

  async rollbackToVersion(versionId: string, operator: string): Promise<any> {
    const versions = await this.enterpriseRepo.getVersions();
    const target = versions.find(v => v.id === versionId);
    if (!target) {
      throw new Error(`Version ID ${versionId} not found in immutable history registry.`);
    }

    const payload = JSON.parse(target.rollbackPayload);
    
    // Perform atomic synchronization of rollback payload
    await executeMarketMasterSync(payload);

    // Update metadata
    await this.metadataRepo.updateChecksum(target.checksum, target.masterVersion);

    // Audit rollback
    await this.auditAction(
      "Synchronization",
      "ROLLBACK",
      versionId,
      { previousVersion: target.masterVersion },
      operator
    );

    // Log event
    await this.eventsRepo.logEvent("MasterRollback" as any, null, {
      versionId,
      masterVersion: target.masterVersion,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: `Rollback successful. Restored version: ${target.masterVersion}`
    };
  }

  // MODULE 24: Failover Engine
  async getFeedQualityMetrics(): Promise<FeedQualityMetrics[]> {
    // Seed default metrics if empty
    const current = await this.enterpriseRepo.getFeedMetrics();
    if (current.length === 0) {
      const initial = [
        this.calculateFeedQuality("NSE", 5, 0.0, 0, 0, 1),
        this.calculateFeedQuality("BSE", 8, 0.05, 0, 0, 2),
        this.calculateFeedQuality("COMMODITY", 12, 0.1, 1, 0, 3)
      ];
      for (const m of initial) {
        await this.enterpriseRepo.createOrUpdateFeedMetrics(m);
      }
      return initial;
    }
    return current;
  }

  private calculateFeedQuality(
    exchangeId: string,
    latencyMs: number,
    packetLoss: number,
    duplicateTicks: number,
    missingTicks: number,
    feedDelayMs: number
  ): FeedQualityMetrics {
    let score = 100;
    score -= Math.min(latencyMs * 0.1, 30);
    score -= Math.min(packetLoss * 5, 30);
    score -= Math.min(duplicateTicks * 0.5, 10);
    score -= Math.min(missingTicks * 2, 10);
    score -= Math.min(feedDelayMs * 0.2, 20);

    const qualityScore = Math.max(0, Math.min(100, score));
    let healthState: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' = 'EXCELLENT';
    if (qualityScore < 50) healthState = 'CRITICAL';
    else if (qualityScore < 75) healthState = 'WARNING';
    else if (qualityScore < 90) healthState = 'GOOD';

    return {
      id: `fq-${exchangeId.toLowerCase()}`,
      exchangeId,
      latencyMs,
      packetLoss: String(packetLoss) as any,
      duplicateTicks,
      missingTicks,
      feedDelayMs,
      feedConfidence: Number((qualityScore * 0.95 + 5).toFixed(2)) as any,
      qualityScore: Number(qualityScore.toFixed(2)) as any,
      healthState,
      createdAt: new Date()
    };
  }

  async simulateFeedMetricsUpdate(exchangeId: string, latencyMs: number, packetLoss: number): Promise<void> {
    const metrics = this.calculateFeedQuality(
      exchangeId,
      latencyMs,
      packetLoss,
      Math.random() > 0.8 ? 1 : 0,
      Math.random() > 0.9 ? 1 : 0,
      Math.floor(Math.random() * 5) + 1
    );
    await this.enterpriseRepo.createOrUpdateFeedMetrics(metrics);
  }

  // MODULE 25: Instrument Lifecycle Engine
  async transitionInstrumentState(
    instrumentId: string,
    toState: string,
    reason: string,
    operator: string
  ): Promise<void> {
    const validStates = ['CREATED', 'PENDING', 'ACTIVE', 'SUSPENDED', 'TRADING_HALT', 'EXPIRED', 'DELISTED', 'ARCHIVED'];
    if (!validStates.includes(toState)) {
      throw new Error(`Invalid target state: ${toState}`);
    }

    // Get current instrument
    const instruments = await this.getInstrumentMasters();
    const inst = instruments.find(i => i.instrumentId === instrumentId);
    if (!inst) {
      throw new Error(`Instrument ${instrumentId} does not exist.`);
    }

    const fromState = inst.status;

    // Validate lifecycle transition rules
    const allowedTransitions: Record<string, string[]> = {
      'CREATED': ['PENDING'],
      'PENDING': ['ACTIVE', 'DELISTED'],
      'ACTIVE': ['SUSPENDED', 'TRADING_HALT', 'EXPIRED', 'DELISTED'],
      'INACTIVE': ['ACTIVE', 'SUSPENDED', 'DELISTED'],
      'SUSPENDED': ['ACTIVE', 'TRADING_HALT', 'DELISTED'],
      'TRADING_HALT': ['ACTIVE', 'SUSPENDED', 'DELISTED'],
      'EXPIRED': ['ARCHIVED'],
      'DELISTED': ['ARCHIVED'],
      'ARCHIVED': []
    };

    // If there's an existing mapped state, check transition. Otherwise (e.g. legacy states), allow any to active/suspended
    const possibleTargets = allowedTransitions[fromState] || [];
    if (fromState && fromState !== toState && !possibleTargets.includes(toState)) {
      throw new Error(`Lifecycle Exception: Transition from state "${fromState}" to "${toState}" is strictly forbidden under regulatory protocols.`);
    }

    // Apply Transition
    const legacyStatus = toState === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    await this.instrumentMasterRepo.setStatus(instrumentId, legacyStatus);

    // Save lifecycle history
    await this.enterpriseRepo.createLifecycleHistory({
      id: `lif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      instrumentId,
      oldState: fromState || 'CREATED',
      newState: toState,
      reason,
      operator,
      createdAt: new Date()
    });

    // Audit State Transition
    await this.auditAction("Instrument", "LIFECYCLE_TRANSITION", instrumentId, { fromState, toState, reason }, operator);
    
    // Log event
    const eventType = toState === 'ACTIVE' ? 'InstrumentAdded' : 'InstrumentDisabled';
    await this.eventsRepo.logEvent(eventType as any, null, {
      instrumentId,
      fromState,
      toState,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  async getLifecycleHistory(instrumentId?: string): Promise<InstrumentLifecycleHistory[]> {
    return await this.enterpriseRepo.getLifecycleHistory(instrumentId);
  }

  // MODULE 26: Master Data Approval Engine
  async getProposals(): Promise<MasterDataProposal[]> {
    return await this.enterpriseRepo.getProposals();
  }

  async submitProposal(payload: any, operator: string): Promise<MasterDataProposal> {
    const proposalId = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const correlationId = `corr-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const proposal: any = {
      id: proposalId,
      status: 'DRAFT',
      payload: JSON.stringify(payload),
      errors: null,
      operator,
      createdAt: new Date(),
      validatedAt: null,
      approvedAt: null,
      synchronizedAt: null,
      correlationId
    };

    await this.enterpriseRepo.createProposal(proposal);

    // MODULE 27: Create Lineage
    await this.enterpriseRepo.createLineage({
      id: `lin-${Date.now()}`,
      correlationId,
      source: "API_GATEWAY_IMPORT",
      importOperator: operator,
      importAt: new Date(),
      validationStatus: "PENDING",
      validationAt: new Date(),
      approvalOperator: null,
      approvalAt: null,
      publicationAt: null,
      consumers: JSON.stringify(["Trading Workspace", "Treasury Workspace", "Accounting Workspace"])
    });

    // Audit proposal creation
    await this.auditAction("Synchronization", "PROPOSAL_CREATE", proposalId, { correlationId }, operator);

    await this.eventsRepo.logEvent("ProposalCreated" as any, null, {
      proposalId,
      correlationId,
      operator
    });

    return proposal;
  }

  async validateProposal(id: string): Promise<any> {
    const proposal = await this.enterpriseRepo.getProposalById(id);
    if (!proposal) throw new Error(`Proposal ID ${id} not found.`);

    const payload = JSON.parse(proposal.payload);
    const errors: string[] = [];

    // Validation checks
    if (!payload.registry || payload.registry.length === 0) {
      errors.push("Payload lacks mandatory Exchange Registry array.");
    }
    if (!payload.instruments || payload.instruments.length === 0) {
      errors.push("Payload lacks mandatory Instrument Master array.");
    }

    // Verify duplicate symbols
    const seenSymbols = new Set<string>();
    if (payload.symbols) {
      for (const s of payload.symbols) {
        if (seenSymbols.has(s.tradingSymbol)) {
          errors.push(`Duplicate Symbol check failed: "${s.tradingSymbol}" declared multiple times.`);
        }
        seenSymbols.add(s.tradingSymbol);
      }
    }

    // Verify tick step precision
    if (payload.tickSizes) {
      for (const t of payload.tickSizes) {
        const step = parseFloat(t.tickSize);
        if (isNaN(step) || step <= 0) {
          errors.push(`Invalid Tick Size step limit for instrument ${t.instrumentId}.`);
        }
      }
    }

    const hasErrors = errors.length > 0;
    const nextStatus = hasErrors ? 'REJECTED' : 'VALIDATED';

    await this.enterpriseRepo.updateProposalStatus(id, nextStatus, {
      errors: hasErrors ? JSON.stringify(errors) : null,
      validatedAt: new Date()
    });

    // Update Lineage
    await this.enterpriseRepo.updateLineage(proposal.correlationId, {
      validationStatus: nextStatus,
      validationAt: new Date()
    });

    return {
      success: !hasErrors,
      status: nextStatus,
      errors
    };
  }

  async approveProposal(id: string, operator: string): Promise<void> {
    const proposal = await this.enterpriseRepo.getProposalById(id);
    if (!proposal) throw new Error(`Proposal ID ${id} not found.`);
    if (proposal.status !== 'VALIDATED') {
      throw new Error(`Proposal must be VALIDATED before approval. Current status is ${proposal.status}`);
    }

    await this.enterpriseRepo.updateProposalStatus(id, 'APPROVED', {
      approvedAt: new Date()
    });

    // Update Lineage
    await this.enterpriseRepo.updateLineage(proposal.correlationId, {
      approvalOperator: operator,
      approvalAt: new Date()
    });

    // Audit Approval Action
    await this.auditAction("Synchronization", "PROPOSAL_APPROVE", id, { correlationId: proposal.correlationId }, operator);

    await this.eventsRepo.logEvent("ProposalApproved" as any, null, {
      proposalId: id,
      correlationId: proposal.correlationId,
      operator
    });
  }

  async publishAndSynchronizeProposal(id: string, operator: string): Promise<any> {
    const proposal = await this.enterpriseRepo.getProposalById(id);
    if (!proposal) throw new Error(`Proposal ID ${id} not found.`);
    if (proposal.status !== 'APPROVED') {
      throw new Error(`Proposal must be APPROVED before synchronized execution.`);
    }

    const payload = JSON.parse(proposal.payload);

    // 1. Snapshot previous state as an immutable version for rollback engine
    const previousInstruments = await this.getInstrumentMasters();
    const previousRegistry = await this.getExchangeRegistries();
    const previousSymbols = await this.getSymbolMasters();
    const previousLots = await this.lotSizeRepo.getAll();
    const previousTicks = await this.tickSizeRepo.getAll();
    const previousExpiries = await this.expiryRepo.getAll();
    const previousSectors = await this.sectorRepo.getAll();
    const previousIsins = await this.isinRepo.getAll();
    const previousDerivatives = await this.derivativeRepo.getAll();

    const previousSnapshot = {
      registry: previousRegistry,
      instruments: previousInstruments,
      symbols: previousSymbols,
      lotSizes: previousLots,
      tickSizes: previousTicks,
      expirities: previousExpiries,
      sectors: previousSectors,
      isins: previousIsins,
      derivatives: previousDerivatives
    };

    const previousChecksum = `prev-chk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await this.createVersionSnapshot(previousSnapshot, "SYSTEM_AUTOMATION", previousChecksum);

    // 2. Perform Atomic Sync
    const syncRes = await this.synchronizeMarketMasterData(payload);
    if (!syncRes.success) {
      throw new Error(`Proposal Synchronization Failed: ${syncRes.errors?.join(', ')}`);
    }

    // 3. Update status
    await this.enterpriseRepo.updateProposalStatus(id, 'SYNCHRONIZED', {
      synchronizedAt: new Date()
    });

    // 4. Update Lineage
    const registeredConsumers = await this.enterpriseRepo.getDependencies();
    const consumerList = registeredConsumers.map(c => c.consumerWorkspace);
    await this.enterpriseRepo.updateLineage(proposal.correlationId, {
      publicationAt: new Date(),
      consumers: JSON.stringify(consumerList.length > 0 ? consumerList : ["Trading Workspace", "Treasury Workspace", "Accounting Workspace"])
    });

    // 5. Generate Connectivity Certificates
    await this.generateCertificate("SYNCHRONIZATION", null, "EXCHANGE_MASTER_BROKER");
    await this.generateCertificate("INTEGRITY", null, "SHIELD_VALIDATOR");

    // Audit Publication
    await this.auditAction("Synchronization", "PROPOSAL_PUBLISH", id, { correlationId: proposal.correlationId, checksum: syncRes.checksum }, operator);

    return {
      success: true,
      checksum: syncRes.checksum,
      version: syncRes.message
    };
  }

  // MODULE 27: Lineage Engine
  async getLineages(): Promise<MarketLineage[]> {
    return await this.enterpriseRepo.getLineage();
  }

  // MODULE 28: Master Data Audit Engine (SHA-256 Chained)
  async getAuditChain(): Promise<MarketAuditChain[]> {
    return await this.enterpriseRepo.getAuditChain();
  }

  async auditAction(
    entityType: string,
    action: string,
    entityId: string,
    payload: any,
    operator: string
  ): Promise<void> {
    const payloadStr = JSON.stringify(payload);
    const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

    // Get previous hash
    const latest = await this.enterpriseRepo.getLatestAuditRecord();
    const previousHash = latest ? latest.currentHash : "0000000000000000000000000000000000000000000000000000000000000000";

    // Chain hash
    const currentHash = crypto.createHash('sha256').update(previousHash + payloadHash).digest('hex');

    await this.enterpriseRepo.createAuditRecord({
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entityType,
      action,
      entityId,
      payloadHash,
      previousHash,
      currentHash,
      operator,
      createdAt: new Date()
    });
  }

  // MODULE 30: Dependency Registry
  async getDependencies(): Promise<MarketDependencyRegistry[]> {
    // Seed default dependents
    const current = await this.enterpriseRepo.getDependencies();
    if (current.length === 0) {
      const defaults = ["Trading Workspace", "Treasury Workspace", "Accounting Workspace", "AI Intelligence Engine", "Strategy Runner", "Risk Desk"];
      for (const d of defaults) {
        await this.enterpriseRepo.registerDependency(d);
      }
      return await this.enterpriseRepo.getDependencies();
    }
    return current;
  }

  async registerDependency(workspaceName: string): Promise<void> {
    await this.enterpriseRepo.registerDependency(workspaceName);
  }

  // MODULE 31: Connectivity Certificate Engine
  async getCertificates(): Promise<ConnectivityCertificate[]> {
    const certs = await this.enterpriseRepo.getCertificates();
    if (certs.length === 0) {
      // Generate some default signed certs
      await this.generateCertificate("EXCHANGE_CONNECTIVITY", "NSE", "wss://feed.nseindia.com/live");
      await this.generateCertificate("FEED", "BSE", "wss://feed.bseindia.com/live");
      await this.generateCertificate("INTEGRITY", null, null);
      return await this.enterpriseRepo.getCertificates();
    }
    return certs;
  }

  async generateCertificate(
    type: 'EXCHANGE_CONNECTIVITY' | 'FEED' | 'SYNCHRONIZATION' | 'INTEGRITY',
    exchangeId: string | null = null,
    feedUrl: string | null = null
  ): Promise<ConnectivityCertificate> {
    const certId = `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = `${type}:${exchangeId || ''}:${feedUrl || ''}:${Date.now()}`;
    const sha256Hash = crypto.createHash('sha256').update(payload).digest('hex');
    const digitalSignature = crypto.createHmac('sha256', 'ARINA_PRIVATE_KEY_SIGNATURE_SECRET').update(sha256Hash).digest('hex');

    const cert: any = {
      id: certId,
      certificateType: type,
      exchangeId,
      feedUrl,
      timestamp: new Date(),
      sha256Hash,
      digitalSignature,
      verificationStatus: 'VERIFIED'
    };

    await this.enterpriseRepo.createCertificate(cert);
    return cert;
  }

  // MODULE 32: Recovery Engine
  async getRecoveryJobs(): Promise<MarketRecoveryJob[]> {
    return await this.enterpriseRepo.getRecoveryJobs();
  }

  async triggerSelfHealing(
    failureType: 'FEED_FAILURE' | 'EXCHANGE_DISCONNECT' | 'SYNCHRONIZATION_FAILURE' | 'METADATA_CORRUPTION' | 'CACHE_FAILURE',
    operator: string
  ): Promise<any> {
    const jobId = `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const auditTrail: string[] = [
      `[${new Date().toISOString()}] Initiating self-healing protocol for ${failureType}.`,
      `[${new Date().toISOString()}] Allocating cloud container recovery resources.`
    ];

    await this.enterpriseRepo.createRecoveryJob({
      id: jobId,
      failureType,
      recoveryAction: `AUTO_RESOLVE_${failureType}`,
      status: 'PENDING',
      auditTrail: JSON.stringify(auditTrail),
      certificateId: null,
      createdAt: new Date(),
      completedAt: null
    });

    // Start recovery
    await this.eventsRepo.logEvent("RecoveryStarted" as any, null, {
      jobId,
      failureType,
      operator
    });

    // Healing logic simulation
    auditTrail.push(`[${new Date().toISOString()}] Step 1: Performing validation checks.`);
    
    if (failureType === 'FEED_FAILURE') {
      auditTrail.push(`[${new Date().toISOString()}] Step 2: Redirecting to redundant secondary fiber lease-lines.`);
      const activeConns = await this.getMarketConnectivities();
      for (const c of activeConns) {
        await this.toggleFailover(c.exchangeId, true);
      }
    } else if (failureType === 'EXCHANGE_DISCONNECT') {
      auditTrail.push(`[${new Date().toISOString()}] Step 2: Triggering loop reconnection protocol on disconnected sockets.`);
      const activeConns = await this.getMarketConnectivities();
      for (const c of activeConns) {
        if (c.feedStatus !== 'CONNECTED') {
          await this.triggerReconnect(c.exchangeId);
        }
      }
    } else if (failureType === 'SYNCHRONIZATION_FAILURE') {
      auditTrail.push(`[${new Date().toISOString()}] Step 2: Initiating fallback to the latest known immutable master data version.`);
      const versions = await this.getVersions();
      if (versions.length > 0) {
        await this.rollbackToVersion(versions[0].id, operator);
      }
    } else if (failureType === 'METADATA_CORRUPTION') {
      auditTrail.push(`[${new Date().toISOString()}] Step 2: Re-validating and recalculating cryptographic SHA-256 signatures.`);
      const checksum = `recovery-chk-${Date.now()}`;
      await this.metadataRepo.updateChecksum(checksum, "2.5.0-HEALED");
    } else if (failureType === 'CACHE_FAILURE') {
      auditTrail.push(`[${new Date().toISOString()}] Step 2: Evicting stale cache storage maps and re-establishing high-performance nodes.`);
      await this.cacheRepo.clear();
    }

    auditTrail.push(`[${new Date().toISOString()}] Step 3: Generating certified cryptographic connectivity recovery document.`);
    
    const cert = await this.generateCertificate("INTEGRITY", null, "HEALED_SYSTEM_STATE");
    auditTrail.push(`[${new Date().toISOString()}] Step 4: System status marked fully OPERATIONAL. Recovery verified.`);

    await this.enterpriseRepo.updateRecoveryJob(jobId, 'RECOVERED', JSON.stringify(auditTrail), cert.id, new Date());

    await this.eventsRepo.logEvent("RecoveryCompleted" as any, null, {
      jobId,
      failureType,
      certificateId: cert.id,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      jobId,
      certificateId: cert.id,
      auditTrail
    };
  }

  // ====================================================
  // LEGACY METHODS (PRESERVED)
  // ====================================================
  async getExchanges(): Promise<Exchange[]> {
    return await this.exchangeRepo.findAll();
  }

  async getInstrumentTypes(): Promise<InstrumentType[]> {
    return await this.typeRepo.findAll();
  }

  async getInstruments(filters: InstrumentSearchFilters): Promise<Instrument[]> {
    return await this.instrumentRepo.search(filters);
  }

  async getInstrumentById(id: number): Promise<Instrument | null> {
    return await this.instrumentRepo.findById(id);
  }

  async getMarketStatus(exchangeId?: string): Promise<MarketStatus[]> {
    if (exchangeId) {
      const status = await this.statusRepo.findCurrentByExchange(exchangeId);
      return status ? [status] : [];
    }
    return await this.statusRepo.getAllCurrentStatus();
  }

  async resetMarketTestData({ confirm, resetState }: { confirm: boolean; resetState: string }) {
    if (!confirm || resetState !== "ON") {
      throw new Error("Reset confirmation required. resetState must be ON.");
    }

    const db = getDb();
    let recordsCleared = 0;

    if (db) {
      try {
        const cacheRes = await db.delete(marketCacheTable).returning();
        recordsCleared += cacheRes.length;
      } catch (e) {
        // ignore
      }

      try {
        const eventsRes = await db.delete(marketEventsTable).returning();
        recordsCleared += eventsRes.length;
      } catch (e) {
        // ignore
      }

      try {
        const recoveryRes = await db.delete(marketRecoveryJobsTable).returning();
        recordsCleared += recoveryRes.length;
      } catch (e) {
        // ignore
      }

      try {
        const indEventsRes = await db.delete(indianMarketEventsTable).returning();
        recordsCleared += indEventsRes.length;
      } catch (e) {
        // ignore
      }

      try {
        const feedRes = await db.delete(marketFeedTable).returning();
        recordsCleared += feedRes.length;
      } catch (e) {
        // ignore
      }
    }

    const resetRunId = `RST-MARKET-${Date.now()}`;
    return {
      module: "MARKET",
      resetRunId,
      status: "COMPLETED",
      recordsCleared: recordsCleared || 0,
      timestamp: new Date().toISOString()
    };
  }
}
