import { tradeRepository } from "../repositories/TradeRepository.ts";
import { IEnterpriseTradeJournal, IEnterpriseTradeLedger } from "../types/ep05.ts";

export class TradeLedgerService {
  public async createEntryForTrade(trade: IEnterpriseTradeJournal): Promise<void> {
    const amount = Math.abs(parseFloat(trade.netPnl));
    if (amount === 0 && parseFloat(trade.transactionCosts) === 0) return; // No financial movement
    
    // Simplistic dual-entry approximation for PnL
    const netPnl = parseFloat(trade.netPnl);
    if (netPnl > 0) {
      await tradeRepository.createLedgerEntry({
        journalId: trade.id,
        entryType: 'CREDIT',
        amount: netPnl.toString(),
        description: `Profit on ${trade.symbol}`
      });
    } else if (netPnl < 0) {
      await tradeRepository.createLedgerEntry({
        journalId: trade.id,
        entryType: 'DEBIT',
        amount: Math.abs(netPnl).toString(),
        description: `Loss on ${trade.symbol}`
      });
    }

    const costs = parseFloat(trade.transactionCosts);
    if (costs > 0) {
      await tradeRepository.createLedgerEntry({
        journalId: trade.id,
        entryType: 'DEBIT',
        amount: costs.toString(),
        description: `Transaction costs on ${trade.symbol}`
      });
    }
  }
}

export const tradeLedgerService = new TradeLedgerService();
