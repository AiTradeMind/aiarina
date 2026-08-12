import { getDb } from "../../../db/client.ts";
import {
  walletAccounts,
  walletBalances,
  walletTransactions,
  walletLedger,
  walletMetadata,
} from "../../../db/schema.ts";
import { eq, desc, or, sql } from "drizzle-orm";
import {
  WalletAccount,
  WalletBalance,
  WalletTransaction,
  LedgerEntry,
  WalletMetadataInfo,
} from "../types/index.ts";
import { WalletStatus } from "../constants/index.ts";
import logger from "../../../lib/logger.ts";

export class WalletRepository {
  private static instance: WalletRepository;

  private memoryAccounts: Map<string, WalletAccount> = new Map();
  private memoryBalances: Map<string, WalletBalance> = new Map();
  private memoryTransactions: WalletTransaction[] = [];
  private memoryLedger: LedgerEntry[] = [];
  private memoryMetadata: Map<string, WalletMetadataInfo> = new Map();
  private ledgerSequenceCounter: number = 0;

  private constructor() {}

  public static getInstance(): WalletRepository {
    if (!WalletRepository.instance) {
      WalletRepository.instance = new WalletRepository();
    }
    return WalletRepository.instance;
  }

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  }

  // --- Wallet Account ---

  public async saveWalletAccount(account: WalletAccount): Promise<WalletAccount> {
    this.memoryAccounts.set(account.walletId, account);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const existing = await db
          .select()
          .from(walletAccounts)
          .where(eq(walletAccounts.walletId, account.walletId))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(walletAccounts)
            .set({
              name: account.name,
              walletType: account.walletType,
              status: account.status,
              currency: account.currency,
              ownerId: account.ownerId || null,
              parentWalletId: account.parentWalletId || null,
              updatedAt: new Date(),
            })
            .where(eq(walletAccounts.walletId, account.walletId));
        } else {
          await db.insert(walletAccounts).values({
            walletId: account.walletId,
            name: account.name,
            walletType: account.walletType,
            status: account.status,
            currency: account.currency,
            ownerId: account.ownerId || null,
            parentWalletId: account.parentWalletId || null,
          });
        }
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for saveWalletAccount"
      );
    }

    return account;
  }

  public async getWalletAccountById(walletId: string): Promise<WalletAccount | null> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db
          .select()
          .from(walletAccounts)
          .where(eq(walletAccounts.walletId, walletId))
          .limit(1);

        if (rows.length > 0) {
          const row = rows[0];
          return {
            id: row.id,
            walletId: row.walletId,
            name: row.name,
            walletType: row.walletType as any,
            status: row.status as any,
            currency: row.currency,
            ownerId: row.ownerId,
            parentWalletId: row.parentWalletId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          };
        }
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for getWalletAccountById"
      );
    }

    return this.memoryAccounts.get(walletId) || null;
  }

  public async getAllWalletAccounts(): Promise<WalletAccount[]> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db.select().from(walletAccounts);
        if (rows.length > 0) {
          return rows.map((row) => ({
            id: row.id,
            walletId: row.walletId,
            name: row.name,
            walletType: row.walletType as any,
            status: row.status as any,
            currency: row.currency,
            ownerId: row.ownerId,
            parentWalletId: row.parentWalletId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          }));
        }
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for getAllWalletAccounts"
      );
    }

    return Array.from(this.memoryAccounts.values());
  }

  public async updateWalletStatus(
    walletId: string,
    status: WalletStatus
  ): Promise<WalletAccount | null> {
    const acc = await this.getWalletAccountById(walletId);
    if (!acc) return null;

    acc.status = status;
    acc.updatedAt = new Date();
    this.memoryAccounts.set(walletId, acc);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        await db
          .update(walletAccounts)
          .set({ status, updatedAt: new Date() })
          .where(eq(walletAccounts.walletId, walletId));
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for updateWalletStatus"
      );
    }

    return acc;
  }

  // --- Wallet Balance ---

  public async saveWalletBalance(balance: WalletBalance): Promise<WalletBalance> {
    this.memoryBalances.set(balance.walletId, balance);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const existing = await db
          .select()
          .from(walletBalances)
          .where(eq(walletBalances.walletId, balance.walletId))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(walletBalances)
            .set({
              currentBalance: balance.currentBalance,
              availableBalance: balance.availableBalance,
              lockedBalance: balance.lockedBalance,
              pendingBalance: balance.pendingBalance,
              reservedBalance: balance.reservedBalance,
              totalCredits: balance.totalCredits,
              totalDebits: balance.totalDebits,
              updatedAt: new Date(),
            })
            .where(eq(walletBalances.walletId, balance.walletId));
        } else {
          await db.insert(walletBalances).values({
            walletId: balance.walletId,
            currentBalance: balance.currentBalance,
            availableBalance: balance.availableBalance,
            lockedBalance: balance.lockedBalance,
            pendingBalance: balance.pendingBalance,
            reservedBalance: balance.reservedBalance,
            totalCredits: balance.totalCredits,
            totalDebits: balance.totalDebits,
          });
        }
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for saveWalletBalance"
      );
    }

    return balance;
  }

  public async getWalletBalance(walletId: string): Promise<WalletBalance | null> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db
          .select()
          .from(walletBalances)
          .where(eq(walletBalances.walletId, walletId))
          .limit(1);

        if (rows.length > 0) {
          const row = rows[0];
          return {
            id: row.id,
            walletId: row.walletId,
            currentBalance: row.currentBalance,
            availableBalance: row.availableBalance,
            lockedBalance: row.lockedBalance,
            pendingBalance: row.pendingBalance,
            reservedBalance: row.reservedBalance,
            totalCredits: row.totalCredits,
            totalDebits: row.totalDebits,
            netBalance: row.totalCredits - row.totalDebits,
            updatedAt: row.updatedAt,
          };
        }
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for getWalletBalance"
      );
    }

    const mem = this.memoryBalances.get(walletId);
    if (!mem) return null;
    return {
      ...mem,
      netBalance: mem.totalCredits - mem.totalDebits,
    };
  }

  // --- Wallet Transactions ---

  public async recordTransaction(tx: WalletTransaction): Promise<WalletTransaction> {
    this.memoryTransactions.unshift(tx);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        await db.insert(walletTransactions).values({
          transactionId: tx.transactionId,
          referenceId: tx.referenceId,
          sourceWalletId: tx.sourceWalletId || null,
          destinationWalletId: tx.destinationWalletId || null,
          amount: tx.amount,
          transactionType: tx.transactionType,
          status: tx.status,
          failureReason: tx.failureReason || null,
          initiator: tx.initiator,
          metadata: tx.metadata || {},
        });
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for recordTransaction"
      );
    }

    return tx;
  }

  public async getTransactions(
    walletId?: string,
    limit: number = 100
  ): Promise<WalletTransaction[]> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        let query = db
          .select()
          .from(walletTransactions)
          .orderBy(desc(walletTransactions.createdAt))
          .limit(limit);

        if (walletId) {
          query = db
            .select()
            .from(walletTransactions)
            .where(
              or(
                eq(walletTransactions.sourceWalletId, walletId),
                eq(walletTransactions.destinationWalletId, walletId)
              )
            )
            .orderBy(desc(walletTransactions.createdAt))
            .limit(limit) as any;
        }

        const rows = await query;
        if (rows.length > 0) {
          return rows.map((row) => ({
            id: row.id,
            transactionId: row.transactionId,
            referenceId: row.referenceId,
            sourceWalletId: row.sourceWalletId,
            destinationWalletId: row.destinationWalletId,
            amount: row.amount,
            transactionType: row.transactionType as any,
            status: row.status as any,
            failureReason: row.failureReason,
            initiator: row.initiator,
            metadata: (row.metadata as Record<string, any>) || {},
            createdAt: row.createdAt,
          }));
        }
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for getTransactions"
      );
    }

    if (!walletId) {
      return this.memoryTransactions.slice(0, limit);
    }

    return this.memoryTransactions
      .filter(
        (tx) => tx.sourceWalletId === walletId || tx.destinationWalletId === walletId
      )
      .slice(0, limit);
  }

  // --- Ledger (IMMUTABLE HISTORY) ---

  public async getNextLedgerSeq(): Promise<number> {
    this.ledgerSequenceCounter += 1;
    return this.ledgerSequenceCounter;
  }

  public async recordLedgerEntry(entry: LedgerEntry): Promise<LedgerEntry> {
    this.memoryLedger.unshift(entry);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        await db.insert(walletLedger).values({
          ledgerId: entry.ledgerId,
          transactionId: entry.transactionId,
          referenceId: entry.referenceId,
          sourceWalletId: entry.sourceWalletId || null,
          destinationWalletId: entry.destinationWalletId || null,
          amount: entry.amount,
          transactionType: entry.transactionType,
          entrySeq: entry.entrySeq,
          initiator: entry.initiator,
          metadata: entry.metadata || {},
        });
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for recordLedgerEntry"
      );
    }

    return entry;
  }

  public async getLedgerEntries(
    walletId?: string,
    limit: number = 100
  ): Promise<LedgerEntry[]> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        let query = db
          .select()
          .from(walletLedger)
          .orderBy(desc(walletLedger.entrySeq))
          .limit(limit);

        if (walletId) {
          query = db
            .select()
            .from(walletLedger)
            .where(
              or(
                eq(walletLedger.sourceWalletId, walletId),
                eq(walletLedger.destinationWalletId, walletId)
              )
            )
            .orderBy(desc(walletLedger.entrySeq))
            .limit(limit) as any;
        }

        const rows = await query;
        if (rows.length > 0) {
          return rows.map((row) => ({
            id: row.id,
            ledgerId: row.ledgerId,
            transactionId: row.transactionId,
            referenceId: row.referenceId,
            sourceWalletId: row.sourceWalletId,
            destinationWalletId: row.destinationWalletId,
            amount: row.amount,
            transactionType: row.transactionType as any,
            entrySeq: row.entrySeq,
            initiator: row.initiator,
            metadata: (row.metadata as Record<string, any>) || {},
            createdAt: row.createdAt,
          }));
        }
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for getLedgerEntries"
      );
    }

    if (!walletId) {
      return this.memoryLedger.slice(0, limit);
    }

    return this.memoryLedger
      .filter(
        (e) => e.sourceWalletId === walletId || e.destinationWalletId === walletId
      )
      .slice(0, limit);
  }

  // --- Wallet Metadata ---

  public async saveMetadata(metadata: WalletMetadataInfo): Promise<WalletMetadataInfo> {
    this.memoryMetadata.set(metadata.walletId, metadata);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const existing = await db
          .select()
          .from(walletMetadata)
          .where(eq(walletMetadata.walletId, metadata.walletId))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(walletMetadata)
            .set({
              riskTier: metadata.riskTier,
              dailyTransferLimit: metadata.dailyTransferLimit || null,
              maxBalanceLimit: metadata.maxBalanceLimit || null,
              tags: metadata.tags || [],
              customRules: metadata.customRules || {},
              updatedAt: new Date(),
            })
            .where(eq(walletMetadata.walletId, metadata.walletId));
        } else {
          await db.insert(walletMetadata).values({
            walletId: metadata.walletId,
            riskTier: metadata.riskTier,
            dailyTransferLimit: metadata.dailyTransferLimit || null,
            maxBalanceLimit: metadata.maxBalanceLimit || null,
            tags: metadata.tags || [],
            customRules: metadata.customRules || {},
          });
        }
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for saveMetadata"
      );
    }

    return metadata;
  }

  public async getMetadata(walletId: string): Promise<WalletMetadataInfo | null> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db
          .select()
          .from(walletMetadata)
          .where(eq(walletMetadata.walletId, walletId))
          .limit(1);

        if (rows.length > 0) {
          const row = rows[0];
          return {
            id: row.id,
            walletId: row.walletId,
            riskTier: row.riskTier || "LOW",
            dailyTransferLimit: row.dailyTransferLimit,
            maxBalanceLimit: row.maxBalanceLimit,
            tags: (row.tags as string[]) || [],
            customRules: (row.customRules as Record<string, any>) || {},
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          };
        }
      }
    } catch (error: any) {
      logger.warn(
        { type: "WALLET_REPO_WARN", error: error.message },
        "Fallback to memory store for getMetadata"
      );
    }

    return this.memoryMetadata.get(walletId) || null;
  }
}
