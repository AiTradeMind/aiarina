export type AssetClass = 
  | 'EQUITY' 
  | 'ETF' 
  | 'INDEX' 
  | 'FUTURES' 
  | 'OPTIONS' 
  | 'COMMODITY' 
  | 'CURRENCY' 
  | 'INTEREST_RATE';

export type ImpactDirection = 
  | 'BULLISH' 
  | 'BEARISH' 
  | 'NEUTRAL' 
  | 'MODERATE_POSITIVE' 
  | 'MODERATE_BEARISH';

export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'PENDING';

export interface ImpactMatrixRecord {
  id: string;
  assetVector: string;
  assetClass: AssetClass;
  category: string;
  shortTermImpact: string;
  mediumTermImpact: string;
  impactDirection: ImpactDirection;
  impactMagnitude: number; // 0.0 to 10.0
  confidence: number; // 0.0 to 100.0
  evidenceCount: number;
  sourceCount: number;
  timestamp: string;
  researchPackageId: string;
  verificationStatus: VerificationStatus;
  metadata?: {
    exchangeId?: string;
    commodityContext?: string;
    currencyContext?: string;
    interestRateContext?: string;
    macroEventId?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export type CorrelationType = 
  | 'POSITIVE' 
  | 'NEGATIVE' 
  | 'NEUTRAL' 
  | 'LEADING' 
  | 'LAGGING' 
  | 'REGIME_DEPENDENT' 
  | 'INSUFFICIENT_DATA';

export type RelationshipDirection = 'DIRECT' | 'INVERSE' | 'NON_LINEAR';

export type CorrelationStrength = 
  | 'HIGH' 
  | 'MODERATE' 
  | 'LOW' 
  | 'WEAK' 
  | 'EXTREME' 
  | 'INSUFFICIENT_DATA';

export interface CorrelationRecord {
  id: string;
  entityA: string;
  entityB: string;
  correlationCoefficient: number | null; // null if INSUFFICIENT_DATA
  correlationType: CorrelationType;
  observationWindow: string; // e.g. "30D", "90D", "1Y", "INTRA_DAY"
  sampleSize: number;
  statisticalConfidence: number; // e.g. 0.95
  relationshipDirection: RelationshipDirection;
  strength: CorrelationStrength;
  timestamp: string;
  sourceDataset: string;
  datasetVersion: string;
  researchPackageId: string;
  createdAt: string;
}

export type DetectionType = 
  | 'EXACT_DUPLICATE' 
  | 'SEMANTIC_DUPLICATE' 
  | 'RELATED_BUT_DISTINCT' 
  | 'CONTRADICTORY' 
  | 'NEW_INFORMATION';

export type ResolutionStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED' | 'ARCHIVED' | 'MERGED';

export interface DuplicateRecord {
  id: string;
  originalResearchId: string;
  comparedResearchId: string;
  similarityScore: number; // 0.0 to 1.0
  detectionType: DetectionType;
  matchingFields: string[];
  timestamp: string;
  source: string;
  resolutionStatus: ResolutionStatus;
  provenance?: {
    originalTitle?: string;
    comparedTitle?: string;
    conflictingEvidence?: string[];
    distinctDifferences?: string[];
  };
  createdAt: string;
}

export type ConsensusStatus = 
  | 'UNANIMOUS' 
  | 'STRONG_CONSENSUS' 
  | 'MAJORITY' 
  | 'SPLIT' 
  | 'NO_CONSENSUS' 
  | 'INSUFFICIENT_DATA';

export interface ModelRunOutput {
  id: string;
  consensusId: string;
  modelId: string;
  provider: string;
  modelName: string;
  version: string;
  conclusion: string;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number; // 0.0 to 100.0
  supportingEvidence: string[];
  assumptions: string[];
  risks: string[];
  uncertainty: string;
  weight: number;
  agreesWithConsensus: boolean;
  createdAt?: string;
}

export interface ConsensusConfidenceComponents {
  evidenceQuality: number;
  sourceReliability: number;
  modelAgreement: number;
  historicalValidation: number;
  dataCompleteness: number;
  uncertainty: number;
}

export interface EvidenceLineage {
  researchPackageId: string;
  hypothesisId?: string;
  evidenceIds: string[];
  sources: string[];
  datasetVersion: string;
  modelRunIds: string[];
  consensusId: string;
}

export interface ConsensusRecord {
  id: string;
  researchQuestion: string;
  modelsEvaluated: number;
  consensusStatus: ConsensusStatus;
  agreementPercent: number;
  disagreementPercent: number;
  majorityView: string;
  minorityView: string | null;
  confidence: number | null; // null if unavailable
  confidenceComponents: ConsensusConfidenceComponents;
  contradictoryEvidence: string[];
  uncertainty: string;
  requiredVerification: string;
  evidenceCount: number;
  sourceCount: number;
  researchPackageId: string;
  datasetVersion: string;
  verificationStatus: VerificationStatus;
  modelRuns: ModelRunOutput[];
  lineage: EvidenceLineage;
  timestamp: string;
  createdAt: string;
}

export interface SimulationRunInput {
  researchPackageId?: string;
  datasetId?: string;
  question?: string;
  filterAssetClass?: AssetClass;
  entityPairs?: Array<[string, string]>;
  modelIds?: string[];
}
