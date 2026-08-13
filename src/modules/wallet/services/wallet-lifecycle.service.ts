import { WalletRepository } from "../repositories/wallet.repository.ts";
import { BalanceEngineService } from "./balance-engine.service.ts";
import { TransactionEngineService } from "./transaction-engine.service.ts";
import { WalletAccount, WalletBalance } from "../types/index.ts";
import { LockFundsDTO, UnlockFundsDTO } from "../dtos/wallet.dto.ts";
import { WalletValidator } from "../validators/wallet.validator.ts";
import logger from "../../../lib/logger.ts";

export class WalletLifecycleService {
  private static instance: WalletLifecycleService;
  private repository: WalletRepository;
  private balanceEngine: BalanceEngineService;
  private transactionEngine: TransactionEngineService;

  private constructor() {
    this.repository = WalletRepository.getInstance();
    this.balanceEngine = BalanceEngineService.getInstance();
    this.transactionEngine = TransactionEngineService.getInstance();
  }

  public static getInstance(): WalletLifecycleService {
    if (!WalletLifecycleService.instance) {
      WalletLifecycleService.instance = new WalletLifecycleService();
    }
    return WalletLifecycleService.instance;
  }

  public async freezeWallet(walletId: string, reason: string, actorId: string = "SYSTEM"): Promise<WalletAccount> {
    const wallet = await this.repository.getWalletAccountById(walletId);
    if (!wallet) {
      throw new Error(`WALLET_NOT_FOUND: Wallet '${walletId}' does not exist.`);
    }

    const updated = await this.repository.updateWalletStatus(walletId, "FROZEN");
    logger.warn({ walletId, reason, actorId }, "Wallet Account FROZEN");
    return updated!;
  }

  public async unfreezeWallet(walletId: string, reason: string, actorId: string = "SYSTEM"): Promise<WalletAccount> {
    const wallet = await this.repository.getWalletAccountById(walletId);
    if (!wallet) {
      throw new Error(`WALLET_NOT_FOUND: Wallet '${walletId}' does not exist.`);
    }

    const updated = await this.repository.updateWalletStatus(walletId, "ACTIVE");
    logger.info({ walletId, reason, actorId }, "Wallet Account UNFROZEN");
    return updated!;
  }

  public async lockFunds(dto: LockFundsDTO): Promise<WalletBalance> {
    WalletValidator.validateLockFunds(dto);

    const wallet = await this.repository.getWalletAccountById(dto.walletId);
    if (!wallet) {
      throw new Error(`WALLET_NOT_FOUND: Wallet '${dto.walletId}' does not exist.`);
    }
    if (wallet.status !== "ACTIVE") {
      throw new Error(`WALLET_INACTIVE: Cannot lock funds on wallet '${dto.walletId}' because it is ${wallet.status}.`);
    }

    const bal = await this.balanceEngine.lock(dto.walletId, dto.amount);

    await this.transactionEngine.createTransaction({
      transactionType: "LOCK",
      amount: dto.amount,
      sourceWalletId: dto.walletId,
      initiator: dto.initiator || "SYSTEM",
      metadata: { reason: dto.reason, ...dto.metadata },
    });

    return bal;
  }

  public async unlockFunds(dto: UnlockFundsDTO): Promise<WalletBalance> {
    WalletValidator.validateUnlockFunds(dto);

    const wallet = await this.repository.getWalletAccountById(dto.walletId);
    if (!wallet) {
      throw new Error(`WALLET_NOT_FOUND: Wallet '${dto.walletId}' does not exist.`);
    }

    const bal = await this.balanceEngine.unlock(dto.walletId, dto.amount);

    await this.transactionEngine.createTransaction({
      transactionType: "UNLOCK",
      amount: dto.amount,
      sourceWalletId: dto.walletId,
      initiator: dto.initiator || "SYSTEM",
      metadata: { reason: dto.reason, ...dto.metadata },
    });

    return bal;
  }
}
