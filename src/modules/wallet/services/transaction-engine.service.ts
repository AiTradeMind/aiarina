import { WalletRepository } from "../repositories/wallet.repository.ts";
import { LedgerEngineService } from "./ledger-engine.service.ts";
import { WalletTransaction } from "../types/index.ts";
import { TransactionType, TransactionStatus } from "../constants/index.ts";
import logger from "../../../lib/logger.ts";

export class TransactionEngineService {
  private static instance: TransactionEngineService;
  private repository: WalletRepository;
  private ledgerEngine: LedgerEngineService;

  private constructor() {
    this.repository = WalletRepository.getInstance();
    this.ledgerEngine = LedgerEngineService.getInstance();
  }

  public static getInstance(): TransactionEngineService {
    if (!TransactionEngineService.instance) {
      TransactionEngineService.instance = new TransactionEngineService();
    }
    return TransactionEngineService.instance;
  }

  public async createTransaction(params: {
    transactionType: TransactionType;
    amount: number;
    referenceId?: string;
    sourceWalletId?: string | null;
    destinationWalletId?: string | null;
    initiator?: string;
    status?: TransactionStatus;
    failureReason?: string;
    metadata?: Record<string, any>;
  }): Promise<WalletTransaction> {
    const transactionId = `TX-W-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const referenceId = params.referenceId || `REF-${transactionId}`;
    const status = params.status || "SUCCESS";

    const tx: WalletTransaction = {
      transactionId,
      referenceId,
      sourceWalletId: params.sourceWalletId || null,
      destinationWalletId: params.destinationWalletId || null,
      amount: params.amount,
      transactionType: params.transactionType,
      status,
      failureReason: params.failureReason || null,
      initiator: params.initiator || "SYSTEM",
      metadata: params.metadata || {},
      createdAt: new Date(),
    };

    const recordedTx = await this.repository.recordTransaction(tx);

    // Also record immutable ledger entry if status is SUCCESS
    if (status === "SUCCESS") {
      await this.ledgerEngine.recordEntry({
        transactionId: recordedTx.transactionId,
        referenceId: recordedTx.referenceId,
        sourceWalletId: recordedTx.sourceWalletId,
        destinationWalletId: recordedTx.destinationWalletId,
        amount: recordedTx.amount,
        transactionType: recordedTx.transactionType,
        initiator: recordedTx.initiator,
        metadata: recordedTx.metadata,
      });
    }

    logger.info(
      {
        transactionId: recordedTx.transactionId,
        transactionType: recordedTx.transactionType,
        amount: recordedTx.amount,
        status: recordedTx.status,
      },
      "Wallet Transaction Recorded"
    );

    return recordedTx;
  }

  public async getTransactions(walletId?: string, limit: number = 100): Promise<WalletTransaction[]> {
    return this.repository.getTransactions(walletId, limit);
  }
}
