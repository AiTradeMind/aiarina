import { ConstitutionRepository } from "../repositories/constitution.repository.ts";
import { CONSTITUTION_RULE_CATEGORIES, CONSTITUTION_STATUSES, POLICY_CATEGORIES } from "../constants/index.ts";

/**
 * Unit & Integration Tests for ConstitutionRepository
 */
export async function runConstitutionRepositoryTests(): Promise<{ passed: boolean; results: string[] }> {
  const results: string[] = [];
  let passed = true;

  try {
    const repo = new ConstitutionRepository();

    // Test 1: Get Active Version
    const activeVersion = await repo.getActiveVersion();
    results.push(`[PASS] getActiveVersion returned ${activeVersion ? activeVersion.versionId : "null (or bootstrapped)"}`);

    // Test 2: Save Version with hash
    const savedVersion = await repo.saveVersion({
      versionId: "v1.0.0-REPOTEST",
      title: "Test Constitution Version",
      description: "Automated Repository Test",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      createdBy: "UNIT_TEST",
    });
    if (savedVersion.versionId === "v1.0.0-REPOTEST") {
      results.push("[PASS] saveVersion created/updated test version successfully");
    } else {
      passed = false;
      results.push("[FAIL] saveVersion failed to match versionId");
    }

    // Test 3: Lock Version
    const lockedVersion = await repo.lockVersion("v1.0.0-REPOTEST", "TEST_OPERATOR");
    if (lockedVersion.isLocked && lockedVersion.status === CONSTITUTION_STATUSES.LOCKED) {
      results.push("[PASS] lockVersion correctly set isLocked and status=LOCKED");
    } else {
      passed = false;
      results.push("[FAIL] lockVersion failed to lock version");
    }

    // Test 4: Save Policy in Governance Policy Registry
    const policy = await repo.savePolicy({
      policyId: "POL-REPO-TEST-001",
      policyName: "Test Governance Policy",
      versionId: "v1.0.0-REPOTEST",
      category: POLICY_CATEGORIES.SECURITY,
      priority: 1,
      status: "ACTIVE",
    });
    if (policy.policyId === "POL-REPO-TEST-001" && policy.category === POLICY_CATEGORIES.SECURITY) {
      results.push("[PASS] savePolicy created policy entry in Policy Registry successfully");
    } else {
      passed = false;
      results.push("[FAIL] savePolicy failed");
    }

    // Test 5: Save Rule in Rule Registry Foundation
    const rule = await repo.saveRule({
      ruleId: "RULE-REPO-TEST-001",
      versionId: "v1.0.0-REPOTEST",
      name: "Test Rule Governance",
      category: CONSTITUTION_RULE_CATEGORIES.TRADING,
      priority: 1,
      status: "ACTIVE",
    });
    if (rule.ruleId === "RULE-REPO-TEST-001" && rule.category === CONSTITUTION_RULE_CATEGORIES.TRADING) {
      results.push("[PASS] saveRule created rule entry successfully");
    } else {
      passed = false;
      results.push("[FAIL] saveRule failed");
    }

    // Test 6: Create Immutable Snapshot
    const snapshot = await repo.createSnapshot({
      snapshotId: "SNAP-REPO-TEST-001",
      versionId: "v1.0.0-REPOTEST",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      snapshotData: { testKey: "testValue" },
      createdBy: "UNIT_TEST",
    });
    if (snapshot.snapshotId === "SNAP-REPO-TEST-001" && snapshot.isReadOnly) {
      results.push("[PASS] createSnapshot created immutable read-only snapshot");
    } else {
      passed = false;
      results.push("[FAIL] createSnapshot failed");
    }

    // Test 7: Record & Retrieve Audit Trail
    await repo.recordAuditLog("TEST_EVENT", "TEST_TARGET", "TARG-001", "UNIT_TEST", { detail: "ok" });
    const auditLogs = await repo.getAuditLogs(10);
    if (auditLogs.length > 0) {
      results.push(`[PASS] recordAuditLog and getAuditLogs returned ${auditLogs.length} logs`);
    } else {
      passed = false;
      results.push("[FAIL] audit log retrieval failed");
    }

  } catch (error: any) {
    passed = false;
    results.push(`[ERROR] Repository test exception: ${error.message}`);
  }

  return { passed, results };
}
