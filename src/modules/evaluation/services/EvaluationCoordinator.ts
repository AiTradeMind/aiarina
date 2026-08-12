import { evaluationService } from "./EvaluationService";

export class EvaluationCoordinator {
  async coordinate(entityId: string, entityType: string, organizationId: string): Promise<any> {
    return await evaluationService.runEvaluation(entityId, entityType, organizationId);
  }
}
export const evaluationCoordinator = new EvaluationCoordinator();
