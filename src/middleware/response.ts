import { Request, Response, NextFunction } from "express";

export const responseFormatter = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (body) {
    if (body && typeof body === 'object') {
      if (!body.status && !body.error) {
         // It's a success response if no explicit status or error is set
         const newBody = {
           status: "success",
           data: body.data !== undefined ? body.data : body,
           timestamp: new Date().toISOString(),
           correlationId: (req as any).correlationId,
           requestId: (req as any).requestId
         };
         return originalJson.call(this, newBody);
      } else {
        // Just inject correlationId, requestId and timestamp if missing
        if (!body.correlationId) body.correlationId = (req as any).correlationId;
        if (!body.requestId) body.requestId = (req as any).requestId;
        if (!body.timestamp) body.timestamp = new Date().toISOString();
      }
    }
    return originalJson.call(this, body);
  };
  
  next();
};
