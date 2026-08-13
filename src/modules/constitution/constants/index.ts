export const CONSTITUTION_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
  ARCHIVED: 'ARCHIVED',
  DISABLED: 'DISABLED',
} as const;

export type ConstitutionStatus = typeof CONSTITUTION_STATUSES[keyof typeof CONSTITUTION_STATUSES];
export type ConstitutionVersionStatus = ConstitutionStatus;
export type ConstitutionModuleStatus = ConstitutionStatus;

export const KERNEL_LIFECYCLE_STATES = {
  INITIALIZING: 'INITIALIZING',
  READY: 'READY',
  LOCKED: 'LOCKED',
  SAFE_MODE: 'SAFE_MODE',
  MAINTENANCE: 'MAINTENANCE',
  FAILED: 'FAILED',
  STOPPED: 'STOPPED',
} as const;

export type KernelLifecycleState = typeof KERNEL_LIFECYCLE_STATES[keyof typeof KERNEL_LIFECYCLE_STATES];

export const EMERGENCY_MODES = {
  NONE: 'NONE',
  EMERGENCY_SHUTDOWN: 'EMERGENCY_SHUTDOWN',
  READ_ONLY: 'READ_ONLY',
  MAINTENANCE: 'MAINTENANCE',
  RECOVERY: 'RECOVERY',
  SAFE_MODE: 'SAFE_MODE',
} as const;

export type EmergencyMode = typeof EMERGENCY_MODES[keyof typeof EMERGENCY_MODES];

export const POLICY_CATEGORIES = {
  SYSTEM: 'System',
  AI: 'AI',
  TRADING: 'Trading',
  RISK: 'Risk',
  PORTFOLIO: 'Portfolio',
  ACCOUNTING: 'Accounting',
  SECURITY: 'Security',
  ORGANIZATION: 'Organization',
  COMPLIANCE: 'Compliance',
  EMERGENCY: 'Emergency',
  INFRASTRUCTURE: 'Infrastructure',
  EXECUTION: 'Execution',
  LEARNING: 'Learning',
  USER: 'User',
} as const;

export type PolicyCategory = typeof POLICY_CATEGORIES[keyof typeof POLICY_CATEGORIES];

export const CONSTITUTION_RULE_CATEGORIES = POLICY_CATEGORIES;
export type RuleCategory = PolicyCategory;

export const GOVERNANCE_ROLES = {
  OWNER: 'Owner',
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  OPERATOR: 'Operator',
  AUDITOR: 'Auditor',
  VIEWER: 'Viewer',
  SYSTEM: 'System',
  AI: 'AI',
} as const;

export type GovernanceRole = typeof GOVERNANCE_ROLES[keyof typeof GOVERNANCE_ROLES];

export const GOVERNANCE_ACTIONS = {
  READ: 'Read',
  WRITE: 'Write',
  REGISTER: 'Register',
  LOCK: 'Lock',
  ACTIVATE: 'Activate',
  ARCHIVE: 'Archive',
  EXECUTE: 'Execute',
  APPROVE: 'Approve',
  REJECT: 'Reject',
} as const;

export type GovernanceAction = typeof GOVERNANCE_ACTIONS[keyof typeof GOVERNANCE_ACTIONS];

export const GOVERNANCE_EVENT_TYPES = {
  CONSTITUTION_LOADED: 'ConstitutionLoaded',
  VERSION_ACTIVATED: 'VersionActivated',
  VERSION_ARCHIVED: 'VersionArchived',
  VERSION_LOCKED: 'VersionLocked',
  MODULE_REGISTERED: 'ModuleRegistered',
  MODULE_REMOVED: 'ModuleRemoved',
  POLICY_REGISTERED: 'PolicyRegistered',
  SNAPSHOT_CREATED: 'SnapshotCreated',
  VALIDATION_PASSED: 'ValidationPassed',
  VALIDATION_FAILED: 'ValidationFailed',
  HEALTH_CHANGED: 'HealthChanged',
} as const;

export const VALIDATION_PHASES = {
  PRE_VALIDATION: 'PreValidation',
  SCHEMA_VALIDATION: 'SchemaValidation',
  DEPENDENCY_VALIDATION: 'DependencyValidation',
  SIGNATURE_VALIDATION: 'SignatureValidation',
  HASH_VALIDATION: 'HashValidation',
  PERMISSION_VALIDATION: 'PermissionValidation',
  FINAL_VALIDATION: 'FinalValidation',
} as const;

export type ValidationPhase = typeof VALIDATION_PHASES[keyof typeof VALIDATION_PHASES];

export const MODULE_STATUSES = {
  REGISTERED: 'REGISTERED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DEPRECATED: 'DEPRECATED',
} as const;

export const AUDIT_EVENT_TYPES = {
  CREATION: 'CREATION',
  ACTIVATION: 'ACTIVATION',
  LOCK: 'LOCK',
  ARCHIVE: 'ARCHIVE',
  REGISTRATION: 'REGISTRATION',
  VALIDATION_FAILURE: 'VALIDATION_FAILURE',
  SNAPSHOT_CREATED: 'SNAPSHOT_CREATED',
  LIFECYCLE_TRANSITION: 'LIFECYCLE_TRANSITION',
  POLICY_REGISTRATION: 'POLICY_REGISTRATION',
  EMERGENCY_MODE_CHANGED: 'EMERGENCY_MODE_CHANGED',
} as const;

export const CONSTITUTION_ERRORS = {
  VERSION_NOT_FOUND: 'CONSTITUTION_ERR_1001: Constitution version not found',
  CONSTITUTION_LOCKED: 'CONSTITUTION_ERR_1002: Constitution version is locked and immutable',
  HASH_MISMATCH: 'CONSTITUTION_ERR_1003: Constitution payload hash verification failed (tamper detected)',
  MULTIPLE_ACTIVE_VERSIONS: 'CONSTITUTION_ERR_1004: Multiple active constitution versions detected in storage',
  INVALID_STATE_TRANSITION: 'CONSTITUTION_ERR_1005: Invalid constitution state transition',
  MODULE_DEPENDENCY_MISSING: 'CONSTITUTION_ERR_2001: Required module dependency missing or inactive',
  DUPLICATE_MODULE_ID: 'CONSTITUTION_ERR_2002: Module with specified ID is already registered',
  INVALID_MODULE_SIGNATURE: 'CONSTITUTION_ERR_2003: Module signature verification failed',
  STARTUP_VALIDATION_FAILED: 'CONSTITUTION_ERR_3001: Constitution startup validation failed',
  RULE_REGISTRATION_FAILED: 'CONSTITUTION_ERR_4001: Rule registration failed',
  POLICY_REGISTRATION_FAILED: 'CONSTITUTION_ERR_5001: Policy registration failed',
  INVALID_LIFECYCLE_TRANSITION: 'CONSTITUTION_ERR_6001: Invalid kernel lifecycle transition requested',
  PERMISSION_DENIED: 'CONSTITUTION_ERR_7001: Permission denied for requested governance role and action',
  EMERGENCY_SHUTDOWN_ACTIVE: 'CONSTITUTION_ERR_8001: Operation blocked due to active emergency shutdown mode',
} as const;

export const DEFAULT_CONSTITUTION = {
  VERSION_ID: 'v1.0.0-AAOS-CONSTITUTION',
  TITLE: 'AI ARINA Operating System Supreme Constitution v1.0',
  DESCRIPTION: 'Highest governance framework for AAOS enterprise operating system modules, security, and execution safety.',
  GOVERNANCE_LEVEL: 'SUPREME_ENTERPRISE',
  ENFORCEMENT: 'STRICT_IMMUTABLE',
  PHASE: 'PHASE_2_1A_FINAL_HARDENING_KERNEL',
} as const;
