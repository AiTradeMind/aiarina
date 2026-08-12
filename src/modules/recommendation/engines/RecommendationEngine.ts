import { recommendationRepository } from "../repositories/RecommendationRepository";
import { priorityEngine } from "./PriorityEngine";
import { v4 as uuidv4 } from "uuid";

export class RecommendationEngine {
  async generate(entityId: string, type: any): Promise<any> {
    await recommendationRepository.ensureTables();
    return { id: uuidv4(), entityId, type, content: "Recommendation placeholder", priority: priorityEngine.calculatePriority({}) };
  }
}
export const recommendationEngine = new RecommendationEngine();
