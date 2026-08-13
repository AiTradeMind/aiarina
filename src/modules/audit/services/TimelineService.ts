import { auditRepository } from "../repositories/AuditRepository.ts";
import { IAuditRecord, IAuditTimeline } from "../types/index.ts";

export class TimelineService {
  /**
   * Generates necessary timeline association entries for an audit record.
   * This allows O(1) multi-dimensional timeline querying.
   */
  public async buildTimelineEntries(record: IAuditRecord): Promise<void> {
    const entries: Partial<IAuditTimeline>[] = [];

    // 1. Global Timeline
    entries.push({
      auditRecordId: record.id,
      organizationId: record.organizationId,
      workspaceId: record.workspaceId,
      timelineType: "GLOBAL",
      targetId: "GLOBAL",
    });

    // 2. Organization Timeline
    entries.push({
      auditRecordId: record.id,
      organizationId: record.organizationId,
      workspaceId: record.workspaceId,
      timelineType: "ORG",
      targetId: record.organizationId,
    });

    // 3. Workspace Timeline
    if (record.workspaceId) {
      entries.push({
        auditRecordId: record.id,
        organizationId: record.organizationId,
        workspaceId: record.workspaceId,
        timelineType: "WORKSPACE",
        targetId: record.workspaceId,
      });
    }

    // 4. User Timeline
    if (record.actorId) {
      entries.push({
        auditRecordId: record.id,
        organizationId: record.organizationId,
        workspaceId: record.workspaceId,
        timelineType: "USER",
        targetId: record.actorId.toString(),
      });
    }

    // 5. Resource Timeline
    if (record.resourceType && record.resourceId) {
      entries.push({
        auditRecordId: record.id,
        organizationId: record.organizationId,
        workspaceId: record.workspaceId,
        timelineType: "RESOURCE",
        targetId: `${record.resourceType}:${record.resourceId}`,
      });
    }

    // 6. Workflow Timeline
    if (record.workflowId) {
      entries.push({
        auditRecordId: record.id,
        organizationId: record.organizationId,
        workspaceId: record.workspaceId,
        timelineType: "WORKFLOW",
        targetId: record.workflowId.toString(),
      });
    }

    await auditRepository.createTimelineEntries(entries);
  }

  public async getTimeline(timelineType: string, targetId: string, limit?: number): Promise<IAuditRecord[]> {
    return await auditRepository.getTimeline(timelineType, targetId, limit);
  }
}

export const timelineService = new TimelineService();
