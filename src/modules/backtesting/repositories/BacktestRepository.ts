import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class BacktestRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_backtests (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        config JSONB NOT NULL,
        status VARCHAR(32) DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_backtest_runs (
        id VARCHAR(64) PRIMARY KEY,
        backtest_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'PENDING',
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS enterprise_backtest_results (
        id VARCHAR(64) PRIMARY KEY,
        backtest_id VARCHAR(64) NOT NULL,
        results JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_backtest_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        backtest_id VARCHAR(64) NOT NULL,
        run_id VARCHAR(64) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        metrics JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async insertBacktest(config: any): Promise<void> {
    await this.ensureTables();
    const db = getDb();
    await db.execute(sql`
      INSERT INTO enterprise_backtests (id, organization_id, config)
      VALUES (${config.id}, ${config.organizationId}, ${JSON.stringify(config)}::jsonb)
    `);
  }

  async insertRun(run: { id: string; backtestId: string }): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO enterprise_backtest_runs (id, backtest_id)
      VALUES (${run.id}, ${run.backtestId})
    `);
  }

  async insertResult(result: { id: string; backtestId: string; results: any }): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO enterprise_backtest_results (id, backtest_id, results)
      VALUES (${result.id}, ${result.backtestId}, ${JSON.stringify(result.results)}::jsonb)
    `);
  }
}

export const backtestRepository = new BacktestRepository();
