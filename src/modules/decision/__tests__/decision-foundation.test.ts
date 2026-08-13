import { describe, it, expect, beforeEach } from "vitest";
import { DecisionService } from "../services/decision.service.ts";
import { DecisionValidatorService } from "../services/decision-validator.service.ts";
import { DecisionPipelineService } from "../services/decision-pipeline.service.ts";
import { DecisionRepository } from "../repositories/decision.repository.ts";
import { DecisionController } from "../controllers/decision.controller.ts";
import {
  DECISION_TYPES,
  DECISION_STATUSES,
  DECISION_CONFIDENCE,
  DECISION_PRIORITY,
  DECISION_ERRORS,
} from "../constants/index.ts";

describe("Phase 2.4 AI Decision Engine Foundation Tests", () => {
  let repo: DecisionRepository;
  let validator: DecisionValidatorService;
  let pipelineService: DecisionPipelineService;
  let service: DecisionService;
  let controller: DecisionController;

  beforeEach(() => {
    repo = new DecisionRepository();
    validator = new DecisionValidatorService();
    pipelineService = new DecisionPipelineService(validator);
    service = new DecisionService(repo, validator, pipelineService);
    controller = new DecisionController(service);
  });

  describe("Decision Validator Service", () => {
    it("should validate input parameters accurately", () => {
      const invalidRes = validator.validateInputs({});
      expect(invalidRes.valid).toBe(false);
      expect(invalidRes.errors).toContain(DECISION_ERRORS.MISSING_REQUIRED_INPUTS);

      const validRes = validator.validateInputs({
        brainContext: { contextId: "CTX-123" },
      });
      expect(validRes.valid).toBe(true);
    });

    it("should calculate confidence scores and mapped levels correctly", () => {
      const resHigh = validator.calculateConfidenceScore(3, 4, 75.0);
      expect(resHigh.confidenceScore).toBeGreaterThanOrEqual(90.0);
      expect(resHigh.confidenceLevel).toBe(DECISION_CONFIDENCE.VERY_HIGH);

      const resLow = validator.calculateConfidenceScore(0, 0, 45.0);
      expect(resLow.confidenceLevel).toBe(DECISION_CONFIDENCE.LOW);
    });

    it("should calculate risk scores and priority levels appropriately", () => {
      const riskBuy = validator.calculateRiskScore(DECISION_TYPES.BUY, 80.0);
      const riskHold = validator.calculateRiskScore(DECISION_TYPES.HOLD, 80.0);
      expect(riskHold).toBeLessThan(riskBuy);

      const priorityCrit = validator.calculatePriority(DECISION_TYPES.EXIT, 90.0, 20.0);
      expect(priorityCrit).toBe(DECISION_PRIORITY.CRITICAL);
    });

    it("should validate governance permissions correctly", () => {
      const govRes = validator.validateGovernance("SYSTEM", "EXECUTE");
      expect(govRes.allowed).toBe(true);
      expect(govRes.policyReference).toContain("PERM_MATRIX");
    });
  });

  describe("Decision Pipeline Service", () => {
    it("should execute 8-stage decision pipeline successfully", async () => {
      const decisionId = `DEC-TEST-${Date.now()}`;
      const { runRecord, decisionRecord } = await pipelineService.processDecisionPipeline(decisionId, {
        symbol: "BANKNIFTY",
        brainContext: { title: "Banking Sector Strength" },
        researchEvidence: [{ title: "Credit Growth Strong", score: 90 }],
        brainKnowledge: [{ title: "Merger Synergies" }],
      });

      expect(runRecord.stageHistory).toHaveLength(8);
      expect(runRecord.failureReason).toBeNull();
      expect(decisionRecord.decisionId).toBe(decisionId);
      expect(decisionRecord.status).toBe(DECISION_STATUSES.READY);
      expect(decisionRecord.confidence).toBeTruthy();
      expect(decisionRecord.riskScore).toBeGreaterThan(0);
    });
  });

  describe("Decision Repository & Lifecycle", () => {
    it("should save decision and retrieve by ID and query filters", async () => {
      const decisionId = `DEC-REPO-${Date.now()}`;
      const record = await service.evaluateDecision({
        symbol: "NIFTY50",
        brainContext: { title: "Bullish Momentum" },
        userOverrideType: DECISION_TYPES.BUY,
      });

      const fetched = await service.getDecisionById(record.decisionId);
      expect(fetched).not.toBeNull();
      expect(fetched?.decisionId).toBe(record.decisionId);
      expect(fetched?.decisionType).toBe(DECISION_TYPES.BUY);

      const list = await service.queryDecisions({ symbol: "NIFTY50" });
      expect(list.length).toBeGreaterThan(0);
    });

    it("should handle status transitions and track audit history", async () => {
      const record = await service.evaluateDecision({
        symbol: "INFY",
        brainContext: { title: "IT Results Analysis" },
      });

      const approved = await service.approveDecision(record.decisionId, "ADMIN_OPERATOR");
      expect(approved?.status).toBe(DECISION_STATUSES.APPROVED);

      const history = await service.getHistory(record.decisionId);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].toStatus).toBe(DECISION_STATUSES.APPROVED);
    });
  });

  describe("Decision Service & Prohibitions", () => {
    it("should evaluate opportunity and return standardized decision output", async () => {
      const result = await service.evaluateDecision({
        symbol: "RELIANCE",
        contextId: "CTX-999",
        brainContext: { title: "Refinery Margins High" },
        researchEvidence: [{ source: "Research Center", title: "Quarterly Target Met" }],
      });

      expect(result.decisionId).toMatch(/^DEC-/);
      expect(result.reasoningSummary).toBeTruthy();
      expect(result.supportingEvidence.length).toBeGreaterThan(0);
      expect(result.policyReferences.length).toBeGreaterThan(0);
      expect(result.metadata?.tradingProhibited).toBe(true);
    });

    it("should strictly enforce business prohibitions against order execution and capital management", () => {
      expect(() => service.placeOrder()).toThrow(DECISION_ERRORS.EXECUTION_PROHIBITED);
      expect(() => service.createBrokerOrder()).toThrow(DECISION_ERRORS.EXECUTION_PROHIBITED);
      expect(() => service.executeTrade()).toThrow(DECISION_ERRORS.EXECUTION_PROHIBITED);
      expect(() => service.updatePortfolio()).toThrow(DECISION_ERRORS.EXECUTION_PROHIBITED);
      expect(() => service.allocateFunds()).toThrow(DECISION_ERRORS.EXECUTION_PROHIBITED);
    });

    it("should report healthy status and summary analytics", async () => {
      await service.evaluateDecision({
        symbol: "TCS",
        brainContext: { title: "Tech Sector Stability" },
      });

      const health = await service.getHealth();
      expect(health.status).toBe("HEALTHY");
      expect(health.totalDecisionsCount).toBeGreaterThan(0);

      const summary = await service.getSummary();
      expect(summary.totalDecisions).toBeGreaterThan(0);
      expect(summary.averageConfidenceScore).toBeGreaterThan(0);
    });
  });

  describe("Decision Controller Endpoints", () => {
    it("should respond to GET /decision overview and POST /decision/evaluate", async () => {
      let mockResData: any = null;
      let mockStatus = 200;

      const mockRes = {
        json: (data: any) => {
          mockResData = data;
        },
        status: (code: number) => {
          mockStatus = code;
          return mockRes;
        },
      } as any;

      // POST /decision/evaluate
      const reqPost = {
        body: {
          symbol: "HDFCBANK",
          brainContext: { title: "Deposit Growth Analysis" },
          userOverrideType: DECISION_TYPES.BUY,
        },
      } as any;

      await controller.evaluateDecision(reqPost, mockRes);
      expect(mockStatus).toBe(201);
      expect(mockResData.success).toBe(true);
      expect(mockResData.data.decisionId).toBeTruthy();

      const createdId = mockResData.data.decisionId;

      // GET /decision/:id
      const reqGetId = { params: { id: createdId } } as any;
      await controller.getDecisionById(reqGetId, mockRes);
      expect(mockResData.success).toBe(true);
      expect(mockResData.data.decision.decisionId).toBe(createdId);

      // GET /decision/health
      await controller.getHealth({} as any, mockRes);
      expect(mockResData.success).toBe(true);
      expect(mockResData.data.status).toBe("HEALTHY");

      // GET /decision/status
      await controller.getStatus({} as any, mockRes);
      expect(mockResData.success).toBe(true);
      expect(mockResData.data.totalDecisions).toBeGreaterThan(0);
    });
  });
});
