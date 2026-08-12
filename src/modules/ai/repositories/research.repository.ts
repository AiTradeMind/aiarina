import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import {
  aiResearchSessions,
  aiResearchIntelReports,
  aiResearchReasoning,
  aiResearchEvidenceTable,
  aiResearchGraph,
  aiResearchMetricsTable
} from "../../../db/schema.ts";

export interface CreateResearchSessionInput {
  organizationId: string;
  userId: number;
  topic: string;
  intent?: string;
  status?: string;
  consensusSessionId?: number;
  metadata?: any;
}

export interface CreateResearchReportInput {
  sessionId: number;
  title: string;
  finalVerdict: "BUY" | "SELL" | "HOLD";
  marketBias: "BULLISH" | "BEARISH" | "NEUTRAL";
  bullishScore: number;
  bearishScore: number;
  neutralScore: number;
  trendStrength: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  opportunityScore: number;
  confidenceScore: number;
  executiveSummary: string;
  detailedReportMarkdown: string;
  detailedReportJson: any;
}

export interface CreateResearchReasoningInput {
  reportId: number;
  nodeType: "CLAIM" | "REASON" | "COUNTER" | "REBUTTAL" | "RISK";
  title: string;
  content: string;
  confidence: number;
  metadata?: any;
}

export interface CreateResearchEvidenceInput {
  reportId: number;
  sourceId?: string;
  sourceType: string;
  title: string;
  content: string;
  ranking: number;
  credibilityScore: number;
  metadata?: any;
}

export interface CreateResearchGraphInput {
  organizationId: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationType: string;
  weight?: number;
  metadata?: any;
}

export interface CreateResearchMetricsInput {
  sessionId: number;
  durationMs: number;
  processingTimeMs: number;
  evidenceCount: number;
  reasoningDepth: number;
  confidenceTrend?: number[];
  researchQuality: number;
}

export class ResearchRepository {
  async ensureTablesExist(): Promise<void> {
    const db = getDb();
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ai_research_sessions (
          id SERIAL PRIMARY KEY,
          organization_id VARCHAR(50),
          user_id INTEGER,
          topic VARCHAR(255) NOT NULL,
          intent VARCHAR(100),
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
          consensus_session_id INTEGER,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_research_intel_reports (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_research_sessions(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          final_verdict VARCHAR(50) NOT NULL,
          market_bias VARCHAR(50) NOT NULL,
          bullish_score DOUBLE PRECISION NOT NULL,
          bearish_score DOUBLE PRECISION NOT NULL,
          neutral_score DOUBLE PRECISION NOT NULL,
          trend_strength DOUBLE PRECISION NOT NULL,
          risk_level VARCHAR(50) NOT NULL,
          opportunity_score DOUBLE PRECISION NOT NULL,
          confidence_score DOUBLE PRECISION NOT NULL,
          executive_summary TEXT NOT NULL,
          detailed_report_markdown TEXT NOT NULL,
          detailed_report_json JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_research_reasoning (
          id SERIAL PRIMARY KEY,
          report_id INTEGER REFERENCES ai_research_intel_reports(id) ON DELETE CASCADE,
          node_type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          confidence DOUBLE PRECISION NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_research_evidence (
          id SERIAL PRIMARY KEY,
          report_id INTEGER REFERENCES ai_research_intel_reports(id) ON DELETE CASCADE,
          source_id VARCHAR(255),
          source_type VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          ranking INTEGER NOT NULL,
          credibility_score DOUBLE PRECISION NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_research_graph (
          id SERIAL PRIMARY KEY,
          organization_id VARCHAR(50),
          source_type VARCHAR(50) NOT NULL,
          source_id VARCHAR(100) NOT NULL,
          target_type VARCHAR(50) NOT NULL,
          target_id VARCHAR(100) NOT NULL,
          relation_type VARCHAR(100) NOT NULL,
          weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_research_metrics (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_research_sessions(id) ON DELETE CASCADE,
          duration_ms INTEGER NOT NULL,
          processing_time_ms INTEGER NOT NULL,
          evidence_count INTEGER NOT NULL,
          reasoning_depth INTEGER NOT NULL,
          confidence_trend JSONB DEFAULT '[]',
          research_quality DOUBLE PRECISION NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
    } catch (err: any) {
      console.error("Failed to cleanly verify/create research table instances:", err);
    }
  }

  async createSession(data: CreateResearchSessionInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiResearchSessions).values(data).returning();
    return result[0];
  }

  async updateSessionStatus(id: number, status: string, metadataUpdate?: any): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();
    const current = await this.getSession(id);
    const updatedMetadata = current ? { ...current.metadata, ...metadataUpdate } : metadataUpdate;

    await db.update(aiResearchSessions)
      .set({ status, metadata: updatedMetadata })
      .where(eq(aiResearchSessions.id, id));
  }

  async getSession(id: number): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiResearchSessions).where(eq(aiResearchSessions.id, id)).limit(1);
    return result[0] || null;
  }

  async getAllSessions(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiResearchSessions).orderBy(desc(aiResearchSessions.createdAt));
  }

  async createReport(data: CreateResearchReportInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiResearchIntelReports).values(data).returning();
    return result[0];
  }

  async getReportBySession(sessionId: number): Promise<any | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiResearchIntelReports).where(eq(aiResearchIntelReports.sessionId, sessionId)).limit(1);
    return result[0] || null;
  }

  async createReasoningNode(data: CreateResearchReasoningInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiResearchReasoning).values(data).returning();
    return result[0];
  }

  async getReasoningByReport(reportId: number): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiResearchReasoning).where(eq(aiResearchReasoning.reportId, reportId));
  }

  async createEvidenceNode(data: CreateResearchEvidenceInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiResearchEvidenceTable).values(data).returning();
    return result[0];
  }

  async getEvidenceByReport(reportId: number): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiResearchEvidenceTable).where(eq(aiResearchEvidenceTable.reportId, reportId)).orderBy(aiResearchEvidenceTable.ranking);
  }

  async createGraphRelation(data: CreateResearchGraphInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    // Prevent duplicate exact relationships if they already exist
    const existing = await db.select()
      .from(aiResearchGraph)
      .where(
        and(
          eq(aiResearchGraph.sourceType, data.sourceType),
          eq(aiResearchGraph.sourceId, data.sourceId),
          eq(aiResearchGraph.targetType, data.targetType),
          eq(aiResearchGraph.targetId, data.targetId),
          eq(aiResearchGraph.relationType, data.relationType)
        )
      ).limit(1);

    if (existing && existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(aiResearchGraph).values(data).returning();
    return result[0];
  }

  async getGraph(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiResearchGraph);
  }

  async createMetrics(data: CreateResearchMetricsInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiResearchMetricsTable).values(data).returning();
    return result[0];
  }

  async getMetrics(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiResearchMetricsTable).orderBy(desc(aiResearchMetricsTable.createdAt));
  }
}
