import { randomUUID } from "crypto";
import { orderRepository } from "../repositories/OrderRepository.ts";
import { orderValidator } from "./OrderValidator.ts";
import { orderStateMachine } from "./OrderStateMachine.ts";
import { orderPolicyService } from "./OrderPolicyService.ts";
import { orderVersionService } from "./OrderVersionService.ts";
import { orderMetricsService } from "./OrderMetricsService.ts";
import { CreateOrderPayload, UpdateOrderPayload, IOrder, EnterpriseOrderStatus } from "../types/index.ts";
import { auditEngine } from "../../audit/services/AuditEngine.ts";
import { eventService } from "../../notifications/services/EventService.ts";

export class OrderEngine {
  public async createOrder(actorId: number, payload: CreateOrderPayload): Promise<IOrder> {
    try {
      orderValidator.validateCreatePayload(payload);
      orderPolicyService.validateBusinessRules(payload);
    } catch (e) {
      await orderMetricsService.recordEvent(payload.organizationId, 'validationFailures');
      throw e;
    }

    // Check for duplicate client order id
    const existing = await orderRepository.getOrderByClientId(payload.clientOrderId, payload.organizationId);
    if (existing) {
      await orderMetricsService.recordEvent(payload.organizationId, 'duplicateRequests');
      throw new Error(`Duplicate clientOrderId: ${payload.clientOrderId}`);
    }

    const orderId = `ord_${randomUUID().replace(/-/g, "")}`;
    const newOrderData: Partial<IOrder> = {
      id: orderId,
      ...payload,
      filledQuantity: "0",
      status: "CREATED",
      version: 1,
      createdBy: actorId,
    };

    const order = await orderRepository.createOrder(newOrderData);

    const volume = parseFloat(payload.quantity) * (parseFloat(payload.price || "0") || 1);
    await orderMetricsService.recordEvent(order.organizationId, 'totalOrders', volume);
    await orderMetricsService.recordEvent(order.organizationId, 'createdOrders', volume);

    await orderRepository.addHistory({
      orderId: order.id,
      status: "CREATED",
      version: 1,
      changedBy: actorId,
      details: { payload }
    });

    // Create initial version snapshot
    await orderVersionService.createVersion(order, "Order Created", actorId);

    await auditEngine.logEvent({
      organizationId: order.organizationId,
      workspaceId: order.workspaceId || undefined,
      actorId,
      action: "ORDER_CREATED",
      sourceModule: "ORDER_MANAGEMENT",
      resourceType: "ORDER",
      resourceId: order.id,
      correlationId: payload.correlationId,
      severity: "INFO",
      details: { clientOrderId: order.clientOrderId, symbol: order.symbol, side: order.side }
    });

    await eventService.publishEvent({
      type: "ORDER_CREATED",
      category: "AUDIT",
      actorId,
      workspaceId: order.workspaceId || undefined,
      organizationId: order.organizationId,
      data: { orderId: order.id, symbol: order.symbol, side: order.side }
    });

    return order;
  }

  public async transitionStatus(actorId: number, orderId: string, organizationId: string, newStatus: EnterpriseOrderStatus, reason?: string): Promise<IOrder> {
    const order = await orderRepository.getOrderById(orderId, organizationId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    try {
      orderStateMachine.validateTransition(order.status, newStatus);
    } catch (e) {
      await orderMetricsService.recordEvent(organizationId, 'validationFailures');
      throw e;
    }

    const newVersion = order.version + 1;
    const updatedOrder = await orderRepository.updateOrder(orderId, {
      status: newStatus,
      version: newVersion,
    });

    if (!updatedOrder) {
      throw new Error("Failed to update order status");
    }

    if (newStatus === 'FILLED') await orderMetricsService.recordEvent(organizationId, 'filledOrders');
    if (newStatus === 'CANCELLED') await orderMetricsService.recordEvent(organizationId, 'cancelledOrders');
    if (newStatus === 'REJECTED') await orderMetricsService.recordEvent(organizationId, 'rejectedOrders');
    if (newStatus === 'EXPIRED') await orderMetricsService.recordEvent(organizationId, 'expiredOrders');

    await orderRepository.addHistory({
      orderId: updatedOrder.id,
      status: newStatus,
      version: newVersion,
      changedBy: actorId,
      details: { reason, previousStatus: order.status }
    });

    await orderVersionService.createVersion(updatedOrder, reason || `Status changed to ${newStatus}`, actorId, order.version);

    await auditEngine.logEvent({
      organizationId: updatedOrder.organizationId,
      workspaceId: updatedOrder.workspaceId || undefined,
      actorId,
      action: `ORDER_STATUS_CHANGED`,
      sourceModule: "ORDER_MANAGEMENT",
      resourceType: "ORDER",
      resourceId: updatedOrder.id,
      correlationId: updatedOrder.correlationId || undefined,
      severity: "INFO",
      details: { oldStatus: order.status, newStatus, reason }
    });

    await eventService.publishEvent({
      type: "ORDER_STATUS_CHANGED",
      category: "AUDIT",
      actorId,
      workspaceId: updatedOrder.workspaceId || undefined,
      organizationId: updatedOrder.organizationId,
      data: { orderId: updatedOrder.id, status: newStatus, symbol: updatedOrder.symbol }
    });

    return updatedOrder;
  }

  public async updateOrder(actorId: number, orderId: string, organizationId: string, payload: UpdateOrderPayload): Promise<IOrder> {
    try {
      orderValidator.validateUpdatePayload(payload);
      orderPolicyService.validateBusinessRules(payload);
    } catch (e) {
      await orderMetricsService.recordEvent(organizationId, 'validationFailures');
      throw e;
    }
    
    const order = await orderRepository.getOrderById(orderId, organizationId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    if (['FILLED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(order.status)) {
      throw new Error(`Cannot update order in terminal state: ${order.status}`);
    }

    const newVersion = order.version + 1;
    const updatedOrder = await orderRepository.updateOrder(orderId, {
      ...payload,
      version: newVersion,
    });

    if (!updatedOrder) {
      throw new Error("Failed to update order");
    }

    await orderMetricsService.recordEvent(organizationId, 'modifiedOrders');

    await orderRepository.addHistory({
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      version: newVersion,
      changedBy: actorId,
      details: { payload }
    });

    await orderVersionService.createVersion(updatedOrder, "Order properties modified", actorId, order.version);

    await auditEngine.logEvent({
      organizationId: updatedOrder.organizationId,
      workspaceId: updatedOrder.workspaceId || undefined,
      actorId,
      action: "ORDER_UPDATED",
      sourceModule: "ORDER_MANAGEMENT",
      resourceType: "ORDER",
      resourceId: updatedOrder.id,
      correlationId: updatedOrder.correlationId || undefined,
      severity: "INFO",
      details: { updates: payload }
    });

    return updatedOrder;
  }

  public async expireOrder(actorId: number, orderId: string, organizationId: string, reason?: string): Promise<IOrder> {
    return this.transitionStatus(actorId, orderId, organizationId, 'EXPIRED', reason || 'Order expired by system');
  }

  public async rejectOrder(actorId: number, orderId: string, organizationId: string, reason?: string): Promise<IOrder> {
    return this.transitionStatus(actorId, orderId, organizationId, 'REJECTED', reason || 'Order rejected');
  }
}

export const orderEngine = new OrderEngine();
