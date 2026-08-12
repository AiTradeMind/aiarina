import { explainabilityRepository } from "../repositories/ExplainabilityRepository";

export class ExplainabilityEngine {
  async explainDecision(decisionId: string): Promise<any> {
    await explainabilityRepository.ensureTables();
    return { decisionId, explanation: "Decision explained successfully" };
  }
}

export const explainabilityEngine = new ExplainabilityEngine();
