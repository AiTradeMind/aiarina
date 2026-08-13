import { OrderStatus, OrderType, TransactionSide } from "../../trading/types/index.ts";

export interface PaperAccount {
  id: number;
  organizationId: string;
  balance: string;
  initialBalance: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaperOrder {
  id: number;
  organizationId: string;
  userId: number;
  ticker: string;
  type: OrderType;
  side: TransactionSide;
  quantity: string;
  price: string | null;
  status: OrderStatus;
  labId?: string;
  createdAt: string;
  updatedAt: string;
  stopLoss?: string;
  target?: string;
}

export interface PaperPosition {
  id: number;
  organizationId: string;
  ticker: string;
  quantity: string;
  averagePrice: string;
  updatedAt: string;
}

export interface PaperTrade {
  id: number;
  orderId: number;
  organizationId: string;
  ticker: string;
  side: TransactionSide;
  quantity: string;
  executionPrice: string;
  timestamp: string;
}

export interface PaperJournalEntry {
  id: number;
  organizationId: string;
  tradeId: number | null;
  entryType: 'TRADE' | 'DEPOSIT' | 'WITHDRAWAL';
  notes: string | null;
  pnl: string | null;
  timestamp: string;
}

export interface PaperOrderDetail {
  id: number;
  orderId: number;
  stopLoss: string;
  target: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaperOrderRequest {
  ticker: string;
  side: TransactionSide;
  quantity: number;
  type: OrderType;
  price?: number;
  stopLoss: number;
  target: number;
  labId?: string;
}
