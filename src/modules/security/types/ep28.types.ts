export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type SecurityIncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RECOVERED' | 'CLOSED';
export type ThreatType = 'BRUTE_FORCE' | 'CREDENTIAL_ABUSE' | 'PRIVILEGE_ESCALATION' | 'API_ABUSE' | 'SUSPICIOUS_ACTIVITY';

export interface SecurityEventItem {
  eventId: string;
  sourceModule: string;
  eventType: string;
  clientIp: string;
  severity: SeverityLevel;
  details: string;
  timestamp: string;
}

export interface SecurityThreatItem {
  threatId: string;
  threatType: ThreatType;
  targetResource: string;
  sourceIp: string;
  detectedCount: number;
  status: 'ACTIVE' | 'MITIGATED' | 'IGNORED';
  detectedAt: string;
}

export interface IntrusionRecordItem {
  intrusionId: string;
  detectionType: 'UNKNOWN_ACCESS' | 'REPEATED_FAILURE' | 'UNEXPECTED_REQUEST' | 'POLICY_VIOLATION' | 'SUSPICIOUS_IP';
  sourceIp: string;
  attemptedResource: string;
  blockedCount: number;
  status: 'BLOCKED' | 'FLAGGED';
  timestamp: string;
}

export interface VulnerabilityItem {
  vulnerabilityId: string;
  cveOrIdentifier: string;
  severity: SeverityLevel;
  affectedComponent: string;
  status: 'OPEN' | 'PATCH_PENDING' | 'MITIGATED';
  owner: string;
  discoveredAt: string;
}

export interface SecretMonitoringItem {
  secretId: string;
  secretName: string;
  category: 'API_KEY' | 'JWT_KEY' | 'WEBHOOK_SECRET' | 'ENCRYPTION_KEY';
  rotationStatus: 'HEALTHY' | 'ROTATION_DUE' | 'EXPIRED';
  lastRotatedAt: string;
  expiresAt: string;
}

export interface SecurityPolicyRule {
  policyId: string;
  policyName: string;
  category: 'PASSWORD' | 'MFA' | 'API' | 'GATEWAY' | 'ACCESS';
  status: 'ENFORCED' | 'AUDIT_ONLY';
  lastEnforcedAt: string;
}

export interface SecurityIncidentItem {
  incidentId: string;
  title: string;
  severity: SeverityLevel;
  status: SecurityIncidentStatus;
  assignee: string;
  containmentDetails: string;
  createdAt: string;
}

export interface SecurityAlertItem {
  alertId: string;
  title: string;
  severity: SeverityLevel;
  source: string;
  isAcknowledged: boolean;
  createdAt: string;
}

export interface SecurityAuditItem {
  auditId: string;
  eventType: string;
  operator: string;
  details: string;
  timestamp: string;
}

export interface SocRuntimeWorker {
  workerId: string;
  workerType: 'THREAT_SCANNER' | 'ALERT_PROCESSOR' | 'INCIDENT_QUEUE' | 'POLICY_MONITOR' | 'HEALTH_MONITOR';
  status: 'ONLINE' | 'SCANNING' | 'PROCESSING';
  processedCount: number;
  uptimeSeconds: number;
}

export interface SocDashboardOverview {
  totalSecurityEventsToday: number;
  activeThreatsCount: number;
  blockedIntrusionsCount: number;
  openVulnerabilitiesCount: number;
  openIncidentsCount: number;
  secretsRotationDueCount: number;
  socHealthIndex: number;
}

export interface SocQaReport {
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  readOnlyIntegrationConfirmed: boolean;
  nonExecutionConfirmed: boolean;
  buildStatus: string;
}
