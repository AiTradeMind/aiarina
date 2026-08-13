import { LearningRepository } from "../repositories/index.ts";
import { 
  LearningRecord, 
  LearningScore, 
  TrainRequest 
} from "../types/index.ts";
import { MemoryService } from "../../memory/services/index.ts";
import { AnalyticsService } from "../../../analytics/services/index.ts";
import { EventBusService } from "../../../events/services/index.ts";

export class LearningService {
  private repo = new LearningRepository();
  private memoryService = new MemoryService();
  private analyticsService = new AnalyticsService();
  private eventBus = EventBusService.getInstance();

  async getLearningSummary(organizationId: string) {
    const models = await this.repo.getScores(organizationId, 'MODEL');
    const strategies = await this.repo.getScores(organizationId, 'STRATEGY');
    const records = await this.repo.getRecords(organizationId);

    return {
      modelRankings: models,
      strategyRankings: strategies,
      recentLearning: records.slice(0, 10)
    };
  }

  async getModelScores(organizationId: string): Promise<LearningScore[]> {
    return await this.repo.getScores(organizationId, 'MODEL');
  }

  async getStrategyScores(organizationId: string): Promise<LearningScore[]> {
    return await this.repo.getScores(organizationId, 'STRATEGY');
  }

  async train(request: TrainRequest, organizationId: string, userId: number): Promise<LearningRecord> {
    // 1. Fetch relevant memories and analytics
    const memories = await this.memoryService.getMemory(organizationId);
    const relatedMemories = memories.filter(m => m.sourceId === request.targetId);
    
    // 2. Perform Learning Logic (Simulation)
    // In a real engine, this would analyze PnL, Win Rate, and Feedback
    const successCount = relatedMemories.filter(m => m.type === 'STRATEGY_RESULT' && m.data.success).length;
    const totalCount = relatedMemories.filter(m => m.type === 'STRATEGY_RESULT').length;
    
    const winRate = totalCount > 0 ? successCount / totalCount : 0.5;
    const learningScore = winRate.toFixed(4);
    const confidenceAdjustment = (winRate - 0.5).toFixed(4);

    // 3. Record Findings
    const record = await this.repo.createRecord({
      organizationId,
      type: 'PERFORMANCE',
      sourceId: request.targetId,
      findings: {
        winRate,
        sampleSize: totalCount,
        analyzedAt: new Date().toISOString(),
        source: request.source || 'MEMORY'
      },
      impactScore: Math.abs(winRate - 0.5).toString()
    });

    // 4. Update Scores
    await this.repo.upsertScore(organizationId, request.targetId, request.targetType, {
      learningScore,
      confidenceAdjustment,
      metadata: { lastTrainingId: record.id }
    });

    // 5. Publish Events
    await this.eventBus.publish({
      eventType: request.targetType === 'MODEL' ? 'MODEL_IMPROVED' : 'STRATEGY_IMPROVED',
      source: 'AI_LEARNING_ENGINE',
      organizationId,
      userId,
      payload: { targetId: request.targetId, learningScore, confidenceAdjustment },
    });

    await this.eventBus.publish({
      eventType: 'LEARNING_UPDATED',
      source: 'AI_LEARNING_ENGINE',
      organizationId,
      userId,
      payload: { recordId: record.id, targetId: request.targetId },
    });

    return record;
  }

  async initSubscriptions() {
    // Subscribe to events that should trigger learning
    // this.eventBus.subscribe('ANALYTICS_UPDATED', (event) => ...);
  }
}
