import { getDb } from "./client.ts";
import { sql } from "drizzle-orm";

async function auditDatabase() {
  const db = getDb();
  console.log("Starting Database Audit...\n");

  try {
    // 1. List all tables
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log("Tables found:", tables.rows.map((r: any) => r.table_name));

    // 2. For each table, list columns
    for (const table of tables.rows) {
      const tableName = table.table_name;
      const columns = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${tableName} 
        AND table_schema = 'public';
      `);
      console.log(`\nTable: ${tableName}`);
      columns.rows.forEach((col: any) => console.log(` - ${col.column_name} (${col.data_type})`));
    }
  } catch (error) {
    console.error("Audit failed:", error);
  } finally {
    process.exit(0);
  }
}

auditDatabase();
