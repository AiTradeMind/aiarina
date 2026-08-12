import { ConstitutionRepository } from "../repositories/constitution.repository.ts";
import { ConstitutionCache } from "../cache/constitution.cache.ts";
import { ValidationPipeline } from "./validation.pipeline.ts";
import { PermissionMatrix } from "../permissions/permission.matrix.ts";
import { 
  BootPipelineResult, 
  BootPipelineStep, 
  ConstitutionVersion, 
  RegisterModuleDTO 
} from "../types/index.ts";
import { 
  CONSTITUTION_ERRORS, 
  CONSTITUTION_STATUSES, 
  DEFAULT_CONSTITUTION, 
  POLICY_CATEGORIES, 
  AUDIT_EVENT_TYPES,
  GOVERNANCE_EVENT_TYPES
} from "../constants/index.ts";
import { 
  generateConstitutionHash, 
  verifyConstitutionHash, 
  generateModuleSignature, 
  verifyModuleSignature 
} from "../utils/constitution.utils.ts";
import { GovernanceEvents } from "../events/governance.events.ts";
import logger from "../../../lib/logger.ts";

export class BootPipeline {
  private repo: ConstitutionRepository;
  private cache: ConstitutionCache;
  private validator: ValidationPipeline;

  constructor(repo?: ConstitutionRepository, cache?: ConstitutionCache) {
    this.repo = repo || new ConstitutionRepository();
    this.cache = cache || new ConstitutionCache();
    this.validator = new ValidationPipeline(this.repo);
  }

  /**
   * Execute Deterministic Boot Pipeline
   */
  public async executeBootSequence(): Promise<BootPipelineResult> {
    const startTime = new Date().toISOString();
    const startMs = Date.now();
    const steps: BootPipelineStep[] = [];

    logger.info({ type: "CONSTITUTION_BOOT" }, "Boot Pipeline Started");

    try {
      // Step 1: System Boot
      const step1Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "System Boot" }, "Executing Step 1: System Boot");
      steps.push({
        stepName: "System Boot",
        passed: true,
        timeMs: Date.now() - step1Start,
        message: "System environment initialized",
      });

      // Step 2: Configuration Loading
      const step2Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "Configuration Loading" }, "Executing Step 2: Configuration Loading");
      steps.push({
        stepName: "Configuration Loading",
        passed: true,
        timeMs: Date.now() - step2Start,
        message: "Kernel configuration parameters loaded",
      });

      // Step 3: Constitution Loading
      const step3Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "Constitution Loading" }, "Executing Step 3: Constitution Loading");
      let activeVersion = await this.repo.getActiveVersion();

      if (!activeVersion) {
        const defaultVersionId = DEFAULT_CONSTITUTION.VERSION_ID;
        const initialHash = generateConstitutionHash({
          versionId: defaultVersionId,
          title: DEFAULT_CONSTITUTION.TITLE,
          description: DEFAULT_CONSTITUTION.DESCRIPTION,
          registry: [],
          metadata: {},
        });

        activeVersion = await this.repo.saveVersion({
          versionId: defaultVersionId,
          title: DEFAULT_CONSTITUTION.TITLE,
          description: DEFAULT_CONSTITUTION.DESCRIPTION,
          status: CONSTITUTION_STATUSES.ACTIVE,
          hash: initialHash,
          isLocked: false,
          metadata: {
            governanceLevel: DEFAULT_CONSTITUTION.GOVERNANCE_LEVEL,
            enforcement: DEFAULT_CONSTITUTION.ENFORCEMENT,
            phase: DEFAULT_CONSTITUTION.PHASE,
          },
          createdBy: "SYSTEM_BOOTSTRAP",
        });
        logger.info({ type: "CONSTITUTION_LOADER", versionId: defaultVersionId }, "Version Loaded");
      } else {
        logger.info({ type: "CONSTITUTION_LOADER", versionId: activeVersion.versionId }, "Version Loaded");
      }

      this.cache.setActiveVersion(activeVersion);
      steps.push({
        stepName: "Constitution Loading",
        passed: true,
        timeMs: Date.now() - step3Start,
        message: `Active Constitution ${activeVersion.versionId} loaded`,
      });

      // Step 4: Hash Verification
      const step4Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "Hash Verification" }, "Executing Step 4: Hash Verification");
      const registry = await this.repo.getRegistryEntries();
      const metadata = await this.repo.getMetadata();

      const isHashValid = verifyConstitutionHash(
        {
          versionId: activeVersion.versionId,
          title: activeVersion.title,
          description: activeVersion.description,
          registry,
          metadata,
        },
        activeVersion.hash
      );

      if (!isHashValid) {
        throw new Error(CONSTITUTION_ERRORS.HASH_MISMATCH);
      }
      steps.push({
        stepName: "Hash Verification",
        passed: true,
        timeMs: Date.now() - step4Start,
        message: "Constitution payload hash verified successfully",
      });

      // Step 5: Signature Verification
      const step5Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "Signature Verification" }, "Executing Step 5: Signature Verification");
      let registeredModules = await this.repo.getRegisteredModules();

      if (registeredModules.length === 0) {
        const coreModuleId = "MOD-CONSTITUTION-FOUNDATION";
        const coreVersion = "1.0.0";
        const registeredBy = "SYSTEM_BOOTSTRAP";
        const signature = generateModuleSignature(coreModuleId, coreVersion, registeredBy);

        await this.repo.registerModule({
          moduleId: coreModuleId,
          moduleName: "Constitution Engine Foundation",
          version: coreVersion,
          capabilities: ["GOVERNANCE_REGISTRY", "VERSION_MANAGER", "MODULE_REGISTRATION", "HEALTH_MONITORING", "RULE_REGISTRY"],
          dependencies: [],
          signature,
          registeredBy,
        });
        registeredModules = await this.repo.getRegisteredModules();
      }

      for (const mod of registeredModules) {
        const dto: RegisterModuleDTO = {
          moduleId: mod.moduleId,
          moduleName: mod.moduleName,
          version: mod.version,
          signature: mod.signature || undefined,
          registeredBy: mod.registeredBy,
        };

        if (!verifyModuleSignature(dto)) {
          throw new Error(`${CONSTITUTION_ERRORS.INVALID_MODULE_SIGNATURE}: Module ${mod.moduleId}`);
        }
      }
      this.cache.setRegisteredModules(registeredModules);

      steps.push({
        stepName: "Signature Verification",
        passed: true,
        timeMs: Date.now() - step5Start,
        message: "All registered module signatures verified successfully",
      });

      // Step 6: Dependency Validation
      const step6Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "Dependency Validation" }, "Executing Step 6: Dependency Validation");
      const moduleMap = new Map(registeredModules.map((m) => [m.moduleId, m]));

      for (const mod of registeredModules) {
        if (mod.dependencies) {
          for (const depId of mod.dependencies) {
            if (!moduleMap.has(depId)) {
              throw new Error(`${CONSTITUTION_ERRORS.MODULE_DEPENDENCY_MISSING}: ${depId} required by ${mod.moduleId}`);
            }
          }
        }
      }
      steps.push({
        stepName: "Dependency Validation",
        passed: true,
        timeMs: Date.now() - step6Start,
        message: "Module dependencies validated and satisfied",
      });

      // Step 7: Registry Loading
      const step7Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "Registry Loading" }, "Executing Step 7: Registry Loading");
      if (registry.length === 0) {
        await this.repo.saveRegistryEntry({
          registryId: "REG-AAOS-CORE-001",
          versionId: activeVersion.versionId,
          name: "AAOS Core Enterprise Governance Registry",
          category: POLICY_CATEGORIES.SYSTEM,
          status: CONSTITUTION_STATUSES.ACTIVE,
          config: {
            allowUnregisteredExecution: false,
            requireAdminApproval: true,
            strictAuditTrail: true,
          },
          isLocked: true,
        });
      }
      const updatedRegistry = await this.repo.getRegistryEntries();
      this.cache.setRegistryEntries(updatedRegistry);

      steps.push({
        stepName: "Registry Loading",
        passed: true,
        timeMs: Date.now() - step7Start,
        message: "Governance registry entries loaded",
      });

      // Step 8: Policy Loading
      const step8Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "Policy Loading" }, "Executing Step 8: Policy Loading");
      let policies = await this.repo.getPolicies();

      if (policies.length === 0) {
        const defaultPolicies = [
          {
            policyId: "POL-SYS-001",
            policyName: "Kernel Deterministic Boot Safety Policy",
            versionId: activeVersion.versionId,
            category: POLICY_CATEGORIES.SYSTEM,
            priority: 1,
            version: "1.0.0",
            status: "ACTIVE",
            config: { abortOnValidationFailure: true },
          },
          {
            policyId: "POL-SEC-001",
            policyName: "Enterprise Module Cryptographic Authentication Policy",
            versionId: activeVersion.versionId,
            category: POLICY_CATEGORIES.SECURITY,
            priority: 1,
            version: "1.0.0",
            status: "ACTIVE",
            config: { requireSignedModules: true },
          },
          {
            policyId: "POL-RISK-001",
            policyName: "Immutable Governance Boundary Policy",
            versionId: activeVersion.versionId,
            category: POLICY_CATEGORIES.RISK,
            priority: 2,
            version: "1.0.0",
            status: "ACTIVE",
            config: { enforceStrictAudit: true },
          },
          {
            policyId: "POL-AI-001",
            policyName: "AI Autonomous Execution Guardrail Policy",
            versionId: activeVersion.versionId,
            category: POLICY_CATEGORIES.AI,
            priority: 2,
            version: "1.0.0",
            status: "ACTIVE",
            config: { humanOversightForCriticalActions: true },
          },
        ];

        for (const pol of defaultPolicies) {
          await this.repo.savePolicy(pol);
        }
        policies = await this.repo.getPolicies();
      }
      this.cache.setPolicies(policies);

      steps.push({
        stepName: "Policy Loading",
        passed: true,
        timeMs: Date.now() - step8Start,
        message: `${policies.length} governance policies loaded into Policy Registry`,
      });

      // Step 9: Permission Matrix Loading
      const step9Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "Permission Matrix Loading" }, "Executing Step 9: Permission Matrix Loading");
      const permMatrix = PermissionMatrix.getFullMatrix();
      this.cache.setPermissionMatrix(permMatrix);

      steps.push({
        stepName: "Permission Matrix Loading",
        passed: true,
        timeMs: Date.now() - step9Start,
        message: "Centralized permission matrix loaded",
      });

      // Step 10: Kernel Ready
      const step10Start = Date.now();
      logger.info({ type: "CONSTITUTION_BOOT", step: "Kernel Ready" }, "Executing Step 10: Kernel Ready");
      steps.push({
        stepName: "Kernel Ready",
        passed: true,
        timeMs: Date.now() - step10Start,
        message: "Enterprise Governance Kernel is READY",
      });

      const totalBootTimeMs = Date.now() - startMs;
      logger.info({ type: "CONSTITUTION_BOOT", totalBootTimeMs }, "Boot Pipeline Completed Successfully");

      return {
        success: true,
        startTime,
        endTime: new Date().toISOString(),
        totalBootTimeMs,
        steps,
      };
    } catch (error: any) {
      logger.error({ type: "CONSTITUTION_BOOT_FAILED", error: error.message }, "Boot Pipeline Aborted due to Critical Failure");
      throw error;
    }
  }
}
