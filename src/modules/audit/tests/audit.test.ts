import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { sql } from "drizzle-orm";
import { auditEngine } from "../services/AuditEngine.ts";
import { timelineService } from "../services/TimelineService.ts";
import { auditRepository } from "../repositories/AuditRepository.ts";
import { auditService } from "../services/AuditService.ts";

describe("Enterprise Audit Center Engine", () => {
  const orgId = "org_test_audit_1";
  const workspaceId = "wks_test_audit_1";
  const actorId = 999;

  beforeAll(async () => {
    const db = getDb();
    await auditRepository.ensureAuditTables();
    await db.execute(sql`
      INSERT INTO organizations (id, name, description)
      VALUES (${orgId}, 'Test Audit Org', 'Test Org')
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // Clear out any old test records
    await db.execute(sql`DELETE FROM audit_records WHERE organization_id = ${orgId}`);
    await db.execute(sql`DELETE FROM audit_metrics WHERE organization_id = ${orgId}`);
  });

  afterAll(async () => {
    const db = getDb();
    await db.execute(sql`DELETE FROM audit_records WHERE organization_id = ${orgId}`);
    await db.execute(sql`DELETE FROM audit_metrics WHERE organization_id = ${orgId}`);
  });

  it("should securely log an immutable audit event", async () => {
    const record = await auditEngine.logEvent({
      organizationId: orgId,
      workspaceId,
      actorId,
      action: "DOCUMENT_READ",
      sourceModule: "RESEARCH",
      severity: "INFO",
      resourceType: "DOCUMENT",
      resourceId: "doc_1",
      details: { page: 1 }
    });

    expect(record.id).toBeDefined();
    expect(record.hash).toBeDefined();
    expect(record.action).toBe("DOCUMENT_READ");
    
    // Check that timeline entries were created
    const userTimeline = await timelineService.getTimeline("USER", actorId.toString());
    expect(userTimeline.length).toBeGreaterThan(0);
    expect(userTimeline[0].id).toBe(record.id);
  });

  it("should chain multiple events together with previousHash and verify correctly", async () => {
    const record1 = await auditEngine.logEvent({
      organizationId: orgId,
      action: "LOGIN",
      sourceModule: "AUTH",
    });

    const record2 = await auditEngine.logEvent({
      organizationId: orgId,
      action: "VIEW_DASHBOARD",
      sourceModule: "CORE",
    });

    expect(record2.previousHash).toBe(record1.hash);

    const integrity = await auditEngine.verifyIntegrity(orgId);
    expect(integrity.valid).toBe(true);
  });

  it("should catch tampering when a record's data is modified", async () => {
    // Generate a new record
    const record = await auditEngine.logEvent({
      organizationId: orgId,
      action: "SENSITIVE_OP",
      sourceModule: "RBAC",
    });

    // Manually tamper with the record in the database
    const db = getDb();
    await db.execute(sql`
      UPDATE audit_records 
      SET action = 'TAMPERED_OP' 
      WHERE id = ${record.id}
    `);

    // Verify integrity should now fail
    const integrity = await auditEngine.verifyIntegrity(orgId);
    expect(integrity.valid).toBe(false);
  });

  it("should allow searching with filters", async () => {
    await auditEngine.logEvent({
      organizationId: orgId,
      action: "SEARCH_TEST",
      sourceModule: "CORE",
      severity: "CRITICAL"
    });

    const results = await auditService.searchRecords({
      organizationId: orgId,
      severity: "CRITICAL"
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].severity).toBe("CRITICAL");
  });

  it("should allow requesting an export", async () => {
    const exportReq = await auditService.requestExport(orgId, actorId, { severity: "INFO" }, "CSV");
    expect(exportReq.id).toBeDefined();
    expect(exportReq.status).toBe("PENDING");
    expect(exportReq.format).toBe("CSV");
  });
});
