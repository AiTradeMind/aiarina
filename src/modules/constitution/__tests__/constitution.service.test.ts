import { ConstitutionService } from "../services/constitution.service.ts";
import { RegisterModuleDTO } from "../types/index.ts";
import { generateModuleSignature } from "../utils/constitution.utils.ts";
import { KERNEL_LIFECYCLE_STATES, EMERGENCY_MODES, POLICY_CATEGORIES } from "../constants/index.ts";

/**
 * Unit & Service Tests for ConstitutionService
 */
export async function runConstitutionServiceTests(): Promise<{ passed: boolean; results: string[] }> {
  const results: string[] = [];
  let passed = true;

  try {
    const service = new ConstitutionService();

    // Test 1: Start Engine & Boot Pipeline & Startup Validation
    await service.startEngine();
    results.push("[PASS] ConstitutionService.startEngine completed Boot Pipeline and Startup Validation successfully");

    // Test 2: Lifecycle State Machine Transitions
    const health = await service.getHealth();
    if (health.kernelLifecycle.currentState === KERNEL_LIFECYCLE_STATES.READY) {
      results.push("[PASS] Kernel lifecycle state is READY post-boot");
    } else {
      passed = false;
      results.push(`[FAIL] Expected state READY, got ${health.kernelLifecycle.currentState}`);
    }

    // Test 3: Emergency Mode Manipulation
    service.setEmergencyMode(EMERGENCY_MODES.READ_ONLY, "TEST_ADMIN", "Testing emergency mode");
    if (service.getEmergencyMode() === EMERGENCY_MODES.READ_ONLY) {
      results.push("[PASS] setEmergencyMode correctly updated emergency mode to READ_ONLY");
    } else {
      passed = false;
      results.push("[FAIL] Emergency mode failed to update");
    }
    // Reset emergency mode
    service.setEmergencyMode(EMERGENCY_MODES.NONE, "TEST_ADMIN", "Resetting emergency mode");

    // Test 4: Register & Get Policy
    const pol = await service.registerPolicy({
      policyId: "POL-SERV-TEST-001",
      policyName: "Service Level Policy Test",
      category: POLICY_CATEGORIES.SECURITY,
      priority: 1,
    });
    if (pol && pol.policyId === "POL-SERV-TEST-001") {
      results.push("[PASS] registerPolicy created policy successfully");
    } else {
      passed = false;
      results.push("[FAIL] registerPolicy failed");
    }

    const policies = await service.getPolicies();
    if (policies.length > 0) {
      results.push(`[PASS] getPolicies returned ${policies.length} policies`);
    } else {
      passed = false;
      results.push("[FAIL] getPolicies returned empty list");
    }

    // Test 5: Get Constitution Summary with enriched metrics, policies, and permission matrix
    const summary = await service.getConstitution();
    if (
      summary.version && 
      summary.engineStatus === "ONLINE" && 
      summary.rules.length > 0 && 
      summary.policies.length > 0 &&
      summary.permissionMatrix &&
      summary.lifecycle &&
      summary.versionCompatibility
    ) {
      results.push(`[PASS] getConstitution returned valid summary with ${summary.policies.length} policies and permission matrix`);
    } else {
      passed = false;
      results.push("[FAIL] getConstitution summary incomplete");
    }

    // Test 6: Register Module with dependency and generated signature
    const moduleId = "MOD-SERVICE-TEST";
    const modVersion = "2.0.0";
    const regBy = "UNIT_TEST";
    const signature = generateModuleSignature(moduleId, modVersion, regBy);

    const dto: RegisterModuleDTO = {
      moduleId,
      moduleName: "Service Level Test Module",
      version: modVersion,
      capabilities: ["CAP_SERVICE_TEST"],
      dependencies: ["MOD-CONSTITUTION-FOUNDATION"],
      signature,
      registeredBy: regBy,
    };

    const regResult = await service.registerModule(dto);
    if (regResult.moduleId === "MOD-SERVICE-TEST" && regResult.signature) {
      results.push("[PASS] service.registerModule validated dependencies and signature successfully");
    } else {
      passed = false;
      results.push("[FAIL] service.registerModule failed");
    }

    // Test 7: Dependency Validation Failure
    try {
      await service.registerModule({
        moduleId: "MOD-INVALID-DEP",
        moduleName: "Invalid Dep Module",
        version: "1.0.0",
        dependencies: ["MOD-NON-EXISTENT-ID"],
      });
      passed = false;
      results.push("[FAIL] registerModule should have thrown dependency error");
    } catch (err: any) {
      results.push("[PASS] registerModule correctly rejected missing module dependency");
    }

    // Test 8: Lock Constitution and Lifecycle Transition
    const lockedVer = await service.lockConstitution(undefined, "TEST_ADMIN");
    if (lockedVer && lockedVer.isLocked) {
      results.push(`[PASS] lockConstitution successfully locked active version ${lockedVer.versionId}`);
    } else {
      passed = false;
      results.push("[FAIL] lockConstitution failed");
    }

  } catch (error: any) {
    passed = false;
    results.push(`[ERROR] Service test exception: ${error.message}`);
  }

  return { passed, results };
}
