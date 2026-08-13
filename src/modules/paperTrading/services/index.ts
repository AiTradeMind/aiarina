import { 
  PaperAccountRepository, 
  PaperOrderRepository, 
  PaperPositionRepository, 
  PaperTradeRepository, 
  PaperJournalRepository 
} from "../repositories/index.ts";
import { 
  PaperAccount, 
  PaperOrder, 
  PaperPosition, 
  PaperTrade, 
  PaperJournalEntry, 
  CreatePaperOrderRequest 
} from "../types/index.ts";
import { RiskService } from "../../risk/services/index.ts";
import { MarketService } from "../../market/services/index.ts";
import { EventBusService } from "../../events/services/index.ts";
import { executionCoordinator } from "./execution-coordinator.ts";

export class PaperTradingService {
  private accountRepo = new PaperAccountRepository();
  private orderRepo = new PaperOrderRepository();
  private positionRepo = new PaperPositionRepository();
  private tradeRepo = new PaperTradeRepository();
  private journalRepo = new PaperJournalRepository();
  private riskService = new RiskService();
  private marketService = new MarketService();
  private eventBus = EventBusService.getInstance();

  async getAccount(organizationId: string): Promise<PaperAccount> {
    let account = await this.accountRepo.findByOrganizationId(organizationId);
    if (!account) {
      account = await this.accountRepo.create(organizationId);
    }
    return account;
  }

  async getOrders(organizationId: string, labId?: string): Promise<PaperOrder[]> {
    return await this.orderRepo.findByOrganizationId(organizationId, labId);
  }

  async getPositions(organizationId: string, labId?: string): Promise<PaperPosition[]> {
    return await this.positionRepo.findByOrganizationId(organizationId, labId);
  }

  async getTrades(organizationId: string, labId?: string): Promise<PaperTrade[]> {
    return await this.tradeRepo.findByOrganizationId(organizationId, labId);
  }

  async getJournal(organizationId: string, labId?: string): Promise<PaperJournalEntry[]> {
    return await this.journalRepo.findByOrganizationId(organizationId, labId);
  }

  async createOrder(organizationId: string, userId: number, request: CreatePaperOrderRequest): Promise<PaperOrder> {
    const account = await this.getAccount(organizationId);

    // 1. Risk Validation (Reusing Risk Engine)
    const riskResult = await this.riskService.validateOrder({
      organizationId,
      userId,
      orderRequest: {
        ticker: request.ticker,
        side: request.side,
        quantity: request.quantity,
        price: request.price,
        type: request.type,
      }
    });

    if (!riskResult.passed) {
      throw new Error(`Risk Validation Failed: ${riskResult.message}`);
    }

    // 2. Create Order
    const order = await this.orderRepo.create({
      organizationId,
      userId,
      labId: request.labId || 'LAB_01_STOCK',
      ticker: request.ticker.toUpperCase(),
      type: request.type,
      side: request.side,
      quantity: request.quantity.toString(),
      price: request.price?.toString() || null,
      status: 'CREATED',
    });

    // Publish Paper Order Event
    await this.eventBus.publish({
      eventType: 'PAPER_ORDER_CREATED',
      source: 'PAPER_TRADING',
      organizationId,
      userId,
      entityId: order.id.toString(),
      payload: { ticker: order.ticker, side: order.side, quantity: order.quantity },
      audit: {
        action: 'PAPER_ORDER_SUBMITTED',
        status: 'SUCCESS',
        details: `Paper order created: ${order.side} ${order.quantity} ${order.ticker}`,
      }
    });

    // 3. Simulated Queue-Based Execution (Stage 10 Execution Coordinator)
    await executionCoordinator.enqueue(order.id, organizationId, userId);

    return order;
  }

  async getPerformance(organizationId: string) {
    const trades = await this.tradeRepo.findByOrganizationId(organizationId);
    const account = await this.getAccount(organizationId);
    
    const totalTrades = trades.length;
    const initialBalance = parseFloat(account.initialBalance);
    const currentBalance = parseFloat(account.balance);
    const totalProfit = currentBalance - initialBalance;
    const profitPercentage = (totalProfit / initialBalance) * 100;

    return {
      totalTrades,
      currentBalance: account.balance,
      initialBalance: account.initialBalance,
      totalProfit: totalProfit.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2),
      winRate: "0.00", // Placeholder for actual calculation
      drawdown: "0.00", // Placeholder for actual calculation
    };
  }
}
