import { CreateOrderDTO } from "../dtos/oms.dto.ts";
import { CreateOrderRequest } from "../types/index.ts";

export class OrderValidator {
  /**
   * Validates structure and parameter rules of an internal order creation request.
   */
  static validateOrderRequest(request: CreateOrderRequest): { valid: boolean; errors: string[] } {
    const dtoValidation = CreateOrderDTO.validate(request);
    const errors: string[] = [...dtoValidation.errors];

    // Business rule checks
    if (request.quantity && request.quantity > 10000000) {
      errors.push("Order quantity exceeds maximum single order threshold (10,000,000 units)");
    }

    if (request.symbol && request.symbol.trim().length === 0) {
      errors.push("Symbol cannot be empty");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
