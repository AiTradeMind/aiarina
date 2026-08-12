import cron, { ScheduledTask } from 'node-cron';
import logger from '../../lib/logger';

export class SchedulerService {
  private static instance: SchedulerService;
  private tasks: Map<string, ScheduledTask> = new Map();

  private constructor() {}

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  public schedule(name: string, pattern: string, task: () => void | Promise<void>): void {
    if (this.tasks.has(name)) {
      logger.warn(`Task [${name}] already exists. Stopping and replacing.`);
      this.tasks.get(name)?.stop();
    }

    const scheduledTask = cron.schedule(pattern, async () => {
      try {
        logger.debug(`Running scheduled task: ${name}`);
        await task();
      } catch (error: any) {
        logger.error(`Error in scheduled task [${name}]: ${error.message}`);
      }
    });

    this.tasks.set(name, scheduledTask);
    logger.info(`Task [${name}] scheduled with pattern: ${pattern}`);
  }

  public stop(name: string): void {
    const task = this.tasks.get(name);
    if (task) {
      task.stop();
      this.tasks.delete(name);
      logger.info(`Task [${name}] stopped`);
    }
  }

  public stopAll(): void {
    for (const [name, task] of this.tasks.entries()) {
      task.stop();
      logger.info(`Task [${name}] stopped`);
    }
    this.tasks.clear();
  }
}
