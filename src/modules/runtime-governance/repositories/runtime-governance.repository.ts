import { getDb } from "../../../db/client.ts";
import {
  runtimeGovernancePolicies,
  runtimeGovernanceCircuitBreakers,
  runtimeGovernanceKillSwitches,
  runtimeGovernanceAuditLogs,
} from "../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import {
  RuntimeGovernancePolicy,
  CircuitBreakerState,
  KillSwitchState,
  GovernanceAuditLogRecord,
} from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class RuntimeGovernanceRepository {
  private static instance: RuntimeGovernanceRepository;

  private memoryPolicies: Map<string, RuntimeGovernancePolicy> = new Map();
  private memoryCircuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private memoryKillSwitches: Map<string, KillSwitchState> = new Map();
  private memoryAuditLogs: GovernanceAuditLogRecord[] = [];

  private constructor() {
    this.seedDefaultPolicies();
  }

  public static getInstance(): RuntimeGovernanceRepository {
    if (!RuntimeGovernanceRepository.instance) {
      RuntimeGovernanceRepository.instance = new RuntimeGovernanceRepository();
    }
    return RuntimeGovernanceRepository.instance;
  }

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  }

  private seedDefaultPolicies(): void {
    const defaultPolicies: RuntimeGovernancePolicy[] = [
      {
        policyId: "POL-RISK-MAX-VAL",
        name: "Max Single Order Value Limit",
        category: "RISK_LIMITS",
        enforcementLevel: "STRICT_BLOCK",
        status: "ACTIVE",
        priority: 1,
        ruleConfig: { maxTradeValue: 5000000 }, // 50 Lakhs INR limit
        description: "Enforces max trade value limit per order across automated runtime systems.",
        author: "GOVERNANCE_SYSTEM",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        policyId: "POL-COMP-ROLE-PERM",
        name: "Constitution Role Authorization",
        category: "COMPLIANCE_RULE",
        enforcementLevel: "STRICT_BLOCK",
        status: "ACTIVE",
        priority: 2,
        ruleConfig: { allowedRoles: ["OWNER", "SUPER_ADMIN", "ADMIN", "MANAGER", "OPERATOR", "SYSTEM", "AI"] },
        description: "Mandates role permissions check with Constitution Engine.",
        author: "GOVERNANCE_SYSTEM",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        policyId: "POL-RATE-LIMIT-MIN",
        name: "High Frequency Burst Limit",
        category: "RATE_LIMIT",
        enforcementLevel: "STRICT_BLOCK",
        status: "ACTIVE",
        priority: 3,
        ruleConfig: { maxOrderRatePerMin: 120 },
        description: "Prevents runaway order submission loops.",
        author: "GOVERNANCE_SYSTEM",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const pol of defaultPolicies) {
      this.memoryPolicies.set(pol.policyId, pol);
    }

    this.memoryKillSwitches.set("GLOBAL", {
      scope: "GLOBAL",
      isActive: false,
      activatedBy: undefined,
      activatedAt: undefined,
      reason: undefined,
    });
  }

  public async savePolicy(policy: RuntimeGovernancePolicy): Promise<RuntimeGovernancePolicy> {
    this.memoryPolicies.set(policy.policyId, policy);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const existing = await db
          .select()
          .from(runtimeGovernancePolicies)
          .where(eq(runtimeGovernancePolicies.policyId, policy.policyId))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(runtimeGovernancePolicies)
            .set({
              name: policy.name,
              category: policy.category,
              enforcementLevel: policy.enforcementLevel,
              status: policy.status,
              priority: policy.priority,
              ruleConfig: policy.ruleConfig,
              description: policy.description,
              updatedAt: new Date(),
            })
            .where(eq(runtimeGovernancePolicies.policyId, policy.policyId));
        } else {
          await db.insert(runtimeGovernancePolicies).values({
            policyId: policy.policyId,
            name: policy.name,
            category: policy.category,
            enforcementLevel: policy.enforcementLevel,
            status: policy.status,
            priority: policy.priority,
            ruleConfig: policy.ruleConfig,
            description: policy.description,
            author: policy.author || "SYSTEM",
            createdAt: policy.createdAt,
            updatedAt: policy.updatedAt,
          });
        }
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for savePolicy");
    }

    return policy;
  }

  public async getPolicyById(policyId: string): Promise<RuntimeGovernancePolicy | null> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db
          .select()
          .from(runtimeGovernancePolicies)
          .where(eq(runtimeGovernancePolicies.policyId, policyId))
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          return {
            policyId: r.policyId,
            name: r.name,
            category: r.category as any,
            enforcementLevel: r.enforcementLevel as any,
            status: r.status as any,
            priority: r.priority || 10,
            ruleConfig: (r.ruleConfig as any) || {},
            description: r.description || undefined,
            author: r.author || undefined,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          };
        }
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for getPolicyById");
    }

    return this.memoryPolicies.get(policyId) || null;
  }

  public async getActivePolicies(): Promise<RuntimeGovernancePolicy[]> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db
          .select()
          .from(runtimeGovernancePolicies)
          .where(eq(runtimeGovernancePolicies.status, "ACTIVE"))
          .orderBy(runtimeGovernancePolicies.priority);

        if (rows.length > 0) {
          return rows.map((r) => ({
            policyId: r.policyId,
            name: r.name,
            category: r.category as any,
            enforcementLevel: r.enforcementLevel as any,
            status: r.status as any,
            priority: r.priority || 10,
            ruleConfig: (r.ruleConfig as any) || {},
            description: r.description || undefined,
            author: r.author || undefined,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          }));
        }
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for getActivePolicies");
    }

    return Array.from(this.memoryPolicies.values()).filter((p) => p.status === "ACTIVE");
  }

  public async saveCircuitBreaker(state: CircuitBreakerState): Promise<CircuitBreakerState> {
    this.memoryCircuitBreakers.set(state.target, state);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const existing = await db
          .select()
          .from(runtimeGovernanceCircuitBreakers)
          .where(eq(runtimeGovernanceCircuitBreakers.target, state.target))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(runtimeGovernanceCircuitBreakers)
            .set({
              status: state.status,
              tripCount: state.tripCount,
              lastTrippedAt: state.lastTrippedAt,
              cooldownMs: state.cooldownMs,
              reason: state.reason,
              updatedAt: new Date(),
            })
            .where(eq(runtimeGovernanceCircuitBreakers.target, state.target));
        } else {
          await db.insert(runtimeGovernanceCircuitBreakers).values({
            target: state.target,
            status: state.status,
            tripCount: state.tripCount,
            lastTrippedAt: state.lastTrippedAt,
            cooldownMs: state.cooldownMs,
            reason: state.reason,
            updatedAt: new Date(),
          });
        }
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for saveCircuitBreaker");
    }

    return state;
  }

  public async getCircuitBreaker(target: string): Promise<CircuitBreakerState | null> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db
          .select()
          .from(runtimeGovernanceCircuitBreakers)
          .where(eq(runtimeGovernanceCircuitBreakers.target, target))
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          return {
            target: r.target,
            status: r.status as any,
            tripCount: r.tripCount || 0,
            lastTrippedAt: r.lastTrippedAt || undefined,
            cooldownMs: r.cooldownMs || 60000,
            reason: r.reason || undefined,
          };
        }
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for getCircuitBreaker");
    }

    return this.memoryCircuitBreakers.get(target) || null;
  }

  public async getAllCircuitBreakers(): Promise<CircuitBreakerState[]> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db.select().from(runtimeGovernanceCircuitBreakers);
        if (rows.length > 0) {
          return rows.map((r) => ({
            target: r.target,
            status: r.status as any,
            tripCount: r.tripCount || 0,
            lastTrippedAt: r.lastTrippedAt || undefined,
            cooldownMs: r.cooldownMs || 60000,
            reason: r.reason || undefined,
          }));
        }
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for getAllCircuitBreakers");
    }

    return Array.from(this.memoryCircuitBreakers.values());
  }

  public async saveKillSwitch(state: KillSwitchState): Promise<KillSwitchState> {
    this.memoryKillSwitches.set(state.scope, state);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const existing = await db
          .select()
          .from(runtimeGovernanceKillSwitches)
          .where(eq(runtimeGovernanceKillSwitches.scope, state.scope))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(runtimeGovernanceKillSwitches)
            .set({
              isActive: state.isActive,
              activatedBy: state.activatedBy,
              activatedAt: state.activatedAt,
              reason: state.reason,
              updatedAt: new Date(),
            })
            .where(eq(runtimeGovernanceKillSwitches.scope, state.scope));
        } else {
          await db.insert(runtimeGovernanceKillSwitches).values({
            scope: state.scope,
            isActive: state.isActive,
            activatedBy: state.activatedBy,
            activatedAt: state.activatedAt,
            reason: state.reason,
            updatedAt: new Date(),
          });
        }
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for saveKillSwitch");
    }

    return state;
  }

  public async getKillSwitch(scope: string = "GLOBAL"): Promise<KillSwitchState | null> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db
          .select()
          .from(runtimeGovernanceKillSwitches)
          .where(eq(runtimeGovernanceKillSwitches.scope, scope))
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          return {
            scope: r.scope as any,
            isActive: r.isActive,
            activatedBy: r.activatedBy || undefined,
            activatedAt: r.activatedAt || undefined,
            reason: r.reason || undefined,
          };
        }
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for getKillSwitch");
    }

    return this.memoryKillSwitches.get(scope) || null;
  }

  public async saveAuditLog(log: GovernanceAuditLogRecord): Promise<GovernanceAuditLogRecord> {
    this.memoryAuditLogs.push(log);

    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        await db.insert(runtimeGovernanceAuditLogs).values({
          logId: log.logId,
          evaluationId: log.evaluationId,
          actionType: log.actionType,
          actorId: log.actorId,
          resultStatus: log.resultStatus,
          riskScore: log.riskScore,
          details: log.details,
          createdAt: log.createdAt,
        });
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for saveAuditLog");
    }

    return log;
  }

  public async getAuditLogs(limit: number = 50): Promise<GovernanceAuditLogRecord[]> {
    try {
      const db = this.isTestEnvironment() ? null : getDb();
      if (db) {
        const rows = await db
          .select()
          .from(runtimeGovernanceAuditLogs)
          .orderBy(desc(runtimeGovernanceAuditLogs.createdAt))
          .limit(limit);

        if (rows.length > 0) {
          return rows.map((r) => ({
            logId: r.logId,
            evaluationId: r.evaluationId || undefined,
            actionType: r.actionType,
            actorId: r.actorId || undefined,
            resultStatus: r.resultStatus as any,
            riskScore: r.riskScore || 0,
            details: (r.details as any) || {},
            createdAt: r.createdAt,
          }));
        }
      }
    } catch (err: any) {
      logger.warn({ type: "RUNTIME_GOV_REPO_WARN", error: err.message }, "Fallback to memory store for getAuditLogs");
    }

    return [...this.memoryAuditLogs].reverse().slice(0, limit);
  }
}
