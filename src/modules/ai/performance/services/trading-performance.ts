import { PaperTradeRepository, PaperJournalRepository } from "../../../paperTrading/repositories/index.ts";

export class TradingPerformanceService {
  private tradeRepo = new PaperTradeRepository();
  private journalRepo = new PaperJournalRepository();

  async getStrategyPerformance(organizationId: string): Promise<any> {
    const journalEntries = await this.journalRepo.findByOrganizationId(organizationId);
    const trades = journalEntries.filter(j => j.entryType === 'TRADE');
    
    if (trades.length === 0) return { executionCount: 0, winRate: 0, profitFactor: 0 };

    let wins = 0;
    let grossProfit = 0;
    let grossLoss = 0;

    for (const trade of trades) {
        const pnl = parseFloat(trade.pnl || '0');
        if (pnl > 0) {
            wins++;
            grossProfit += pnl;
        } else {
            grossLoss += Math.abs(pnl);
        }
    }

    const winRate = (trades.length > 0) ? (wins / trades.length) * 100 : 0;
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    return {
      executionCount: trades.length,
      winRate,
      profitFactor,
      grossProfit,
      grossLoss
    };
  }
}
