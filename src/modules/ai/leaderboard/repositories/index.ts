import { getDb } from "../../../../db/client";
import { 
  aiLeaderboards, aiRankings, aiScorecards, aiPerformanceHistory, aiBenchmarks 
} from "../../../../db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { 
  AiLeaderboard, AiRanking, AiScorecard, AiPerformanceHistory, AiBenchmark 
} from "../types";

export class LeaderboardRepository {
  async getLeaderboards(): Promise<AiLeaderboard[]> {
    const db = await getDb();
    return await db.select().from(aiLeaderboards) as AiLeaderboard[];
  }
  
  async getLeaderboardByCategory(categoryId: string): Promise<AiLeaderboard | null> {
    const db = await getDb();
    const result = await db.select().from(aiLeaderboards).where(eq(aiLeaderboards.categoryId, categoryId)).limit(1);
    return result[0] as AiLeaderboard || null;
  }

  async getRankings(leaderboardId: string): Promise<AiRanking[]> {
    const db = await getDb();
    return await db.select().from(aiRankings)
      .where(eq(aiRankings.leaderboardId, leaderboardId))
      .orderBy(asc(aiRankings.rank)) as AiRanking[];
  }

  async getScorecard(modelId: string): Promise<AiScorecard | null> {
    const db = await getDb();
    const result = await db.select().from(aiScorecards).where(eq(aiScorecards.modelId, modelId)).limit(1);
    return result[0] as AiScorecard || null;
  }

  async getPerformanceHistory(modelId: string): Promise<AiPerformanceHistory[]> {
    const db = await getDb();
    return await db.select().from(aiPerformanceHistory)
      .where(eq(aiPerformanceHistory.modelId, modelId))
      .orderBy(desc(aiPerformanceHistory.timestamp)) as AiPerformanceHistory[];
  }

  async getBenchmarks(): Promise<AiBenchmark[]> {
    const db = await getDb();
    return await db.select().from(aiBenchmarks).orderBy(desc(aiBenchmarks.timestamp)) as AiBenchmark[];
  }

  async createScorecard(scorecard: AiScorecard): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiScorecards).values(scorecard);
  }

  async updateScorecard(id: string, updates: Partial<AiScorecard>): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.update(aiScorecards).set({ ...updates, updatedAt: new Date() }).where(eq(aiScorecards.id, id));
  }
  
  async createLeaderboard(leaderboard: AiLeaderboard): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiLeaderboards).values(leaderboard);
  }

  async createRanking(ranking: AiRanking): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiRankings).values(ranking);
  }

  async createHistory(history: AiPerformanceHistory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiPerformanceHistory).values(history);
  }
  
  async updateRanking(id: string, updates: Partial<AiRanking>): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.update(aiRankings).set({ ...updates, updatedAt: new Date() }).where(eq(aiRankings.id, id));
  }
}
