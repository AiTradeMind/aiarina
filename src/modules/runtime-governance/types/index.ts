import {
  PolicyCategoryValue,
  EnforcementLevelValue,
  EvaluationStatusValue,
  CircuitBreakerStatusValue,
} from "../constants/index.ts";

export interface RuntimeGovernancePolicy {
  policyId: string;
  name: string;
  category: PolicyCategoryValue;
  enforcementLevel: EnforcementLevelValue;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  priority: number;
  ruleConfig: {
    maxTradeValue?: number;
    maxDailyLoss?: number;
    maxOrderRatePerMin?: number;
    allowedRoles?: string[];
    allowedSymbols?: string[];
    requireSecondarySignoff?: boolean;
    [key: string]: any;
  };
  description?: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuntimeEvaluationRequest {
  actionType: string;
  payload?: Record<string, any>;
  role?: string;
  actorId?: string;
  symbol?: string;
  amount?: number;
  timeframe?: string;
  metadata?: Record<string, any>;
}

export interface PolicyViolation {
  policyId: string;
  policyName: string;
  category: PolicyCategoryValue;
  enforcementLevel: EnforcementLevelValue;
  reason: string;
}

export interface RuntimeEvaluationResult {
  evaluationId: string;
  status: EvaluationStatusValue;
  riskScore: number;
  isCompliant: boolean;
  violations: PolicyViolation[];
  triggeredPolicies: string[];
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface CircuitBreakerState {
  target: string;
  status: CircuitBreakerStatusValue;
  tripCount: number;
  lastTrippedAt?: Date;
  cooldownMs: number;
  reason?: string;
}

export interface KillSwitchState {
  scope: "GLOBAL" | "SYMBOL" | "STRATEGY" | "USER";
  isActive: boolean;
  activatedBy?: string;
  activatedAt?: Date;
  reason?: string;
}

export interface GovernanceAuditLogRecord {
  logId: string;
  evaluationId?: string;
  actionType: string;
  actorId?: string;
  resultStatus: EvaluationStatusValue;
  riskScore: number;
  details: Record<string, any>;
  createdAt: Date;
}
