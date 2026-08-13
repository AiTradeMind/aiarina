import {
  StrategyTypeValue,
  SignalTypeValue,
  StrategyStatusValue,
  StrategyPipelineStageValue,
} from "../constants/index.ts";

export interface StrategyDefinitionRecord {
  id?: number;
  strategyId: string;
  name: string;
  strategyType: StrategyTypeValue;
  status: StrategyStatusValue;
  timeframe: string;
  symbol?: string | null;
  config: Record<string, any>;
  description?: string | null;
  author: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategySignalRecord {
  id?: number;
  signalId: string;
  strategyId: string;
  symbol: string;
  timeframe: string;
  signalType: SignalTypeValue;
  confidence: string;
  strength: number;
  priority: string;
  supportingContext: Record<string, any>;
  reasoningSummary: string;
  lifecycleStatus: string;
  metadata?: Record<string, any>;
  generatedAt: Date;
  createdAt: Date;
}

export interface CreateStrategyDTO {
  name: string;
  strategyType: StrategyTypeValue;
  timeframe?: string;
  symbol?: string;
  config?: Record<string, any>;
  description?: string;
  author?: string;
}

export interface EvaluateStrategyDTO {
  strategyId?: string;
  strategyType?: StrategyTypeValue;
  symbol?: string;
  timeframe?: string;
  brainContext?: Record<string, any>;
  decisionRecord?: Record<string, any>;
  marketData?: Record<string, any>;
  customConfig?: Record<string, any>;
  operator?: string;
}

export interface StrategyHistoryRecord {
  id?: number;
  historyId: string;
  strategyId: string;
  fromStatus?: string | null;
  toStatus: string;
  changedBy: string;
  reason?: string | null;
  createdAt: Date;
}

export interface StrategyExecutionLogRecord {
  id?: number;
  logId: string;
  strategyId: string;
  runId: string;
  stage: string;
  status: string;
  executionTimeMs: number;
  failureReason?: string | null;
  details?: Record<string, any>;
  createdAt: Date;
}

export interface StrategyPipelineRunRecord {
  runId: string;
  strategyId: string;
  currentStage: StrategyPipelineStageValue;
  executionTimeMs: number;
  failureReason?: string | null;
  stageHistory: Array<{
    stage: StrategyPipelineStageValue;
    timestamp: Date;
    durationMs: number;
    status: "SUCCESS" | "WARNING" | "FAILED";
    details?: string;
  }>;
  signal?: StrategySignalRecord | null;
  createdAt: Date;
}

export interface StrategyHealthStatus {
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  totalStrategiesCount: number;
  activeStrategiesCount: number;
  totalSignalsGenerated: number;
  pipelineHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  checkTimestamp: Date;
  details: {
    databaseConnected: boolean;
    constitutionPolicyCompliant: boolean;
    brainIntegrationActive: boolean;
  };
}

export interface StrategySummary {
  totalStrategies: number;
  statusDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  signalDistribution: Record<string, number>;
  averageSignalStrength: number;
  lastUpdated: Date;
}
