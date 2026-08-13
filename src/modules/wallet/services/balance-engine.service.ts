import { WalletRepository } from "../repositories/wallet.repository.ts";
import { WalletBalance } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class BalanceEngineService {
  private static instance: BalanceEngineService;
  private repository: WalletRepository;

  private constructor() {
    this.repository = WalletRepository.getInstance();
  }

  public static getInstance(): BalanceEngineService {
    if (!BalanceEngineService.instance) {
      BalanceEngineService.instance = new BalanceEngineService();
    }
    return BalanceEngineService.instance;
  }

  public async initializeBalance(walletId: string, initialBalance: number = 0): Promise<WalletBalance> {
    const balance: WalletBalance = {
      walletId,
      currentBalance: initialBalance,
      availableBalance: initialBalance,
      lockedBalance: 0,
      pendingBalance: 0,
      reservedBalance: 0,
      totalCredits: initialBalance,
      totalDebits: 0,
      netBalance: initialBalance,
      updatedAt: new Date(),
    };

    return this.repository.saveWalletBalance(balance);
  }

  public async getBalance(walletId: string): Promise<WalletBalance> {
    let bal = await this.repository.getWalletBalance(walletId);
    if (!bal) {
      bal = await this.initializeBalance(walletId, 0);
    }
    return bal;
  }

  public async credit(walletId: string, amount: number): Promise<WalletBalance> {
    if (amount <= 0) {
      throw new Error("VALIDATION_ERROR: Credit amount must be greater than zero.");
    }
    const bal = await this.getBalance(walletId);

    const updated: WalletBalance = {
      ...bal,
      currentBalance: bal.currentBalance + amount,
      availableBalance: bal.availableBalance + amount,
      totalCredits: bal.totalCredits + amount,
      netBalance: bal.totalCredits + amount - bal.totalDebits,
      updatedAt: new Date(),
    };

    const saved = await this.repository.saveWalletBalance(updated);
    logger.info(
      { walletId, amount, newAvailable: saved.availableBalance },
      "Wallet Balance Credited"
    );
    return saved;
  }

  public async debit(walletId: string, amount: number): Promise<WalletBalance> {
    if (amount <= 0) {
      throw new Error("VALIDATION_ERROR: Debit amount must be greater than zero.");
    }
    const bal = await this.getBalance(walletId);

    if (bal.availableBalance < amount) {
      throw new Error(
        `INSUFFICIENT_FUNDS: Wallet '${walletId}' has insufficient available balance (${bal.availableBalance}) for debit amount (${amount}).`
      );
    }

    const updated: WalletBalance = {
      ...bal,
      currentBalance: bal.currentBalance - amount,
      availableBalance: bal.availableBalance - amount,
      totalDebits: bal.totalDebits + amount,
      netBalance: bal.totalCredits - (bal.totalDebits + amount),
      updatedAt: new Date(),
    };

    const saved = await this.repository.saveWalletBalance(updated);
    logger.info(
      { walletId, amount, newAvailable: saved.availableBalance },
      "Wallet Balance Debited"
    );
    return saved;
  }

  public async lock(walletId: string, amount: number): Promise<WalletBalance> {
    if (amount <= 0) {
      throw new Error("VALIDATION_ERROR: Lock amount must be greater than zero.");
    }
    const bal = await this.getBalance(walletId);

    if (bal.availableBalance < amount) {
      throw new Error(
        `INSUFFICIENT_FUNDS: Wallet '${walletId}' has insufficient available balance (${bal.availableBalance}) to lock (${amount}).`
      );
    }

    const updated: WalletBalance = {
      ...bal,
      availableBalance: bal.availableBalance - amount,
      lockedBalance: bal.lockedBalance + amount,
      updatedAt: new Date(),
    };

    const saved = await this.repository.saveWalletBalance(updated);
    logger.info(
      { walletId, amount, newLocked: saved.lockedBalance, newAvailable: saved.availableBalance },
      "Wallet Funds Locked"
    );
    return saved;
  }

  public async unlock(walletId: string, amount: number): Promise<WalletBalance> {
    if (amount <= 0) {
      throw new Error("VALIDATION_ERROR: Unlock amount must be greater than zero.");
    }
    const bal = await this.getBalance(walletId);

    if (bal.lockedBalance < amount) {
      throw new Error(
        `INVALID_LOCK_STATE: Wallet '${walletId}' has insufficient locked balance (${bal.lockedBalance}) to unlock (${amount}).`
      );
    }

    const updated: WalletBalance = {
      ...bal,
      availableBalance: bal.availableBalance + amount,
      lockedBalance: bal.lockedBalance - amount,
      updatedAt: new Date(),
    };

    const saved = await this.repository.saveWalletBalance(updated);
    logger.info(
      { walletId, amount, newLocked: saved.lockedBalance, newAvailable: saved.availableBalance },
      "Wallet Funds Unlocked"
    );
    return saved;
  }
}
