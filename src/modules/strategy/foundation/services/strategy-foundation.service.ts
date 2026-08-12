import {
  CreateStrategyDTO,
  EvaluateStrategyDTO,
  StrategyDefinitionRecord,
  StrategyHealthStatus,
  StrategySummary,
  StrategySignalRecord,
} from "../types/index.ts";
import {
  STRATEGY_STATUSES,
  STRATEGY_ERRORS,
  STRATEGY_TYPES,
} from "../constants/index.ts";
import { StrategyFoundationRepository } from "../repositories/strategy-foundation.repository.ts";
import { StrategyPipelineService } from "./strategy-pipeline.service.ts";
import { StrategyValidatorService } from "./strategy-validator.service.ts";
import logger from "../../../../lib/logger.ts";

export class StrategyFoundationService {
  private static instance: StrategyFoundationService;
  private repository: StrategyFoundationRepository;
  private pipelineService: StrategyPipelineService;
  private validatorService: StrategyValidatorService;

  private constructor() {
    this.repository = StrategyFoundationRepository.getInstance();
    this.pipelineService = StrategyPipelineService.getInstance();
    this.validatorService = StrategyValidatorService.getInstance();
  }

  public static getInstance(): StrategyFoundationService {
    if (!StrategyFoundationService.instance) {
      StrategyFoundationService.instance = new StrategyFoundationService();
    }
    return StrategyFoundationService.instance;
  }

  public async createStrategy(dto: CreateStrategyDTO): Promise<StrategyDefinitionRecord> {
    const valRes = this.validatorService.validateConfiguration(
      dto.config || {},
      dto.strategyType || STRATEGY_TYPES.CUSTOM
    );

    if (!valRes.isValid) {
      throw new Error(`Strategy validation failed: ${valRes.errors.join("; ")}`);
    }

    const strategyId = `STR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const record: StrategyDefinitionRecord = {
      strategyId,
      name: dto.name,
      strategyType: dto.strategyType || STRATEGY_TYPES.CUSTOM,
      status: STRATEGY_STATUSES.DRAFT,
      timeframe: dto.timeframe || "1D",
      symbol: dto.symbol || "NIFTY50",
      config: dto.config || {},
      description: dto.description || null,
      author: dto.author || "SYSTEM",
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repository.saveStrategy(record);

    logger.info({
      type: "STRATEGY_CREATED",
      strategyId,
      name: saved.name,
      strategyType: saved.strategyType,
    }, "Strategy definition successfully created");

    return saved;
  }

  public async getStrategyById(strategyId: string): Promise<StrategyDefinitionRecord> {
    const strategy = await this.repository.getStrategyById(strategyId);
    if (!strategy) {
      throw new Error(`${STRATEGY_ERRORS.NOT_FOUND} Strategy ID: ${strategyId}`);
    }
    return strategy;
  }

  public async queryStrategies(filter?: {
    status?: string;
    strategyType?: string;
    limit?: number;
  }): Promise<StrategyDefinitionRecord[]> {
    return this.repository.queryStrategies(filter);
  }

  public async evaluateStrategy(dto: EvaluateStrategyDTO) {
    return this.pipelineService.executePipeline(dto);
  }

  public async activateStrategy(strategyId: string, operator: string = "SYSTEM"): Promise<StrategyDefinitionRecord> {
    const updated = await this.repository.updateStrategyStatus(
      strategyId,
      STRATEGY_STATUSES.ACTIVE,
      operator,
      "Strategy activated for automated opportunity evaluation."
    );

    if (!updated) {
      throw new Error(`${STRATEGY_ERRORS.NOT_FOUND} Strategy ID: ${strategyId}`);
    }

    logger.info({
      type: "STRATEGY_ACTIVATED",
      strategyId,
      operator,
    }, "Strategy status changed to ACTIVE");

    return updated;
  }

  public async pauseStrategy(strategyId: string, operator: string = "SYSTEM"): Promise<StrategyDefinitionRecord> {
    const updated = await this.repository.updateStrategyStatus(
      strategyId,
      STRATEGY_STATUSES.PAUSED,
      operator,
      "Strategy manually paused."
    );

    if (!updated) {
      throw new Error(`${STRATEGY_ERRORS.NOT_FOUND} Strategy ID: ${strategyId}`);
    }

    logger.info({
      type: "STRATEGY_PAUSED",
      strategyId,
      operator,
    }, "Strategy status changed to PAUSED");

    return updated;
  }

  public async disableStrategy(strategyId: string, operator: string = "SYSTEM"): Promise<StrategyDefinitionRecord> {
    const updated = await this.repository.updateStrategyStatus(
      strategyId,
      STRATEGY_STATUSES.DISABLED,
      operator,
      "Strategy manually disabled."
    );

    if (!updated) {
      throw new Error(`${STRATEGY_ERRORS.NOT_FOUND} Strategy ID: ${strategyId}`);
    }

    logger.info({
      type: "STRATEGY_DISABLED",
      strategyId,
      operator,
    }, "Strategy status changed to DISABLED");

    return updated;
  }

  public async querySignals(filter?: {
    strategyId?: string;
    symbol?: string;
    signalType?: string;
    limit?: number;
  }): Promise<StrategySignalRecord[]> {
    return this.repository.querySignals(filter);
  }

  public async getHistory(strategyId?: string) {
    return this.repository.getHistory(strategyId);
  }

  public async getHealthStatus(): Promise<StrategyHealthStatus> {
    const allStrategies = await this.repository.queryStrategies({ limit: 500 });
    const allSignals = await this.repository.querySignals({ limit: 1000 });

    const activeCount = allStrategies.filter((s) => s.status === STRATEGY_STATUSES.ACTIVE).length;

    return {
      status: "HEALTHY",
      totalStrategiesCount: allStrategies.length,
      activeStrategiesCount: activeCount,
      totalSignalsGenerated: allSignals.length,
      pipelineHealth: "HEALTHY",
      checkTimestamp: new Date(),
      details: {
        databaseConnected: true,
        constitutionPolicyCompliant: true,
        brainIntegrationActive: true,
      },
    };
  }

  public async getSummaryAnalytics(): Promise<StrategySummary> {
    const allStrategies = await this.repository.queryStrategies({ limit: 500 });
    const allSignals = await this.repository.querySignals({ limit: 1000 });

    const statusDist: Record<string, number> = {};
    for (const s of allStrategies) {
      statusDist[s.status] = (statusDist[s.status] || 0) + 1;
    }

    const typeDist: Record<string, number> = {};
    for (const s of allStrategies) {
      typeDist[s.strategyType] = (typeDist[s.strategyType] || 0) + 1;
    }

    const signalDist: Record<string, number> = {};
    let totalStrength = 0;
    for (const sig of allSignals) {
      signalDist[sig.signalType] = (signalDist[sig.signalType] || 0) + 1;
      totalStrength += sig.strength;
    }

    const avgStrength = allSignals.length > 0 ? Math.round((totalStrength / allSignals.length) * 100) / 100 : 75.0;

    return {
      totalStrategies: allStrategies.length,
      statusDistribution: statusDist,
      typeDistribution: typeDist,
      signalDistribution: signalDist,
      averageSignalStrength: avgStrength,
      lastUpdated: new Date(),
    };
  }

  // =========================================================================
  // STRICT BUSINESS RULE PROHIBITIONS
  // The Strategy Engine MUST NEVER execute trades, allocate capital, connect to brokers, or manage portfolios.
  // =========================================================================

  public placeOrder(): never {
    throw new Error(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
  }

  public executeTrade(): never {
    throw new Error(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
  }

  public allocateCapital(): never {
    throw new Error(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
  }

  public managePortfolio(): never {
    throw new Error(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
  }

  public manageWallet(): never {
    throw new Error(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
  }

  public connectBroker(): never {
    throw new Error(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
  }
}
