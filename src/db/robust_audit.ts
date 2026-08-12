import { getDb } from "./client.ts";
import { sql } from "drizzle-orm";

async function robustAudit() {
  const db = getDb();
  console.log("Starting Robust Database Audit...\n");

  try {
    // List all tables with their columns
    const result = await db.execute(sql`
      SELECT 
        t.table_name, 
        c.column_name, 
        c.data_type,
        c.is_nullable
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name, c.column_name;
    `);
    
    const dbSchema: Record<string, any[]> = {};
    
    result.rows.forEach((row: any) => {
      if (!dbSchema[row.table_name]) {
        dbSchema[row.table_name] = [];
      }
      dbSchema[row.table_name].push({
        column: row.column_name,
        type: row.data_type
      });
    });

    console.log(JSON.stringify(dbSchema, null, 2));
  } catch (error) {
    console.error("Audit failed:", error);
  } finally {
    process.exit(0);
  }
}

robustAudit();
