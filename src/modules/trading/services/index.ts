import { 
  PortfolioRepository, 
  PositionRepository, 
  OrderRepository, 
  TradeRepository,
  ExecutionRepository
} from "../repositories/index.ts";
import { 
  OrderStatus, 
  OrderType, 
  TransactionSide, 
  CreateOrderRequest, 
  UpdateOrderRequest,
  Order,
  Portfolio,
  Position
} from "../types/index.ts";

import { RiskService } from "../../risk/services/index.ts";
import { EventBusService } from "../../events/services/index.ts";
import { eq } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { portfolios as portfolioTable } from "../../../db/schema.ts";

export class TradingService {
  private portfolioRepo = new PortfolioRepository();
  private positionRepo = new PositionRepository();
  private orderRepo = new OrderRepository();
  private tradeRepo = new TradeRepository();
  private executionRepo = new ExecutionRepository();
  private riskService = new RiskService();
  private eventBus = EventBusService.getInstance();

  async getPortfolio(organizationId: string): Promise<Portfolio> {
    let portfolio = await this.portfolioRepo.findByOrganizationId(organizationId);
    if (!portfolio) {
      portfolio = await this.portfolioRepo.create(organizationId, `${organizationId} Main Portfolio`);
    }
    return portfolio;
  }

  async getBalance(organizationId: string) {
    const portfolio = await this.getPortfolio(organizationId);
    return {
      cashBalance: portfolio.cashBalance,
      buyingPower: portfolio.buyingPower,
      realizedPnl: portfolio.realizedPnl,
      unrealizedPnl: portfolio.unrealizedPnl,
      currency: "USD",
    };
  }

  async getPositions(organizationId: string): Promise<Position[]> {
    const portfolio = await this.getPortfolio(organizationId);
    return await this.positionRepo.findByPortfolioId(portfolio.id, organizationId);
  }

  async getOrders(organizationId: string): Promise<Order[]> {
    const portfolio = await this.getPortfolio(organizationId);
    return await this.orderRepo.findByPortfolioId(portfolio.id, organizationId);
  }

  async createOrder(organizationId: string, userId: number, request: CreateOrderRequest): Promise<Order> {
    const portfolio = await this.getPortfolio(organizationId);

    // 1. Validate Order
    this.validateOrderRequest(request);

    // 2. Validate Buying Power / Position
    if (request.side === 'BUY') {
      const requiredBuyingPower = request.quantity * (request.price || 200); // Buffer for market orders
      if (parseFloat(portfolio.buyingPower) < requiredBuyingPower) {
        throw new Error("Insufficient buying power");
      }
    } else {
      const position = await this.positionRepo.findByTicker(portfolio.id, request.ticker, organizationId);
      if (!position || parseFloat(position.quantity) < request.quantity) {
        throw new Error("Insufficient position quantity to sell");
      }
    }

    // 2.5 Risk Validation
    const riskResult = await this.riskService.validateOrder({
      organizationId,
      userId,
      orderRequest: request
    });

    if (!riskResult.passed) {
      await this.orderRepo.create({
        portfolioId: portfolio.id,
        userId,
        ticker: request.ticker.toUpperCase(),
        type: request.type,
        side: request.side,
        quantity: request.quantity.toString(),
        filledQuantity: "0",
        price: request.price?.toString() || null,
        status: 'REJECTED',
      }, organizationId);
      throw new Error(`Risk Validation Failed: ${riskResult.message}`);
    }

    // 3. Create Order
    const order = await this.orderRepo.create({
      portfolioId: portfolio.id,
      userId,
      ticker: request.ticker.toUpperCase(),
      type: request.type,
      side: request.side,
      quantity: request.quantity.toString(),
      filledQuantity: "0",
      price: request.price?.toString() || null,
      status: 'CREATED',
    }, organizationId);

    // Publish Order Event
    await this.eventBus.publish({
      eventType: 'ORDER_CREATED',
      source: 'TRADING',
      organizationId,
      userId,
      entityId: order.id.toString(),
      payload: { ticker: order.ticker, side: order.side, quantity: order.quantity },
      audit: {
        action: 'ORDER_SUBMITTED',
        status: 'SUCCESS',
        details: `Order created: ${order.side} ${order.quantity} ${order.ticker}`,
      }
    });

    // 4. Trigger lifecycle
    this.processOrderLifecycle(order.id, organizationId);

    return order;
  }

  async updateOrder(organizationId: string, orderId: number, request: UpdateOrderRequest): Promise<Order> {
    const order = await this.orderRepo.findById(orderId, organizationId);
    if (!order) throw new Error("Order not found");

    const portfolio = await this.getPortfolio(organizationId);
    if (order.portfolioId !== portfolio.id) throw new Error("Unauthorized");

    const immutableStates: OrderStatus[] = ['EXECUTED', 'REJECTED', 'CANCELLED', 'FAILED'];
    if (immutableStates.includes(order.status)) {
      throw new Error(`Order already in ${order.status} state`);
    }

    return await this.orderRepo.update(orderId, organizationId, {
      quantity: request.quantity?.toString(),
      price: request.price?.toString(),
      status: request.status,
    });
  }

  async cancelOrder(organizationId: string, orderId: number): Promise<Order> {
    return await this.updateOrder(organizationId, orderId, { status: 'CANCELLED' });
  }

  async getTrades(organizationId: string) {
    const portfolio = await this.getPortfolio(organizationId);
    return await this.tradeRepo.findByPortfolioId(portfolio.id, organizationId);
  }

  async getExecutions(organizationId: string) {
    const portfolio = await this.getPortfolio(organizationId);
    return await this.executionRepo.findByPortfolioId(portfolio.id, organizationId);
  }

  private validateOrderRequest(request: CreateOrderRequest) {
    if (request.quantity <= 0) throw new Error("Invalid quantity");
    if (request.type !== 'MARKET' && (!request.price || request.price <= 0)) {
      throw new Error("Invalid price");
    }
  }

  private async processOrderLifecycle(orderId: number, organizationId: string) {
    try {
      await this.orderRepo.update(orderId, organizationId, { status: 'VALIDATED' });
      await this.orderRepo.update(orderId, organizationId, { status: 'QUEUED' });

      // Simulated Execution
      setTimeout(async () => {
        await this.executeOrder(orderId, organizationId);
      }, 1500);

    } catch (error) {
      await this.orderRepo.update(orderId, organizationId, { status: 'FAILED' });
    }
  }

  private async executeOrder(orderId: number, organizationId: string) {
    const order = await this.orderRepo.findById(orderId, organizationId);
    if (!order || order.status !== 'QUEUED') return;

    await this.orderRepo.update(orderId, organizationId, { status: 'EXECUTING' });

    try {
      const db = getDb();
      const portfolio = (await db.select().from(portfolioTable).where(eq(portfolioTable.id, order.portfolioId)).limit(1))[0];
      const currentPrice = 158.45; // Default fallback
      const executionPrice = order.price ? parseFloat(order.price) : currentPrice;
      const totalValue = parseFloat(order.quantity) * executionPrice;

      if (order.side === 'BUY') {
        const newBalance = parseFloat(portfolio.cashBalance) - totalValue;
        const newBuyingPower = parseFloat(portfolio.buyingPower) - totalValue;
        await this.portfolioRepo.updateBalance(order.portfolioId, organizationId, newBalance.toFixed(2), newBuyingPower.toFixed(2), portfolio.realizedPnl);

        const existingPos = await this.positionRepo.findByTicker(order.portfolioId, order.ticker, organizationId);
        const newQty = parseFloat(existingPos?.quantity || "0") + parseFloat(order.quantity);
        const newAvg = ((parseFloat(existingPos?.averagePrice || "0") * parseFloat(existingPos?.quantity || "0")) + totalValue) / newQty;
        await this.positionRepo.upsert(order.portfolioId, order.ticker, newQty.toFixed(4), newAvg.toFixed(2), executionPrice.toFixed(2), "0.00", organizationId);
      } else {
        const existingPos = await this.positionRepo.findByTicker(order.portfolioId, order.ticker, organizationId);
        if (!existingPos) throw new Error("Position not found");

        const newBalance = parseFloat(portfolio.cashBalance) + totalValue;
        const newBuyingPower = parseFloat(portfolio.buyingPower) + totalValue;
        const pnl = (executionPrice - parseFloat(existingPos.averagePrice)) * parseFloat(order.quantity);
        const newRealizedPnl = parseFloat(portfolio.realizedPnl) + pnl;
        
        await this.portfolioRepo.updateBalance(order.portfolioId, organizationId, newBalance.toFixed(2), newBuyingPower.toFixed(2), newRealizedPnl.toFixed(2));

        const remainingQty = parseFloat(existingPos.quantity) - parseFloat(order.quantity);
        if (remainingQty <= 0) {
          await this.positionRepo.delete(existingPos.id, organizationId);
        } else {
          await this.positionRepo.upsert(order.portfolioId, order.ticker, remainingQty.toFixed(4), existingPos.averagePrice, executionPrice.toFixed(2), "0.00", organizationId);
        }
      }

      // Record Execution and Trade
      await this.executionRepo.create({
        orderId: order.id,
        portfolioId: order.portfolioId,
        exchangeId: "NSE",
        side: order.side,
        quantity: order.quantity,
        price: executionPrice.toFixed(2),
        commission: "5.00",
      }, organizationId);

      await this.tradeRepo.create({
        portfolioId: order.portfolioId,
        orderId: order.id,
        ticker: order.ticker,
        side: order.side,
        quantity: order.quantity,
        executionPrice: executionPrice.toFixed(2),
      }, organizationId);

      await this.orderRepo.update(orderId, organizationId, { 
        status: 'EXECUTED',
        filledQuantity: order.quantity,
      });

      // Publish Execution Event
      await this.eventBus.publish({
        eventType: 'ORDER_EXECUTED',
        source: 'TRADING',
        organizationId: portfolio.organizationId,
        userId: order.userId,
        entityId: order.id.toString(),
        payload: { ticker: order.ticker, side: order.side, quantity: order.quantity, price: executionPrice },
        notify: {
          title: "Order Executed",
          message: `${order.side} ${order.quantity} ${order.ticker} at ${executionPrice}`,
          type: 'SUCCESS'
        }
      });

    } catch (error) {
      console.error("Execution error:", error);
      await this.orderRepo.update(orderId, organizationId, { status: 'FAILED' });
    }
  }
}
