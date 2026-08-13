import { getDb } from '../../../db/client';
import {
  enterpriseGatewayRegistry,
  enterpriseGatewayRoutes,
  enterpriseGatewayMetrics,
  enterpriseGatewayLogs,
  enterpriseGatewayHealth,
  enterpriseGatewayRateLimits,
  enterpriseGatewayVersions,
  enterpriseGatewayConsumers,
  enterpriseGatewayPolicies,
  enterpriseGatewayUsage
} from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';

export class EnterpriseGatewayRepository {
  public static async getRegistry() {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayRegistry);
    } catch {
      return [];
    }
  }

  public static async getRoutes() {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayRoutes);
    } catch {
      return [];
    }
  }

  public static async getMetrics() {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayMetrics).orderBy(desc(enterpriseGatewayMetrics.timestamp)).limit(50);
    } catch {
      return [];
    }
  }

  public static async getLogs(limit = 100) {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayLogs).orderBy(desc(enterpriseGatewayLogs.timestamp)).limit(limit);
    } catch {
      return [];
    }
  }

  public static async createLog(logData: {
    correlationId: string;
    requestId: string;
    clientIp?: string;
    consumerId?: string;
    routeId?: string;
    path: string;
    method: string;
    statusCode: number;
    executionTimeMs: number;
    errorDetails?: string;
  }) {
    try {
      const db = getDb();
      await db.insert(enterpriseGatewayLogs).values(logData);
    } catch (err) {
      // Gracefully catch database connection errors when running in isolated test mode
    }
  }

  public static async getHealth() {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayHealth).orderBy(desc(enterpriseGatewayHealth.lastChecked)).limit(20);
    } catch {
      return [];
    }
  }

  public static async getRateLimits() {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayRateLimits);
    } catch {
      return [];
    }
  }

  public static async getVersions() {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayVersions);
    } catch {
      return [];
    }
  }

  public static async getConsumers() {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayConsumers);
    } catch {
      return [];
    }
  }

  public static async getPolicies() {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayPolicies);
    } catch {
      return [];
    }
  }

  public static async getUsage() {
    try {
      const db = getDb();
      return await db.select().from(enterpriseGatewayUsage).orderBy(desc(enterpriseGatewayUsage.usageDate)).limit(50);
    } catch {
      return [];
    }
  }
}
