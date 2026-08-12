import { LedgerRepository } from "../repositories/ledger.repository.ts";
import { AccountingRepository } from "../repositories/accounting.repository.ts";
import { UniversalAuditRepository } from "../repositories/audit.repository.ts";

export class GeneralLedgerEngine {
  private ledgerRepo = new LedgerRepository();
  private accountingRepo = new AccountingRepository();
  private auditRepo = new UniversalAuditRepository();

  async postLineToLedger(line: {
    accountId: number;
    transactionType: "DEBIT" | "CREDIT";
    amount: number;
  }) {
    const account = await this.accountingRepo.findAccountById(line.accountId);
    if (!account) {
      throw new Error(`Account ID ${line.accountId} not found in Chart of Accounts.`);
    }

    const glAcc = await this.ledgerRepo.getGeneralLedgerAccount(line.accountId);
    const currentBal = glAcc ? parseFloat(glAcc.currentBalance || "0") : 0;

    // Normal balance update rules:
    // Asset & Expense: Debit +, Credit -
    // Liability, Equity, Revenue: Credit +, Debit -
    let newBal = currentBal;
    if (account.accountType === "ASSET" || account.accountType === "EXPENSE") {
      if (line.transactionType === "DEBIT") newBal += line.amount;
      else newBal -= line.amount;
    } else {
      if (line.transactionType === "CREDIT") newBal += line.amount;
      else newBal -= line.amount;
    }

    // Update General Ledger Balance
    const updatedGl = await this.ledgerRepo.updateBalance(line.accountId, newBal);

    // Update running Account Balances
    const runningBal = newBal;
    await this.accountingRepo.upsertAccountBalances({
      accountId: line.accountId,
      accountCode: account.accountCode,
      openingBalance: currentBal,
      closingBalance: newBal,
      currentBalance: newBal,
      runningBalance: runningBal,
      debitTotal: line.transactionType === "DEBIT" ? line.amount : 0,
      creditTotal: line.transactionType === "CREDIT" ? line.amount : 0,
      periodBalance: newBal,
      carryForward: newBal,
    });

    return {
      accountId: line.accountId,
      accountCode: account.accountCode,
      previousBalance: currentBal,
      newBalance: newBal,
      updatedGl,
    };
  }

  async getAccountTransactions(accountId: number) {
    const account = await this.accountingRepo.findAccountById(accountId);
    const gl = await this.ledgerRepo.getGeneralLedgerAccount(accountId);
    const txs = await this.ledgerRepo.getTransactionsByAccountId(accountId);

    return {
      account,
      currentBalance: gl ? parseFloat(gl.currentBalance || "0") : 0,
      transactions: txs.map(t => ({
        ...t,
        amount: parseFloat(t.amount),
        balanceAfter: t.balanceAfter ? parseFloat(t.balanceAfter) : null,
      })),
    };
  }

  async getAllGeneralLedgers() {
    const gls = await this.ledgerRepo.getAllGeneralLedgerAccounts();
    const accounts = await this.accountingRepo.findAllAccounts();
    const accMap = new Map<number, any>();
    accounts.forEach(a => accMap.set(a.id, a));

    return gls.map(gl => {
      const acc = gl.accountId ? accMap.get(gl.accountId) : null;
      return {
        id: gl.id,
        accountId: gl.accountId,
        accountCode: acc?.accountCode || "",
        accountName: acc?.accountName || "",
        accountType: acc?.accountType || "",
        currentBalance: parseFloat(gl.currentBalance || "0"),
        lastUpdated: gl.lastUpdated,
      };
    }).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }
}
