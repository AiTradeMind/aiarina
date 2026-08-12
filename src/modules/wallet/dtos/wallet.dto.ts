import { WalletType } from "../constants/index.ts";

export interface CreateWalletDTO {
  walletId: string;
  name: string;
  walletType: WalletType;
  currency?: string;
  initialBalance?: number;
  ownerId?: string;
  parentWalletId?: string;
}

export interface DepositDTO {
  walletId: string;
  amount: number;
  referenceId?: string;
  initiator?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface WithdrawDTO {
  walletId: string;
  amount: number;
  referenceId?: string;
  initiator?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface TransferDTO {
  sourceWalletId: string;
  destinationWalletId: string;
  amount: number;
  referenceId?: string;
  initiator?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface LockFundsDTO {
  walletId: string;
  amount: number;
  reason?: string;
  initiator?: string;
  metadata?: Record<string, any>;
}

export interface UnlockFundsDTO {
  walletId: string;
  amount: number;
  reason?: string;
  initiator?: string;
  metadata?: Record<string, any>;
}

export interface AdjustmentDTO {
  walletId: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  reason?: string;
  initiator?: string;
}
