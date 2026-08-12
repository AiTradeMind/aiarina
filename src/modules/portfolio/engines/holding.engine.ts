import { PortfolioHolding, PortfolioPosition } from "../types/index.ts";

export class HoldingEngine {
  /**
   * Derive holding objects from open/active positions
   */
  static generateHoldings(
    portfolioId: string,
    positions: PortfolioPosition[],
    totalPortfolioValue: number
  ): PortfolioHolding[] {
    const activePositions = positions.filter((p) => Math.abs(p.netQuantity) > 1e-6 && p.status !== "CLOSED" && p.status !== "ARCHIVED");

    return activePositions.map((pos) => {
      const quantity = pos.netQuantity;
      const averageCost = pos.averagePrice;
      const currentPrice = pos.currentPrice;
      const totalCost = pos.costValue;
      const currentValue = pos.marketValue;
      const unrealizedPnl = pos.unrealizedPnl;
      const weight = totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0.0;
      const holdingId = `HLD-${portfolioId}-${pos.symbol}`;

      return {
        holdingId,
        portfolioId,
        symbol: pos.symbol,
        assetClass: "EQUITY", // Default asset class
        quantity,
        averageCost,
        currentPrice,
        totalCost,
        currentValue,
        unrealizedPnl,
        weight,
      };
    });
  }
}
