import { PortfolioPosition } from "../types/index.ts";

export interface MTMCalculationResult {
  dailyMtm: number;
  runningMtm: number;
  portfolioMtm: number;
  instrumentMtmMap: Record<string, number>;
}

export class MTMEngine {
  /**
   * Calculate Mark-to-Market metrics across all positions
   */
  static calculateMTM(
    positions: PortfolioPosition[],
    previousMtm: number = 0.0
  ): MTMCalculationResult {
    let runningMtm = 0.0;
    const instrumentMtmMap: Record<string, number> = {};

    for (const pos of positions) {
      if (pos.status === "CLOSED" || pos.status === "ARCHIVED") continue;

      let positionMtm = 0.0;
      if (pos.netQuantity > 0) {
        positionMtm = (pos.currentPrice - pos.averagePrice) * pos.netQuantity;
      } else if (pos.netQuantity < 0) {
        positionMtm = (pos.averagePrice - pos.currentPrice) * Math.abs(pos.netQuantity);
      }

      runningMtm += positionMtm;
      instrumentMtmMap[pos.symbol] = (instrumentMtmMap[pos.symbol] || 0) + positionMtm;
    }

    const dailyMtm = runningMtm - previousMtm;
    const portfolioMtm = runningMtm;

    return {
      dailyMtm,
      runningMtm,
      portfolioMtm,
      instrumentMtmMap,
    };
  }
}
