import { PortfolioAccount, PortfolioPosition, PortfolioSnapshot, SnapshotType } from "../types/index.ts";

export class SnapshotEngine {
  /**
   * Create an immutable snapshot record for a portfolio
   */
  static createSnapshot(
    account: PortfolioAccount,
    positions: PortfolioPosition[],
    type: SnapshotType = "PORTFOLIO",
    extraData: Record<string, any> = {}
  ): PortfolioSnapshot {
    const activePositions = positions.filter((p) => p.status !== "CLOSED" && p.status !== "ARCHIVED");
    const snapshotId = `SNP-${account.portfolioId}-${type}-${Date.now()}`;

    const snapshotData = {
      account,
      positionsCount: activePositions.length,
      positionsSummary: activePositions.map((p) => ({
        symbol: p.symbol,
        netQuantity: p.netQuantity,
        averagePrice: p.averagePrice,
        currentPrice: p.currentPrice,
        marketValue: p.marketValue,
        unrealizedPnl: p.unrealizedPnl,
        status: p.status,
      })),
      ...extraData,
    };

    return {
      snapshotId,
      portfolioId: account.portfolioId,
      snapshotType: type,
      totalValue: account.totalValue,
      unrealizedPnl: account.unrealizedPnl,
      realizedPnl: account.realizedPnl,
      grossExposure: account.grossExposure,
      netExposure: account.netExposure,
      positionCount: activePositions.length,
      data: snapshotData,
    };
  }
}
