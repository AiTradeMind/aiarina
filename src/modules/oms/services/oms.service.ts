import { OMSRepository } from "../repositories/oms.repository.ts";
import { OrderLifecycleManager } from "../lifecycle/order-lifecycle.manager.ts";
import { OrderValidator } from "../validators/order.validator.ts";
import { ExecutionValidator } from "../validators/execution.validator.ts";
import {
  CreateOrderRequest,
  OMSPipelineResult,
  OMSPipelineStageLog,
  OMSOrder,
  OrderStatus,
  OrderDecisionPackage,
  OMSExecutionQueueItem,
  OMSOrderHistoryRecord,
} from "../types/index.ts";
import crypto from "crypto";

export class OMSService {
  private repo: OMSRepository;
  private lifecycleManager: OrderLifecycleManager;

  constructor(repo?: OMSRepository, lifecycleManager?: OrderLifecycleManager) {
    this.repo = repo || new OMSRepository();
    this.lifecycleManager = lifecycleManager || new OrderLifecycleManager(this.repo);
  }

  /**
   * Executes the complete Order Management Pipeline for a Risk Approved request.
   */
  async processOrderRequest(request: CreateOrderRequest): Promise<OMSPipelineResult> {
    const stageLogs: OMSPipelineStageLog[] = [];
    const reasons: string[] = [];
    const orderId = request.orderId || `ORD-${crypto.randomUUID()}`;
    const decisionId = request.decisionId || "DEC-UNKNOWN";

    const logStage = (stage: OMSPipelineStageLog["stage"], passed: boolean, message?: string, data?: any) => {
      stageLogs.push({
        stage,
        timestamp: new Date().toISOString(),
        passed,
        message,
        data,
      });
      if (!passed && message) {
        reasons.push(message);
      }
    };

    // Stage 1: RECEIVE_RISK_APPROVED
    const riskCheck = await ExecutionValidator.validateRiskApproval(request);
    logStage("RECEIVE_RISK_APPROVED", riskCheck.passed, riskCheck.message);
    if (!riskCheck.passed) {
      return {
        orderId: null,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    // Stage 2: VALIDATE_GOVERNANCE
    const govCheck = await ExecutionValidator.validateGovernance();
    logStage("VALIDATE_GOVERNANCE", govCheck.passed, govCheck.message);
    if (!govCheck.passed) {
      return {
        orderId: null,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    // Stage 3: VALIDATE_DECISION
    const decisionCheck = await ExecutionValidator.validateDecision(request.decisionId);
    logStage("VALIDATE_DECISION", decisionCheck.passed, decisionCheck.message);
    if (!decisionCheck.passed) {
      return {
        orderId: null,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    // Stage 4: VALIDATE_FUNDS
    const fundsCheck = await ExecutionValidator.validateFunds(request.fundId);
    logStage("VALIDATE_FUNDS", fundsCheck.passed, fundsCheck.message);
    if (!fundsCheck.passed) {
      return {
        orderId: null,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    // Stage 5: VALIDATE_WALLET
    const walletCheck = await ExecutionValidator.validateWallet(request.walletId);
    logStage("VALIDATE_WALLET", walletCheck.passed, walletCheck.message);
    if (!walletCheck.passed) {
      return {
        orderId: null,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    // Stage 6: VALIDATE_RISK
    const paramsCheck = OrderValidator.validateOrderRequest(request);
    logStage(
      "VALIDATE_RISK",
      paramsCheck.valid,
      paramsCheck.valid ? "Order structure and parameters validated." : paramsCheck.errors.join("; ")
    );
    if (!paramsCheck.valid) {
      return {
        orderId: null,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    // Stage 7: CREATE_ORDER
    const now = new Date().toISOString();
    const newOrderData: OMSOrder = {
      orderId,
      decisionId,
      strategyId: request.strategyId || "STRAT-DEFAULT",
      riskAssessmentId: request.riskAssessmentId || "RISK-DEFAULT",
      fundId: request.fundId || "FUND-DEFAULT",
      walletId: request.walletId || "WAL-DEFAULT",
      symbol: request.symbol,
      instrument: request.instrument || "EQUITY",
      market: request.market || "SPOT",
      exchange: request.exchange || "NSE",
      side: request.side,
      orderType: request.orderType,
      quantity: request.quantity,
      price: request.price !== undefined ? request.price : null,
      stopPrice: request.stopPrice !== undefined ? request.stopPrice : null,
      timeInForce: request.timeInForce || "DAY",
      priority: request.priority || 1,
      status: "CREATED",
      filledQuantity: 0,
      averageFillPrice: null,
      failureReason: null,
      metadata: request.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    let createdOrder: OMSOrder;
    try {
      createdOrder = await this.repo.createOrder(newOrderData);
      logStage("CREATE_ORDER", true, `Internal Order '${orderId}' created in status CREATED.`);
    } catch (err: any) {
      logStage("CREATE_ORDER", false, `Failed to create internal order: ${err.message}`);
      return {
        orderId: null,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    // Stage 8: REGISTER_LIFECYCLE (CREATED -> VALIDATED)
    try {
      createdOrder = await this.lifecycleManager.transition(orderId, "VALIDATED", "Lifecycle registered and validated.");
      logStage("REGISTER_LIFECYCLE", true, `Order '${orderId}' transitioned to VALIDATED.`);
    } catch (err: any) {
      logStage("REGISTER_LIFECYCLE", false, `Failed lifecycle registration: ${err.message}`);
      await this.lifecycleManager.reject(orderId, err.message);
      return {
        orderId,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    // Stage 9: QUEUE_ORDER (VALIDATED -> QUEUED)
    try {
      createdOrder = await this.lifecycleManager.transition(orderId, "QUEUED", "Added to internal execution queue.");
      await this.repo.addToExecutionQueue(orderId, request.priority || 1);
      logStage("QUEUE_ORDER", true, `Order '${orderId}' added to execution queue in QUEUED status.`);
    } catch (err: any) {
      logStage("QUEUE_ORDER", false, `Failed queue stage: ${err.message}`);
      await this.lifecycleManager.reject(orderId, err.message);
      return {
        orderId,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    // Stage 10: READY_ORDER (QUEUED -> READY)
    try {
      createdOrder = await this.lifecycleManager.markReady(orderId);
      logStage("READY_ORDER", true, `Order '${orderId}' marked READY for execution.`);
    } catch (err: any) {
      logStage("READY_ORDER", false, `Failed ready stage: ${err.message}`);
      await this.lifecycleManager.reject(orderId, err.message);
      return {
        orderId,
        decisionId,
        approved: false,
        status: "REJECTED",
        reasons,
        stageLogs,
      };
    }

    return {
      orderId,
      decisionId,
      approved: true,
      status: "READY",
      reasons: [],
      stageLogs,
      order: createdOrder,
    };
  }

  /**
   * Backward compatibility for decision package intake.
   */
  async processDecisionPackage(pkg: OrderDecisionPackage) {
    if (!pkg.committeeApproved || !pkg.paperTradingEnabled) {
      throw new Error("Rejected: Decision package not approved or paper trading not enabled.");
    }
    if (!pkg.marketOpen || !pkg.treasuryReady) {
      throw new Error("Rejected: Market closed or Treasury not ready.");
    }

    const request: CreateOrderRequest = {
      decisionId: pkg.decisionId,
      symbol: pkg.ticker,
      side: pkg.side,
      orderType: pkg.type,
      quantity: pkg.quantity,
      price: pkg.price,
      strategyId: pkg.strategyId,
      metadata: {
        portfolioId: pkg.portfolioId,
        aiModel: pkg.aiModel,
        riskApproved: true,
      },
    };

    const result = await this.processOrderRequest(request);
    if (!result.approved) {
      throw new Error(`Rejected: ${result.reasons.join(", ")}`);
    }

    return {
      success: true,
      orderId: result.orderId,
      order: result.order,
      stageLogs: result.stageLogs,
    };
  }

  /**
   * Cancel order.
   */
  async cancelOrder(orderId: string | number, reason?: string) {
    const idStr = orderId.toString();
    const updated = await this.lifecycleManager.cancel(idStr, reason);
    return { success: true, orderId: idStr, order: updated };
  }

  /**
   * Expire order.
   */
  async expireOrder(orderId: string | number, reason?: string) {
    const idStr = orderId.toString();
    const updated = await this.lifecycleManager.expire(idStr, reason);
    return { success: true, orderId: idStr, order: updated };
  }

  /**
   * Retry order.
   */
  async retryOrder(orderId: string | number) {
    const idStr = orderId.toString();
    const order = await this.repo.getOrderById(idStr);
    if (!order) {
      throw new Error(`Order '${idStr}' not found for retry.`);
    }

    if (order.status === "QUEUED") {
      const updated = await this.lifecycleManager.markReady(idStr);
      return { success: true, orderId: idStr, order: updated };
    }

    if (order.status === "REJECTED") {
      // Re-process request
      const request: CreateOrderRequest = {
        orderId: `ORD-${crypto.randomUUID()}`,
        decisionId: order.decisionId,
        symbol: order.symbol,
        side: order.side,
        orderType: order.orderType,
        quantity: order.quantity,
        price: order.price || undefined,
        stopPrice: order.stopPrice || undefined,
        metadata: { ...order.metadata, retriedFrom: idStr },
      };
      const result = await this.processOrderRequest(request);
      return { success: true, retriedOrderId: result.orderId, result };
    }

    throw new Error(`Cannot retry order in status '${order.status}'. Only QUEUED or REJECTED orders can be retried.`);
  }

  async getOrders(limit = 100, status?: OrderStatus) {
    return await this.repo.getOrders(limit, status);
  }

  async getOrder(orderId: string | number) {
    const idStr = orderId.toString();
    const order = await this.repo.getOrderById(idStr);
    if (order) return order;

    // Check by numeric database ID
    if (!isNaN(Number(idStr))) {
      const all = await this.repo.getOrders(100);
      const matched = all.find((o) => o.id === Number(idStr));
      if (matched) return matched;
    }
    return null;
  }

  async getExecutionQueue(limit = 100): Promise<OMSExecutionQueueItem[]> {
    return await this.repo.getExecutionQueue(limit);
  }

  async getOrderHistory(orderId?: string, limit = 100): Promise<OMSOrderHistoryRecord[]> {
    return await this.repo.getOrderHistory(orderId, limit);
  }

  async getOrderBook() {
    const orders = await this.repo.getOrders(100);
    return orders.map((o) => ({
      orderId: o.orderId,
      symbol: o.symbol,
      side: o.side,
      type: o.orderType,
      quantity: o.quantity,
      price: o.price,
      state: o.status,
      createdAt: o.createdAt,
    }));
  }

  async getQueue() {
    return await this.repo.getExecutionQueue(100);
  }

  async getEvents() {
    return await this.repo.getOrderHistory(undefined, 100);
  }
}
