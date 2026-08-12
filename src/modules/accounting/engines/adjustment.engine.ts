import { LedgerPostingEngine } from "./ledger-posting.engine.ts";
import { JournalRepository } from "../repositories/journal.repository.ts";
import { UniversalAuditRepository } from "../repositories/audit.repository.ts";

export class AdjustmentEngine {
  private postingEngine = new LedgerPostingEngine();
  private journalRepo = new JournalRepository();
  private auditRepo = new UniversalAuditRepository();

  async postAdjustmentJournal(req: {
    adjustmentType: "ADJUSTMENT" | "CORRECTION" | "REVERSAL" | "ACCRUAL" | "CLOSING";
    description: string;
    entries: { accountId: number; transactionType: "DEBIT" | "CREDIT"; amount: number }[];
    correlationId?: string;
  }) {
    const formattedDesc = `[${req.adjustmentType} JOURNAL] ${req.description}`;
    const result = await this.postingEngine.postTransaction({
      description: formattedDesc,
      entries: req.entries,
    }, req.correlationId);

    await this.auditRepo.log({
      correlationId: req.correlationId,
      category: "ACCOUNTING",
      action: `ADJUSTMENT_${req.adjustmentType}_POSTED`,
      details: {
        journalEntryId: result.journalEntryId,
        entryNumber: result.entryNumber,
        adjustmentType: req.adjustmentType,
      },
    });

    return {
      ...result,
      adjustmentType: req.adjustmentType,
    };
  }

  async postReversalJournal(originalJournalEntryId: number, reason?: string, correlationId?: string) {
    const original = await this.journalRepo.findEntryById(originalJournalEntryId);
    if (!original) {
      throw new Error(`Original Journal Entry ID ${originalJournalEntryId} not found.`);
    }
    if (original.status === "REVERSED") {
      throw new Error(`Journal Entry ID ${originalJournalEntryId} is already reversed.`);
    }

    const lines = await this.journalRepo.getLinesByEntryIds([originalJournalEntryId]);
    if (lines.length === 0) {
      throw new Error(`No line items found for Journal Entry ID ${originalJournalEntryId}.`);
    }

    // Reverse DEBIT <-> CREDIT
    const reversalEntries = lines.map(line => ({
      accountId: line.accountId!,
      transactionType: (line.transactionType === "DEBIT" ? "CREDIT" : "DEBIT") as "DEBIT" | "CREDIT",
      amount: parseFloat(line.amount),
    }));

    const result = await this.postAdjustmentJournal({
      adjustmentType: "REVERSAL",
      description: `Reversal of ${original.entryNumber}: ${reason || "Correction adjustment"}`,
      entries: reversalEntries,
      correlationId,
    });

    await this.journalRepo.updateEntryStatus(originalJournalEntryId, "REVERSED");

    return result;
  }
}
