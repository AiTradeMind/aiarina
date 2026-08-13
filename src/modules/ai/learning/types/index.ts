export interface LearningRecord {
  id: number;
  organizationId: string | null;
  type: string;
  sourceId: string | null;
  findings: any;
  impactScore: string | null;
  createdAt: string;
}

export interface LearningScore {
  id: number;
  organizationId: string | null;
  targetId: string;
  targetType: 'STRATEGY' | 'MODEL';
  learningScore: string;
  confidenceAdjustment: string;
  ranking: number | null;
  metadata: any;
  updatedAt: string;
}

export interface TrainRequest {
  targetId: string;
  targetType: 'STRATEGY' | 'MODEL';
  source?: string; // MEMORY, ANALYTICS, etc.
}

export interface LearningSummary {
  learningScore: number;
  modelRankings: LearningScore[];
  strategyRankings: LearningScore[];
}
