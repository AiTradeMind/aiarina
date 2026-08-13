export interface IAuditRecord {
  id: string;
  organizationId: string;
  workspaceId: string | null;
  actorId: number | null;
  action: string;
  sourceModule: string;
  resourceType: string | null;
  resourceId: string | null;
  correlationId: string | null;
  workflowId: number | null;
  severity: "INFO" | "WARNING" | "CRITICAL";
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  hash: string;
  previousHash: string | null;
  createdAt: Date;
}

export interface IAuditTimeline {
  id: number;
  auditRecordId: string;
  organizationId: string;
  workspaceId: string | null;
  timelineType: "GLOBAL" | "ORG" | "WORKSPACE" | "USER" | "RESOURCE" | "WORKFLOW";
  targetId: string;
  createdAt: Date;
}

export interface IAuditExport {
  id: number;
  organizationId: string;
  requestedById: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  format: "CSV" | "JSON";
  filters: Record<string, any>;
  downloadUrl: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditIntegrity {
  id: number;
  organizationId: string;
  lastVerifiedRecordId: string | null;
  status: "VALID" | "COMPROMISED";
  lastVerifiedAt: Date;
}

export interface IAuditMetrics {
  id: number;
  organizationId: string;
  date: Date;
  totalRecords: number;
  searchVolume: number;
  exportVolume: number;
  integrityFailures: number;
  storageBytes: number;
}

export interface CreateAuditRecordPayload {
  organizationId: string;
  workspaceId?: string;
  actorId?: number;
  action: string;
  sourceModule: string;
  resourceType?: string;
  resourceId?: string;
  correlationId?: string;
  workflowId?: number;
  severity?: "INFO" | "WARNING" | "CRITICAL";
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditSearchFilters {
  startDate?: Date;
  endDate?: Date;
  actorId?: number;
  resourceType?: string;
  resourceId?: string;
  organizationId?: string;
  workspaceId?: string;
  sourceModule?: string;
  severity?: "INFO" | "WARNING" | "CRITICAL";
  correlationId?: string;
  workflowId?: number;
}
