import { EvaluationResult } from "../types";
import { scoreCalculator } from "./ScoreCalculator";

export class EvaluationEngine {
  async evaluate(entityId: string, entityType: string): Promise<EvaluationResult> {
    const overallScore = scoreCalculator.calculateScore({});
    return {
      id: "eval_id",
      entityId,
      entityType: entityType as any,
      overallScore,
      scores: {} as any,
      createdAt: new Date(),
    };
  }
}
export const evaluationEngine = new EvaluationEngine();
