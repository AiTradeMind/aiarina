import { 
  ConstitutionVersion, 
  ConstitutionRegistryEntry, 
  ConstitutionModuleRegistration, 
  ConstitutionPolicy,
  ConstitutionRule,
  ConstitutionMetadataEntry,
  ConstitutionMetrics,
  GranularCacheStatus
} from "../types/index.ts";
import { GovernanceRole, GovernanceAction } from "../constants/index.ts";
import logger from "../../../lib/logger.ts";

export class ConstitutionCache {
  private activeVersion: ConstitutionVersion | null = null;
  private registryEntries: ConstitutionRegistryEntry[] | null = null;
  private registeredModules: ConstitutionModuleRegistration[] | null = null;
  private policies: ConstitutionPolicy[] | null = null;
  private rules: ConstitutionRule[] | null = null;
  private metadata: ConstitutionMetadataEntry[] | null = null;
  private permissionMatrix: Record<GovernanceRole, GovernanceAction[]> | null = null;
  private metrics: ConstitutionMetrics | null = null;
  private lastUpdated: number = 0;

  // Version Cache
  getActiveVersion(): ConstitutionVersion | null {
    return this.activeVersion;
  }

  setActiveVersion(version: ConstitutionVersion | null): void {
    this.activeVersion = version;
    this.lastUpdated = Date.now();
  }

  invalidateVersion(): void {
    logger.info({ type: "CONSTITUTION_CACHE" }, "Version Cache Invalidated");
    this.activeVersion = null;
    this.lastUpdated = Date.now();
  }

  // Registry Cache
  getRegistryEntries(): ConstitutionRegistryEntry[] | null {
    return this.registryEntries;
  }

  setRegistryEntries(entries: ConstitutionRegistryEntry[]): void {
    this.registryEntries = entries;
    this.lastUpdated = Date.now();
  }

  invalidateRegistry(): void {
    logger.info({ type: "CONSTITUTION_CACHE" }, "Registry Cache Invalidated");
    this.registryEntries = null;
    this.lastUpdated = Date.now();
  }

  // Module Cache
  getRegisteredModules(): ConstitutionModuleRegistration[] | null {
    return this.registeredModules;
  }

  setRegisteredModules(modules: ConstitutionModuleRegistration[]): void {
    this.registeredModules = modules;
    this.lastUpdated = Date.now();
  }

  invalidateModules(): void {
    logger.info({ type: "CONSTITUTION_CACHE" }, "Modules Cache Invalidated");
    this.registeredModules = null;
    this.lastUpdated = Date.now();
  }

  // Policy Cache
  getPolicies(): ConstitutionPolicy[] | null {
    return this.policies;
  }

  setPolicies(policies: ConstitutionPolicy[]): void {
    this.policies = policies;
    this.lastUpdated = Date.now();
  }

  invalidatePolicies(): void {
    logger.info({ type: "CONSTITUTION_CACHE" }, "Policies Cache Invalidated");
    this.policies = null;
    this.lastUpdated = Date.now();
  }

  // Rule Cache
  getRules(): ConstitutionRule[] | null {
    return this.rules;
  }

  setRules(rules: ConstitutionRule[]): void {
    this.rules = rules;
    this.lastUpdated = Date.now();
  }

  invalidateRules(): void {
    logger.info({ type: "CONSTITUTION_CACHE" }, "Rules Cache Invalidated");
    this.rules = null;
    this.lastUpdated = Date.now();
  }

  // Metadata Cache
  getMetadata(): ConstitutionMetadataEntry[] | null {
    return this.metadata;
  }

  setMetadata(metadata: ConstitutionMetadataEntry[]): void {
    this.metadata = metadata;
    this.lastUpdated = Date.now();
  }

  invalidateMetadata(): void {
    logger.info({ type: "CONSTITUTION_CACHE" }, "Metadata Cache Invalidated");
    this.metadata = null;
    this.lastUpdated = Date.now();
  }

  // Permission Cache
  getPermissionMatrix(): Record<GovernanceRole, GovernanceAction[]> | null {
    return this.permissionMatrix;
  }

  setPermissionMatrix(matrix: Record<GovernanceRole, GovernanceAction[]>): void {
    this.permissionMatrix = matrix;
    this.lastUpdated = Date.now();
  }

  invalidatePermissions(): void {
    logger.info({ type: "CONSTITUTION_CACHE" }, "Permissions Cache Invalidated");
    this.permissionMatrix = null;
    this.lastUpdated = Date.now();
  }

  // Metrics
  getMetrics(): ConstitutionMetrics | null {
    return this.metrics;
  }

  setMetrics(metrics: ConstitutionMetrics): void {
    this.metrics = metrics;
  }

  getLastUpdated(): number {
    return this.lastUpdated;
  }

  getCacheStatus(): GranularCacheStatus {
    return {
      lastUpdated: this.lastUpdated,
      cachedModulesCount: this.registeredModules ? this.registeredModules.length : 0,
      cachedPoliciesCount: this.policies ? this.policies.length : 0,
      cachedRulesCount: this.rules ? this.rules.length : 0,
      cachedPermissionsCount: this.permissionMatrix ? Object.keys(this.permissionMatrix).length : 0,
      cachedMetadataCount: this.metadata ? this.metadata.length : 0,
      isVersionCached: this.activeVersion !== null,
    };
  }

  /**
   * Invalidate all cached items
   */
  invalidate(): void {
    logger.info({ type: "CONSTITUTION_CACHE" }, "Full Cache Invalidated");
    this.activeVersion = null;
    this.registryEntries = null;
    this.registeredModules = null;
    this.policies = null;
    this.rules = null;
    this.metadata = null;
    this.permissionMatrix = null;
    this.metrics = null;
    this.lastUpdated = Date.now();
  }
}
