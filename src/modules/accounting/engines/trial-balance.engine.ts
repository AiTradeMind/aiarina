import { AccountingRepository } from "../repositories/accounting.repository.ts";
import { LedgerRepository } from "../repositories/ledger.repository.ts";
import { TrialBalanceResult, TrialBalanceAccount, AccountType } from "../types/index.ts";

export class TrialBalanceEngine {
  private accountingRepo = new AccountingRepository();
  private ledgerRepo = new LedgerRepository();

  async generateTrialBalance(periodId?: number): Promise<TrialBalanceResult> {
    const accounts = await this.accountingRepo.findAllAccounts();
    const gls = await this.ledgerRepo.getAllGeneralLedgerAccounts();

    const glMap = new Map<number, number>();
    gls.forEach(gl => {
      if (gl.accountId !== null) glMap.set(gl.accountId, parseFloat(gl.currentBalance || "0"));
    });

    let totalDebit = 0;
    let totalCredit = 0;

    const tbAccounts: TrialBalanceAccount[] = accounts.map(acc => {
      const bal = glMap.get(acc.id) || 0;
      let debitBalance = 0;
      let creditBalance = 0;

      // Normal balance rules:
      // Asset & Expense -> Normal DEBIT balance
      // Liability, Equity, Revenue -> Normal CREDIT balance
      if (acc.accountType === "ASSET" || acc.accountType === "EXPENSE") {
        if (bal >= 0) debitBalance = bal;
        else creditBalance = Math.abs(bal);
      } else {
        if (bal >= 0) creditBalance = bal;
        else debitBalance = Math.abs(bal);
      }

      totalDebit += debitBalance;
      totalCredit += creditBalance;

      return {
        accountId: acc.id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.accountType as AccountType,
        debitBalance,
        creditBalance,
        netBalance: bal,
      };
    });

    const variance = Math.abs(totalDebit - totalCredit);
    const isBalanced = variance < 0.01;

    return {
      periodId: periodId || null,
      periodName: periodId ? `Period-${periodId}` : "Current Operating State",
      isBalanced,
      totalDebit,
      totalCredit,
      variance,
      accounts: tbAccounts,
      generatedAt: new Date().toISOString(),
    };
  }
}
