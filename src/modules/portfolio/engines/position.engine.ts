import { OMSExecutionUpdate, PortfolioPosition, PositionStatus } from "../types/index.ts";
import { PositionStateMachine } from "../state-machine/position-state-machine.ts";

export class PositionEngine {
  /**
   * Process execution update to calculate new or updated position object
   */
  static processExecution(
    execution: OMSExecutionUpdate,
    existingPosition?: PortfolioPosition | null
  ): { position: PortfolioPosition; eventType: "POSITION_OPENED" | "POSITION_INCREASED" | "POSITION_REDUCED" | "POSITION_CLOSED" } {
    const executedQty = execution.side === "BUY" ? execution.filledQuantity : -execution.filledQuantity;
    const executedPrice = execution.averageFillPrice;

    if (!existingPosition) {
      // New position opening
      const netQty = executedQty;
      const avgPrice = executedPrice;
      const costValue = Math.abs(netQty) * avgPrice;
      const marketValue = costValue;
      const unrealizedPnl = 0.0;
      const realizedPnl = 0.0;
      const totalPnl = 0.0;
      const capitalUsed = costValue;
      const exposure = marketValue;
      const positionId = `POS-${execution.portfolioId}-${execution.symbol}-${Date.now()}`;

      const newPos: PortfolioPosition = {
        positionId,
        portfolioId: execution.portfolioId,
        symbol: execution.symbol,
        positionType: execution.positionType || "DELIVERY",
        status: "OPEN",
        netQuantity: netQty,
        averagePrice: avgPrice,
        currentPrice: executedPrice,
        marketValue,
        costValue,
        unrealizedPnl,
        realizedPnl,
        todaysPnl: 0.0,
        totalPnl,
        roi: 0.0,
        capitalUsed,
        exposure,
        holdingPeriodDays: 0,
      };

      return { position: newPos, eventType: "POSITION_OPENED" };
    }

    // Existing position update
    const currentNetQty = existingPosition.netQuantity;
    const currentAvgPrice = existingPosition.averagePrice;
    let newNetQty = currentNetQty + executedQty;

    let targetStatus: PositionStatus = existingPosition.status;
    let eventType: "POSITION_INCREASED" | "POSITION_REDUCED" | "POSITION_CLOSED" = "POSITION_INCREASED";
    let newAvgPrice = currentAvgPrice;
    let addedRealizedPnl = 0.0;

    const isSameDirection = (currentNetQty > 0 && executedQty > 0) || (currentNetQty < 0 && executedQty < 0);

    if (isSameDirection) {
      // Position size increased
      const totalCost = Math.abs(currentNetQty) * currentAvgPrice + Math.abs(executedQty) * executedPrice;
      const totalQty = Math.abs(newNetQty);
      newAvgPrice = totalQty > 0 ? totalCost / totalQty : 0.0;
      targetStatus = "INCREASED";
      eventType = "POSITION_INCREASED";
    } else {
      // Position reduced or closed
      const closedQty = Math.min(Math.abs(currentNetQty), Math.abs(executedQty));
      if (currentNetQty > 0) {
        // Was Long, selling to reduce
        addedRealizedPnl = closedQty * (executedPrice - currentAvgPrice);
      } else {
        // Was Short, buying back to reduce
        addedRealizedPnl = closedQty * (currentAvgPrice - executedPrice);
      }

      if (Math.abs(newNetQty) < 1e-6) {
        // Position fully closed
        newNetQty = 0;
        newAvgPrice = 0;
        targetStatus = "CLOSED";
        eventType = "POSITION_CLOSED";
      } else if ((currentNetQty > 0 && newNetQty < 0) || (currentNetQty < 0 && newNetQty > 0)) {
        // Position flipped direction
        newAvgPrice = executedPrice;
        targetStatus = "OPEN";
        eventType = "POSITION_REDUCED";
      } else {
        // Position partially reduced
        targetStatus = "PARTIALLY_CLOSED";
        eventType = "POSITION_REDUCED";
      }
    }

    // Verify state transition validity
    PositionStateMachine.assertTransition(existingPosition.status, targetStatus);

    const costValue = Math.abs(newNetQty) * newAvgPrice;
    const currentPrice = executedPrice;
    const marketValue = Math.abs(newNetQty) * currentPrice;

    // Calculate unrealized PnL based on direction
    let unrealizedPnl = 0.0;
    if (newNetQty > 0) {
      unrealizedPnl = (currentPrice - newAvgPrice) * newNetQty;
    } else if (newNetQty < 0) {
      unrealizedPnl = (newAvgPrice - currentPrice) * Math.abs(newNetQty);
    }

    const realizedPnl = existingPosition.realizedPnl + addedRealizedPnl;
    const totalPnl = realizedPnl + unrealizedPnl;
    const roi = costValue > 0 ? (totalPnl / costValue) * 100 : 0.0;
    const capitalUsed = costValue;
    const exposure = marketValue;

    const updatedPos: PortfolioPosition = {
      ...existingPosition,
      status: targetStatus,
      netQuantity: newNetQty,
      averagePrice: newAvgPrice,
      currentPrice,
      marketValue,
      costValue,
      unrealizedPnl,
      realizedPnl,
      totalPnl,
      roi,
      capitalUsed,
      exposure,
    };

    return { position: updatedPos, eventType };
  }
}
