import { JournalRepository } from "../repositories/journal.repository.ts";
import { AccountingRepository } from "../repositories/accounting.repository.ts";
import { UniversalAuditRepository } from "../repositories/audit.repository.ts";
import { PostJournalEntryRequest } from "../types/index.ts";
import crypto from "crypto";

export class JournalEngine {
  private journalRepo = new JournalRepository();
  private accountingRepo = new AccountingRepository();
  private auditRepo = new UniversalAuditRepository();

  validateDoubleEntry(entries: { accountId: number; transactionType: "DEBIT" | "CREDIT"; amount: number }[]) {
    if (!entries || entries.length === 0) {
      throw new Error("Journal entry must contain at least one line item.");
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      if (entry.amount <= 0) {
        throw new Error(`Invalid line item amount ${entry.amount}. Amount must be positive.`);
      }
      if (entry.transactionType === "DEBIT") {
        totalDebit += entry.amount;
      } else if (entry.transactionType === "CREDIT") {
        totalCredit += entry.amount;
      } else {
        throw new Error(`Invalid transaction type: ${entry.transactionType}`);
      }
    }

    const variance = Math.abs(totalDebit - totalCredit);
    if (variance > 0.0001) {
      throw new Error(`Double Entry Imbalance Violation: Total Debits (${totalDebit.toFixed(2)}) do not equal Total Credits (${totalCredit.toFixed(2)}). Variance: ${variance.toFixed(4)}.`);
    }

    return { totalDebit, totalCredit, isBalanced: true };
  }

  async createAndPostJournal(req: PostJournalEntryRequest, correlationId?: string) {
    // 1. Validate Double Entry balance
    const { totalDebit, totalCredit } = this.validateDoubleEntry(req.entries);

    // 2. Ensure all referenced accounts exist
    for (const line of req.entries) {
      const acc = await this.accountingRepo.findAccountById(line.accountId);
      if (!acc) {
        throw new Error(`Account ID ${line.accountId} not found in Chart of Accounts.`);
      }
    }

    // 3. Create Journal Entry
    const entryNumber = "JE_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    const entry = await this.journalRepo.createEntry({
      entryNumber,
      tradeId: req.tradeId || null,
      description: req.description,
      entryDate: req.entryDate ? new Date(req.entryDate) : new Date(),
      totalDebit,
      totalCredit,
      status: "POSTED",
    });

    // 4. Create Ledger Transaction Lines
    const createdLines = [];
    for (const line of req.entries) {
      const createdLine = await this.journalRepo.createLine({
        journalEntryId: entry.id,
        accountId: line.accountId,
        transactionType: line.transactionType,
        amount: line.amount,
      });
      createdLines.push(createdLine);
    }

    // 5. Generate SHA-256 Proof Certificate
    const certHash = crypto.createHash("sha256")
      .update(JSON.stringify({ entryId: entry.id, entryNumber, totalDebit, totalCredit, entries: req.entries, timestamp: new Date() }))
      .digest("hex");

    // 6. Log Audit Event
    await this.auditRepo.log({
      correlationId,
      category: "ACCOUNTING",
      action: "JOURNAL_POSTED",
      details: {
        journalEntryId: entry.id,
        entryNumber,
        totalDebit,
        totalCredit,
        description: req.description,
        certificate: certHash,
      },
    });

    return {
      success: true,
      journalEntryId: entry.id,
      entryNumber,
      totalDebit,
      totalCredit,
      certificateHash: certHash,
      lines: createdLines,
    };
  }

  async getJournalHistory(filters?: { tradeId?: number; status?: string }) {
    return await this.journalRepo.findEntries(filters);
  }
}
