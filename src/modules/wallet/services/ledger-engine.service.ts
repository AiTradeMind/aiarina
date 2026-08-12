import { WalletRepository } from "../repositories/wallet.repository.ts";
import { LedgerEntry } from "../types/index.ts";
import { TransactionType } from "../constants/index.ts";
import logger from "../../../lib/logger.ts";

export class LedgerEngineService {
  private static instance: LedgerEngineService;
  private repository: WalletRepository;

  private constructor() {
    this.repository = WalletRepository.getInstance();
  }

  public static getInstance(): LedgerEngineService {
    if (!LedgerEngineService.instance) {
      LedgerEngineService.instance = new LedgerEngineService();
    }
    return LedgerEngineService.instance;
  }

  public async recordEntry(params: {
    transactionId: string;
    referenceId: string;
    sourceWalletId?: string | null;
    destinationWalletId?: string | null;
    amount: number;
    transactionType: TransactionType;
    initiator?: string;
    metadata?: Record<string, any>;
  }): Promise<LedgerEntry> {
    const entrySeq = await this.repository.getNextLedgerSeq();
    const ledgerId = `LEDGER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const entry: LedgerEntry = {
      ledgerId,
      transactionId: params.transactionId,
      referenceId: params.referenceId,
      sourceWalletId: params.sourceWalletId || null,
      destinationWalletId: params.destinationWalletId || null,
      amount: params.amount,
      transactionType: params.transactionType,
      entrySeq,
      initiator: params.initiator || "SYSTEM",
      metadata: params.metadata || {},
      createdAt: new Date(),
    };

    const saved = await this.repository.recordLedgerEntry(entry);

    logger.info(
      {
        ledgerId: saved.ledgerId,
        entrySeq: saved.entrySeq,
        transactionId: saved.transactionId,
        transactionType: saved.transactionType,
        amount: saved.amount,
      },
      "Immutable Ledger Entry Recorded"
    );

    return saved;
  }

  public async getLedgerHistory(walletId?: string, limit: number = 100): Promise<LedgerEntry[]> {
    return this.repository.getLedgerEntries(walletId, limit);
  }

  public async verifyImmutability(walletId?: string): Promise<{ valid: boolean; totalEntries: number }> {
    const entries = await this.repository.getLedgerEntries(walletId, 1000);
    // Ledger entries are sequential and non-empty
    let valid = true;
    for (let i = 0; i < entries.length - 1; i++) {
      if (entries[i].entrySeq <= entries[i + 1].entrySeq) {
        valid = false;
        break;
      }
    }
    return { valid, totalEntries: entries.length };
  }
}
