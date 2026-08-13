import { auditEngine } from "./services/AuditEngine.ts";
import { timelineService } from "./services/TimelineService.ts";
import { auditRepository } from "./repositories/AuditRepository.ts";
import { getDb } from "../../db/client.ts";
import { sql } from "drizzle-orm";
import { auditValidator } from "./services/AuditValidator.ts";

async function runVerification() {
  console.log("================================================================");
  console.log("STARTING AI ARINA ENTERPRISE AUDIT CENTER VERIFICATION");
  console.log("================================================================");

  try {
    const db = getDb();
    const orgId = "org_audit_dev";
    const wksId = "wks_audit_dev";
    const testUserId = 200;

    // 1. Initialize Tables
    console.log("Step 1: Dynamically ensuring audit tables exist...");
    await auditRepository.ensureAuditTables();
    console.log("✓ All tables initialized!");

    // 2. Setup Seed Data
    console.log("Step 2: Seeding test environment...");
    await db.execute(sql`
      INSERT INTO organizations (id, name, description)
      VALUES (${orgId}, 'Audit Dev Org', 'Organization for audit testing')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Log Immutable Events
    console.log("\nStep 3: Logging immutable events across multiple sources...");
    
    const record1 = await auditEngine.logEvent({
      organizationId: orgId,
      workspaceId: wksId,
      actorId: testUserId,
      action: "USER_LOGIN",
      sourceModule: "AUTHENTICATION",
      severity: "INFO",
      details: { ip: "192.168.1.1", method: "PASSWORD" }
    });
    console.log(`✓ Logged USER_LOGIN event: ${record1.id} (Hash: ${record1.hash})`);

    const record2 = await auditEngine.logEvent({
      organizationId: orgId,
      workspaceId: wksId,
      actorId: testUserId,
      action: "ROLE_ASSIGNED",
      sourceModule: "RBAC",
      resourceType: "ROLE",
      resourceId: "ORG_ADMIN",
      severity: "WARNING",
      details: { assignedTo: testUserId }
    });
    console.log(`✓ Logged ROLE_ASSIGNED event: ${record2.id} (Hash: ${record2.hash})`);

    const record3 = await auditEngine.logEvent({
      organizationId: orgId,
      workspaceId: wksId,
      actorId: testUserId,
      action: "WORKFLOW_APPROVED",
      sourceModule: "WORKFLOW",
      resourceType: "WORKFLOW_INSTANCE",
      resourceId: "wfi_99",
      workflowId: 99,
      severity: "INFO",
      details: { step: "Executive Sign-Off", decision: "APPROVED" }
    });
    console.log(`✓ Logged WORKFLOW_APPROVED event: ${record3.id} (Hash: ${record3.hash})`);

    // 4. Verify Integrity Chain
    console.log("\nStep 4: Verifying Audit Integrity Chain...");
    const integrityCheck = await auditEngine.verifyIntegrity(orgId);
    if (integrityCheck.valid) {
      console.log(`✓ Integrity Verification Passed: ${integrityCheck.message}`);
    } else {
      console.error(`❌ Integrity Verification Failed: ${integrityCheck.message}`);
      process.exit(1);
    }

    // 5. Check Timelines
    console.log("\nStep 5: Verifying Multi-Dimensional Timelines...");
    
    // Global Timeline
    const globalTimeline = await timelineService.getTimeline("GLOBAL", "GLOBAL", 10);
    console.log(`✓ Found ${globalTimeline.length} events in Global Timeline (System-wide)`);
    
    // Org Timeline
    const orgTimeline = await timelineService.getTimeline("ORG", orgId, 10);
    console.log(`✓ Found ${orgTimeline.length} events in Organization Timeline (${orgId})`);

    // User Timeline
    const userTimeline = await timelineService.getTimeline("USER", testUserId.toString(), 10);
    console.log(`✓ Found ${userTimeline.length} events in User Timeline (Actor ID: ${testUserId})`);

    // Resource Timeline
    const resourceTimeline = await timelineService.getTimeline("RESOURCE", "WORKFLOW_INSTANCE:wfi_99", 10);
    console.log(`✓ Found ${resourceTimeline.length} events in Resource Timeline (WORKFLOW_INSTANCE:wfi_99)`);

    // 6. Test Search Capabilities
    console.log("\nStep 6: Testing Audit Search capabilities...");
    const searchResults = await auditRepository.searchRecords({
      organizationId: orgId,
      severity: "WARNING"
    });
    console.log(`✓ Search for WARNING severity returned ${searchResults.length} records.`);
    
    // 7. Verify Metrics
    console.log("\nStep 7: Check Audit Search Metrics...");
    const metrics: any = await getDb().execute(sql`SELECT * FROM audit_metrics WHERE organization_id = ${orgId}`);
    const metricsRows = metrics.rows || metrics; // Support both node-postgres and postgres-js
    if (metricsRows.length > 0) {
      console.log(`✓ Audit Metrics successfully recorded search volume: ${metricsRows[0].search_volume}`);
    } else {
      console.log("  ⚠️ Audit metrics not found!");
    }

    // 8. Test Data Tampering Detection
    console.log("\nStep 8: Simulating Data Tampering & Catching Compromise...");
    // Force direct DB change to bypass immutability engine
    await getDb().execute(sql`
      UPDATE audit_records 
      SET details = '{"hacked": true}'::jsonb 
      WHERE id = ${record2.id}
    `);
    
    const tamperCheck = await auditEngine.verifyIntegrity(orgId);
    if (!tamperCheck.valid) {
      console.log(`✓ SUCCESS! Integrity check CAUGHT the tampering attempt: ${tamperCheck.message}`);
    } else {
      console.error(`❌ FAILED to detect tampering! Check hashing logic.`);
      process.exit(1);
    }

    console.log("\n================================================================");
    console.log("AI ARINA ENTERPRISE AUDIT CENTER VERIFICATION SUCCESSFULLY COMPLETE!");
    console.log("================================================================");
    process.exit(0);

  } catch (err: any) {
    console.error("\n❌ Verification Failed with Error:", err);
    process.exit(1);
  }
}

runVerification();
