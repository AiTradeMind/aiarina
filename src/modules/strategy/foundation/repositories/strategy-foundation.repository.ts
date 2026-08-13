import { getDb } from "../../../../db/client.ts";
import {
  strategyEngineDefinitions,
  strategyEngineSignals,
  strategyEngineMetadata,
  strategyEngineHistory,
  strategyEngineExecutionLogs,
} from "../../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import {
  StrategyDefinitionRecord,
  StrategySignalRecord,
  StrategyHistoryRecord,
  StrategyExecutionLogRecord,
} from "../types/index.ts";
import logger from "../../../../lib/logger.ts";

export class StrategyFoundationRepository {
  private static instance: StrategyFoundationRepository;

  private memoryDefinitions: Map<string, StrategyDefinitionRecord> = new Map();
  private memorySignals: Map<string, StrategySignalRecord> = new Map();
  private memoryMetadata: Map<string, Array<{ key: string; value: any; updatedAt: Date }>> = new Map();
  private memoryHistory: Map<string, StrategyHistoryRecord[]> = new Map();
  private memoryLogs: StrategyExecutionLogRecord[] = [];

  private constructor() {}

  public static getInstance(): StrategyFoundationRepository {
    if (!StrategyFoundationRepository.instance) {
      StrategyFoundationRepository.instance = new StrategyFoundationRepository();
    }
    return StrategyFoundationRepository.instance;
  }

  public async saveStrategy(def: StrategyDefinitionRecord): Promise<StrategyDefinitionRecord> {
    this.memoryDefinitions.set(def.strategyId, def);

    try {
      const db = getDb();
      if (db) {
        const existing = await db
          .select()
          .from(strategyEngineDefinitions)
          .where(eq(strategyEngineDefinitions.strategyId, def.strategyId))
          .limit(1);

        if (existing && existing.length > 0) {
          await db
            .update(strategyEngineDefinitions)
            .set({
              name: def.name,
              strategyType: def.strategyType,
              status: def.status,
              timeframe: def.timeframe,
              symbol: def.symbol || null,
              config: def.config,
              description: def.description || null,
              author: def.author,
              metadata: def.metadata || {},
              updatedAt: def.updatedAt,
            })
            .where(eq(strategyEngineDefinitions.strategyId, def.strategyId));
        } else {
          await db.insert(strategyEngineDefinitions).values({
            strategyId: def.strategyId,
            name: def.name,
            strategyType: def.strategyType,
            status: def.status,
            timeframe: def.timeframe,
            symbol: def.symbol || null,
            config: def.config,
            description: def.description || null,
            author: def.author,
            metadata: def.metadata || {},
            createdAt: def.createdAt,
            updatedAt: def.updatedAt,
          });
        }
      }
    } catch (err: any) {
      logger.warn({
        type: "STRATEGY_REPO_WARN",
        error: err.message,
      }, "Fallback to memory store for saveStrategy");
    }

    return def;
  }

  public async getStrategyById(strategyId: string): Promise<StrategyDefinitionRecord | null> {
    try {
      const db = getDb();
      if (db) {
        const rows = await db
          .select()
          .from(strategyEngineDefinitions)
          .where(eq(strategyEngineDefinitions.strategyId, strategyId))
          .limit(1);

        if (rows && rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            strategyId: r.strategyId,
            name: r.name,
            strategyType: r.strategyType as any,
            status: r.status as any,
            timeframe: r.timeframe || "1D",
            symbol: r.symbol,
            config: (r.config as any) || {},
            description: r.description,
            author: r.author || "SYSTEM",
            metadata: (r.metadata as any) || {},
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          };
        }
      }
    } catch (err: any) {
      logger.warn({
        type: "STRATEGY_REPO_WARN",
        error: err.message,
      }, "Fallback to memory store for getStrategyById");
    }

    return this.memoryDefinitions.get(strategyId) || null;
  }

  public async queryStrategies(filter?: {
    status?: string;
    strategyType?: string;
    limit?: number;
  }): Promise<StrategyDefinitionRecord[]> {
    const limitVal = filter?.limit || 100;

    try {
      const db = getDb();
      if (db) {
        let query = db.select().from(strategyEngineDefinitions);
        const rows = await query.orderBy(desc(strategyEngineDefinitions.createdAt)).limit(limitVal);

        if (rows && rows.length > 0) {
          let list: StrategyDefinitionRecord[] = rows.map((r) => ({
            id: r.id,
            strategyId: r.strategyId,
            name: r.name,
            strategyType: r.strategyType as any,
            status: r.status as any,
            timeframe: r.timeframe || "1D",
            symbol: r.symbol,
            config: (r.config as any) || {},
            description: r.description,
            author: r.author || "SYSTEM",
            metadata: (r.metadata as any) || {},
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          }));

          if (filter?.status) {
            list = list.filter((s) => s.status === filter.status);
          }
          if (filter?.strategyType) {
            list = list.filter((s) => s.strategyType === filter.strategyType);
          }
          return list;
        }
      }
    } catch (err: any) {
      logger.warn({
        type: "STRATEGY_REPO_WARN",
        error: err.message,
      }, "Fallback to memory store for queryStrategies");
    }

    let list = Array.from(this.memoryDefinitions.values());
    if (filter?.status) {
      list = list.filter((s) => s.status === filter.status);
    }
    if (filter?.strategyType) {
      list = list.filter((s) => s.strategyType === filter.strategyType);
    }
    return list.slice(0, limitVal);
  }

  public async updateStrategyStatus(
    strategyId: string,
    toStatus: string,
    changedBy: string,
    reason?: string
  ): Promise<StrategyDefinitionRecord | null> {
    const strategy = await this.getStrategyById(strategyId);
    if (!strategy) return null;

    const fromStatus = strategy.status;
    strategy.status = toStatus as any;
    strategy.updatedAt = new Date();

    await this.saveStrategy(strategy);

    const historyRecord: StrategyHistoryRecord = {
      historyId: `STH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      strategyId,
      fromStatus,
      toStatus,
      changedBy,
      reason: reason || null,
      createdAt: new Date(),
    };

    const existingHist = this.memoryHistory.get(strategyId) || [];
    existingHist.unshift(historyRecord);
    this.memoryHistory.set(strategyId, existingHist);

    try {
      const db = getDb();
      if (db) {
        await db.insert(strategyEngineHistory).values({
          historyId: historyRecord.historyId,
          strategyId: historyRecord.strategyId,
          fromStatus: historyRecord.fromStatus || null,
          toStatus: historyRecord.toStatus,
          changedBy: historyRecord.changedBy,
          reason: historyRecord.reason || null,
          createdAt: historyRecord.createdAt,
        });
      }
    } catch (err: any) {
      logger.warn({
        type: "STRATEGY_REPO_WARN",
        error: err.message,
      }, "Fallback to memory store for updateStrategyStatus history");
    }

    return strategy;
  }

  public async saveSignal(signal: StrategySignalRecord): Promise<StrategySignalRecord> {
    this.memorySignals.set(signal.signalId, signal);

    try {
      const db = getDb();
      if (db) {
        await db.insert(strategyEngineSignals).values({
          signalId: signal.signalId,
          strategyId: signal.strategyId,
          symbol: signal.symbol,
          timeframe: signal.timeframe,
          signalType: signal.signalType,
          confidence: signal.confidence,
          strength: signal.strength.toFixed(2),
          priority: signal.priority,
          supportingContext: signal.supportingContext || {},
          reasoningSummary: signal.reasoningSummary,
          lifecycleStatus: signal.lifecycleStatus,
          metadata: signal.metadata || {},
          generatedAt: signal.generatedAt,
          createdAt: signal.createdAt,
        });
      }
    } catch (err: any) {
      logger.warn({
        type: "STRATEGY_REPO_WARN",
        error: err.message,
      }, "Fallback to memory store for saveSignal");
    }

    return signal;
  }

  public async querySignals(filter?: {
    strategyId?: string;
    symbol?: string;
    signalType?: string;
    limit?: number;
  }): Promise<StrategySignalRecord[]> {
    const limitVal = filter?.limit || 100;

    try {
      const db = getDb();
      if (db) {
        const rows = await db
          .select()
          .from(strategyEngineSignals)
          .orderBy(desc(strategyEngineSignals.createdAt))
          .limit(limitVal);

        if (rows && rows.length > 0) {
          let list: StrategySignalRecord[] = rows.map((r) => ({
            id: r.id,
            signalId: r.signalId,
            strategyId: r.strategyId,
            symbol: r.symbol,
            timeframe: r.timeframe || "1D",
            signalType: r.signalType as any,
            confidence: r.confidence || "MEDIUM",
            strength: parseFloat(r.strength || "75.00"),
            priority: r.priority || "NORMAL",
            supportingContext: (r.supportingContext as any) || {},
            reasoningSummary: r.reasoningSummary || "",
            lifecycleStatus: r.lifecycleStatus || "ACTIVE",
            metadata: (r.metadata as any) || {},
            generatedAt: r.generatedAt,
            createdAt: r.createdAt,
          }));

          if (filter?.strategyId) {
            list = list.filter((s) => s.strategyId === filter.strategyId);
          }
          if (filter?.symbol) {
            list = list.filter((s) => s.symbol.toUpperCase() === filter.symbol!.toUpperCase());
          }
          if (filter?.signalType) {
            list = list.filter((s) => s.signalType === filter.signalType);
          }
          return list;
        }
      }
    } catch (err: any) {
      logger.warn({
        type: "STRATEGY_REPO_WARN",
        error: err.message,
      }, "Fallback to memory store for querySignals");
    }

    let list = Array.from(this.memorySignals.values());
    if (filter?.strategyId) {
      list = list.filter((s) => s.strategyId === filter.strategyId);
    }
    if (filter?.symbol) {
      list = list.filter((s) => s.symbol.toUpperCase() === filter.symbol!.toUpperCase());
    }
    if (filter?.signalType) {
      list = list.filter((s) => s.signalType === filter.signalType);
    }
    return list.slice(0, limitVal);
  }

  public async getHistory(strategyId?: string): Promise<StrategyHistoryRecord[]> {
    try {
      const db = getDb();
      if (db) {
        let query = db.select().from(strategyEngineHistory);
        if (strategyId) {
          query = query.where(eq(strategyEngineHistory.strategyId, strategyId)) as any;
        }
        const rows = await query.orderBy(desc(strategyEngineHistory.createdAt)).limit(100);

        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            historyId: r.historyId,
            strategyId: r.strategyId,
            fromStatus: r.fromStatus,
            toStatus: r.toStatus,
            changedBy: r.changedBy || "SYSTEM",
            reason: r.reason,
            createdAt: r.createdAt,
          }));
        }
      }
    } catch (err: any) {
      logger.warn({
        type: "STRATEGY_REPO_WARN",
        error: err.message,
      }, "Fallback to memory store for getHistory");
    }

    if (strategyId) {
      return this.memoryHistory.get(strategyId) || [];
    }

    const allHistory: StrategyHistoryRecord[] = [];
    for (const hList of this.memoryHistory.values()) {
      allHistory.push(...hList);
    }
    return allHistory.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async saveExecutionLog(log: StrategyExecutionLogRecord): Promise<StrategyExecutionLogRecord> {
    this.memoryLogs.push(log);

    try {
      const db = getDb();
      if (db) {
        await db.insert(strategyEngineExecutionLogs).values({
          logId: log.logId,
          strategyId: log.strategyId,
          runId: log.runId,
          stage: log.stage,
          status: log.status,
          executionTimeMs: log.executionTimeMs,
          failureReason: log.failureReason || null,
          details: log.details || {},
          createdAt: log.createdAt,
        });
      }
    } catch (err: any) {
      logger.warn({
        type: "STRATEGY_REPO_WARN",
        error: err.message,
      }, "Fallback to memory store for saveExecutionLog");
    }

    return log;
  }

  public getMemoryCounts() {
    return {
      definitionsCount: this.memoryDefinitions.size,
      signalsCount: this.memorySignals.size,
      logsCount: this.memoryLogs.length,
    };
  }
}
