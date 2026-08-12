export interface AIModelLifecycle {
  id: string;
  modelId: number;
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

export interface AIModelStateHistory {
  id: string;
  modelId: number;
  oldState: string | null;
  newState: string;
  timestamp: Date;
  userId: string;
  reason: string | null;
  notes: string | null;
}

export interface AIModelActivationLog {
  id: string;
  modelId: number;
  version: string;
  activatedBy: string;
  timestamp: Date;
  status: string;
  notes: string | null;
}

export interface AIModelRetirementLog {
  id: string;
  modelId: number;
  version: string;
  retiredBy: string;
  timestamp: Date;
  reason: string;
  notes: string | null;
}

export interface AIModelTransition {
  id: string;
  fromState: string;
  toState: string;
  isValid: boolean;
  requiresApproval: boolean;
  createdTime: Date;
}
