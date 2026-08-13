import { eq, and, desc, asc, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import {
  workflowTemplates,
  workflowInstances,
  workflowSteps,
  workflowApprovals,
  workflowHistory,
  workflowMetrics,
  users
} from "../../../db/schema.ts";
import {
  IWorkflowTemplate,
  IWorkflowInstance,
  IWorkflowStep,
  IWorkflowApproval,
  IWorkflowHistory,
  IWorkflowMetrics,
  CreateTemplatePayload,
  StartWorkflowPayload
} from "../types/index.ts";

export class WorkflowRepository {
  private static tablesChecked = false;

  public async ensureWorkflowTables(): Promise<void> {
    if (WorkflowRepository.tablesChecked) return;
    const db = getDb();
    try {
      // 1. Create templates table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workflow_templates (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          source_module VARCHAR(100) NOT NULL,
          organization_id VARCHAR(50) NOT NULL,
          workspace_id VARCHAR(50) NOT NULL,
          steps JSONB DEFAULT '[]'::jsonb NOT NULL,
          version INTEGER DEFAULT 1 NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 2. Create instances table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workflow_instances (
          id SERIAL PRIMARY KEY,
          template_id INTEGER REFERENCES workflow_templates(id) ON DELETE SET NULL,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          source_module VARCHAR(100) NOT NULL,
          correlation_id VARCHAR(100),
          status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
          organization_id VARCHAR(50) NOT NULL,
          workspace_id VARCHAR(50) NOT NULL,
          initiator_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          current_step_index INTEGER DEFAULT 0 NOT NULL,
          data JSONB DEFAULT '{}'::jsonb NOT NULL,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 3. Create steps table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workflow_steps (
          id SERIAL PRIMARY KEY,
          workflow_instance_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE NOT NULL,
          step_index INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
          required_role VARCHAR(100),
          required_permission VARCHAR(100),
          assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 4. Create approvals table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workflow_approvals (
          id SERIAL PRIMARY KEY,
          workflow_instance_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE NOT NULL,
          step_id INTEGER REFERENCES workflow_steps(id) ON DELETE CASCADE NOT NULL,
          approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL NOT NULL,
          approver_role VARCHAR(100),
          decision VARCHAR(50) NOT NULL,
          comments TEXT,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 5. Create history table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workflow_history (
          id SERIAL PRIMARY KEY,
          workflow_instance_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE NOT NULL,
          action VARCHAR(100) NOT NULL,
          actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL NOT NULL,
          step_index INTEGER,
          comments TEXT,
          data JSONB DEFAULT '{}'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 6. Create metrics table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workflow_metrics (
          id SERIAL PRIMARY KEY,
          workflow_instance_id INTEGER REFERENCES workflow_instances(id) ON DELETE CASCADE NOT NULL,
          execution_duration_ms INTEGER DEFAULT 0 NOT NULL,
          approval_latency_ms INTEGER DEFAULT 0 NOT NULL,
          escalation_count INTEGER DEFAULT 0 NOT NULL,
          timeout_count INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      WorkflowRepository.tablesChecked = true;
    } catch (err) {
      console.error("Failed to execute workflow DDL migration:", err);
    }
  }

  // --- Templates ---
  public async createTemplate(payload: CreateTemplatePayload): Promise<IWorkflowTemplate> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const [inserted] = await db
      .insert(workflowTemplates)
      .values({
        name: payload.name,
        type: payload.type,
        sourceModule: payload.sourceModule,
        organizationId: payload.organizationId,
        workspaceId: payload.workspaceId,
        steps: payload.steps as any,
        version: 1,
      })
      .returning();

    return inserted as any;
  }

  public async getTemplate(id: number): Promise<IWorkflowTemplate | null> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const results = await db
      .select()
      .from(workflowTemplates)
      .where(eq(workflowTemplates.id, id))
      .limit(1);

    return results[0] as any || null;
  }

  public async listTemplates(organizationId: string): Promise<IWorkflowTemplate[]> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const results = await db
      .select()
      .from(workflowTemplates)
      .where(eq(workflowTemplates.organizationId, organizationId))
      .orderBy(desc(workflowTemplates.createdAt));

    return results as any[];
  }

  // --- Instances ---
  public async createInstance(
    payload: StartWorkflowPayload & { initiatorId: number; status: string }
  ): Promise<IWorkflowInstance> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const [inserted] = await db
      .insert(workflowInstances)
      .values({
        templateId: payload.templateId || null,
        name: payload.name,
        type: payload.type,
        sourceModule: payload.sourceModule,
        correlationId: payload.correlationId || null,
        status: payload.status as any,
        organizationId: payload.organizationId,
        workspaceId: payload.workspaceId,
        initiatorId: payload.initiatorId,
        currentStepIndex: 0,
        data: payload.data || {},
        expiresAt: payload.expiresAt || null,
      })
      .returning();

    return inserted as any;
  }

  public async getInstance(id: number): Promise<IWorkflowInstance | null> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const results = await db
      .select()
      .from(workflowInstances)
      .where(eq(workflowInstances.id, id))
      .limit(1);

    return results[0] as any || null;
  }

  public async updateInstance(
    id: number,
    updates: Partial<IWorkflowInstance>
  ): Promise<IWorkflowInstance> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const [updated] = await db
      .update(workflowInstances)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(workflowInstances.id, id))
      .returning();

    return updated as any;
  }

  public async listInstances(
    organizationId: string,
    workspaceId?: string
  ): Promise<IWorkflowInstance[]> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const conditions = [eq(workflowInstances.organizationId, organizationId)];
    if (workspaceId) {
      conditions.push(eq(workflowInstances.workspaceId, workspaceId));
    }

    const results = await db
      .select()
      .from(workflowInstances)
      .where(and(...conditions))
      .orderBy(desc(workflowInstances.createdAt));

    return results as any[];
  }

  // --- Steps ---
  public async createStep(step: Omit<IWorkflowStep, "id" | "createdAt" | "updatedAt">): Promise<IWorkflowStep> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const [inserted] = await db
      .insert(workflowSteps)
      .values({
        workflowInstanceId: step.workflowInstanceId,
        stepIndex: step.stepIndex,
        name: step.name,
        status: step.status,
        requiredRole: step.requiredRole,
        requiredPermission: step.requiredPermission,
        assignedUserId: step.assignedUserId,
      })
      .returning();

    return inserted as any;
  }

  public async getStepsForInstance(instanceId: number): Promise<IWorkflowStep[]> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const results = await db
      .select()
      .from(workflowSteps)
      .where(eq(workflowSteps.workflowInstanceId, instanceId))
      .orderBy(asc(workflowSteps.stepIndex));

    return results as any[];
  }

  public async updateStep(
    id: number,
    updates: Partial<IWorkflowStep>
  ): Promise<IWorkflowStep> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const [updated] = await db
      .update(workflowSteps)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(workflowSteps.id, id))
      .returning();

    return updated as any;
  }

  // --- History ---
  public async createHistory(
    history: Omit<IWorkflowHistory, "id" | "createdAt">
  ): Promise<IWorkflowHistory> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const [inserted] = await db
      .insert(workflowHistory)
      .values({
        workflowInstanceId: history.workflowInstanceId,
        action: history.action,
        actorId: history.actorId,
        stepIndex: history.stepIndex,
        comments: history.comments,
        data: history.data || {},
      })
      .returning();

    return inserted as any;
  }

  public async getHistory(instanceId: number): Promise<IWorkflowHistory[]> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const results = await db
      .select()
      .from(workflowHistory)
      .where(eq(workflowHistory.workflowInstanceId, instanceId))
      .orderBy(asc(workflowHistory.createdAt));

    return results as any[];
  }

  public async listHistory(organizationId: string): Promise<any[]> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const results = await db
      .select({
        id: workflowHistory.id,
        workflowInstanceId: workflowHistory.workflowInstanceId,
        workflowName: workflowInstances.name,
        action: workflowHistory.action,
        actorId: workflowHistory.actorId,
        stepIndex: workflowHistory.stepIndex,
        comments: workflowHistory.comments,
        createdAt: workflowHistory.createdAt,
      })
      .from(workflowHistory)
      .innerJoin(
        workflowInstances,
        eq(workflowHistory.workflowInstanceId, workflowInstances.id)
      )
      .where(eq(workflowInstances.organizationId, organizationId))
      .orderBy(desc(workflowHistory.createdAt));

    return results;
  }

  // --- Metrics ---
  public async createMetrics(
    metrics: Omit<IWorkflowMetrics, "id" | "createdAt">
  ): Promise<IWorkflowMetrics> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const [inserted] = await db
      .insert(workflowMetrics)
      .values({
        workflowInstanceId: metrics.workflowInstanceId,
        executionDurationMs: metrics.executionDurationMs,
        approvalLatencyMs: metrics.approvalLatencyMs,
        escalationCount: metrics.escalationCount,
        timeoutCount: metrics.timeoutCount,
      })
      .returning();

    return inserted as any;
  }

  public async getMetrics(instanceId: number): Promise<IWorkflowMetrics | null> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const results = await db
      .select()
      .from(workflowMetrics)
      .where(eq(workflowMetrics.workflowInstanceId, instanceId))
      .limit(1);

    return results[0] as any || null;
  }

  public async updateMetrics(
    instanceId: number,
    updates: Partial<IWorkflowMetrics>
  ): Promise<IWorkflowMetrics> {
    await this.ensureWorkflowTables();
    const db = getDb();
    const [updated] = await db
      .update(workflowMetrics)
      .set(updates)
      .where(eq(workflowMetrics.workflowInstanceId, instanceId))
      .returning();

    return updated as any;
  }
}

export const workflowRepository = new WorkflowRepository();
