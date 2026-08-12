import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import * as schema from "./schema.ts";
import logger from "../lib/logger";
import { config } from "../infrastructure/config/env";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let poolInstance: pg.Pool | null = null;
let isConnected = false;
let isConnecting = false;
let connectPromise: Promise<boolean> | null = null;

/**
 * Gets or initializes the Drizzle PostgreSQL database client.
 * Uses connection pool with optimized options and error listeners to prevent uncaught exception crashes.
 */
export function getDb() {
  if (!dbInstance) {
    const connectionString = config.DATABASE_URL;
    logger.info({ connectionString: connectionString ? 'PRESENT' : 'MISSING' }, "DATABASE_URL check");
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required to connect to the database");
    }

    try {
      poolInstance = new pg.Pool({
        connectionString,
        ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false }, // Required for secure hosted cloud databases
        max: 20, // Pool exhaustion protection
        idleTimeoutMillis: 15000, // Close idle clients sooner to prevent connection leaks
        connectionTimeoutMillis: 5000, // Connection timeout handling
      });

      // Handle idle connection errors gracefully so they don't crash Node process
      poolInstance.on("error", (err) => {
        logger.error({ error: err.message }, "PostgreSQL Pool idle client error");
        isConnected = false;
      });

      dbInstance = drizzle(poolInstance, { schema });
    } catch (error: any) {
      logger.error({ error: error.message }, "Failed to initialize database connection pool");
      throw error;
    }
  }
  return dbInstance;
}

/**
 * Cleanly closes the database pool instance (useful for test tear-downs).
 */
export async function closeDb() {
  if (poolInstance) {
    try {
      await poolInstance.end();
    } catch (err: any) {
      logger.error({ error: err.message }, "Error closing database pool");
    }
    poolInstance = null;
    dbInstance = null;
    isConnected = false;
  }
}

/**
 * Returns true if the database connection has been successfully established and verified.
 */
export function isDatabaseConnected(): boolean {
  return isConnected;
}

/**
 * Verifies connection to database with retry and exponential backoff.
 * Prevents stack spam by logging structured objects.
 */
export async function verifyDatabaseConnection(maxRetries = 5, initialDelayMs = 1000): Promise<boolean> {
  if (isConnected) return true;
  if (isConnecting && connectPromise) return connectPromise;

  isConnecting = true;
  connectPromise = (async () => {
    let delay = initialDelayMs;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const db = getDb();
        // Run a simple lightweight test query
        await db.execute(sql`SELECT 1`);
        
        // Auto-migrate missing columns for paper trading tables
        try {
          await db.execute(sql`ALTER TABLE paper_accounts ADD COLUMN IF NOT EXISTS lab_id varchar(50) DEFAULT 'LAB_01_STOCK' NOT NULL;`);
          await db.execute(sql`ALTER TABLE paper_orders ADD COLUMN IF NOT EXISTS lab_id varchar(50) DEFAULT 'LAB_01_STOCK' NOT NULL;`);
          await db.execute(sql`ALTER TABLE paper_positions ADD COLUMN IF NOT EXISTS lab_id varchar(50) DEFAULT 'LAB_01_STOCK' NOT NULL;`);
          await db.execute(sql`ALTER TABLE paper_trades ADD COLUMN IF NOT EXISTS lab_id varchar(50) DEFAULT 'LAB_01_STOCK' NOT NULL;`);
          await db.execute(sql`ALTER TABLE paper_journal ADD COLUMN IF NOT EXISTS lab_id varchar(50) DEFAULT 'LAB_01_STOCK' NOT NULL;`);
        } catch (migErr: any) {
          logger.warn({ error: migErr.message }, "Notice: Migration check for paper_trading lab_id columns encountered issue");
        }

        isConnected = true;
        isConnecting = false;
        connectPromise = null;
        logger.info("Database connection successfully established and verified.");
        return true;
      } catch (error: any) {
        logger.warn({
          attempt,
          maxRetries,
          error: error.message,
          nextRetryInMs: attempt < maxRetries ? delay : 0
        }, "Database connection attempt failed. Retrying...");

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay = Math.min(delay * 2, 10000); // Exponential backoff capped at 10s
        }
      }
    }
    isConnecting = false;
    connectPromise = null;
    logger.error("Database connection could not be established after maximum retries. Operating in DEGRADED mode.");
    return false;
  })();

  return connectPromise;
}

type SeedTask = () => Promise<void>;
const pendingSeedTasks: SeedTask[] = [];
let startupSeedsRun = false;
let isRunningSeeds = false;

/**
 * Registers and safely executes a startup seed/check task behind verified database connection.
 * Guarantees that database failures will not terminate the server, and prevents unhandled rejections during startup.
 */
export function runSafeStartupSeed(task: SeedTask) {
  if (startupSeedsRun) {
    task().catch((error: any) => {
      logger.error({ error: error.message }, "Background startup seed execution failed");
    });
    return;
  }

  pendingSeedTasks.push(task);
  triggerSafeStartupInitialization();
}

async function triggerSafeStartupInitialization() {
  if (isRunningSeeds) return;
  isRunningSeeds = true;

  // Let the event loop run so all startup modules can register their seeding tasks first
  setTimeout(async () => {
    try {
      const dbConnected = await verifyDatabaseConnection(5, 1000);
      if (dbConnected) {
        logger.info({ taskCount: pendingSeedTasks.length }, "Starting safe execution of registered database seed tasks...");
        for (const task of pendingSeedTasks) {
          try {
            await task();
          } catch (error: any) {
            logger.error({ error: error.message }, "A startup seed task failed during safe execution");
          }
        }
        startupSeedsRun = true;
        logger.info("All startup seed tasks completed processing.");
      } else {
        logger.warn("Skipping startup seed tasks because database is unavailable. Graceful degradation active.");
      }
    } catch (err: any) {
      logger.error({ error: err.message }, "Unexpected error in safe startup seed runner");
    } finally {
      pendingSeedTasks.length = 0;
      isRunningSeeds = false;
    }
  }, 100);
}
