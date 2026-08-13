import logger from '../../lib/logger';

export interface QueueTask<T = any> {
  id: string;
  topic: string;
  payload: T;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  lastAttemptAt?: Date;
  error?: string;
}

export interface QueueMetrics {
  mainQueueSize: number;
  retryQueueSize: number;
  dlqSize: number;
  processedCount: number;
  failedCount: number;
}

export class QueueManager {
  private static instance: QueueManager;

  private mainQueue: QueueTask[] = [];
  private retryQueue: QueueTask[] = [];
  private deadLetterQueue: QueueTask[] = [];

  private handlers: Map<string, (payload: any) => Promise<void>> = new Map();
  private isProcessing = false;
  private processedTotal = 0;
  private failedTotal = 0;

  private constructor() {
    this.startWorker();
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  public registerHandler(topic: string, handler: (payload: any) => Promise<void>): void {
    logger.info({ topic }, 'Registering queue topic handler');
    this.handlers.set(topic, handler);
  }

  public enqueue<T>(topic: string, payload: T, maxAttempts: number = 3): string {
    const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const task: QueueTask<T> = {
      id,
      topic,
      payload,
      attempts: 0,
      maxAttempts,
      createdAt: new Date()
    };

    this.mainQueue.push(task);
    logger.debug({ taskId: id, topic }, 'Task enqueued to main queue');
    return id;
  }

  public getMetrics(): QueueMetrics {
    return {
      mainQueueSize: this.mainQueue.length,
      retryQueueSize: this.retryQueue.length,
      dlqSize: this.deadLetterQueue.length,
      processedCount: this.processedTotal,
      failedCount: this.failedTotal
    };
  }

  public getDeadLetterQueue(): QueueTask[] {
    return [...this.deadLetterQueue];
  }

  public clearDLQ(): void {
    this.deadLetterQueue = [];
    logger.info('Dead Letter Queue cleared');
  }

  private startWorker(): void {
    setInterval(async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        await this.processQueue();
      } catch (err: any) {
        logger.error({ error: err.message }, 'Queue processing loop error');
      } finally {
        this.isProcessing = false;
      }
    }, 100);
  }

  private async processQueue(): Promise<void> {
    // 1. Process Main Queue
    if (this.mainQueue.length > 0) {
      const task = this.mainQueue.shift()!;
      await this.executeTask(task);
    }

    // 2. Process Retry Queue (exponential backoff)
    if (this.retryQueue.length > 0) {
      const now = Date.now();
      const readyIdx = this.retryQueue.findIndex(t => {
        const backoffMs = Math.pow(2, t.attempts) * 1000;
        return t.lastAttemptAt && (now - t.lastAttemptAt.getTime() >= backoffMs);
      });

      if (readyIdx !== -1) {
        const [task] = this.retryQueue.splice(readyIdx, 1);
        await this.executeTask(task);
      }
    }
  }

  private async executeTask(task: QueueTask): Promise<void> {
    const handler = this.handlers.get(task.topic);
    if (!handler) {
      logger.warn({ topic: task.topic, taskId: task.id }, 'No queue handler registered for topic. Task moved to DLQ.');
      task.error = 'No handler registered';
      this.deadLetterQueue.push(task);
      this.failedTotal++;
      return;
    }

    task.attempts++;
    task.lastAttemptAt = new Date();

    try {
      await handler(task.payload);
      this.processedTotal++;
      logger.debug({ taskId: task.id, topic: task.topic }, 'Queue task processed successfully');
    } catch (err: any) {
      task.error = err?.message || 'Task execution error';
      logger.warn({ taskId: task.id, topic: task.topic, attempt: task.attempts, error: task.error }, 'Queue task failed');

      if (task.attempts < task.maxAttempts) {
        this.retryQueue.push(task);
      } else {
        logger.error({ taskId: task.id, topic: task.topic, maxAttempts: task.maxAttempts }, 'Queue task exceeded retries. Sent to DLQ.');
        this.deadLetterQueue.push(task);
        this.failedTotal++;
      }
    }
  }
}
