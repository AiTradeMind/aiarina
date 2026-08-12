export interface StrategyLifecycle {
  id: string;
  strategyId: string;
  currentState: string;
  previousState: string | null;
  createdTime: Date;
  activatedTime: Date | null;
  pausedTime: Date | null;
  retiredTime: Date | null;
  currentVersion: string;
  approvalStatus: string | null;
  approvalBy: string | null;
  approvalNotes: string | null;
  updatedTime: Date;
}

export interface StrategyState {
  id: string;
  name: string;
  description: string | null;
  createdTime: Date;
}

export interface StrategyStateHistory {
  id: string;
  strategyId: string;
  oldState: string | null;
  newState: string;
  timestamp: Date;
  userId: string | null;
  reason: string | null;
  notes: string | null;
}

export interface StrategyTransition {
  id: string;
  fromState: string;
  toState: string;
  isValid: boolean;
  requiresApproval: boolean;
  createdTime: Date;
}

export interface StrategyActivationLog {
  id: string;
  strategyId: string;
  version: string;
  activatedBy: string | null;
  timestamp: Date;
  status: string;
  notes: string | null;
}

export interface StrategyRetirementLog {
  id: string;
  strategyId: string;
  version: string;
  retiredBy: string | null;
  timestamp: Date;
  reason: string;
  notes: string | null;
}
