export interface StrategyVersion {
  id: string;
  strategyId: string;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  semanticVersion: string;
  versionType: string;
  lifecycleState: string;
  validationStatus: string;
  author: string | null;
  notes: string | null;
  createdTime: Date;
}

export interface StrategyVersionHistory {
  id: string;
  strategyId: string;
  versionId: string;
  action: string;
  userId: string | null;
  timestamp: Date;
  notes: string | null;
}

export interface StrategyChangeLog {
  id: string;
  versionId: string;
  blocksAdded: number | null;
  blocksRemoved: number | null;
  parametersChanged: number | null;
  connectionsChanged: number | null;
  validationResult: string | null;
  riskChanges: string | null;
  aiDependencyChanges: string | null;
  createdTime: Date;
}

export interface StrategyVersionTag {
  id: string;
  versionId: string;
  tag: string;
  createdTime: Date;
}

export interface StrategySnapshot {
  id: string;
  versionId: string;
  builderLayout: any;
  blocks: any;
  connections: any;
  parameters: any;
  metadata: any | null;
  dependencies: any | null;
  createdTime: Date;
}

export interface StrategyRestorePoint {
  id: string;
  strategyId: string;
  versionId: string;
  reason: string | null;
  restoredBy: string | null;
  restoredTime: Date;
}
