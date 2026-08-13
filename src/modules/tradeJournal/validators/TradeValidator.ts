export class TradeValidator {
  public validateTradePayload(payload: any): void {
    if (!payload.organizationId || !payload.portfolioId || !payload.positionId) {
      throw new Error("Missing required identifiers (organizationId, portfolioId, positionId)");
    }

    if (!payload.symbol || !payload.action || !payload.side) {
      throw new Error("Missing trade details (symbol, action, side)");
    }

    const qty = parseFloat(payload.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid quantity: ${payload.quantity}. Must be positive.`);
    }

    const price = parseFloat(payload.price);
    if (isNaN(price) || price < 0) {
      throw new Error(`Invalid price: ${payload.price}. Must be non-negative.`);
    }
    
    // Prevent duplicate entries? Handled by immutability/ledger checks if needed
  }
}

export const tradeValidator = new TradeValidator();
