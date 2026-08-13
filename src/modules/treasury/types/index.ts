export interface TreasuryVaultSummary {
  id: string;
  tenantId: string;
  workspaceId: string;
  totalMintedAtm: number;
  reservedAtm: number;
  allocatedAtm: number;
  availableAtm: number;
  status: 'ACTIVE' | 'LOCKED' | 'STANDBY';
  healthScore: number;
  currencyCode: string;
  currencySymbol: string;
  inrConversionRate: number; // 1.0 = Fixed 1 ATM = ₹1
  dailyCapitalLimitAtm: number;
  monthlyCapitalLimitAtm: number;
  perAiLimitAtm: number;
  perPortfolioLimitAtm: number;
  emergencyStopLimitAtm: number;
  version: string;
  schemaVersion: string;
  updatedAt: string;
}

export interface TreasuryLedgerItem {
  id: string;
  entryType: 'MINT' | 'ALLOCATE' | 'RESERVE' | 'RELEASE' | 'WALLET_FUNDING';
  amountAtm: number;
  amountInrReference: number;
  balanceAfterAtm: number;
  sourceAccount: string;
  destinationAccount: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface CapitalMintItem {
  id: string;
  mintId: string;
  capitalBatchId: string;
  amountAtm: number;
  purpose: string;
  status: 'APPROVED' | 'AUTHORIZED' | 'MINTED' | 'REJECTED';
  authorizedBy: string;
  certificateHash: string;
  version: string;
  createdAt: string;
}

export interface CapitalAllocationItem {
  id: string;
  allocationId: string;
  targetType: 'AI_MODEL' | 'WALLET' | 'PORTFOLIO';
  targetId: string;
  amountAtm: number;
  allocatedBy: string;
  dailyLimitAtm?: number;
  monthlyLimitAtm?: number;
  status: 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface CapitalReservationItem {
  id: string;
  reservationId: string;
  reservationType: 'ATM' | 'MARGIN' | 'RISK_RESERVE' | 'EMERGENCY_RESERVE';
  amountAtm: number;
  reason: string;
  status: 'ACTIVE' | 'RELEASED' | 'EXPIRED';
  expiresAt?: string;
  createdAt: string;
}

export interface CapitalReleaseItem {
  id: string;
  releaseId: string;
  reservationId?: string;
  amountAtm: number;
  releaseType: 'UNUSED_FUNDS' | 'MARGIN' | 'CANCELLED_ORDER' | 'EXPIRED_RESERVATION' | 'SETTLEMENT';
  releasedBy: string;
  reason: string;
  createdAt: string;
}

export type WalletType = 
  | 'PAPER_WALLET' 
  | 'AI_WALLET' 
  | 'RESERVE_WALLET' 
  | 'MARGIN_WALLET' 
  | 'PROFIT_WALLET' 
  | 'LOSS_WALLET' 
  | 'FEE_WALLET';

export interface WalletFundingItem {
  id: string;
  fundingId: string;
  walletType: WalletType;
  walletAddress: string;
  amountAtm: number;
  fundedBy: string;
  txHash: string;
  createdAt: string;
}

export interface TreasuryEventItem {
  id: string;
  eventId: string;
  eventType: 
    | 'CapitalMinted' 
    | 'CapitalAllocated' 
    | 'CapitalReserved' 
    | 'CapitalReleased' 
    | 'WalletFunded' 
    | 'AllocationRejected' 
    | 'TreasuryLocked' 
    | 'TreasuryUnlocked';
  payload: Record<string, any>;
  publishedBy: string;
  createdAt: string;
}

export interface TreasuryAuditItem {
  id: string;
  auditId: string;
  action: string;
  actor: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface TreasuryLimitsSummary {
  minimumCapitalAtm: number;
  maximumCapitalAtm: number;
  dailyCapitalLimitAtm: number;
  weeklyCapitalLimitAtm: number;
  monthlyCapitalLimitAtm: number;
  perAiLimitAtm: number;
  perPortfolioLimitAtm: number;
  emergencyStopLimitAtm: number;
}

export interface MintCapitalRequest {
  amountAtm: number;
  purpose: string;
  authorizedBy?: string;
}

export interface AllocateCapitalRequest {
  targetType: 'AI_MODEL' | 'WALLET' | 'PORTFOLIO';
  targetId: string;
  amountAtm: number;
  allocatedBy?: string;
}

export interface ReserveCapitalRequest {
  reservationType: 'ATM' | 'MARGIN' | 'RISK_RESERVE' | 'EMERGENCY_RESERVE';
  amountAtm: number;
  reason: string;
}

export interface ReleaseCapitalRequest {
  reservationId?: string;
  amountAtm: number;
  releaseType: 'UNUSED_FUNDS' | 'MARGIN' | 'CANCELLED_ORDER' | 'EXPIRED_RESERVATION' | 'SETTLEMENT';
  reason: string;
}

export interface FundWalletRequest {
  walletType: WalletType;
  walletAddress?: string;
  amountAtm: number;
}

// ====================================================
// EP02.1: ENTERPRISE TREASURY COMPLETION ENGINE TYPES
// ====================================================

export type CapitalStage = 
  | 'CREATED'
  | 'VAULT'
  | 'ALLOCATED'
  | 'FUNDED'
  | 'RESERVED'
  | 'TRADING'
  | 'SETTLEMENT'
  | 'PROFIT_LOSS'
  | 'ACCOUNTING'
  | 'RECONCILIATION'
  | 'CLOSED'
  | 'ARCHIVE';

export type CapitalState =
  | 'CREATED'
  | 'AVAILABLE'
  | 'ALLOCATED'
  | 'RESERVED'
  | 'IN_USE'
  | 'SETTLING'
  | 'SETTLED'
  | 'RECONCILED'
  | 'CLOSED'
  | 'ARCHIVED';

export interface CapitalLifecycleHistoryStep {
  stage: CapitalStage | CapitalState;
  timestamp: string;
  actor: string;
  notes: string;
}

export interface CapitalLifecycleItem {
  id: string;
  capitalId: string;
  batchId: string;
  amountAtm: number;
  currentStage: CapitalStage | CapitalState;
  history: CapitalLifecycleHistoryStep[];
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface AiFundingPolicyItem {
  id: string;
  aiModelId: string;
  minAtm: number;
  maxAtm: number;
  dailyFundingLimitAtm: number;
  weeklyFundingLimitAtm: number;
  monthlyFundingLimitAtm: number;
  fundingFrequencyHours: number;
  requiresApproval: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaperLiveTreasurySummary {
  mode: 'PAPER' | 'LIVE';
  totalMintedAtm: number;
  reservedAtm: number;
  allocatedAtm: number;
  availableAtm: number;
  status: 'ACTIVE' | 'LOCKED' | 'STANDBY';
  updatedAt: string;
}

export interface TreasuryCertificateItem {
  id: string;
  certificateId: string;
  certType: 'MINT' | 'ALLOCATION' | 'WALLET_FUNDING' | 'RESERVATION' | 'RELEASE' | 'SETTLEMENT' | 'CLOSE';
  treasuryId: string;
  walletId?: string;
  aiModelId?: string;
  amountAtm: number;
  timestamp: string;
  sha256Hash: string;
  digitalSignature: string;
  createdAt: string;
}

export interface CapitalFlowStep {
  stage: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';
  timestamp: string;
  notes: string;
}

export interface CapitalFlowTrackItem {
  id: string;
  correlationId: string;
  amountAtm: number;
  currentStage: 'Treasury' | 'Wallet' | 'Reserve' | 'Trading' | 'Settlement' | 'Accounting' | 'Treasury Return';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  traceData: CapitalFlowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface TreasuryHealthEngineReport {
  healthScore: number;
  healthState: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  liquidityAtm: number;
  reservedCapitalAtm: number;
  allocatedCapitalAtm: number;
  availableCapitalAtm: number;
  settlementQueueCount: number;
  failedTransactionsCount: number;
  factorScores: {
    liquidityScore: number;
    reserveCoverageScore: number;
    allocationEfficiencyScore: number;
    settlementIntegrityScore: number;
  };
  checks: Record<string, boolean>;
}

export interface EmergencyActionRequest {
  action: 'FREEZE' | 'UNLOCK' | 'ALLOCATION' | 'STOP' | 'RECOVERY';
  actor?: string;
  reason?: string;
  amountAtm?: number;
  targetId?: string;
}

export interface CapitalReconciliationReport {
  id: string;
  reportId: string;
  treasuryAtm: number;
  walletAtm: number;
  accountingAtm: number;
  ledgerAtm: number;
  portfolioAtm: number;
  journalAtm: number;
  executionAtm: number;
  settlementAtm: number;
  isReconciled: boolean;
  auditSummary: string;
  mismatches: string[];
  createdAt: string;
}

export interface IndianMarketPolicyItem {
  id: string;
  segment: 'NSE_EQUITY' | 'ETF' | 'INDEX' | 'STOCK_FUTURES' | 'INDEX_FUTURES' | 'STOCK_OPTIONS' | 'INDEX_OPTIONS' | 'COMMODITY';
  segmentName: string;
  minCapitalAtm: number;
  maxCapitalAtm: number;
  reservePolicyPercent: number;
  marginPolicyPercent: number;
  settlementPolicy: 'T+1' | 'T+0';
  exposureLimitAtm: number;
  cryptoAllowed: false;
  forexAllowed: false;
  usMarketAllowed: false;
  createdAt: string;
  updatedAt: string;
}

export interface TreasuryQaReport {
  timestamp: string;
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  buildPass: boolean;
  lintPass: boolean;
  typeCheckPass: boolean;
  integrationPass: boolean;
  productionPass: boolean;
  moduleResults: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
}

export interface TradeSettlementRequest {
  tradeId?: string;
  orderId?: string;
  buyerWalletId?: string;
  sellerWalletId?: string;
  symbol: string;
  quantity: number;
  executionPrice: number;
  grossAmountAtm: number;
  feeAmountAtm?: number;
  settlementCycle?: 'T+0' | 'T+1';
  segment?: string;
  actor?: string;
}

export interface TradeSettlementItem {
  id: string;
  settlementId: string;
  tradeId: string;
  orderId: string;
  buyerWalletId: string;
  sellerWalletId: string;
  symbol: string;
  quantity: number;
  executionPrice: number;
  grossAmountAtm: number;
  netAmountAtm: number;
  feeAmountAtm: number;
  settlementCycle: 'T+0' | 'T+1';
  status: 'PENDING' | 'CLEARING' | 'SETTLED' | 'FAILED' | 'RECONCILED';
  certificateHash?: string;
  accountingJournalId?: string;
  settledAt?: string;
  createdAt: string;
}

export interface SettlementBatchItem {
  batchId: string;
  cycle: 'T+0' | 'T+1';
  totalTradesCount: number;
  totalGrossAtm: number;
  totalFeesAtm: number;
  status: 'QUEUED' | 'PROCESSING' | 'SETTLED' | 'RECONCILED';
  processedAt?: string;
  createdAt: string;
}

export interface TreasuryWalletSummaryItem {
  id: string;
  walletType: WalletType;
  walletAddress: string;
  balanceAtm: number;
  allocatedAtm: number;
  reservedAtm: number;
  status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
  vaultCategory: 'HOT_VAULT' | 'COLD_RESERVE' | 'CLEARING_ACCOUNT';
  updatedAt: string;
}

