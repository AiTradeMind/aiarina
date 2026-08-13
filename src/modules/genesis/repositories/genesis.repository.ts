import { eq, desc } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  systemBootTable, 
  genesisSessionTable, 
  systemStateTable, 
  workspaceRegistryTable, 
  aiRegistryTable, 
  walletRegistryTable, 
  bootAuditTable, 
  systemEventsTable,
  bootEventsTable,
  marketStateTable,
  tradingCalendarTable,
  masterRegistryTable,
  runtimeLockTable,
  recoverySessionTable,
  startupChecklistTable
} from "../../../db/schema.ts";

export class GenesisRepository {
  async createBootRecord(data: any) {
    try {
      const db = getDb();
      const res = await db.insert(systemBootTable).values(data).returning();
      return res[0];
    } catch (err) {
      console.warn("Database fallback in GenesisRepository createBootRecord:", err);
      return data;
    }
  }

  async getLatestBootRecord() {
    try {
      const db = getDb();
      const res = await db.select().from(systemBootTable).orderBy(desc(systemBootTable.createdAt)).limit(1);
      return res[0] || null;
    } catch (err) {
      return null;
    }
  }

  async createGenesisSession(data: any) {
    try {
      const db = getDb();
      const res = await db.insert(genesisSessionTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async saveSystemState(data: any) {
    try {
      const db = getDb();
      const res = await db.insert(systemStateTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getLatestSystemState() {
    try {
      const db = getDb();
      const res = await db.select().from(systemStateTable).orderBy(desc(systemStateTable.createdAt)).limit(1);
      return res[0] || null;
    } catch (err) {
      return null;
    }
  }

  async registerWorkspace(data: any) {
    try {
      const db = getDb();
      // Check if workspace already exists to avoid duplicate workspace creation
      const existing = await db.select().from(workspaceRegistryTable).where(eq(workspaceRegistryTable.workspaceId, data.workspaceId)).limit(1);
      if (existing.length > 0) {
        return existing[0];
      }
      const res = await db.insert(workspaceRegistryTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getWorkspaces() {
    try {
      const db = getDb();
      return await db.select().from(workspaceRegistryTable);
    } catch (err) {
      return [];
    }
  }

  async registerAiModel(data: any) {
    try {
      const db = getDb();
      // Check if model already exists
      const existing = await db.select().from(aiRegistryTable).where(eq(aiRegistryTable.modelNumber, data.modelNumber)).limit(1);
      if (existing.length > 0) {
        // Ensure status is OFF
        await db.update(aiRegistryTable)
          .set({ status: "OFF", lifecycleState: "IDLE", walletBalanceATM: "0.00000000", portfolioValueATM: "0.00000000" })
          .where(eq(aiRegistryTable.modelNumber, data.modelNumber));
        return existing[0];
      }
      const res = await db.insert(aiRegistryTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getAiModels() {
    try {
      const db = getDb();
      return await db.select().from(aiRegistryTable).orderBy(aiRegistryTable.modelNumber);
    } catch (err) {
      return [];
    }
  }

  async registerWallet(data: any) {
    try {
      const db = getDb();
      const existing = await db.select().from(walletRegistryTable).where(eq(walletRegistryTable.id, data.id)).limit(1);
      if (existing.length > 0) {
        await db.update(walletRegistryTable)
          .set({ balance: "0.00000000", reservedBalance: "0.00000000", usedBalance: "0.00000000", status: "ZERO_STATE_INITIALIZED" })
          .where(eq(walletRegistryTable.id, data.id));
        return existing[0];
      }
      const res = await db.insert(walletRegistryTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getWallets() {
    try {
      const db = getDb();
      return await db.select().from(walletRegistryTable);
    } catch (err) {
      return [];
    }
  }

  async createBootAudit(data: any) {
    try {
      const db = getDb();
      const res = await db.insert(bootAuditTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getBootAudits() {
    try {
      const db = getDb();
      return await db.select().from(bootAuditTable).orderBy(desc(bootAuditTable.createdAt)).limit(20);
    } catch (err) {
      return [];
    }
  }

  async publishSystemEvent(data: any) {
    try {
      const db = getDb();
      const payloadStr = typeof data.payload === "string" ? data.payload : JSON.stringify(data.payload);
      
      const record = {
        id: data.id,
        tenantId: data.tenantId || "TNT-MAIN-001",
        workspaceId: data.workspaceId || "WKS-GENESIS-01",
        eventType: data.eventType,
        sourceModule: "GENESIS_ENGINE",
        payload: payloadStr,
        correlationId: data.correlationId,
      };

      await db.insert(systemEventsTable).values(record).catch(() => {});
      await db.insert(bootEventsTable).values(record).catch(() => {});
      return record;
    } catch (err) {
      return data;
    }
  }

  async getSystemEvents() {
    try {
      const db = getDb();
      const events = await db.select().from(bootEventsTable).orderBy(desc(bootEventsTable.createdAt)).limit(50);
      if (events.length > 0) return events;
      return await db.select().from(systemEventsTable).orderBy(desc(systemEventsTable.createdAt)).limit(50);
    } catch (err) {
      return [];
    }
  }

  async saveMarketState(data: any) {
    try {
      const db = getDb();
      const existing = await db.select().from(marketStateTable).where(eq(marketStateTable.exchangeCode, data.exchangeCode)).limit(1);
      if (existing.length > 0) {
        await db.update(marketStateTable).set(data).where(eq(marketStateTable.exchangeCode, data.exchangeCode));
        return existing[0];
      }
      const res = await db.insert(marketStateTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getMarketStates() {
    try {
      const db = getDb();
      return await db.select().from(marketStateTable);
    } catch (err) {
      return [];
    }
  }

  async saveTradingCalendar(data: any) {
    try {
      const db = getDb();
      const existing = await db.select().from(tradingCalendarTable).where(eq(tradingCalendarTable.id, data.id)).limit(1);
      if (existing.length > 0) return existing[0];
      const res = await db.insert(tradingCalendarTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getTradingCalendars() {
    try {
      const db = getDb();
      return await db.select().from(tradingCalendarTable);
    } catch (err) {
      return [];
    }
  }

  async saveMasterRegistry(data: any) {
    try {
      const db = getDb();
      const existing = await db.select().from(masterRegistryTable).where(eq(masterRegistryTable.masterType, data.masterType)).limit(1);
      if (existing.length > 0) return existing[0];
      const res = await db.insert(masterRegistryTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getMasterRegistries() {
    try {
      const db = getDb();
      return await db.select().from(masterRegistryTable);
    } catch (err) {
      return [];
    }
  }

  async saveRuntimeLock(data: any) {
    try {
      const db = getDb();
      const existing = await db.select().from(runtimeLockTable).where(eq(runtimeLockTable.runtimeName, data.runtimeName)).limit(1);
      if (existing.length > 0) {
        await db.update(runtimeLockTable).set({ lockStatus: "LOCKED" }).where(eq(runtimeLockTable.runtimeName, data.runtimeName));
        return existing[0];
      }
      const res = await db.insert(runtimeLockTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getRuntimeLocks() {
    try {
      const db = getDb();
      return await db.select().from(runtimeLockTable);
    } catch (err) {
      return [];
    }
  }

  async saveRecoverySession(data: any) {
    try {
      const db = getDb();
      const res = await db.insert(recoverySessionTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getRecoverySession() {
    try {
      const db = getDb();
      const res = await db.select().from(recoverySessionTable).orderBy(desc(recoverySessionTable.createdAt)).limit(1);
      return res[0] || null;
    } catch (err) {
      return null;
    }
  }

  async saveStartupChecklist(data: any) {
    try {
      const db = getDb();
      const existing = await db.select().from(startupChecklistTable).where(eq(startupChecklistTable.checkName, data.checkName)).limit(1);
      if (existing.length > 0) return existing[0];
      const res = await db.insert(startupChecklistTable).values(data).returning();
      return res[0];
    } catch (err) {
      return data;
    }
  }

  async getStartupChecklist() {
    try {
      const db = getDb();
      return await db.select().from(startupChecklistTable);
    } catch (err) {
      return [];
    }
  }
}

export const genesisRepository = new GenesisRepository();

