export type ScoreType = 'PERFORMANCE' | 'LEARNING' | 'OPTIMIZATION' | 'CONSISTENCY' | 'RISK' | 'RELIABILITY' | 'CONFIDENCE' | 'EXECUTION';
export type EntityType = 'AI_MODEL' | 'STRATEGY' | 'PORTFOLIO' | 'ORGANIZATION';

export interface EvaluationResult {
  id: string;
  entityId: string;
  entityType: EntityType;
  overallScore: number;
  scores: Record<ScoreType, number>;
  createdAt: Date;
}
