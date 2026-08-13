import { IOrder } from "../../orders/types/index.ts";

export class ExecutionValidator {
  public validateOrderForExecution(order: IOrder): void {
    if (!order) {
      throw new Error("Order not found");
    }

    // "Execution is allowed only for VALIDATED or QUEUED orders."
    // "Never execute Cancelled, Rejected, Expired, Filled orders."
    if (order.status !== 'VALIDATED' && order.status !== 'QUEUED') {
      throw new Error(`Order ${order.id} is not eligible for execution. Current status: ${order.status}`);
    }

    if (!order.quantity || parseFloat(order.quantity) <= 0) {
      throw new Error(`Invalid order quantity: ${order.quantity}`);
    }

    // Prevent duplicate execution (in this simplified logic, if status is already beyond QUEUED, it shouldn't execute)
  }

  public validatePrice(price: number | null, orderType: string): void {
    if ((orderType === 'LIMIT' || orderType === 'STOP_LIMIT') && (price === null || price <= 0)) {
      throw new Error(`Execution rejected: No valid price provided for ${orderType} order`);
    }
  }
}

export const executionValidator = new ExecutionValidator();
