import { ConstitutionService } from "../services/constitution.service.ts";

/**
 * Extended Health & Diagnostic Tests for Enterprise Governance Kernel
 */
export async function runConstitutionHealthTests(): Promise<{ passed: boolean; results: string[] }> {
  const results: string[] = [];
  let passed = true;

  try {
    const service = new ConstitutionService();
    await service.startEngine();

    const health = await service.getHealth();

    if (health.status === "HEALTHY" || health.status === "DEGRADED") {
      results.push(`[PASS] Constitution Health Check status: ${health.status}`);
    } else {
      passed = false;
      results.push(`[FAIL] Constitution Health Check returned UNHEALTHY status`);
    }

    if (health.kernelLifecycle && health.kernelLifecycle.currentState) {
      results.push(`[PASS] Health Check Kernel Lifecycle currentState: ${health.kernelLifecycle.currentState}`);
    } else {
      passed = false;
      results.push("[FAIL] Health Check missing kernelLifecycle");
    }

    if (health.policyRegistryStatus && typeof health.policyRegistryStatus.policyCount === "number") {
      results.push(`[PASS] Health Check Policy Registry policyCount: ${health.policyRegistryStatus.policyCount}`);
    } else {
      passed = false;
      results.push("[FAIL] Health Check missing policyRegistryStatus");
    }

    if (health.permissionMatrixStatus && health.permissionMatrixStatus.matrixLoaded) {
      results.push(`[PASS] Health Check Permission Matrix loaded with ${health.permissionMatrixStatus.rolesCount} roles`);
    } else {
      passed = false;
      results.push("[FAIL] Health Check missing permissionMatrixStatus");
    }

    if (health.validationPipelineStatus && typeof health.validationPipelineStatus.totalTimeMs === "number") {
      results.push(`[PASS] Health Check Validation Pipeline executed ${health.validationPipelineStatus.phases.length} phases`);
    } else {
      passed = false;
      results.push("[FAIL] Health Check missing validationPipelineStatus");
    }

    if (health.cacheStatus) {
      results.push(`[PASS] Health Check Granular Cache active: ${health.cacheStatus.isVersionCached}`);
    } else {
      passed = false;
      results.push("[FAIL] Health Check missing cacheStatus");
    }

    if (health.versionCompatibility && health.versionCompatibility.minimumVersion) {
      results.push(`[PASS] Health Check Version Compatibility min: ${health.versionCompatibility.minimumVersion}, max: ${health.versionCompatibility.maximumVersion}`);
    } else {
      passed = false;
      results.push("[FAIL] Health Check missing versionCompatibility");
    }

    if (health.checks.database && health.checks.policiesLoaded && health.checks.permissionsLoaded) {
      results.push("[PASS] Constitution Health Check: All enterprise health checks passed");
    } else {
      passed = false;
      results.push("[FAIL] Constitution Health Check: Enterprise checks failed");
    }

  } catch (error: any) {
    passed = false;
    results.push(`[ERROR] Health test exception: ${error.message}`);
  }

  return { passed, results };
}
