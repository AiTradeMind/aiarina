import { explainabilityEngine } from "../engines/ExplainabilityEngine";

export class ExplainabilityService {
  async getExplanation(decisionId: string): Promise<any> {
    return await explainabilityEngine.explainDecision(decisionId);
  }
}

export const explainabilityService = new ExplainabilityService();
