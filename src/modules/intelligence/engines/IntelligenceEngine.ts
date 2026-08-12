import { intelligenceRepository } from "../repositories/IntelligenceRepository";

export class IntelligenceEngine {
  async processIntelligence(data: any): Promise<any> {
    await intelligenceRepository.ensureTables();
    return { status: "processed" };
  }
}

export const intelligenceEngine = new IntelligenceEngine();
