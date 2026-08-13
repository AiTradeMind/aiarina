import { describe, it, expect, beforeEach } from "vitest";
import { BrainService } from "../services/brain.service.ts";
import { KnowledgeRepositoryService } from "../services/knowledge-repository.service.ts";
import { MemoryManagerService } from "../services/memory-manager.service.ts";
import { ContextBuilderService } from "../services/context-builder.service.ts";
import { BrainKnowledgePipelineService } from "../services/brain-pipeline.service.ts";
import {
  KNOWLEDGE_TYPES,
  MEMORY_TYPES,
  CONTEXT_TYPES,
  BRAIN_LIFECYCLE_STATES,
  BRAIN_ERRORS,
} from "../constants/index.ts";

describe("Phase 2.3 - AI Brain Foundation Unit & Integration Tests", () => {
  let brainService: BrainService;
  let knowledgeService: KnowledgeRepositoryService;
  let memoryService: MemoryManagerService;
  let contextBuilder: ContextBuilderService;
  let pipelineService: BrainKnowledgePipelineService;

  beforeEach(() => {
    brainService = new BrainService();
    knowledgeService = brainService.knowledgeService;
    memoryService = brainService.memoryService;
    contextBuilder = brainService.contextBuilder;
    pipelineService = brainService.pipelineService;
  });

  describe("1. Knowledge Repository Service", () => {
    it("should store structured knowledge item successfully", async () => {
      const item = await knowledgeService.storeKnowledge({
        title: "RBI Monetary Policy Analysis",
        content: "Repo rate held constant at 6.5%. Inflation trajectory remains within target band.",
        knowledgeType: KNOWLEDGE_TYPES.ECONOMIC,
        tags: ["RBI", "INFLATION", "REPO_RATE"],
        confidence: 92.5,
        source: "Central Bank Bulletin",
      });

      expect(item.knowledgeId).toBeDefined();
      expect(item.knowledgeType).toBe(KNOWLEDGE_TYPES.ECONOMIC);
      expect(item.title).toBe("RBI Monetary Policy Analysis");
      expect(item.confidence).toBe(92.5);
    });

    it("should reject invalid knowledge type", async () => {
      await expect(
        knowledgeService.storeKnowledge({
          title: "Test",
          content: "Content",
          knowledgeType: "INVALID_TYPE" as any,
        })
      ).rejects.toThrow(BRAIN_ERRORS.INVALID_KNOWLEDGE_TYPE);
    });

    it("should query stored knowledge by type and tag", async () => {
      await knowledgeService.storeKnowledge({
        title: "Reliance Q3 Earnings Report",
        content: "EBITDA margin expanded by 120 bps YoY across retail and telecom.",
        knowledgeType: KNOWLEDGE_TYPES.CORPORATE,
        tags: ["RELIANCE", "Q3", "EARNINGS"],
      });

      const results = await knowledgeService.queryKnowledge({
        knowledgeType: KNOWLEDGE_TYPES.CORPORATE,
        tag: "RELIANCE",
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain("Reliance Q3");
    });

    it("should merge two knowledge items into consolidated record", async () => {
      const k1 = await knowledgeService.storeKnowledge({
        title: "TCS Deal Win Part 1",
        content: "TCS won $500M deal in Europe.",
        knowledgeType: KNOWLEDGE_TYPES.CORPORATE,
      });

      const k2 = await knowledgeService.storeKnowledge({
        title: "TCS Deal Win Part 2",
        content: "Execution timeline spans 5 years with cloud migration scope.",
        knowledgeType: KNOWLEDGE_TYPES.CORPORATE,
      });

      const merged = await knowledgeService.mergeKnowledge(k1.knowledgeId, k2.knowledgeId, "TEST_OPERATOR");

      expect(merged.knowledgeId).toBeDefined();
      expect(merged.title).toContain("Consolidated");
      expect(merged.content).toContain("TCS won $500M deal");
      expect(merged.content).toContain("Execution timeline spans 5 years");
    });
  });

  describe("2. Memory Manager Service", () => {
    it("should store memory in Working and Long-Term memory pools", async () => {
      const workingMem = await memoryService.storeMemory({
        memoryType: MEMORY_TYPES.WORKING,
        key: "CURRENT_SECTOR_FOCUS",
        value: { sector: "BANKING", sentiment: "BULLISH" },
      });

      expect(workingMem.memoryId).toBeDefined();
      expect(workingMem.memoryType).toBe(MEMORY_TYPES.WORKING);
      expect(workingMem.key).toBe("CURRENT_SECTOR_FOCUS");

      const retrieved = await memoryService.getMemoryByKey("CURRENT_SECTOR_FOCUS");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.value.sector).toBe("BANKING");
    });

    it("should store and retrieve knowledge cache memory with TTL", async () => {
      const cached = await memoryService.cacheKnowledge("OPT_CHAIN_NIFTY", { callOi: 1500000, putOi: 1800000 }, 600);

      expect(cached.memoryType).toBe(MEMORY_TYPES.CACHE);
      expect(cached.ttl).toBe(600);

      const retrieved = await memoryService.getMemoryByKey("OPT_CHAIN_NIFTY");
      expect(retrieved?.value.putOi).toBe(1800000);
    });
  });

  describe("3. Context Builder Service", () => {
    it("should build reasoning context for AI model consumption", async () => {
      const k = await knowledgeService.storeKnowledge({
        title: "US Federal Reserve Rate Pause",
        content: "FOMC maintained target rate range at 5.25%-5.50%.",
        knowledgeType: KNOWLEDGE_TYPES.ECONOMIC,
      });

      const context = await contextBuilder.buildContext({
        contextType: CONTEXT_TYPES.MARKET,
        title: "Global Macro Market Context",
        knowledgeIds: [k.knowledgeId],
        entitySymbols: ["NIFTY50", "BANKNIFTY"],
      });

      expect(context.contextId).toBeDefined();
      expect(context.contextType).toBe(CONTEXT_TYPES.MARKET);
      expect(context.payload.entitySymbols).toContain("NIFTY50");
      expect(context.payload.systemGuarantees.tradingProhibited).toBe(true);
      expect(context.payload.systemGuarantees.orderGenerationProhibited).toBe(true);
    });
  });

  describe("4. 9-Stage Knowledge Pipeline Service", () => {
    it("should execute full 9-stage knowledge processing pipeline", async () => {
      const run = await pipelineService.processKnowledgePipeline("KNW-TEST-101", {
        symbol: "INFY",
        event: "EARNINGS_PREVIEW",
      });

      expect(run.runId).toBeDefined();
      expect(run.currentStage).toBe("READY");
      expect(run.stageHistory.length).toBe(9);
      expect(run.failureReason).toBeNull();
    });
  });

  describe("5. Main Brain Service & Integration", () => {
    it("should report healthy status and lifecycle summary", async () => {
      const health = await brainService.getHealth();
      const summary = await brainService.getSummary();

      expect(health.status).toBe(BRAIN_LIFECYCLE_STATES.READY);
      expect(health.details.constitutionPolicyCompliant).toBe(true);
      expect(summary.totalKnowledgeItems).toBeGreaterThanOrEqual(0);
    });

    it("should process research item from Research Center into Brain Knowledge, Pipeline, Memory, and Context", async () => {
      const result = await brainService.processResearchItem({
        researchId: "RES-2026-999",
        title: "HDFC Bank Merger Synergies Study",
        content: "Deposit growth acceleration witnessed post-merger integration completion.",
        category: "Corporate Action",
        summary: "Deposit growth accelerating",
        tags: ["HDFCBANK", "BANKING", "MERGER"],
        confidenceScore: 94.0,
      });

      expect(result.knowledge.knowledgeId).toBeDefined();
      expect(result.memory.memoryId).toBeDefined();
      expect(result.context.contextId).toBeDefined();
      expect(result.pipelineRun.currentStage).toBe("READY");
    });

    it("STRICT BOUNDARY TEST: should strictly prohibit trade placement, order generation, portfolio management, and strategy execution", () => {
      expect(() => brainService.executeTrade()).toThrow(BRAIN_ERRORS.EXECUTION_PROHIBITED);
      expect(() => brainService.generateOrder()).toThrow(BRAIN_ERRORS.EXECUTION_PROHIBITED);
      expect(() => brainService.managePortfolio()).toThrow(BRAIN_ERRORS.EXECUTION_PROHIBITED);
      expect(() => brainService.executeStrategy()).toThrow(BRAIN_ERRORS.EXECUTION_PROHIBITED);
    });
  });
});
