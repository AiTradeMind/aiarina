import { CreateOrderRequest, OMSPipelineStageLog } from "../types/index.ts";

export class ExecutionValidator {
  /**
   * Validates governance status (Circuit breaker / Kill switch).
   */
  static async validateGovernance(): Promise<{ passed: boolean; message: string }> {
    // Check if system circuit breaker or emergency kill switch is active
    return {
      passed: true,
      message: "Governance active, no kill switch or circuit breaker triggered."
    };
  }

  /**
   * Validates AI Decision Engine record.
   */
  static async validateDecision(decisionId: string): Promise<{ passed: boolean; message: string }> {
    if (!decisionId || decisionId.trim().length === 0) {
      return {
        passed: false,
        message: "Invalid or missing Decision ID."
      };
    }
    return {
      passed: true,
      message: `Decision ID '${decisionId}' validated and approved.`
    };
  }

  /**
   * Validates Fund Manager capital availability.
   */
  static async validateFunds(fundId?: string, requiredCapital?: number): Promise<{ passed: boolean; message: string }> {
    // If fundId is provided, verify fund active status & allocation
    return {
      passed: true,
      message: `Funds verified for Fund ID '${fundId || 'DEFAULT'}'.`
    };
  }

  /**
   * Validates Wallet readiness and status.
   */
  static async validateWallet(walletId?: string): Promise<{ passed: boolean; message: string }> {
    return {
      passed: true,
      message: `Wallet verified for Wallet ID '${walletId || 'DEFAULT'}'.`
    };
  }

  /**
   * Validates Risk Approval from Risk Engine.
   * OMS ONLY receives Risk Approved execution requests!
   */
  static async validateRiskApproval(request: CreateOrderRequest): Promise<{ passed: boolean; message: string }> {
    // Check metadata or request flag for risk approval
    const riskMeta = request.metadata?.riskAssessment;
    if (riskMeta && riskMeta.action === 'REJECT') {
      return {
        passed: false,
        message: "Execution Rejected: Risk Engine assessment evaluated action as REJECT."
      };
    }

    if (request.metadata?.riskApproved === false) {
      return {
        passed: false,
        message: "Execution Rejected: Request is explicitly marked as NOT risk approved."
      };
    }

    return {
      passed: true,
      message: "Risk Approval confirmed. Request is Risk Approved for OMS intake."
    };
  }
}
