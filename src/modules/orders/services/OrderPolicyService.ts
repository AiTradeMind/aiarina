import { CreateOrderPayload, UpdateOrderPayload } from "../types/index.ts";

export class OrderPolicyService {
  private MAX_QUANTITY = 1000000;
  private MIN_QUANTITY = 0.0001;
  private MAX_PRICE = 10000000;

  public validateBusinessRules(payload: CreateOrderPayload | UpdateOrderPayload): void {
    if (payload.quantity) {
      const qty = parseFloat(payload.quantity);
      if (qty > this.MAX_QUANTITY) {
        throw new Error(`Policy Violation: Quantity exceeds maximum allowed limit of ${this.MAX_QUANTITY}`);
      }
      if (qty < this.MIN_QUANTITY) {
        throw new Error(`Policy Violation: Quantity is below minimum allowed limit of ${this.MIN_QUANTITY}`);
      }
    }

    if (payload.price) {
      const price = parseFloat(payload.price);
      if (price > this.MAX_PRICE) {
        throw new Error(`Policy Violation: Price exceeds maximum allowed limit of ${this.MAX_PRICE}`);
      }
    }

    // Additional validations like trading hours can be added here
    const hour = new Date().getUTCHours();
    // Assuming trading hours are 00:00 to 23:59 (24/7 for crypto/paper trading) 
    // In a real scenario, this would check exchange hours.
  }
}

export const orderPolicyService = new OrderPolicyService();
