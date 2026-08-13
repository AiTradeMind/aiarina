export type OrderStatus = 'CREATED' | 'VALIDATED' | 'QUEUED' | 'EXECUTING' | 'EXECUTED' | 'PARTIALLY_FILLED' | 'REJECTED' | 'CANCELLED' | 'FAILED';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
export type TransactionSide = 'BUY' | 'SELL';
export type AccountType = 'CASH' | 'MARGIN';

export interface Account {
  id: number;
  organizationId: string;
  name: string;
  accountType: AccountType;
  isActive: boolean;
  createdAt: string;
}

export interface Portfolio {
  id: number;
  organizationId: string;
  accountId: number | null;
  name: string;
  cashBalance: string;
  buyingPower: string;
  realizedPnl: string;
  unrealizedPnl: string;
  marginEnabled: boolean;
  createdAt: string;
}

export interface Position {
  id: number;
  portfolioId: number;
  ticker: string;
  quantity: string;
  averagePrice: string;
  marketPrice: string;
  pnl: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  portfolioId: number;
  userId: number | null;
  ticker: string;
  type: OrderType;
  side: TransactionSide;
  quantity: string;
  filledQuantity: string;
  price: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: number;
  orderId: number;
  portfolioId: number;
  exchangeId: string | null;
  side: TransactionSide;
  quantity: string;
  price: string;
  commission: string;
  timestamp: string;
}

export interface Trade {
  id: number;
  portfolioId: number;
  orderId: number | null;
  ticker: string;
  side: TransactionSide;
  quantity: string;
  executionPrice: string;
  timestamp: string;
}

export interface CreateOrderRequest {
  ticker: string;
  type: OrderType;
  side: TransactionSide;
  quantity: number;
  price?: number;
}

export interface UpdateOrderRequest {
  quantity?: number;
  price?: number;
  status?: OrderStatus;
}
