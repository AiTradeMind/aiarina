import { Router } from "express";
import { getDb } from "../../../db/client.ts";

export const databaseRouter = Router();

databaseRouter.get("/indexes", async (req, res) => {
  try {
    const db = getDb();
    const result = await db.execute(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM
        pg_indexes
      WHERE
        schemaname = 'public';
    `);
    res.json({ success: true, indexes: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

databaseRouter.get("/performance", async (req, res) => {
  try {
    const db = getDb();
    const result = await db.execute(`
      SELECT
        relname AS table_name,
        seq_scan,
        seq_tup_read,
        idx_scan,
        idx_tup_fetch
      FROM
        pg_stat_user_tables;
    `);
    res.json({ success: true, performance: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

databaseRouter.get("/health", async (req, res) => {
  try {
    const db = getDb();
    const result = await db.execute(`
      SELECT
        relname AS table_name,
        n_live_tup AS live_tuples,
        n_dead_tup AS dead_tuples
      FROM
        pg_stat_user_tables;
    `);
    res.json({ success: true, health: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

databaseRouter.get("/slow-queries", async (req, res) => {
  try {
    const db = getDb();
    // Assuming pg_stat_statements is enabled, otherwise fallback
    try {
        const result = await db.execute(`
          SELECT query, calls, total_exec_time, mean_exec_time
          FROM pg_stat_statements
          ORDER BY mean_exec_time DESC
          LIMIT 10;
        `);
        res.json({ success: true, slowQueries: result });
    } catch (e) {
        res.json({ success: true, slowQueries: [], message: "pg_stat_statements may not be enabled" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
