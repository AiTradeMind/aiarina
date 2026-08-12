import { ConstitutionRepository } from "../repositories/constitution.repository.ts";
import { ConstitutionCache } from "../cache/constitution.cache.ts";
import { BootPipeline } from "../pipeline/boot.pipeline.ts";
import { ValidationPipeline } from "../pipeline/validation.pipeline.ts";
import { PermissionMatrix } from "../permissions/permission.matrix.ts";
import { 
  ConstitutionVersion, 
  ConstitutionRegistryEntry, 
  ConstitutionModuleRegistration, 
  ConstitutionMetadataEntry, 
  ConstitutionRule,
  ConstitutionPolicy,
  ConstitutionSnapshot,
  RegisterModuleDTO, 
  RegisterPolicyDTO,
  ConstitutionHealthStatus,
  ConstitutionFoundationSummary,
  ConstitutionMetrics,
  KernelLifecycleState,
  KernelLifecycleRecord,
  EmergencyMode,
  VersionCompatibilityMetadata,
  StructuredValidationDiagnostics
} from "../types/index.ts";
import { 
  CONSTITUTION_ERRORS, 
  CONSTITUTION_STATUSES, 
  KERNEL_LIFECYCLE_STATES,
  EMERGENCY_MODES,
  POLICY_CATEGORIES, 
  DEFAULT_CONSTITUTION,
  AUDIT_EVENT_TYPES,
  GOVERNANCE_ROLES,
  GOVERNANCE_ACTIONS
} from "../constants/index.ts";
import { 
  generateConstitutionHash, 
  verifyConstitutionHash, 
  generateModuleSignature, 
  verifyModuleSignature 
} from "../utils/constitution.utils.ts";
import logger from "../../../lib/logger.ts";

export class ConstitutionService {
  private repo: ConstitutionRepository;
  private cache: ConstitutionCache;
  private bootPipeline: BootPipeline;
  private validationPipeline: ValidationPipeline;

  private isStarted: boolean = false;
  private bootstrapDone: boolean = false;
  private bootTimeMs: number = 0;
  private lastValidationTimeMs: number = 0;
  private validationPassed: boolean = false;

  private lifecycleState: KernelLifecycleState = KERNEL_LIFECYCLE_STATES.STOPPED;
  private emergencyMode: EmergencyMode = EMERGENCY_MODES.NONE;
  private transitionHistory: KernelLifecycleRecord[] = [];
  private lastDiagnostics: StructuredValidationDiagnostics | null = null;

  private static readonly VALID_TRANSITIONS: Record<KernelLifecycleState, KernelLifecycleState[]> = {
    [KERNEL_LIFECYCLE_STATES.STOPPED]: [KERNEL_LIFECYCLE_STATES.INITIALIZING],
    [KERNEL_LIFECYCLE_STATES.INITIALIZING]: [KERNEL_LIFECYCLE_STATES.READY, KERNEL_LIFECYCLE_STATES.FAILED],
    [KERNEL_LIFECYCLE_STATES.READY]: [
      KERNEL_LIFECYCLE_STATES.LOCKED, 
      KERNEL_LIFECYCLE_STATES.SAFE_MODE, 
      KERNEL_LIFECYCLE_STATES.MAINTENANCE, 
      KERNEL_LIFECYCLE_STATES.STOPPED
    ],
    [KERNEL_LIFECYCLE_STATES.LOCKED]: [
      KERNEL_LIFECYCLE_STATES.SAFE_MODE, 
      KERNEL_LIFECYCLE_STATES.MAINTENANCE, 
      KERNEL_LIFECYCLE_STATES.STOPPED
    ],
    [KERNEL_LIFECYCLE_STATES.SAFE_MODE]: [
      KERNEL_LIFECYCLE_STATES.READY, 
      KERNEL_LIFECYCLE_STATES.MAINTENANCE, 
      KERNEL_LIFECYCLE_STATES.STOPPED
    ],
    [KERNEL_LIFECYCLE_STATES.MAINTENANCE]: [
      KERNEL_LIFECYCLE_STATES.READY, 
      KERNEL_LIFECYCLE_STATES.STOPPED
    ],
    [KERNEL_LIFECYCLE_STATES.FAILED]: [
      KERNEL_LIFECYCLE_STATES.INITIALIZING, 
      KERNEL_LIFECYCLE_STATES.STOPPED
    ],
  };

  constructor(repo?: ConstitutionRepository, cache?: ConstitutionCache) {
    this.repo = repo || new ConstitutionRepository();
    this.cache = cache || new ConstitutionCache();
    this.bootPipeline = new BootPipeline(this.repo, this.cache);
    this.validationPipeline = new ValidationPipeline(this.repo);
  }

  /**
   * Transition Kernel Lifecycle State with transition history tracking
   */
  public transitionLifecycleState(
    newState: KernelLifecycleState,
    reason: string = "Routine state transition",
    operator: string = "SYSTEM"
  ): void {
    const allowedNewStates = ConstitutionService.VALID_TRANSITIONS[this.lifecycleState] || [];
    if (!allowedNewStates.includes(newState)) {
      logger.error(
        { type: "CONSTITUTION_LIFECYCLE_ERROR", currentState: this.lifecycleState, newState },
        CONSTITUTION_ERRORS.INVALID_LIFECYCLE_TRANSITION
      );
      throw new Error(
        `${CONSTITUTION_ERRORS.INVALID_LIFECYCLE_TRANSITION}: Cannot transition from ${this.lifecycleState} to ${newState}`
      );
    }

    const previousState = this.lifecycleState;
    this.lifecycleState = newState;

    const record: KernelLifecycleRecord = {
      timestamp: new Date().toISOString(),
      previousState,
      newState,
      reason,
      operator,
    };

    this.transitionHistory.push(record);
    logger.info({ type: "CONSTITUTION_LIFECYCLE", previousState, newState, reason }, "Kernel Lifecycle Transition");

    this.repo.recordAuditLog(
      AUDIT_EVENT_TYPES.LIFECYCLE_TRANSITION,
      "KERNEL",
      "LIFECYCLE",
      operator,
      { previousState, newState, reason }
    ).catch((err) => logger.warn({ type: "AUDIT_LOG_WARN", error: err.message }, "Failed to record lifecycle audit log"));
  }

  /**
   * Set Emergency Mode Infrastructure
   */
  public setEmergencyMode(mode: EmergencyMode, operator: string = "ADMIN", reason: string = "Emergency action"): void {
    const previousMode = this.emergencyMode;
    this.emergencyMode = mode;

    logger.warn({ type: "CONSTITUTION_EMERGENCY_MODE", previousMode, newMode: mode, reason }, "Emergency Mode Changed");

    this.repo.recordAuditLog(
      AUDIT_EVENT_TYPES.EMERGENCY_MODE_CHANGED,
      "KERNEL",
      "EMERGENCY",
      operator,
      { previousMode, newMode: mode, reason }
    ).catch((err) => logger.warn({ type: "AUDIT_LOG_WARN", error: err.message }, "Failed to record emergency audit log"));
  }

  /**
   * Get Current Emergency Mode
   */
  public getEmergencyMode(): EmergencyMode {
    return this.emergencyMode;
  }

  /**
   * Initialize and bootstrap the Constitution Engine via Boot Pipeline
   */
  async startEngine(): Promise<void> {
    const startTime = Date.now();
    try {
      if (this.isStarted && this.bootstrapDone && this.lifecycleState === KERNEL_LIFECYCLE_STATES.READY) {
        logger.warn({ type: "CONSTITUTION_ENGINE" }, "Engine already started and READY");
        return;
      }

      this.transitionLifecycleState(KERNEL_LIFECYCLE_STATES.INITIALIZING, "Starting Boot Pipeline", "SYSTEM");
      logger.info({ type: "CONSTITUTION_ENGINE" }, "Engine Boot Sequence Started");

      // Execute Boot Pipeline
      const bootResult = await this.bootPipeline.executeBootSequence();
      this.bootTimeMs = bootResult.totalBootTimeMs;
      this.isStarted = true;
      this.bootstrapDone = true;

      // Execute Multi-Phase Validation Pipeline
      const valStart = Date.now();
      logger.info({ type: "CONSTITUTION_LOADER" }, "Executing Validation Pipeline");
      this.lastDiagnostics = await this.validationPipeline.executePipeline();
      this.lastValidationTimeMs = Date.now() - valStart;
      this.validationPassed = this.lastDiagnostics.overallPassed;

      if (!this.validationPassed) {
        this.transitionLifecycleState(KERNEL_LIFECYCLE_STATES.FAILED, "Startup Validation Failed", "SYSTEM");
        throw new Error(CONSTITUTION_ERRORS.STARTUP_VALIDATION_FAILED);
      }

      this.transitionLifecycleState(KERNEL_LIFECYCLE_STATES.READY, "Kernel Ready and Validated", "SYSTEM");
      logger.info({ type: "CONSTITUTION_LOADER" }, "Enterprise Kernel Ready");
    } catch (error: any) {
      if (this.lifecycleState === KERNEL_LIFECYCLE_STATES.INITIALIZING) {
        this.transitionLifecycleState(KERNEL_LIFECYCLE_STATES.FAILED, error.message, "SYSTEM");
      }
      logger.error({ type: "CONSTITUTION_ENGINE_ERROR", error: error.message }, "Kernel Boot Failed");
      this.validationPassed = false;
      this.bootstrapDone = false;
      throw error;
    }
  }

  /**
   * Shutdown Kernel
   */
  async shutdownEngine(): Promise<void> {
    logger.info({ type: "CONSTITUTION_ENGINE" }, "Engine Shutdown Requested");
    if (this.lifecycleState !== KERNEL_LIFECYCLE_STATES.STOPPED) {
      this.transitionLifecycleState(KERNEL_LIFECYCLE_STATES.STOPPED, "Engine Shutdown", "SYSTEM");
    }
    this.isStarted = false;
    this.cache.invalidate();
  }

  /**
   * Lock an active or specified Constitution version
   */
  async lockConstitution(versionId?: string, operator: string = "ADMIN"): Promise<ConstitutionVersion> {
    if (!this.isStarted || this.lifecycleState === KERNEL_LIFECYCLE_STATES.STOPPED) {
      await this.startEngine();
    }

    const activeVersion = await this.repo.getActiveVersion();
    const targetVersionId = versionId || (activeVersion ? activeVersion.versionId : null);

    if (!targetVersionId) {
      throw new Error(CONSTITUTION_ERRORS.VERSION_NOT_FOUND);
    }

    const lockedVersion = await this.repo.lockVersion(targetVersionId, operator);
    logger.info({ type: "CONSTITUTION_ENGINE", versionId: targetVersionId }, "Constitution Locked");

    if (this.lifecycleState === KERNEL_LIFECYCLE_STATES.READY) {
      this.transitionLifecycleState(KERNEL_LIFECYCLE_STATES.LOCKED, "Active version locked", operator);
    }

    this.cache.invalidate();
    return lockedVersion;
  }

  /**
   * Get Version Compatibility Metadata
   */
  public getVersionCompatibility(): VersionCompatibilityMetadata {
    return {
      minimumVersion: "1.0.0",
      maximumVersion: "2.5.0",
      supportedModules: [
        "MOD-CONSTITUTION-FOUNDATION",
        "MOD-RESEARCH-CENTER",
        "MOD-AI-BRAIN",
        "MOD-AI-DECISION",
        "MOD-FUND-MANAGER",
        "MOD-WALLET",
        "MOD-OMS",
        "MOD-PORTFOLIO",
        "MOD-ACCOUNTING",
        "MOD-LEARNING-ENGINE",
        "MOD-RISK-ENGINE",
      ],
      deprecatedModules: [],
      migrationMetadata: {
        schemaCompatible: true,
        autoMigrate: false,
        phase: "2.1A",
      },
      futureCompatibility: {
        phase2_1BReady: true,
        runtimeRuleExecutionPrepared: true,
      },
    };
  }

  /**
   * Get Governance Policies
   */
  async getPolicies(): Promise<ConstitutionPolicy[]> {
    if (!this.isStarted) {
      await this.startEngine();
    }

    const cached = this.cache.getPolicies();
    if (cached) {
      return cached;
    }

    const policies = await this.repo.getPolicies();
    this.cache.setPolicies(policies);
    return policies;
  }

  /**
   * Register a new policy into Policy Registry
   */
  async registerPolicy(dto: RegisterPolicyDTO): Promise<ConstitutionPolicy> {
    if (!dto.policyId || !dto.policyName || !dto.category) {
      throw new Error("Invalid parameters: policyId, policyName, and category are required.");
    }

    if (!this.isStarted) {
      await this.startEngine();
    }

    const activeVersion = await this.repo.getActiveVersion();
    if (!dto.versionId && activeVersion) {
      dto.versionId = activeVersion.versionId;
    }

    const policy = await this.repo.savePolicy(dto);
    logger.info({ type: "POLICY_REGISTRATION", policyId: dto.policyId }, "Policy Registered");

    this.cache.invalidatePolicies();
    return policy;
  }

  /**
   * Get overall Constitution summary with enriched enterprise governance data
   */
  async getConstitution(): Promise<ConstitutionFoundationSummary> {
    if (!this.isStarted) {
      await this.startEngine();
    }

    let version = this.cache.getActiveVersion();
    let registry = this.cache.getRegistryEntries() || [];
    let modules = this.cache.getRegisteredModules() || [];
    let policies = this.cache.getPolicies() || [];
    let rules = this.cache.getRules() || [];

    if (!version || registry.length === 0 || modules.length === 0 || rules.length === 0) {
      version = await this.repo.getActiveVersion();
      registry = await this.repo.getRegistryEntries();
      modules = await this.repo.getRegisteredModules();
      policies = await this.repo.getPolicies();
      rules = await this.repo.getRules();

      if (version) this.cache.setActiveVersion(version);
      this.cache.setRegistryEntries(registry);
      this.cache.setRegisteredModules(modules);
      this.cache.setPolicies(policies);
      this.cache.setRules(rules);
    }

    const metadata = await this.repo.getMetadata();
    const latestSnapshot = await this.repo.getLatestSnapshot();
    const allVersions = await this.repo.getAllVersions();

    const currentIndex = allVersions.findIndex((v) => version && v.versionId === version.versionId);
    const previousVersion = currentIndex >= 0 && currentIndex + 1 < allVersions.length ? allVersions[currentIndex + 1] : null;
    const nextVersion = currentIndex > 0 ? allVersions[currentIndex - 1] : null;

    const rollbackMetadata = previousVersion
      ? {
          canRollback: true,
          targetRollbackVersionId: previousVersion.versionId,
          targetHash: previousVersion.hash,
          requiresMigration: false,
        }
      : {
          canRollback: false,
          reason: "No parent or previous constitution version exists",
        };

    const metrics: ConstitutionMetrics = {
      bootTimeMs: this.bootTimeMs,
      lastValidationTimeMs: this.lastValidationTimeMs,
      registrySize: registry.length,
      moduleCount: modules.length,
      ruleCount: rules.length,
      policyCount: policies.length,
      snapshotCount: latestSnapshot ? 1 : 0,
      activeVersionId: version ? version.versionId : null,
    };

    const isHashValid = version
      ? verifyConstitutionHash(
          {
            versionId: version.versionId,
            title: version.title,
            description: version.description,
            registry,
            metadata,
          },
          version.hash
        )
      : false;

    return {
      version,
      lifecycle: {
        currentState: this.lifecycleState,
        emergencyMode: this.emergencyMode,
      },
      registry,
      modules,
      policies,
      rules,
      metadata,
      permissionMatrix: PermissionMatrix.getFullMatrix(),
      latestSnapshot,
      versionHistory: {
        current: version,
        previous: previousVersion,
        next: nextVersion,
        migrationMetadata: {
          schemaCompatible: true,
          autoMigrate: false,
        },
      },
      versionCompatibility: this.getVersionCompatibility(),
      rollbackMetadata,
      engineStatus: this.isStarted && this.validationPassed ? "ONLINE" : "DEGRADED",
      metrics,
      hashIntegrityVerified: isHashValid,
    };
  }

  /**
   * Get current Constitution Version details and history
   */
  async getVersion(): Promise<{
    activeVersion: ConstitutionVersion | null;
    allVersions: ConstitutionVersion[];
    versionHistory: {
      current: ConstitutionVersion | null;
      previous: ConstitutionVersion | null;
      next: ConstitutionVersion | null;
      migrationMetadata: Record<string, any>;
    };
  }> {
    if (!this.isStarted) {
      await this.startEngine();
    }

    const activeVersion = await this.repo.getActiveVersion();
    const allVersions = await this.repo.getAllVersions();

    const currentIndex = allVersions.findIndex((v) => activeVersion && v.versionId === activeVersion.versionId);
    const previousVersion = currentIndex >= 0 && currentIndex + 1 < allVersions.length ? allVersions[currentIndex + 1] : null;
    const nextVersion = currentIndex > 0 ? allVersions[currentIndex - 1] : null;

    return {
      activeVersion,
      allVersions,
      versionHistory: {
        current: activeVersion,
        previous: previousVersion,
        next: nextVersion,
        migrationMetadata: {
          activeCount: allVersions.filter((v) => v.status === "ACTIVE").length,
          lockedCount: allVersions.filter((v) => v.isLocked).length,
        },
      },
    };
  }

  /**
   * Get registered modules
   */
  async getModules(): Promise<{
    count: number;
    modules: ConstitutionModuleRegistration[];
  }> {
    if (!this.isStarted) {
      await this.startEngine();
    }

    const modules = await this.repo.getRegisteredModules();
    return {
      count: modules.length,
      modules,
    };
  }

  /**
   * Register a new module with dependency and signature validation
   */
  async registerModule(dto: RegisterModuleDTO): Promise<ConstitutionModuleRegistration> {
    if (!dto.moduleId || !dto.moduleName || !dto.version) {
      logger.warn({ type: "MODULE_REGISTRATION_FAILED", dto }, "Invalid module registration parameters");
      throw new Error("Invalid parameters: moduleId, moduleName, and version are required.");
    }

    if (!this.isStarted) {
      await this.startEngine();
    }

    if (dto.dependencies && dto.dependencies.length > 0) {
      const existingModules = await this.repo.getRegisteredModules();
      const existingIds = new Set(existingModules.map((m) => m.moduleId));

      for (const depId of dto.dependencies) {
        if (!existingIds.has(depId)) {
          logger.warn({ type: "MODULE_REGISTRATION_FAILED", moduleId: dto.moduleId, depId }, "Missing dependency");
          throw new Error(`${CONSTITUTION_ERRORS.MODULE_DEPENDENCY_MISSING}: Required module ${depId} is not registered.`);
        }
      }
    }

    if (dto.signature && !verifyModuleSignature(dto)) {
      logger.warn({ type: "MODULE_REGISTRATION_FAILED", moduleId: dto.moduleId }, "Signature validation failed");
      throw new Error(CONSTITUTION_ERRORS.INVALID_MODULE_SIGNATURE);
    }

    if (!dto.signature) {
      dto.signature = generateModuleSignature(dto.moduleId, dto.version, dto.registeredBy || "ADMIN");
    }

    const registered = await this.repo.registerModule(dto);
    logger.info({ type: "MODULE_REGISTRATION", moduleId: dto.moduleId }, "Module Registration");

    this.cache.invalidateModules();
    return registered;
  }

  /**
   * Diagnostic Health Check for Constitution Enterprise Governance Kernel
   */
  async getHealth(): Promise<ConstitutionHealthStatus> {
    let dbStatus = false;
    let modulesCount = 0;
    let registryCount = 0;
    let rulesCount = 0;
    let policiesCount = 0;
    let activeVersion: ConstitutionVersion | null = null;
    let isHashValid = false;
    let dependenciesSatisfied = true;
    let signaturesValid = true;

    try {
      activeVersion = await this.repo.getActiveVersion();

      const modules = await this.repo.getRegisteredModules();
      modulesCount = modules.length;

      const registry = await this.repo.getRegistryEntries();
      registryCount = registry.length;

      const rules = await this.repo.getRules();
      rulesCount = rules.length;

      const policies = await this.repo.getPolicies();
      policiesCount = policies.length;

      dbStatus = true;

      if (activeVersion) {
        const metadata = await this.repo.getMetadata();
        isHashValid = verifyConstitutionHash(
          {
            versionId: activeVersion.versionId,
            title: activeVersion.title,
            description: activeVersion.description,
            registry,
            metadata,
          },
          activeVersion.hash
        );
      }

      const moduleMap = new Map(modules.map((m) => [m.moduleId, m]));
      for (const m of modules) {
        if (m.dependencies) {
          for (const depId of m.dependencies) {
            if (!moduleMap.has(depId)) {
              dependenciesSatisfied = false;
              break;
            }
          }
        }

        const dto: RegisterModuleDTO = {
          moduleId: m.moduleId,
          moduleName: m.moduleName,
          version: m.version,
          signature: m.signature || undefined,
          registeredBy: m.registeredBy,
        };

        if (!verifyModuleSignature(dto)) {
          signaturesValid = false;
        }
      }
    } catch (error: any) {
      logger.error({ type: "CONSTITUTION_HEALTH_ERROR", error: error.message }, "Error checking database health in Constitution Engine");
      dbStatus = false;
    }

    if (!this.lastDiagnostics) {
      this.lastDiagnostics = await this.validationPipeline.executePipeline();
    }

    const isHealthy = 
      this.isStarted && 
      dbStatus && 
      this.bootstrapDone && 
      isHashValid && 
      dependenciesSatisfied && 
      signaturesValid &&
      this.lifecycleState !== KERNEL_LIFECYCLE_STATES.FAILED;

    const snapshot = await this.repo.getLatestSnapshot();

    const metrics: ConstitutionMetrics = {
      bootTimeMs: this.bootTimeMs,
      lastValidationTimeMs: this.lastValidationTimeMs,
      registrySize: registryCount,
      moduleCount: modulesCount,
      ruleCount: rulesCount,
      policyCount: policiesCount,
      snapshotCount: snapshot ? 1 : 0,
      activeVersionId: activeVersion ? activeVersion.versionId : null,
    };

    return {
      status: isHealthy ? "HEALTHY" : dbStatus ? "DEGRADED" : "UNHEALTHY",
      kernelLifecycle: {
        currentState: this.lifecycleState,
        emergencyMode: this.emergencyMode,
        transitionHistory: this.transitionHistory,
      },
      bootstrapStatus: this.bootstrapDone ? "INITIALIZED" : "PENDING",
      activeVersion: activeVersion ? activeVersion.versionId : null,
      policyRegistryStatus: {
        policyCount: policiesCount,
        activePoliciesCount: policiesCount,
      },
      permissionMatrixStatus: {
        rolesCount: Object.keys(GOVERNANCE_ROLES).length,
        actionsCount: Object.keys(GOVERNANCE_ACTIONS).length,
        matrixLoaded: true,
      },
      validationPipelineStatus: this.lastDiagnostics,
      cacheStatus: this.cache.getCacheStatus(),
      hashStatus: isHashValid ? "VALID" : activeVersion ? "TAMPERED" : "UNVERIFIED",
      signatureStatus: signaturesValid ? "VALID" : "INVALID",
      dependencyStatus: dependenciesSatisfied ? "SATISFIED" : "UNSATISFIED",
      versionCompatibility: this.getVersionCompatibility(),
      snapshotStatus: {
        snapshotExists: snapshot !== null,
        latestSnapshotId: snapshot ? snapshot.snapshotId : null,
      },
      checks: {
        database: dbStatus,
        loader: this.bootstrapDone,
        registry: registryCount > 0,
        hashIntegrity: isHashValid,
        moduleDependencies: dependenciesSatisfied,
        policiesLoaded: policiesCount > 0,
        permissionsLoaded: true,
      },
      metrics,
    };
  }
}
