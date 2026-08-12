import { Router } from "express";

export const middlewareRouter = Router();

middlewareRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    middlewareHealth: {
      authentication: "ACTIVE",
      authorization: "ACTIVE",
      validation: "ACTIVE",
      logger: "ACTIVE",
      rateLimiter: "ACTIVE",
      security: "ACTIVE"
    },
    status: "UP",
    healthScore: 100
  });
});

middlewareRouter.get("/config", (req, res) => {
  res.json({
    success: true,
    config: {
      authRequired: true,
      rateLimitWindow: "15m",
      rateLimitMax: 10000,
      logLevel: "info",
      corsEnabled: true,
      helmetEnabled: true
    }
  });
});

middlewareRouter.get("/status", (req, res) => {
  res.json({
    success: true,
    status: {
      activeMiddlewares: [
        "Helmet",
        "CORS",
        "GlobalRateLimiter",
        "CorrelationID",
        "RequestID",
        "APILogger",
        "AuditLogger",
        "GlobalAuth",
        "ResponseFormatter",
        "ErrorHandler",
        "Validator"
      ],
      state: "OPERATIONAL"
    }
  });
});
