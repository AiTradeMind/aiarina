import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { sql } from "drizzle-orm";
import { performanceRepository } from "../repositories/PerformanceRepository.ts";
import { performanceEngine } from "../engines/PerformanceEngine.ts";
import { performanceService } from "../services/PerformanceService.ts";

describe("EP07A Enterprise AI Performance Engine", () => {
  const orgId = "org_perf_test_1";
  const orgId2 = "org_perf_test_2";
  const aiModelId = "ai_model_abc";
  const strategyId = "strategy_xyz";

  beforeAll(async () => {
    await performanceRepository.ensureTables();
    const db = getDb();
    await db.execute(sql`
      INSERT INTO organizations (id, name, description) 
      VALUES (${orgId}, 'Test Perf Org 1', 'Test')
      ON CONFLICT DO NOTHING
    `);
    await db.execute(sql`
      INSERT INTO organizations (id, name, description) 
      VALUES (${orgId2}, 'Test Perf Org 2', 'Test')
      ON CONFLICT DO NOTHING
    `);
  });

  afterAll(async () => {
    const db = getDb();
    await db.execute(sql`DELETE FROM enterprise_performance_metrics WHERE organization_id IN (${orgId}, ${orgId2})`);
  });

  it("should calculate ROI, Win Rate, and Drawdown correctly", () => {
    const trades = [
      { status: 'CLOSED', realizedPnl: '100', fees: '2', entryTime: '2023-01-01T10:00:00Z', exitTime: '2023-01-01T11:00:00Z' }, // net 98
      { status: 'CLOSED', realizedPnl: '-50', fees: '1', entryTime: '2023-01-01T11:00:00Z', exitTime: '2023-01-01T11:30:00Z' }, // net -51
      { status: 'CLOSED', realizedPnl: '200', fees: '3', entryTime: '2023-01-01T12:00:00Z', exitTime: '2023-01-01T13:00:00Z' }, // net 197
    ];

    const metrics = performanceEngine.calculateMetrics(trades);
    
    expect(metrics.totalTrades).toBe(3);
    expect(metrics.winningTrades).toBe(2);
    expect(metrics.losingTrades).toBe(1);
    expect(metrics.winRate).toBeCloseTo(0.666, 2);
    expect(metrics.lossRate).toBeCloseTo(0.333, 2);
    
    // Net PnL = 98 - 51 + 197 = 244
    expect(metrics.netPnL).toBe(244);
    
    // Peak 1: 98, Drawdown: (98 - (98 - 51)) / 98 = 51 / 98 ≈ 0.52
    expect(metrics.maxDrawdown).toBeCloseTo(0.52, 2);
  });

  it("should enforce tenant isolation", async () => {
    await performanceService.computeAndSaveMetrics(orgId, 'AI_MODEL', aiModelId, [
       { status: 'CLOSED', realizedPnl: '100', fees: '0' }
    ]);
    await performanceService.computeAndSaveMetrics(orgId2, 'AI_MODEL', aiModelId, [
       { status: 'CLOSED', realizedPnl: '-200', fees: '0' }
    ]);
    
    const metric1 = await performanceRepository.getMetric(orgId, 'AI_MODEL', aiModelId);
    const metric2 = await performanceRepository.getMetric(orgId2, 'AI_MODEL', aiModelId);
    
    expect(metric1?.netPnL).toBe(100);
    expect(metric2?.netPnL).toBe(-200);
  });

  it("should handle empty trade history gracefully", () => {
    const metrics = performanceEngine.calculateMetrics([]);
    expect(metrics.totalTrades).toBe(0);
    expect(metrics.winRate).toBe(0);
    expect(metrics.netPnL).toBe(0);
    expect(metrics.maxDrawdown).toBe(0);
  });

});
