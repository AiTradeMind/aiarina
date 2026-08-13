import { 
  KernelLifecycleState, 
  EmergencyMode, 
  PolicyCategory, 
  GovernanceRole, 
  GovernanceAction,
  ValidationPhase,
  ConstitutionVersionStatus,
  ConstitutionModuleStatus
} from "../constants/index.ts";

export type { ConstitutionVersionStatus, ConstitutionModuleStatus, KernelLifecycleState, EmergencyMode, PolicyCategory, GovernanceRole, GovernanceAction, ValidationPhase };

export interface ConstitutionVersion {
  id?: number;
  versionId: string;
  parentVersionId?: string | null;
  title: string;
  description?: string | null;
  status: ConstitutionVersionStatus;
  hash: string;
  isLocked: boolean;
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConstitutionRegistryEntry {
  id?: number;
  registryId: string;
  versionId: string;
  name: string;
  category: PolicyCategory | string;
  status: ConstitutionVersionStatus;
  config?: Record<string, any>;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConstitutionPolicy {
  id?: number;
  policyId: string;
  policyName: string;
  versionId: string;
  category: PolicyCategory | string;
  priority: number;
  version: string;
  status: ConstitutionVersionStatus | string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConstitutionRule {
  id?: number;
  ruleId: string;
  versionId: string;
  name: string;
  category: PolicyCategory | string;
  priority: number;
  status: ConstitutionVersionStatus | string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConstitutionModuleRegistration {
  id?: number;
  moduleId: string;
  moduleName: string;
  version: string;
  status: ConstitutionModuleStatus;
  capabilities: string[];
  dependencies: string[];
  signature?: string | null;
  registeredBy: string;
  registeredAt: Date;
  lastHeartbeat: Date;
}

export interface ConstitutionMetadataEntry {
  id?: number;
  key: string;
  value: any;
  description?: string | null;
  isReadOnly: boolean;
  updatedBy: string;
  updatedAt: Date;
}

export interface ConstitutionSnapshot {
  id?: number;
  snapshotId: string;
  versionId: string;
  hash: string;
  snapshotData: Record<string, any>;
  isReadOnly: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ConstitutionAuditLog {
  id?: number;
  auditId: string;
  eventType: string;
  targetType: string;
  targetId: string;
  operator: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface RegisterModuleDTO {
  moduleId: string;
  moduleName: string;
  version: string;
  capabilities?: string[];
  dependencies?: string[];
  signature?: string;
  registeredBy?: string;
}

export interface RegisterPolicyDTO {
  policyId: string;
  policyName: string;
  versionId?: string;
  category: PolicyCategory | string;
  priority?: number;
  version?: string;
  status?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface KernelLifecycleRecord {
  timestamp: string;
  previousState: KernelLifecycleState;
  newState: KernelLifecycleState;
  reason: string;
  operator: string;
}

export interface ValidationPhaseResult {
  phase: ValidationPhase;
  passed: boolean;
  message: string;
  timeTakenMs: number;
  details?: Record<string, any>;
}

export interface StructuredValidationDiagnostics {
  overallPassed: boolean;
  timestamp: string;
  totalTimeMs: number;
  phases: ValidationPhaseResult[];
}

export interface BootPipelineStep {
  stepName: string;
  passed: boolean;
  timeMs: number;
  message: string;
}

export interface BootPipelineResult {
  success: boolean;
  startTime: string;
  endTime: string;
  totalBootTimeMs: number;
  steps: BootPipelineStep[];
}

export interface VersionCompatibilityMetadata {
  minimumVersion: string;
  maximumVersion: string;
  supportedModules: string[];
  deprecatedModules: string[];
  migrationMetadata: Record<string, any>;
  futureCompatibility: Record<string, any>;
}

export interface ConstitutionMetrics {
  bootTimeMs: number;
  lastValidationTimeMs: number;
  registrySize: number;
  moduleCount: number;
  ruleCount: number;
  policyCount: number;
  snapshotCount: number;
  activeVersionId: string | null;
}

export interface GranularCacheStatus {
  lastUpdated: number;
  cachedModulesCount: number;
  cachedPoliciesCount: number;
  cachedRulesCount: number;
  cachedPermissionsCount: number;
  cachedMetadataCount: number;
  isVersionCached: boolean;
}

export interface ConstitutionHealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  kernelLifecycle: {
    currentState: KernelLifecycleState;
    emergencyMode: EmergencyMode;
    transitionHistory: KernelLifecycleRecord[];
  };
  bootstrapStatus: 'INITIALIZED' | 'PENDING' | 'FAILED';
  activeVersion: string | null;
  policyRegistryStatus: {
    policyCount: number;
    activePoliciesCount: number;
  };
  permissionMatrixStatus: {
    rolesCount: number;
    actionsCount: number;
    matrixLoaded: boolean;
  };
  validationPipelineStatus: StructuredValidationDiagnostics;
  cacheStatus: GranularCacheStatus;
  hashStatus: 'VALID' | 'TAMPERED' | 'UNVERIFIED';
  signatureStatus: 'VALID' | 'INVALID' | 'UNVERIFIED';
  dependencyStatus: 'SATISFIED' | 'UNSATISFIED';
  versionCompatibility: VersionCompatibilityMetadata;
  snapshotStatus: {
    snapshotExists: boolean;
    latestSnapshotId: string | null;
  };
  checks: {
    database: boolean;
    loader: boolean;
    registry: boolean;
    hashIntegrity: boolean;
    moduleDependencies: boolean;
    policiesLoaded: boolean;
    permissionsLoaded: boolean;
  };
  metrics?: ConstitutionMetrics;
}

export interface ConstitutionFoundationSummary {
  version: ConstitutionVersion | null;
  lifecycle: {
    currentState: KernelLifecycleState;
    emergencyMode: EmergencyMode;
  };
  registry: ConstitutionRegistryEntry[];
  modules: ConstitutionModuleRegistration[];
  policies: ConstitutionPolicy[];
  rules: ConstitutionRule[];
  metadata: ConstitutionMetadataEntry[];
  permissionMatrix: Record<GovernanceRole, GovernanceAction[]>;
  latestSnapshot?: ConstitutionSnapshot | null;
  versionHistory?: {
    current: ConstitutionVersion | null;
    previous: ConstitutionVersion | null;
    next: ConstitutionVersion | null;
    migrationMetadata?: Record<string, any>;
  };
  versionCompatibility: VersionCompatibilityMetadata;
  rollbackMetadata?: Record<string, any>;
  engineStatus: string;
  metrics?: ConstitutionMetrics;
  hashIntegrityVerified: boolean;
}
