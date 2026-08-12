import { portfolioRepository } from "../repositories/PortfolioRepository.ts";
import { positionRepository } from "../repositories/PositionRepository.ts";
import { portfolioEngine } from "../engines/PortfolioEngine.ts";
import { positionEngine } from "../engines/PositionEngine.ts";
import { portfolioSnapshotService } from "./PortfolioSnapshotService.ts";
import { auditEngine } from "../../audit/services/AuditEngine.ts";
import { eventService } from "../../notifications/services/EventService.ts";
import { UpdatePortfolioFromExecutionPayload } from "../types/index.ts";
import { tradeJournalEngine } from "../../tradeJournal/engines/TradeJournalEngine.ts";

export class PortfolioService {
  public async getPortfolioSummary(portfolioId: string, organizationId: string) {
    const portfolio = await portfolioRepository.getPortfolio(portfolioId, organizationId);
    if (!portfolio) throw new Error("Portfolio not found");
    
    const positions = await positionRepository.getPositions(portfolioId);
    
    return {
      portfolio,
      positions
    };
  }

  public async getPositions(portfolioId: string, status?: string) {
    return await positionRepository.getPositions(portfolioId, status);
  }

  public async getPositionById(id: string, organizationId: string) {
    return await positionRepository.getPositionById(id, organizationId);
  }
  
  public async getPortfolioHistory(portfolioId: string) {
    return await portfolioRepository.getSnapshots(portfolioId);
  }

  public async handleExecution(payload: UpdatePortfolioFromExecutionPayload): Promise<void> {
    const { organizationId, portfolioId, symbol, assetClass, side, quantity, price, executionId } = payload;
    
    let portfolio = await portfolioRepository.getPortfolio(portfolioId, organizationId);
    if (!portfolio) {
      portfolio = await portfolioRepository.createPortfolio({
        id: portfolioId || `port_${organizationId}`,
        organizationId: organizationId || 'org_exec_test',
        cashBalance: "1000000",
        availableCash: "1000000",
        buyingPower: "1000000"
      });
    }

    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    const totalAmount = qty * prc;
    
    const tradeConfig = {
      enableBrokerage: true,
      brokerageRate: 0.0003,
      enableExchangeCharges: true,
      exchangeChargeRate: 0.0000325,
      enableSTT: true,
      sttRate: 0.001,
      enableGST: true,
      gstRate: 0.18,
      enableSebi: true,
      sebiRate: 0.000001,
      enableStampDuty: true,
      stampDutyRate: 0.00015
    };

    let logAction: any = 'OPEN';
    let entryPrice: number | undefined;
    let positionId: string = '';

    if (side === 'BUY') {
      portfolio = await portfolioEngine.debitCash(portfolio, totalAmount.toString());
      const { position, action } = await positionEngine.openOrIncreasePosition(portfolioId, organizationId, symbol, assetClass, quantity, price, executionId);
      logAction = action === 'REOPEN' ? 'OPEN' : action;
      positionId = position.id;
    } else {
      const { position, action, entryPrice: ep } = await positionEngine.reduceOrClosePosition(portfolioId, organizationId, symbol, quantity, price, executionId);
      portfolio = await portfolioEngine.creditCash(portfolio, totalAmount.toString());
      logAction = action;
      entryPrice = ep;
      positionId = position.id;
    }

    await tradeJournalEngine.logTrade({
      organizationId,
      portfolioId,
      positionId,
      executionId,
      symbol,
      action: logAction,
      side,
      quantity,
      price,
      entryPrice: entryPrice?.toString(),
      status: 'COMPLETED',
      config: tradeConfig
    });

    const allPositions = await positionRepository.getPositions(portfolioId, 'OPEN');
    const totalMarketValue = allPositions.reduce((acc, pos) => acc + parseFloat(pos.marketValue), 0);
    
    portfolio = await portfolioEngine.recalculateEquity(portfolioId, organizationId, totalMarketValue.toString());
    await portfolioSnapshotService.createSnapshot(portfolioId, organizationId);

    await auditEngine.logEvent({
      organizationId,
      action: "PORTFOLIO_UPDATED",
      sourceModule: "PORTFOLIO_ENGINE",
      resourceType: "PORTFOLIO",
      resourceId: portfolio.id,
      details: { executionId, symbol, side, quantity, price }
    });

    await eventService.publishEvent({
      organizationId,
      type: "PORTFOLIO_UPDATED",
      category: "AUDIT",
      data: { portfolioId, executionId, symbol, newEquity: portfolio.equity }
    });
  }
}

export const portfolioService = new PortfolioService();
