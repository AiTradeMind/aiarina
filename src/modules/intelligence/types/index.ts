export interface IntelligenceSession {
  id: string; // Session ID
  aiModelId: string;
  workspaceId: string;
  correlationId?: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketContext {
  exchangeId: string;
  name: string;
  isOpen: boolean;
  timezone: string;
  status: string;
  message?: string;
}

export interface SectorContext {
  sectorName: string;
  symbolCount: number;
  activeSymbols: string[];
}

export interface InstrumentContext {
  symbol: string;
  name: string;
  type: string;
  lotSize: number;
  tickSize: string;
}

export interface DerivativeContext {
  symbol: string;
  hasFandO: boolean;
  lotSize: number;
  expiryDate?: string;
}

export interface TradingContext {
  calendarDate: string;
  dayType: string;
  sessionType: string;
  isMarketOpen: boolean;
  timeGapSeconds: number;
}

export interface HistoricalContext {
  datasetVersion: string;
  datasetSizeBytes: number;
  evidenceCount: number;
  notesCount: number;
}

export interface IntelligenceContext {
  id: string;
  sessionId: string;
  marketContext: MarketContext;
  sectorContext: SectorContext[];
  instrumentContext: InstrumentContext[];
  derivativeContext: DerivativeContext[];
  tradingContext: TradingContext;
  historicalContext: HistoricalContext;
  createdAt: Date;
}

export interface Observation {
  id: string;
  type: string; // ANOMALY, TREND, VOLATILITY, PATTERN
  description: string;
  strength: number; // 0 to 1
  sourceEvidenceId: string;
}

export interface Relationship {
  sourceId: string;
  targetId: string;
  type: string; // CORRELATION, CAUSAL, LEAD_LAG
  weight: number;
}

export interface Pattern {
  name: string;
  confidence: number;
  timeframe: string;
  direction: 'UP' | 'DOWN' | 'SIDEWAYS';
}

export interface Dependency {
  instrument: string;
  dependsOn: string[];
  vulnerabilityIndex: number;
}

export interface IntelligenceReasoning {
  id: string;
  sessionId: string;
  observations: Observation[];
  relationships: Relationship[];
  patterns: Pattern[];
  dependencies: Dependency[];
  marketBehaviour: string;
  why: string;
  whyNot: string;
  supportingFacts: string[];
  missingFacts: string[];
  evidenceSummary: string;
  createdAt: Date;
}

export interface IntelligenceConfidence {
  id: string;
  sessionId: string;
  confidenceScore: number; // 0 to 100
  evidenceWeight: number; // 0 to 100
  observationScore: number; // 0 to 100
  dataQualityScore: number; // 0 to 100
  reasoningStability: number; // 0 to 100
  createdAt: Date;
}

export interface EvidenceLink {
  observationId: string;
  evidenceId: string;
  connectionStrength: number;
}

export interface IntelligenceHypothesis {
  id: string;
  sessionId: string;
  hypothesis: string;
  alternativeHypothesis: string;
  rejectedHypothesis: string;
  confidence: number;
  evidenceLinks: EvidenceLink[];
  createdAt: Date;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string; // observation, evidence, session, instrument
  properties?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  weight?: number;
}

export interface IntelligenceGraph {
  id: string;
  sessionId: string;
  observationGraph: { nodes: GraphNode[]; edges: GraphEdge[] };
  evidenceGraph: { nodes: GraphNode[]; edges: GraphEdge[] };
  relationshipGraph: { nodes: GraphNode[]; edges: GraphEdge[] };
  dependencyGraph: { nodes: GraphNode[]; edges: GraphEdge[] };
  createdAt: Date;
}

export interface IntelligenceRuntime {
  id: string;
  sessionId: string;
  queueName: 'DEFAULT' | 'HIGH_PRIORITY';
  priority: number;
  executionStatus: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  timeoutMs: number;
  logs: string;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface IntelligenceEvent {
  id: string;
  sessionId: string;
  eventType: 'ReasoningStarted' | 'ReasoningCompleted' | 'HypothesisCreated' | 'ContextBuilt' | 'ConfidenceUpdated' | 'ExplainabilityGenerated';
  payload: Record<string, any>;
  createdAt: Date;
}

export interface IntelligenceAudit {
  id: string;
  sessionId: string;
  auditType: 'Reasoning' | 'Evidence' | 'Confidence' | 'Context' | 'Hypothesis';
  hash: string; // SHA-256 Protected
  content: Record<string, any>;
  createdAt: Date;
}
