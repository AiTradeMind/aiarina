import {
  WalletType,
  TransactionType,
  WalletStatus,
  TransactionStatus,
  PipelineStage,
} from "../constants/index.ts";

export interface WalletAccount {
  id?: number;
  walletId: string;
  name: string;
  walletType: WalletType;
  status: WalletStatus;
  currency: string;
  ownerId?: string | null;
  parentWalletId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WalletBalance {
  id?: number;
  walletId: string;
  currentBalance: number;
  availableBalance: number;
  lockedBalance: number;
  pendingBalance: number;
  reservedBalance: number;
  totalCredits: number;
  totalDebits: number;
  netBalance: number;
  updatedAt?: Date;
}

export interface WalletTransaction {
  id?: number;
  transactionId: string;
  referenceId: string;
  sourceWalletId?: string | null;
  destinationWalletId?: string | null;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  failureReason?: string | null;
  initiator: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface LedgerEntry {
  id?: number;
  ledgerId: string;
  transactionId: string;
  referenceId: string;
  sourceWalletId?: string | null;
  destinationWalletId?: string | null;
  amount: number;
  transactionType: TransactionType;
  entrySeq: number;
  initiator: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface WalletMetadataInfo {
  id?: number;
  walletId: string;
  riskTier: string;
  dailyTransferLimit?: number | null;
  maxBalanceLimit?: number | null;
  tags?: string[];
  customRules?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WalletPipelineExecutionResult<T = any> {
  success: boolean;
  pipelineStage: PipelineStage;
  executionTimeMs: number;
  data?: T;
  failureReason?: string;
  governanceViolations?: any[];
  auditLogId?: string;
}
