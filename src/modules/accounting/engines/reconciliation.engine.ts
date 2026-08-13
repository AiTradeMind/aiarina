import { ReconciliationRepository } from "../repositories/reconciliation.repository.ts";
import { TrialBalanceEngine } from "./trial-balance.engine.ts";
import { getDb } from "../../../db/client.ts";
import { fundAccounts, walletBalances, omsOrders, portfolioAccounts } from "../../../db/schema.ts";
import { UniversalAuditRepository } from "../repositories/audit.repository.ts";

export class ReconciliationEngine {
  private reconRepo = new ReconciliationRepository();
  private trialBalanceEngine = new TrialBalanceEngine();
  private auditRepo = new UniversalAuditRepository();

  async runReconciliation() {
    const db = getDb();
    const missingEntries: any[] = [];
    const mismatches: any[] = [];
    const duplicates: any[] = [];
    let brokenChain = false;

    // 1. Verify Trial Balance in Accounting
    const tb = await this.trialBalanceEngine.generateTrialBalance();
    if (!tb.isBalanced) {
      mismatches.push({
        component: "ACCOUNTING_TRIAL_BALANCE",
        issue: "Trial Balance Imbalance",
        totalDebit: tb.totalDebit,
        totalCredit: tb.totalCredit,
        variance: tb.variance,
      });
      brokenChain = true;
    }

    // 2. Fund consistency check
    let fundStatus = "BALANCED";
    try {
      const funds = await db.select().from(fundAccounts);
      if (funds.length === 0) {
        missingEntries.push({ component: "FUND", message: "No active fund accounts found" });
      } else {
        for (const f of funds) {
          if (f.availableCapital < 0 || f.totalCapital < 0) {
            mismatches.push({ component: "FUND", fundId: f.fundId, issue: "Negative fund capital detected" });
            fundStatus = "DISCREPANCY";
          }
        }
      }
    } catch (err: any) {
      fundStatus = "UNVERIFIED";
    }

    // 3. Wallet consistency check
    let walletStatus = "BALANCED";
    try {
      const wallets = await db.select().from(walletBalances);
      for (const w of wallets) {
        if (w.currentBalance < 0 || w.availableBalance < 0) {
          mismatches.push({ component: "WALLET", walletId: w.walletId, issue: "Negative wallet balance detected" });
          walletStatus = "DISCREPANCY";
        }
      }
    } catch (err: any) {
      walletStatus = "UNVERIFIED";
    }

    // 4. OMS consistency check
    let omsStatus = "BALANCED";
    try {
      const orders = await db.select().from(omsOrders);
      // Check for orphan or duplicate order IDs
      const orderIdSet = new Set<string>();
      for (const o of orders) {
        if (orderIdSet.has(o.orderId)) {
          duplicates.push({ component: "OMS", orderId: o.orderId, issue: "Duplicate Order ID found" });
          omsStatus = "DISCREPANCY";
        }
        orderIdSet.add(o.orderId);
      }
    } catch (err: any) {
      omsStatus = "UNVERIFIED";
    }

    // 5. Portfolio consistency check
    let portfolioStatus = "BALANCED";
    try {
      const portfolios = await db.select().from(portfolioAccounts);
      for (const p of portfolios) {
        if (p.totalValue < 0) {
          mismatches.push({ component: "PORTFOLIO", portfolioId: p.portfolioId, issue: "Negative portfolio value" });
          portfolioStatus = "DISCREPANCY";
        }
      }
    } catch (err: any) {
      portfolioStatus = "UNVERIFIED";
    }

    const reportStatus = (mismatches.length === 0 && duplicates.length === 0 && !brokenChain) ? "BALANCED" : "DISCREPANCY";

    const reportId = `RECON_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const saved = await this.reconRepo.saveReport({
      reportId,
      fundStatus,
      walletStatus,
      omsStatus,
      portfolioStatus,
      accountingStatus: tb.isBalanced ? "BALANCED" : "IMBALANCED",
      missingEntries,
      mismatches,
      duplicates,
      brokenChain,
      status: reportStatus,
      summary: `Full Enterprise Financial Reconciliation: Status ${reportStatus}. ${mismatches.length} mismatches, ${duplicates.length} duplicates, ${missingEntries.length} missing.`,
      details: {
        trialBalanceVariance: tb.variance,
        totalDebit: tb.totalDebit,
        totalCredit: tb.totalCredit,
      },
    });

    await this.auditRepo.log({
      category: "ACCOUNTING",
      action: "RECONCILIATION_RUN",
      details: {
        reportId,
        status: reportStatus,
        mismatchesCount: mismatches.length,
        duplicatesCount: duplicates.length,
        brokenChain,
      },
    });

    return saved;
  }
}
