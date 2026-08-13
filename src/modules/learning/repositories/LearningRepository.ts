import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class LearningRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_learning_records (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        trade_id VARCHAR(64) NOT NULL,
        ai_model_id VARCHAR(64),
        strategy_id VARCHAR(64),
        decision VARCHAR(64),
        reason TEXT,
        confidence NUMERIC(5,4) NOT NULL,
        market_context JSONB,
        indicators_used JSONB,
        risk_level VARCHAR(32),
        result VARCHAR(32) NOT NULL,
        pnl NUMERIC(15,4) NOT NULL,
        learning_outcome TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_learning_feedback (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        ai_model_id VARCHAR(64),
        strategy_id VARCHAR(64),
        target_id VARCHAR(64),
        feedback_type VARCHAR(32) NOT NULL,
        title VARCHAR(255),
        content TEXT,
        comment TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_learning_patterns (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        ai_model_id VARCHAR(64),
        strategy_id VARCHAR(64),
        pattern_name VARCHAR(255),
        pattern_type VARCHAR(64) NOT NULL,
        market_condition VARCHAR(128),
        description TEXT,
        occurrences INT DEFAULT 1,
        frequency INT DEFAULT 1,
        win_rate NUMERIC(5,4),
        impact_score NUMERIC(5,4),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_learning_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        entity_type VARCHAR(64),
        entity_id VARCHAR(64) NOT NULL,
        snapshot_type VARCHAR(32) NOT NULL,
        snapshot_date TIMESTAMP WITH TIME ZONE,
        metrics JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_learning_knowledge (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        title VARCHAR(255),
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_learning_queue (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        source_module VARCHAR(64),
        event_type VARCHAR(64),
        payload JSONB,
        status VARCHAR(32) DEFAULT 'PENDING',
        attempts INT DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async insertRecord(arg1: any, arg2?: any): Promise<void> {
    await this.ensureTables();
    const db = getDb();
    let orgId = "default_org";
    let record = arg1;
    if (typeof arg2 === "object" && typeof arg1 === "string") {
      orgId = arg1;
      record = arg2;
    } else if (record && record.organizationId) {
      orgId = record.organizationId;
    }

    await db.execute(sql`
      INSERT INTO enterprise_learning_records (
        id, organization_id, trade_id, ai_model_id, strategy_id, decision, reason, confidence, market_context, indicators_used, risk_level, result, pnl, learning_outcome, created_at
      ) VALUES (
        ${record.id || 'lr_default'}, ${orgId}, ${record.tradeId || 't_default'}, ${record.aiModelId || null}, ${record.strategyId || null},
        ${record.decision || null}, ${record.reason || null}, ${record.confidence || 0.5}, ${JSON.stringify(record.marketContext || {})}::jsonb,
        ${JSON.stringify(record.indicatorsUsed || [])}::jsonb, ${record.riskLevel || null}, ${record.result || 'NEUTRAL'}, ${record.pnl || 0}, ${record.learningOutcome || ''}, ${record.createdAt || new Date()}
      )
    `);
  }

  async getRecords(organizationId: string, limit = 100): Promise<any[]> {
    await this.ensureTables();
    const db = getDb();
    const res = await db.execute(sql`
      SELECT id, organization_id as "organizationId", trade_id as "tradeId", ai_model_id as "aiModelId",
             strategy_id as "strategyId", decision, reason, confidence, market_context as "marketContext",
             indicators_used as "indicatorsUsed", risk_level as "riskLevel", result, pnl,
             learning_outcome as "learningOutcome", created_at as "createdAt"
      FROM enterprise_learning_records
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);
    return res.rows || [];
  }

  async getRecordsByOrg(orgId: string, limit = 100): Promise<any[]> {
    return this.getRecords(orgId, limit);
  }

  async insertFeedback(arg1: any, arg2?: any): Promise<void> {
    await this.ensureTables();
    const db = getDb();
    let orgId = "default_org";
    let feedback = arg1;
    if (typeof arg2 === "object" && typeof arg1 === "string") {
      orgId = arg1;
      feedback = arg2;
    } else if (feedback && feedback.organizationId) {
      orgId = feedback.organizationId;
    }

    await db.execute(sql`
      INSERT INTO enterprise_learning_feedback (
        id, organization_id, ai_model_id, strategy_id, target_id, feedback_type, title, content, comment, metadata, created_at
      ) VALUES (
        ${feedback.id || 'fb_default'}, ${orgId}, ${feedback.aiModelId || null}, ${feedback.strategyId || null}, ${feedback.targetId || null},
        ${feedback.feedbackType || 'NEUTRAL'}, ${feedback.title || null}, ${feedback.content || null}, ${feedback.comment || null}, ${JSON.stringify(feedback.metadata || {})}::jsonb, ${feedback.createdAt || new Date()}
      )
    `);
  }

  async getFeedback(organizationId: string, limit = 100): Promise<any[]> {
    await this.ensureTables();
    const db = getDb();
    const res = await db.execute(sql`
      SELECT id, organization_id as "organizationId", ai_model_id as "aiModelId", strategy_id as "strategyId",
             target_id as "targetId", feedback_type as "feedbackType", title, content, comment,
             metadata, created_at as "createdAt"
      FROM enterprise_learning_feedback
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);
    return res.rows || [];
  }

  async upsertPattern(pattern: any): Promise<void> {
    await this.ensureTables();
    const db = getDb();
    await db.execute(sql`
      INSERT INTO enterprise_learning_patterns (
        id, organization_id, ai_model_id, strategy_id, pattern_name, pattern_type, market_condition, description, occurrences, frequency, win_rate, impact_score, metadata, created_at, updated_at
      ) VALUES (
        ${pattern.id || 'pat_default'}, ${pattern.organizationId || 'default_org'}, ${pattern.aiModelId || null}, ${pattern.strategyId || null},
        ${pattern.patternName || null}, ${pattern.patternType || 'GENERAL'}, ${pattern.marketCondition || null}, ${pattern.description || null},
        ${pattern.occurrences || 1}, ${pattern.frequency || 1}, ${pattern.winRate || 0.5}, ${pattern.impactScore || 0.5}, ${JSON.stringify(pattern.metadata || {})}::jsonb,
        ${pattern.createdAt || new Date()}, ${pattern.updatedAt || new Date()}
      )
    `);
  }

  async insertPattern(orgId: string, pattern: any): Promise<void> {
    await this.upsertPattern({ ...pattern, organizationId: orgId });
  }

  async getPatterns(organizationId: string): Promise<any[]> {
    await this.ensureTables();
    const db = getDb();
    const res = await db.execute(sql`
      SELECT id, organization_id as "organizationId", ai_model_id as "aiModelId", strategy_id as "strategyId",
             pattern_name as "patternName", pattern_type as "patternType", market_condition as "marketCondition",
             description, occurrences, frequency, win_rate as "winRate", impact_score as "impactScore",
             metadata, created_at as "createdAt", updated_at as "updatedAt"
      FROM enterprise_learning_patterns
      WHERE organization_id = ${organizationId}
      ORDER BY occurrences DESC
    `);
    return res.rows || [];
  }

  async getPatternsByOrg(orgId: string): Promise<any[]> {
    return this.getPatterns(orgId);
  }

  async insertSnapshot(arg1: any, arg2?: any): Promise<void> {
    await this.ensureTables();
    const db = getDb();
    let orgId = "default_org";
    let snapshot = arg1;
    if (typeof arg2 === "object" && typeof arg1 === "string") {
      orgId = arg1;
      snapshot = arg2;
    } else if (snapshot && snapshot.organizationId) {
      orgId = snapshot.organizationId;
    }

    await db.execute(sql`
      INSERT INTO enterprise_learning_snapshots (
        id, organization_id, entity_type, entity_id, snapshot_type, snapshot_date, metrics, created_at
      ) VALUES (
        ${snapshot.id || 'snap_default'}, ${orgId}, ${snapshot.entityType || null}, ${snapshot.entityId || 'ent_default'},
        ${snapshot.snapshotType || 'DAILY'}, ${snapshot.snapshotDate || new Date()}, ${JSON.stringify(snapshot.metrics || {})}::jsonb, ${snapshot.createdAt || new Date()}
      )
    `);
  }

  async getSnapshots(organizationId: string, entityType?: string, entityId?: string): Promise<any[]> {
    await this.ensureTables();
    const db = getDb();
    const res = await db.execute(sql`
      SELECT id, organization_id as "organizationId", entity_type as "entityType", entity_id as "entityId",
             snapshot_type as "snapshotType", snapshot_date as "snapshotDate", metrics, created_at as "createdAt"
      FROM enterprise_learning_snapshots
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
    `);
    return res.rows || [];
  }

  async getKnowledge(organizationId: string): Promise<any[]> {
    await this.ensureTables();
    const db = getDb();
    const res = await db.execute(sql`
      SELECT id, organization_id as "organizationId", title, content, created_at as "createdAt"
      FROM enterprise_learning_knowledge
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
    `);
    return res.rows || [];
  }

  async pushQueue(item: any): Promise<void> {
    await this.ensureTables();
    const db = getDb();
    await db.execute(sql`
      INSERT INTO enterprise_learning_queue (
        id, organization_id, source_module, event_type, payload, status, attempts, created_at
      ) VALUES (
        ${item.id || 'lq_default'}, ${item.organizationId || 'default_org'}, ${item.sourceModule || null},
        ${item.eventType || null}, ${JSON.stringify(item.payload || {})}::jsonb, ${item.status || 'PENDING'},
        ${item.attempts || 0}, ${item.createdAt || new Date()}
      )
    `);
  }

  async getQueuePending(): Promise<any[]> {
    await this.ensureTables();
    const db = getDb();
    const res = await db.execute(sql`
      SELECT id, organization_id as "organizationId", source_module as "sourceModule",
             event_type as "eventType", payload, status, attempts, error_message as "errorMessage",
             created_at as "createdAt"
      FROM enterprise_learning_queue
      WHERE status = 'PENDING'
      ORDER BY created_at ASC
    `);
    return res.rows || [];
  }

  async updateQueueStatus(id: string, status: string, errorMessage?: string): Promise<void> {
    await this.ensureTables();
    const db = getDb();
    await db.execute(sql`
      UPDATE enterprise_learning_queue
      SET status = ${status}, error_message = ${errorMessage || null}, attempts = attempts + 1
      WHERE id = ${id}
    `);
  }
}

export const learningRepository = new LearningRepository();
