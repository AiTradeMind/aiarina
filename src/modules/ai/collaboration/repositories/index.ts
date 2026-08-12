import { getDb } from "../../../../db/client.ts";
import { 
  aiCollaborations, collaborationSessions, collaborationMembers,
  collaborationTasks, collaborationMessages, collaborationResults,
  collaborationConsensus, collaborationHistory
} from "../../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { 
  AiCollaboration, CollaborationSession, CollaborationMember,
  CollaborationTask, CollaborationMessage, CollaborationResult,
  CollaborationConsensus, CollaborationHistory
} from "../types/index.ts";

export class CollaborationRepository {
  async getCollaborations(): Promise<AiCollaboration[]> {
    const db = await getDb();
    return await db.select().from(aiCollaborations).orderBy(desc(aiCollaborations.createdAt)) as AiCollaboration[];
  }

  async getSessions(collaborationId?: string): Promise<CollaborationSession[]> {
    const db = await getDb();
    let query = db.select().from(collaborationSessions).orderBy(desc(collaborationSessions.createdAt));
    if (collaborationId) {
       query = db.select().from(collaborationSessions).where(eq(collaborationSessions.collaborationId, collaborationId)).orderBy(desc(collaborationSessions.createdAt)) as any;
    }
    return await query as CollaborationSession[];
  }

  async getMembers(sessionId: string): Promise<CollaborationMember[]> {
    const db = await getDb();
    return await db.select().from(collaborationMembers).where(eq(collaborationMembers.sessionId, sessionId)) as CollaborationMember[];
  }

  async getTasks(sessionId: string): Promise<CollaborationTask[]> {
    const db = await getDb();
    return await db.select().from(collaborationTasks).where(eq(collaborationTasks.sessionId, sessionId)).orderBy(desc(collaborationTasks.createdAt)) as CollaborationTask[];
  }

  async getMessages(sessionId: string): Promise<CollaborationMessage[]> {
    const db = await getDb();
    return await db.select().from(collaborationMessages).where(eq(collaborationMessages.sessionId, sessionId)).orderBy(desc(collaborationMessages.timestamp)) as CollaborationMessage[];
  }

  async getResults(sessionId: string): Promise<CollaborationResult[]> {
    const db = await getDb();
    return await db.select().from(collaborationResults).where(eq(collaborationResults.sessionId, sessionId)) as CollaborationResult[];
  }
  
  async getConsensus(sessionId: string): Promise<CollaborationConsensus[]> {
    const db = await getDb();
    return await db.select().from(collaborationConsensus).where(eq(collaborationConsensus.sessionId, sessionId)) as CollaborationConsensus[];
  }

  async getHistory(sessionId: string): Promise<CollaborationHistory[]> {
    const db = await getDb();
    return await db.select().from(collaborationHistory).where(eq(collaborationHistory.sessionId, sessionId)).orderBy(desc(collaborationHistory.timestamp)) as CollaborationHistory[];
  }

  async createCollaboration(data: AiCollaboration): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiCollaborations).values(data);
  }

  async createSession(data: CollaborationSession): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(collaborationSessions).values(data);
  }

  async createMember(data: CollaborationMember): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(collaborationMembers).values(data);
  }

  async createTask(data: CollaborationTask): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(collaborationTasks).values(data);
  }

  async createResult(data: CollaborationResult): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(collaborationResults).values(data);
  }
  
  async createConsensus(data: CollaborationConsensus): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(collaborationConsensus).values(data);
  }

  async createHistory(data: CollaborationHistory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(collaborationHistory).values(data);
  }
}
