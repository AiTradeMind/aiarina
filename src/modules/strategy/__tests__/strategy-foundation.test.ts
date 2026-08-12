import { describe, it, expect, beforeEach } from "vitest";
import {
  STRATEGY_TYPES,
  SIGNAL_TYPES,
  STRATEGY_STATUSES,
  STRATEGY_ERRORS,
} from "../foundation/constants/index.ts";
import { StrategyFoundationRepository } from "../foundation/repositories/strategy-foundation.repository.ts";
import { StrategyValidatorService } from "../foundation/services/strategy-validator.service.ts";
import { SignalGeneratorService } from "../foundation/services/signal-generator.service.ts";
import { StrategyPipelineService } from "../foundation/services/strategy-pipeline.service.ts";
import { StrategyFoundationService } from "../foundation/services/strategy-foundation.service.ts";
import { StrategyFoundationController } from "../foundation/controllers/strategy-foundation.controller.ts";

describe("Phase 2.5 Strategy Engine Foundation", () => {
  let repository: StrategyFoundationRepository;
  let validator: StrategyValidatorService;
  let signalGenerator: SignalGeneratorService;
  let pipeline: StrategyPipelineService;
  let service: StrategyFoundationService;
  let controller: StrategyFoundationController;

  beforeEach(() => {
    repository = StrategyFoundationRepository.getInstance();
    validator = StrategyValidatorService.getInstance();
    signalGenerator = SignalGeneratorService.getInstance();
    pipeline = StrategyPipelineService.getInstance();
    service = StrategyFoundationService.getInstance();
    controller = StrategyFoundationController.getInstance();
  });

  describe("Strategy Foundation Repository", () => {
    it("should save a strategy definition and retrieve it by ID", async () => {
      const id = `STR-TEST-${Date.now()}`;
      const saved = await repository.saveStrategy({
        strategyId: id,
        name: "Test Momentum Strategy",
        strategyType: STRATEGY_TYPES.MOMENTUM,
        status: STRATEGY_STATUSES.DRAFT,
        timeframe: "15M",
        symbol: "RELIANCE",
        config: { rsiThreshold: 65 },
        author: "TEST_USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(saved.strategyId).toBe(id);

      const retrieved = await repository.getStrategyById(id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe("Test Momentum Strategy");
      expect(retrieved?.symbol).toBe("RELIANCE");
    });

    it("should query strategies with status and strategyType filters", async () => {
      const id1 = `STR-SWING-${Date.now()}`;
      await repository.saveStrategy({
        strategyId: id1,
        name: "Test Swing Strategy",
        strategyType: STRATEGY_TYPES.SWING,
        status: STRATEGY_STATUSES.ACTIVE,
        timeframe: "1D",
        symbol: "INFY",
        config: {},
        author: "SYSTEM",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const activeList = await repository.queryStrategies({ status: STRATEGY_STATUSES.ACTIVE });
      expect(activeList.length).toBeGreaterThan(0);
      expect(activeList.some((s) => s.strategyId === id1)).toBe(true);
    });

    it("should handle status transitions and record history", async () => {
      const id = `STR-STATUS-${Date.now()}`;
      await repository.saveStrategy({
        strategyId: id,
        name: "Test Status Strategy",
        strategyType: STRATEGY_TYPES.TREND_FOLLOWING,
        status: STRATEGY_STATUSES.DRAFT,
        timeframe: "1D",
        config: {},
        author: "SYSTEM",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updated = await repository.updateStrategyStatus(id, STRATEGY_STATUSES.ACTIVE, "ADMIN", "Activation test");
      expect(updated?.status).toBe(STRATEGY_STATUSES.ACTIVE);

      const history = await repository.getHistory(id);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].toStatus).toBe(STRATEGY_STATUSES.ACTIVE);
      expect(history[0].changedBy).toBe("ADMIN");
    });
  });

  describe("Strategy Validator Service", () => {
    it("should validate configurations for supported strategy types", () => {
      const validMomentum = validator.validateConfiguration({ rsiThreshold: 70 }, STRATEGY_TYPES.MOMENTUM);
      expect(validMomentum.isValid).toBe(true);

      const invalidMomentum = validator.validateConfiguration({ rsiThreshold: 150 }, STRATEGY_TYPES.MOMENTUM);
      expect(invalidMomentum.isValid).toBe(false);
      expect(invalidMomentum.errors[0]).toContain("RSI threshold");
    });

    it("should validate governance against Constitution Engine permissions", () => {
      const systemResult = validator.validateGovernance("SYSTEM", "EXECUTE");
      expect(systemResult.isCompliant).toBe(true);

      const operatorResult = validator.validateGovernance("OPERATOR", "EXECUTE");
      expect(operatorResult.isCompliant).toBe(true);

      const viewerResult = validator.validateGovernance("VIEWER", "EXECUTE");
      expect(viewerResult.isCompliant).toBe(false);
      expect(viewerResult.reason).toContain("is not authorized");
    });

    it("should calculate signal strength and priority accurately", () => {
      const highRes = validator.calculateSignalStrength(90, 3, 3);
      expect(highRes.strength).toBeGreaterThanOrEqual(90.0);
      expect(highRes.confidenceLabel).toBe("HIGH");

      const lowRes = validator.calculateSignalStrength(40, 1, 4);
      expect(lowRes.confidenceLabel).toBe("LOW");

      const highPri = validator.calculatePriority(SIGNAL_TYPES.EXIT_SIGNAL, 50);
      expect(highPri).toBe("HIGH");
    });
  });

  describe("Signal Generator Service", () => {
    it("should generate standardized strategy signals with required fields", () => {
      const dummyStrategy = {
        strategyId: "STR-MOM-1",
        name: "RSI Momentum",
        strategyType: STRATEGY_TYPES.MOMENTUM,
        status: STRATEGY_STATUSES.ACTIVE,
        timeframe: "1D",
        symbol: "TCS",
        config: { rsiThreshold: 60 },
        author: "SYSTEM",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const brainContext = { confidenceScore: 85, trend: "UPWARD" };
      const marketData = { symbol: "TCS", timeframe: "1D", rsi: 72, priceChangePct: 2.1 };

      const signal = signalGenerator.generateSignal(dummyStrategy, brainContext, marketData);

      expect(signal.signalId).toMatch(/^SIG-/);
      expect(signal.strategyId).toBe("STR-MOM-1");
      expect(signal.symbol).toBe("TCS");
      expect(signal.signalType).toBe(SIGNAL_TYPES.BUY_SIGNAL);
      expect(signal.confidence).toBe("HIGH");
      expect(signal.strength).toBeGreaterThan(70);
      expect(signal.supportingContext).toBeDefined();
      expect(signal.reasoningSummary).toContain("Strong momentum identified");
      expect(signal.lifecycleStatus).toBe("ACTIVE");
    });
  });

  describe("Strategy Engine Pipeline", () => {
    it("should execute 8-stage pipeline and produce signal", async () => {
      const result = await pipeline.executePipeline({
        strategyType: STRATEGY_TYPES.TREND_FOLLOWING,
        symbol: "HDFCBANK",
        timeframe: "1D",
        brainContext: { trend: "UPWARD", confidenceScore: 80 },
        marketData: { trend: "UPWARD", priceChangePct: 1.2 },
      });

      expect(result.runId).toMatch(/^DPR-/);
      expect(result.currentStage).toBe("READY");
      expect(result.stageHistory.length).toBe(8);
      expect(result.signal).toBeDefined();
      expect(result.signal?.signalType).toBe(SIGNAL_TYPES.BUY_SIGNAL);
    });

    it("should reject evaluation when strategy is PAUSED or DISABLED", async () => {
      const id = `STR-PAUSED-${Date.now()}`;
      await repository.saveStrategy({
        strategyId: id,
        name: "Paused Strategy",
        strategyType: STRATEGY_TYPES.MEAN_REVERSION,
        status: STRATEGY_STATUSES.PAUSED,
        timeframe: "1D",
        config: {},
        author: "SYSTEM",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await pipeline.executePipeline({ strategyId: id });
      expect(result.failureReason).toContain(STRATEGY_ERRORS.STRATEGY_DISABLED);
    });
  });

  describe("Business Rule Enforcement", () => {
    it("should strictly prohibit order placement, trade execution, capital allocation, and wallet management", () => {
      expect(() => service.placeOrder()).toThrow(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
      expect(() => service.executeTrade()).toThrow(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
      expect(() => service.allocateCapital()).toThrow(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
      expect(() => service.managePortfolio()).toThrow(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
      expect(() => service.manageWallet()).toThrow(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
      expect(() => service.connectBroker()).toThrow(STRATEGY_ERRORS.EXECUTION_PROHIBITED);
    });
  });

  describe("API Integration Endpoints", () => {
    function createMockRes() {
      let mockResData: any = null;
      let mockStatusCode = 200;

      const res = {
        status: (code: number) => {
          mockStatusCode = code;
          return res;
        },
        json: (data: any) => {
          mockResData = data;
          return res;
        },
      } as any;

      return { res, getStatus: () => mockStatusCode, getData: () => mockResData };
    }

    it("should respond to GET /api/strategy health and summary", async () => {
      const mock1 = createMockRes();
      await controller.getHealth({} as any, mock1.res);
      expect(mock1.getStatus()).toBe(200);
      expect(mock1.getData().status).toBe("HEALTHY");

      const mock2 = createMockRes();
      await controller.getStrategies({ query: {} } as any, mock2.res);
      expect(mock2.getStatus()).toBe(200);
      expect(mock2.getData().summary).toBeDefined();
    });

    it("should handle strategy evaluation via POST /api/strategy/evaluate", async () => {
      const mock = createMockRes();
      const req = {
        body: {
          strategyType: "MOMENTUM",
          symbol: "ICICIBANK",
          timeframe: "1D",
          customConfig: { rsiThreshold: 50 },
          marketData: { rsi: 65, priceChangePct: 1.8 },
        },
      } as any;

      await controller.evaluateStrategy(req, mock.res);
      expect(mock.getStatus()).toBe(200);
      expect(mock.getData().runId).toBeDefined();
      expect(mock.getData().signal).toBeDefined();
    });

    it("should support strategy status lifecycle actions (activate, pause, disable)", async () => {
      const mockCreate = createMockRes();
      const reqCreate = {
        body: {
          name: "API Lifecycle Strategy",
          strategyType: "BREAKOUT",
          symbol: "TATAMOTORS",
          config: { lookbackPeriods: 20 },
        },
      } as any;

      await controller.createStrategy(reqCreate, mockCreate.res);
      expect(mockCreate.getStatus()).toBe(201);
      const strategyId = mockCreate.getData().strategyId;

      const mockAct = createMockRes();
      await controller.activateStrategy({ params: { id: strategyId }, body: {} } as any, mockAct.res);
      expect(mockAct.getStatus()).toBe(200);
      expect(mockAct.getData().status).toBe(STRATEGY_STATUSES.ACTIVE);

      const mockPause = createMockRes();
      await controller.pauseStrategy({ params: { id: strategyId }, body: {} } as any, mockPause.res);
      expect(mockPause.getStatus()).toBe(200);
      expect(mockPause.getData().status).toBe(STRATEGY_STATUSES.PAUSED);

      const mockDisable = createMockRes();
      await controller.disableStrategy({ params: { id: strategyId }, body: {} } as any, mockDisable.res);
      expect(mockDisable.getStatus()).toBe(200);
      expect(mockDisable.getData().status).toBe(STRATEGY_STATUSES.DISABLED);
    });
  });
});
