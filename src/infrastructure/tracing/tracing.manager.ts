import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import logger from '../../lib/logger';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startTime: number;
}

export class TracingManager {
  private static instance: TracingManager;
  private asyncLocalStorage = new AsyncLocalStorage<TraceContext>();

  private constructor() {}

  public static getInstance(): TracingManager {
    if (!TracingManager.instance) {
      TracingManager.instance = new TracingManager();
    }
    return TracingManager.instance;
  }

  public getTraceMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const traceId = (req.headers['x-trace-id'] as string) || `trace_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const parentSpanId = (req.headers['x-span-id'] as string) || undefined;
      const spanId = `span_${Math.random().toString(36).substring(2, 7)}`;

      const context: TraceContext = {
        traceId,
        spanId,
        parentSpanId,
        startTime: Date.now()
      };

      res.setHeader('X-Trace-ID', traceId);
      res.setHeader('X-Span-ID', spanId);

      this.asyncLocalStorage.run(context, () => {
        next();
      });
    };
  }

  public getCurrentTrace(): TraceContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  public createChildSpan(name: string): { spanId: string; finish: () => void } {
    const parent = this.getCurrentTrace();
    const spanId = `span_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();

    logger.debug({ name, spanId, parentSpanId: parent?.spanId, traceId: parent?.traceId }, 'Child span started');

    return {
      spanId,
      finish: () => {
        const durationMs = Date.now() - startTime;
        logger.debug({ name, spanId, durationMs, traceId: parent?.traceId }, 'Child span completed');
      }
    };
  }
}
