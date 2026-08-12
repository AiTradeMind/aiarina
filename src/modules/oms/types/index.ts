import { OrderType, OrderSide, OrderStatus, OMSPipelineStage } from "../constants/index.ts";

export type { OrderType, OrderSide, OrderStatus, OMSPipelineStage };

// Legacy & compatibility types
export interface OrderDecisionPackage {
  decisionId: string;
  ticker: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  price?: number;
  portfolioId: number;
  aiModel?: string;
  strategyId?: string;
  committeeApproved: boolean;
  paperTradingEnabled: boolean;
  marketOpen: boolean;
  treasuryReady: boolean;
}

export type OrderState = 'CREATED' | 'VALIDATED' | 'QUEUED' | 'WAITING' | 'ROUTED' | 'FILLED' | 'PARTIAL' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
export type OrderBookState = 'PENDING' | 'QUEUED' | 'WORKING' | 'FILLED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';

// Phase 2.10 Enterprise OMS Types
export interface OMSOrder {
  id?: number;
  orderId: string;
  decisionId: string;
  strategyId: string;
  riskAssessmentId: string;
  fundId: string;
  walletId: string;
  symbol: string;
  instrument: string;
  market: string;
  exchange: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price: number | null;
  stopPrice: number | null;
  timeInForce: string;
  priority: number;
  status: OrderStatus;
  filledQuantity: number;
  averageFillPrice: number | null;
  failureReason: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  orderId?: string;
  decisionId: string;
  strategyId?: string;
  riskAssessmentId?: string;
  fundId?: string;
  walletId?: string;
  symbol: string;
  instrument?: string;
  market?: string;
  exchange?: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: string;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface OMSPipelineStageLog {
  stage: OMSPipelineStage;
  timestamp: string;
  passed: boolean;
  message?: string;
  data?: any;
}

export interface OMSPipelineResult {
  orderId: string | null;
  decisionId: string;
  approved: boolean;
  status: OrderStatus;
  reasons: string[];
  stageLogs: OMSPipelineStageLog[];
  order?: OMSOrder;
}

export interface OMSOrderHistoryRecord {
  id?: number;
  historyId: string;
  orderId: string;
  status: OrderStatus;
  action: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface OMSExecutionQueueItem {
  id?: number;
  queueId: string;
  orderId: string;
  priority: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  queuedAt: string;
  processedAt?: string | null;
}

export interface OMSOrderMetadataRecord {
  id?: number;
  orderId: string;
  clientTag?: string | null;
  executionVenue?: string | null;
  algoStrategy?: string | null;
  tags: string[];
  customRules: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface OMSOrderEventRecord {
  id?: number;
  eventId: string;
  orderId: string;
  eventType: string;
  payload: Record<string, any>;
  timestamp: string;
}

export interface OMSStateTransitionRecord {
  id?: number;
  transitionId: string;
  orderId: string;
  fromState: OrderStatus | null;
  toState: OrderStatus;
  reason?: string | null;
  passed: boolean;
  timestamp: string;
}

export interface OMSHealthReport {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  activeOrdersCount: number;
  queuedOrdersCount: number;
  completedOrdersCount: number;
  rejectedOrdersCount: number;
  systemStance: string;
  timestamp: string;
}
