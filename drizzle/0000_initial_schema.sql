-- 0000_initial_schema.sql
-- Migration generated for AIARINA 1.0 Enterprise Database Schema

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "role" varchar(50) DEFAULT 'trader' NOT NULL,
  "settings" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "portfolios" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer REFERENCES "users" ("id") ON DELETE CASCADE,
  "name" varchar(100) NOT NULL,
  "cash_balance" numeric(15, 2) DEFAULT '100000.00' NOT NULL,
  "margin_enabled" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "trades" (
  "id" serial PRIMARY KEY NOT NULL,
  "portfolio_id" integer REFERENCES "portfolios" ("id") ON DELETE CASCADE,
  "ticker" varchar(12) NOT NULL,
  "type" varchar(10) NOT NULL,
  "quantity" numeric(12, 4) NOT NULL,
  "execution_price" numeric(12, 2) NOT NULL,
  "timestamp" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ai_research_reports" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer REFERENCES "users" ("id") ON DELETE CASCADE,
  "ticker" varchar(12) NOT NULL,
  "summary" varchar(1000) NOT NULL,
  "detailed_json" jsonb DEFAULT '{}'::jsonb,
  "analysis_timestamp" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "administration_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "action" varchar(255) NOT NULL,
  "severity" varchar(50) DEFAULT 'info' NOT NULL,
  "actor_id" integer REFERENCES "users" ("id") ON DELETE SET NULL,
  "timestamp" timestamp DEFAULT now() NOT NULL
);

-- Indices to optimize database lookups for high-frequency queries
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_portfolios_user_id" ON "portfolios" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_trades_portfolio_id" ON "trades" ("portfolio_id");
CREATE INDEX IF NOT EXISTS "idx_trades_ticker" ON "trades" ("ticker");
CREATE INDEX IF NOT EXISTS "idx_ai_reports_user_id" ON "ai_research_reports" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_ai_reports_ticker" ON "ai_research_reports" ("ticker");
