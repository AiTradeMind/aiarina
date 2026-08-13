/**
 * UNIFIED BROKER ADAPTER LAYER - TYPE DEFINITIONS
 * Strict Broker-Agnostic Interface Definitions for Indian & Global Stock Brokers
 * Brokers supported: Dhan, Angel One, Zerodha, Upstox, Fyers, Paper Engine
 */

export type BrokerId = 'dhan' | 'angelone' | 'zerodha' | 'upstox' | 'fyers' | 'paper';

export type ProductType = 'INTRADAY' | 'DELIVERY' | 'MARGIN' | 'BRACKET' | 'COVER' | 'AMO';
export type NormalizedOrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LOSS_MARKET' | 'BRACKET' | 'COVER';
export type NormalizedSide = 'BUY' | 'SELL';
export type ExchangeSegment = 'NSE_EQ' | 'NSE_FO' | 'NSE_CD' | 'BSE_EQ' | 'BSE_FO' | 'MCX_COMM';
export type NormalizedOrderStatus = 'PENDING' | 'VALIDATED' | 'OPEN' | 'EXECUTED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED' | 'FAILED';

export interface BrokerCredentials {
  brokerId: BrokerId;
  clientId: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  totpSeed?: string;
  pin?: string;
  sandbox?: boolean;
}

export interface BrokerCapabilities {
  supportsBracketOrder: boolean;
  supportsCoverOrder: boolean;
  supportsAMO: boolean;
  supportsGTT: boolean;
  supportsOptionsChain: boolean;
  supportsWebSockets: boolean;
  maxOrdersPerSecond: number;
  avgLatencyMs: number;
  supportedSegments: ExchangeSegment[];
}

export interface BrokerHealthStatus {
  brokerId: BrokerId;
  brokerName: string;
  connected: boolean;
  apiLatencyMs: number;
  rateLimitRemaining: number;
  rateLimitTotal: number;
  lastHeartbeat: string;
  status: 'OPTIMAL' | 'DEGRADED' | 'DISCONNECTED' | 'MAINTENANCE';
  errorDetails?: string;
}

export interface NormalizedOrderRequest {
  clientOrderId: string;
  symbol: string;
  exchange: ExchangeSegment;
  side: NormalizedSide;
  orderType: NormalizedOrderType;
  productType: ProductType;
  quantity: number;
  price?: number;
  triggerPrice?: number;
  stopLossPrice?: number;
  targetPrice?: number;
  trailingStopLoss?: number;
  validity?: 'DAY' | 'IOC' | 'GTT';
  disclosedQuantity?: number;
  tag?: string;
}

export interface NormalizedOrderResult {
  success: boolean;
  brokerOrderId?: string;
  clientOrderId: string;
  brokerId: BrokerId;
  status: NormalizedOrderStatus;
  message: string;
  executedPrice?: number;
  filledQuantity?: number;
  remainingQuantity?: number;
  timestamp: string;
  rawVendorResponse?: any;
  vendorPayloadSent?: any;
  executionLatencyMs?: number;
  slippageBps?: number;
  fillQualityScore?: number;
}

export interface NormalizedModifyRequest {
  brokerOrderId: string;
  quantity?: number;
  price?: number;
  triggerPrice?: number;
  orderType?: NormalizedOrderType;
}

export interface NormalizedPosition {
  id: string;
  brokerId: BrokerId;
  symbol: string;
  exchange: ExchangeSegment;
  productType: ProductType;
  quantity: number;
  buyQuantity: number;
  sellQuantity: number;
  buyAvgPrice: number;
  sellAvgPrice: number;
  currentPrice: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
}

export interface NormalizedOrder {
  brokerOrderId: string;
  clientOrderId: string;
  brokerId: BrokerId;
  symbol: string;
  exchange: ExchangeSegment;
  side: NormalizedSide;
  orderType: NormalizedOrderType;
  productType: ProductType;
  quantity: number;
  filledQuantity: number;
  price: number;
  triggerPrice?: number;
  averagePrice?: number;
  status: NormalizedOrderStatus;
  rejectionReason?: string;
  orderTimestamp: string;
}

export interface NormalizedHolding {
  symbol: string;
  exchange: ExchangeSegment;
  isin: string;
  quantity: number;
  t1Quantity: number;
  realisedQuantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
}

export interface NormalizedFunds {
  brokerId: BrokerId;
  availableCash: number;
  usedMargin: number;
  totalCollateral: number;
  payinAmount: number;
  realizedPnl: number;
  unrealizedPnl: number;
  buyingPower: number;
}

export interface PayloadTranslationResult {
  brokerId: BrokerId;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  translationNotes: string[];
}

/**
 * UNIFIED BROKER ADAPTER CONTRACT
 * All brokers MUST implement this contract. Execution Engine relies strictly on this interface.
 */
export interface IBrokerAdapter {
  readonly brokerId: BrokerId;
  readonly brokerName: string;

  getCapabilities(): BrokerCapabilities;
  healthCheck(): Promise<BrokerHealthStatus>;
  
  authenticate(credentials: BrokerCredentials): Promise<{ success: boolean; message: string; accessToken?: string }>;
  
  placeOrder(order: NormalizedOrderRequest): Promise<NormalizedOrderResult>;
  cancelOrder(brokerOrderId: string, symbol?: string): Promise<NormalizedOrderResult>;
  modifyOrder(request: NormalizedModifyRequest): Promise<NormalizedOrderResult>;
  
  getPositions(): Promise<NormalizedPosition[]>;
  getOrders(): Promise<NormalizedOrder[]>;
  getHoldings(): Promise<NormalizedHolding[]>;
  getFunds(): Promise<NormalizedFunds>;
  
  translatePayload(order: NormalizedOrderRequest): PayloadTranslationResult;
}
