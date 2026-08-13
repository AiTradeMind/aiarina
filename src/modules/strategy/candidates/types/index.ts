export type CandidateStatus = 'PENDING' | 'REJECTED' | 'APPROVED' | 'EXPIRED' | 'COMMITTEE_PENDING';
export type AssetClass = 'Market' | 'Equity' | 'ETF' | 'Commodity' | 'Commodity Instruments' | 'Gold' | 'Silver' | 'Crude Oil' | 'Natural Gas';
export type TradeDirection = 'BUY' | 'SELL';

export interface StrategyCandidate {
  candidateId: string;
  strategyId: string;
  strategyVersion: string;
  workingCopyId?: string;
  aiModelId: string;
  symbol: string;
  assetClass: AssetClass;
  direction: TradeDirection;
  entryPrice: number;
  stopLoss: number;
  targets: number[];
  riskReward: number;
  confidence: number;
  reasoning: string;
  marketContext: string;
  technicalSummary: string;
  fundamentalSummary: string;
  volumeSummary: string;
  volatilitySummary: string;
  newsSummary: string;
  indicatorSnapshot: Record<string, any>;
  createdTime: string;
  expiryTime?: string;
  candidateStatus: CandidateStatus;
  score: number;
  committeeScore: number;
  riskScore: number;
  qualityScore: number;
  priorityScore: number;
  duplicateHash: string;
  sha256Reference: string;
  createdAt: string;
  votes?: StrategyCandidateVote[];
  history?: StrategyCandidateHistoryRecord[];
  validations?: StrategyCandidateValidationRecord[];
  tags?: string[];
  research?: StrategyCandidateResearchRecord[];
}

export interface StrategyCandidateVote {
  id: number;
  candidateId: string;
  committeeMember: string;
  vote: 'APPROVE' | 'REJECT' | 'ABSTAIN';
  comment?: string;
  votedAt: string;
}

export interface StrategyCandidateHistoryRecord {
  id: number;
  candidateId: string;
  action: string;
  operator: string;
  details?: string;
  timestamp: string;
}

export interface StrategyCandidateValidationRecord {
  id: number;
  candidateId: string;
  isValid: boolean;
  ruleName: string;
  message?: string;
  validatedAt: string;
}

export interface StrategyCandidateResearchRecord {
  id: number;
  candidateId: string;
  researchSource: string;
  summary?: string;
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence?: number;
  researchedAt: string;
}

export interface CandidateStatistics {
  totalCandidates: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  expiredCount: number;
  committeePendingCount: number;
  averageConfidence: number;
  averageRisk: number;
  averageQuality: number;
  averageRR: number;
}

export interface CandidatesOverview {
  strategyId: string;
  statistics: CandidateStatistics;
  candidates: StrategyCandidate[];
}

export const EMPTY_CANDIDATES_OVERVIEW: CandidatesOverview = {
  strategyId: '',
  statistics: {
    totalCandidates: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    expiredCount: 0,
    committeePendingCount: 0,
    averageConfidence: 0,
    averageRisk: 0,
    averageQuality: 0,
    averageRR: 0,
  },
  candidates: []
};
