import { workflowEngine } from "./services/WorkflowEngine.ts";
import { workflowService } from "./services/WorkflowService.ts";
import { approvalEngine } from "./services/ApprovalEngine.ts";
import { approvalService } from "./services/ApprovalService.ts";
import { workflowRepository } from "./repositories/WorkflowRepository.ts";
import { permissionService } from "../rbac/services/PermissionService.ts";
import { eventService } from "../notifications/services/EventService.ts";
import { getDb } from "../../db/client.ts";
import { sql } from "drizzle-orm";

async function runVerification() {
  console.log("================================================================");
  console.log("STARTING AI ARINA WORKFLOW & APPROVAL ENGINE VERIFICATION");
  console.log("================================================================");

  try {
    const db = getDb();
    const orgId = "org_dev_123";
    const wksId = "wks_dev_123";
    const testUserId = 1;

    // 1. Initialize Tables
    console.log("Step 1: Dynamically ensuring workflow and RBAC tables exist...");
    await workflowRepository.ensureWorkflowTables();
    await (permissionService as any).permissionRepo.ensureRbacTables();
    console.log("✓ All tables initialized!");

    // 2. Setup user and seed organizations & workspaces
    console.log("Step 2: Seeding test environment (users, organizations, workspaces)...");
    
    // Ensure user 1 exists
    await db.execute(sql`
      INSERT INTO users (id, email, role, settings)
      VALUES (1, 'developer@aiarena.local', 'admin', '{}'::jsonb)
      ON CONFLICT (id) DO UPDATE SET email = 'developer@aiarena.local', role = 'admin';
    `);

    // Ensure organization org_dev_123 exists
    await db.execute(sql`
      INSERT INTO organizations (id, name, description)
      VALUES ('org_dev_123', 'AAOS Development Org', 'Primary development tenant')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Assign roles to the test user so cross-tenant and RBAC boundaries are clean
    await permissionService.assignRoleToUser(testUserId, "ORG_ADMIN", orgId, wksId);
    await permissionService.assignRoleToUser(testUserId, "SYSTEM_OWNER", orgId, wksId);
    console.log("✓ Assigned role ORG_ADMIN and SYSTEM_OWNER to User #1.");

    // Ensure the test user has a GOVERNANCE subscription so dispatch completes smoothly
    try {
      await eventService.subscribe(testUserId, "GOVERNANCE", "LOW", wksId, orgId);
      console.log("✓ User #1 subscribed to GOVERNANCE event stream.");
    } catch (subErr: any) {
      console.log(`ℹ️ Subscription note: ${subErr.message}`);
    }

    // 3. Create Workflow Template
    console.log("\nStep 3: Registering a Multi-Level Sequential Workflow Template...");
    const template = await workflowService.createTemplate({
      name: "Strategic Document Release Approval",
      type: "SEQUENTIAL",
      sourceModule: "RESEARCH",
      organizationId: orgId,
      workspaceId: wksId,
      steps: [
        {
          name: "Peer Editorial Review",
          requiredRole: "ORG_ADMIN",
        },
        {
          name: "Executive Publication Approval",
          requiredRole: "SYSTEM_OWNER",
        }
      ]
    });
    console.log(`✓ Template created successfully: ID #${template.id} - ${template.name}`);

    // 4. Start Workflow Instance from Template
    console.log("\nStep 4: Triggering/Starting Workflow Instance from Template...");
    const instance = await workflowEngine.startWorkflow(testUserId, {
      templateId: template.id,
      name: "Q3 Research Synthesis Publication Proposal",
      type: "SEQUENTIAL",
      sourceModule: "RESEARCH",
      organizationId: orgId,
      workspaceId: wksId,
    });
    console.log(`✓ Workflow instance started: ID #${instance.id} - Status: ${instance.status}`);

    // 5. Verify Active Steps
    let steps = await workflowRepository.getStepsForInstance(instance.id);
    console.log(`✓ Initial Steps fetched: ${steps.length} steps defined.`);
    steps.forEach(s => {
      console.log(`  - Step Index ${s.stepIndex}: '${s.name}' | Status: ${s.status} | Required Role: ${s.requiredRole}`);
    });

    // 6. Approve First Step
    console.log("\nStep 6: Processing Peer Editorial Review (Step index 0)...");
    const updatedAfterStep0 = await approvalEngine.processDecision(
      testUserId,
      orgId,
      instance.id,
      "APPROVED",
      "Draft looks exceptionally thorough and aligned with strategic objectives."
    );
    console.log(`✓ Step 0 Approved! Current Step Index is now: ${updatedAfterStep0.currentStepIndex}`);

    // Verify current status of steps
    steps = await workflowRepository.getStepsForInstance(instance.id);
    steps.forEach(s => {
      console.log(`  - Step Index ${s.stepIndex}: '${s.name}' | Status: ${s.status}`);
    });

    // 7. Approve Second Step (Completing the Workflow)
    console.log("\nStep 7: Processing Executive Publication Approval (Step index 1)...");
    const updatedAfterStep1 = await approvalEngine.processDecision(
      testUserId,
      orgId,
      instance.id,
      "APPROVED",
      "Executive sign-off complete. Ready for distribution."
    );
    console.log(`✓ Step 1 Approved! Workflow Instance Status: ${updatedAfterStep1.status}`);

    // Verify History
    console.log("\nStep 8: Checking process audit trail logs...");
    const history = await workflowService.getHistory(instance.id);
    history.forEach((h, index) => {
      console.log(`  [Audit #${index + 1}] Action: ${h.action} | Actor ID: ${h.actorId} | Comments: ${h.comments}`);
    });

    // Verify Metrics
    console.log("\nStep 9: Checking process operational performance metrics...");
    const metrics = await workflowService.getMetrics(instance.id);
    if (metrics) {
      console.log(`  - Execution Duration: ${metrics.executionDurationMs} ms`);
      console.log(`  - Escalations: ${metrics.escalationCount}`);
      console.log(`  - Timeouts: ${metrics.timeoutCount}`);
    } else {
      console.log("  ⚠️ Metrics record not found!");
    }

    console.log("\n================================================================");
    console.log("AI ARINA WORKFLOW & APPROVAL ENGINE VERIFICATION SUCCESSFULLY COMPLETE!");
    console.log("================================================================");
    process.exit(0);

  } catch (err: any) {
    console.error("\n❌ Verification Failed with Error:", err);
    process.exit(1);
  }
}

runVerification();
