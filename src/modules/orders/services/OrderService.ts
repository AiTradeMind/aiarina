import { orderRepository } from "../repositories/OrderRepository.ts";
import { orderEngine } from "./OrderEngine.ts";
import { orderVersionService } from "./OrderVersionService.ts";
import { idempotencyService } from "./IdempotencyService.ts";
import { CreateOrderPayload, UpdateOrderPayload, IOrder, IOrderVersion } from "../types/index.ts";

export class OrderService {
  public async getOrders(organizationId: string, limit?: number, offset?: number): Promise<IOrder[]> {
    return await orderRepository.getOrders(organizationId, limit, offset);
  }

  public async getOrderById(id: string, organizationId: string): Promise<IOrder | null> {
    return await orderRepository.getOrderById(id, organizationId);
  }

  public async createOrder(actorId: number, payload: CreateOrderPayload, idempotencyKey?: string): Promise<IOrder> {
    if (idempotencyKey) {
      const existingReq = await idempotencyService.getExistingRequest(idempotencyKey, payload.organizationId);
      if (existingReq) {
        idempotencyService.validateHash(existingReq, payload);
        return existingReq.responseBody as IOrder;
      }
    }

    const order = await orderEngine.createOrder(actorId, payload);

    if (idempotencyKey) {
      await idempotencyService.saveResponse(idempotencyKey, payload.organizationId, payload, 201, order);
    }

    return order;
  }

  public async cancelOrder(actorId: number, id: string, organizationId: string): Promise<IOrder> {
    return await orderEngine.transitionStatus(actorId, id, organizationId, 'CANCELLED', 'User requested cancellation');
  }

  public async updateOrder(actorId: number, id: string, organizationId: string, payload: UpdateOrderPayload): Promise<IOrder> {
    return await orderEngine.updateOrder(actorId, id, organizationId, payload);
  }

  public async getOrderVersions(orderId: string, organizationId: string): Promise<IOrderVersion[]> {
    // Validate order belongs to org
    const order = await orderRepository.getOrderById(orderId, organizationId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    return await orderVersionService.getOrderVersions(orderId);
  }

  public async getOrderHistory(orderId: string, organizationId: string): Promise<any[]> {
    const order = await orderRepository.getOrderById(orderId, organizationId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    return await orderRepository.getHistory(orderId);
  }
}

export const orderService = new OrderService();
