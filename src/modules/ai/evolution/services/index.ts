import { EvolutionRepository } from "../repositories/index.ts";
import { 
  AiMemoryProfile, AiLearningSession, AiLearningEvent, AiPattern,
  AiMemorySnapshot, AiMemoryVersion, AiExperienceHistory, AiSkillProgress 
} from "../types/index.ts";
import { randomUUID } from "crypto";

export class EvolutionService {
  private repo = new EvolutionRepository();

  async getProfiles(): Promise<AiMemoryProfile[]> {
    return await this.repo.getProfiles();
  }

  async getPatterns(): Promise<AiPattern[]> {
    return await this.repo.getPatterns();
  }

  async getHistory(): Promise<AiExperienceHistory[]> {
    return await this.repo.getHistory();
  }

  async getSnapshots(): Promise<AiMemorySnapshot[]> {
    return await this.repo.getSnapshots();
  }

  async getLearningSessions(): Promise<AiLearningSession[]> {
    return await this.repo.getLearningSessions();
  }

  async getSkills(): Promise<AiSkillProgress[]> {
    return await this.repo.getSkills();
  }

  async learn(modelId: string, eventType: string, category: string, description: string): Promise<{ success: boolean; message: string }> {
    console.log(`Learning for model ${modelId}: ${eventType} in ${category}`);
    return { success: true, message: 'Learning event processed' };
  }

  async analyze(modelId: string): Promise<{ success: boolean; message: string }> {
    console.log(`Analyzing patterns for model ${modelId}`);
    return { success: true, message: 'Analysis complete' };
  }

  async snapshot(modelId: string, reason: string): Promise<{ success: boolean; message: string }> {
    console.log(`Creating snapshot for model ${modelId}: ${reason}`);
    return { success: true, message: 'Snapshot created' };
  }

  async seedInitialData(): Promise<void> {
    const profiles = await this.repo.getProfiles();
    if (profiles.length > 0) return;

    await this.repo.createProfile({
      id: randomUUID(),
      modelId: "gpt-4o",
      knowledgeScore: 95,
      learningScore: 92,
      experienceScore: 88,
      reasoningScore: 96,
      patternScore: 90,
      confidenceTrend: 0.05,
      growthIndex: 1.12,
      learningVelocity: 1.5,
      memoryHealth: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.repo.createPattern({
      id: randomUUID(),
      modelId: "gpt-4o",
      patternType: "WINNING",
      name: "High Volatility Alpha",
      description: "Successfully captured alpha during rapid market volatility by adjusting risk limits.",
      frequency: 14,
      confidence: 0.88,
      firstSeenAt: new Date(Date.now() - 86400000 * 30),
      lastSeenAt: new Date()
    });

    await this.repo.createSkill({
      id: randomUUID(),
      modelId: "gpt-4o",
      skillName: "Market Analysis",
      level: 4,
      progress: 0.75,
      updatedAt: new Date()
    });
    
    await this.repo.createHistory({
      id: randomUUID(),
      modelId: "gpt-4o",
      experiencePoints: 1250,
      growthDelta: 2.5,
      adaptationScore: 85,
      improvementTrend: 1.2,
      timestamp: new Date()
    });

    await this.repo.createSession({
      id: randomUUID(),
      modelId: "gpt-4o",
      sessionType: "POST_MORTEM",
      durationMs: 45000,
      eventsProcessed: 120,
      insightsGenerated: 3,
      status: "COMPLETED",
      createdAt: new Date(),
      completedAt: new Date()
    });
  }
}
