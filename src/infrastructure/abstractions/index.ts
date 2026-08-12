/**
 * Enterprise Abstraction Interfaces for External Integrations (Real Data Foundation)
 * Provides provider-agnostic interfaces for Market Data, Brokers, AI Services, Notifications, Storage, and Configuration.
 */

// ==========================================
// 1. MARKET DATA PROVIDER ABSTRACTION
// ==========================================

export interface Candle {
  symbol: string;
  timeframe: string;
  timestamp: Date | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  lastPrice: number;
  volume24h: number;
  timestamp: Date | number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: Date | number;
}

export interface IMarketDataProvider {
  readonly providerId: string;
  readonly name: string;
  
  getQuote(symbol: string): Promise<Quote>;
  getHistoricalCandles(symbol: string, timeframe: string, start: Date, end: Date): Promise<Candle[]>;
  getOrderBook(symbol: string, depth?: number): Promise<OrderBook>;
  subscribeQuotes(symbols: string[], callback: (quote: Quote) => void): () => void;
  healthCheck(): Promise<{ isHealthy: boolean; latencyMs: number; status?: string }>;
}

// ==========================================
// 2. BROKER ADAPTER ABSTRACTION
// ==========================================

export interface BrokerAccountInfo {
  accountId: string;
  brokerId: string;
  currency: string;
  balance: number;
  availableMargin: number;
  usedMargin: number;
  unrealizedPnL: number;
}

export interface BrokerOrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  clientOrderId?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK' | 'DAY';
}

export interface BrokerOrderResult {
  orderId: string;
  clientOrderId?: string;
  symbol: string;
  status: 'PENDING' | 'ACCEPTED' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';
  filledQuantity: number;
  avgFillPrice?: number;
  createdAt: Date;
}

export interface BrokerPosition {
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

export interface IBrokerAdapter {
  readonly brokerId: string;
  readonly name: string;

  getAccountInfo(): Promise<BrokerAccountInfo>;
  placeOrder(request: BrokerOrderRequest): Promise<BrokerOrderResult>;
  cancelOrder(orderId: string, symbol: string): Promise<boolean>;
  getPositions(): Promise<BrokerPosition[]>;
  getOpenOrders(symbol?: string): Promise<BrokerOrderResult[]>;
  healthCheck(): Promise<{ isHealthy: boolean; latencyMs: number }>;
}

// ==========================================
// 3. AI GATEWAY ABSTRACTION
// ==========================================

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface AIGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  systemInstruction?: string;
}

export interface AIGenerationResult {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface IAIGatewayProvider {
  readonly providerId: string;
  
  generateCompletion(messages: AIChatMessage[], options?: AIGenerationOptions): Promise<AIGenerationResult>;
  generateStream(
    messages: AIChatMessage[], 
    onChunk: (chunk: string) => void, 
    options?: AIGenerationOptions
  ): Promise<AIGenerationResult>;
  generateEmbeddings(texts: string[], model?: string): Promise<number[][]>;
  healthCheck(): Promise<{ isHealthy: boolean; latencyMs: number }>;
}

// ==========================================
// 4. NOTIFICATION PROVIDER ABSTRACTION
// ==========================================

export interface NotificationPayload {
  recipientId: string;
  title: string;
  body: string;
  channel: 'EMAIL' | 'SMS' | 'WEBHOOK' | 'IN_APP' | 'SLACK' | 'TELEGRAM';
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  notificationId: string;
  delivered: boolean;
  sentAt: Date;
  error?: string;
}

export interface INotificationProvider {
  readonly channel: string;
  
  sendNotification(payload: NotificationPayload): Promise<NotificationResult>;
  healthCheck(): Promise<{ isHealthy: boolean }>;
}

// ==========================================
// 5. STORAGE PROVIDER ABSTRACTION
// ==========================================

export interface StorageObjectMetadata {
  key: string;
  sizeBytes: number;
  mimeType: string;
  lastModified: Date;
}

export interface IStorageProvider {
  readonly providerId: string;

  uploadObject(key: string, data: Buffer | Uint8Array | string, mimeType?: string): Promise<string>;
  downloadObject(key: string): Promise<Buffer>;
  deleteObject(key: string): Promise<boolean>;
  getObjectMetadata(key: string): Promise<StorageObjectMetadata | null>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  healthCheck(): Promise<{ isHealthy: boolean }>;
}

// ==========================================
// 6. CONFIGURATION PROVIDER ABSTRACTION
// ==========================================

export interface IConfigProvider {
  get<T = string>(key: string, defaultValue?: T): T;
  has(key: string): boolean;
  getSection<T extends object>(sectionKey: string): T;
}
