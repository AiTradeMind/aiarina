import { WalletRepository } from "../repositories/wallet.repository.ts";
import { BalanceEngineService } from "./balance-engine.service.ts";
import { TransactionEngineService } from "./transaction-engine.service.ts";
import { TransferDTO } from "../dtos/wallet.dto.ts";
import { WalletTransaction } from "../types/index.ts";
import { WalletValidator } from "../validators/wallet.validator.ts";
import logger from "../../../lib/logger.ts";

export class TransferEngineService {
  private static instance: TransferEngineService;
  private repository: WalletRepository;
  private balanceEngine: BalanceEngineService;
  private transactionEngine: TransactionEngineService;

  private constructor() {
    this.repository = WalletRepository.getInstance();
    this.balanceEngine = BalanceEngineService.getInstance();
    this.transactionEngine = TransactionEngineService.getInstance();
  }

  public static getInstance(): TransferEngineService {
    if (!TransferEngineService.instance) {
      TransferEngineService.instance = new TransferEngineService();
    }
    return TransferEngineService.instance;
  }

  public async executeTransfer(dto: TransferDTO): Promise<WalletTransaction> {
    WalletValidator.validateTransfer(dto);

    const source = await this.repository.getWalletAccountById(dto.sourceWalletId);
    if (!source) {
      throw new Error(`WALLET_NOT_FOUND: Source wallet '${dto.sourceWalletId}' does not exist.`);
    }
    if (source.status === "FROZEN" || source.status === "LOCKED" || source.status === "TERMINATED") {
      throw new Error(`WALLET_INACTIVE: Source wallet '${dto.sourceWalletId}' is currently ${source.status}.`);
    }

    const dest = await this.repository.getWalletAccountById(dto.destinationWalletId);
    if (!dest) {
      throw new Error(`WALLET_NOT_FOUND: Destination wallet '${dto.destinationWalletId}' does not exist.`);
    }
    if (dest.status === "FROZEN" || dest.status === "LOCKED" || dest.status === "TERMINATED") {
      throw new Error(`WALLET_INACTIVE: Destination wallet '${dto.destinationWalletId}' is currently ${dest.status}.`);
    }

    // Debit source
    await this.balanceEngine.debit(dto.sourceWalletId, dto.amount);

    // Credit destination
    await this.balanceEngine.credit(dto.destinationWalletId, dto.amount);

    // Record transaction & ledger entry
    const tx = await this.transactionEngine.createTransaction({
      transactionType: "TRANSFER",
      amount: dto.amount,
      referenceId: dto.referenceId,
      sourceWalletId: dto.sourceWalletId,
      destinationWalletId: dto.destinationWalletId,
      initiator: dto.initiator || "SYSTEM",
      metadata: { notes: dto.notes, ...dto.metadata },
    });

    logger.info(
      {
        transactionId: tx.transactionId,
        sourceWalletId: dto.sourceWalletId,
        destinationWalletId: dto.destinationWalletId,
        amount: dto.amount,
      },
      "Wallet Transfer Completed Successfully"
    );

    return tx;
  }
}
