import { learningRepository } from "../repositories/LearningRepository";
import { decisionAnalysisEngine } from "../engines/DecisionAnalysisEngine";
import { patternRecognitionEngine } from "../engines/PatternRecognitionEngine";
import { learningEngine } from "../engines/LearningEngine";
import { learningFeedbackService } from "./LearningFeedbackService";
import { learningSnapshotService } from "./LearningSnapshotService";
import { randomUUID } from "crypto";

export class LearningService {
  public async processCompletedTrade(organizationId: string, trade: any): Promise<void> {
    const analysis = decisionAnalysisEngine.analyzeTradeDecision(trade);
    const recordId = `lr_${randomUUID().replace(/-/g, '').substring(0, 12)}`;

    await learningRepository.insertRecord({
      id: recordId,
      organizationId,
      aiModelId: trade.aiModelId || 'ai_default_model',
      strategyId: trade.strategyId || 'strat_default',
      tradeId: trade.id || trade.tradeId,
      decision: analysis.decision,
      reason: analysis.reason,
      confidence: analysis.confidence,
      marketContext: analysis.marketContext,
      indicatorsUsed: analysis.indicatorsUsed,
      riskLevel: analysis.riskLevel,
      result: analysis.result,
      pnl: analysis.pnl,
      learningOutcome: analysis.learningOutcome,
      createdAt: new Date()
    });

    // Generate automated feedback
    if (analysis.result === 'SUCCESS') {
      await learningFeedbackService.generateAndStoreFeedback(
        organizationId,
        trade.aiModelId,
        trade.strategyId,
        'POSITIVE',
        'Successful Trade Execution Pattern',
        analysis.learningOutcome,
        { pnl: analysis.pnl, confidence: analysis.confidence }
      );
    } else {
      await learningFeedbackService.generateAndStoreFeedback(
        organizationId,
        trade.aiModelId,
        trade.strategyId,
        'NEGATIVE',
        'Trade Drawdown Analysis',
        analysis.learningOutcome,
        { pnl: analysis.pnl, riskLevel: analysis.riskLevel }
      );
    }

    // Update patterns
    const records = await learningRepository.getRecords(organizationId, 50);
    const patterns = patternRecognitionEngine.detectPatterns(records);
    for (const pat of patterns) {
      await learningRepository.upsertPattern({
        id: `pat_${randomUUID().replace(/-/g, '').substring(0, 8)}`,
        organizationId,
        aiModelId: trade.aiModelId,
        strategyId: trade.strategyId,
        patternName: pat.patternName,
        patternType: pat.patternType,
        marketCondition: pat.marketCondition,
        frequency: 1,
        winRate: pat.winRate,
        impactScore: pat.impactScore,
        metadata: pat.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create Snapshot
    const scores = learningEngine.computeScores(records);
    await learningSnapshotService.createSnapshot(
      organizationId,
      'AI_MODEL',
      trade.aiModelId || 'ai_default_model',
      'DAILY',
      {
        totalDecisions: records.length,
        successRate: scores.successRate,
        learningScore: scores.learningScore,
        improvementScore: scores.improvementScore,
        consistencyRankInput: scores.learningScore * 0.9,
        patternsDetected: patterns.length
      }
    );
  }

  public async getLearningData(organizationId: string) {
    const records = await learningRepository.getRecords(organizationId, 50);
    const feedback = await learningRepository.getFeedback(organizationId, 50);
    const patterns = await learningRepository.getPatterns(organizationId);
    const snapshots = await learningRepository.getSnapshots(organizationId);
    const knowledge = await learningRepository.getKnowledge(organizationId);

    const scores = learningEngine.computeScores(records);

    return {
      observability: {
        learningProgress: scores.learningScore,
        queuePendingCount: 0,
        patternDetectionCount: patterns.length,
        feedbackGeneratedCount: feedback.length,
        knowledgeUpdateCount: knowledge.length,
        decisionAnalysisCount: records.length
      },
      records,
      feedback,
      patterns,
      snapshots,
      knowledge
    };
  }

  public async getHistory(organizationId: string) {
    return await learningRepository.getRecords(organizationId, 100);
  }

  public async getFeedback(organizationId: string) {
    return await learningRepository.getFeedback(organizationId, 100);
  }

  public async getPatterns(organizationId: string) {
    return await learningRepository.getPatterns(organizationId);
  }

  public async getSnapshots(organizationId: string) {
    return await learningRepository.getSnapshots(organizationId);
  }

  public async getKnowledge(organizationId: string) {
    return await learningRepository.getKnowledge(organizationId);
  }
}

export const learningService = new LearningService();
