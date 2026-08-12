import { describe, it, expect, beforeEach } from "vitest";
import { Request, Response } from "express";
import { RuntimeGovernanceService } from "../services/runtime-governance.service.ts";
import { KillSwitchService } from "../services/kill-switch.service.ts";
import { CircuitBreakerService } from "../services/circuit-breaker.service.ts";
import { RuntimePolicyService } from "../services/runtime-policy.service.ts";
import { RuntimeGovernanceController } from "../controllers/runtime-governance.controller.ts";
import { EVALUATION_STATUSES, RUNTIME_GOVERNANCE_ERRORS } from "../constants/index.ts";

function createMockResponse() {
  let statusCode = 200;
  let jsonBody: any = null;

  const res: Partial<Response> = {
    status: (code: number) => {
      statusCode = code;
      return res as Response;
    },
    json: (data: any) => {
      jsonBody = data;
      return res as Response;
    },
  };

  return {
    res: res as Response,
    getStatus: () => statusCode,
    getBody: () => jsonBody,
  };
}

describe("Runtime Governance Module", () => {
  let governanceService: RuntimeGovernanceService;
  let killSwitchService: KillSwitchService;
  let circuitBreakerService: CircuitBreakerService;
  let policyService: RuntimePolicyService;
  let controller: RuntimeGovernanceController;

  beforeEach(async () => {
    governanceService = RuntimeGovernanceService.getInstance();
    killSwitchService = KillSwitchService.getInstance();
    circuitBreakerService = CircuitBreakerService.getInstance();
    policyService = RuntimePolicyService.getInstance();
    controller = RuntimeGovernanceController.getInstance();

    // Reset kill switch & circuit breaker to default clean state
    await killSwitchService.deactivateKillSwitch("GLOBAL", "SYSTEM", "Test reset", "SUPER_ADMIN");
    await circuitBreakerService.resetCircuitBreaker("GLOBAL", "TEST_RESET");
    await circuitBreakerService.resetCircuitBreaker("RELIANCE", "TEST_RESET");
  });

  describe("Health & Diagnostics", () => {
    it("should report healthy status when kill switch is inactive and breakers are closed", async () => {
      const health = await governanceService.getHealthStatus();
      expect(health.status).toBe("HEALTHY");
      expect(health.killSwitchActive).toBe(false);
      expect(health.circuitBreakersOpenCount).toBe(0);
      expect(health.activePoliciesCount).toBeGreaterThan(0);
    });

    it("should report CRITICAL health status when global kill switch is active", async () => {
      await killSwitchService.activateKillSwitch("GLOBAL", "SYSTEM", "Test critical alert", "SUPER_ADMIN");
      const health = await governanceService.getHealthStatus();
      expect(health.status).toBe("CRITICAL");
      expect(health.killSwitchActive).toBe(true);
    });
  });

  describe("Circuit Breaker Operations", () => {
    it("should trip circuit breaker and auto-transition to HALF_OPEN after cooldown", async () => {
      const tripped = await circuitBreakerService.tripCircuitBreaker("RELIANCE", "Volatility spike", 10000); // 10s cooldown
      expect(tripped.status).toBe("OPEN");

      const check1 = await circuitBreakerService.checkCircuitBreaker("RELIANCE");
      expect(check1.isOpen).toBe(true);

      // Fast-forward cooldown by tripping with 1ms cooldown
      await circuitBreakerService.tripCircuitBreaker("RELIANCE", "Volatility spike", 1);
      await new Promise((resolve) => setTimeout(resolve, 20));

      const check2 = await circuitBreakerService.checkCircuitBreaker("RELIANCE");
      expect(check2.isOpen).toBe(false);
      expect(check2.state.status).toBe("HALF_OPEN");
    });

    it("should allow manual reset of circuit breaker", async () => {
      await circuitBreakerService.tripCircuitBreaker("RELIANCE", "Error surge", 60000);
      const resetState = await circuitBreakerService.resetCircuitBreaker("RELIANCE", "ADMIN");
      expect(resetState.status).toBe("CLOSED");

      const check = await circuitBreakerService.checkCircuitBreaker("RELIANCE");
      expect(check.isOpen).toBe(false);
    });
  });

  describe("Kill Switch Authorization & Enforcement", () => {
    it("should allow authorized SUPER_ADMIN to activate kill switch", async () => {
      const activated = await killSwitchService.activateKillSwitch(
        "GLOBAL",
        "SUPER_ADMIN_USER",
        "Market emergency",
        "SUPER_ADMIN"
      );
      expect(activated.isActive).toBe(true);
      expect(activated.scope).toBe("GLOBAL");
    });

    it("should reject kill switch activation attempt by unauthorized VIEWER role", async () => {
      await expect(
        killSwitchService.activateKillSwitch("GLOBAL", "VIEWER_USER", "Halt request", "VIEWER")
      ).rejects.toThrow("is not authorized");
    });
  });

  describe("Policy & Pipeline Evaluation", () => {
    it("should approve compliant execution requests", async () => {
      const result = await governanceService.evaluateAction({
        actionType: "EXECUTE",
        role: "SUPER_ADMIN",
        actorId: "ADM-101",
        symbol: "TCS",
        amount: 100000, // Within 50L limit
      });

      expect(result.status).toBe(EVALUATION_STATUSES.APPROVED);
      expect(result.isCompliant).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.riskScore).toBeLessThan(50);
    });

    it("should reject requests violating max trade value limit", async () => {
      const result = await governanceService.evaluateAction({
        actionType: "EXECUTE",
        role: "OPERATOR",
        actorId: "OP-202",
        symbol: "INFY",
        amount: 10000000, // 1 Crore INR (exceeds 50L limit)
      });

      expect(result.status).toBe(EVALUATION_STATUSES.REJECTED);
      expect(result.isCompliant).toBe(false);
      expect(result.violations.some((v) => v.policyId === "POL-RISK-MAX-VAL")).toBe(true);
    });

    it("should reject requests with unauthorized roles via Constitution Engine", async () => {
      const result = await governanceService.evaluateAction({
        actionType: "EXECUTE",
        role: "VIEWER",
        actorId: "VIEW-001",
        symbol: "SBIN",
        amount: 50000,
      });

      expect(result.status).toBe(EVALUATION_STATUSES.REJECTED);
      expect(result.isCompliant).toBe(false);
      expect(result.violations.some((v) => v.policyId === "POL-COMP-ROLE-PERM")).toBe(true);
    });

    it("should return KILL_SWITCH_ACTIVE when global kill switch is triggered", async () => {
      await killSwitchService.activateKillSwitch("GLOBAL", "SYSTEM", "Emergency halt", "SUPER_ADMIN");

      const result = await governanceService.evaluateAction({
        actionType: "EXECUTE",
        role: "SUPER_ADMIN",
        actorId: "ADM-101",
        symbol: "TCS",
        amount: 10000,
      });

      expect(result.status).toBe(EVALUATION_STATUSES.KILL_SWITCH_ACTIVE);
      expect(result.isCompliant).toBe(false);
    });
  });

  describe("Business Rule Isolation Boundaries", () => {
    it("should throw prohibition error if direct order execution is attempted on governance engine", () => {
      expect(() => governanceService.executeOrderDirectly()).toThrow(
        RUNTIME_GOVERNANCE_ERRORS.EXECUTION_PROHIBITED
      );
    });

    it("should throw prohibition error if direct fund transfer is attempted on governance engine", () => {
      expect(() => governanceService.transferFundsDirectly()).toThrow(
        RUNTIME_GOVERNANCE_ERRORS.EXECUTION_PROHIBITED
      );
    });
  });

  describe("Controller HTTP Endpoint Handlers", () => {
    it("getHealth should return 200 OK and health status object", async () => {
      const mock = createMockResponse();
      const req = {} as Request;

      await controller.getHealth(req, mock.res);

      expect(mock.getStatus()).toBe(200);
      expect(mock.getBody()).toHaveProperty("status");
      expect(mock.getBody()).toHaveProperty("killSwitchActive");
      expect(mock.getBody()).toHaveProperty("activePoliciesCount");
    });

    it("evaluateAction controller should return evaluation result", async () => {
      const mock = createMockResponse();
      const req = {
        body: {
          actionType: "EXECUTE",
          role: "SUPER_ADMIN",
          actorId: "TEST-ACTOR",
          symbol: "HDFCBANK",
          amount: 250000,
        },
      } as Request;

      await controller.evaluateAction(req, mock.res);

      expect(mock.getStatus()).toBe(200);
      expect(mock.getBody()).toHaveProperty("evaluationId");
      expect(mock.getBody().status).toBe(EVALUATION_STATUSES.APPROVED);
      expect(mock.getBody().isCompliant).toBe(true);
    });

    it("getPolicies controller should return list of active policies", async () => {
      const mock = createMockResponse();
      const req = {} as Request;

      await controller.getPolicies(req, mock.res);

      expect(mock.getStatus()).toBe(200);
      expect(Array.isArray(mock.getBody().policies)).toBe(true);
      expect(mock.getBody().policies.length).toBeGreaterThan(0);
    });

    it("createPolicy controller should create a new policy", async () => {
      const mock = createMockResponse();
      const req = {
        body: {
          policyId: "POL-TEST-CUSTOM",
          name: "Custom Test Policy",
          category: "COMPLIANCE_RULE",
          enforcementLevel: "WARNING_ONLY",
          ruleConfig: { customField: true },
        },
      } as Request;

      await controller.createPolicy(req, mock.res);

      expect(mock.getStatus()).toBe(201);
      expect(mock.getBody().policyId).toBe("POL-TEST-CUSTOM");
    });

    it("activateKillSwitch and deactivateKillSwitch controllers should manage kill switch state", async () => {
      const actMock = createMockResponse();
      const actReq = {
        body: {
          scope: "GLOBAL",
          operator: "TEST_OPERATOR",
          reason: "Emergency test",
          role: "SUPER_ADMIN",
        },
        headers: {},
      } as unknown as Request;

      await controller.activateKillSwitch(actReq, actMock.res);

      expect(actMock.getStatus()).toBe(200);
      expect(actMock.getBody().isActive).toBe(true);

      const deactMock = createMockResponse();
      const deactReq = {
        body: {
          scope: "GLOBAL",
          operator: "TEST_OPERATOR",
          reason: "Clear emergency",
          role: "SUPER_ADMIN",
        },
        headers: {},
      } as unknown as Request;

      await controller.deactivateKillSwitch(deactReq, deactMock.res);

      expect(deactMock.getStatus()).toBe(200);
      expect(deactMock.getBody().isActive).toBe(false);
    });

    it("getAuditLogs controller should return audit log records", async () => {
      const mock = createMockResponse();
      const req = {
        query: { limit: "10" },
      } as unknown as Request;

      await controller.getAuditLogs(req, mock.res);

      expect(mock.getStatus()).toBe(200);
      expect(Array.isArray(mock.getBody().logs)).toBe(true);
    });
  });
});
