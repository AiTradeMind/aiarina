import { getDb } from "./client.ts";
import { sql } from "drizzle-orm";

async function createSchema() {
  const db = getDb();
  console.log("Creating database schema...\n");

  try {
    // This is a simplified example of how to trigger schema creation.
    // In a real production scenario, use a migration tool like Drizzle Kit.
    // Here we will run a block that ensures tables exist.
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL DEFAULT 'trader',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS paper_orders (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        ticker VARCHAR(12) NOT NULL,
        type VARCHAR(20) NOT NULL,
        side VARCHAR(10) NOT NULL,
        quantity NUMERIC(12, 4) NOT NULL,
        price NUMERIC(12, 2),
        status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS paper_trades (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES paper_orders(id) ON DELETE CASCADE,
        organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,
        ticker VARCHAR(12) NOT NULL,
        side VARCHAR(10) NOT NULL,
        quantity NUMERIC(12, 4) NOT NULL,
        execution_price NUMERIC(12, 2) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS paper_order_details (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES paper_orders(id) ON DELETE CASCADE NOT NULL,
        stop_loss NUMERIC(12, 2) NOT NULL,
        target NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log("Schema creation initiated.");
  } catch (error) {
    console.error("Schema creation failed:", error);
  } finally {
    process.exit(0);
  }
}

createSchema();
