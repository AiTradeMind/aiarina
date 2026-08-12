export type WorkflowStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export type StepStatus = "PENDING" | "APPROVED" | "REJECTED" | "SKIPPED";

export interface IWorkflowTemplate {
  id: number;
  name: string;
  type: "SEQUENTIAL" | "PARALLEL";
  sourceModule: string;
  organizationId: string;
  workspaceId: string;
  steps: IStepDefinition[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStepDefinition {
  name: string;
  requiredRole?: string;
  requiredPermission?: string;
  autoApproveAfterHours?: number; // Auto approve rule
  escalateToRole?: string; // Escalation rule
  timeoutHours?: number; // Timeout rule
}

export interface IWorkflowInstance {
  id: number;
  templateId: number | null;
  name: string;
  type: string;
  sourceModule: string;
  correlationId: string | null;
  status: WorkflowStatus;
  organizationId: string;
  workspaceId: string;
  initiatorId: number;
  currentStepIndex: number;
  data: Record<string, any>;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkflowStep {
  id: number;
  workflowInstanceId: number;
  stepIndex: number;
  name: string;
  status: StepStatus;
  requiredRole: string | null;
  requiredPermission: string | null;
  assignedUserId: number | null; // Delegated/assigned user
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkflowApproval {
  id: number;
  workflowInstanceId: number;
  stepId: number;
  approverId: number;
  approverRole: string | null;
  decision: "APPROVED" | "REJECTED" | "RETURNED";
  comments: string | null;
  createdAt: Date;
}

export interface IWorkflowHistory {
  id: number;
  workflowInstanceId: number;
  action: "CREATE" | "SUBMIT" | "APPROVE" | "REJECT" | "RETURN" | "CANCEL" | "ESCALATE" | "DELEGATE" | "TIMEOUT_AUTO_REJECT" | "TIMEOUT_AUTO_APPROVE";
  actorId: number;
  stepIndex: number | null;
  comments: string | null;
  data: Record<string, any>;
  createdAt: Date;
}

export interface IWorkflowMetrics {
  id: number;
  workflowInstanceId: number;
  executionDurationMs: number;
  approvalLatencyMs: number;
  escalationCount: number;
  timeoutCount: number;
  createdAt: Date;
}

export interface CreateTemplatePayload {
  name: string;
  type: "SEQUENTIAL" | "PARALLEL";
  sourceModule: string;
  organizationId: string;
  workspaceId: string;
  steps: IStepDefinition[];
}

export interface StartWorkflowPayload {
  templateId?: number;
  name: string;
  type: string;
  sourceModule: string;
  correlationId?: string;
  organizationId: string;
  workspaceId: string;
  data?: Record<string, any>;
  expiresAt?: Date;
}
