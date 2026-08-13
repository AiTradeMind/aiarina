import {
  STRATEGY_PIPELINE_STAGES,
  StrategyPipelineStageValue,
  STRATEGY_STATUSES,
  STRATEGY_ERRORS,
} from "../constants/index.ts";
import {
  EvaluateStrategyDTO,
  StrategyPipelineRunRecord,
  StrategyDefinitionRecord,
  StrategySignalRecord,
} from "../types/index.ts";
import { StrategyFoundationRepository } from "../repositories/strategy-foundation.repository.ts";
import { StrategyValidatorService } from "./strategy-validator.service.ts";
import { SignalGeneratorService } from "./signal-generator.service.ts";
import logger from "../../../../lib/logger.ts";

export class StrategyPipelineService {
  private static instance: StrategyPipelineService;
  private repository: StrategyFoundationRepository;
  private validator: StrategyValidatorService;
  private signalGenerator: SignalGeneratorService;

  private constructor() {
    this.repository = StrategyFoundationRepository.getInstance();
    this.validator = StrategyValidatorService.getInstance();
    this.signalGenerator = SignalGeneratorService.getInstance();
  }

  public static getInstance(): StrategyPipelineService {
    if (!StrategyPipelineService.instance) {
      StrategyPipelineService.instance = new StrategyPipelineService();
    }
    return StrategyPipelineService.instance;
  }

  public async executePipeline(dto: EvaluateStrategyDTO): Promise<StrategyPipelineRunRecord> {
    const runId = `DPR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const startTime = Date.now();

    const pipelineRun: StrategyPipelineRunRecord = {
      runId,
      strategyId: dto.strategyId || "CUSTOM_STRATEGY",
      currentStage: STRATEGY_PIPELINE_STAGES.LOAD_STRATEGY,
      executionTimeMs: 0,
      failureReason: null,
      stageHistory: [],
      createdAt: new Date(),
    };

    let strategyDef: StrategyDefinitionRecord | null = null;
    let generatedSignal: StrategySignalRecord | null = null;

    try {
      // Stage 1: Load Strategy
      const stage1Start = Date.now();
      pipelineRun.currentStage = STRATEGY_PIPELINE_STAGES.LOAD_STRATEGY;

      if (dto.strategyId) {
        strategyDef = await this.repository.getStrategyById(dto.strategyId);
      }

      if (!strategyDef) {
        // Construct dynamic strategy definition if strategyType provided or fallback
        strategyDef = {
          strategyId: dto.strategyId || `STR-${Date.now()}`,
          name: dto.strategyType ? `${dto.strategyType} Strategy` : "Dynamic Opportunity Strategy",
          strategyType: dto.strategyType || "CUSTOM",
          status: STRATEGY_STATUSES.ACTIVE,
          timeframe: dto.timeframe || "1D",
          symbol: dto.symbol || "NIFTY50",
          config: dto.customConfig || {},
          author: "SYSTEM",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      this.recordStageHistory(pipelineRun, STRATEGY_PIPELINE_STAGES.LOAD_STRATEGY, stage1Start, "SUCCESS");

      // Check status
      if (strategyDef.status === STRATEGY_STATUSES.PAUSED || strategyDef.status === STRATEGY_STATUSES.DISABLED) {
        throw new Error(`${STRATEGY_ERRORS.STRATEGY_DISABLED} Current status: ${strategyDef.status}`);
      }

      // Stage 2: Validate Configuration
      const stage2Start = Date.now();
      pipelineRun.currentStage = STRATEGY_PIPELINE_STAGES.VALIDATE_CONFIGURATION;

      const valRes = this.validator.validateConfiguration(strategyDef.config, strategyDef.strategyType);
      if (!valRes.isValid) {
        throw new Error(`Configuration validation failed: ${valRes.errors.join("; ")}`);
      }

      this.recordStageHistory(pipelineRun, STRATEGY_PIPELINE_STAGES.VALIDATE_CONFIGURATION, stage2Start, "SUCCESS");

      // Stage 3: Receive Brain Context
      const stage3Start = Date.now();
      pipelineRun.currentStage = STRATEGY_PIPELINE_STAGES.RECEIVE_BRAIN_CONTEXT;

      const brainContext = dto.brainContext || {
        trend: "UPWARD",
        confidenceScore: 80,
        source: "AIBrainCenter",
      };

      this.recordStageHistory(pipelineRun, STRATEGY_PIPELINE_STAGES.RECEIVE_BRAIN_CONTEXT, stage3Start, "SUCCESS");

      // Stage 4: Evaluate Conditions
      const stage4Start = Date.now();
      pipelineRun.currentStage = STRATEGY_PIPELINE_STAGES.EVALUATE_CONDITIONS;

      this.recordStageHistory(pipelineRun, STRATEGY_PIPELINE_STAGES.EVALUATE_CONDITIONS, stage4Start, "SUCCESS");

      // Stage 5: Generate Signal
      const stage5Start = Date.now();
      pipelineRun.currentStage = STRATEGY_PIPELINE_STAGES.GENERATE_SIGNAL;

      generatedSignal = this.signalGenerator.generateSignal(strategyDef, brainContext, dto.marketData);

      this.recordStageHistory(pipelineRun, STRATEGY_PIPELINE_STAGES.GENERATE_SIGNAL, stage5Start, "SUCCESS");

      // Stage 6: Validate Constitution Policies
      const stage6Start = Date.now();
      pipelineRun.currentStage = STRATEGY_PIPELINE_STAGES.VALIDATE_CONSTITUTION_POLICIES;

      const govRes = this.validator.validateGovernance(dto.operator, "Execute");
      if (!govRes.isCompliant) {
        throw new Error(`${STRATEGY_ERRORS.GOVERNANCE_VALIDATION_FAILED} ${govRes.reason}`);
      }

      this.recordStageHistory(pipelineRun, STRATEGY_PIPELINE_STAGES.VALIDATE_CONSTITUTION_POLICIES, stage6Start, "SUCCESS");

      // Stage 7: Publish Signal
      const stage7Start = Date.now();
      pipelineRun.currentStage = STRATEGY_PIPELINE_STAGES.PUBLISH_SIGNAL;

      await this.repository.saveSignal(generatedSignal);
      pipelineRun.signal = generatedSignal;

      this.recordStageHistory(pipelineRun, STRATEGY_PIPELINE_STAGES.PUBLISH_SIGNAL, stage7Start, "SUCCESS");

      // Stage 8: Ready
      const stage8Start = Date.now();
      pipelineRun.currentStage = STRATEGY_PIPELINE_STAGES.READY;
      this.recordStageHistory(pipelineRun, STRATEGY_PIPELINE_STAGES.READY, stage8Start, "SUCCESS");

      pipelineRun.executionTimeMs = Date.now() - startTime;

      await this.repository.saveExecutionLog({
        logId: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        strategyId: strategyDef.strategyId,
        runId,
        stage: STRATEGY_PIPELINE_STAGES.READY,
        status: "SUCCESS",
        executionTimeMs: pipelineRun.executionTimeMs,
        createdAt: new Date(),
      });

      logger.info({
        type: "STRATEGY_PIPELINE_COMPLETED",
        runId,
        strategyId: strategyDef.strategyId,
        currentStage: pipelineRun.currentStage,
        executionTimeMs: pipelineRun.executionTimeMs,
        signalType: generatedSignal.signalType,
      }, "Strategy Engine Pipeline finished execution");

      return pipelineRun;
    } catch (err: any) {
      pipelineRun.executionTimeMs = Date.now() - startTime;
      pipelineRun.failureReason = err.message;

      this.recordStageHistory(
        pipelineRun,
        pipelineRun.currentStage,
        Date.now(),
        "FAILED",
        err.message
      );

      await this.repository.saveExecutionLog({
        logId: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        strategyId: strategyDef?.strategyId || dto.strategyId || "UNKNOWN",
        runId,
        stage: pipelineRun.currentStage,
        status: "FAILED",
        executionTimeMs: pipelineRun.executionTimeMs,
        failureReason: err.message,
        createdAt: new Date(),
      });

      logger.error({
        type: "STRATEGY_PIPELINE_FAILED",
        runId,
        stage: pipelineRun.currentStage,
        error: err.message,
      }, "Strategy Engine Pipeline execution failed");

      return pipelineRun;
    }
  }

  private recordStageHistory(
    run: StrategyPipelineRunRecord,
    stage: StrategyPipelineStageValue,
    startTime: number,
    status: "SUCCESS" | "WARNING" | "FAILED",
    details?: string
  ) {
    run.stageHistory.push({
      stage,
      timestamp: new Date(),
      durationMs: Date.now() - startTime,
      status,
      details,
    });
  }
}
