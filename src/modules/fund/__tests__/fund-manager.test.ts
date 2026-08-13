import { describe, it, expect, beforeEach } from "vitest";
import { FundService } from "../services/fund.service.ts";
import { FundRepository } from "../repositories/fund.repository.ts";
import { AllocationEngineService } from "../services/allocation-engine.service.ts";
import { ReservationEngineService } from "../services/reservation-engine.service.ts";
import { ReleaseEngineService } from "../services/release-engine.service.ts";
import { FundLifecycleService } from "../services/fund-lifecycle.service.ts";
import { FundPipelineService } from "../pipeline/fund-pipeline.service.ts";
import { FUND_TYPES, ALLOCATION_STRATEGIES } from "../constants/index.ts";

describe("Fund Manager Foundation Module", () => {
  let fundService: FundService;
  let fundRepository: FundRepository;
  let allocationEngine: AllocationEngineService;
  let reservationEngine: ReservationEngineService;
  let releaseEngine: ReleaseEngineService;
  let lifecycleService: FundLifecycleService;
  let pipelineService: FundPipelineService;

  beforeEach(() => {
    fundService = FundService.getInstance();
    fundRepository = FundRepository.getInstance();
    allocationEngine = AllocationEngineService.getInstance();
    reservationEngine = ReservationEngineService.getInstance();
    releaseEngine = ReleaseEngineService.getInstance();
    lifecycleService = FundLifecycleService.getInstance();
    pipelineService = FundPipelineService.getInstance();
  });

  describe("Fund Account Registration & Management", () => {
    it("should register a new Master Fund account", async () => {
      const result = await fundService.createFund({
        fundId: "TEST-MASTER-01",
        name: "Test Master Fund",
        fundType: FUND_TYPES.MASTER_FUND,
        initialCapital: 1000000,
        currency: "INR",
        owner: "SUPER_ADMIN",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.fundId).toBe("TEST-MASTER-01");
      expect(result.data?.totalCapital).toBe(1000000);
      expect(result.data?.availableCapital).toBe(1000000);
      expect(result.data?.status).toBe("ACTIVE");
    });

    it("should retrieve fund by ID", async () => {
      await fundService.createFund({
        fundId: "TEST-STRATEGY-01",
        name: "Test Strategy Fund",
        fundType: FUND_TYPES.STRATEGY_FUND,
        initialCapital: 250000,
      });

      const fund = await fundService.getFundById("TEST-STRATEGY-01");
      expect(fund).not.toBeNull();
      expect(fund?.fundId).toBe("TEST-STRATEGY-01");
      expect(fund?.totalCapital).toBe(250000);
    });
  });

  describe("Allocation Engine Operations", () => {
    it("should execute equal allocation from Master Fund to sub-funds", async () => {
      await fundService.createFund({
        fundId: "MASTER-ALLOC-SRC",
        name: "Source Master Fund",
        fundType: FUND_TYPES.MASTER_FUND,
        initialCapital: 500000,
      });

      await fundService.createFund({
        fundId: "SUB-FUND-A",
        name: "Sub Fund A",
        fundType: FUND_TYPES.AI_MODEL_FUND,
        initialCapital: 0,
      });

      await fundService.createFund({
        fundId: "SUB-FUND-B",
        name: "Sub Fund B",
        fundType: FUND_TYPES.STRATEGY_FUND,
        initialCapital: 0,
      });

      const allocResult = await fundService.allocateCapital({
        sourceFundId: "MASTER-ALLOC-SRC",
        targets: [{ targetFundId: "SUB-FUND-A" }, { targetFundId: "SUB-FUND-B" }],
        amount: 200000,
        allocationStrategy: ALLOCATION_STRATEGIES.EQUAL,
        notes: "Equal distribution test",
        actorRole: "SUPER_ADMIN",
      });

      expect(allocResult.success).toBe(true);
      expect(allocResult.data?.length).toBe(2);

      const source = await fundService.getFundById("MASTER-ALLOC-SRC");
      expect(source?.allocatedCapital).toBe(200000);
      expect(source?.availableCapital).toBe(300000);

      const subA = await fundService.getFundById("SUB-FUND-A");
      expect(subA?.totalCapital).toBe(100000);
      expect(subA?.availableCapital).toBe(100000);

      const subB = await fundService.getFundById("SUB-FUND-B");
      expect(subB?.totalCapital).toBe(100000);
      expect(subB?.availableCapital).toBe(100000);
    });

    it("should execute weighted allocation", async () => {
      await fundService.createFund({
        fundId: "SRC-WEIGHTED",
        name: "Weighted Source Fund",
        fundType: FUND_TYPES.MASTER_FUND,
        initialCapital: 100000,
      });

      await fundService.createFund({
        fundId: "TARGET-W1",
        name: "Target W1",
        fundType: FUND_TYPES.STRATEGY_FUND,
        initialCapital: 0,
      });

      await fundService.createFund({
        fundId: "TARGET-W2",
        name: "Target W2",
        fundType: FUND_TYPES.STRATEGY_FUND,
        initialCapital: 0,
      });

      const allocResult = await fundService.allocateCapital({
        sourceFundId: "SRC-WEIGHTED",
        targets: [
          { targetFundId: "TARGET-W1", weight: 3 },
          { targetFundId: "TARGET-W2", weight: 1 },
        ],
        amount: 40000,
        allocationStrategy: ALLOCATION_STRATEGIES.WEIGHTED,
        actorRole: "SUPER_ADMIN",
      });

      expect(allocResult.success).toBe(true);

      const target1 = await fundService.getFundById("TARGET-W1");
      const target2 = await fundService.getFundById("TARGET-W2");

      expect(target1?.totalCapital).toBe(30000);
      expect(target2?.totalCapital).toBe(10000);
    });
  });

  describe("Reservation Engine & Release Operations", () => {
    it("should reserve capital and release reservation", async () => {
      await fundService.createFund({
        fundId: "FUND-RES-01",
        name: "Reservation Fund",
        fundType: FUND_TYPES.RESERVE_FUND,
        initialCapital: 100000,
      });

      const resResult = await fundService.reserveCapital({
        fundId: "FUND-RES-01",
        amount: 30000,
        purpose: "Pending algorithmic strategy deployment",
        actorRole: "SUPER_ADMIN",
      });

      expect(resResult.success).toBe(true);
      expect(resResult.data?.status).toBe("RESERVED");

      const fundAfterRes = await fundService.getFundById("FUND-RES-01");
      expect(fundAfterRes?.reservedCapital).toBe(30000);
      expect(fundAfterRes?.availableCapital).toBe(70000);

      // Release reservation
      const releaseResult = await fundService.releaseCapital({
        reservationId: resResult.data?.reservationId,
        actorRole: "SUPER_ADMIN",
      });

      expect(releaseResult.success).toBe(true);

      const fundAfterRel = await fundService.getFundById("FUND-RES-01");
      expect(fundAfterRel?.reservedCapital).toBe(0);
      expect(fundAfterRel?.availableCapital).toBe(100000);
      expect(fundAfterRel?.releasedCapital).toBe(30000);
    });
  });

  describe("Fund Lifecycle Operations", () => {
    it("should freeze and unfreeze a fund account", async () => {
      await fundService.createFund({
        fundId: "FUND-FREEZE-TEST",
        name: "Freeze Test Fund",
        fundType: FUND_TYPES.TEST_FUND,
        initialCapital: 50000,
      });

      const freezeRes = await fundService.freezeFund({
        fundId: "FUND-FREEZE-TEST",
        reason: "Security investigation",
        actorRole: "SUPER_ADMIN",
      });

      expect(freezeRes.success).toBe(true);
      expect(freezeRes.data?.status).toBe("FROZEN");
      expect(freezeRes.data?.availableCapital).toBe(0);
      expect(freezeRes.data?.frozenCapital).toBe(50000);

      // Unfreeze
      const unfreezeRes = await fundService.unfreezeFund({
        fundId: "FUND-FREEZE-TEST",
        reason: "Security investigation complete",
        actorRole: "SUPER_ADMIN",
      });

      expect(unfreezeRes.success).toBe(true);
      expect(unfreezeRes.data?.status).toBe("ACTIVE");
      expect(unfreezeRes.data?.availableCapital).toBe(50000);
      expect(unfreezeRes.data?.frozenCapital).toBe(0);
    });
  });

  describe("Health & Diagnostics Diagnostics", () => {
    it("should report fund manager health diagnostics", async () => {
      const health = await fundService.getHealth();
      expect(health.status).toBeDefined();
      expect(health.metrics).toBeDefined();
      expect(health.checks.prohibitionBoundary).toBe("ENFORCED");
    });
  });

  describe("Business Rule Prohibition Enforcement", () => {
    it("should throw prohibition error if direct trade execution is attempted", async () => {
      await expect(fundService.executeTrade()).rejects.toThrow(/PROHIBITION_ERROR/);
    });

    it("should throw prohibition error if direct broker order creation is attempted", async () => {
      await expect(fundService.createBrokerOrder()).rejects.toThrow(/PROHIBITION_ERROR/);
    });

    it("should throw prohibition error if market position update is attempted", async () => {
      await expect(fundService.updateMarketPosition()).rejects.toThrow(/PROHIBITION_ERROR/);
    });
  });
});
