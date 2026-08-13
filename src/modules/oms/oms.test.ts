import { describe, it, expect, beforeEach, vi } from "vitest";
import { OrderStateMachine } from "./state-machine/order-state-machine.ts";
import { OrderValidator } from "./validators/order.validator.ts";
import { ExecutionValidator } from "./validators/execution.validator.ts";
import { OMSService } from "./services/oms.service.ts";
import { OMSHealthService } from "./services/oms-health.service.ts";
import { OMSMetadataService } from "./services/oms-metadata.service.ts";
import { OMSRegistryService } from "./services/oms-registry.service.ts";
import { OrderLifecycleManager } from "./lifecycle/order-lifecycle.manager.ts";
import { CreateOrderRequest, OMSOrder } from "./types/index.ts";

// Mock DB client
vi.mock("../../db/client.ts", () => {
  const store = {
    orders: new Map<string, any>(),
    history: [] as any[],
    transitions: [] as any[],
    queue: [] as any[],
    metadata: new Map<string, any>(),
    events: [] as any[],
  };

  const db = {
    transaction: async (cb: any) => {
      return await cb(db);
    },
    insert: (table: any) => ({
      values: (val: any) => {
        const valObj = Array.isArray(val) ? val[0] : val;
        const result = {
          id: Math.floor(Math.random() * 10000) + 1,
          ...valObj,
          createdAt: valObj.createdAt || new Date(),
          updatedAt: valObj.updatedAt || new Date(),
          queuedAt: valObj.queuedAt || new Date(),
          timestamp: valObj.timestamp || new Date(),
        };

        if (valObj.orderId && valObj.symbol && valObj.side) {
          store.orders.set(valObj.orderId, result);
        }
        if (valObj.historyId) {
          store.history.push(result);
        }
        if (valObj.transitionId) {
          store.transitions.push(result);
        }
        if (valObj.queueId) {
          store.queue.push(result);
        }
        if (valObj.eventId) {
          store.events.push(result);
        }

        return {
          returning: () => [result],
          onConflictDoUpdate: () => ({
            returning: () => [result],
          }),
        };
      },
    }),
    select: () => ({
      from: (table: any) => ({
        where: (cond: any) => {
          const targetId = cond?.value || (cond?.queryChunks ? cond.queryChunks[cond.queryChunks.length - 1] : null);
          const filterOrders = () => {
            const list = Array.from(store.orders.values()).filter((o) => o && o.orderId);
            if (targetId && typeof targetId === "string") {
              const matched = store.orders.get(targetId);
              return matched ? [matched] : list;
            }
            return list;
          };
          return {
            limit: (n: number) => filterOrders(),
            orderBy: () => filterOrders(),
          };
        },
        orderBy: () => ({
          limit: (n: number) => Array.from(store.orders.values()).filter((o) => o && o.orderId),
        }),
        limit: (n: number) => Array.from(store.orders.values()).filter((o) => o && o.orderId),
      }),
    }),
    update: (table: any) => ({
      set: (data: any) => ({
        where: (cond: any) => {
          for (const [id, ord] of store.orders.entries()) {
            if (id) {
              store.orders.set(id, { ...ord, ...data });
            }
          }
          return { returning: () => [] };
        },
      }),
    }),
  };

  return {
    getDb: () => db,
  };
});

describe("Phase 2.10 Enterprise OMS Foundation Tests", () => {
  describe("1. Order State Machine & Illegal Transition Protection", () => {
    it("should allow valid state transitions", () => {
      expect(OrderStateMachine.canTransition("CREATED", "VALIDATED")).toBe(true);
      expect(OrderStateMachine.canTransition("VALIDATED", "QUEUED")).toBe(true);
      expect(OrderStateMachine.canTransition("QUEUED", "READY")).toBe(true);
      expect(OrderStateMachine.canTransition("READY", "SUBMITTED")).toBe(true);
      expect(OrderStateMachine.canTransition("SUBMITTED", "FILLED")).toBe(true);
      expect(OrderStateMachine.canTransition("FILLED", "ARCHIVED")).toBe(true);
    });

    it("should allow cancellation and rejection from active states", () => {
      expect(OrderStateMachine.canTransition("CREATED", "CANCELLED")).toBe(true);
      expect(OrderStateMachine.canTransition("VALIDATED", "REJECTED")).toBe(true);
      expect(OrderStateMachine.canTransition("QUEUED", "CANCELLED")).toBe(true);
      expect(OrderStateMachine.canTransition("READY", "EXPIRED")).toBe(true);
    });

    it("should block illegal state transitions", () => {
      expect(OrderStateMachine.canTransition("CREATED", "FILLED")).toBe(false);
      expect(OrderStateMachine.canTransition("ARCHIVED", "CREATED")).toBe(false);
      expect(OrderStateMachine.canTransition("CANCELLED", "FILLED")).toBe(false);
      expect(OrderStateMachine.canTransition("FILLED", "QUEUED")).toBe(false);
    });

    it("should throw error when assertTransition fails", () => {
      expect(() => OrderStateMachine.assertTransition("CREATED", "FILLED")).toThrowError(
        /Illegal State Transition/
      );
    });
  });

  describe("2. Order Validators", () => {
    it("should pass valid order request parameters", () => {
      const validReq: CreateOrderRequest = {
        decisionId: "DEC-1001",
        symbol: "RELIANCE",
        side: "BUY",
        orderType: "LIMIT",
        quantity: 100,
        price: 2500,
      };

      const result = OrderValidator.validateOrderRequest(validReq);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should fail order request if price is missing for LIMIT order", () => {
      const invalidReq: CreateOrderRequest = {
        decisionId: "DEC-1002",
        symbol: "TCS",
        side: "BUY",
        orderType: "LIMIT",
        quantity: 50,
      };

      const result = OrderValidator.validateOrderRequest(invalidReq);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("price is required for LIMIT orders and must be > 0");
    });

    it("should validate Risk Approval in ExecutionValidator", async () => {
      const approvedReq: CreateOrderRequest = {
        decisionId: "DEC-1003",
        symbol: "INFY",
        side: "SELL",
        orderType: "MARKET",
        quantity: 200,
        metadata: { riskApproved: true },
      };

      const riskResult = await ExecutionValidator.validateRiskApproval(approvedReq);
      expect(riskResult.passed).toBe(true);

      const rejectedReq: CreateOrderRequest = {
        ...approvedReq,
        metadata: { riskApproved: false },
      };

      const rejectResult = await ExecutionValidator.validateRiskApproval(rejectedReq);
      expect(rejectResult.passed).toBe(false);
      expect(rejectResult.message).toContain("Execution Rejected");
    });
  });

  describe("3. OMS Pipeline & Business Rules", () => {
    let service: OMSService;

    beforeEach(() => {
      service = new OMSService();
    });

    it("should process a Risk Approved request through all 10 pipeline stages", async () => {
      const req: CreateOrderRequest = {
        decisionId: "DEC-5001",
        symbol: "TATAMOTORS",
        side: "BUY",
        orderType: "LIMIT",
        quantity: 500,
        price: 650,
        metadata: { riskApproved: true },
      };

      const result = await service.processOrderRequest(req);

      expect(result.approved).toBe(true);
      expect(result.status).toBe("READY");
      expect(result.orderId).toBeDefined();
      expect(result.stageLogs.length).toBe(10);
      expect(result.stageLogs.every((s) => s.passed)).toBe(true);
    });

    it("should reject order if Risk Approval is false", async () => {
      const req: CreateOrderRequest = {
        decisionId: "DEC-5002",
        symbol: "HDFCBANK",
        side: "BUY",
        orderType: "MARKET",
        quantity: 100,
        metadata: { riskApproved: false },
      };

      const result = await service.processOrderRequest(req);

      expect(result.approved).toBe(false);
      expect(result.status).toBe("REJECTED");
      expect(result.reasons[0]).toContain("Execution Rejected");
    });
  });

  describe("4. OMS System Registry, Health & Metadata Services", () => {
    it("should verify OMS Registry components", () => {
      const registry = OMSRegistryService.getInstance();
      const components = registry.getComponents();
      expect(components.length).toBeGreaterThan(0);
      expect(registry.isSystemReady()).toBe(true);
    });

    it("should produce health report via OMSHealthService", async () => {
      const healthService = new OMSHealthService();
      const report = await healthService.getHealthReport();

      expect(report.status).toBe("HEALTHY");
      expect(report.systemStance).toContain("OMS OPERATIONAL");
      expect(report.timestamp).toBeDefined();
    });

    it("should save and retrieve metadata via OMSMetadataService", async () => {
      const metadataService = new OMSMetadataService();
      const orderId = "ORD-TEST-META";

      const saved = await metadataService.saveMetadata({
        orderId,
        clientTag: "ALGO-A1",
        executionVenue: "INTERNAL-MATCH",
        tags: ["VIP", "HFT"],
        customRules: { maxSlippage: 0.001 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(saved.orderId).toBe(orderId);
      expect(saved.tags).toContain("HFT");
    });
  });
});
