import { pgTable, serial, varchar, numeric, timestamp, boolean, text, integer, date } from "drizzle-orm/pg-core";

export const enterpriseRiskPolicies = pgTable("enterprise_risk_policies", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 20 }).notNull(), // PORTFOLIO, STRATEGY, AI_MODEL, ORGANIZATION
  entityId: varchar("entity_id", { length: 50 }).notNull(),
  riskType: varchar("risk_type", { length: 30 }).notNull(), // MARGIN, EXPOSURE, DRAWDOWN, DAILY_LOSS, POSITION_LIMIT
  limitValue: numeric("limit_value").notNull(),
  action: varchar("action", { length: 20 }).notNull(), // BLOCK, ALERT
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enterpriseRiskEvents = pgTable("enterprise_risk_events", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 20 }).notNull(),
  entityId: varchar("entity_id", { length: 50 }).notNull(),
  riskType: varchar("risk_type", { length: 30 }).notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const enterpriseRiskMetrics = pgTable("enterprise_risk_metrics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 20 }).notNull(),
  entityId: varchar("entity_id", { length: 50 }).notNull(),
  currentExposure: numeric("current_exposure").default("0"),
  dailyLoss: numeric("daily_loss").default("0"),
  drawdown: numeric("drawdown").default("0"),
  consecutiveLosses: integer("consecutive_losses").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enterpriseRiskSnapshots = pgTable("enterprise_risk_snapshots", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 20 }).notNull(),
  entityId: varchar("entity_id", { length: 50 }).notNull(),
  snapshotDate: date("snapshot_date").notNull(),
  exposure: numeric("exposure").default("0"),
  drawdown: numeric("drawdown").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enterpriseTradingPipeline = pgTable("enterprise_trading_pipeline", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  orderId: varchar("order_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // RUNNING, COMPLETED, FAILED, ROLLED_BACK
  currentStage: varchar("current_stage", { length: 50 }).notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enterprisePipelineEvents = pgTable("enterprise_pipeline_events", {
  id: serial("id").primaryKey(),
  pipelineId: varchar("pipeline_id", { length: 50 }).notNull().references(() => enterpriseTradingPipeline.id, { onDelete: "cascade" }),
  stage: varchar("stage", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // SUCCESS, FAILED
  latencyMs: integer("latency_ms").default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const enterpriseOrchestratorJobs = pgTable("enterprise_orchestrator_jobs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // BATCH_EXECUTION, SYSTEM_MAINTENANCE
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});
