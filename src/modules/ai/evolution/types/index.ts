export interface AiMemoryProfile {
  id: string;
  modelId: string;
  knowledgeScore: number;
  learningScore: number;
  experienceScore: number;
  reasoningScore: number;
  patternScore: number;
  confidenceTrend: number;
  growthIndex: number;
  learningVelocity: number;
  memoryHealth: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiLearningSession {
  id: string;
  modelId: string;
  sessionType: string;
  durationMs: number;
  eventsProcessed: number;
  insightsGenerated: number;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
}

export interface AiLearningEvent {
  id: string;
  modelId: string;
  sessionId: string | null;
  eventType: string;
  category: string;
  description: string;
  impactScore: number;
  timestamp: Date;
}

export interface AiPattern {
  id: string;
  modelId: string;
  patternType: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

export interface AiMemorySnapshot {
  id: string;
  modelId: string;
  versionId: string;
  metrics: any;
  timestamp: Date;
}

export interface AiMemoryVersion {
  id: string;
  modelId: string;
  previousVersion: string | null;
  currentVersion: string;
  reason: string;
  timestamp: Date;
}

export interface AiExperienceHistory {
  id: string;
  modelId: string;
  experiencePoints: number;
  growthDelta: number;
  adaptationScore: number;
  improvementTrend: number;
  timestamp: Date;
}

export interface AiSkillProgress {
  id: string;
  modelId: string;
  skillName: string;
  level: number;
  progress: number;
  updatedAt: Date;
}
