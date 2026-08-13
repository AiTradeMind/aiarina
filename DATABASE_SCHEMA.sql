-- DATABASE_SCHEMA.sql
-- Production DDL Schema for AIARINA 1.0 Enterprise Database running on Render PostgreSQL
-- Recreates all Primary Keys, Foreign Keys, Indexes, and Constraints.

-- 1. CLEANUP (IF RE-RUNNING)
DROP TABLE IF EXISTS "administration_logs" CASCADE;
DROP TABLE IF EXISTS "ai_research_reports" CASCADE;
DROP TABLE IF EXISTS "trades" CASCADE;
DROP TABLE IF EXISTS "portfolios" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 2. USERS TABLE
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "role" VARCHAR(50) DEFAULT 'trader' NOT NULL,
  "settings" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "chk_user_role" CHECK ("role" IN ('admin', 'trader', 'analyst'))
);

-- 3. PORTFOLIOS TABLE
CREATE TABLE "portfolios" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "cash_balance" NUMERIC(15, 2) DEFAULT 100000.00 NOT NULL,
  "margin_enabled" BOOLEAN DEFAULT FALSE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "fk_portfolios_users" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "chk_cash_balance" CHECK ("cash_balance" >= -50000000.00) -- Enforces risk limitations
);

-- 4. TRADES TABLE
CREATE TABLE "trades" (
  "id" SERIAL PRIMARY KEY,
  "portfolio_id" INTEGER NOT NULL,
  "ticker" VARCHAR(12) NOT NULL,
  "type" VARCHAR(10) NOT NULL,
  "quantity" NUMERIC(12, 4) NOT NULL,
  "execution_price" NUMERIC(12, 2) NOT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "fk_trades_portfolios" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios" ("id") ON DELETE CASCADE,
  CONSTRAINT "chk_trade_type" CHECK ("type" IN ('BUY', 'SELL')),
  CONSTRAINT "chk_trade_quantity" CHECK ("quantity" > 0),
  CONSTRAINT "chk_trade_price" CHECK ("execution_price" > 0)
);

-- 5. AI RESEARCH REPORTS TABLE
CREATE TABLE "ai_research_reports" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "ticker" VARCHAR(12) NOT NULL,
  "summary" VARCHAR(1000) NOT NULL,
  "detailed_json" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "analysis_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "fk_reports_users" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- 6. ADMINISTRATION AUDIT LOGS TABLE
CREATE TABLE "administration_logs" (
  "id" SERIAL PRIMARY KEY,
  "action" VARCHAR(255) NOT NULL,
  "severity" VARCHAR(50) DEFAULT 'info' NOT NULL,
  "actor_id" INTEGER,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "fk_logs_users" FOREIGN KEY ("actor_id") REFERENCES "users" ("id") ON DELETE SET NULL,
  CONSTRAINT "chk_log_severity" CHECK ("severity" IN ('info', 'warning', 'critical'))
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX "idx_users_email" ON "users" ("email");
CREATE INDEX "idx_portfolios_user_id" ON "portfolios" ("user_id");
CREATE INDEX "idx_trades_portfolio_id" ON "trades" ("portfolio_id");
CREATE INDEX "idx_trades_ticker" ON "trades" ("ticker");
CREATE INDEX "idx_ai_reports_user_id" ON "ai_research_reports" ("user_id");
CREATE INDEX "idx_ai_reports_ticker" ON "ai_research_reports" ("ticker");
CREATE INDEX "idx_logs_severity" ON "administration_logs" ("severity");
