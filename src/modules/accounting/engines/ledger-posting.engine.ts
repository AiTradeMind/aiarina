import { JournalEngine } from "./journal.engine.ts";
import { GeneralLedgerEngine } from "./general-ledger.engine.ts";
import { UniversalAuditRepository } from "../repositories/audit.repository.ts";
import { PostJournalEntryRequest } from "../types/index.ts";

export class LedgerPostingEngine {
  private journalEngine = new JournalEngine();
  private glEngine = new GeneralLedgerEngine();
  private auditRepo = new UniversalAuditRepository();

  async postTransaction(req: PostJournalEntryRequest, correlationId?: string) {
    // 1. Post Journal Entry (Double-Entry validation + Journal persistence)
    const journalResult = await this.journalEngine.createAndPostJournal(req, correlationId);

    // 2. Post each line to General Ledger
    const glResults = [];
    for (const line of req.entries) {
      const glRes = await this.glEngine.postLineToLedger(line);
      glResults.push(glRes);
    }

    // 3. Audit complete posting flow
    await this.auditRepo.log({
      correlationId,
      category: "ACCOUNTING",
      action: "LEDGER_POSTING_COMPLETED",
      details: {
        journalEntryId: journalResult.journalEntryId,
        entryNumber: journalResult.entryNumber,
        totalDebit: journalResult.totalDebit,
        totalCredit: journalResult.totalCredit,
        glUpdatesCount: glResults.length,
      },
    });

    return {
      success: true,
      journalEntryId: journalResult.journalEntryId,
      entryNumber: journalResult.entryNumber,
      totalDebit: journalResult.totalDebit,
      totalCredit: journalResult.totalCredit,
      certificateHash: journalResult.certificateHash,
      glUpdates: glResults,
    };
  }
}
