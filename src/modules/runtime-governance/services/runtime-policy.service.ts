import {
  RuntimeEvaluationRequest,
  PolicyViolation,
  RuntimeGovernancePolicy,
} from "../types/index.ts";
import { RuntimeGovernanceRepository } from "../repositories/runtime-governance.repository.ts";
import { PermissionMatrix } from "../../constitution/permissions/permission.matrix.ts";
import { GOVERNANCE_ROLES, GOVERNANCE_ACTIONS, GovernanceRole, GovernanceAction } from "../../constitution/constants/index.ts";
import logger from "../../../lib/logger.ts";

export class RuntimePolicyService {
  private static instance: RuntimePolicyService;
  private repository: RuntimeGovernanceRepository;

  private constructor() {
    this.repository = RuntimeGovernanceRepository.getInstance();
  }

  public static getInstance(): RuntimePolicyService {
    if (!RuntimePolicyService.instance) {
      RuntimePolicyService.instance = new RuntimePolicyService();
    }
    return RuntimePolicyService.instance;
  }

  private normalizeRole(roleStr?: string): GovernanceRole {
    if (!roleStr) return GOVERNANCE_ROLES.SYSTEM;
    const clean = roleStr.replace(/_/g, " ").trim().toUpperCase();

    if (clean === "OWNER") return GOVERNANCE_ROLES.OWNER;
    if (clean === "SUPER ADMIN" || clean === "SUPERADMIN") return GOVERNANCE_ROLES.SUPER_ADMIN;
    if (clean === "ADMIN") return GOVERNANCE_ROLES.ADMIN;
    if (clean === "MANAGER") return GOVERNANCE_ROLES.MANAGER;
    if (clean === "OPERATOR") return GOVERNANCE_ROLES.OPERATOR;
    if (clean === "AUDITOR") return GOVERNANCE_ROLES.AUDITOR;
    if (clean === "VIEWER") return GOVERNANCE_ROLES.VIEWER;
    if (clean === "AI") return GOVERNANCE_ROLES.AI;
    if (clean === "SYSTEM") return GOVERNANCE_ROLES.SYSTEM;

    return GOVERNANCE_ROLES.VIEWER;
  }

  private normalizeAction(actionStr?: string): GovernanceAction {
    if (!actionStr) return GOVERNANCE_ACTIONS.EXECUTE;
    const clean = actionStr.trim().toUpperCase();

    if (clean === "READ") return GOVERNANCE_ACTIONS.READ;
    if (clean === "WRITE") return GOVERNANCE_ACTIONS.WRITE;
    if (clean === "REGISTER") return GOVERNANCE_ACTIONS.REGISTER;
    if (clean === "LOCK") return GOVERNANCE_ACTIONS.LOCK;
    if (clean === "ACTIVATE") return GOVERNANCE_ACTIONS.ACTIVATE;
    if (clean === "ARCHIVE") return GOVERNANCE_ACTIONS.ARCHIVE;
    if (clean === "EXECUTE") return GOVERNANCE_ACTIONS.EXECUTE;
    if (clean === "APPROVE") return GOVERNANCE_ACTIONS.APPROVE;
    if (clean === "REJECT") return GOVERNANCE_ACTIONS.REJECT;

    return GOVERNANCE_ACTIONS.EXECUTE;
  }

  public async evaluatePolicies(request: RuntimeEvaluationRequest): Promise<{
    isCompliant: boolean;
    violations: PolicyViolation[];
    riskScore: number;
    triggeredPolicies: string[];
    requiresSecondaryApproval: boolean;
  }> {
    const activePolicies = await this.repository.getActivePolicies();
    const violations: PolicyViolation[] = [];
    const triggeredPolicies: string[] = [];
    let riskScore = 10.0; // Baseline low risk score
    let requiresSecondaryApproval = false;

    // 1. Constitution Role Permission Check
    const normalizedRole = this.normalizeRole(request.role);
    const normalizedAction = this.normalizeAction(request.actionType);

    const isPermitted = PermissionMatrix.hasPermission(normalizedRole, normalizedAction);
    if (!isPermitted) {
      violations.push({
        policyId: "POL-COMP-ROLE-PERM",
        policyName: "Constitution Role Authorization",
        category: "COMPLIANCE_RULE",
        enforcementLevel: "STRICT_BLOCK",
        reason: `Role '${request.role || normalizedRole}' lacks Constitution Engine authorization for action '${request.actionType || normalizedAction}'.`,
      });
      triggeredPolicies.push("POL-COMP-ROLE-PERM");
      riskScore += 50.0;
    }

    // 2. Iterate through Active Runtime Policies
    for (const policy of activePolicies) {
      const cfg = policy.ruleConfig || {};

      // Max Trade Value Limit
      if (cfg.maxTradeValue && typeof request.amount === "number") {
        if (request.amount > cfg.maxTradeValue) {
          violations.push({
            policyId: policy.policyId,
            policyName: policy.name,
            category: policy.category,
            enforcementLevel: policy.enforcementLevel,
            reason: `Trade amount ₹${request.amount.toLocaleString()} exceeds policy limit of ₹${cfg.maxTradeValue.toLocaleString()}`,
          });
          triggeredPolicies.push(policy.policyId);
          riskScore += 35.0;

          if (policy.enforcementLevel === "APPROVAL_REQUIRED") {
            requiresSecondaryApproval = true;
          }
        }
      }

      // Allowed Roles check
      if (Array.isArray(cfg.allowedRoles) && cfg.allowedRoles.length > 0) {
        const uppercaseAllowed = cfg.allowedRoles.map((r: string) => r.toUpperCase());
        const uppercaseRole = (request.role || "SYSTEM").toUpperCase();
        if (!uppercaseAllowed.includes(uppercaseRole) && !uppercaseAllowed.includes(normalizedRole.toUpperCase())) {
          violations.push({
            policyId: policy.policyId,
            policyName: policy.name,
            category: policy.category,
            enforcementLevel: policy.enforcementLevel,
            reason: `Role '${request.role || normalizedRole}' is not in the allowed roles list for policy '${policy.name}'.`,
          });
          triggeredPolicies.push(policy.policyId);
          riskScore += 25.0;
        }
      }

      // Secondary signoff requirement check
      if (cfg.requireSecondarySignoff) {
        if (!request.metadata?.secondaryApproved) {
          requiresSecondaryApproval = true;
          triggeredPolicies.push(policy.policyId);
          riskScore += 15.0;
        }
      }
    }

    // Cap risk score at 100
    riskScore = Math.min(100.0, Math.max(0.0, riskScore));

    const isCompliant = violations.filter((v) => v.enforcementLevel === "STRICT_BLOCK").length === 0;

    return {
      isCompliant,
      violations,
      riskScore,
      triggeredPolicies,
      requiresSecondaryApproval,
    };
  }

  public async createOrUpdatePolicy(policy: RuntimeGovernancePolicy): Promise<RuntimeGovernancePolicy> {
    return this.repository.savePolicy(policy);
  }

  public async getPolicy(policyId: string): Promise<RuntimeGovernancePolicy | null> {
    return this.repository.getPolicyById(policyId);
  }

  public async getAllPolicies(): Promise<RuntimeGovernancePolicy[]> {
    return this.repository.getActivePolicies();
  }
}
