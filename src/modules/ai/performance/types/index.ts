export interface AiTestSuite {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiTestCase {
  id: string;
  suiteId: string;
  name: string;
  type: string;
  parameters: any;
  expectedOutcome: any;
  createdAt: Date;
}

export interface AiBenchmarkRun {
  id: string;
  suiteId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  modelsTested: string[];
  status: string;
  failures: number;
  warnings: number;
  createdAt: Date;
}

export interface AiEvaluation {
  id: string;
  runId: string;
  modelId: string;
  testCaseId: string;
  score: number;
  passed: boolean;
  latency: number | null;
  tokenUsage: number | null;
  cost: number | null;
  details: any;
  timestamp: Date;
}

export interface AiMetrics {
  id: string;
  modelId: string;
  evaluationType: string;
  accuracy: number;
  precision: number;
  recall: number;
  confidence: number;
  latency: number;
  cost: number;
  tokenUsage: number;
  reliability: number;
  consistency: number;
  hallucinationRate: number;
  reasoningQuality: number;
  researchQuality: number;
  riskAwareness: number;
  timestamp: Date;
}

export interface AiPerformanceReport {
  id: string;
  modelId: string;
  runId: string | null;
  overallScore: number;
  categoryScores: Record<string, number>;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  createdAt: Date;
}
