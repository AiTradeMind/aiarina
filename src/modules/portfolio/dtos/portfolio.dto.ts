import { OMSExecutionUpdate, PositionType } from "../types/index.ts";

export class OMSExecutionDTO {
  static validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      return { valid: false, errors: ["Request body is required"] };
    }

    if (!data.orderId || typeof data.orderId !== "string") {
      errors.push("orderId is required and must be a string");
    }

    if (!data.symbol || typeof data.symbol !== "string") {
      errors.push("symbol is required and must be a string");
    }

    if (!data.side || (data.side !== "BUY" && data.side !== "SELL")) {
      errors.push("side must be BUY or SELL");
    }

    if (typeof data.filledQuantity !== "number" || data.filledQuantity <= 0) {
      errors.push("filledQuantity must be a positive number");
    }

    if (typeof data.averageFillPrice !== "number" || data.averageFillPrice <= 0) {
      errors.push("averageFillPrice must be a positive number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static fromPayload(data: any): OMSExecutionUpdate {
    return {
      orderId: data.orderId,
      portfolioId: data.portfolioId || "PF-MAIN-001",
      symbol: data.symbol,
      side: data.side,
      filledQuantity: Number(data.filledQuantity),
      averageFillPrice: Number(data.averageFillPrice),
      positionType: (data.positionType as PositionType) || "DELIVERY",
      assetClass: data.assetClass || "EQUITY",
      sector: data.sector || "GENERAL",
      executedAt: data.executedAt || new Date().toISOString(),
    };
  }
}
