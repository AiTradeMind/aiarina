import { indianMarketRepo } from "../repositories/IndianMarketRepository.ts";
import { IndianPolicyRules, IndianMarketPolicy } from "../types/index.ts";

export class IndianMarketPolicyEngine {
  /**
   * Retrieves the rules of a specified policy.
   * Leverages repository lookup with local static fallbacks.
   */
  async getPolicyRules(policyName: 'NSE_POLICY' | 'BSE_POLICY' | 'MCX_POLICY' | 'PAPER_POLICY' | 'LIVE_POLICY' | 'EMERGENCY_POLICY'): Promise<IndianPolicyRules> {
    const policies = await indianMarketRepo.getPolicies();
    const policy = policies.find(p => p.policyName === policyName);
    
    if (policy) {
      return policy.rules;
    }

    // Static fallback rules in case of any database issues
    const fallbacks: Record<string, IndianPolicyRules> = {
      NSE_POLICY: {
        tradingAllowed: true,
        maxLeverage: 5,
        shortSellingEnabled: true,
        circuitBreakerPercentage: 10,
        allowedSegments: ["EQUITY", "DERIVATIVES", "CURRENCY"]
      },
      BSE_POLICY: {
        tradingAllowed: true,
        maxLeverage: 5,
        shortSellingEnabled: true,
        circuitBreakerPercentage: 10,
        allowedSegments: ["EQUITY", "DERIVATIVES"]
      },
      MCX_POLICY: {
        tradingAllowed: true,
        maxLeverage: 10,
        shortSellingEnabled: false,
        circuitBreakerPercentage: 6,
        allowedSegments: ["COMMODITY"]
      },
      PAPER_POLICY: {
        tradingAllowed: true,
        maxLeverage: 1,
        shortSellingEnabled: true,
        circuitBreakerPercentage: 20,
        allowedSegments: ["EQUITY", "DERIVATIVES", "COMMODITY"]
      },
      LIVE_POLICY: {
        tradingAllowed: true,
        maxLeverage: 1,
        shortSellingEnabled: false,
        circuitBreakerPercentage: 10,
        allowedSegments: ["EQUITY"]
      },
      EMERGENCY_POLICY: {
        tradingAllowed: false,
        maxLeverage: 0,
        shortSellingEnabled: false,
        circuitBreakerPercentage: 0,
        allowedSegments: []
      }
    };

    return fallbacks[policyName] || fallbacks.LIVE_POLICY;
  }

  /**
   * Verifies if a given trade parameters satisfy the policy rules.
   */
  async validateTradeAgainstPolicy(
    policyName: 'NSE_POLICY' | 'BSE_POLICY' | 'MCX_POLICY' | 'PAPER_POLICY' | 'LIVE_POLICY' | 'EMERGENCY_POLICY',
    segment: string,
    requestedLeverage: number,
    isShortSale: boolean
  ): Promise<{ isAllowed: boolean; reason?: string }> {
    const rules = await this.getPolicyRules(policyName);

    if (!rules.tradingAllowed) {
      return { isAllowed: false, reason: `Policy '${policyName}' blocks all trading activities.` };
    }

    if (!rules.allowedSegments.includes(segment.toUpperCase())) {
      return { isAllowed: false, reason: `Segment '${segment}' is not permitted by Policy '${policyName}'. Allowed: [${rules.allowedSegments.join(', ')}]` };
    }

    if (requestedLeverage > rules.maxLeverage) {
      return { isAllowed: false, reason: `Requested leverage ${requestedLeverage}x exceeds max limit of ${rules.maxLeverage}x in Policy '${policyName}'.` };
    }

    if (isShortSale && !rules.shortSellingEnabled) {
      return { isAllowed: false, reason: `Short selling is strictly prohibited under Policy '${policyName}'.` };
    }

    return { isAllowed: true };
  }

  /**
   * Dynamically tunes or modifies policy rules.
   */
  async updatePolicyRules(policyName: 'NSE_POLICY' | 'BSE_POLICY' | 'MCX_POLICY' | 'PAPER_POLICY' | 'LIVE_POLICY' | 'EMERGENCY_POLICY', rules: IndianPolicyRules): Promise<void> {
    await indianMarketRepo.updatePolicyRules(policyName, rules);
    await indianMarketRepo.logEvent("PolicyUpdated", { policyName, rules });
  }

  /**
   * Fetches all registered regulatory policies.
   */
  async getPolicies(): Promise<IndianMarketPolicy[]> {
    return await indianMarketRepo.getPolicies();
  }
}

export const indianMarketPolicyEngine = new IndianMarketPolicyEngine();
