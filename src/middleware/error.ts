import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';
import { config } from '../infrastructure/config/env.ts';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public statusCode: number, public message: string, public isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

const redactSensitiveData = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const sensitiveFields = ['password', 'apiKey', 'token', 'secret', 'passwordHash'];
  const redacted = { ...data };
  for (const field of sensitiveFields) {
    if (field in redacted) redacted[field] = '[REDACTED]';
  }
  return redacted;
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors;

  // Handle specific database errors
  if (err.code === '23505') {
    // Unique constraint violation (Postgres)
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.name === 'ZodError' || err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors;
  }

  const requestId = (req as any).requestId;
  const correlationId = (req as any).correlationId;

  logger.error({
    msg: message,
    requestId,
    correlationId,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: redactSensitiveData(req.body),
    userId: (req as any).user?.userId,
  });

  // Standard response format
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 && config.NODE_ENV === 'production' ? 'Internal Server Error' : message,
    errors,
    requestId,
    correlationId,
    timestamp: new Date().toISOString(),
    ...(config.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
