export interface DecisionPackage {
  id: string;
  decisionId: string;
  strategyId: string;
  aiModel: string;
  instrument: string;
  direction: string;
  confidence: number;
  consensus: number;
  certificate: string; // JSON string of committee certificate
  correlationId: string;
  packageHash: string;
  createdAt: Date;
}

export interface ExecutionAuthorization {
  id: string;
  packageId: string;
  committeeCertificateVerified: boolean;
  consensusVerified: boolean;
  aiRuntimeVerified: boolean;
  treasuryVerified: boolean;
  marketVerified: boolean;
  executionPermission: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  createdAt: Date;
}

export interface ExecutionQueueItem {
  id: string;
  packageId: string;
  priority: number;
  status: 'PENDING' | 'PROCESSING' | 'RETRYING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  error: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionContext {
  id: string; // Execution ID
  lifecycleId: string;
  strategyId: string;
  packageId: string;
  correlationId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

export interface ExecutionLock {
  id: string;
  lockType: 'DECISION' | 'EXECUTION' | 'LIFECYCLE' | 'QUEUE';
  lockKey: string;
  createdAt: Date;
}

export interface ExecutionRouting {
  id: string;
  executionId: string;
  targetRoute: 'PAPER_TRADING';
  status: 'ROUTED' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

export interface ExecutionCertificate {
  id: string;
  executionId: string;
  lifecycleId: string;
  sha256: string;
  digitalSignature: string;
  createdAt: Date;
}

export interface WorkspacePreferences {
  userId: string;
  workspaceLayout: string; // GRID, LIST, split vertical, etc
  savedViews: Array<{ id: string; name: string; query: any }>;
  gridSize: number;
  tableColumns: Record<string, string[]>;
  inspectorWidth: number;
  pinnedPanels: string[];
  shortcuts: Record<string, string>;
  defaultFilters: Record<string, any>;
  themeOverride: 'SYSTEM' | 'LIGHT' | 'DARK';
  updatedAt: Date;
}

export interface ExecutionEvent {
  id: string;
  packageId: string;
  eventType: 'DecisionReceived' | 'PackageCreated' | 'ExecutionAuthorized' | 'ExecutionRejected' | 'LifecycleStarted' | 'ExecutionCompleted';
  payload: Record<string, any>;
  createdAt: Date;
}

export interface ExecutionAudit {
  id: string;
  auditType: 'Authorization' | 'Execution' | 'Certificate' | 'Queue' | 'Routing';
  hash: string; // SHA-256 protected hash of contents
  content: Record<string, any>;
  createdAt: Date;
}
