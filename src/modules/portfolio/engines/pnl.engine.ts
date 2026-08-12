import { PortfolioPosition } from "../types/index.ts";

export interface PnLCalculationResult {
  unrealizedPnl: number;
  realizedPnl: number;
  todaysPnl: number;
  totalPnl: number;
  overallRoi: number;
  totalCostValue: number;
  totalMarketValue: number;
}

export class PnLEngine {
  /**
   * Recalculate portfolio-level PnL metrics from all active & historical positions
   */
  static calculatePnL(positions: PortfolioPosition[]): PnLCalculationResult {
    let unrealizedPnl = 0.0;
    let realizedPnl = 0.0;
    let todaysPnl = 0.0;
    let totalCostValue = 0.0;
    let totalMarketValue = 0.0;

    for (const pos of positions) {
      realizedPnl += pos.realizedPnl || 0.0;
      todaysPnl += pos.todaysPnl || 0.0;

      if (pos.status !== "CLOSED" && pos.status !== "ARCHIVED") {
        unrealizedPnl += pos.unrealizedPnl || 0.0;
        totalCostValue += pos.costValue || 0.0;
        totalMarketValue += pos.marketValue || 0.0;
      }
    }

    const totalPnl = realizedPnl + unrealizedPnl;
    const overallRoi = totalCostValue > 0 ? (totalPnl / totalCostValue) * 100 : 0.0;

    return {
      unrealizedPnl,
      realizedPnl,
      todaysPnl,
      totalPnl,
      overallRoi,
      totalCostValue,
      totalMarketValue,
    };
  }
}
