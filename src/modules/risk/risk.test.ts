import { describe, it, expect, beforeEach } from "vitest";
import { RiskRegistryService } from "./services/risk-registry.service.ts";
import { RiskCalculatorService } from "./services/risk-calculator.service.ts";
import { ExposureEngineService } from "./services/exposure-engine.service.ts";
import { LimitEngineService } from "./services/limit-engine.service.ts";
import { MarginValidatorService } from "./services/margin-validator.service.ts";
import { RiskHealthService } from "./services/risk-health.service.ts";
import { RiskPipelineService } from "./pipeline/risk-pipeline.service.ts";
import { KillSwitchService } from "../runtime-governance/services/kill-switch.service.ts";

describe("Phase 2.9 Risk Engine Foundation", () => {
  let registry: RiskRegistryService;
  let calculator: RiskCalculatorService;
  let exposure: ExposureEngineService;
  let limitEngine: LimitEngineService;
  let marginValidator: MarginValidatorService;
  let health: RiskHealthService;
  let pipeline: RiskPipelineService;

  beforeEach(() => {
    registry = new RiskRegistryService();
    calculator = new RiskCalculatorService();
    exposure = new ExposureEngineService();
    limitEngine = new LimitEngineService();
    marginValidator = new MarginValidatorService();
    health = new RiskHealthService();
    pipeline = new RiskPipelineService();
  });

  describe("Risk Registry Service", () => {
    it("should get or create default risk profile and limits", async () => {
      const profile = await registry.getOrCreateDefaultProfile("test-target-1");
      expect(profile.profileId).toBeDefined();
      expect(profile.targetId).toBe("test-target-1");
      expect(profile.status).toBe("ACTIVE");

      const limits = await registry.getLimits(profile.profileId);
      expect(limits.maxPositionSize).toBe(100000.0);
      expect(limits.maxDailyLoss).toBe(5000.0);
    });

    it("should update risk limits with validation", async () => {
      const profile = await registry.getOrCreateDefaultProfile("test-target-2");
      const updatedLimits = await registry.updateLimits(profile.profileId, {
        maxPositionSize: 200000.0,
        maxDailyLoss: 10000.0,
      });

      expect(updatedLimits.maxPositionSize).toBe(200000.0);
      expect(updatedLimits.maxDailyLoss).toBe(10000.0);
    });
  });

  describe("Risk Calculator & Exposure Engine", () => {
    it("should calculate metrics and map risk level correctly", async () => {
      const profile = await registry.getOrCreateDefaultProfile("test-calc-1");
      const limits = await registry.getLimits(profile.profileId);

      const metrics = calculator.calculateMetrics({
        targetId: "test-calc-1",
        orderValue: 10000,
        positionSize: 10000,
        portfolioValue: 100000,
        dailyPnl: -500,
      }, limits);

      expect(metrics.riskScore).toBeGreaterThanOrEqual(0);
      expect(metrics.riskScore).toBeLessThanOrEqual(100);
      expect(metrics.capitalUtilization).toBe(10);
      expect(metrics.concentrationRatio).toBe(10);

      const level = calculator.determineRiskLevel(metrics.riskScore);
      expect(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'BLOCKED']).toContain(level);
    });

    it("should analyze exposure and detect high leverage / concentration", async () => {
      const profile = await registry.getOrCreateDefaultProfile("test-exp-1");
      const limits = await registry.getLimits(profile.profileId);

      const metrics = calculator.calculateMetrics({
        targetId: "test-exp-1",
        orderValue: 50000,
        positionSize: 50000,
        portfolioValue: 100000,
      }, limits);

      const analysis = exposure.analyzeExposure(metrics, limits);
      expect(analysis.grossExposure).toBe(50000);
      expect(analysis.concentrationRatio).toBe(50);
      expect(analysis.isConcentrationBreached).toBe(true); // default max is 25%
      expect(analysis.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("Limit Engine & Margin Validator", () => {
    it("should detect position size limit breach", async () => {
      const profile = await registry.getOrCreateDefaultProfile("test-lim-1");
      const limits = await registry.getLimits(profile.profileId);

      const metrics = calculator.calculateMetrics({
        targetId: "test-lim-1",
        orderValue: 150000, // exceeds 100k limit
        positionSize: 150000,
        portfolioValue: 500000,
      }, limits);

      const result = limitEngine.validateLimits(metrics, limits);
      expect(result.passed).toBe(false);
      expect(result.breaches.some(b => b.limitName === "MAX_POSITION_SIZE")).toBe(true);
    });

    it("should validate margin requirements", async () => {
      const profile = await registry.getOrCreateDefaultProfile("test-margin-1");
      const limits = await registry.getLimits(profile.profileId);

      const metrics = calculator.calculateMetrics({
        targetId: "test-margin-1",
        orderValue: 50000,
        portfolioValue: 100000,
        availableMargin: 10000,
        requiredMargin: 5000,
      }, limits);

      const res = marginValidator.validateMargin(metrics, limits, 80.0);
      expect(res.isValid).toBe(true);
      expect(res.marginUtilization).toBe(50);
    });
  });

  describe("Risk Pipeline Service", () => {
    it("should approve a low-risk execution request", async () => {
      const result = await pipeline.executePipeline({
        targetId: "safe-decision-1",
        orderValue: 5000,
        portfolioValue: 100000,
        dailyPnl: 0,
      });

      expect(result.approved).toBe(true);
      expect(result.action).toBe("APPROVED");
      expect(result.stageLogs.length).toBeGreaterThan(5);
    });

    it("should reject an execution request when Kill Switch is active", async () => {
      const killSwitch = KillSwitchService.getInstance();
      await killSwitch.activateKillSwitch("STRATEGY", "SUPER_ADMIN", "Testing risk rejection", "SUPER_ADMIN");

      const result = await pipeline.executePipeline({
        targetId: "STRATEGY",
        orderValue: 1000,
      });

      expect(result.approved).toBe(false);
      expect(result.action).toBe("REJECTED");
      expect(result.reasons.some(r => r.includes("Kill Switch"))).toBe(true);

      // Deactivate kill switch after test
      await killSwitch.deactivateKillSwitch("STRATEGY", "SUPER_ADMIN", "Testing cleanup", "SUPER_ADMIN");
    });

    it("should reject execution request breaching position size limits", async () => {
      const result = await pipeline.executePipeline({
        targetId: "overlimit-decision",
        orderValue: 500000, // exceeds default 100k limit
        portfolioValue: 1000000,
      });

      expect(result.approved).toBe(false);
      expect(result.action).toBe("REJECTED");
      expect(result.reasons.some(r => r.includes("exceeds limit"))).toBe(true);
    });
  });

  describe("Risk Health Service", () => {
    it("should generate system health report", async () => {
      const report = await health.getHealthReport();
      expect(report.status).toBeDefined();
      expect(report.systemStance).toBeDefined();
    });
  });
});
