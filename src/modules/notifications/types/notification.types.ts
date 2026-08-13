export type NotificationChannel = 'TELEGRAM' | 'EMAIL' | 'WHATSAPP' | 'PUSH';

export type NotificationType = 'TRADE_ALERT' | 'DAILY_SUMMARY' | 'TEST_NOTIFICATION';

export type QueueState = 'Pending' | 'Processing' | 'Delivered' | 'Failed' | 'Retry';

export type TradeStatus = 'BUY' | 'SELL' | 'EXIT' | 'REJECTED';

export type MarketType = 'Equity' | 'ETF' | 'Index' | 'Futures' | 'Options' | 'Commodity';

export type ExchangeType = 'NSE' | 'BSE' | 'COMMODITY';

export interface TradeAlertPayload {
  tradeId: string;
  status: TradeStatus;
  marketType: MarketType;
  exchange: ExchangeType;
  instrumentName: string;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  currentPnl?: number;
  finalPnl?: number;
  tradeTime: string;
}

export interface DailySummaryPayload {
  date: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  openingCapital: number;
  closingCapital: number;
  marketBreakdown: {
    equity: number;
    etf: number;
    index: number;
    futures: number;
    options: number;
    commodity: number;
  };
  tradingStatus: string;
}

export interface NotificationSettings {
  // Canonical fields
  globalSystemNotifications: boolean;
  orderExecutionAlerts: boolean;
  telegramGatewayEnabled: boolean;
  telegramBotToken: string;
  telegramTargetChatId: string;
  tradeAlertsEnabled: boolean;
  dailyTradingSummaryEnabled: boolean;
  muteHoursEnabled: boolean;
  muteHoursStart: string;
  muteHoursEnd: string;

  // Additional status & verification metadata
  maskedBotToken: string;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'VERIFYING' | 'ERROR' | 'NOT_CONFIGURED' | 'INVALID_TOKEN';
  botName?: string;
  botId?: string;
  lastVerified?: string;
  lastDelivery?: string;
  deliveredToday: number;
  failedToday: number;

  // Frontend aliases (for backward compatibility)
  telegramEnabled?: boolean;
  botToken?: string;
  chatId?: string;
  tradingAlertsEnabled?: boolean;
  dailySummaryEnabled?: boolean;
  notificationsEnabled?: boolean;
  notificationsOrderAlerts?: boolean;
  muteHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationQueueItem {
  id: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  tradeId?: string;
  payload: TradeAlertPayload | DailySummaryPayload | { message: string };
  formattedText: string;
  sanitizedFields: string[];
  state: QueueState;
  retryCount: number;
  maxRetries: number;
  createdTime: string;
  scheduledTime: string;
  deliveredTime?: string;
  telegramMessageId?: number;
  telegramResponse?: string;
  httpStatusCode?: number;
  latencyMs?: number;
  errorMessage?: string;
}

export interface NotificationAuditLog {
  id: string;
  notificationId: string;
  tradeId?: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  createdTime: string;
  deliveredTime?: string;
  retryCount: number;
  telegramResponse: string;
  deliveryStatus: QueueState;
  latencyMs: number;
}

export interface NotificationHealthMetrics {
  telegramStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'NOT_CONFIGURED' | 'INVALID_TOKEN';
  queueSize: number;
  pendingCount: number;
  deliveredToday: number;
  failedToday: number;
  avgDeliveryTimeMs: number;
  retryQueueSize: number;
}
