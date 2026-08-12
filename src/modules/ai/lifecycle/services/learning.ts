import { EvaluationService } from "./evaluation.ts";
import { LifecycleRepository } from "../repositories/index.ts";

export class LearningService {
  private evalService = new EvaluationService();
  private repo = new LifecycleRepository();

  async processLearning(modelId: number, organizationId: string): Promise<void> {
    const evaluation = await this.evalService.evaluateModel(modelId, organizationId);
    
    // In a real system, this would update AI knowledge base
    console.log(`[LearningService] Learning for model ${modelId}:`, evaluation);
  }
}
