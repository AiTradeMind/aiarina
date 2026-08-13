export interface StrategyOptimization {
  id: string;
  strategyId: string;
  versionId: string;
  status: string;
  score: number | null;
  createdTime: Date;
}

export interface StrategyOptimizationRun {
  id: string;
  optimizationId: string;
  runType: string;
  startTime: Date;
  endTime: Date | null;
  result: any | null;
}

export interface StrategyOptimizationRule {
  id: string;
  name: string;
  minimumWinRate: number | null;
  maximumDrawdown: number | null;
  targetSharpe: number | null;
  targetProfitFactor: number | null;
  maximumRisk: number | null;
  minimumConfidence: number | null;
  createdTime: Date;
}

export interface StrategyRecommendation {
  id: string;
  optimizationId: string;
  type: string;
  description: string;
  suggestedChanges: any;
  confidenceScore: number | null;
  expectedBenefit: string | null;
  expectedRisk: string | null;
  notes: string | null;
  createdTime: Date;
}

export interface StrategyParameterAnalysis {
  id: string;
  optimizationId: string;
  blockId: string;
  parameterKey: string;
  currentValue: string | null;
  optimalValue: string | null;
  impactScore: number | null;
  createdTime: Date;
}

export interface StrategyOptimizationHistory {
  id: string;
  strategyId: string;
  optimizationId: string;
  userId: string | null;
  notes: string | null;
  timestamp: Date;
}
