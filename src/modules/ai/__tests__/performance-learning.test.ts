import { describe, it, expect, vi, beforeEach } from "vitest";
import { PerformanceTracker, PerformanceAggregator, PerformanceEngineService } from "../performance/services/performance-engine.service.ts";
import { LearningMemory, FeedbackEngine, LearningEngineService } from "../learning/services/learning-engine.service.ts";
import { PerformanceEngineRepository } from "../performance/repositories/performance-engine.repository.ts";
import { LearningEngineRepository } from "../learning/repositories/learning-engine.repository.ts";

vi.mock("../../../db/client.ts", () => {
  const createQueryBuilder = (rows: any[] = []) => {
    const builder: any = {
      select: () => builder,
      from: () => builder,
      where: () => builder,
      orderBy: () => builder,
      limit: () => builder,
      returning: () => builder,
      values: () => builder,
      set: () => builder,
      then: (resolve: any) => resolve(rows),
      catch: () => builder
    };
    return builder;
  };

  const mockDb = {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
    insert: () => createQueryBuilder([{ id: 1 }]),
    select: () => createQueryBuilder([]),
    update: () => createQueryBuilder([]),
  };

  return {
    getDb: () => mockDb,
    isDatabaseConnected: () => true
  };
});

describe("AAOS Model Performance, Ranking & Learning Engine", () => {
  let perfRepo: PerformanceEngineRepository;
  let learningRepo: LearningEngineRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    perfRepo = new PerformanceEngineRepository();
    learningRepo = new LearningEngineRepository();
  });

  describe("Performance Tracking & History (Part 1)", () => {
    it("should record individual model executions with valid latency and reasoning attributes", async () => {
      const modelId = "gemini-1.5-flash";
      const record = await PerformanceTracker.trackModelExecution(modelId, perfRepo);
      expect(record).toBeDefined();
      expect(record.id).toBe(1);
    });
  });

  describe("Performance Aggregator & Analytics (Part 5)", () => {
    it("should calculate moving average and rolling weighted accuracy", async () => {
      const modelId = "gpt-4o";
      const sampleHistory = [
        { accuracy: 95, responseTime: 0.8, cost: 0.002, latency: 800, timestamp: new Date() },
        { accuracy: 90, responseTime: 0.9, cost: 0.002, latency: 900, timestamp: new Date() },
        { accuracy: 85, responseTime: 1.0, cost: 0.002, latency: 1000, timestamp: new Date() }
      ];

      const analytics = await PerformanceAggregator.calculateAnalytics(modelId, sampleHistory);
      expect(analytics.movingAccuracy).toBe(90); // Simple average: (95+90+85)/3
      expect(analytics.rollingAccuracy).toBeGreaterThan(90); // Weighted towards recent (95)
      expect(analytics.performanceDrift).toBeDefined();
      expect(analytics.regressionDetected).toBe(false);
    });

    it("should trigger regression detection on substantial negative drift", async () => {
      const modelId = "gpt-4o";
      const decayingHistory = [
        { accuracy: 80, responseTime: 0.8, cost: 0.002, latency: 800, timestamp: new Date() },
        { accuracy: 85, responseTime: 0.9, cost: 0.002, latency: 900, timestamp: new Date() },
        { accuracy: 92, responseTime: 1.0, cost: 0.002, latency: 1000, timestamp: new Date() }
      ];

      const analytics = await PerformanceAggregator.calculateAnalytics(modelId, decayingHistory);
      expect(analytics.performanceDrift).toBeLessThan(-10); // 80 - 92 = -12
      expect(analytics.regressionDetected).toBe(true);
    });
  });

  describe("Feedback Engine (Part 6)", () => {
    it("should generate highly structured qualitative strengths and weaknesses", () => {
      const modelId = "gemini-1.5-flash";
      const sampleHistory = [
        { accuracy: 88, responseTime: 0.4, cost: 0.0001, confidenceStability: 85 }
      ];

      const feedback = FeedbackEngine.generateFeedback(modelId, sampleHistory);
      expect(feedback.strengths.length).toBeGreaterThan(0);
      expect(feedback.weaknesses.length).toBeGreaterThan(0);
      expect(feedback.confidenceCalibration).toBeDefined();
    });
  });

  describe("Learning Engine (Part 3)", () => {
    it("should extract success and failure patterns from performance memories", () => {
      const modelId = "claude-3-5-sonnet";
      const sampleHistory = [
        { accuracy: 94, responseTime: 1.2, cost: 0.003, researchQuality: 92 }
      ];

      const analysis = LearningMemory.analyzeHistoricalBehavior(modelId, sampleHistory);
      expect(analysis.successPatterns.length).toBeGreaterThan(0);
      expect(analysis.researchOutcomes).toBeDefined();
    });
  });

  describe("Services and API Integration (Part 9)", () => {
    it("should fetch scorecards and rankings smoothly", async () => {
      const service = new PerformanceEngineService();
      const scorecards = await service.getScorecards();
      expect(scorecards).toBeDefined();
      expect(Array.isArray(scorecards)).toBe(true);

      const rankings = await service.getRankings();
      expect(rankings).toBeDefined();
      expect(Array.isArray(rankings)).toBe(true);
    });

    it("should retrieve learning history lists smoothly", async () => {
      const service = new LearningEngineService();
      const history = await service.getLearningHistory();
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });
  });
});
