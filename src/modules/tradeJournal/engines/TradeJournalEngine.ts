import { tradeRepository } from "../repositories/TradeRepository.ts";
import { pnlEngine } from "./PnLEngine.ts";
import { tradeLedgerService } from "../services/TradeLedgerService.ts";
import { TradeCostConfig, IEnterpriseTradeJournal } from "../types/ep05.ts";
import { randomUUID } from "crypto";

export class TradeJournalEngine {
  public async logTrade(params: {
    organizationId: string;
    portfolioId: string;
    positionId: string;
    executionId?: string;
    symbol: string;
    action: 'OPEN' | 'CLOSE' | 'PARTIAL_CLOSE' | 'SCALE_IN' | 'SCALE_OUT' | 'REJECTED' | 'CANCELLED';
    side: 'BUY' | 'SELL';
    quantity: string;
    price: string;
    entryPrice?: string; // only for CLOSE or PARTIAL_CLOSE
    status: 'COMPLETED' | 'REJECTED';
    config: TradeCostConfig;
    metadata?: any;
  }): Promise<IEnterpriseTradeJournal> {
    const qty = parseFloat(params.quantity);
    const prc = parseFloat(params.price);
    const costs = pnlEngine.calculateCosts(qty, prc, params.side, params.config);

    let grossPnl = 0;
    let netPnl = -costs;

    // Calculate PnL if this is a closing action
    if ((params.action === 'CLOSE' || params.action === 'PARTIAL_CLOSE' || params.action === 'SCALE_OUT') && params.entryPrice) {
      const entryPrc = parseFloat(params.entryPrice);
      const originalSide = params.side === 'SELL' ? 'BUY' : 'SELL';
      const result = pnlEngine.calculateRealizedPnl(entryPrc, prc, qty, originalSide, costs);
      grossPnl = result.grossPnl;
      netPnl = result.netPnl;
    }

    const journalId = `tj_${randomUUID().replace(/-/g, '').substring(0, 12)}`;

    const journal = await tradeRepository.createJournalEntry({
      id: journalId,
      organizationId: params.organizationId,
      portfolioId: params.portfolioId,
      positionId: params.positionId,
      executionId: params.executionId,
      symbol: params.symbol,
      action: params.action,
      side: params.side,
      quantity: params.quantity,
      price: params.price,
      grossPnl: grossPnl.toString(),
      netPnl: netPnl.toString(),
      transactionCosts: costs.toString(),
      status: params.status,
      metadata: params.metadata
    });

    if (params.status === 'COMPLETED') {
      await tradeLedgerService.createEntryForTrade(journal);
    }

    return journal;
  }
}

export const tradeJournalEngine = new TradeJournalEngine();
