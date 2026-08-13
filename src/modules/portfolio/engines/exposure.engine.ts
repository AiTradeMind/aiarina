import { PortfolioPosition, PortfolioExposureMetrics } from "../types/index.ts";

export class ExposureEngine {
  /**
   * Calculate portfolio exposures and risk distributions
   */
  static calculateExposure(
    positions: PortfolioPosition[],
    totalCapital: number = 1000000.0
  ): PortfolioExposureMetrics {
    let longExposure = 0.0;
    let shortExposure = 0.0;
    const sectorExposure: Record<string, number> = {};
    const instrumentExposure: Record<string, number> = {};
    const portfolioDistribution: Record<string, number> = {};

    let grossVal = 0.0;

    for (const pos of positions) {
      if (pos.status === "CLOSED" || pos.status === "ARCHIVED") continue;

      const posValue = Math.abs(pos.marketValue);
      grossVal += posValue;

      if (pos.netQuantity > 0) {
        longExposure += posValue;
      } else if (pos.netQuantity < 0) {
        shortExposure += posValue;
      }

      // Instrument Exposure
      instrumentExposure[pos.symbol] = (instrumentExposure[pos.symbol] || 0) + posValue;

      // Sector Exposure (default to General if not categorized)
      const sector = "GENERAL";
      sectorExposure[sector] = (sectorExposure[sector] || 0) + posValue;
    }

    const grossExposure = longExposure + shortExposure;
    const netExposure = longExposure - shortExposure;
    const capitalUtilization = totalCapital > 0 ? (grossExposure / totalCapital) * 100 : 0.0;

    // Calculate percentage distributions
    if (grossExposure > 0) {
      for (const [sym, val] of Object.entries(instrumentExposure)) {
        portfolioDistribution[sym] = (val / grossExposure) * 100;
      }
    }

    return {
      grossExposure,
      netExposure,
      sectorExposure,
      instrumentExposure,
      longExposure,
      shortExposure,
      capitalUtilization,
      portfolioDistribution,
    };
  }
}
