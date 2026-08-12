import { getDb } from "../../../db/client.ts";
import { fundAccounts, fundAllocations, fundReservations, fundTransactions, fundMetadata } from "../../../db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import { FundAccount, FundAllocation, FundReservation, FundTransaction, FundMetadataInfo } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class FundRepository {
  private static instance: FundRepository;

  // Memory store
  private memoryAccounts = new Map<string, FundAccount>();
  private memoryAllocations = new Map<string, FundAllocation>();
  private memoryReservations = new Map<string, FundReservation>();
  private memoryTransactions: FundTransaction[] = [];
  private memoryMetadata = new Map<string, FundMetadataInfo>();

  private constructor() {}

  public static getInstance(): FundRepository {
    if (!FundRepository.instance) {
      FundRepository.instance = new FundRepository();
    }
    return FundRepository.instance;
  }

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  }

  // Helper to map DB row to FundAccount
  private mapAccount(row: any): FundAccount {
    return {
      id: row.id,
      fundId: row.fundId,
      name: row.name,
      fundType: row.fundType,
      status: row.status,
      totalCapital: Number(row.totalCapital || 0),
      allocatedCapital: Number(row.allocatedCapital || 0),
      reservedCapital: Number(row.reservedCapital || 0),
      availableCapital: Number(row.availableCapital || 0),
      frozenCapital: Number(row.frozenCapital || 0),
      releasedCapital: Number(row.releasedCapital || 0),
      utilizedCapital: Number(row.utilizedCapital || 0),
      currency: row.currency || "INR",
      parentFundId: row.parentFundId,
      metadata: row.metadata || {},
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    };
  }

  // --- Fund Account Methods ---

  public async saveAccount(account: FundAccount): Promise<FundAccount> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        const existing = await db
          .select()
          .from(fundAccounts)
          .where(eq(fundAccounts.fundId, account.fundId))
          .limit(1);

        if (existing && existing.length > 0) {
          await db
            .update(fundAccounts)
            .set({
              name: account.name,
              fundType: account.fundType,
              status: account.status,
              totalCapital: account.totalCapital,
              allocatedCapital: account.allocatedCapital,
              reservedCapital: account.reservedCapital,
              availableCapital: account.availableCapital,
              frozenCapital: account.frozenCapital,
              releasedCapital: account.releasedCapital,
              utilizedCapital: account.utilizedCapital,
              currency: account.currency,
              parentFundId: account.parentFundId,
              metadata: account.metadata,
              updatedAt: new Date(),
            })
            .where(eq(fundAccounts.fundId, account.fundId));
        } else {
          await db.insert(fundAccounts).values({
            fundId: account.fundId,
            name: account.name,
            fundType: account.fundType,
            status: account.status,
            totalCapital: account.totalCapital,
            allocatedCapital: account.allocatedCapital,
            reservedCapital: account.reservedCapital,
            availableCapital: account.availableCapital,
            frozenCapital: account.frozenCapital,
            releasedCapital: account.releasedCapital,
            utilizedCapital: account.utilizedCapital,
            currency: account.currency,
            parentFundId: account.parentFundId,
            metadata: account.metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for saveAccount");
      }
    }

    this.memoryAccounts.set(account.fundId, { ...account, updatedAt: new Date() });
    return this.memoryAccounts.get(account.fundId)!;
  }

  public async getAccountById(fundId: string): Promise<FundAccount | null> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        const result = await db
          .select()
          .from(fundAccounts)
          .where(eq(fundAccounts.fundId, fundId))
          .limit(1);

        if (result && result.length > 0) {
          return this.mapAccount(result[0]);
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for getAccountById");
      }
    }

    return this.memoryAccounts.get(fundId) || null;
  }

  public async getAllAccounts(): Promise<FundAccount[]> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        const results = await db.select().from(fundAccounts);
        if (results && results.length > 0) {
          return results.map((r) => this.mapAccount(r));
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for getAllAccounts");
      }
    }

    return Array.from(this.memoryAccounts.values());
  }

  // --- Fund Allocation Methods ---

  public async saveAllocation(allocation: FundAllocation): Promise<FundAllocation> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        const existing = await db
          .select()
          .from(fundAllocations)
          .where(eq(fundAllocations.allocationId, allocation.allocationId))
          .limit(1);

        if (existing && existing.length > 0) {
          await db
            .update(fundAllocations)
            .set({
              sourceFundId: allocation.sourceFundId,
              targetFundId: allocation.targetFundId,
              amount: allocation.amount,
              allocationStrategy: allocation.allocationStrategy,
              status: allocation.status,
              notes: allocation.notes,
              metadata: allocation.metadata,
              updatedAt: new Date(),
            })
            .where(eq(fundAllocations.allocationId, allocation.allocationId));
        } else {
          await db.insert(fundAllocations).values({
            allocationId: allocation.allocationId,
            sourceFundId: allocation.sourceFundId,
            targetFundId: allocation.targetFundId,
            amount: allocation.amount,
            allocationStrategy: allocation.allocationStrategy,
            status: allocation.status,
            notes: allocation.notes,
            metadata: allocation.metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for saveAllocation");
      }
    }

    this.memoryAllocations.set(allocation.allocationId, { ...allocation, updatedAt: new Date() });
    return this.memoryAllocations.get(allocation.allocationId)!;
  }

  public async getAllocations(fundId?: string): Promise<FundAllocation[]> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        if (fundId) {
          const results = await db
            .select()
            .from(fundAllocations)
            .where(eq(fundAllocations.sourceFundId, fundId));
          if (results && results.length > 0) return results.map((r: any) => ({ ...r, amount: Number(r.amount) }));
        } else {
          const results = await db.select().from(fundAllocations);
          if (results && results.length > 0) return results.map((r: any) => ({ ...r, amount: Number(r.amount) }));
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for getAllocations");
      }
    }

    const all = Array.from(this.memoryAllocations.values());
    if (fundId) {
      return all.filter((a) => a.sourceFundId === fundId || a.targetFundId === fundId);
    }
    return all;
  }

  public async getAllocationById(allocationId: string): Promise<FundAllocation | null> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        const res = await db
          .select()
          .from(fundAllocations)
          .where(eq(fundAllocations.allocationId, allocationId))
          .limit(1);

        if (res && res.length > 0) {
          return { ...res[0], amount: Number(res[0].amount) } as FundAllocation;
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for getAllocationById");
      }
    }

    return this.memoryAllocations.get(allocationId) || null;
  }

  // --- Fund Reservation Methods ---

  public async saveReservation(reservation: FundReservation): Promise<FundReservation> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        const existing = await db
          .select()
          .from(fundReservations)
          .where(eq(fundReservations.reservationId, reservation.reservationId))
          .limit(1);

        if (existing && existing.length > 0) {
          await db
            .update(fundReservations)
            .set({
              fundId: reservation.fundId,
              amount: reservation.amount,
              purpose: reservation.purpose,
              status: reservation.status,
              expiresAt: reservation.expiresAt,
              releasedAt: reservation.releasedAt,
              consumedAt: reservation.consumedAt,
              metadata: reservation.metadata,
              updatedAt: new Date(),
            })
            .where(eq(fundReservations.reservationId, reservation.reservationId));
        } else {
          await db.insert(fundReservations).values({
            reservationId: reservation.reservationId,
            fundId: reservation.fundId,
            amount: reservation.amount,
            purpose: reservation.purpose,
            status: reservation.status,
            expiresAt: reservation.expiresAt,
            releasedAt: reservation.releasedAt,
            consumedAt: reservation.consumedAt,
            metadata: reservation.metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for saveReservation");
      }
    }

    this.memoryReservations.set(reservation.reservationId, { ...reservation, updatedAt: new Date() });
    return this.memoryReservations.get(reservation.reservationId)!;
  }

  public async getReservations(fundId?: string): Promise<FundReservation[]> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        if (fundId) {
          const results = await db
            .select()
            .from(fundReservations)
            .where(eq(fundReservations.fundId, fundId));
          if (results && results.length > 0) return results.map((r: any) => ({ ...r, amount: Number(r.amount) }));
        } else {
          const results = await db.select().from(fundReservations);
          if (results && results.length > 0) return results.map((r: any) => ({ ...r, amount: Number(r.amount) }));
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for getReservations");
      }
    }

    const all = Array.from(this.memoryReservations.values());
    if (fundId) {
      return all.filter((r) => r.fundId === fundId);
    }
    return all;
  }

  public async getReservationById(reservationId: string): Promise<FundReservation | null> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        const res = await db
          .select()
          .from(fundReservations)
          .where(eq(fundReservations.reservationId, reservationId))
          .limit(1);

        if (res && res.length > 0) {
          return { ...res[0], amount: Number(res[0].amount) } as FundReservation;
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for getReservationById");
      }
    }

    return this.memoryReservations.get(reservationId) || null;
  }

  // --- Fund Transaction Audit Methods ---

  public async saveTransaction(tx: FundTransaction): Promise<FundTransaction> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        await db.insert(fundTransactions).values({
          transactionId: tx.transactionId,
          fundId: tx.fundId,
          operation: tx.operation,
          amount: tx.amount,
          sourceFundId: tx.sourceFundId,
          targetFundId: tx.targetFundId,
          status: tx.status,
          failureReason: tx.failureReason,
          actorId: tx.actorId,
          metadata: tx.metadata,
          createdAt: new Date(),
        });
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for saveTransaction");
      }
    }

    this.memoryTransactions.push({ ...tx, createdAt: new Date() });
    return tx;
  }

  public async getTransactions(fundId?: string, limit: number = 100): Promise<FundTransaction[]> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        if (fundId) {
          const res = await db
            .select()
            .from(fundTransactions)
            .where(eq(fundTransactions.fundId, fundId))
            .orderBy(desc(fundTransactions.createdAt))
            .limit(limit);
          if (res && res.length > 0) return res.map((r: any) => ({ ...r, amount: Number(r.amount) }));
        } else {
          const res = await db
            .select()
            .from(fundTransactions)
            .orderBy(desc(fundTransactions.createdAt))
            .limit(limit);
          if (res && res.length > 0) return res.map((r: any) => ({ ...r, amount: Number(r.amount) }));
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for getTransactions");
      }
    }

    let list = [...this.memoryTransactions].reverse();
    if (fundId) {
      list = list.filter((t) => t.fundId === fundId || t.sourceFundId === fundId || t.targetFundId === fundId);
    }
    return list.slice(0, limit);
  }

  // --- Fund Metadata Methods ---

  public async saveMetadata(info: FundMetadataInfo): Promise<FundMetadataInfo> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        const existing = await db
          .select()
          .from(fundMetadata)
          .where(eq(fundMetadata.fundId, info.fundId))
          .limit(1);

        if (existing && existing.length > 0) {
          await db
            .update(fundMetadata)
            .set({
              riskTier: info.riskTier,
              maxAllocationLimit: info.maxAllocationLimit,
              maxReservationLimit: info.maxReservationLimit,
              owner: info.owner,
              tags: info.tags,
              customRules: info.customRules,
              updatedAt: new Date(),
            })
            .where(eq(fundMetadata.fundId, info.fundId));
        } else {
          await db.insert(fundMetadata).values({
            fundId: info.fundId,
            riskTier: info.riskTier,
            maxAllocationLimit: info.maxAllocationLimit,
            maxReservationLimit: info.maxReservationLimit,
            owner: info.owner,
            tags: info.tags,
            customRules: info.customRules,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for saveMetadata");
      }
    }

    this.memoryMetadata.set(info.fundId, { ...info, updatedAt: new Date() });
    return this.memoryMetadata.get(info.fundId)!;
  }

  public async getMetadata(fundId: string): Promise<FundMetadataInfo | null> {
    const db = this.isTestEnvironment() ? null : getDb();
    if (db) {
      try {
        const res = await db
          .select()
          .from(fundMetadata)
          .where(eq(fundMetadata.fundId, fundId))
          .limit(1);

        if (res && res.length > 0) {
          const row = res[0];
          return {
            id: row.id,
            fundId: row.fundId,
            riskTier: row.riskTier || "MEDIUM",
            maxAllocationLimit: row.maxAllocationLimit ? Number(row.maxAllocationLimit) : null,
            maxReservationLimit: row.maxReservationLimit ? Number(row.maxReservationLimit) : null,
            owner: row.owner || "SYSTEM",
            tags: (row.tags as string[]) || [],
            customRules: (row.customRules as Record<string, any>) || {},
            createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
            updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
          };
        }
      } catch (error: any) {
        logger.warn({ type: "FUND_REPO_WARN", error: error?.message }, "Fallback to memory store for getMetadata");
      }
    }

    return this.memoryMetadata.get(fundId) || null;
  }
}
