export interface AiFund {
  id: string;
  modelId: string;
  allocatedCapital: number;
  availableCapital: number;
  reservedCapital: number;
  usedCapital: number;
  currentExposure: number;
  maximumExposure: number;
  realizedPnl: number;
  unrealizedPnl: number;
  roi: number;
  drawdown: number;
  sharpe: number;
  winRate: number;
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiAllocation {
  id: string;
  modelId: string;
  amount: number;
  reason: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AllocationHistory {
  id: string;
  modelId: string;
  previousAllocation: number;
  currentAllocation: number;
  reason: string;
  operator: string;
  scoreSnapshot: any;
  timestamp: Date;
}

export interface AllocationRule {
  id: string;
  name: string;
  minimumScore: number;
  maximumDrawdown: number;
  maximumAllocation: number;
  minimumAllocation: number;
  maximumExposure: number;
  promotionThreshold: number;
  demotionThreshold: number;
  freezeThreshold: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AllocationSnapshot {
  id: string;
  timestamp: Date;
  totalCapital: number;
  allocatedCapital: number;
  distribution: any;
}

export interface AllocationRecommendation {
  id: string;
  modelId: string;
  action: string;
  suggestedAmount: number | null;
  reasoning: string;
  status: string;
  createdAt: Date;
}
