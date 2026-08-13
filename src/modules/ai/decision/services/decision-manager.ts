import { AIRouterService } from "../../services/ai-router.service.ts";
import { ConsensusEngine } from "./consensus-engine.ts";
import { AIDecisionRepository, AIRecommendationRepository } from "../repositories/index.ts";
import { 
  DecisionRequest, 
  AIDecision, 
  AIRecommendation, 
  DecisionType 
} from "../types/index.ts";
import { AIModelRepository } from "../../repositories/index.ts";
import { EventBusService } from "../../../events/services/index.ts";
import { StrategyService } from "../../../strategy/services/index.ts";

export class DecisionManager {
  private router = new AIRouterService();
  private consensus = new ConsensusEngine();
  private decisionRepo = new AIDecisionRepository();
  private recommendationRepo = new AIRecommendationRepository();
  private modelRepo = new AIModelRepository();
  private eventBus = EventBusService.getInstance();
  private strategyService = new StrategyService();

  async makeDecision(request: DecisionRequest, organizationId: string, userId: number): Promise<AIDecision> {
    const modelsToUse = request.modelIds || await this.getDefaultModels();
    
    const responses = await Promise.all(
      modelsToUse.map(modelId => this.router.route({
        organizationId,
        userId,
        prompt: this.constructPrompt(request),
        modelId
      }))
    );

    let finalDecisionData: any;
    let confidence: number;
    let metadata: any;

    if (request.requireConsensus || modelsToUse.length > 1) {
      const result = await this.consensus.resolve(responses);
      finalDecisionData = result.decision;
      confidence = result.confidence;
      metadata = result.metadata;
    } else {
      // Single model decision
      finalDecisionData = { text: responses[0].text };
      confidence = 1.0;
      metadata = { model: responses[0].providerName };
    }

    // Save decision
    const decision = await this.decisionRepo.create({
      organizationId,
      userId,
      type: request.type,
      decision: finalDecisionData,
      confidence: confidence.toFixed(4),
      modelIds: modelsToUse,
      consensusMetadata: metadata,
      status: 'COMPLETED'
    });

    // Strategy Engine Evaluation
    if (finalDecisionData.action && ['BUY', 'SELL', 'HOLD'].includes(finalDecisionData.action)) {
      await this.strategyService.evaluate({
        type: 'TREND_FOLLOWING', // Default or mapped type
        input: { ...finalDecisionData, confidence: decision.confidence },
        decisionId: decision.id,
        userId
      }, organizationId);
    }

    // Extract recommendations if applicable (deprecated by Strategy Engine but keeping for history)
    if (finalDecisionData.action && ['BUY', 'SELL', 'HOLD'].includes(finalDecisionData.action)) {
      await this.recommendationRepo.create({
        organizationId,
        decisionId: decision.id,
        ticker: finalDecisionData.ticker || (request.input?.ticker),
        action: finalDecisionData.action,
        rationale: finalDecisionData.rationale,
      });
    }

    // Publish Events
    await this.eventBus.publish({
      eventType: 'AI_DECISION',
      source: 'AI_DECISION_ENGINE',
      organizationId,
      userId,
      payload: { decisionId: decision.id, type: decision.type, confidence: decision.confidence },
    });

    if (Number(decision.confidence) < 0.5) {
      await this.eventBus.publish({
        eventType: 'AI_WARNING',
        source: 'AI_DECISION_ENGINE',
        organizationId,
        userId,
        payload: { message: `Low confidence decision for ${request.type}`, confidence },
      });
    }

    return decision;
  }

  private constructPrompt(request: DecisionRequest): string {
    return `Analyze the following ${request.type} request and provide a decision in JSON format with fields: "action" (BUY/SELL/HOLD/NEUTRAL), "ticker", "rationale", "confidence".
    Input data: ${JSON.stringify(request.input)}`;
  }

  private async getDefaultModels(): Promise<number[]> {
    const models = await this.modelRepo.findAll();
    return models.filter(m => m.isActive).slice(0, 3).map(m => m.id);
  }

  async getHistory(organizationId: string): Promise<AIDecision[]> {
    return await this.decisionRepo.findByOrg(organizationId);
  }

  async getRecommendations(organizationId: string): Promise<AIRecommendation[]> {
    return await this.recommendationRepo.findByOrg(organizationId);
  }
}
