export type MarketStatusType = 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET' | 'HALTED';

export interface Exchange {
  id: string;
  name: string;
  description: string | null;
  timezone: string;
  isOpen: boolean;
}

export interface InstrumentType {
  id: string;
  name: string;
}

export interface Instrument {
  id: number;
  exchangeId: string;
  typeId: string;
  symbol: string;
  name: string;
  isActive: boolean;
  expiryDate: string | null;
  lotSize: number;
  tickSize: string;
  createdAt: string;
}

export interface MarketStatus {
  id: number;
  exchangeId: string;
  status: MarketStatusType;
  message: string | null;
  updatedAt: string;
}

export interface InstrumentSearchFilters {
  symbol?: string;
  name?: string;
  exchangeId?: string;
  typeId?: string;
  isActive?: boolean;
}

// ====================================================
// EP04: ENTERPRISE MARKET MASTER TYPES
// ====================================================

export interface ExchangeRegistry {
  id: string;
  exchangeId: string; // "NSE", "BSE", "MCX"
  exchangeCode: string; // "NSE", "BSE", "MCX"
  exchangeName: string;
  timezone: string;
  country: string;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE';
  version: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MarketConnectivity {
  id: string;
  exchangeId: string;
  primaryFeedUrl: string;
  secondaryFeedUrl: string;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  feedStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  reconnectCount: number;
  failoverActive: boolean;
  lastHeartbeatAt: Date | string;
  latencyMs: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface InstrumentMaster {
  id: string;
  instrumentId: string;
  instrumentType: 'EQUITY' | 'ETF' | 'INDEX' | 'STOCK_FUTURES' | 'INDEX_FUTURES' | 'STOCK_OPTIONS' | 'INDEX_OPTIONS' | 'COMMODITY';
  status: 'ACTIVE' | 'INACTIVE';
  exchangeId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SymbolMaster {
  id: string;
  instrumentId: string;
  tradingSymbol: string;
  displaySymbol: string;
  exchangeSymbol: string;
  brokerSymbol: string;
  internalSymbol: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IsinMaster {
  id: string;
  isin: string;
  securityName: string;
  exchangeMapping: string;
  listingStatus: 'LISTED' | 'SUSPENDED' | 'DELISTED';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DerivativeMaster {
  id: string;
  instrumentId: string;
  underlying: string;
  optionType: 'CE' | 'PE' | 'XX' | null;
  futureType: 'FUTIDX' | 'FUTSTK' | null;
  strike: string | number | null;
  expiry: Date | string | null;
  contract: string | null;
  series: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ExpiryMaster {
  id: string;
  expiryDate: Date | string;
  expiryType: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'COMMODITY';
  isWeekly: boolean;
  isMonthly: boolean;
  isQuarterly: boolean;
  isCommodity: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LotSizeMaster {
  id: string;
  instrumentId: string;
  lotSize: number;
  freezeQuantity: number;
  maximumQuantity: number;
  minimumQuantity: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TickSizeMaster {
  id: string;
  instrumentId: string;
  tickSize: string;
  pricePrecision: number;
  quantityPrecision: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SectorMaster {
  id: string;
  instrumentId: string;
  sector: string;
  industry: string;
  subIndustry: string;
  marketCapCategory: 'LARGE' | 'MID' | 'SMALL';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MarketFeed {
  id: string;
  feedStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  feedHealth: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  feedVersion: string;
  feedSource: string;
  feedQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MarketCache {
  id: string;
  cacheKey: string;
  cacheValue: any;
  expiresAt: Date | string | null;
  createdAt: Date | string;
}

export interface MarketMetadata {
  id: string;
  createdBy: string;
  updatedBy: string;
  source: string;
  version: string;
  checksum: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MarketEvent {
  id: string;
  eventType: 'ExchangeConnected' | 'ExchangeDisconnected' | 'FeedStarted' | 'FeedStopped' | 'FeedRecovered' | 'MasterUpdated' | 'InstrumentAdded' | 'InstrumentDisabled' | 'MasterRollback' | 'ProposalCreated' | 'ProposalApproved' | 'RecoveryStarted' | 'RecoveryCompleted';
  exchangeId: string | null;
  payload: any;
  createdAt: Date | string;
}

// ====================================================
// EP04.1: ENTERPRISE COMPLETION ENGINE NEW TYPES
// ====================================================

export interface MarketVersion {
  id: string;
  masterVersion: string;
  schemaVersion: string;
  dataVersion: string;
  exchangeVersion: string;
  feedVersion: string;
  rollbackPayload: string; // JSON stringified Sync package
  createdAt: Date | string;
  createdBy: string;
  checksum: string;
  versionAudit: string;
}

export interface InstrumentLifecycleHistory {
  id: string;
  instrumentId: string;
  oldState: string;
  newState: string;
  reason: string;
  operator: string;
  createdAt: Date | string;
}

export interface MasterDataProposal {
  id: string;
  status: 'DRAFT' | 'VALIDATED' | 'APPROVED' | 'SYNCHRONIZED' | 'REJECTED';
  payload: string; // JSON Sync package
  errors: string | null; // JSON list
  operator: string;
  createdAt: Date | string;
  validatedAt: Date | string | null;
  approvedAt: Date | string | null;
  synchronizedAt: Date | string | null;
  correlationId: string;
}

export interface MarketLineage {
  id: string;
  correlationId: string;
  source: string;
  importOperator: string;
  importAt: Date | string;
  validationStatus: string;
  validationAt: Date | string;
  approvalOperator: string | null;
  approvalAt: Date | string | null;
  publicationAt: Date | string | null;
  consumers: string; // JSON array of workspaces
}

export interface MarketAuditChain {
  id: string;
  entityType: string;
  action: string;
  entityId: string;
  payloadHash: string;
  previousHash: string;
  currentHash: string;
  operator: string;
  createdAt: Date | string;
}

export interface FeedQualityMetrics {
  id: string;
  exchangeId: string;
  latencyMs: number;
  packetLoss: number;
  duplicateTicks: number;
  missingTicks: number;
  feedDelayMs: number;
  feedConfidence: number;
  qualityScore: number;
  healthState: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  createdAt: Date | string;
}

export interface ConnectivityCertificate {
  id: string;
  certificateType: 'EXCHANGE_CONNECTIVITY' | 'FEED' | 'SYNCHRONIZATION' | 'INTEGRITY';
  exchangeId: string | null;
  feedUrl: string | null;
  timestamp: Date | string;
  sha256Hash: string;
  digitalSignature: string;
  verificationStatus: 'VERIFIED' | 'REVOKED' | 'EXPIRED';
}

export interface MarketRecoveryJob {
  id: string;
  failureType: 'FEED_FAILURE' | 'EXCHANGE_DISCONNECT' | 'SYNCHRONIZATION_FAILURE' | 'METADATA_CORRUPTION' | 'CACHE_FAILURE';
  recoveryAction: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RECOVERED' | 'FAILED';
  auditTrail: string; // JSON array of string steps
  certificateId: string | null;
  createdAt: Date | string;
  completedAt: Date | string | null;
}

export interface MarketDependencyRegistry {
  id: string;
  consumerWorkspace: string;
  registeredAt: Date | string;
  status: 'ACTIVE' | 'INACTIVE';
}

