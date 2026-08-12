import { describe, it, expect, beforeEach, vi } from "vitest";
import { PositionStateMachine } from "./state-machine/position-state-machine.ts";
import { PortfolioValidator } from "./validators/portfolio.validator.ts";
import { PositionEngine } from "./engines/position.engine.ts";
import { HoldingEngine } from "./engines/holding.engine.ts";
import { MTMEngine } from "./engines/mtm.engine.ts";
import { PnLEngine } from "./engines/pnl.engine.ts";
import { ExposureEngine } from "./engines/exposure.engine.ts";
import { SnapshotEngine } from "./engines/snapshot.engine.ts";
import { PortfolioService } from "./services/portfolio.service.ts";
import { PortfolioHealthService } from "./services/portfolio-health.service.ts";
import { PortfolioRegistryService } from "./services/portfolio-registry.service.ts";
import { OMSExecutionUpdate, PortfolioAccount, PortfolioPosition } from "./types/index.ts";

// Mock DB client for portfolio repository testing
vi.mock("../../db/client.ts", () => {
  const store = {
    accounts: new Map<string, any>(),
    positions: new Map<string, any>(),
    holdings: new Map<string, any>(),
    snapshots: [] as any[],
    pnl: [] as any[],
    events: [] as any[],
    metadata: new Map<string, any>(),
  };

  // Seed default portfolio
  store.accounts.set("PF-MAIN-001", {
    id: 1,
    portfolioId: "PF-MAIN-001",
    name: "Main Enterprise Portfolio",
    status: "ACTIVE",
    totalValue: 1000000.0,
    cashBalance: 1000000.0,
    unrealizedPnl: 0.0,
    realizedPnl: 0.0,
    grossExposure: 0.0,
    netExposure: 0.0,
  });

  const db = {
    transaction: async (cb: any) => cb(db),
    insert: (table: any) => ({
      values: (val: any) => {
        const valObj = Array.isArray(val) ? val[0] : val;
        const result = {
          id: Math.floor(Math.random() * 10000) + 1,
          ...valObj,
          createdAt: new Date(),
          updatedAt: new Date(),
          timestamp: new Date(),
        };

        if (valObj.portfolioId && valObj.name) {
          store.accounts.set(valObj.portfolioId, result);
        } else if (valObj.positionId) {
          store.positions.set(valObj.positionId, result);
        } else if (valObj.holdingId) {
          store.holdings.set(valObj.holdingId, result);
        } else if (valObj.snapshotId) {
          store.snapshots.push(result);
        } else if (valObj.pnlRecordId) {
          store.pnl.push(result);
        } else if (valObj.eventId) {
          store.events.push(result);
        }

        return {
          returning: () => [result],
        };
      },
    }),
    select: () => ({
      from: (table: any) => ({
        where: (condition: any) => ({
          limit: (n: number) => {
            const acc = Array.from(store.accounts.values());
            if (acc.length > 0) return [acc[0]];
            return [];
          },
          orderBy: () => ({
            limit: () => Array.from(store.snapshots.values()),
          }),
        }),
        orderBy: () => ({
          limit: () => Array.from(store.snapshots.values()),
        }),
      }),
    }),
    update: () => ({
      set: (val: any) => ({
        where: (cond: any) => ({
          returning: () => [{ id: 1, ...val }],
        }),
      }),
    }),
  };

  return {
    getDb: () => db,
  };
});

describe("Phase 2.11 Enterprise Portfolio Foundation Tests", () => {
  describe("Position State Machine", () => {
    it("should allow legal state transitions", () => {
      expect(PositionStateMachine.canTransition("OPEN", "INCREASED")).toBe(true);
      expect(PositionStateMachine.canTransition("INCREASED", "REDUCED")).toBe(true);
      expect(PositionStateMachine.canTransition("REDUCED", "PARTIALLY_CLOSED")).toBe(true);
      expect(PositionStateMachine.canTransition("PARTIALLY_CLOSED", "CLOSED")).toBe(true);
      expect(PositionStateMachine.canTransition("CLOSED", "ARCHIVED")).toBe(true);
    });

    it("should reject illegal state transitions", () => {
      expect(PositionStateMachine.canTransition("CLOSED", "OPEN")).toBe(false);
      expect(PositionStateMachine.canTransition("ARCHIVED", "INCREASED")).toBe(false);
      expect(() => PositionStateMachine.assertTransition("CLOSED", "OPEN")).toThrowError();
    });
  });

  describe("Portfolio Validator", () => {
    it("should validate governance source", () => {
      const exec: OMSExecutionUpdate = {
        orderId: "ORD-001",
        portfolioId: "PF-MAIN-001",
        symbol: "RELIANCE",
        side: "BUY",
        filledQuantity: 10,
        averageFillPrice: 2500,
      };

      const validGov = PortfolioValidator.validateGovernance(exec, "OMS");
      expect(validGov.passed).toBe(true);

      const invalidGov = PortfolioValidator.validateGovernance(exec, "EXTERNAL_BROKER");
      expect(invalidGov.passed).toBe(false);
      expect(invalidGov.message).toContain("accepted ONLY from OMS");
    });

    it("should validate portfolio account status", () => {
      const activeAcc: PortfolioAccount = {
        portfolioId: "PF-MAIN-001",
        name: "Main",
        status: "ACTIVE",
        totalValue: 1000,
        cashBalance: 1000,
        unrealizedPnl: 0,
        realizedPnl: 0,
        grossExposure: 0,
        netExposure: 0,
      };

      expect(PortfolioValidator.validatePortfolio(activeAcc).passed).toBe(true);

      const inactiveAcc: PortfolioAccount = { ...activeAcc, status: "INACTIVE" };
      expect(PortfolioValidator.validatePortfolio(inactiveAcc).passed).toBe(false);
    });
  });

  describe("Position Engine", () => {
    it("should open a new position from execution", () => {
      const exec: OMSExecutionUpdate = {
        orderId: "ORD-1001",
        portfolioId: "PF-MAIN-001",
        symbol: "TCS",
        side: "BUY",
        filledQuantity: 100,
        averageFillPrice: 3500.0,
      };

      const { position, eventType } = PositionEngine.processExecution(exec);
      expect(eventType).toBe("POSITION_OPENED");
      expect(position.symbol).toBe("TCS");
      expect(position.netQuantity).toBe(100);
      expect(position.averagePrice).toBe(3500.0);
      expect(position.costValue).toBe(350000.0);
      expect(position.status).toBe("OPEN");
    });

    it("should handle position size increase", () => {
      const initialPos: PortfolioPosition = {
        positionId: "POS-1",
        portfolioId: "PF-MAIN-001",
        symbol: "TCS",
        positionType: "DELIVERY",
        status: "OPEN",
        netQuantity: 100,
        averagePrice: 3500.0,
        currentPrice: 3500.0,
        marketValue: 350000.0,
        costValue: 350000.0,
        unrealizedPnl: 0,
        realizedPnl: 0,
        todaysPnl: 0,
        totalPnl: 0,
        roi: 0,
        capitalUsed: 350000.0,
        exposure: 350000.0,
        holdingPeriodDays: 1,
      };

      const secondExec: OMSExecutionUpdate = {
        orderId: "ORD-1002",
        portfolioId: "PF-MAIN-001",
        symbol: "TCS",
        side: "BUY",
        filledQuantity: 100,
        averageFillPrice: 3700.0,
      };

      const { position, eventType } = PositionEngine.processExecution(secondExec, initialPos);
      expect(eventType).toBe("POSITION_INCREASED");
      expect(position.status).toBe("INCREASED");
      expect(position.netQuantity).toBe(200);
      expect(position.averagePrice).toBe(3600.0); // (3500*100 + 3700*100) / 200
    });

    it("should handle position reduction and calculate realized PnL", () => {
      const initialPos: PortfolioPosition = {
        positionId: "POS-1",
        portfolioId: "PF-MAIN-001",
        symbol: "TCS",
        positionType: "DELIVERY",
        status: "OPEN",
        netQuantity: 100,
        averagePrice: 3500.0,
        currentPrice: 3500.0,
        marketValue: 350000.0,
        costValue: 350000.0,
        unrealizedPnl: 0,
        realizedPnl: 0,
        todaysPnl: 0,
        totalPnl: 0,
        roi: 0,
        capitalUsed: 350000.0,
        exposure: 350000.0,
        holdingPeriodDays: 1,
      };

      const sellExec: OMSExecutionUpdate = {
        orderId: "ORD-1003",
        portfolioId: "PF-MAIN-001",
        symbol: "TCS",
        side: "SELL",
        filledQuantity: 50,
        averageFillPrice: 4000.0,
      };

      const { position, eventType } = PositionEngine.processExecution(sellExec, initialPos);
      expect(eventType).toBe("POSITION_REDUCED");
      expect(position.status).toBe("PARTIALLY_CLOSED");
      expect(position.netQuantity).toBe(50);
      expect(position.realizedPnl).toBe(25000.0); // 50 * (4000 - 3500)
    });
  });

  describe("Holding Engine", () => {
    it("should derive holdings from positions with correct weights", () => {
      const positions: PortfolioPosition[] = [
        {
          positionId: "P1",
          portfolioId: "PF-MAIN-001",
          symbol: "INFY",
          positionType: "DELIVERY",
          status: "OPEN",
          netQuantity: 100,
          averagePrice: 1500,
          currentPrice: 1500,
          marketValue: 150000,
          costValue: 150000,
          unrealizedPnl: 0,
          realizedPnl: 0,
          todaysPnl: 0,
          totalPnl: 0,
          roi: 0,
          capitalUsed: 150000,
          exposure: 150000,
          holdingPeriodDays: 1,
        },
      ];

      const holdings = HoldingEngine.generateHoldings("PF-MAIN-001", positions, 1000000.0);
      expect(holdings.length).toBe(1);
      expect(holdings[0].symbol).toBe("INFY");
      expect(holdings[0].weight).toBe(15.0); // 150000 / 1000000 * 100
    });
  });

  describe("MTM & PnL & Exposure Engines", () => {
    it("should compute accurate MTM, PnL and Exposure metrics", () => {
      const positions: PortfolioPosition[] = [
        {
          positionId: "P1",
          portfolioId: "PF-MAIN-001",
          symbol: "HDFCBANK",
          positionType: "DELIVERY",
          status: "OPEN",
          netQuantity: 200,
          averagePrice: 1600,
          currentPrice: 1700,
          marketValue: 340000,
          costValue: 320000,
          unrealizedPnl: 20000,
          realizedPnl: 5000,
          todaysPnl: 20000,
          totalPnl: 25000,
          roi: 7.81,
          capitalUsed: 320000,
          exposure: 340000,
          holdingPeriodDays: 5,
        },
      ];

      const mtm = MTMEngine.calculateMTM(positions);
      expect(mtm.runningMtm).toBe(20000);

      const pnl = PnLEngine.calculatePnL(positions);
      expect(pnl.unrealizedPnl).toBe(20000);
      expect(pnl.realizedPnl).toBe(5000);
      expect(pnl.totalPnl).toBe(25000);

      const exp = ExposureEngine.calculateExposure(positions, 1000000);
      expect(exp.grossExposure).toBe(340000);
      expect(exp.netExposure).toBe(340000);
      expect(exp.capitalUtilization).toBe(34.0);
    });
  });

  describe("Snapshot Engine", () => {
    it("should generate immutable snapshot objects", () => {
      const acc: PortfolioAccount = {
        portfolioId: "PF-MAIN-001",
        name: "Main",
        status: "ACTIVE",
        totalValue: 1000000,
        cashBalance: 1000000,
        unrealizedPnl: 0,
        realizedPnl: 0,
        grossExposure: 0,
        netExposure: 0,
      };

      const snapshot = SnapshotEngine.createSnapshot(acc, [], "DAILY");
      expect(snapshot.snapshotType).toBe("DAILY");
      expect(snapshot.portfolioId).toBe("PF-MAIN-001");
      expect(snapshot.totalValue).toBe(1000000);
    });
  });

  describe("Portfolio Services & Registry", () => {
    it("should report system health and ready status", async () => {
      const healthService = new PortfolioHealthService();
      const report = await healthService.getHealthReport("PF-MAIN-001");
      expect(report.status).toBe("HEALTHY");
      expect(report.checks.registryReady).toBe(true);

      const registry = PortfolioRegistryService.getInstance();
      expect(registry.isSystemReady()).toBe(true);
      expect(registry.getEngines().length).toBe(7);
    });
  });
});
