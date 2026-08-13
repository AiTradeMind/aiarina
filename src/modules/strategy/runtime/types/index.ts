export type RuntimeState = 'QUEUED' | 'PREPARING' | 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type RuntimePriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type RuntimeHealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'DEGRADED';

export interface StrategyRuntimeSession {
  sessionId: string;
  strategyId: string;
  strategyName: string;
  candidateId: string;
  aiModelId: string;
  market: string;
  asset: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  runtimeState: RuntimeState;
  queuePosition: number;
  priority: RuntimePriority;
  latencyMs: number;
  health: RuntimeHealthStatus;
  healthScore: number;
  confidence: number;
  executionReadinessScore: number;
  riskScore: number;
  createdTime: string;
  startTime: string;
  updatedTime: string;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  queueDelayMs: number;
  validationChecks: Array<{
    id: string;
    ruleName: string;
    passed: boolean;
    message: string;
  }>;
  strategySnapshot: Record<string, any>;
  parametersSnapshot: Record<string, any>;
  rankingSnapshot: Record<string, any>;
  candidateSnapshot: Record<string, any>;
  metrics: {
    queueTimeMs: number;
    runtimeDurationSec: number;
    validationSuccessRate: number;
    heartbeatCount: number;
  };
  logs: Array<{
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
    message: string;
  }>;
  sha256Reference: string;
  history: Array<{
    id: string;
    action: string;
    operator: string;
    timestamp: string;
    details: string;
  }>;
}

export interface RuntimeOverview {
  sessions: StrategyRuntimeSession[];
  statistics: {
    activeSessionsCount: number;
    queuedCount: number;
    runningCount: number;
    pausedCount: number;
    completedCount: number;
    rejectedOrFailedCount: number;
    averageRuntimeHealth: number;
    averageConfidence: number;
    averageLatencyMs: number;
    averageRisk: number;
    averageExecutionReadiness: number;
  };
}

export const EMPTY_RUNTIME_OVERVIEW: RuntimeOverview = {
  sessions: [],
  statistics: {
    activeSessionsCount: 0,
    queuedCount: 0,
    runningCount: 0,
    pausedCount: 0,
    completedCount: 0,
    rejectedOrFailedCount: 0,
    averageRuntimeHealth: 0,
    averageConfidence: 0,
    averageLatencyMs: 0,
    averageRisk: 0,
    averageExecutionReadiness: 0
  }
};
