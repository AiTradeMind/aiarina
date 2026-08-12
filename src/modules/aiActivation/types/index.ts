export interface AIActivationRecord {
  id: string;
  correlationId: string;
  aiModelId: string;
  status: string;
  operator: string;
  details: any;
  createdAt: string;
  updatedAt: string;
}

export interface AIRuntimeRecord {
  id: string;
  runtimeId: string;
  aiModelId: string;
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  version: string;
  status: string;
  runtimeOwner: string;
  sessionOwner: string;
  marketOwner: string;
  restartCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIRuntimeLicense {
  id: string;
  licenseId: string;
  runtimeId: string;
  aiModelId: string;
  activationDate: string;
  expiryDate: string;
  version: string;
  signature: string;
  status: string;
}

export interface AIRuntimeResource {
  id: string;
  runtimeId: string;
  cpuAllocated: string;
  ramAllocated: string;
  threads: number;
  priority: string;
  executionQueueSize: number;
  executionSlot: string;
}

export interface AIRuntimeQuota {
  id: string;
  runtimeId: string;
  cpuLimitPercent: number;
  memoryLimitGb: number;
  executionLimitSec: number;
  apiLimitPerMin: number;
  runtimeDurationSec: number;
  maxConcurrentTasks: number;
  throttled: boolean;
}

export interface AIRuntimeAudit {
  id: string;
  runtimeId: string;
  auditType: string;
  actor: string;
  details: any;
  createdAt: string;
}

export interface AIRuntimeCertificate {
  id: string;
  certificateId: string;
  runtimeId: string;
  aiModelId: string;
  operator: string;
  sha256Hash: string;
  digitalSignature: string;
  createdAt: string;
}

export interface AIRuntimeHealthReport {
  aiModelId: string;
  runtimeId: string;
  healthScore: number;
  healthState: 'HEALTHY' | 'GOOD' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  heartbeat: boolean;
  cpuUsagePercent: number;
  memoryUsageGb: number;
  latencyMs: number;
  availabilityPercent: number;
  stabilityScore: number;
  restartCount: number;
  failureCount: number;
}
