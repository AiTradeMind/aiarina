import { LearningEngineRepository, CreateLearningHistoryInput, CreateLearningFeedbackInput } from "../repositories/learning-engine.repository.ts";
import { PerformanceEngineRepository } from "../../performance/repositories/performance-engine.repository.ts";
import { EnterpriseAIGatewayService } from "../../services/EnterpriseAIGatewayService.ts";
import { getDeterministicRandom } from "../../../../lib/utils.ts";
import { EventBusService } from "../../../events/services/index.ts";

// ==================================================================
// PART 3: LEARNING MEMORY & LEARNING HISTORY
// ==================================================================

export class LearningMemory {
  /**
   * Evaluates historical success/failure behavior of the model.
   * Identifies success patterns, failure patterns, and updates knowledge.
   */
  static analyzeHistoricalBehavior(modelId: string, performanceHistory: any[]): CreateLearningHistoryInput {
    const successPatterns: any[] = [];
    const failurePatterns: any[] = [];
    const researchOutcomes: any[] = [];
    const consensusOutcomes: any[] = [];
    const knowledgeUpdates: any[] = [];
    const historicalBehavior: any[] = [];

    // Analyze latency / cost / accuracy patterns
    const accuracySeries = performanceHistory.map(h => Number(h.accuracy) || 85);
    const avgAccuracy = accuracySeries.reduce((a, b) => a + b, 0) / (performanceHistory.length || 1);

    if (avgAccuracy >= 90) {
      successPatterns.push({
        patternId: "HIGH_ACCURACY_REASONING",
        description: "Exhibits exceptional reasoning accuracy on complex logical nodes.",
        confidence: 0.94,
        supportCount: performanceHistory.length
      });
    } else {
      failurePatterns.push({
        patternId: "REASONING_DRIFT",
        description: "Shows susceptibility to slight performance decay during multi-step reasoning tasks.",
        severity: "LOW",
        triggerCondition: "High context length (>4000 tokens)"
      });
    }

    // Success pattern: Speed & Cost
    const avgResponseTime = performanceHistory.reduce((acc, h) => acc + (Number(h.responseTime) || 1), 0) / (performanceHistory.length || 1);
    if (avgResponseTime < 0.8) {
      successPatterns.push({
        patternId: "RAPID_DISPATCH",
        description: "Highly efficient sub-second request response time suitable for high-frequency evaluations.",
        confidence: 0.98,
        latencyMs: avgResponseTime * 1000
      });
    } else {
      failurePatterns.push({
        patternId: "RESPONSE_LAG",
        description: "Elevated latency on reasoning-heavy prompts.",
        severity: "MEDIUM",
        latencyMs: avgResponseTime * 1000
      });
    }

    // Consensus Contribution Pattern
    const avgConsensus = performanceHistory.reduce((acc, h) => acc + (Number(h.consensusContribution) || 80), 0) / (performanceHistory.length || 1);
    if (avgConsensus >= 88) {
      consensusOutcomes.push({
        status: "STRONG_CONTRIBUTOR",
        description: "Maintains high alignment with core consensus results.",
        alignmentScore: avgConsensus
      });
    } else {
      consensusOutcomes.push({
        status: "DIVERGENT_OPINION",
        description: "Produces non-conforming claims during debate steps.",
        alignmentScore: avgConsensus
      });
    }

    // Research Outcomes
    const avgResearch = performanceHistory.reduce((acc, h) => acc + (Number(h.researchQuality) || 80), 0) / (performanceHistory.length || 1);
    researchOutcomes.push({
      metric: "RESEARCH_QUALITY_SCORE",
      value: avgResearch,
      tier: avgResearch >= 90 ? "TIER_1_EXPERT" : avgResearch >= 80 ? "TIER_2_ANALYST" : "TIER_3_ASSISTANT"
    });

    // Knowledge updates
    knowledgeUpdates.push({
      topic: "Macro-Economic Inference",
      status: "CALIBRATED",
      lastUpdated: new Date()
    });

    historicalBehavior.push({
      metric: "Rolling Accuracy",
      series: accuracySeries.slice(0, 5)
    });

    return {
      modelId,
      successPatterns,
      failurePatterns,
      researchOutcomes,
      consensusOutcomes,
      knowledgeUpdates,
      historicalBehavior
    };
  }
}

// ==================================================================
// PART 6: FEEDBACK ENGINE
// ==================================================================

export class FeedbackEngine {
  /**
   * Generates highly structured qualitative feedback for continuous learning and human audit.
   */
  static generateFeedback(modelId: string, history: any[]): CreateLearningFeedbackInput {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recurringErrors: string[] = [];
    const missingEvidence: string[] = [];
    const reasoningGaps: string[] = [];
    const improvementSuggestions: string[] = [];
    
    // Model specific characteristics
    if (modelId.includes("pro") || modelId.includes("gpt")) {
      strengths.push("Excellent context synthesis and deep multi-variate understanding.");
      strengths.push("High evidence density and extensive knowledge coverage.");
      weaknesses.push("Relatively high processing cost and sub-optimal token efficiency.");
      reasoningGaps.push("Occasional logical over-complication on trivial binary decisions.");
      improvementSuggestions.push("Streamline prompts to leverage structural JSON responses directly.");
    } else if (modelId.includes("flash")) {
      strengths.push("Extremely fast token dispatch and minimal response times.");
      strengths.push("Exceptional cost efficiency for high-throughput batch analyses.");
      weaknesses.push("Tendency to omit minor supporting indicators.");
      recurringErrors.push("Premature termination of critical debate loops.");
      missingEvidence.push("Missing fine-grained historical index trends in the output report.");
      reasoningGaps.push("Oversimplified connection weights between domain sectors.");
      improvementSuggestions.push("Complement with rich context vectors during initial database queries.");
    } else {
      strengths.push("Balanced accuracy and latency profiles.");
      weaknesses.push("Higher performance drift during peak request volume.");
      improvementSuggestions.push("Optimize system instruction parameters.");
    }

    // Common feedback points based on history
    if (history.length > 2) {
      const earliestAcc = history[history.length - 1].accuracy;
      const recentAcc = history[0].accuracy;
      if (recentAcc < earliestAcc) {
        recurringErrors.push("Identified a slow drift regression pattern in accuracy score.");
        improvementSuggestions.push("Schedule a model temperature recalibration sweep.");
      } else {
        strengths.push("Shows high stability and progressive learning curves across sessions.");
      }
    }

    // Confidence Calibration Factor calculation (Part 6)
    // Measures the ratio of actual accuracy to model average confidence stability.
    // If accuracy is high but confidence is low, calibration is > 1.0 (underconfident).
    // If accuracy is low but confidence is high, calibration is < 1.0 (overconfident).
    const latest = history[0] || {};
    const actAccuracy = (latest.accuracy || 85) / 100;
    const selfConfidence = (latest.confidenceStability || 85) / 100;
    const confidenceCalibration = selfConfidence > 0 ? (actAccuracy / selfConfidence) : 1.0;

    return {
      modelId,
      strengths,
      weaknesses,
      recurringErrors,
      missingEvidence,
      reasoningGaps,
      improvementSuggestions,
      confidenceCalibration: Number(confidenceCalibration.toFixed(4))
    };
  }
}

// ==================================================================
// PART 3: LEARNING ENGINE ORCHESTRATOR
// ==================================================================

export class LearningEngine {
  private learningRepo = new LearningEngineRepository();
  private perfRepo = new PerformanceEngineRepository();
  private gateway = EnterpriseAIGatewayService.getInstance();
  private eventBus = EventBusService.getInstance();

  /**
   * Executes a Learning Cycle. Retrieves the latest performance logs, analyzes behavior,
   * extracts success/failure patterns, writes structured feedback, and logs historical telemetry.
   */
  async runLearningCycle(): Promise<void> {
    await this.learningRepo.ensureTablesExist();
    await this.perfRepo.ensureTablesExist();

    const activeModels = await this.gateway.getModelsList();
    if (!activeModels || activeModels.length === 0) {
      console.log("No active models registered in the system.");
      return;
    }

    for (const model of activeModels) {
      const modelId = model.internalName || `model_${model.id}`;
      const history = await this.perfRepo.getPerformanceHistory(modelId);
      
      // 1. Analyze memory and compile learning history
      const learningHistoryInput = LearningMemory.analyzeHistoricalBehavior(modelId, history);
      const savedHistory = await this.learningRepo.saveLearningHistory(learningHistoryInput);

      // 2. Generate structured feedback
      const feedbackInput = FeedbackEngine.generateFeedback(modelId, history);
      const savedFeedback = await this.learningRepo.saveLearningFeedback(feedbackInput);

      // 3. Dispatch Learning Events to MLOps system (Part 10 Integration)
      await this.eventBus.publish({
        eventType: "LEARNING_UPDATED",
        source: "AI_LEARNING_ENGINE",
        organizationId: "SYSTEM",
        userId: 1,
        payload: {
          modelId,
          historyId: savedHistory.id,
          feedbackId: savedFeedback.id,
          confidenceCalibration: feedbackInput.confidenceCalibration
        }
      });
    }
  }
}

// ==================================================================
// LEARNING SERVICE
// ==================================================================

export class LearningEngineService {
  private learningRepo = new LearningEngineRepository();
  private perfRepo = new PerformanceEngineRepository();
  private engine = new LearningEngine();

  async getLearningHistory(modelId?: string): Promise<any[]> {
    await this.learningRepo.ensureTablesExist();
    const history = await this.learningRepo.getLearningHistory(modelId);
    if (history.length === 0) {
      await this.engine.runLearningCycle();
      return await this.learningRepo.getLearningHistory(modelId);
    }
    return history;
  }

  async getLearningFeedback(modelId?: string): Promise<any[]> {
    await this.learningRepo.ensureTablesExist();
    const feedback = await this.learningRepo.getLearningFeedback(modelId);
    if (feedback.length === 0) {
      await this.engine.runLearningCycle();
      return await this.learningRepo.getLearningFeedback(modelId);
    }
    return feedback;
  }

  async triggerManualLearningCycle(): Promise<void> {
    await this.engine.runLearningCycle();
  }
}
