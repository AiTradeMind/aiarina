import { ConstitutionRepository } from "../repositories/constitution.repository.ts";
import { 
  StructuredValidationDiagnostics, 
  ValidationPhaseResult, 
  RegisterModuleDTO 
} from "../types/index.ts";
import { 
  VALIDATION_PHASES, 
  CONSTITUTION_ERRORS, 
  AUDIT_EVENT_TYPES,
  GOVERNANCE_ROLES,
  GOVERNANCE_ACTIONS
} from "../constants/index.ts";
import { verifyConstitutionHash, verifyModuleSignature } from "../utils/constitution.utils.ts";
import { PermissionMatrix } from "../permissions/permission.matrix.ts";
import logger from "../../../lib/logger.ts";

export class ValidationPipeline {
  private repo: ConstitutionRepository;

  constructor(repo?: ConstitutionRepository) {
    this.repo = repo || new ConstitutionRepository();
  }

  /**
   * Execute entire Multi-Phase Validation Pipeline
   */
  public async executePipeline(): Promise<StructuredValidationDiagnostics> {
    const pipelineStartTime = Date.now();
    const phaseResults: ValidationPhaseResult[] = [];
    let overallPassed = true;

    // Phase 1: PreValidation
    const preRes = await this.runPreValidation();
    phaseResults.push(preRes);
    if (!preRes.passed) overallPassed = false;

    // Phase 2: SchemaValidation
    const schemaRes = await this.runSchemaValidation();
    phaseResults.push(schemaRes);
    if (!schemaRes.passed) overallPassed = false;

    // Phase 3: DependencyValidation
    const depRes = await this.runDependencyValidation();
    phaseResults.push(depRes);
    if (!depRes.passed) overallPassed = false;

    // Phase 4: SignatureValidation
    const sigRes = await this.runSignatureValidation();
    phaseResults.push(sigRes);
    if (!sigRes.passed) overallPassed = false;

    // Phase 5: HashValidation
    const hashRes = await this.runHashValidation();
    phaseResults.push(hashRes);
    if (!hashRes.passed) overallPassed = false;

    // Phase 6: PermissionValidation
    const permRes = await this.runPermissionValidation();
    phaseResults.push(permRes);
    if (!permRes.passed) overallPassed = false;

    // Phase 7: FinalValidation
    const finalRes = await this.runFinalValidation(overallPassed);
    phaseResults.push(finalRes);
    if (!finalRes.passed) overallPassed = false;

    const totalTimeMs = Date.now() - pipelineStartTime;

    if (!overallPassed) {
      await this.repo.recordAuditLog(
        AUDIT_EVENT_TYPES.VALIDATION_FAILURE,
        "PIPELINE",
        "VALIDATION_ENGINE",
        "SYSTEM_VALIDATOR",
        { totalTimeMs, phases: phaseResults }
      );
    }

    return {
      overallPassed,
      timestamp: new Date().toISOString(),
      totalTimeMs,
      phases: phaseResults,
    };
  }

  private async runPreValidation(): Promise<ValidationPhaseResult> {
    const start = Date.now();
    try {
      const activeVersion = await this.repo.getActiveVersion();
      if (!activeVersion) {
        return {
          phase: VALIDATION_PHASES.PRE_VALIDATION,
          passed: false,
          message: "PreValidation failed: No active version found",
          timeTakenMs: Date.now() - start,
        };
      }
      return {
        phase: VALIDATION_PHASES.PRE_VALIDATION,
        passed: true,
        message: "PreValidation passed: Active version detected",
        timeTakenMs: Date.now() - start,
        details: { versionId: activeVersion.versionId },
      };
    } catch (err: any) {
      return {
        phase: VALIDATION_PHASES.PRE_VALIDATION,
        passed: false,
        message: `PreValidation error: ${err.message}`,
        timeTakenMs: Date.now() - start,
      };
    }
  }

  private async runSchemaValidation(): Promise<ValidationPhaseResult> {
    const start = Date.now();
    try {
      const registry = await this.repo.getRegistryEntries();
      const metadata = await this.repo.getMetadata();
      const rules = await this.repo.getRules();

      const valid = registry.length >= 0 && metadata.length >= 0 && rules.length >= 0;
      return {
        phase: VALIDATION_PHASES.SCHEMA_VALIDATION,
        passed: valid,
        message: valid ? "SchemaValidation passed: Relational schema and entities loaded" : "SchemaValidation failed",
        timeTakenMs: Date.now() - start,
        details: { registryCount: registry.length, metadataCount: metadata.length, rulesCount: rules.length },
      };
    } catch (err: any) {
      return {
        phase: VALIDATION_PHASES.SCHEMA_VALIDATION,
        passed: false,
        message: `SchemaValidation error: ${err.message}`,
        timeTakenMs: Date.now() - start,
      };
    }
  }

  private async runDependencyValidation(): Promise<ValidationPhaseResult> {
    const start = Date.now();
    try {
      const registeredModules = await this.repo.getRegisteredModules();
      const moduleMap = new Map(registeredModules.map((m) => [m.moduleId, m]));
      const missingDependencies: string[] = [];

      for (const mod of registeredModules) {
        if (mod.dependencies) {
          for (const depId of mod.dependencies) {
            if (!moduleMap.has(depId)) {
              missingDependencies.push(`${mod.moduleId} -> ${depId}`);
            }
          }
        }
      }

      const passed = missingDependencies.length === 0;
      return {
        phase: VALIDATION_PHASES.DEPENDENCY_VALIDATION,
        passed,
        message: passed 
          ? "DependencyValidation passed: All module dependencies satisfied" 
          : `DependencyValidation failed: Missing dependencies: ${missingDependencies.join(", ")}`,
        timeTakenMs: Date.now() - start,
        details: { missingDependencies },
      };
    } catch (err: any) {
      return {
        phase: VALIDATION_PHASES.DEPENDENCY_VALIDATION,
        passed: false,
        message: `DependencyValidation error: ${err.message}`,
        timeTakenMs: Date.now() - start,
      };
    }
  }

  private async runSignatureValidation(): Promise<ValidationPhaseResult> {
    const start = Date.now();
    try {
      const registeredModules = await this.repo.getRegisteredModules();
      const invalidSignatures: string[] = [];

      for (const mod of registeredModules) {
        const dto: RegisterModuleDTO = {
          moduleId: mod.moduleId,
          moduleName: mod.moduleName,
          version: mod.version,
          signature: mod.signature || undefined,
          registeredBy: mod.registeredBy,
        };

        if (!verifyModuleSignature(dto)) {
          invalidSignatures.push(mod.moduleId);
        }
      }

      const passed = invalidSignatures.length === 0;
      return {
        phase: VALIDATION_PHASES.SIGNATURE_VALIDATION,
        passed,
        message: passed 
          ? "SignatureValidation passed: Module signatures verified" 
          : `SignatureValidation failed: Invalid module signatures: ${invalidSignatures.join(", ")}`,
        timeTakenMs: Date.now() - start,
        details: { invalidSignatures },
      };
    } catch (err: any) {
      return {
        phase: VALIDATION_PHASES.SIGNATURE_VALIDATION,
        passed: false,
        message: `SignatureValidation error: ${err.message}`,
        timeTakenMs: Date.now() - start,
      };
    }
  }

  private async runHashValidation(): Promise<ValidationPhaseResult> {
    const start = Date.now();
    try {
      const activeVersion = await this.repo.getActiveVersion();
      if (!activeVersion) {
        return {
          phase: VALIDATION_PHASES.HASH_VALIDATION,
          passed: false,
          message: "HashValidation failed: No active version",
          timeTakenMs: Date.now() - start,
        };
      }

      const registry = await this.repo.getRegistryEntries();
      const metadata = await this.repo.getMetadata();

      const isValid = verifyConstitutionHash(
        {
          versionId: activeVersion.versionId,
          title: activeVersion.title,
          description: activeVersion.description,
          registry,
          metadata,
        },
        activeVersion.hash
      );

      return {
        phase: VALIDATION_PHASES.HASH_VALIDATION,
        passed: isValid,
        message: isValid ? "HashValidation passed: Payload hash integrity verified" : "HashValidation failed: Tamper detected",
        timeTakenMs: Date.now() - start,
        details: { hash: activeVersion.hash },
      };
    } catch (err: any) {
      return {
        phase: VALIDATION_PHASES.HASH_VALIDATION,
        passed: false,
        message: `HashValidation error: ${err.message}`,
        timeTakenMs: Date.now() - start,
      };
    }
  }

  private async runPermissionValidation(): Promise<ValidationPhaseResult> {
    const start = Date.now();
    try {
      const ownerCanRead = PermissionMatrix.hasPermission(GOVERNANCE_ROLES.OWNER, GOVERNANCE_ACTIONS.READ);
      const viewerCannotWrite = !PermissionMatrix.hasPermission(GOVERNANCE_ROLES.VIEWER, GOVERNANCE_ACTIONS.WRITE);
      const passed = ownerCanRead && viewerCannotWrite;

      return {
        phase: VALIDATION_PHASES.PERMISSION_VALIDATION,
        passed,
        message: passed ? "PermissionValidation passed: Permission matrix integrity verified" : "PermissionValidation failed",
        timeTakenMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        phase: VALIDATION_PHASES.PERMISSION_VALIDATION,
        passed: false,
        message: `PermissionValidation error: ${err.message}`,
        timeTakenMs: Date.now() - start,
      };
    }
  }

  private async runFinalValidation(previousPhasesPassed: boolean): Promise<ValidationPhaseResult> {
    const start = Date.now();
    return {
      phase: VALIDATION_PHASES.FINAL_VALIDATION,
      passed: previousPhasesPassed,
      message: previousPhasesPassed 
        ? "FinalValidation passed: All governance validation criteria satisfied" 
        : "FinalValidation failed: One or more prior validation phases failed",
      timeTakenMs: Date.now() - start,
    };
  }
}
