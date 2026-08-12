import { PolicyViolation } from "../types/governance.types.ts";

export interface PolicyCheckResult {
  passed: boolean;
  violations: Omit<PolicyViolation, "sessionId">[];
  score: number;
}

export class PolicyEngine {
  private approvedModels = ["MDL-GEMINI-25-FLASH", "MDL-CLAUDE-35-SONNET", "MDL-OPENAI-GPT4O", "MDL-DEEPSEEK-R1", "MDL-MISTRAL-LARGE-2", "MDL-LLAMA-33-70B"];

  public evaluatePolicies(params: {
    modelId?: string;
    requestPayload: any;
    responsePayload: any;
  }): PolicyCheckResult {
    const { modelId, requestPayload, responsePayload } = params;
    const violations: Omit<PolicyViolation, "sessionId">[] = [];
    let score = 100;

    const payloadStr = JSON.stringify(requestPayload || {}) + JSON.stringify(responsePayload || {});

    // 1. Model Whitelist Check
    if (modelId && !this.approvedModels.includes(modelId)) {
      score -= 20;
      violations.push({
        policyName: "Model Whitelist Policy",
        policyType: "PROVIDER",
        violationDetails: `The model ${modelId} is not on the approved corporate whitelist.`,
        severity: "HIGH"
      });
    }

    // 2. Strict Trading Decoupling Policy (AAOS Rule #1)
    const isTradingAction = /execute_trade|place_order|buy_stock|sell_stock|submit_order/i.test(payloadStr);
    if (isTradingAction) {
      score -= 50;
      violations.push({
        policyName: "Strict Trading Decoupling Policy",
        policyType: "CONSTITUTION",
        violationDetails: "Crucial Infraction: Unauthorized attempt to invoke trade execution or order submission from within the AI ecosystem.",
        severity: "CRITICAL"
      });
    }

    // 3. AAOS Constitution Check: Human-In-The-Loop Enforcement
    const requestObject = typeof requestPayload === "object" ? requestPayload : {};
    if (requestObject && requestObject.bypassHumanReview === true) {
      score -= 30;
      violations.push({
        policyName: "AAOS Constitution Core Policy",
        policyType: "CONSTITUTION",
        violationDetails: "Attempted to bypass required human-in-the-loop oversight on sensitive model outputs.",
        severity: "HIGH"
      });
    }

    // 4. Content Risk & Business Limits
    if (payloadStr.length > 500000) {
      score -= 10;
      violations.push({
        policyName: "Business Context Boundary Policy",
        policyType: "BUSINESS",
        violationDetails: "Payload size exceeds standard corporate risk limits (500KB limit).",
        severity: "LOW"
      });
    }

    // Ensure score doesn't dip below 0
    score = Math.max(0, score);

    return {
      passed: violations.length === 0,
      violations,
      score
    };
  }
}
