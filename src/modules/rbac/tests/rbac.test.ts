import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { sql } from "drizzle-orm";
import { PermissionRepository } from "../repositories/PermissionRepository.ts";
import { PermissionService } from "../services/PermissionService.ts";
import { AuthorizationEngine } from "../services/AuthorizationEngine.ts";

describe("Enterprise RBAC & Permission Engine Tests", () => {
  let permissionRepo: PermissionRepository;
  let permissionService: PermissionService;
  let authorizationEngine: AuthorizationEngine;

  const testUserId = 1;
  const adminUserId = 1001;
  const regularUserId = 1002;
  const externalUserId = 1003;

  beforeAll(async () => {
    permissionRepo = new PermissionRepository();
    permissionService = new PermissionService();
    authorizationEngine = new AuthorizationEngine();

    // Verify DB availability and provision schema
    await permissionRepo.ensureRbacTables();
  });

  it("should verify core RBAC database tables exist", async () => {
    const db = getDb();
    const tables = [
      "rbac_roles",
      "rbac_permissions",
      "rbac_role_permissions",
      "rbac_user_roles",
      "rbac_policies",
      "rbac_permission_logs",
      "rbac_cache"
    ];

    for (const table of tables) {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${table}
        )
      `);
      expect(result[0]?.exists).toBe(true);
    }
  });

  it("should support role and permission assignment", async () => {
    // 1. Create custom permission
    const suffix = Date.now() + Math.floor(Math.random() * 1000);
    const permissionId = `custom.perf-test-${suffix}`;
    await permissionService.createPermission(permissionId, "Performance Check", "Runs enterprise latency test suite");

    // 2. Create custom role
    const customRoleId = `CUSTOM_LEAD_${suffix}`;
    await permissionService.createCustomRole(customRoleId, "Custom Lead", "Custom lead developer role");

    // 3. Assign permission to custom role
    await permissionService.assignPermissionToRole(customRoleId, permissionId);

    // 4. Assign role to user
    const assignment = await permissionService.assignRoleToUser(regularUserId, customRoleId);
    expect(assignment).toBeDefined();
    expect(assignment.userId).toBe(regularUserId);
    expect(assignment.roleId).toBe(customRoleId);

    // Clean up or keep for checks
    const activeRoles = await permissionService.getUserRoles(regularUserId);
    expect(activeRoles.some(r => r.roleId === customRoleId)).toBe(true);
  });

  it("should enforce Permission Resolution and Permission Inheritance", async () => {
    const suffix = Date.now() + Math.floor(Math.random() * 1000);
    const childRoleId = `CUSTOM_SENIOR_ANALYST_${suffix}`;
    const parentRoleId = "ANALYST"; // Built-in role

    // Create Senior Analyst which inherits from Analyst
    await permissionService.createCustomRole(childRoleId, "Senior Analyst", "Senior level analyst", parentRoleId);
    
    // Assign user to Senior Analyst
    await permissionService.assignRoleToUser(adminUserId, childRoleId);

    // Resolve active roles including inheritance chain
    const resolvedRoles = await permissionRepo.getUserRoles(adminUserId);
    expect(resolvedRoles.some(r => r.roleId === childRoleId)).toBe(true);

    // Verify permission is inherited. Analyst has "research.read"
    const decision = await authorizationEngine.checkPermission(adminUserId, "research.read", "res-123");
    expect(decision.granted).toBe(true);
    expect(decision.reason).toContain("Access granted");
  });

  it("should evaluate Access Policies: Allow, Deny, and Explicit Deny Overrides", async () => {
    const suffix = Date.now() + Math.floor(Math.random() * 1000);
    const policyId = `pol-test-deny-${suffix}`;
    
    // Create an explicit Deny policy for user on research export action
    await permissionService.createPolicy({
      id: policyId,
      name: "Enforce export restriction",
      effect: "DENY",
      actions: ["research.export"],
      resources: ["*"],
      conditions: {},
      organizationId: null,
      workspaceId: null
    });

    // Even if user gets ORG_OWNER / PLATFORM_ADMIN role, the DENY policy overrides it.
    await permissionService.assignRoleToUser(regularUserId, "PLATFORM_ADMIN");

    const decision = await authorizationEngine.checkPermission(regularUserId, "research.export", "res-xyz");
    expect(decision.granted).toBe(false);
    expect(decision.reason).toContain("Explicit Deny");

    // Clean up policy
    await permissionService.deletePolicy(policyId);
  });

  it("should enforce Tenant Isolation (Cross-Tenant Isolation)", async () => {
    const tenantOrgId = "tenant-labs-alpha";
    const userInTenant = 2001;

    // Map role specifically to organization
    await permissionService.assignRoleToUser(userInTenant, "MEMBER", tenantOrgId);

    // Check action inside tenant workspace context
    const decisionAllow = await authorizationEngine.checkPermission(userInTenant, "workspace.read", "wks-999", {
      userId: userInTenant,
      organizationId: tenantOrgId
    });
    expect(decisionAllow.granted).toBe(true);

    // Attempting cross-tenant access with unauthorized user
    const decisionDeny = await authorizationEngine.checkPermission(externalUserId, "workspace.read", "wks-999", {
      userId: externalUserId,
      organizationId: tenantOrgId
    });
    expect(decisionDeny.granted).toBe(false);
    expect(decisionDeny.reason).toContain("Tenant isolation");
  });

  it("should enforce Least Privilege (Deny by default unless explicitly allowed)", async () => {
    const freshUser = 9999;
    // freshUser has absolutely no roles, no memberships, and no policies.
    const decision = await authorizationEngine.checkPermission(freshUser, "ai.manage", "endpoint-001");
    expect(decision.granted).toBe(false);
    expect(decision.reason).toMatch(/Denied|Least Privilege/);
  });

  it("should log permission evaluations and compute latencies", async () => {
    const stats = await permissionService.getObservabilityStats();
    expect(stats).toBeDefined();
    expect(stats.totalChecks).toBeGreaterThanOrEqual(1);
    expect(stats.avgLatencyMs).toBeGreaterThanOrEqual(0);
    expect(stats.recentLogs.length).toBeGreaterThanOrEqual(1);
  });
});
