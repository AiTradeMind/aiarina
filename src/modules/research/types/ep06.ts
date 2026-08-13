export type ResearchProjectPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ResearchProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type ResearchProjectCategory = 'EQUITY' | 'ETF' | 'INDEX' | 'FUTURES' | 'OPTIONS' | 'COMMODITIES';

export interface ResearchProject {
  id: string;
  title: string;
  objective: string;
  owner: string;
  priority: ResearchProjectPriority;
  status: ResearchProjectStatus;
  category: ResearchProjectCategory;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ResearchJobType = 'MANUAL' | 'SCHEDULED' | 'RECURRING' | 'REALTIME';
export type ResearchJobStatus = 'PAUSED' | 'COMPLETED' | 'RUNNING' | 'IDLE' | 'FAILED';

export interface ResearchJob {
  id: string;
  projectId: string;
  jobName: string;
  jobType: ResearchJobType;
  status: ResearchJobStatus;
  schedule?: string; // One Time, Daily, Weekly, Monthly, Market Open, Market Close
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchDataset {
  id: string;
  projectId: string;
  datasetName: string;
  version: string;
  source: string;
  sizeBytes: number;
  checksum: string;
  timestamp: Date;
  isValid: boolean;
  createdAt: Date;
}

export type WatchlistType = 'SECTOR' | 'INDEX' | 'STOCK' | 'DERIVATIVE' | 'COMMODITY';

export interface ResearchWatchlist {
  id: string;
  watchlistName: string;
  type: WatchlistType;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchEvidence {
  id: string;
  projectId: string;
  observation: string;
  reference: string;
  confidence: number; // 0 to 100
  correlationId?: string;
  timestamp: Date;
  source: string;
  createdAt: Date;
}

export type NoteAuthorType = 'ANALYST' | 'AI' | 'MANUAL';

export interface ResearchNote {
  id: string;
  projectId: string;
  noteText: string;
  authorType: NoteAuthorType;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ResearchTimelineEvent = 'ResearchStarted' | 'ResearchUpdated' | 'ResearchCompleted' | 'ResearchArchived';

export interface ResearchTimeline {
  id: string;
  projectId: string;
  event: ResearchTimelineEvent;
  description: string;
  timestamp: Date;
}

export type ResearchRuntimeExecutionStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ResearchRuntime {
  id: string;
  jobId: string;
  queueName: string; // DEFAULT, HIGH_PRIORITY
  workerId: string;
  priority: number;
  executionStatus: ResearchRuntimeExecutionStatus;
  retryCount: number;
  logs: string;
  startedAt?: Date;
  finishedAt?: Date;
}

export type ResearchEventType = 
  | 'ResearchStarted' 
  | 'ResearchCompleted' 
  | 'DatasetCreated' 
  | 'DatasetValidated' 
  | 'WatchlistUpdated' 
  | 'ResearchArchived';

export interface ResearchEvent {
  id: string;
  eventType: ResearchEventType;
  payload: any;
  createdAt: Date;
}

export interface MarketScannerResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  type: 'EQUITY' | 'ETF' | 'INDEX' | 'FUTURES' | 'OPTIONS' | 'COMMODITY' | 'COMMODITIES';
  scanType: 'Gainers' | 'Losers' | 'Volume Leaders' | 'Gap Up' | 'Gap Down' | '52W High' | '52W Low';
  sector?: string;
  marketCap?: number;
}

// AI Model Identity & Freedom Rule Definition
export interface AIModelIdentity {
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'DeepSeek' | 'Meta' | 'Mistral' | string;
  officialModelName: string;
  officialModelVersion: string;
  modelIdentifier: string;
  modelFamily: string;
  endpointProvider: string;
  capabilityMetadata: string[];
  displayAlias?: string; // Optional internal label; original provider & model name MUST always remain visible
}

// Dynamic Research Task Contract
export type ResearchTaskStatus = 'QUEUED' | 'ASSIGNED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED';

export interface ResearchTask {
  taskId: string;
  researchId: string;
  taskType: string; // e.g. "INTAKE", "CONTEXT", "REASONING", "HYPOTHESIS", "SCENARIO", "CONTRADICTION", "PROBABILITY", "THESIS"
  context: Record<string, any>;
  requiredCapabilities: string[];
  inputRefs: string[];
  candidateModels: AIModelIdentity[];
  selectedModels: AIModelIdentity[];
  executionStatus: ResearchTaskStatus;
  outputs: Record<string, any>;
  confidenceScore: number;
  validationState: 'PENDING' | 'VERIFIED' | 'CONTRADICTED' | 'INVALIDATED';
  createdAt: Date;
  completedAt?: Date;
}

// 01. Thinking Engine Reasoner Item
export interface ResearchThinkingItem {
  id: string;
  researchId: string;
  stepNumber: number;
  reasoningPhase: 'INTAKE' | 'CONTEXT' | 'HYPOTHESIS' | 'STRESS_TEST' | 'SYNTHESIS';
  statement: string;
  variablesEvaluated: string[];
  assumptions: string[];
  unknowns: string[];
  contributingModels: AIModelIdentity[];
  confidence: number;
  timestamp: Date;
  isDemo?: boolean;
}

// 02. Context Engine Object
export interface ResearchContextObject {
  id: string;
  category: 'MACRO' | 'POLICY' | 'SECTOR' | 'COMPANY' | 'COMMODITY' | 'GLOBAL';
  title: string;
  summary: string;
  evidenceRefs: string[];
  status: 'STABLE' | 'VOLATILE' | 'SHIFTING' | 'NEUTRAL';
  updatedAt: Date;
  isDemo?: boolean;
}

// 03. Hypothesis Engine Object
export interface ResearchHypothesisObject {
  id: string;
  researchId: string;
  caseType: 'BASE' | 'BULL' | 'BEAR' | 'ALTERNATIVE';
  title: string;
  description: string;
  probabilityPercent: number;
  confidencePercent: number;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  createdByModels: AIModelIdentity[];
  isDemo?: boolean;
}

// 04. Scenario Simulator Object
export interface ResearchScenarioObject {
  id: string;
  scenarioName: string;
  category: 'BULL_EXPANSION' | 'BEAR_CONTRACTION' | 'LIQUIDITY_SHOCK' | 'VOLATILITY_SPIKE' | 'RATE_SURPRISE' | 'GEOPOLITICAL';
  affectedAssets: string[];
  transmissionPath: string;
  probabilityPercent: number;
  simulatedAt: Date;
  isDemo?: boolean;
}

// 05. Impact Matrix Object
export interface ResearchImpactObject {
  id: string;
  assetSymbol: string;
  assetName: string;
  assetCategory: 'EQUITY' | 'ETF' | 'INDEX' | 'COMMODITY' | 'CURRENCY' | 'RATES';
  shortTermDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILE';
  shortTermMagnitudePercent: number;
  mediumTermDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILE';
  mediumTermMagnitudePercent: number;
  confidencePercent: number;
  isDemo?: boolean;
}

// 06. Contradiction Flag
export interface ResearchContradictionObject {
  id: string;
  title: string;
  description: string;
  sourceA: string;
  sourceB: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  detectedAt: Date;
  isDemo?: boolean;
}

// 07. Historical Analog Object
export interface ResearchHistoricalAnalogObject {
  id: string;
  eventTitle: string;
  period: string;
  similarityPercent: number;
  matchingFactors: string[];
  divergentFactors: string[];
  historicalOutcome: string;
  isDemo?: boolean;
}

// 08. Probability Assessment
export interface ResearchProbabilityObject {
  id: string;
  targetSubject: string;
  sourceReliabilityScore: number;
  evidenceStrengthScore: number;
  modelConsensusScore: number;
  uncertaintyBandPercent: number;
  finalConfidencePercent: number;
  evaluatedAt: Date;
  isDemo?: boolean;
}

// 09. Institutional Research Thesis
export interface ResearchThesisObject {
  id: string;
  thesisCode: string;
  title: string;
  executiveSummary: string;
  keyArguments: string[];
  primaryRiskFactors: string[];
  invalidationCriteria: string[];
  checksum: string;
  status: 'DRAFT' | 'VERIFIED' | 'BROADCAST_READY' | 'PUBLISHED';
  createdAt: Date;
  isDemo?: boolean;
}

// 10. Knowledge Package (Output to AI Intelligence)
export interface KnowledgePackageObject {
  packageId: string;
  researchId: string;
  thesisCode: string;
  title: string;
  contentPayload: Record<string, any>;
  checksum: string;
  participatingModels: AIModelIdentity[];
  auditStatus: 'AUDITED_AND_VERIFIED';
  publishedAt: Date;
  isDemo?: boolean;
}

