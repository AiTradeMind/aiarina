import { getDb } from "../../db/client";
import { sql } from "drizzle-orm";
import logger from "../../lib/logger";
import { config } from "../config/env";
import { ProviderFactory } from "../providers/provider.factory";
import { QueueManager } from "../queue/queue.manager";
import { MarketSessionEngine } from "../market/market-session.engine";

export interface SubsystemHealth {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  latencyMs?: number;
  details?: Record<string, any>;
  error?: string;
}

export interface SystemHealthReport {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  subsystems: {
    database: SubsystemHealth;
    aiGateway: SubsystemHealth;
    eventBus: SubsystemHealth;
    systemMemory: SubsystemHealth;
    providers: SubsystemHealth;
    queue: SubsystemHealth;
    marketSession: SubsystemHealth;
  };
}

export class HealthService {
  async check(): Promise<SystemHealthReport> {
    const timestamp = new Date().toISOString();
    const uptimeSeconds = Math.floor(process.uptime());

    // 1. Database Health Check
    let dbHealth: SubsystemHealth = { status: 'DOWN' };
    const dbStart = Date.now();
    try {
      const db = getDb();
      await db.execute(sql`SELECT 1`);
      dbHealth = {
        status: 'UP',
        latencyMs: Date.now() - dbStart,
      };
    } catch (error: any) {
      dbHealth = {
        status: 'DOWN',
        latencyMs: Date.now() - dbStart,
        error: error?.message || 'Database query failed',
      };
    }

    // 2. AI Gateway Health Check
    let aiHealth: SubsystemHealth = { status: 'UP' };
    if (!config.OPENROUTER_API_KEY || config.OPENROUTER_API_KEY === 'dev_key') {
      aiHealth = {
        status: 'DEGRADED',
        details: { provider: 'openrouter', mode: 'development_fallback' },
      };
    } else {
      aiHealth = {
        status: 'UP',
        details: { provider: 'openrouter', defaultModel: config.OPENROUTER_DEFAULT_MODEL },
      };
    }

    // 3. Provider Factory Health
    let providerHealth: SubsystemHealth = { status: 'UP' };
    try {
      const providerFactory = ProviderFactory.getInstance();
      const providerStatus = await providerFactory.validateAllProvidersHealth();
      providerHealth = {
        status: 'UP',
        details: providerStatus
      };
    } catch (err: any) {
      providerHealth = {
        status: 'DEGRADED',
        error: err.message
      };
    }

    // 4. Queue Health & Metrics
    const queueManager = QueueManager.getInstance();
    const queueMetrics = queueManager.getMetrics();
    const queueHealth: SubsystemHealth = {
      status: queueMetrics.dlqSize > 50 ? 'DEGRADED' : 'UP',
      details: queueMetrics
    };

    // 5. Market Session Health
    const sessionEngine = MarketSessionEngine.getInstance();
    const sessionInfo = sessionEngine.getSessionInfo('NSE');
    const marketSessionHealth: SubsystemHealth = {
      status: 'UP',
      details: sessionInfo
    };

    // 6. Event Bus Health Check
    const eventBusHealth: SubsystemHealth = {
      status: 'UP',
      details: { driver: 'in-memory-event-emitter', status: 'operational' },
    };

    // 7. System Memory Health Check
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100;
    const heapTotalMB = Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100;
    const rssMB = Math.round((memUsage.rss / 1024 / 1024) * 100) / 100;

    const memoryHealth: SubsystemHealth = {
      status: heapUsedMB > 1500 ? 'DEGRADED' : 'UP',
      details: {
        heapUsedMB,
        heapTotalMB,
        rssMB,
      },
    };

    // Determine Overall System Status
    const isDbUp = dbHealth.status === 'UP';
    let overallStatus: 'UP' | 'DEGRADED' | 'DOWN' = 'UP';

    if (!isDbUp) {
      overallStatus = 'DOWN';
    } else if (
      aiHealth.status === 'DEGRADED' ||
      memoryHealth.status === 'DEGRADED' ||
      providerHealth.status === 'DEGRADED' ||
      queueHealth.status === 'DEGRADED'
    ) {
      overallStatus = 'DEGRADED';
    }

    if (overallStatus !== 'UP') {
      logger.warn({ overallStatus, dbHealth, aiHealth }, 'System health degraded or down');
    }

    return {
      status: overallStatus,
      timestamp,
      uptimeSeconds,
      environment: config.NODE_ENV,
      version: '1.0.0',
      subsystems: {
        database: dbHealth,
        aiGateway: aiHealth,
        eventBus: eventBusHealth,
        systemMemory: memoryHealth,
        providers: providerHealth,
        queue: queueHealth,
        marketSession: marketSessionHealth,
      },
    };
  }
}
