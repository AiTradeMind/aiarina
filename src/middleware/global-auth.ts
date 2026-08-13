import { Request, Response, NextFunction } from "express";
import { authenticateToken } from "./auth";

const publicPaths = [
  "/api/login",
  "/api/health",
  "/health",
  "/ready",
  "/live",
  "/api/system/middleware/health",
  "/api/system/middleware/config",
  "/api/system/middleware/status",
  // add any other public paths here
];

export const globalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (publicPaths.some(p => req.path === p || req.path.startsWith(p + '/'))) {
    return next();
  }
  
  // Use existing authenticateToken
  authenticateToken(req, res, next);
};
