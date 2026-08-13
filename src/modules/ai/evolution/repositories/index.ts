import { getDb } from "../../../../db/client.ts";
import { 
  aiMemoryProfiles, aiLearningSessions, aiLearningEvents, aiPatternLibrary, 
  aiMemorySnapshots, aiMemoryVersions, aiExperienceHistory, aiSkillProgress 
} from "../../../../db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import { 
  AiMemoryProfile, AiLearningSession, AiLearningEvent, AiPattern,
  AiMemorySnapshot, AiMemoryVersion, AiExperienceHistory, AiSkillProgress 
} from "../types/index.ts";

export class EvolutionRepository {
  async getProfiles(): Promise<AiMemoryProfile[]> {
    const db = await getDb();
    return await db.select().from(aiMemoryProfiles) as AiMemoryProfile[];
  }

  async getLearningSessions(): Promise<AiLearningSession[]> {
    const db = await getDb();
    return await db.select().from(aiLearningSessions).orderBy(desc(aiLearningSessions.createdAt)) as AiLearningSession[];
  }

  async getEvents(): Promise<AiLearningEvent[]> {
    const db = await getDb();
    return await db.select().from(aiLearningEvents).orderBy(desc(aiLearningEvents.timestamp)) as AiLearningEvent[];
  }

  async getPatterns(): Promise<AiPattern[]> {
    const db = await getDb();
    return await db.select().from(aiPatternLibrary).orderBy(desc(aiPatternLibrary.confidence)) as AiPattern[];
  }

  async getSnapshots(): Promise<AiMemorySnapshot[]> {
    const db = await getDb();
    return await db.select().from(aiMemorySnapshots).orderBy(desc(aiMemorySnapshots.timestamp)) as AiMemorySnapshot[];
  }

  async getHistory(): Promise<AiExperienceHistory[]> {
    const db = await getDb();
    return await db.select().from(aiExperienceHistory).orderBy(desc(aiExperienceHistory.timestamp)) as AiExperienceHistory[];
  }

  async getSkills(): Promise<AiSkillProgress[]> {
    const db = await getDb();
    return await db.select().from(aiSkillProgress).orderBy(desc(aiSkillProgress.level)) as AiSkillProgress[];
  }

  async createProfile(data: AiMemoryProfile): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiMemoryProfiles).values(data);
  }

  async createSession(data: AiLearningSession): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiLearningSessions).values(data);
  }

  async createEvent(data: AiLearningEvent): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiLearningEvents).values(data);
  }

  async createPattern(data: AiPattern): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiPatternLibrary).values(data);
  }

  async createSnapshot(data: AiMemorySnapshot): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiMemorySnapshots).values(data);
  }

  async createVersion(data: AiMemoryVersion): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiMemoryVersions).values(data);
  }

  async createHistory(data: AiExperienceHistory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiExperienceHistory).values(data);
  }

  async createSkill(data: AiSkillProgress): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiSkillProgress).values(data);
  }
}
