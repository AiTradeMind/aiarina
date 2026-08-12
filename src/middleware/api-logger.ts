import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";

const redactUrl = (url: string) => {
  return url.replace(/([?&](password|token|secret|apiKey)=)[^&]*/ig, '$1[REDACTED]');
};

export const apiLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, ip } = req;
  const url = redactUrl(req.url);
  const userAgent = req.headers["user-agent"] || "unknown";
  
  const requestId = (req as any).requestId;
  const correlationId = (req as any).correlationId;
  const orgId = req.headers["x-organization-id"] || (req as any).user?.organizationId;
  const userId = (req as any).user?.userId;

  logger.info({
    type: "API_REQUEST",
    requestId,
    correlationId,
    orgId,
    userId,
    method,
    url,
    ip,
    userAgent,
  }, `Incoming ${method} ${url}`);

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Some endpoints may set userId later in the request cycle (e.g., auth)
    const finalUserId = (req as any).user?.userId || userId;
    const finalOrgId = (req as any).user?.organizationId || orgId;

    logger.info({
      type: "API_RESPONSE",
      requestId,
      correlationId,
      orgId: finalOrgId,
      userId: finalUserId,
      method,
      url,
      statusCode,
      durationMs: duration,
    }, `Completed ${method} ${url} ${statusCode} in ${duration}ms`);

    if (duration > 500) {
      logger.warn({
        type: "PERFORMANCE_ALERT",
        requestId,
        correlationId,
        orgId: finalOrgId,
        userId: finalUserId,
        method,
        url,
        durationMs: duration,
      }, `Slow API response detected: ${method} ${url} took ${duration}ms`);
    }
  });

  next();
};
