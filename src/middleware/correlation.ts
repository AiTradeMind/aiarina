import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Middleware to inject X-Request-ID and X-Correlation-ID into request and response headers.
 * These IDs enable end-to-end traceability of requests across distributed system components.
 */
export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use existing ID if provided (useful for tracing across services), or generate new one
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();
  const correlationId = (req.headers["x-correlation-id"] as string) || requestId;

  // Store in request object for downstream use (controllers, services, loggers)
  (req as any).requestId = requestId;
  (req as any).correlationId = correlationId;

  // Set in response headers so the client can reference the ID in support requests
  res.setHeader("X-Request-ID", requestId);
  res.setHeader("X-Correlation-ID", correlationId);

  next();
};
