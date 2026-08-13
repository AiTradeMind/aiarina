import logger from "../../lib/logger";

export class MetricsService {
  private static instance: MetricsService;
  private metrics: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  public increment(name: string, value: number = 1): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
    logger.debug(`Metric [${name}] incremented to ${current + value}`);
  }

  public set(name: string, value: number): void {
    this.metrics.set(name, value);
    logger.debug(`Metric [${name}] set to ${value}`);
  }

  public get(name: string): number | undefined {
    return this.metrics.get(name);
  }

  public getAll(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
