import { CreateOrderPayload, UpdateOrderPayload } from "../types/index.ts";

export class OrderValidator {
  public validateCreatePayload(payload: CreateOrderPayload): void {
    if (!payload.organizationId) {
      throw new Error("Validation Error: organizationId is required");
    }
    if (!payload.clientOrderId) {
      throw new Error("Validation Error: clientOrderId is required");
    }
    if (!payload.symbol) {
      throw new Error("Validation Error: symbol is required");
    }
    if (!payload.exchange) {
      throw new Error("Validation Error: exchange is required");
    }
    if (!['BUY', 'SELL'].includes(payload.side)) {
      throw new Error(`Validation Error: invalid side '${payload.side}'`);
    }
    if (!['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'].includes(payload.orderType)) {
      throw new Error(`Validation Error: invalid orderType '${payload.orderType}'`);
    }
    
    const qty = parseFloat(payload.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error("Validation Error: quantity must be a positive number");
    }

    if (['LIMIT', 'STOP_LIMIT'].includes(payload.orderType)) {
      if (!payload.price) {
        throw new Error(`Validation Error: price is required for orderType ${payload.orderType}`);
      }
      const p = parseFloat(payload.price);
      if (isNaN(p) || p <= 0) {
        throw new Error("Validation Error: price must be a positive number");
      }
    }

    if (['STOP', 'STOP_LIMIT'].includes(payload.orderType)) {
      if (!payload.triggerPrice) {
        throw new Error(`Validation Error: triggerPrice is required for orderType ${payload.orderType}`);
      }
      const tp = parseFloat(payload.triggerPrice);
      if (isNaN(tp) || tp <= 0) {
        throw new Error("Validation Error: triggerPrice must be a positive number");
      }
    }
  }

  public validateUpdatePayload(payload: UpdateOrderPayload): void {
    if (payload.quantity !== undefined) {
      const qty = parseFloat(payload.quantity);
      if (isNaN(qty) || qty <= 0) {
        throw new Error("Validation Error: quantity must be a positive number");
      }
    }
    if (payload.price !== undefined) {
      const p = parseFloat(payload.price);
      if (isNaN(p) || p <= 0) {
        throw new Error("Validation Error: price must be a positive number");
      }
    }
    if (payload.triggerPrice !== undefined) {
      const tp = parseFloat(payload.triggerPrice);
      if (isNaN(tp) || tp <= 0) {
        throw new Error("Validation Error: triggerPrice must be a positive number");
      }
    }
  }
}

export const orderValidator = new OrderValidator();
