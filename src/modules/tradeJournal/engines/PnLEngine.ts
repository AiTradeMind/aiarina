import { TradeCostConfig, IEnterpriseTradeJournal } from "../types/ep05.ts";

export class PnLEngine {
  public calculateCosts(quantity: number, price: number, side: string, config: TradeCostConfig): number {
    const tradeValue = quantity * price;
    let totalCosts = 0;

    if (config.enableBrokerage) {
      totalCosts += tradeValue * config.brokerageRate;
    }
    
    let exchangeCharges = 0;
    if (config.enableExchangeCharges) {
      exchangeCharges = tradeValue * config.exchangeChargeRate;
      totalCosts += exchangeCharges;
    }

    if (config.enableSTT && side === 'SELL') { // Simplified STT rule
      totalCosts += tradeValue * config.sttRate;
    }

    if (config.enableSebi) {
      totalCosts += tradeValue * config.sebiRate;
    }

    if (config.enableStampDuty && side === 'BUY') {
      totalCosts += tradeValue * config.stampDutyRate;
    }

    if (config.enableGST) {
      const brokerage = config.enableBrokerage ? (tradeValue * config.brokerageRate) : 0;
      totalCosts += (brokerage + exchangeCharges) * config.gstRate;
    }

    return totalCosts;
  }

  public calculateRealizedPnl(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    side: 'BUY' | 'SELL',
    totalCosts: number
  ): { grossPnl: number; netPnl: number } {
    let grossPnl = 0;
    if (side === 'BUY') {
      grossPnl = (exitPrice - entryPrice) * quantity;
    } else {
      grossPnl = (entryPrice - exitPrice) * quantity;
    }

    const netPnl = grossPnl - totalCosts;

    return { grossPnl, netPnl };
  }
}

export const pnlEngine = new PnLEngine();
