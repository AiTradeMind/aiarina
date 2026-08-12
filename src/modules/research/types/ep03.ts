export interface ScannerTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'SYSTEM' | 'USER';
  config: ScannerConfig;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScannerConfig {
  instrumentType: 'EQUITY' | 'ETF' | 'INDEX' | 'FUTURES' | 'OPTIONS' | 'COMMODITY' | 'MCX';
  filters: AdvancedFilters;
}

export interface AdvancedFilters {
  marketCapMin?: number;
  marketCapMax?: number;
  sector?: string;
  industry?: string;
  exchange?: string;
  priceMin?: number;
  priceMax?: number;
  volumeMin?: number;
  volumeMax?: number;
  deliveryPercentMin?: number;
  oiMin?: number;
  oiMax?: number;
  expiry?: string;
  strikeMin?: number;
  strikeMax?: number;
  optionType?: 'CE' | 'PE' | 'ANY';
  customExpressions?: string[];
}

export interface ScannerTemplateVersion {
  id: string;
  templateId: string;
  version: string;
  config: ScannerConfig;
  changeLog: string;
  createdAt: string;
}

export interface ScannerExecutionQueueItem {
  id: string;
  templateId: string | null;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  scanType: 'PARALLEL' | 'INCREMENTAL' | 'REAL-TIME' | 'SCHEDULED' | 'MANUAL';
  params: any;
  retryCount: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScannerExecutionHistory {
  id: string;
  queueId: string | null;
  templateId: string | null;
  status: 'COMPLETED' | 'FAILED';
  executionDurationMs: number;
  matchedSymbols: string[];
  ruleVersion?: string;
  parameters: any;
  performanceMetrics: {
    cpuPercent?: number;
    memoryMb?: number;
    latencyMs?: number;
  };
  createdAt: string;
}

export interface WatchlistGroup {
  id: string;
  name: string;
  parentId: string | null;
  folder: string | null;
  isPinned: boolean;
  isShared: boolean;
  isDefault: boolean;
  isArchived: boolean;
  sortOrder: number;
  colorLabel: string | null;
  watchlistIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type AlertPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AlertRule {
  id: string;
  name: string;
  conditionExpression: AlertCondition;
  cooldownSeconds: number;
  repeatPolicy: 'ALWAYS' | 'ONCE_PER_DAY' | 'ONCE_PER_HOUR';
  expiryAt: string | null;
  priority: AlertPriority;
  status: 'ACTIVE' | 'PAUSED';
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AlertConditionOperator = 'AND' | 'OR' | 'NOT';

export interface AlertCondition {
  operator?: AlertConditionOperator;
  conditions?: AlertCondition[];
  field?: string; // e.g. price, volume, gapPercent, newsPublished, circuitHit
  operatorType?: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'CROSSES_ABOVE' | 'CROSSES_BELOW';
  value?: any;
}

export interface AlertDeliveryQueueItem {
  id: string;
  ruleId: string;
  alertPayload: {
    symbol: string;
    message: string;
    priority: AlertPriority;
    timestamp: string;
    triggeredValue?: number;
  };
  channels: string[]; // 'IN_APP', 'WEBSOCKET', 'EMAIL', 'SMS', 'WEBHOOK', 'PUSH'
  deliveryStatus: Record<string, 'PENDING' | 'SUCCESS' | 'FAILED'>;
  createdAt: string;
}

export interface AlertAcknowledgement {
  id: string;
  deliveryId: string;
  ruleId: string;
  symbol: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'ACKNOWLEDGED' | 'DISMISSED' | 'EXPIRED' | 'MUTED' | 'SNOOZED';
  snoozedUntil: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
}

export interface AlertMetricsSnapshot {
  id: string;
  totalTriggered: number;
  totalDelivered: number;
  totalFailed: number;
  latencyMsAvg: number;
  queueLength: number;
  timestamp: string;
}
