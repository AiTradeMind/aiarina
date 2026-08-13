import { getDb } from "../../../../db/client";
import { 
  aiBrains, brainSessions, brainTasks, brainReasoning, 
  brainConsensus, brainAssignments, brainHistory 
} from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { 
  Brain, BrainSession, BrainTask, BrainReasoning, 
  BrainConsensus, BrainAssignment, BrainHistory 
} from "../types";

export class BrainRepository {
  async getBrain(id: string): Promise<Brain | null> {
    const db = await getDb();
    const result = await db.select().from(aiBrains).where(eq(aiBrains.id, id)).limit(1);
    return result[0] as Brain || null;
  }

  async getBrains(): Promise<Brain[]> {
    const db = await getDb();
    return await db.select().from(aiBrains) as Brain[];
  }

  async createBrain(brain: Brain): Promise<void> {
    const db = await getDb();
    await db.insert(aiBrains).values(brain);
  }

  async updateBrain(id: string, updates: Partial<Brain>): Promise<void> {
    const db = await getDb();
    await db.update(aiBrains).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(aiBrains.id, id));
  }
}

export class BrainSessionRepository {
  async createSession(session: BrainSession): Promise<void> {
    const db = await getDb();
    await db.insert(brainSessions).values(session);
  }
  
  async getSessions(brainId: string): Promise<BrainSession[]> {
    const db = await getDb();
    return await db.select().from(brainSessions).where(eq(brainSessions.brainId, brainId)).orderBy(desc(brainSessions.createdAt)) as BrainSession[];
  }
}

export class BrainTaskRepository {
  async createTask(task: BrainTask): Promise<void> {
    const db = await getDb();
    const { requiredExpertise, ...rest } = task;
    await db.insert(brainTasks).values({
      ...rest,
      requiredExpertise: JSON.stringify(requiredExpertise)
    });
  }

  async getTasks(): Promise<BrainTask[]> {
    const db = await getDb();
    const results = await db.select().from(brainTasks).orderBy(desc(brainTasks.createdAt));
    return results.map(r => ({
      ...r,
      requiredExpertise: JSON.parse(r.requiredExpertise)
    })) as BrainTask[];
  }
  
  async getTask(id: string): Promise<BrainTask | null> {
    const db = await getDb();
    const result = await db.select().from(brainTasks).where(eq(brainTasks.id, id)).limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      requiredExpertise: JSON.parse(result[0].requiredExpertise)
    } as BrainTask;
  }

  async updateTask(id: string, updates: Partial<BrainTask>): Promise<void> {
    const db = await getDb();
    const updateData: any = { ...updates, updatedAt: new Date().toISOString() };
    if (updates.requiredExpertise) {
      updateData.requiredExpertise = JSON.stringify(updates.requiredExpertise);
    }
    await db.update(brainTasks).set(updateData).where(eq(brainTasks.id, id));
  }
}

export class BrainReasoningRepository {
  async addReasoning(reasoning: BrainReasoning): Promise<void> {
    const db = await getDb();
    await db.insert(brainReasoning).values(reasoning);
  }
  
  async getReasoning(taskId: string): Promise<BrainReasoning[]> {
    const db = await getDb();
    return await db.select().from(brainReasoning).where(eq(brainReasoning.taskId, taskId)).orderBy(desc(brainReasoning.step)) as BrainReasoning[];
  }
}

export class BrainConsensusRepository {
  async createConsensus(consensus: BrainConsensus): Promise<void> {
    const db = await getDb();
    await db.insert(brainConsensus).values(consensus);
  }
  
  async getConsensus(taskId: string): Promise<BrainConsensus | null> {
    const db = await getDb();
    const result = await db.select().from(brainConsensus).where(eq(brainConsensus.taskId, taskId)).limit(1);
    return result[0] as BrainConsensus || null;
  }
}

export class BrainAssignmentRepository {
  async createAssignment(assignment: BrainAssignment): Promise<void> {
    const db = await getDb();
    await db.insert(brainAssignments).values(assignment);
  }
  
  async getAssignments(taskId: string): Promise<BrainAssignment[]> {
    const db = await getDb();
    return await db.select().from(brainAssignments).where(eq(brainAssignments.taskId, taskId)).orderBy(desc(brainAssignments.assignedAt)) as BrainAssignment[];
  }
  
  async updateAssignment(id: string, updates: Partial<BrainAssignment>): Promise<void> {
    const db = await getDb();
    await db.update(brainAssignments).set(updates).where(eq(brainAssignments.id, id));
  }
}

export class BrainHistoryRepository {
  async addHistory(history: BrainHistory): Promise<void> {
    const db = await getDb();
    await db.insert(brainHistory).values(history);
  }

  async getHistory(brainId: string): Promise<BrainHistory[]> {
    const db = await getDb();
    return await db.select().from(brainHistory).where(eq(brainHistory.brainId, brainId)).orderBy(desc(brainHistory.timestamp)) as BrainHistory[];
  }
}
