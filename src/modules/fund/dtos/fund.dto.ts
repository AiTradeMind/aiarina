import { FundType, AllocationStrategy } from "../constants/index.ts";

export interface CreateFundDTO {
  fundId?: string;
  name: string;
  fundType: FundType;
  initialCapital?: number;
  currency?: string;
  parentFundId?: string;
  owner?: string;
  riskTier?: string;
  maxAllocationLimit?: number;
  maxReservationLimit?: number;
  metadata?: Record<string, any>;
}

export interface AllocateFundDTO {
  sourceFundId: string;
  targetFundId?: string;
  targets?: Array<{
    targetFundId: string;
    weight?: number;
    priority?: number;
    percentage?: number;
    amount?: number;
  }>;
  amount?: number;
  allocationStrategy?: AllocationStrategy;
  notes?: string;
  actorRole?: string;
  actorId?: string;
}

export interface ReserveCapitalDTO {
  fundId: string;
  amount: number;
  purpose: string;
  expirationMinutes?: number;
  actorRole?: string;
  actorId?: string;
}

export interface ReleaseCapitalDTO {
  reservationId?: string;
  allocationId?: string;
  fundId?: string;
  amount?: number;
  actorRole?: string;
  actorId?: string;
  reason?: string;
}

export interface FreezeFundDTO {
  fundId: string;
  reason: string;
  actorRole?: string;
  actorId?: string;
}

export interface UnfreezeFundDTO {
  fundId: string;
  reason: string;
  actorRole?: string;
  actorId?: string;
}

export interface TransferCapitalDTO {
  sourceFundId: string;
  targetFundId: string;
  amount: number;
  notes?: string;
  actorRole?: string;
  actorId?: string;
}
