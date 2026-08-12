import { getDb } from "../../../db/client.ts";
import {
  omsOrders,
  omsOrderHistory,
  omsExecutionQueue,
  omsOrderMetadata,
  omsFoundationOrderEvents,
  omsStateTransitions,
  orders, // legacy compatibility
} from "../../../db/schema.ts";
import { eq, desc, and, count, inArray } from "drizzle-orm";
import {
  OMSOrder,
  OrderStatus,
  OMSOrderHistoryRecord,
  OMSExecutionQueueItem,
  OMSOrderMetadataRecord,
  OMSOrderEventRecord,
  OMSStateTransitionRecord,
} from "../types/index.ts";
import { OrderStateMachine } from "../state-machine/order-state-machine.ts";
import crypto from "crypto";

export class OMSRepository {
  /**
   * Save a new order record into oms_orders and initial history/state transition.
   */
  async createOrder(orderData: OMSOrder): Promise<OMSOrder> {
    const db = getDb();
    const now = new Date();

    return await db.transaction(async (tx) => {
      // 1. Insert into omsOrders
      const [inserted] = await tx
        .insert(omsOrders)
        .values({
          orderId: orderData.orderId,
          decisionId: orderData.decisionId,
          strategyId: orderData.strategyId || "DEFAULT",
          riskAssessmentId: orderData.riskAssessmentId || "DEFAULT",
          fundId: orderData.fundId || "DEFAULT",
          walletId: orderData.walletId || "DEFAULT",
          symbol: orderData.symbol,
          instrument: orderData.instrument || "EQUITY",
          market: orderData.market || "SPOT",
          exchange: orderData.exchange || "NSE",
          side: orderData.side,
          orderType: orderData.orderType,
          quantity: orderData.quantity,
          price: orderData.price !== undefined ? orderData.price : null,
          stopPrice: orderData.stopPrice !== undefined ? orderData.stopPrice : null,
          timeInForce: orderData.timeInForce || "DAY",
          priority: orderData.priority || 1,
          status: orderData.status || "CREATED",
          filledQuantity: orderData.filledQuantity || 0.0,
          averageFillPrice: orderData.averageFillPrice !== undefined ? orderData.averageFillPrice : null,
          failureReason: orderData.failureReason || null,
          metadata: orderData.metadata || {},
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // Also support legacy orders table for backward compatibility if needed
      try {
        await tx.insert(orders).values({
          ticker: orderData.symbol,
          type: orderData.orderType as any,
          side: orderData.side as any,
          quantity: orderData.quantity.toString(),
          price: orderData.price ? orderData.price.toString() : null,
          status: orderData.status as any,
          createdAt: now,
          updatedAt: now,
        });
      } catch (err) {
        // Ignore legacy insertion error if table/schema differs
      }

      // 2. Initial state transition
      const transitionId = `TRN-${crypto.randomUUID()}`;
      await tx.insert(omsStateTransitions).values({
        transitionId,
        orderId: orderData.orderId,
        fromState: null,
        toState: orderData.status || "CREATED",
        reason: "Initial order creation",
        passed: true,
        timestamp: now,
      });

      // 3. Initial order history
      const historyId = `HST-${crypto.randomUUID()}`;
      await tx.insert(omsOrderHistory).values({
        historyId,
        orderId: orderData.orderId,
        status: orderData.status || "CREATED",
        action: "ORDER_CREATED",
        details: { initialStatus: orderData.status || "CREATED", symbol: orderData.symbol },
        createdAt: now,
      });

      // 4. Initial event log
      const eventId = `EVT-${crypto.randomUUID()}`;
      await tx.insert(omsFoundationOrderEvents).values({
        eventId,
        orderId: orderData.orderId,
        eventType: "ORDER_CREATED",
        payload: { orderId: orderData.orderId, side: orderData.side, quantity: orderData.quantity },
        timestamp: now,
      });

      return {
        ...inserted,
        side: inserted.side as any,
        orderType: inserted.orderType as any,
        status: inserted.status as any,
        createdAt: inserted.createdAt.toISOString(),
        updatedAt: inserted.updatedAt.toISOString(),
      };
    });
  }

  /**
   * Find an order by orderId.
   */
  async getOrderById(orderId: string): Promise<OMSOrder | null> {
    const db = getDb();
    const results = await db
      .select()
      .from(omsOrders)
      .where(eq(omsOrders.orderId, orderId))
      .limit(1);

    if (!results || results.length === 0) return null;

    const row = results[0];
    return {
      ...row,
      side: row.side as any,
      orderType: row.orderType as any,
      status: row.status as any,
      strategyId: row.strategyId || "",
      riskAssessmentId: row.riskAssessmentId || "",
      fundId: row.fundId || "",
      walletId: row.walletId || "",
      metadata: (row.metadata as Record<string, any>) || {},
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * List orders with optional filters.
   */
  async getOrders(limit = 100, status?: OrderStatus): Promise<OMSOrder[]> {
    const db = getDb();
    let query = db.select().from(omsOrders);

    if (status) {
      query = query.where(eq(omsOrders.status, status)) as any;
    }

    const rows = await query.orderBy(desc(omsOrders.createdAt)).limit(limit);

    return rows.map((row) => ({
      ...row,
      side: row.side as any,
      orderType: row.orderType as any,
      status: row.status as any,
      strategyId: row.strategyId || "",
      riskAssessmentId: row.riskAssessmentId || "",
      fundId: row.fundId || "",
      walletId: row.walletId || "",
      metadata: (row.metadata as Record<string, any>) || {},
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  /**
   * Update order status following state machine rules.
   */
  async updateOrderStatus(
    orderId: string,
    targetStatus: OrderStatus,
    reason?: string,
    additionalData?: Partial<OMSOrder>
  ): Promise<OMSOrder> {
    const db = getDb();
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order not found for orderId '${orderId}'`);
    }

    const currentStatus = order.status;

    // Enforce state machine transition legality
    OrderStateMachine.assertTransition(currentStatus, targetStatus);

    const now = new Date();

    return await db.transaction(async (tx) => {
      const updatePayload: any = {
        status: targetStatus,
        updatedAt: now,
      };

      if (additionalData?.filledQuantity !== undefined) {
        updatePayload.filledQuantity = additionalData.filledQuantity;
      }
      if (additionalData?.averageFillPrice !== undefined) {
        updatePayload.averageFillPrice = additionalData.averageFillPrice;
      }
      if (additionalData?.failureReason !== undefined) {
        updatePayload.failureReason = additionalData.failureReason;
      }

      await tx
        .update(omsOrders)
        .set(updatePayload)
        .where(eq(omsOrders.orderId, orderId));

      // Record state transition
      const transitionId = `TRN-${crypto.randomUUID()}`;
      await tx.insert(omsStateTransitions).values({
        transitionId,
        orderId,
        fromState: currentStatus,
        toState: targetStatus,
        reason: reason || `Transitioned to ${targetStatus}`,
        passed: true,
        timestamp: now,
      });

      // Record order history
      const historyId = `HST-${crypto.randomUUID()}`;
      await tx.insert(omsOrderHistory).values({
        historyId,
        orderId,
        status: targetStatus,
        action: "STATUS_UPDATE",
        details: { fromState: currentStatus, toState: targetStatus, reason: reason || "" },
        createdAt: now,
      });

      // Record event
      const eventId = `EVT-${crypto.randomUUID()}`;
      await tx.insert(omsFoundationOrderEvents).values({
        eventId,
        orderId,
        eventType: `ORDER_${targetStatus}`,
        payload: { orderId, fromState: currentStatus, toState: targetStatus, reason },
        timestamp: now,
      });

      const updated = await this.getOrderById(orderId);
      return updated!;
    });
  }

  /**
   * Add order to execution queue.
   */
  async addToExecutionQueue(orderId: string, priority = 1): Promise<OMSExecutionQueueItem> {
    const db = getDb();
    const queueId = `QUE-${crypto.randomUUID()}`;
    const now = new Date();

    const [inserted] = await db
      .insert(omsExecutionQueue)
      .values({
        queueId,
        orderId,
        priority,
        status: "QUEUED",
        queuedAt: now,
      })
      .returning();

    return {
      ...inserted,
      status: inserted.status as any,
      queuedAt: inserted.queuedAt.toISOString(),
      processedAt: inserted.processedAt ? inserted.processedAt.toISOString() : null,
    };
  }

  /**
   * Get queue items.
   */
  async getExecutionQueue(limit = 100): Promise<OMSExecutionQueueItem[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(omsExecutionQueue)
      .orderBy(desc(omsExecutionQueue.queuedAt))
      .limit(limit);

    return rows.map((r) => ({
      ...r,
      status: r.status as any,
      queuedAt: r.queuedAt.toISOString(),
      processedAt: r.processedAt ? r.processedAt.toISOString() : null,
    }));
  }

  /**
   * Get order history records.
   */
  async getOrderHistory(orderId?: string, limit = 100): Promise<OMSOrderHistoryRecord[]> {
    const db = getDb();
    let query = db.select().from(omsOrderHistory);
    if (orderId) {
      query = query.where(eq(omsOrderHistory.orderId, orderId)) as any;
    }
    const rows = await query.orderBy(desc(omsOrderHistory.createdAt)).limit(limit);

    return rows.map((r) => ({
      ...r,
      status: r.status as any,
      details: (r.details as Record<string, any>) || {},
      createdAt: r.createdAt.toISOString(),
    }));
  }

  /**
   * Get state transitions for audit trail.
   */
  async getStateTransitions(orderId?: string, limit = 100): Promise<OMSStateTransitionRecord[]> {
    const db = getDb();
    let query = db.select().from(omsStateTransitions);
    if (orderId) {
      query = query.where(eq(omsStateTransitions.orderId, orderId)) as any;
    }
    const rows = await query.orderBy(desc(omsStateTransitions.timestamp)).limit(limit);

    return rows.map((r) => ({
      ...r,
      fromState: r.fromState as any,
      toState: r.toState as any,
      timestamp: r.timestamp.toISOString(),
    }));
  }

  /**
   * Get or save order metadata.
   */
  async saveMetadata(metadata: OMSOrderMetadataRecord): Promise<OMSOrderMetadataRecord> {
    const db = getDb();
    const now = new Date();

    const [inserted] = await db
      .insert(omsOrderMetadata)
      .values({
        orderId: metadata.orderId,
        clientTag: metadata.clientTag || null,
        executionVenue: metadata.executionVenue || null,
        algoStrategy: metadata.algoStrategy || null,
        tags: metadata.tags || [],
        customRules: metadata.customRules || {},
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: omsOrderMetadata.orderId,
        set: {
          clientTag: metadata.clientTag || null,
          executionVenue: metadata.executionVenue || null,
          algoStrategy: metadata.algoStrategy || null,
          tags: metadata.tags || [],
          customRules: metadata.customRules || {},
          updatedAt: now,
        },
      })
      .returning();

    return {
      ...inserted,
      tags: (inserted.tags as string[]) || [],
      customRules: (inserted.customRules as Record<string, any>) || {},
      createdAt: inserted.createdAt.toISOString(),
      updatedAt: inserted.updatedAt.toISOString(),
    };
  }

  async getMetadata(orderId: string): Promise<OMSOrderMetadataRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(omsOrderMetadata)
      .where(eq(omsOrderMetadata.orderId, orderId))
      .limit(1);

    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      tags: (r.tags as string[]) || [],
      customRules: (r.customRules as Record<string, any>) || {},
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
