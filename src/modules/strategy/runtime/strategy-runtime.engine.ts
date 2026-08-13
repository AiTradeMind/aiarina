import EventEmitter from 'events';
import logger from '../../../lib/logger';
import { QueueManager } from '../../../infrastructure/queue/queue.manager';

export enum StrategyLifecycleState {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DISABLED = 'DISABLED',
  ARCHIVED = 'ARCHIVED'
}

export interface StrategyMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  targetSymbols: string[];
  timeframe: string; // '1m', '5m', '1h', '1d'
  priority: number;  // 1 = High, 10 = Low
  dependencies: string[]; // Dependencies on other strategies or indicators
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyDefinition {
  metadata: StrategyMetadata;
  state: StrategyLifecycleState;
  hotEnabled: boolean;
  evaluate: (context: any) => Promise<any>;
}

export class StrategyRuntimeEngine extends EventEmitter {
  private static instance: StrategyRuntimeEngine;
  private strategyRegistry: Map<string, StrategyDefinition> = new Map();
  private schedulerIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): StrategyRuntimeEngine {
    if (!StrategyRuntimeEngine.instance) {
      StrategyRuntimeEngine.instance = new StrategyRuntimeEngine();
    }
    return StrategyRuntimeEngine.instance;
  }

  public registerStrategy(definition: StrategyDefinition): void {
    const { id, name, version } = definition.metadata;
    this.validateStrategy(definition);

    this.strategyRegistry.set(id, definition);
    logger.info({ strategyId: id, name, version }, 'Strategy registered in Runtime Engine');

    if (definition.state === StrategyLifecycleState.ACTIVE && definition.hotEnabled) {
      this.startStrategyScheduler(id);
    }
  }

  public validateStrategy(definition: StrategyDefinition): boolean {
    if (!definition.metadata?.id || !definition.metadata?.name) {
      throw new Error('Strategy validation failed: Missing required metadata (id, name)');
    }
    if (typeof definition.evaluate !== 'function') {
      throw new Error(`Strategy '${definition.metadata.id}' validation failed: evaluate function is required`);
    }
    return true;
  }

  public getStrategy(id: string): StrategyDefinition | undefined {
    return this.strategyRegistry.get(id);
  }

  public getAllStrategies(): StrategyDefinition[] {
    return Array.from(this.strategyRegistry.values());
  }

  public getActiveStrategies(): StrategyDefinition[] {
    return this.getAllStrategies().filter(
      s => s.state === StrategyLifecycleState.ACTIVE && s.hotEnabled
    );
  }

  public setStrategyState(id: string, state: StrategyLifecycleState): void {
    const strategy = this.strategyRegistry.get(id);
    if (!strategy) {
      throw new Error(`Strategy not found: ${id}`);
    }

    const prevState = strategy.state;
    strategy.state = state;
    strategy.metadata.updatedAt = new Date();

    logger.info({ strategyId: id, prevState, newState: state }, 'Strategy lifecycle state updated');

    if (state === StrategyLifecycleState.ACTIVE && strategy.hotEnabled) {
      this.startStrategyScheduler(id);
    } else {
      this.stopStrategyScheduler(id);
    }

    this.emit('strategy_state_changed', { id, prevState, newState: state });
  }

  public toggleHotEnable(id: string, enabled: boolean): void {
    const strategy = this.strategyRegistry.get(id);
    if (!strategy) {
      throw new Error(`Strategy not found: ${id}`);
    }

    strategy.hotEnabled = enabled;
    logger.info({ strategyId: id, hotEnabled: enabled }, 'Strategy hot enable toggled');

    if (enabled && strategy.state === StrategyLifecycleState.ACTIVE) {
      this.startStrategyScheduler(id);
    } else {
      this.stopStrategyScheduler(id);
    }
  }

  private startStrategyScheduler(id: string): void {
    this.stopStrategyScheduler(id);

    const strategy = this.strategyRegistry.get(id);
    if (!strategy) return;

    const intervalMs = this.timeframeToMs(strategy.metadata.timeframe);

    const timer = setInterval(() => {
      QueueManager.getInstance().enqueue('STRATEGY_EVALUATION', { strategyId: id, timestamp: Date.now() });
    }, intervalMs);

    this.schedulerIntervals.set(id, timer);
    logger.debug({ strategyId: id, intervalMs }, 'Strategy scheduler started');
  }

  private stopStrategyScheduler(id: string): void {
    const timer = this.schedulerIntervals.get(id);
    if (timer) {
      clearInterval(timer);
      this.schedulerIntervals.delete(id);
      logger.debug({ strategyId: id }, 'Strategy scheduler stopped');
    }
  }

  private timeframeToMs(tf: string): number {
    switch (tf) {
      case '1m': return 60000;
      case '5m': return 300000;
      case '15m': return 900000;
      case '1h': return 3600000;
      case '1d': return 86400000;
      default: return 60000; // Default 1 minute
    }
  }
}
