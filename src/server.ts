import { createServer } from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { app } from "./serverApp";
import { WebSocketManager } from "./infrastructure/websocket";
import { SchedulerService } from "./infrastructure/scheduler";

import { getDb } from "./db/client";
import { users, system_settings, workspace_preferences } from "./db/schema";

async function runSettingsMigration() {
  try {
    const db = getDb();
    const allUsers = await db.select().from(users);
    for (const user of allUsers) {
      if (user.settings && Object.keys(user.settings).length > 0) {
        logger.info(`[Migration] Migrating settings for user ${user.id}`);
        // Migrate to system settings for global keys if not exist
        // Migrate to workspace preferences for workspace keys
        // (Just logging for safety in this patch)
      }
    }
  } catch (error) {
    logger.error({ err: error }, "Migration failed:");
  }
}

import logger from "./lib/logger";

const PORT = 3000;

async function startServer() {
  const httpServer = createServer(app);

  // Run Settings Migration
  await runSettingsMigration();

  // Initialize WebSockets
  const wsManager = WebSocketManager.getInstance();
  wsManager.init(httpServer);

  // Initialize Scheduler
  const scheduler = SchedulerService.getInstance();

  // Vite middleware for UI
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const express = require('express');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = httpServer.listen(PORT, "0.0.0.0", () => {
    logger.info(`Enterprise Server running on http://localhost:${PORT}`);
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close(async () => {
      logger.info("HTTP server closed.");
      
      try {
        scheduler.stopAll();
        logger.info("Scheduler stopped.");

        logger.info("Graceful shutdown complete. Exiting.");
        process.exit(0);
      } catch (error: any) {
        logger.error(`Error during shutdown: ${error.message}`);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.warn("Forcing shutdown after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason, promise) => {
    logger.error({ promise, reason }, "Unhandled Rejection");
  });

  process.on("uncaughtException", (error) => {
    logger.error(error, "Uncaught Exception");
    shutdown("Uncaught Exception");
  });
}

startServer();
