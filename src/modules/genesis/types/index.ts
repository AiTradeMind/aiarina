export interface SystemBootConfig {
  bootId: string;
  genesisSessionId: string;
  runtimeSessionId: string;
  enterpriseSessionId: string;
  correlationId: string;
  status: 'BOOTING' | 'CONFIG_VALIDATED' | 'DB_VALIDATED' | 'WORKSPACES_REGISTERED' | 'ZERO_STATE_VERIFIED' | 'SYSTEM_READY' | 'FAILED';
  configVersion: string;
  dbVersion: string;
  workspacesRegisteredCount: number;
  aiModelsRegisteredCount: number;
  walletsInitializedCount: number;
  tradingLockStatus: 'LOCKED' | 'UNLOCKED';
  bootTimestamp: string;
  timestamp: string;
  recoveryModeDetected: boolean;
}

export interface WorkspaceRegistryItem {
  workspaceId: string;
  workspaceName: string;
  responsibility: string;
  status: 'REGISTERED' | 'ACTIVE';
  isFactoryDefault: boolean;
}

export interface AIModelRegistryItem {
  modelNumber: number;
  modelId: string;
  modelName: string;
  strategyType: string;
  status: 'OFF' | 'ON';
  tradingDisabled: boolean;
  learningDisabled: boolean;
  researchDisabled: boolean;
  lifecycleState: 'IDLE' | 'ACTIVE';
  walletBalanceATM: number;
  portfolioValueATM: number;
}

export interface WalletRegistryItem {
  walletId: string;
  workspaceId: string;
  walletType: 'PAPER' | 'LIVE' | 'AI' | 'RESERVE' | 'MARGIN' | 'FEE' | 'PROFIT' | 'LOSS';
  ownerEntityId: string;
  currency: string;
  balance: number;
  reservedBalance: number;
  usedBalance: number;
  status: 'ZERO_STATE_INITIALIZED';
}

export interface ZeroStateSummary {
  systemStatus: 'ZERO_STATE_READY' | 'ACTIVE';
  tradingLockActive: boolean;
  aiActivationAllowed: boolean;
  activeAiModelsCount: number;
  totalAiModelsCount: number;
  allAiModelsStatus: 'OFF';
  totalCapitalATM: number;
  totalReservedCapitalATM: number;
  totalMarginATM: number;
  activeOrdersCount: number;
  activePositionsCount: number;
  totalTradesCount: number;
  portfolioStatus: 'EMPTY';
  exposureATM: number;
  pnlATM: number;
  researchStatus: 'EMPTY';
  memoryStatus: 'EMPTY';
  learningQueueStatus: 'EMPTY';
  evolutionQueueStatus: 'EMPTY';
  committeeQueueStatus: 'EMPTY';
  notificationsQueueStatus: 'EMPTY';
  performanceCacheStatus: 'EMPTY';
  runtimeCacheStatus: 'EMPTY';
  auditStatus: 'READY' | 'UNVERIFIED';
}

export interface GenesisBootAuditLog {
  id: string;
  genesisSessionId: string;
  bootId: string;
  workspaceCount: number;
  aiModelCount: number;
  walletCount: number;
  configVersion: string;
  schemaVersion: string;
  auditHash: string;
  timestamp: string;
}

export interface GenesisEvent {
  id: string;
  eventType: 
    | 'GenesisStarted' 
    | 'GenesisValidated' 
    | 'ZeroStateInitialized' 
    | 'WorkspaceValidated' 
    | 'AIRegistryValidated' 
    | 'WalletRegistryValidated' 
    | 'MarketStateValidated'
    | 'TradingCalendarValidated'
    | 'BusinessZeroStateVerified'
    | 'MasterRegistryValidated'
    | 'RuntimeLocked'
    | 'RecoveryEngineVerified'
    | 'StartupChecklistPassed'
    | 'TradingLocked' 
    | 'SystemReady'
    | 'WorkspaceRegistered' 
    | 'WalletInitialized' 
    | 'AIRegistered' 
    | 'GenesisCompleted';
  sourceModule: 'GENESIS_ENGINE';
  payload: Record<string, any>;
  correlationId: string;
  createdAt: string;
}

export interface MarketStateItem {
  exchangeCode: 'NSE' | 'BSE' | 'COMMODITY';
  exchangeName: string;
  exchangeStatus: 'ACTIVE' | 'INACTIVE';
  tradingSession: 'REGULAR' | 'PRE_MARKET' | 'POST_MARKET' | 'CLOSED';
  marketAvailability: 'AVAILABLE' | 'UNAVAILABLE';
  marketCalendarStatus: 'VERIFIED';
  currentState: 'PRE_OPEN' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'HOLIDAY' | 'WEEKEND' | 'MAINTENANCE';
}

export interface TradingCalendarItem {
  exchangeCode: string;
  calendarDate: string;
  isTradingDay: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isSettlementDay: boolean;
  isExpiryDay: boolean;
  isSpecialSession: boolean;
  isMaintenanceWindow: boolean;
  isEarlyClose: boolean;
  noTradingWindowActive: boolean;
  status: 'VERIFIED';
}

export interface BusinessZeroStateCheck {
  checkName: string;
  category: string;
  status: 'CONFIRMED_ZERO' | 'ACTIVE_LEAK_DETECTED';
  activeCount: number;
  verifiedAt: string;
}

export interface DependencyValidationResult {
  transitionSequence: string[];
  currentStep: 'SYSTEM_READY';
  aiActivationAllowed: boolean;
  fundAllocationAllowed: boolean;
  researchAllowed: boolean;
  tradingAllowed: boolean;
  rejectionReason?: string;
  status: 'SEQUENCE_ENFORCED';
}

export interface MasterRegistryItem {
  masterType: 
    | 'EXCHANGE_MASTER' 
    | 'INSTRUMENT_MASTER' 
    | 'INDEX_MASTER' 
    | 'SECTOR_MASTER' 
    | 'SYMBOL_MASTER' 
    | 'EXPIRY_MASTER' 
    | 'LOT_SIZE_MASTER' 
    | 'TICK_SIZE_MASTER' 
    | 'TRADING_SESSION_MASTER';
  masterName: string;
  recordCount: number;
  duplicateCount: number;
  status: 'VALIDATED';
  checksum: string;
}

export interface RuntimeLockItem {
  runtimeName: string;
  runtimeType: string;
  lockStatus: 'LOCKED' | 'UNLOCKED';
  lockedBy: string;
}

export interface RecoveryStatusSummary {
  bootId: string;
  recoveryMode: 'STANDBY' | 'BOOT_RECOVERY' | 'SAFE_MODE' | 'ROLLBACK';
  safeModeActive: boolean;
  rollbackSupported: boolean;
  configRecoveryStatus: 'VERIFIED';
  workspaceRecoveryStatus: 'VERIFIED';
  databaseRecoveryStatus: 'VERIFIED';
  auditTrailStatus: 'HEALTHY';
}

export interface StartupChecklistItem {
  checkName: string;
  category: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export interface BootPerformanceMetricsItem {
  bootId: string;
  bootDurationMs: number;
  genesisDurationMs: number;
  validationDurationMs: number;
  runtimeInitDurationMs: number;
  systemStartupDurationMs: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  activeServicesCount: number;
  totalServicesCount: number;
  genesisHealthScore: number;
  startupCertificateHash: string;
  certificateStatus: 'GENESIS CERTIFIED';
  createdAt: string;
}

export interface GenesisVersionHistoryItem {
  id: string;
  version: string;
  eventCategory: 'GENESIS_VERSION' | 'BOOT' | 'UPGRADE' | 'RESTART';
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface GenesisQASummary {

  bootSessionCount: number;
  genesisSessionCount: number;
  workspaceCount: number;
  marketExchangeCount: number;
  tradingCalendarStatus: 'VERIFIED';
  masterRegistryCount: number;
  aiModelCount: number;
  walletCount: number;
  businessZeroStateChecksCount: number;
  runtimeLocksCount: number;
  startupChecklistPassedCount: number;
  recoveryStatus: 'VERIFIED';
  systemReadyStatus: 'SYSTEM_READY';
  noActiveTrading: boolean;
  noActiveResearch: boolean;
  noActiveStrategy: boolean;
  noActiveLearning: boolean;
  noActiveEvolution: boolean;
  noActiveCommittee: boolean;
  noActiveRuntimeJobs: boolean;
  qaPassStatus: 'PASSED';
}

