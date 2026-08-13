import { OMSExecutionUpdate, PortfolioAccount, PortfolioPosition } from "../types/index.ts";

export class PortfolioValidator {
  /**
   * Validate Governance - Portfolio receives updates ONLY from OMS
   */
  static validateGovernance(execution: OMSExecutionUpdate, source?: string): { passed: boolean; message: string } {
    if (source && source !== "OMS") {
      return {
        passed: false,
        message: `Governance Rejected: Execution updates are accepted ONLY from OMS. Source '${source}' is prohibited.`,
      };
    }

    if (!execution.orderId) {
      return {
        passed: false,
        message: "Governance Rejected: Missing valid OMS Order ID.",
      };
    }

    return {
      passed: true,
      message: "Governance validation passed: Verified OMS source.",
    };
  }

  /**
   * Validate Portfolio Account status & existence
   */
  static validatePortfolio(account?: PortfolioAccount | null): { passed: boolean; message: string } {
    if (!account) {
      return {
        passed: false,
        message: "Portfolio Validation Failed: Portfolio Account not found.",
      };
    }

    if (account.status !== "ACTIVE") {
      return {
        passed: false,
        message: `Portfolio Validation Failed: Portfolio '${account.portfolioId}' is ${account.status}.`,
      };
    }

    return {
      passed: true,
      message: `Portfolio Validation Passed: '${account.portfolioId}' is ACTIVE.`,
    };
  }

  /**
   * Validate Position Execution Update parameters
   */
  static validatePositionUpdate(execution: OMSExecutionUpdate, currentPosition?: PortfolioPosition | null): { passed: boolean; message: string } {
    if (!execution.symbol || execution.symbol.trim() === "") {
      return { passed: false, message: "Position Validation Failed: Symbol is required." };
    }

    if (execution.filledQuantity <= 0) {
      return { passed: false, message: "Position Validation Failed: Quantity must be > 0." };
    }

    if (execution.averageFillPrice <= 0) {
      return { passed: false, message: "Position Validation Failed: Average fill price must be > 0." };
    }

    if (currentPosition && currentPosition.status === "ARCHIVED") {
      return { passed: false, message: "Position Validation Failed: Cannot update an ARCHIVED position." };
    }

    return {
      passed: true,
      message: "Position Validation Passed: Valid parameters for position update.",
    };
  }
}
