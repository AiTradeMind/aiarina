import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";

export const auditMiddleware = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logger.info({
          type: "AUDIT_LOG",
          action,
          userId: (req as any).user?.userId,
          orgId: (req as any).user?.organizationId,
          requestId: (req as any).requestId,
          correlationId: (req as any).correlationId,
          ip: req.ip,
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          timestamp: new Date().toISOString()
        }, `Audit action: ${action}`);
      }
      return originalSend.call(this, body);
    };
    next();
  };
};
