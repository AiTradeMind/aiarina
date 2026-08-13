import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  aiConsensusMemory, 
  aiConsensusRounds, 
  aiEvidence, 
  aiReliabilityHistory, 
  aiConsensusAudit, 
  aiConsensusQuality 
} from "../../../db/schema.ts";

export interface CreateSessionInput {
  organizationId: string;
  userId: number;
  topic: string;
  intent?: string;
  finalDecision: string;
  confidence: number;
  summary: string;
  metadata?: any;
}

export interface CreateRoundInput {
  sessionId: number;
  roundNumber: number;
  roundType: string;
  proposal?: string;
  roundMetadata?: any;
}

export interface CreateEvidenceInput {
  sessionId: number;
  roundId: number;
  modelId?: number;
  modelName: string;
  evidenceType: string;
  content: string;
  confidence: number;
  source?: string;
}

export interface CreateAuditInput {
  sessionId: number;
  roundId?: number;
  actionType: string;
  actor: string;
  payload: any;
  hash?: string;
}

export interface CreateQualityInput {
  sessionId: number;
  agreementPercent: number;
  evidenceQuality: number;
  reasoningQuality: number;
  confidenceQuality: number;
  reliabilityWeight: number;
  consensusStability: number;
  overallGrade: string;
}

export class AIConsensusRepository {
  async ensureTablesExist(): Promise<void> {
    const db = getDb();
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ai_consensus_memory (
          id SERIAL PRIMARY KEY,
          organization_id VARCHAR(50),
          user_id INTEGER,
          topic VARCHAR(255) NOT NULL,
          intent VARCHAR(255),
          final_decision TEXT NOT NULL,
          confidence DOUBLE PRECISION NOT NULL,
          summary TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_consensus_rounds (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_consensus_memory(id) ON DELETE CASCADE,
          round_number INTEGER NOT NULL,
          round_type VARCHAR(50) NOT NULL,
          proposal TEXT,
          round_metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_evidence (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_consensus_memory(id) ON DELETE CASCADE,
          round_id INTEGER REFERENCES ai_consensus_rounds(id) ON DELETE CASCADE,
          model_id INTEGER,
          model_name VARCHAR(100) NOT NULL,
          evidence_type VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          confidence DOUBLE PRECISION NOT NULL,
          source VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_reliability_history (
          id SERIAL PRIMARY KEY,
          model_id INTEGER,
          model_name VARCHAR(100) NOT NULL,
          historical_accuracy DOUBLE PRECISION NOT NULL DEFAULT 1.0,
          response_stability DOUBLE PRECISION NOT NULL DEFAULT 1.0,
          latency DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          timeout_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          failure_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          domain_expertise JSONB DEFAULT '{}',
          weighted_reliability DOUBLE PRECISION NOT NULL DEFAULT 1.0,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_consensus_audit (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_consensus_memory(id) ON DELETE CASCADE,
          round_id INTEGER,
          action_type VARCHAR(100) NOT NULL,
          actor VARCHAR(100) NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}',
          hash VARCHAR(64),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_consensus_quality (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_consensus_memory(id) ON DELETE CASCADE UNIQUE,
          agreement_percent DOUBLE PRECISION NOT NULL,
          evidence_quality DOUBLE PRECISION NOT NULL,
          reasoning_quality DOUBLE PRECISION NOT NULL,
          confidence_quality DOUBLE PRECISION NOT NULL,
          reliability_weight DOUBLE PRECISION NOT NULL,
          consensus_stability DOUBLE PRECISION NOT NULL,
          overall_grade VARCHAR(10) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
    } catch (err: any) {
      console.error("Failed to cleanly verify/create consensus table instances:", err);
    }
  }

  async createSession(data: CreateSessionInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiConsensusMemory).values(data).returning();
    return result[0];
  }

  async getSession(id: number): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiConsensusMemory).where(eq(aiConsensusMemory.id, id)).limit(1);
    return result[0] || null;
  }

  async getAllSessions(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiConsensusMemory).orderBy(desc(aiConsensusMemory.createdAt));
  }

  async createRound(data: CreateRoundInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiConsensusRounds).values(data).returning();
    return result[0];
  }

  async getRoundsBySession(sessionId: number): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiConsensusRounds).where(eq(aiConsensusRounds.sessionId, sessionId)).orderBy(aiConsensusRounds.roundNumber);
  }

  async createEvidence(data: CreateEvidenceInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiEvidence).values(data).returning();
    return result[0];
  }

  async getEvidenceBySession(sessionId: number): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiEvidence).where(eq(aiEvidence.sessionId, sessionId));
  }

  async getReliabilityHistory(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiReliabilityHistory).orderBy(desc(aiReliabilityHistory.weightedReliability));
  }

  async findReliabilityByModel(modelName: string): Promise<any | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiReliabilityHistory).where(eq(aiReliabilityHistory.modelName, modelName)).limit(1);
    return result[0] || null;
  }

  async updateReliability(modelId: number | undefined, modelName: string, metrics: {
    historicalAccuracy: number;
    responseStability: number;
    latency: number;
    timeoutRate: number;
    failureRate: number;
    domainExpertise?: any;
    weightedReliability: number;
  }): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();
    const existing = await this.findReliabilityByModel(modelName);
    if (existing) {
      await db.update(aiReliabilityHistory)
        .set({
          historicalAccuracy: metrics.historicalAccuracy,
          responseStability: metrics.responseStability,
          latency: metrics.latency,
          timeoutRate: metrics.timeoutRate,
          failureRate: metrics.failureRate,
          domainExpertise: metrics.domainExpertise || existing.domainExpertise,
          weightedReliability: metrics.weightedReliability,
          updatedAt: new Date()
        })
        .where(eq(aiReliabilityHistory.modelName, modelName));
    } else {
      await db.insert(aiReliabilityHistory)
        .values({
          modelId: modelId || null,
          modelName,
          historicalAccuracy: metrics.historicalAccuracy,
          responseStability: metrics.responseStability,
          latency: metrics.latency,
          timeoutRate: metrics.timeoutRate,
          failureRate: metrics.failureRate,
          domainExpertise: metrics.domainExpertise || {},
          weightedReliability: metrics.weightedReliability
        });
    }
  }

  async createAudit(data: CreateAuditInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiConsensusAudit).values(data).returning();
    return result[0];
  }

  async getAuditLogs(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiConsensusAudit).orderBy(desc(aiConsensusAudit.createdAt));
  }

  async getAuditLogsBySession(sessionId: number): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiConsensusAudit).where(eq(aiConsensusAudit.sessionId, sessionId)).orderBy(aiConsensusAudit.id);
  }

  async createQuality(data: CreateQualityInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiConsensusQuality).values(data).returning();
    return result[0];
  }

  async getQualityBySession(sessionId: number): Promise<any | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiConsensusQuality).where(eq(aiConsensusQuality.sessionId, sessionId)).limit(1);
    return result[0] || null;
  }

  async getAllQuality(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiConsensusQuality).orderBy(desc(aiConsensusQuality.agreementPercent));
  }
}
