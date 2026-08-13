import { eq, desc } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  treasuryTable,
  treasuryLedgerTable,
  capitalMintTable,
  capitalAllocationTable,
  capitalReservationTable,
  capitalReleaseTable,
  walletFundingTable,
  treasuryEventsTable,
  treasuryAuditTable,
  treasuryLifecycleTable,
  treasuryStateHistoryTable,
  aiFundingPolicyTable,
  paperLiveTreasuryTable,
  treasuryCertificatesTable,
  capitalFlowInspectorTable,
  treasuryEmergencyLogTable,
  capitalReconciliationTable,
  indianMarketPolicyTable
} from "../../../db/schema.ts";
import {
  TreasuryVaultSummary,
  TreasuryLedgerItem,
  CapitalMintItem,
  CapitalAllocationItem,
  CapitalReservationItem,
  CapitalReleaseItem,
  WalletFundingItem,
  TreasuryEventItem,
  TreasuryAuditItem
} from "../types/index.ts";

export class TreasuryRepository {
  async getTreasuryVault(): Promise<TreasuryVaultSummary | null> {
    try {
      const db = getDb();
      const res = await db.select().from(treasuryTable).where(eq(treasuryTable.id, "TREASURY-VAULT-MAIN")).limit(1);
      if (res && res[0]) {
        const item = res[0];
        return {
          id: item.id,
          tenantId: item.tenantId,
          workspaceId: item.workspaceId,
          totalMintedAtm: parseFloat(item.totalMintedAtm || "0"),
          reservedAtm: parseFloat(item.reservedAtm || "0"),
          allocatedAtm: parseFloat(item.allocatedAtm || "0"),
          availableAtm: parseFloat(item.availableAtm || "0"),
          status: item.status as any,
          healthScore: item.healthScore,
          currencyCode: item.currencyCode,
          currencySymbol: item.currencySymbol,
          inrConversionRate: parseFloat(item.inrConversionRate || "1.0"),
          dailyCapitalLimitAtm: parseFloat(item.dailyCapitalLimitAtm || "10000000"),
          monthlyCapitalLimitAtm: parseFloat(item.monthlyCapitalLimitAtm || "100000000"),
          perAiLimitAtm: parseFloat(item.perAiLimitAtm || "1000000"),
          perPortfolioLimitAtm: parseFloat(item.perPortfolioLimitAtm || "5000000"),
          emergencyStopLimitAtm: parseFloat(item.emergencyStopLimitAtm || "50000000"),
          version: item.version,
          schemaVersion: item.schemaVersion,
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
        };
      }
      return null;
    } catch (err) {
      console.warn("Database fallback in TreasuryRepository getTreasuryVault:", err);
      return null;
    }
  }

  async upsertTreasuryVault(data: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(treasuryTable).values({
        id: data.id || "TREASURY-VAULT-MAIN",
        tenantId: data.tenantId || "TNT-MAIN-001",
        workspaceId: data.workspaceId || "WKS-TREASURY-01",
        totalMintedAtm: (data.totalMintedAtm || 0).toString(),
        reservedAtm: (data.reservedAtm || 0).toString(),
        allocatedAtm: (data.allocatedAtm || 0).toString(),
        availableAtm: (data.availableAtm || 0).toString(),
        status: data.status || "ACTIVE",
        healthScore: data.healthScore || 100,
        currencyCode: data.currencyCode || "ATM",
        currencySymbol: data.currencySymbol || "ATM",
        inrConversionRate: (data.inrConversionRate || 1.0).toString(),
        dailyCapitalLimitAtm: (data.dailyCapitalLimitAtm || 10000000).toString(),
        monthlyCapitalLimitAtm: (data.monthlyCapitalLimitAtm || 100000000).toString(),
        perAiLimitAtm: (data.perAiLimitAtm || 1000000).toString(),
        perPortfolioLimitAtm: (data.perPortfolioLimitAtm || 5000000).toString(),
        emergencyStopLimitAtm: (data.emergencyStopLimitAtm || 50000000).toString(),
        version: "1.0.0",
        schemaVersion: "2.0.0",
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: treasuryTable.id,
        set: {
          totalMintedAtm: (data.totalMintedAtm || 0).toString(),
          reservedAtm: (data.reservedAtm || 0).toString(),
          allocatedAtm: (data.allocatedAtm || 0).toString(),
          availableAtm: (data.availableAtm || 0).toString(),
          status: data.status || "ACTIVE",
          healthScore: data.healthScore || 100,
          updatedAt: new Date()
        }
      });
    } catch (err) {
      console.warn("Database fallback in TreasuryRepository upsertTreasuryVault:", err);
    }
  }

  async addLedgerEntry(entry: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(treasuryLedgerTable).values({
        id: entry.id,
        tenantId: entry.tenantId || "TNT-MAIN-001",
        workspaceId: entry.workspaceId || "WKS-TREASURY-01",
        entryType: entry.entryType,
        amountAtm: (entry.amountAtm || 0).toString(),
        amountInrReference: (entry.amountInrReference || 0).toString(),
        balanceAfterAtm: (entry.balanceAfterAtm || 0).toString(),
        sourceAccount: entry.sourceAccount,
        destinationAccount: entry.destinationAccount,
        description: entry.description,
        performedBy: entry.performedBy || "TREASURY_ENGINE",
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("Database fallback in TreasuryRepository addLedgerEntry:", err);
    }
  }

  async getLedgerEntries(): Promise<TreasuryLedgerItem[]> {
    try {
      const db = getDb();
      const res = await db.select().from(treasuryLedgerTable).orderBy(desc(treasuryLedgerTable.createdAt)).limit(100);
      return res.map((item) => ({
        id: item.id,
        entryType: item.entryType as any,
        amountAtm: parseFloat(item.amountAtm || "0"),
        amountInrReference: parseFloat(item.amountInrReference || "0"),
        balanceAfterAtm: parseFloat(item.balanceAfterAtm || "0"),
        sourceAccount: item.sourceAccount,
        destinationAccount: item.destinationAccount,
        description: item.description || "",
        performedBy: item.performedBy,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async addCapitalMint(mint: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(capitalMintTable).values({
        id: mint.id,
        mintId: mint.mintId,
        capitalBatchId: mint.capitalBatchId,
        amountAtm: (mint.amountAtm || 0).toString(),
        purpose: mint.purpose,
        status: mint.status || "MINTED",
        authorizedBy: mint.authorizedBy || "TREASURY_CHIEF_OFFICER",
        certificateHash: mint.certificateHash,
        version: "1.0.0",
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("Database fallback in addCapitalMint:", err);
    }
  }

  async getCapitalMints(): Promise<CapitalMintItem[]> {
    try {
      const db = getDb();
      const res = await db.select().from(capitalMintTable).orderBy(desc(capitalMintTable.createdAt)).limit(50);
      return res.map((item) => ({
        id: item.id,
        mintId: item.mintId,
        capitalBatchId: item.capitalBatchId,
        amountAtm: parseFloat(item.amountAtm || "0"),
        purpose: item.purpose,
        status: item.status as any,
        authorizedBy: item.authorizedBy,
        certificateHash: item.certificateHash,
        version: item.version,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async addCapitalAllocation(allocation: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(capitalAllocationTable).values({
        id: allocation.id,
        allocationId: allocation.allocationId,
        targetType: allocation.targetType,
        targetId: allocation.targetId,
        amountAtm: (allocation.amountAtm || 0).toString(),
        allocatedBy: allocation.allocatedBy || "TREASURY_ALLOCATION_ENGINE",
        dailyLimitAtm: allocation.dailyLimitAtm ? allocation.dailyLimitAtm.toString() : null,
        monthlyLimitAtm: allocation.monthlyLimitAtm ? allocation.monthlyLimitAtm.toString() : null,
        status: allocation.status || "APPROVED",
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("Database fallback in addCapitalAllocation:", err);
    }
  }

  async getCapitalAllocations(): Promise<CapitalAllocationItem[]> {
    try {
      const db = getDb();
      const res = await db.select().from(capitalAllocationTable).orderBy(desc(capitalAllocationTable.createdAt)).limit(50);
      return res.map((item) => ({
        id: item.id,
        allocationId: item.allocationId,
        targetType: item.targetType as any,
        targetId: item.targetId,
        amountAtm: parseFloat(item.amountAtm || "0"),
        allocatedBy: item.allocatedBy,
        dailyLimitAtm: item.dailyLimitAtm ? parseFloat(item.dailyLimitAtm) : undefined,
        monthlyLimitAtm: item.monthlyLimitAtm ? parseFloat(item.monthlyLimitAtm) : undefined,
        status: item.status as any,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async addCapitalReservation(reservation: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(capitalReservationTable).values({
        id: reservation.id,
        reservationId: reservation.reservationId,
        reservationType: reservation.reservationType,
        amountAtm: (reservation.amountAtm || 0).toString(),
        reason: reservation.reason,
        status: reservation.status || "ACTIVE",
        expiresAt: reservation.expiresAt ? new Date(reservation.expiresAt) : null,
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("Database fallback in addCapitalReservation:", err);
    }
  }

  async getCapitalReservations(): Promise<CapitalReservationItem[]> {
    try {
      const db = getDb();
      const res = await db.select().from(capitalReservationTable).orderBy(desc(capitalReservationTable.createdAt)).limit(50);
      return res.map((item) => ({
        id: item.id,
        reservationId: item.reservationId,
        reservationType: item.reservationType as any,
        amountAtm: parseFloat(item.amountAtm || "0"),
        reason: item.reason,
        status: item.status as any,
        expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString() : undefined,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async addCapitalRelease(release: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(capitalReleaseTable).values({
        id: release.id,
        releaseId: release.releaseId,
        reservationId: release.reservationId || null,
        amountAtm: (release.amountAtm || 0).toString(),
        releaseType: release.releaseType,
        releasedBy: release.releasedBy || "TREASURY_RELEASE_ENGINE",
        reason: release.reason,
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("Database fallback in addCapitalRelease:", err);
    }
  }

  async getCapitalReleases(): Promise<CapitalReleaseItem[]> {
    try {
      const db = getDb();
      const res = await db.select().from(capitalReleaseTable).orderBy(desc(capitalReleaseTable.createdAt)).limit(50);
      return res.map((item) => ({
        id: item.id,
        releaseId: item.releaseId,
        reservationId: item.reservationId || undefined,
        amountAtm: parseFloat(item.amountAtm || "0"),
        releaseType: item.releaseType as any,
        releasedBy: item.releasedBy,
        reason: item.reason,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async addWalletFunding(funding: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(walletFundingTable).values({
        id: funding.id,
        fundingId: funding.fundingId,
        walletType: funding.walletType,
        walletAddress: funding.walletAddress,
        amountAtm: (funding.amountAtm || 0).toString(),
        fundedBy: funding.fundedBy || "TREASURY_WALLET_ENGINE",
        txHash: funding.txHash,
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("Database fallback in addWalletFunding:", err);
    }
  }

  async getWalletFundingHistory(): Promise<WalletFundingItem[]> {
    try {
      const db = getDb();
      const res = await db.select().from(walletFundingTable).orderBy(desc(walletFundingTable.createdAt)).limit(50);
      return res.map((item) => ({
        id: item.id,
        fundingId: item.fundingId,
        walletType: item.walletType as any,
        walletAddress: item.walletAddress,
        amountAtm: parseFloat(item.amountAtm || "0"),
        fundedBy: item.fundedBy,
        txHash: item.txHash,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async addTreasuryEvent(event: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(treasuryEventsTable).values({
        id: event.id,
        eventId: event.eventId,
        eventType: event.eventType,
        payload: event.payload,
        publishedBy: event.publishedBy || "TREASURY_EVENT_BUS",
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("Database fallback in addTreasuryEvent:", err);
    }
  }

  async getTreasuryEvents(): Promise<TreasuryEventItem[]> {
    try {
      const db = getDb();
      const res = await db.select().from(treasuryEventsTable).orderBy(desc(treasuryEventsTable.createdAt)).limit(50);
      return res.map((item) => ({
        id: item.id,
        eventId: item.eventId,
        eventType: item.eventType as any,
        payload: item.payload as any,
        publishedBy: item.publishedBy,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async addTreasuryAudit(audit: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(treasuryAuditTable).values({
        id: audit.id,
        auditId: audit.auditId,
        action: audit.action,
        actor: audit.actor || "SYSTEM",
        details: audit.details,
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("Database fallback in addTreasuryAudit:", err);
    }
  }

  async getTreasuryAudits(): Promise<TreasuryAuditItem[]> {
    try {
      const db = getDb();
      const res = await db.select().from(treasuryAuditTable).orderBy(desc(treasuryAuditTable.createdAt)).limit(50);
      return res.map((item) => ({
        id: item.id,
        auditId: item.auditId,
        action: item.action,
        actor: item.actor,
        details: item.details as any,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  // EP02.1 Lifecycle
  async getLifecycles(): Promise<any[]> {
    try {
      const db = getDb();
      const res = await db.select().from(treasuryLifecycleTable).orderBy(desc(treasuryLifecycleTable.updatedAt)).limit(50);
      return res.map((item) => ({
        id: item.id,
        capitalId: item.capitalId,
        batchId: item.batchId,
        amountAtm: parseFloat(item.amountAtm || "0"),
        currentStage: item.currentStage,
        history: item.history || [],
        status: item.status,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async saveLifecycle(item: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(treasuryLifecycleTable).values({
        id: item.id,
        capitalId: item.capitalId,
        batchId: item.batchId,
        amountAtm: (item.amountAtm || 0).toString(),
        currentStage: item.currentStage,
        history: item.history || [],
        status: item.status || "ACTIVE",
        createdAt: new Date(item.createdAt || Date.now()),
        updatedAt: new Date(item.updatedAt || Date.now())
      }).onConflictDoUpdate({
        target: treasuryLifecycleTable.capitalId,
        set: {
          currentStage: item.currentStage,
          history: item.history || [],
          status: item.status || "ACTIVE",
          updatedAt: new Date()
        }
      });
    } catch (err) {
      console.warn("DB fallback in saveLifecycle:", err);
    }
  }

  // EP02.1 State History
  async saveStateHistory(history: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(treasuryStateHistoryTable).values({
        id: history.id,
        capitalId: history.capitalId,
        previousState: history.previousState,
        newState: history.newState,
        transitionBy: history.transitionBy || "STATE_MACHINE_ENGINE",
        reason: history.reason,
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("DB fallback in saveStateHistory:", err);
    }
  }

  // EP02.1 Certificates
  async getCertificates(): Promise<any[]> {
    try {
      const db = getDb();
      const res = await db.select().from(treasuryCertificatesTable).orderBy(desc(treasuryCertificatesTable.createdAt)).limit(100);
      return res.map((item) => ({
        id: item.id,
        certificateId: item.certificateId,
        certType: item.certType,
        treasuryId: item.treasuryId,
        walletId: item.walletId || undefined,
        aiModelId: item.aiModelId || undefined,
        amountAtm: parseFloat(item.amountAtm || "0"),
        timestamp: item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString(),
        sha256Hash: item.sha256Hash,
        digitalSignature: item.digitalSignature,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async saveCertificate(cert: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(treasuryCertificatesTable).values({
        id: cert.id,
        certificateId: cert.certificateId,
        certType: cert.certType,
        treasuryId: cert.treasuryId || "TREASURY-VAULT-MAIN",
        walletId: cert.walletId || null,
        aiModelId: cert.aiModelId || null,
        amountAtm: (cert.amountAtm || 0).toString(),
        timestamp: new Date(cert.timestamp || Date.now()),
        sha256Hash: cert.sha256Hash,
        digitalSignature: cert.digitalSignature,
        createdAt: new Date()
      });
    } catch (err) {
      console.warn("DB fallback in saveCertificate:", err);
    }
  }

  // EP02.1 Flow Inspector
  async getFlowTracks(): Promise<any[]> {
    try {
      const db = getDb();
      const res = await db.select().from(capitalFlowInspectorTable).orderBy(desc(capitalFlowInspectorTable.updatedAt)).limit(50);
      return res.map((item) => ({
        id: item.id,
        correlationId: item.correlationId,
        amountAtm: parseFloat(item.amountAtm || "0"),
        currentStage: item.currentStage,
        status: item.status,
        traceData: item.traceData || [],
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      return [];
    }
  }

  async saveFlowTrack(track: any): Promise<void> {
    try {
      const db = getDb();
      await db.insert(capitalFlowInspectorTable).values({
        id: track.id,
        correlationId: track.correlationId,
        amountAtm: (track.amountAtm || 0).toString(),
        currentStage: track.currentStage,
        status: track.status || "IN_PROGRESS",
        traceData: track.traceData || [],
        createdAt: new Date(track.createdAt || Date.now()),
        updatedAt: new Date(track.updatedAt || Date.now())
      }).onConflictDoUpdate({
        target: capitalFlowInspectorTable.correlationId,
        set: {
          currentStage: track.currentStage,
          status: track.status || "IN_PROGRESS",
          traceData: track.traceData || [],
          updatedAt: new Date()
        }
      });
    } catch (err) {
      console.warn("DB fallback in saveFlowTrack:", err);
    }
  }
}

export const treasuryRepository = new TreasuryRepository();
