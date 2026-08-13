import { getDb } from "../../../db/client.ts";
import { sql } from "drizzle-orm";
import { IPerformanceMetric, IPerformanceSnapshot, IAIRanking, IStrategyRanking } from "../types/index.ts";

export class PerformanceRepository {
  public async getMetrics(organizationId: string, entityType: string, entityId?: string): Promise<IPerformanceMetric[]> {
    const db = getDb();
    let result;
    if (entityId) {
      result = await db.execute(sql`SELECT * FROM enterprise_performance_metrics WHERE organization_id = ${organizationId} AND entity_type = ${entityType} AND entity_id = ${entityId}`);
    } else {
      result = await db.execute(sql`SELECT * FROM enterprise_performance_metrics WHERE organization_id = ${organizationId} AND entity_type = ${entityType}`);
    }
    return result.rows.map((row: any) => ({
      id: row.id,
      organizationId: row.organization_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      totalTrades: row.total_trades,
      winningTrades: row.winning_trades,
      losingTrades: row.losing_trades,
      winRate: parseFloat(row.win_rate),
      lossRate: parseFloat(row.loss_rate),
      grossPnL: parseFloat(row.gross_pnl),
      netPnL: parseFloat(row.net_pnl),
      roi: parseFloat(row.roi),
      maxDrawdown: parseFloat(row.max_drawdown),
      profitFactor: parseFloat(row.profit_factor),
      expectancy: parseFloat(row.expectancy),
      avgHoldingTimeMs: Number(row.avg_holding_time_ms),
      capitalEfficiency: parseFloat(row.capital_efficiency),
      riskScore: parseFloat(row.risk_score),
      consistencyScore: parseFloat(row.consistency_score),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } as IPerformanceMetric));
  }

  public async getMetric(organizationId: string, entityType: string, entityId: string): Promise<IPerformanceMetric | null> {
    const db = getDb();
    const result = await db.execute(sql`
      SELECT * FROM enterprise_performance_metrics 
      WHERE organization_id = ${organizationId} 
      AND entity_type = ${entityType} 
      AND entity_id = ${entityId} 
      LIMIT 1
    `);
    if (!result.rows.length) return null;
    const row: any = result.rows[0];
    return {
      id: row.id,
      organizationId: row.organization_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      totalTrades: row.total_trades,
      winningTrades: row.winning_trades,
      losingTrades: row.losing_trades,
      winRate: parseFloat(row.win_rate),
      lossRate: parseFloat(row.loss_rate),
      grossPnL: parseFloat(row.gross_pnl),
      netPnL: parseFloat(row.net_pnl),
      roi: parseFloat(row.roi),
      maxDrawdown: parseFloat(row.max_drawdown),
      profitFactor: parseFloat(row.profit_factor),
      expectancy: parseFloat(row.expectancy),
      avgHoldingTimeMs: Number(row.avg_holding_time_ms),
      capitalEfficiency: parseFloat(row.capital_efficiency),
      riskScore: parseFloat(row.risk_score),
      consistencyScore: parseFloat(row.consistency_score),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } as IPerformanceMetric;
  }

  public async upsertMetric(metric: IPerformanceMetric): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO enterprise_performance_metrics (
        id, organization_id, entity_type, entity_id, total_trades, winning_trades, losing_trades,
        win_rate, loss_rate, gross_pnl, net_pnl, roi, max_drawdown, profit_factor, expectancy,
        avg_holding_time_ms, capital_efficiency, risk_score, consistency_score, updated_at
      ) VALUES (
        ${metric.id}, ${metric.organizationId}, ${metric.entityType}, ${metric.entityId},
        ${metric.totalTrades}, ${metric.winningTrades}, ${metric.losingTrades},
        ${metric.winRate}, ${metric.lossRate}, ${metric.grossPnL}, ${metric.netPnL},
        ${metric.roi}, ${metric.maxDrawdown}, ${metric.profitFactor}, ${metric.expectancy},
        ${metric.avgHoldingTimeMs}, ${metric.capitalEfficiency}, ${metric.riskScore}, ${metric.consistencyScore},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (organization_id, entity_type, entity_id) DO UPDATE SET
        total_trades = EXCLUDED.total_trades,
        winning_trades = EXCLUDED.winning_trades,
        losing_trades = EXCLUDED.losing_trades,
        win_rate = EXCLUDED.win_rate,
        loss_rate = EXCLUDED.loss_rate,
        gross_pnl = EXCLUDED.gross_pnl,
        net_pnl = EXCLUDED.net_pnl,
        roi = EXCLUDED.roi,
        max_drawdown = EXCLUDED.max_drawdown,
        profit_factor = EXCLUDED.profit_factor,
        expectancy = EXCLUDED.expectancy,
        avg_holding_time_ms = EXCLUDED.avg_holding_time_ms,
        capital_efficiency = EXCLUDED.capital_efficiency,
        risk_score = EXCLUDED.risk_score,
        consistency_score = EXCLUDED.consistency_score,
        updated_at = CURRENT_TIMESTAMP
    `);
  }

  public async getHistory(organizationId: string, entityType: string, entityId: string): Promise<IPerformanceSnapshot[]> {
    const db = getDb();
    const result = await db.execute(sql`
      SELECT * FROM enterprise_performance_snapshots
      WHERE organization_id = ${organizationId}
      AND entity_type = ${entityType}
      AND entity_id = ${entityId}
      ORDER BY snapshot_date DESC
    `);
    return result.rows as unknown as IPerformanceSnapshot[];
  }

  public async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_performance_metrics (
        id VARCHAR(50) PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        entity_type VARCHAR(20) NOT NULL,
        entity_id VARCHAR(50) NOT NULL,
        total_trades INTEGER DEFAULT 0,
        winning_trades INTEGER DEFAULT 0,
        losing_trades INTEGER DEFAULT 0,
        win_rate NUMERIC DEFAULT 0,
        loss_rate NUMERIC DEFAULT 0,
        gross_pnl NUMERIC DEFAULT 0,
        net_pnl NUMERIC DEFAULT 0,
        roi NUMERIC DEFAULT 0,
        max_drawdown NUMERIC DEFAULT 0,
        profit_factor NUMERIC DEFAULT 0,
        expectancy NUMERIC DEFAULT 0,
        avg_holding_time_ms BIGINT DEFAULT 0,
        capital_efficiency NUMERIC DEFAULT 0,
        risk_score NUMERIC DEFAULT 0,
        consistency_score NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE (organization_id, entity_type, entity_id)
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_performance_snapshots (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        entity_type VARCHAR(20) NOT NULL,
        entity_id VARCHAR(50) NOT NULL,
        snapshot_date DATE NOT NULL,
        metrics JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_ai_rankings (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        ai_model_id VARCHAR(50) NOT NULL,
        rank INTEGER NOT NULL,
        score NUMERIC NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE (organization_id, ai_model_id)
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_strategy_rankings (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        strategy_id VARCHAR(50) NOT NULL,
        rank INTEGER NOT NULL,
        score NUMERIC NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE (organization_id, strategy_id)
      )
    `);
  }
}

export const performanceRepository = new PerformanceRepository();
