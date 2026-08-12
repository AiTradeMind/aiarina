import { evaluationRepository } from "../repositories/EvaluationRepository";
import { evaluationEngine } from "../engines/EvaluationEngine";
import { EvaluationResult } from "../types";
import { v4 as uuidv4 } from "uuid";

export class EvaluationService {
  async runEvaluation(entityId: string, entityType: string, organizationId: string): Promise<EvaluationResult> {
    const result = await evaluationEngine.evaluate(entityId, entityType);
    await evaluationRepository.insertEvaluation({ ...result, organizationId });
    return result;
  }
}
export const evaluationService = new EvaluationService();
