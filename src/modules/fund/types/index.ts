import { FundType, FundStatus, FundOperation, AllocationStrategy, PipelineStage } from "../constants/index.ts";

export interface FundAccount {
  id?: number;
  fundId: string;
  name: string;
  fundType: FundType;
  status: FundStatus;
  totalCapital: number;
  allocatedCapital: number;
  reservedCapital: number;
  availableCapital: number;
  frozenCapital: number;
  releasedCapital: number;
  utilizedCapital: number;
  currency: string;
  parentFundId?: string | null;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FundAllocation {
  id?: number;
  allocationId: string;
  sourceFundId: string;
  targetFundId: string;
  amount: number;
  allocationStrategy: AllocationStrategy;
  status: "ACTIVE" | "RELEASED" | "RECALLED";
  notes?: string | null;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FundReservation {
  id?: number;
  reservationId: string;
  fundId: string;
  amount: number;
  purpose: string;
  status: "RESERVED" | "RELEASED" | "CONSUMED" | "EXPIRED";
  expiresAt?: Date | null;
  releasedAt?: Date | null;
  consumedAt?: Date | null;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FundTransaction {
  id?: number;
  transactionId: string;
  fundId: string;
  operation: FundOperation;
  amount: number;
  sourceFundId?: string | null;
  targetFundId?: string | null;
  status: "SUCCESS" | "FAILED" | "PENDING";
  failureReason?: string | null;
  actorId: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface FundMetadataInfo {
  id?: number;
  fundId: string;
  riskTier: string;
  maxAllocationLimit?: number | null;
  maxReservationLimit?: number | null;
  owner: string;
  tags?: string[];
  customRules?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PipelineExecutionResult<T = any> {
  success: boolean;
  pipelineStage: PipelineStage;
  executionTimeMs: number;
  data?: T;
  failureReason?: string;
  governanceViolations?: any[];
  riskScore?: number;
  auditLogId?: string;
}

export interface AllocationRuleTarget {
  targetFundId: string;
  weight?: number; // for WEIGHTED
  priority?: number; // for PRIORITY
  percentage?: number; // for PERCENTAGE (0-100)
  amount?: number; // for MANUAL
}
