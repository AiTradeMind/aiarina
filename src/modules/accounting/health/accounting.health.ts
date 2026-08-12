import { TrialBalanceEngine } from "../engines/trial-balance.engine.ts";
import { ReconciliationEngine } from "../engines/reconciliation.engine.ts";

export class AccountingHealthService {
  private tbEngine = new TrialBalanceEngine();
  private reconEngine = new ReconciliationEngine();

  async checkHealth() {
    let tbStatus = "HEALTHY";
    let tbDetails = null;

    try {
      const tb = await this.tbEngine.generateTrialBalance();
      tbStatus = tb.isBalanced ? "HEALTHY" : "UNBALANCED";
      tbDetails = { variance: tb.variance, isBalanced: tb.isBalanced };
    } catch (err: any) {
      tbStatus = "ERROR";
      tbDetails = { error: err.message };
    }

    return {
      module: "ENTERPRISE_ACCOUNTING",
      status: tbStatus === "HEALTHY" ? "UP" : "DEGRADED",
      checks: {
        trialBalance: tbStatus,
        details: tbDetails,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
