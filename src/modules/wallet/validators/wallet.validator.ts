import {
  CreateWalletDTO,
  DepositDTO,
  WithdrawDTO,
  TransferDTO,
  LockFundsDTO,
  UnlockFundsDTO,
} from "../dtos/wallet.dto.ts";
import { WALLET_TYPES } from "../constants/index.ts";
import logger from "../../../lib/logger.ts";

export class WalletValidator {
  public static validateCreateWallet(dto: CreateWalletDTO): void {
    if (!dto.walletId || typeof dto.walletId !== "string" || dto.walletId.trim() === "") {
      throw new Error("VALIDATION_ERROR: 'walletId' is required and must be a non-empty string.");
    }
    if (!dto.name || typeof dto.name !== "string" || dto.name.trim() === "") {
      throw new Error("VALIDATION_ERROR: 'name' is required and must be a non-empty string.");
    }
    if (!dto.walletType || !WALLET_TYPES[dto.walletType]) {
      throw new Error(
        `VALIDATION_ERROR: Invalid 'walletType' '${dto.walletType}'. Must be one of: ${Object.keys(
          WALLET_TYPES
        ).join(", ")}.`
      );
    }
    if (dto.initialBalance !== undefined && (typeof dto.initialBalance !== "number" || dto.initialBalance < 0)) {
      throw new Error("VALIDATION_ERROR: 'initialBalance' must be a non-negative number.");
    }
  }

  public static validateDeposit(dto: DepositDTO): void {
    if (!dto.walletId || typeof dto.walletId !== "string") {
      throw new Error("VALIDATION_ERROR: 'walletId' is required.");
    }
    if (typeof dto.amount !== "number" || dto.amount <= 0 || isNaN(dto.amount)) {
      throw new Error("VALIDATION_ERROR: 'amount' must be a positive number.");
    }
  }

  public static validateWithdraw(dto: WithdrawDTO): void {
    if (!dto.walletId || typeof dto.walletId !== "string") {
      throw new Error("VALIDATION_ERROR: 'walletId' is required.");
    }
    if (typeof dto.amount !== "number" || dto.amount <= 0 || isNaN(dto.amount)) {
      throw new Error("VALIDATION_ERROR: 'amount' must be a positive number.");
    }
  }

  public static validateTransfer(dto: TransferDTO): void {
    if (!dto.sourceWalletId || typeof dto.sourceWalletId !== "string") {
      throw new Error("VALIDATION_ERROR: 'sourceWalletId' is required.");
    }
    if (!dto.destinationWalletId || typeof dto.destinationWalletId !== "string") {
      throw new Error("VALIDATION_ERROR: 'destinationWalletId' is required.");
    }
    if (dto.sourceWalletId === dto.destinationWalletId) {
      throw new Error("VALIDATION_ERROR: Source and destination wallets cannot be the same.");
    }
    if (typeof dto.amount !== "number" || dto.amount <= 0 || isNaN(dto.amount)) {
      throw new Error("VALIDATION_ERROR: 'amount' must be a positive number.");
    }
  }

  public static validateLockFunds(dto: LockFundsDTO): void {
    if (!dto.walletId || typeof dto.walletId !== "string") {
      throw new Error("VALIDATION_ERROR: 'walletId' is required.");
    }
    if (typeof dto.amount !== "number" || dto.amount <= 0 || isNaN(dto.amount)) {
      throw new Error("VALIDATION_ERROR: 'amount' must be a positive number.");
    }
  }

  public static validateUnlockFunds(dto: UnlockFundsDTO): void {
    if (!dto.walletId || typeof dto.walletId !== "string") {
      throw new Error("VALIDATION_ERROR: 'walletId' is required.");
    }
    if (typeof dto.amount !== "number" || dto.amount <= 0 || isNaN(dto.amount)) {
      throw new Error("VALIDATION_ERROR: 'amount' must be a positive number.");
    }
  }

  public static validateProhibitionCall(methodName: string): void {
    logger.error(
      { methodName },
      "PROHIBITION_ERROR: Wallet Foundation attempted prohibited operation"
    );
  }
}
