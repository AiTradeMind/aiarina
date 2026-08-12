export type OrderSide = 'BUY' | 'SELL';
export type EnterpriseOrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
export type EnterpriseOrderStatus = 'CREATED' | 'VALIDATED' | 'QUEUED' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';

export interface IOrder {
  id: string;
  clientOrderId: string;
  organizationId: string;
  workspaceId: string | null;
  aiModelId: string | null;
  strategyId: string | null;
  symbol: string;
  exchange: string;
  side: OrderSide;
  orderType: EnterpriseOrderType;
  quantity: string;
  filledQuantity: string;
  price: string | null;
  triggerPrice: string | null;
  status: EnterpriseOrderStatus;
  version: number;
  correlationId: string | null;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderHistory {
  id: number;
  orderId: string;
  status: EnterpriseOrderStatus;
  version: number;
  details: Record<string, any>;
  changedBy: number | null;
  createdAt: Date;
}

export interface CreateOrderPayload {
  clientOrderId: string;
  organizationId: string;
  workspaceId?: string;
  aiModelId?: string;
  strategyId?: string;
  symbol: string;
  exchange: string;
  side: OrderSide;
  orderType: EnterpriseOrderType;
  quantity: string; // use string for decimal
  price?: string;
  triggerPrice?: string;
  correlationId?: string;
}

export interface UpdateOrderPayload {
  quantity?: string;
  price?: string;
  triggerPrice?: string;
}

export interface IOrderVersion {
  id: number;
  orderId: string;
  versionNumber: number;
  previousVersionId: number | null;
  changeReason: string | null;
  changedBy: number | null;
  changedAt: Date;
  orderSnapshot: Record<string, any>;
}

export interface IOrderIdempotency {
  idempotencyKey: string;
  organizationId: string;
  requestHash: string;
  responseStatus: number;
  responseBody: Record<string, any>;
  createdAt: Date;
}
