import { randomUUID } from "crypto";
import { auditRepository } from "../repositories/AuditRepository.ts";
import { auditValidator } from "./AuditValidator.ts";
import { timelineService } from "./TimelineService.ts";
import { CreateAuditRecordPayload, IAuditRecord } from "../types/index.ts";

export class AuditEngine {
  /**
   * Records a new audit event. Enforces immutability and chain integrity.
   */
  public async logEvent(payload: CreateAuditRecordPayload): Promise<IAuditRecord> {
    auditValidator.validatePayload(payload);

    // Get previous hash for the organization to maintain the integrity chain
    const latestRecord = await auditRepository.getLatestRecord(payload.organizationId);
    const previousHash = latestRecord ? latestRecord.hash : null;

    const recordId = `adt_${randomUUID().replace(/-/g, "")}`;
    const createdAt = new Date();

    const recordData: Omit<IAuditRecord, "hash" | "createdAt"> = {
      id: recordId,
      organizationId: payload.organizationId,
      workspaceId: payload.workspaceId || null,
      actorId: payload.actorId || null,
      action: payload.action,
      sourceModule: payload.sourceModule,
      resourceType: payload.resourceType || null,
      resourceId: payload.resourceId || null,
      correlationId: payload.correlationId || null,
      workflowId: payload.workflowId || null,
      severity: payload.severity || "INFO",
      details: payload.details || {},
      ipAddress: payload.ipAddress || null,
      userAgent: payload.userAgent || null,
      previousHash,
    };

    const hash = auditValidator.generateHash(recordData);

    const fullRecord: IAuditRecord = {
      ...recordData,
      hash,
      createdAt,
    };

    // 1. Persist the immutable record
    await auditRepository.createRecord(fullRecord);

    // 2. Build multi-dimensional timelines
    await timelineService.buildTimelineEntries(fullRecord);

    return fullRecord;
  }

  /**
   * Verifies the integrity of the audit log chain for an organization.
   */
  public async verifyIntegrity(organizationId: string): Promise<{ valid: boolean; lastVerifiedRecordId: string | null; message: string }> {
    const records = await auditRepository.getRecordsSince(organizationId, null);
    
    if (records.length === 0) {
      await auditRepository.saveIntegrityCheck(organizationId, null, "VALID");
      return { valid: true, lastVerifiedRecordId: null, message: "No records to verify." };
    }

    const isValid = auditValidator.verifyChain(records);
    const status = isValid ? "VALID" : "COMPROMISED";
    const lastRecordId = records[records.length - 1].id;

    await auditRepository.saveIntegrityCheck(organizationId, lastRecordId, status);

    return {
      valid: isValid,
      lastVerifiedRecordId: lastRecordId,
      message: isValid ? "Audit chain integrity verified successfully." : "Audit chain integrity verification FAILED. Chain is compromised.",
    };
  }
}

export const auditEngine = new AuditEngine();
