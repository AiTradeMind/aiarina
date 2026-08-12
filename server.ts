import { app } from "./src/app.ts";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { config, getSafeConfig } from "./src/infrastructure/config/env.ts";
import logger from "./src/lib/logger.ts";
import { recoveryService } from "./src/infrastructure/recovery/recovery.service.ts";
import { AnalyticsLifecycle } from "./src/modules/analytics/index.ts";

async function startServer() {
  const PORT = config.PORT;

  logger.info(getSafeConfig(), "Starting server with configuration");

  // Boot Market Analytics & Statistics Engine
  try {
    await AnalyticsLifecycle.boot();
  } catch (error) {
    logger.error({ type: "ANALYTICS_BOOT_ERROR", error }, "Failed to boot Analytics module on startup");
  }

  // Run system recovery/reconciliation on startup
  try {
    await recoveryService.reconcile();
  } catch (error) {
    logger.error({ type: "RECOVERY_STARTUP_ERROR", error }, "Failed to run recovery service on startup");
  }

  // Vite middleware for development
  logger.info({ NODE_ENV: config.NODE_ENV }, "Checking environment for server start");
  if (config.NODE_ENV !== "production") {
    logger.info("Starting in development mode with Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    logger.info("Starting in production mode serving static files");
    const distPath = path.join(process.cwd(), 'dist');
    logger.info({ distPath }, "Serving static files from");
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info({ type: "SHUTDOWN_INITIATED", signal }, `Received ${signal}, starting graceful shutdown...`);
    
    // Log shutdown to audit trail
    await recoveryService.logShutdown();

    server.close(() => {
      logger.info({ type: "SHUTDOWN_COMPLETE" }, "Server closed. Process exiting.");
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      logger.warn({ type: "SHUTDOWN_TIMEOUT" }, "Could not close connections in time, forceful exit.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer();
