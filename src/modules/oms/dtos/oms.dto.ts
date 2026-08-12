import { OrderType, OrderSide, OrderStatus } from "../constants/index.ts";
import { CreateOrderRequest } from "../types/index.ts";

export class CreateOrderDTO {
  decisionId!: string;
  strategyId?: string;
  riskAssessmentId?: string;
  fundId?: string;
  walletId?: string;
  symbol!: string;
  instrument?: string;
  market?: string;
  exchange?: string;
  side!: OrderSide;
  orderType!: OrderType;
  quantity!: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: string;
  priority?: number;
  metadata?: Record<string, any>;

  static validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.decisionId || typeof data.decisionId !== 'string') {
      errors.push("decisionId is required and must be a string");
    }

    if (!data.symbol || typeof data.symbol !== 'string') {
      errors.push("symbol is required and must be a string");
    }

    if (!data.side || !['BUY', 'SELL', 'EXIT', 'REDUCE', 'INCREASE'].includes(data.side)) {
      errors.push("side must be one of BUY, SELL, EXIT, REDUCE, INCREASE");
    }

    if (!data.orderType || !['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAILING_STOP', 'BRACKET', 'OCO', 'ICEBERG', 'CUSTOM'].includes(data.orderType)) {
      errors.push("orderType must be one of MARKET, LIMIT, STOP, STOP_LIMIT, TRAILING_STOP, BRACKET, OCO, ICEBERG, CUSTOM");
    }

    if (typeof data.quantity !== 'number' || data.quantity <= 0 || isNaN(data.quantity)) {
      errors.push("quantity must be a positive number");
    }

    if (['LIMIT', 'STOP_LIMIT'].includes(data.orderType) && (data.price === undefined || data.price <= 0)) {
      errors.push(`price is required for ${data.orderType} orders and must be > 0`);
    }

    if (['STOP', 'STOP_LIMIT', 'TRAILING_STOP'].includes(data.orderType) && (data.stopPrice === undefined || data.stopPrice <= 0)) {
      errors.push(`stopPrice is required for ${data.orderType} orders and must be > 0`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export class CancelOrderDTO {
  orderId!: string;
  reason?: string;

  static validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.orderId || (typeof data.orderId !== 'string' && typeof data.orderId !== 'number')) {
      errors.push("orderId is required");
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export class RetryOrderDTO {
  orderId!: string;

  static validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.orderId || (typeof data.orderId !== 'string' && typeof data.orderId !== 'number')) {
      errors.push("orderId is required");
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
