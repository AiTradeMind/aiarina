import { strategyRuntimeRepository } from '../repositories/strategy-runtime.repository.ts';
import { RuntimeOverview, RuntimeState, RuntimePriority } from '../types/index.ts';

export class StrategyRuntimeService {
  async getSessions(strategyId: string = 'STRAT-001'): Promise<RuntimeOverview> {
    return await strategyRuntimeRepository.getSessions(strategyId);
  }

  async getSessionById(sessionId: string) {
    return await strategyRuntimeRepository.getSessionById(sessionId);
  }

  async createSession(strategyId: string, data: any) {
    return await strategyRuntimeRepository.createSession(strategyId, data);
  }

  async retrySession(sessionId: string, operator: string) {
    return await strategyRuntimeRepository.retrySession(sessionId, operator);
  }

  async cancelSession(sessionId: string, operator: string) {
    return await strategyRuntimeRepository.cancelSession(sessionId, operator);
  }

  async archiveSession(sessionId: string, operator: string) {
    return await strategyRuntimeRepository.archiveSession(sessionId, operator);
  }

  async updateSessionState(sessionId: string, newState: RuntimeState, operator: string, comment?: string): Promise<RuntimeOverview> {
    return await strategyRuntimeRepository.updateSessionState(sessionId, newState, operator, comment);
  }

  async updatePriority(sessionId: string, priority: RuntimePriority, operator: string): Promise<RuntimeOverview> {
    return await strategyRuntimeRepository.updatePriority(sessionId, priority, operator);
  }

  async bulkOperation(strategyId: string, operation: string, sessionIds: string[], operator: string): Promise<RuntimeOverview> {
    return await strategyRuntimeRepository.bulkOperation(strategyId, operation, sessionIds, operator);
  }

  async getWorkers() {
    return await strategyRuntimeRepository.getWorkers();
  }

  async getQueue(strategyId: string) {
    return await strategyRuntimeRepository.getQueue(strategyId);
  }

  async resetStrategyData({ confirm, resetState }: { confirm: boolean; resetState: string }) {
    if (!confirm || resetState !== "ON") {
      throw new Error("Reset confirmation required. resetState must be ON.");
    }

    const { getDb } = await import("../../../../db/client.ts");
    const { strategyExecutions, strategyResults } = await import("../../../../db/schema.ts");

    const db = getDb();
    let recordsCleared = 0;

    if (db) {
      try {
        const resRes = await db.delete(strategyResults).returning();
        recordsCleared += resRes.length;
      } catch (e) {
        // ignore
      }

      try {
        const execRes = await db.delete(strategyExecutions).returning();
        recordsCleared += execRes.length;
      } catch (e) {
        // ignore
      }
    }

    const resetRunId = `RST-STRAT-${Date.now()}`;
    return {
      module: "STRATEGY",
      resetRunId,
      status: "COMPLETED",
      recordsCleared: recordsCleared || 0,
      timestamp: new Date().toISOString()
    };
  }
}

export const strategyRuntimeService = new StrategyRuntimeService();
