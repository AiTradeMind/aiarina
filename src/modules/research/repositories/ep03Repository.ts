import { sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import {
  ScannerTemplate,
  ScannerTemplateVersion,
  ScannerExecutionQueueItem,
  ScannerExecutionHistory,
  WatchlistGroup,
  AlertRule,
  AlertDeliveryQueueItem,
  AlertAcknowledgement,
  AlertMetricsSnapshot
} from "../types/ep03.ts";

export class ResearchEP03Repository {
  private static instance: ResearchEP03Repository;

  public static getInstance(): ResearchEP03Repository {
    if (!ResearchEP03Repository.instance) {
      ResearchEP03Repository.instance = new ResearchEP03Repository();
    }
    return ResearchEP03Repository.instance;
  }

  constructor() {
    this.ensureEP03Tables().catch(err => {
      console.error("[EP03] Database tables initialization failed:", err);
    });
  }

  /**
   * Ensures all Phase 3 Enterprise Scanner & Alerts tables exist.
   */
  async ensureEP03Tables(): Promise<void> {
    const db = getDb();
    console.log("[EP03] Initializing Enterprise Scanner, Watchlist, and Alert Tables...");

    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS scanner_templates (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL,
          config JSONB NOT NULL,
          version VARCHAR(50) DEFAULT '1.0.0' NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS scanner_template_versions (
          id VARCHAR(100) PRIMARY KEY,
          template_id VARCHAR(100) NOT NULL,
          version VARCHAR(50) NOT NULL,
          config JSONB NOT NULL,
          change_log TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS scanner_execution_queue (
          id VARCHAR(100) PRIMARY KEY,
          template_id VARCHAR(100),
          status VARCHAR(50) NOT NULL,
          scan_type VARCHAR(50) NOT NULL,
          params JSONB DEFAULT '{}'::jsonb NOT NULL,
          retry_count INTEGER DEFAULT 0 NOT NULL,
          error TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS scanner_execution_history (
          id VARCHAR(100) PRIMARY KEY,
          queue_id VARCHAR(100),
          template_id VARCHAR(100),
          status VARCHAR(50) NOT NULL,
          execution_duration_ms INTEGER NOT NULL,
          matched_symbols JSONB DEFAULT '[]'::jsonb NOT NULL,
          rule_version VARCHAR(50),
          parameters JSONB DEFAULT '{}'::jsonb NOT NULL,
          performance_metrics JSONB DEFAULT '{}'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS watchlist_groups (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          parent_id VARCHAR(100),
          folder VARCHAR(100),
          is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
          is_shared BOOLEAN DEFAULT FALSE NOT NULL,
          is_default BOOLEAN DEFAULT FALSE NOT NULL,
          is_archived BOOLEAN DEFAULT FALSE NOT NULL,
          sort_order INTEGER DEFAULT 0 NOT NULL,
          color_label VARCHAR(50),
          watchlist_ids JSONB DEFAULT '[]'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS alert_rules (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          condition_expression JSONB NOT NULL,
          cooldown_seconds INTEGER DEFAULT 60 NOT NULL,
          repeat_policy VARCHAR(100) DEFAULT 'ALWAYS' NOT NULL,
          expiry_at TIMESTAMP,
          priority VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL,
          status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
          last_triggered_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS alert_delivery_queue (
          id VARCHAR(100) PRIMARY KEY,
          rule_id VARCHAR(100) NOT NULL,
          alert_payload JSONB NOT NULL,
          channels JSONB NOT NULL,
          delivery_status JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS alert_acknowledgements (
          id VARCHAR(100) PRIMARY KEY,
          delivery_id VARCHAR(100) NOT NULL,
          rule_id VARCHAR(100) NOT NULL,
          symbol VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'UNREAD' NOT NULL,
          snoozed_until TIMESTAMP,
          acknowledged_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS alert_metrics (
          id VARCHAR(100) PRIMARY KEY,
          total_triggered INTEGER DEFAULT 0 NOT NULL,
          total_delivered INTEGER DEFAULT 0 NOT NULL,
          total_failed INTEGER DEFAULT 0 NOT NULL,
          latency_ms_avg INTEGER DEFAULT 0 NOT NULL,
          queue_length INTEGER DEFAULT 0 NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);

      // Seed system templates and alert rules if empty
      const templates = await db.execute(sql`SELECT count(*) as count FROM scanner_templates`);
      if (Number((templates.rows[0] as any).count) === 0) {
        console.log("[EP03] Seeding master scanner templates...");
        await db.execute(sql`
          INSERT INTO scanner_templates (id, title, description, category, type, config, version, created_at, updated_at)
          VALUES 
          ('tpl_sys_01', 'Nifty High Liquidity Momentum', 'Scans top Nifty 50 constituents for strong volume breakout and price gap.', 'MOMENTUM', 'SYSTEM', '{"instrumentType": "EQUITY", "filters": {"priceMin": 100, "volumeMin": 1000000, "marketCapMin": 50000}}'::jsonb, '1.0.0', NOW(), NOW()),
          ('tpl_sys_02', 'Derivative OI Spike Alert', 'Finds stock futures and options with exceptional open interest change.', 'DERIVATIVES', 'SYSTEM', '{"instrumentType": "FUTURES", "filters": {"oiMin": 100000, "priceMin": 50}}'::jsonb, '1.0.0', NOW(), NOW()),
          ('tpl_sys_03', 'Commodity Metal Crash', 'Identifies commodity contracts facing heavy gap downs.', 'COMMODITIES', 'SYSTEM', '{"instrumentType": "COMMODITY", "filters": {"priceMin": 100}}'::jsonb, '1.0.0', NOW(), NOW());
        `);
      }

      const alertRules = await db.execute(sql`SELECT count(*) as count FROM alert_rules`);
      if (Number((alertRules.rows[0] as any).count) === 0) {
        console.log("[EP03] Seeding master alert rules...");
        await db.execute(sql`
          INSERT INTO alert_rules (id, name, condition_expression, cooldown_seconds, repeat_policy, expiry_at, priority, status, last_triggered_at, created_at, updated_at)
          VALUES
          ('rule_sys_01', 'Extreme Volume Breakout', '{"operator": "AND", "conditions": [{"field": "volume", "operatorType": "GREATER_THAN", "value": 5000000}, {"field": "changePercent", "operatorType": "GREATER_THAN", "value": 3}]}'::jsonb, 300, 'ALWAYS', NULL, 'HIGH', 'ACTIVE', NULL, NOW(), NOW()),
          ('rule_sys_02', 'Gap Up Warning', '{"field": "changePercent", "operatorType": "GREATER_THAN", "value": 4}'::jsonb, 600, 'ONCE_PER_DAY', NULL, 'MEDIUM', 'ACTIVE', NULL, NOW(), NOW());
        `);
      }

      const groups = await db.execute(sql`SELECT count(*) as count FROM watchlist_groups`);
      if (Number((groups.rows[0] as any).count) === 0) {
        console.log("[EP03] Seeding master watchlist groups...");
        await db.execute(sql`
          INSERT INTO watchlist_groups (id, name, parent_id, folder, is_pinned, is_shared, is_default, is_archived, sort_order, color_label, watchlist_ids, created_at, updated_at)
          VALUES
          ('wg_sys_01', 'Core Tech Leaders', NULL, 'Core Stocks', true, false, true, false, 0, '#3b82f6', '[]'::jsonb, NOW(), NOW()),
          ('wg_sys_02', 'Commodities High Vol', NULL, 'Derivatives', false, true, false, false, 1, '#10b981', '[]'::jsonb, NOW(), NOW());
        `);
      }

      const metricsCount = await db.execute(sql`SELECT count(*) as count FROM alert_metrics`);
      if (Number((metricsCount.rows[0] as any).count) === 0) {
        await db.execute(sql`
          INSERT INTO alert_metrics (id, total_triggered, total_delivered, total_failed, latency_ms_avg, queue_length, timestamp)
          VALUES ('met_01', 120, 118, 2, 22, 0, NOW());
        `);
      }

      console.log("[EP03] Database tables initialized and seeded successfully.");
    } catch (error) {
      console.error("[EP03] Error provisioning tables:", error);
    }
  }

  // ==========================================================================
  // SCANNER TEMPLATES
  // ==========================================================================
  async getTemplates(): Promise<ScannerTemplate[]> {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM scanner_templates ORDER BY created_at DESC`);
    return result.rows.map(row => this.mapTemplate(row));
  }

  async getTemplateById(id: string): Promise<ScannerTemplate | null> {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM scanner_templates WHERE id = ${id}`);
    if (result.rows.length === 0) return null;
    return this.mapTemplate(result.rows[0]);
  }

  async createTemplate(template: ScannerTemplate): Promise<ScannerTemplate> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO scanner_templates (id, title, description, category, type, config, version, created_at, updated_at)
      VALUES (${template.id}, ${template.title}, ${template.description}, ${template.category}, ${template.type}, ${JSON.stringify(template.config)}::jsonb, ${template.version}, NOW(), NOW())
    `);
    return template;
  }

  async updateTemplate(id: string, updates: Partial<ScannerTemplate>): Promise<void> {
    const db = getDb();
    const current = await this.getTemplateById(id);
    if (!current) throw new Error("Template not found");

    const title = updates.title !== undefined ? updates.title : current.title;
    const description = updates.description !== undefined ? updates.description : current.description;
    const category = updates.category !== undefined ? updates.category : current.category;
    const config = updates.config !== undefined ? JSON.stringify(updates.config) : JSON.stringify(current.config);
    const version = updates.version !== undefined ? updates.version : current.version;

    await db.execute(sql`
      UPDATE scanner_templates
      SET title = ${title}, description = ${description}, category = ${category}, config = ${config}::jsonb, version = ${version}, updated_at = NOW()
      WHERE id = ${id}
    `);
  }

  async createTemplateVersion(versionRecord: ScannerTemplateVersion): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO scanner_template_versions (id, template_id, version, config, change_log, created_at)
      VALUES (${versionRecord.id}, ${versionRecord.templateId}, ${versionRecord.version}, ${JSON.stringify(versionRecord.config)}::jsonb, ${versionRecord.changeLog}, NOW())
    `);
  }

  // ==========================================================================
  // QUEUE & EXECUTION ENGINE
  // ==========================================================================
  async getQueue(): Promise<ScannerExecutionQueueItem[]> {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM scanner_execution_queue ORDER BY created_at DESC`);
    return result.rows.map(row => this.mapQueueItem(row));
  }

  async addQueueItem(item: ScannerExecutionQueueItem): Promise<ScannerExecutionQueueItem> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO scanner_execution_queue (id, template_id, status, scan_type, params, retry_count, error, created_at, updated_at)
      VALUES (${item.id}, ${item.templateId}, ${item.status}, ${item.scanType}, ${JSON.stringify(item.params)}::jsonb, ${item.retryCount}, ${item.error || null}, NOW(), NOW())
    `);
    return item;
  }

  async updateQueueItem(id: string, status: string, error?: string): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      UPDATE scanner_execution_queue
      SET status = ${status}, error = ${error || null}, updated_at = NOW()
      WHERE id = ${id}
    `);
  }

  async createHistory(history: ScannerExecutionHistory): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO scanner_execution_history (id, queue_id, template_id, status, execution_duration_ms, matched_symbols, rule_version, parameters, performance_metrics, created_at)
      VALUES (${history.id}, ${history.queueId}, ${history.templateId}, ${history.status}, ${history.executionDurationMs}, ${JSON.stringify(history.matchedSymbols)}::jsonb, ${history.ruleVersion || null}, ${JSON.stringify(history.parameters)}::jsonb, ${JSON.stringify(history.performanceMetrics)}::jsonb, NOW())
    `);
  }

  async getHistory(): Promise<ScannerExecutionHistory[]> {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM scanner_execution_history ORDER BY created_at DESC LIMIT 50`);
    return result.rows.map(row => this.mapHistory(row));
  }

  // ==========================================================================
  // WATCHLIST GROUPS
  // ==========================================================================
  async getWatchlistGroups(): Promise<WatchlistGroup[]> {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM watchlist_groups ORDER BY sort_order ASC, created_at DESC`);
    return result.rows.map(row => this.mapWatchlistGroup(row));
  }

  async createWatchlistGroup(group: WatchlistGroup): Promise<WatchlistGroup> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO watchlist_groups (id, name, parent_id, folder, is_pinned, is_shared, is_default, is_archived, sort_order, color_label, watchlist_ids, created_at, updated_at)
      VALUES (${group.id}, ${group.name}, ${group.parentId}, ${group.folder}, ${group.isPinned}, ${group.isShared}, ${group.isDefault}, ${group.isArchived}, ${group.sortOrder}, ${group.colorLabel}, ${JSON.stringify(group.watchlistIds)}::jsonb, NOW(), NOW())
    `);
    return group;
  }

  // ==========================================================================
  // ALERT RULES
  // ==========================================================================
  async getAlertRules(): Promise<AlertRule[]> {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM alert_rules ORDER BY created_at DESC`);
    return result.rows.map(row => this.mapAlertRule(row));
  }

  async createAlertRule(rule: AlertRule): Promise<AlertRule> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO alert_rules (id, name, condition_expression, cooldown_seconds, repeat_policy, expiry_at, priority, status, last_triggered_at, created_at, updated_at)
      VALUES (${rule.id}, ${rule.name}, ${JSON.stringify(rule.conditionExpression)}::jsonb, ${rule.cooldownSeconds}, ${rule.repeatPolicy}, ${rule.expiryAt ? new Date(rule.expiryAt) : null}, ${rule.priority}, ${rule.status}, NULL, NOW(), NOW())
    `);
    return rule;
  }

  async updateRuleTrigger(id: string): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      UPDATE alert_rules
      SET last_triggered_at = NOW()
      WHERE id = ${id}
    `);
  }

  // ==========================================================================
  // ALERT DELIVERY & ACKNOWLEDGEMENTS
  // ==========================================================================
  async addAlertDeliveryItem(item: AlertDeliveryQueueItem): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO alert_delivery_queue (id, rule_id, alert_payload, channels, delivery_status, created_at)
      VALUES (${item.id}, ${item.ruleId}, ${JSON.stringify(item.alertPayload)}::jsonb, ${JSON.stringify(item.channels)}::jsonb, ${JSON.stringify(item.deliveryStatus)}::jsonb, NOW())
    `);
  }

  async getDeliveryQueue(): Promise<AlertDeliveryQueueItem[]> {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM alert_delivery_queue ORDER BY created_at DESC LIMIT 50`);
    return result.rows.map(row => this.mapDeliveryQueueItem(row));
  }

  async addAcknowledgement(ack: AlertAcknowledgement): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO alert_acknowledgements (id, delivery_id, rule_id, symbol, message, status, snoozed_until, acknowledged_at, created_at)
      VALUES (${ack.id}, ${ack.deliveryId}, ${ack.ruleId}, ${ack.symbol}, ${ack.message}, ${ack.status}, ${ack.snoozedUntil ? new Date(ack.snoozedUntil) : null}, NULL, NOW())
    `);
  }

  async updateAcknowledgementStatus(id: string, status: string, snoozedUntil?: string | null): Promise<void> {
    const db = getDb();
    const ackedAt = (status === 'ACKNOWLEDGED' || status === 'DISMISSED') ? 'NOW()' : 'NULL';
    const sUntil = snoozedUntil ? `'${new Date(snoozedUntil).toISOString()}'` : 'NULL';

    await db.execute(sql`
      UPDATE alert_acknowledgements
      SET status = ${status}, snoozed_until = ${snoozedUntil ? new Date(snoozedUntil) : null}, acknowledged_at = ${status === 'ACKNOWLEDGED' ? new Date() : null}
      WHERE id = ${id}
    `);
  }

  async getAcknowledgements(): Promise<AlertAcknowledgement[]> {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM alert_acknowledgements ORDER BY created_at DESC`);
    return result.rows.map(row => this.mapAcknowledgement(row));
  }

  async getMetrics(): Promise<AlertMetricsSnapshot> {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM alert_metrics ORDER BY timestamp DESC LIMIT 1`);
    if (result.rows.length === 0) {
      return {
        id: "met_default",
        totalTriggered: 0,
        totalDelivered: 0,
        totalFailed: 0,
        latencyMsAvg: 0,
        queueLength: 0,
        timestamp: new Date().toISOString()
      };
    }
    return this.mapMetrics(result.rows[0]);
  }

  async incrementMetrics(triggered: number, delivered: number, failed: number, latencyMs: number): Promise<void> {
    const db = getDb();
    const current = await this.getMetrics();
    const id = `met_${Date.now()}`;
    const newTotalTriggered = current.totalTriggered + triggered;
    const newTotalDelivered = current.totalDelivered + delivered;
    const newTotalFailed = current.totalFailed + failed;
    const newLatency = Math.round((current.latencyMsAvg * 9 + latencyMs) / 10);

    await db.execute(sql`
      INSERT INTO alert_metrics (id, total_triggered, total_delivered, total_failed, latency_ms_avg, queue_length, timestamp)
      VALUES (${id}, ${newTotalTriggered}, ${newTotalDelivered}, ${newTotalFailed}, ${newLatency}, 0, NOW())
    `);
  }

  // ==========================================================================
  // HELPERS & MAPPERS
  // ==========================================================================
  private mapTemplate(row: any): ScannerTemplate {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      type: row.type as any,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      version: row.version,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  }

  private mapQueueItem(row: any): ScannerExecutionQueueItem {
    return {
      id: row.id,
      templateId: row.template_id,
      status: row.status as any,
      scanType: row.scan_type as any,
      params: typeof row.params === 'string' ? JSON.parse(row.params) : row.params,
      retryCount: row.retry_count,
      error: row.error || undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  }

  private mapHistory(row: any): ScannerExecutionHistory {
    return {
      id: row.id,
      queueId: row.queue_id,
      templateId: row.template_id,
      status: row.status as any,
      executionDurationMs: row.execution_duration_ms,
      matchedSymbols: typeof row.matched_symbols === 'string' ? JSON.parse(row.matched_symbols) : row.matched_symbols,
      ruleVersion: row.rule_version || undefined,
      parameters: typeof row.parameters === 'string' ? JSON.parse(row.parameters) : row.parameters,
      performanceMetrics: typeof row.performance_metrics === 'string' ? JSON.parse(row.performance_metrics) : row.performance_metrics,
      createdAt: new Date(row.created_at).toISOString()
    };
  }

  private mapWatchlistGroup(row: any): WatchlistGroup {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      folder: row.folder,
      isPinned: !!row.is_pinned,
      isShared: !!row.is_shared,
      isDefault: !!row.is_default,
      isArchived: !!row.is_archived,
      sortOrder: row.sort_order,
      colorLabel: row.color_label,
      watchlistIds: typeof row.watchlist_ids === 'string' ? JSON.parse(row.watchlist_ids) : row.watchlist_ids,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  }

  private mapAlertRule(row: any): AlertRule {
    return {
      id: row.id,
      name: row.name,
      conditionExpression: typeof row.condition_expression === 'string' ? JSON.parse(row.condition_expression) : row.condition_expression,
      cooldownSeconds: row.cooldown_seconds,
      repeatPolicy: row.repeat_policy as any,
      expiryAt: row.expiry_at ? new Date(row.expiry_at).toISOString() : null,
      priority: row.priority as any,
      status: row.status as any,
      lastTriggeredAt: row.last_triggered_at ? new Date(row.last_triggered_at).toISOString() : null,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  }

  private mapDeliveryQueueItem(row: any): AlertDeliveryQueueItem {
    return {
      id: row.id,
      ruleId: row.rule_id,
      alertPayload: typeof row.alert_payload === 'string' ? JSON.parse(row.alert_payload) : row.alert_payload,
      channels: typeof row.channels === 'string' ? JSON.parse(row.channels) : row.channels,
      deliveryStatus: typeof row.delivery_status === 'string' ? JSON.parse(row.delivery_status) : row.delivery_status,
      createdAt: new Date(row.created_at).toISOString()
    };
  }

  private mapAcknowledgement(row: any): AlertAcknowledgement {
    return {
      id: row.id,
      deliveryId: row.delivery_id,
      ruleId: row.rule_id,
      symbol: row.symbol,
      message: row.message,
      status: row.status as any,
      snoozedUntil: row.snoozed_until ? new Date(row.snoozed_until).toISOString() : null,
      acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at).toISOString() : null,
      createdAt: new Date(row.created_at).toISOString()
    };
  }

  private mapMetrics(row: any): AlertMetricsSnapshot {
    return {
      id: row.id,
      totalTriggered: row.total_triggered,
      totalDelivered: row.total_delivered,
      totalFailed: row.total_failed,
      latencyMsAvg: row.latency_ms_avg,
      queueLength: row.queue_length,
      timestamp: new Date(row.timestamp).toISOString()
    };
  }
}

export const researchEP03Repository = ResearchEP03Repository.getInstance();
