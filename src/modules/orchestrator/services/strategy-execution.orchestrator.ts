import { StrategyRuntimeEngine } from '../../strategy/runtime/strategy-runtime.engine';
import { AIDecisionEngine } from '../../ai/decision/ai-decision.engine';
import { AICommitteeEngine, VotingMethod } from '../../committee/services/ai-committee.engine';
import { PaperTradingPipelineService } from '../../paperTrading/services/paper-trading-pipeline.service';
import { TracingManager } from '../../../infrastructure/tracing/tracing.manager';
import logger from '../../../lib/logger';

export interface ExecutionOrchestratorMetrics {
  totalEvaluations: number;
  successfulEvaluations: number;
  failedEvaluations: number;
  averageLatencyMs: number;
  lastExecutionTime?: Date;
}

export class StrategyExecutionOrchestrator {
  private static instance: StrategyExecutionOrchestrator;

  private totalEvaluations = 0;
  private successfulEvaluations = 0;
  private failedEvaluations = 0;
  private totalLatencyMs = 0;
  private lastExecutionTime?: Date;

  private constructor() {}

  public static getInstance(): StrategyExecutionOrchestrator {
    if (!StrategyExecutionOrchestrator.instance) {
      StrategyExecutionOrchestrator.instance = new StrategyExecutionOrchestrator();
    }
    return StrategyExecutionOrchestrator.instance;
  }

  public async runActiveStrategiesPipeline(): Promise<void> {
    const tracing = TracingManager.getInstance();
    const span = tracing.createChildSpan('StrategyExecutionOrchestrator.runActiveStrategiesPipeline');

    const runtimeEngine = StrategyRuntimeEngine.getInstance();
    const activeStrategies = runtimeEngine.getActiveStrategies();

    logger.info({ count: activeStrategies.length }, 'Orchestration cycle started for active strategies');

    // Sort by priority (1 = Highest Priority)
    activeStrategies.sort((a, b) => a.metadata.priority - b.metadata.priority);

    for (const strategy of activeStrategies) {
      const start = Date.now();
      this.totalEvaluations++;

      try {
        await this.executeSingleStrategyPipeline(strategy);
        this.successfulEvaluations++;
      } catch (err: any) {
        this.failedEvaluations++;
        logger.error({ strategyId: strategy.metadata.id, error: err.message }, 'Strategy pipeline execution isolated failure');
      } finally {
        const duration = Date.now() - start;
        this.totalLatencyMs += duration;
        this.lastExecutionTime = new Date();
      }
    }

    span.finish();
  }

  public async executeSingleStrategyPipeline(strategy: any): Promise<void> {
    const symbol = strategy.metadata.targetSymbols[0] || 'BTC-USD';
    const decisionEngine = AIDecisionEngine.getInstance();
    const committeeEngine = AICommitteeEngine.getInstance();
    const paperPipeline = PaperTradingPipelineService.getInstance();

    // 1. Generate Primary Decision via AI Decision Engine
    const decision = await decisionEngine.evaluateDecision({
      strategyId: strategy.metadata.id,
      symbol,
      timeframe: strategy.metadata.timeframe
    });

    // 2. Evaluate via Committee Engine (Multi-model voting simulation)
    const committeeResult = committeeEngine.evaluateCommittee([
      { modelId: 'anthropic/claude-3.5-sonnet', weight: 1.2, decision },
      { modelId: 'openai/gpt-4o', weight: 1.0, decision },
      { modelId: 'google/gemini-1.5-pro', weight: 1.0, decision }
    ], VotingMethod.MAJORITY);

    // 3. Dispatch to Paper Trading Pipeline
    if (committeeResult.finalSignal === 'BUY' || committeeResult.finalSignal === 'SELL') {
      await paperPipeline.processDecisionSignal(
        committeeResult,
        symbol,
        decision.suggestedQuantity,
        decision.suggestedPrice
      );
    }
  }

  public getMetrics(): ExecutionOrchestratorMetrics {
    return {
      totalEvaluations: this.totalEvaluations,
      successfulEvaluations: this.successfulEvaluations,
      failedEvaluations: this.failedEvaluations,
      averageLatencyMs: this.totalEvaluations > 0 ? Math.round(this.totalLatencyMs / this.totalEvaluations) : 0,
      lastExecutionTime: this.lastExecutionTime
    };
  }
}
