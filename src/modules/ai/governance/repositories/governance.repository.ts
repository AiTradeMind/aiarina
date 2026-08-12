import { eq, desc, sql, and } from "drizzle-orm";
import { getDb } from "../../../../db/client.ts";
import {
  aiGovernanceSessions,
  aiPolicyViolations,
  aiSafetyReports,
  aiExplainability,
  aiCompliance,
  aiHumanReviews,
  aiGovernanceMetrics,
  aiAuditReplay
} from "../../../../db/schema.ts";
import {
  GovernanceSession,
  PolicyViolation,
  SafetyReport,
  ExplainabilityRecord,
  ComplianceRecord,
  HumanReview,
  GovernanceMetrics,
  AuditReplayRecord
} from "../types/governance.types.ts";

export class GovernanceRepository {
  async ensureTablesExist(): Promise<void> {
    const db = getDb();
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ai_governance_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          organization_id VARCHAR(50),
          request_payload JSONB,
          response_payload JSONB,
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
          policy_check_status VARCHAR(50) NOT NULL,
          safety_check_status VARCHAR(50) NOT NULL,
          governance_latency_ms INTEGER,
          audit_hash VARCHAR(64),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_policy_violations (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_governance_sessions(id) ON DELETE CASCADE,
          policy_name VARCHAR(100) NOT NULL,
          policy_type VARCHAR(50) NOT NULL,
          violation_details TEXT NOT NULL,
          severity VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_safety_reports (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_governance_sessions(id) ON DELETE CASCADE,
          model_id VARCHAR(50),
          prompt_risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          output_risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          risk_flags JSONB NOT NULL DEFAULT '[]',
          scanner_logs TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_explainability (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_governance_sessions(id) ON DELETE CASCADE,
          evidence_trace JSONB NOT NULL DEFAULT '[]',
          reasoning_trace JSONB NOT NULL DEFAULT '[]',
          confidence_explanation TEXT,
          decision_factors JSONB NOT NULL DEFAULT '[]',
          risk_factors JSONB NOT NULL DEFAULT '[]',
          alternative_views JSONB NOT NULL DEFAULT '[]',
          minority_opinion TEXT,
          model_contributions JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_compliance (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_governance_sessions(id) ON DELETE CASCADE,
          compliance_score DOUBLE PRECISION NOT NULL DEFAULT 100.0,
          policy_compliance BOOLEAN NOT NULL DEFAULT TRUE,
          rule_compliance BOOLEAN NOT NULL DEFAULT TRUE,
          evidence_completeness BOOLEAN NOT NULL DEFAULT TRUE,
          research_completeness BOOLEAN NOT NULL DEFAULT TRUE,
          explainability_completeness BOOLEAN NOT NULL DEFAULT TRUE,
          confidence_validation BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_human_reviews (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES ai_governance_sessions(id) ON DELETE CASCADE,
          reviewer_id INTEGER,
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
          reviewer_notes TEXT,
          escalation_reason TEXT,
          decision_override BOOLEAN DEFAULT FALSE NOT NULL,
          approval_history JSONB NOT NULL DEFAULT '[]',
          reviewed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_governance_metrics (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
          policy_violations_count INTEGER NOT NULL DEFAULT 0,
          safety_violations_count INTEGER NOT NULL DEFAULT 0,
          governance_latency_avg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          review_queue_size INTEGER NOT NULL DEFAULT 0,
          approval_time_avg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          audit_volume INTEGER NOT NULL DEFAULT 0,
          explainability_coverage DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          compliance_score_avg DOUBLE PRECISION NOT NULL DEFAULT 100.0
        );

        CREATE TABLE IF NOT EXISTS ai_audit_replay (
          id SERIAL PRIMARY KEY,
          original_session_id INTEGER,
          replay_triggered_by INTEGER,
          replay_status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
          discrepancy_detected BOOLEAN DEFAULT FALSE NOT NULL,
          original_hash VARCHAR(64) NOT NULL,
          replay_hash VARCHAR(64) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
    } catch (err: any) {
      console.error("Failed to verify/create governance tables:", err);
    }
  }

  // Session
  async createSession(data: GovernanceSession): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiGovernanceSessions).values(data).returning();
    return result[0];
  }

  async updateSession(id: number, data: Partial<GovernanceSession>): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.update(aiGovernanceSessions).set(data).where(eq(aiGovernanceSessions.id, id)).returning();
    return result[0];
  }

  async getSession(id: number): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiGovernanceSessions).where(eq(aiGovernanceSessions.id, id));
    return result[0] || null;
  }

  async listSessions(limitNum = 50): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiGovernanceSessions).orderBy(desc(aiGovernanceSessions.createdAt)).limit(limitNum);
  }

  // Violations
  async createViolation(data: PolicyViolation): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiPolicyViolations).values(data).returning();
    return result[0];
  }

  async getViolations(sessionId?: number): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    if (sessionId !== undefined) {
      return db.select().from(aiPolicyViolations).where(eq(aiPolicyViolations.sessionId, sessionId)).orderBy(desc(aiPolicyViolations.createdAt));
    }
    return db.select().from(aiPolicyViolations).orderBy(desc(aiPolicyViolations.createdAt));
  }

  // Safety Reports
  async createSafetyReport(data: SafetyReport): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiSafetyReports).values(data).returning();
    return result[0];
  }

  async getSafetyReportBySession(sessionId: number): Promise<any | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiSafetyReports).where(eq(aiSafetyReports.sessionId, sessionId));
    return result[0] || null;
  }

  // Explainability
  async createExplainability(data: ExplainabilityRecord): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiExplainability).values(data).returning();
    return result[0];
  }

  async getExplainabilityBySession(sessionId: number): Promise<any | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiExplainability).where(eq(aiExplainability.sessionId, sessionId));
    return result[0] || null;
  }

  // Compliance
  async createCompliance(data: ComplianceRecord): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiCompliance).values(data).returning();
    return result[0];
  }

  async getComplianceBySession(sessionId: number): Promise<any | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiCompliance).where(eq(aiCompliance.sessionId, sessionId));
    return result[0] || null;
  }

  // Human Reviews
  async createHumanReview(data: HumanReview): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiHumanReviews).values(data).returning();
    return result[0];
  }

  async updateHumanReview(id: number, data: Partial<HumanReview>): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.update(aiHumanReviews).set(data).where(eq(aiHumanReviews.id, id)).returning();
    return result[0];
  }

  async getHumanReviewBySession(sessionId: number): Promise<any | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiHumanReviews).where(eq(aiHumanReviews.sessionId, sessionId));
    return result[0] || null;
  }

  async listHumanReviews(status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    if (status) {
      return db.select().from(aiHumanReviews).where(eq(aiHumanReviews.status, status)).orderBy(desc(aiHumanReviews.createdAt));
    }
    return db.select().from(aiHumanReviews).orderBy(desc(aiHumanReviews.createdAt));
  }

  // Metrics
  async saveMetrics(data: GovernanceMetrics): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiGovernanceMetrics).values(data).returning();
    return result[0];
  }

  async getLatestMetrics(): Promise<any | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiGovernanceMetrics).orderBy(desc(aiGovernanceMetrics.timestamp)).limit(1);
    return result[0] || null;
  }

  async listMetrics(limitNum = 30): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiGovernanceMetrics).orderBy(desc(aiGovernanceMetrics.timestamp)).limit(limitNum);
  }

  // Audit Replay
  async createAuditReplay(data: AuditReplayRecord): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiAuditReplay).values(data).returning();
    return result[0];
  }

  async listAuditReplays(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiAuditReplay).orderBy(desc(aiAuditReplay.createdAt));
  }
}
