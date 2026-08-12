import crypto from "crypto";
import { CreateAuditRecordPayload, IAuditRecord } from "../types/index.ts";

export class AuditValidator {
  public validatePayload(payload: CreateAuditRecordPayload): void {
    if (!payload.organizationId || payload.organizationId.trim() === "") {
      throw new Error("Validation Error: Audit record organizationId is required");
    }
    if (!payload.action || payload.action.trim() === "") {
      throw new Error("Validation Error: Audit record action is required");
    }
    if (!payload.sourceModule || payload.sourceModule.trim() === "") {
      throw new Error("Validation Error: Audit record sourceModule is required");
    }
  }

  public generateHash(recordData: Omit<IAuditRecord, "hash" | "createdAt">): string {
    const dataString = JSON.stringify({
      id: recordData.id,
      organizationId: recordData.organizationId,
      actorId: recordData.actorId,
      action: recordData.action,
      sourceModule: recordData.sourceModule,
      resourceType: recordData.resourceType,
      resourceId: recordData.resourceId,
      previousHash: recordData.previousHash,
      details: recordData.details,
    });
    return crypto.createHash("sha256").update(dataString).digest("hex");
  }

  public verifyChain(records: IAuditRecord[]): boolean {
    if (records.length === 0) return true;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const computedHash = this.generateHash(record);
      if (computedHash !== record.hash) {
        return false;
      }

      if (i > 0) {
        const previousRecord = records[i - 1];
        if (record.previousHash !== previousRecord.hash) {
          return false;
        }
      }
    }

    return true;
  }
}

export const auditValidator = new AuditValidator();
