import { pgTable, serial, varchar, timestamp, boolean, numeric, doublePrecision, jsonb, integer, text, index, unique, date, uniqueIndex } from "drizzle-orm/pg-core";

// Users table holding account roles and custom terminal configurations
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).notNull().default("trader"), // admin, trader, analyst
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("users_createdAt_idx").on(table.createdAt)
          }));

// Organizations within the enterprise
export const organizations = pgTable("organizations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("organizations_createdAt_idx").on(table.createdAt)
          }));

// Roles available in the system
export const roles = pgTable("roles", {
  name: varchar("name", { length: 50 }).primaryKey(),
  description: varchar("description", { length: 500 }),
});

// Permissions available in the system
export const permissions = pgTable("permissions", {
  name: varchar("name", { length: 100 }).primaryKey(),
  description: varchar("description", { length: 500 }),
});

// Mapping of roles to permissions
export const rolePermissions = pgTable("role_permissions", {
  roleName: varchar("role_name", { length: 50 }).references(() => roles.name, { onDelete: "cascade" }),
  permissionName: varchar("permission_name", { length: 100 }).references(() => permissions.name, { onDelete: "cascade" }),
}, (table) => [
      { pk: [table.roleName, table.permissionName] }
    ]);

// Organization memberships for users
export const memberships = pgTable("memberships", {
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).references(() => roles.name),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => [
      { pk: [table.userId, table.organizationId] },
      index("memberships_org_idx").on(table.organizationId)
    ]);

// Market Master: Exchanges supported by the system
export const exchanges = pgTable("exchanges", {
  id: varchar("id", { length: 20 }).primaryKey(), // NSE, BSE, MCX
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Kolkata").notNull(),
  isOpen: boolean("is_open").default(false).notNull(),
});

// Market Master: Types of instruments (Equity, Futures, Options)
export const instrumentTypes = pgTable("instrument_types", {
  id: varchar("id", { length: 50 }).primaryKey(), // EQUITY, ETF, INDEX, STOCK_FUTURES, etc.
  name: varchar("name", { length: 100 }).notNull(),
});

// Market Master: The master list of tradable instruments
export const instruments = pgTable("instruments", {
  id: serial("id").primaryKey(),
  exchangeId: varchar("exchange_id", { length: 20 }).references(() => exchanges.id),
  typeId: varchar("type_id", { length: 50 }).references(() => instrumentTypes.id),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiryDate: timestamp("expiry_date"), // For F&O
  lotSize: integer("lot_size").default(1).notNull(),
  tickSize: numeric("tick_size", { precision: 10, scale: 4 }).default("0.05").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
      { unique_symbol_exchange: [table.symbol, table.exchangeId] },
      index("instruments_symbol_idx").on(table.symbol),
      index("instruments_exchange_idx").on(table.exchangeId)
    ]);

// Market Master: Real-time or periodic market status snapshots
export const marketStatus = pgTable("market_status", {
  id: serial("id").primaryKey(),
  exchangeId: varchar("exchange_id", { length: 20 }).references(() => exchanges.id),
  status: varchar("status", { length: 50 }).notNull(), // OPEN, CLOSED, PRE_MARKET, POST_MARKET, HALTED
  message: varchar("message", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("marketStatus_status_idx").on(table.status),
            updatedAtIdx: index("marketStatus_updatedAt_idx").on(table.updatedAt)
          }));

// Paper Trading: Virtual accounts for paper trading
export const paperAccounts = pgTable("paper_accounts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }).unique(),
  labId: varchar("lab_id", { length: 50 }).default("LAB_01_STOCK").notNull(),
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("100000.00"),
  initialBalance: numeric("initial_balance", { precision: 15, scale: 2 }).notNull().default("100000.00"),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("paperAccounts_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("paperAccounts_updatedAt_idx").on(table.updatedAt)
          }));

// Paper Trading: Virtual orders
export const paperOrders = pgTable("paper_orders", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  labId: varchar("lab_id", { length: 50 }).default("LAB_01_STOCK").notNull(),
  userId: integer("user_id").references(() => users.id),
  ticker: varchar("ticker", { length: 12 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // MARKET, LIMIT, etc.
  side: varchar("side", { length: 10 }).notNull(), // BUY, SELL
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 20 }).notNull().default("CREATED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
      index("paperOrders_org_idx").on(table.organizationId),
      index("paperOrders_lab_idx").on(table.labId),
      index("paperOrders_ticker_idx").on(table.ticker),
      index("paperOrders_status_idx").on(table.status),
      index("paperOrders_created_idx").on(table.createdAt)
    ]);

// Paper Trading: Virtual positions
export const paperPositions = pgTable("paper_positions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  labId: varchar("lab_id", { length: 50 }).default("LAB_01_STOCK").notNull(),
  ticker: varchar("ticker", { length: 12 }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull().default("0"),
  averagePrice: numeric("average_price", { precision: 12, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
      { unique_paper_ticker_lab: [table.organizationId, table.labId, table.ticker] },
      index("paperPositions_org_idx").on(table.organizationId),
      index("paperPositions_lab_idx").on(table.labId)
    ]);

// Paper Trading: Virtual trades/executions
export const paperTrades = pgTable("paper_trades", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => paperOrders.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  labId: varchar("lab_id", { length: 50 }).default("LAB_01_STOCK").notNull(),
  ticker: varchar("ticker", { length: 12 }).notNull(),
  side: varchar("side", { length: 10 }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  executionPrice: numeric("execution_price", { precision: 12, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
      index("paperTrades_org_idx").on(table.organizationId),
      index("paperTrades_lab_idx").on(table.labId),
      index("paperTrades_ticker_idx").on(table.ticker)
    ]);

// Paper Trading: Virtual order parameters
export const paperOrderDetails = pgTable("paper_order_details", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => paperOrders.id, { onDelete: "cascade" }).notNull(),
  stopLoss: numeric("stop_loss", { precision: 12, scale: 2 }).notNull(),
  target: numeric("target", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            orderIdIdx: index("paperOrderDetails_orderId_idx").on(table.orderId),
            createdAtIdx: index("paperOrderDetails_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("paperOrderDetails_updatedAt_idx").on(table.updatedAt)
          }));

// Paper Trading: Journal entries for performance tracking
export const paperJournal = pgTable("paper_journal", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  labId: varchar("lab_id", { length: 50 }).default("LAB_01_STOCK").notNull(),
  tradeId: integer("trade_id").references(() => paperTrades.id, { onDelete: "cascade" }),
  entryType: varchar("entry_type", { length: 20 }).notNull(), // TRADE, DEPOSIT, WITHDRAWAL
  notes: varchar("notes", { length: 255 }),
  pnl: numeric("pnl", { precision: 12, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
      index("paperJournal_org_idx").on(table.organizationId),
      index("paperJournal_lab_idx").on(table.labId)
    ]);

// AI Foundation: Provider Registry and Model Management
export const aiProviders = pgTable("ai_providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // OpenAI, Anthropic, Gemini, etc.
  baseUrl: varchar("base_url", { length: 255 }),
  apiKey: varchar("api_key", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  priority: integer("priority").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiProviders_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiProviders_updatedAt_idx").on(table.updatedAt)
          }));

export const aiModels = pgTable("ai_models", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 36 }).notNull().unique(), // UUID
  displayName: varchar("display_name", { length: 100 }).notNull(),
  internalName: varchar("internal_name", { length: 100 }).notNull().unique(),
  providerId: integer("provider_id").references(() => aiProviders.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  ownerId: integer("owner_id").references(() => users.id),
  description: text("description"),
  purpose: varchar("purpose", { length: 50 }).notNull(), // RESEARCH, DECISION, EXECUTION, etc.
  capabilities: jsonb("capabilities").notNull().default([]), // Module 2
  inputTypes: jsonb("input_types").notNull().default([]),
  outputTypes: jsonb("output_types").notNull().default([]),
  supportedMarkets: jsonb("supported_markets").notNull().default([]),
  supportedStrategies: jsonb("supported_strategies").notNull().default([]),
  riskProfile: varchar("risk_profile", { length: 20 }).notNull().default("MEDIUM"),
  status: varchar("status", { length: 20 }).notNull().default("DRAFT"), // Module 3
  priority: integer("priority").default(0).notNull(),
  metadata: jsonb("metadata").default({}),
  dependencies: jsonb("dependencies").default({}),
  relationships: jsonb("relationships").default({}),
  contextWindow: integer("context_window"),
  costPer1kPrompt: numeric("cost_per_1k_prompt", { precision: 10, scale: 6 }).default("0.00"),
  costPer1kCompletion: numeric("cost_per_1k_completion", { precision: 10, scale: 6 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("aiModels_status_idx").on(table.status),
            createdAtIdx: index("aiModels_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiModels_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("aiModels_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const aiProviderHealth = pgTable("ai_provider_health", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => aiProviders.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull(), // UP, DOWN, DEGRADED
  latencyMs: integer("latency_ms"),
  lastCheck: timestamp("last_check").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("aiProviderHealth_status_idx").on(table.status)
          }));

export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  modelId: integer("model_id").references(() => aiModels.id),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("aiUsage_timestamp_idx").on(table.timestamp)
          }));

export const aiCost = pgTable("ai_cost", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 15, scale: 6 }).notNull().default("0.00"),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
});

export const aiRequestLogs = pgTable("ai_request_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  modelId: integer("model_id").references(() => aiModels.id),
  requestPayload: jsonb("request_payload"),
  responsePayload: jsonb("response_payload"),
  latencyMs: integer("latency_ms"),
  status: varchar("status", { length: 20 }).notNull(), // SUCCESS, ERROR
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("aiRequestLogs_status_idx").on(table.status),
            createdAtIdx: index("aiRequestLogs_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("aiRequestLogs_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// Event Bus: Central log for all system and business events
export const eventLog = pgTable("event_log", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // ORDER_CREATED, TRADE_EXECUTED, RISK_BLOCKED, etc.
  source: varchar("source", { length: 50 }).notNull(), // TRADING, RISK, IDENTITY, PAPER_TRADING
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  entityId: varchar("entity_id", { length: 50 }), // ID of the related entity (orderId, tradeId, etc.)
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
      index("eventLog_org_idx").on(table.organizationId),
      index("eventLog_type_idx").on(table.eventType),
      index("eventLog_created_idx").on(table.createdAt)
    ]);

// Event Bus: User notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 100 }).notNull(),
  message: varchar("message", { length: 255 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // INFO, SUCCESS, WARNING, ERROR
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("notifications_createdAt_idx").on(table.createdAt)
          }));

// Event Bus: Immutable audit trail for critical actions
export const auditEvents = pgTable("audit_events", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // LOGIN, ORDER_SUBMITTED, RISK_LIMIT_UPDATED
  status: varchar("status", { length: 20 }).notNull(), // SUCCESS, FAILURE
  details: varchar("details", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("auditEvents_status_idx").on(table.status),
            timestampIdx: index("auditEvents_timestamp_idx").on(table.timestamp)
          }));

// Event Bus: Low-level system telemetry
export const systemEvents = pgTable("system_events", {
  id: serial("id").primaryKey(),
  level: varchar("level", { length: 20 }).notNull(), // DEBUG, INFO, WARN, ERROR, CRITICAL
  component: varchar("component", { length: 50 }).notNull(),
  message: varchar("message", { length: 255 }).notNull(),
  stackTrace: text("stack_trace"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("systemEvents_timestamp_idx").on(table.timestamp)
          }));

// Risk Management: Profiles for different risk tiers
export const riskProfiles = pgTable("risk_profiles", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }).unique(),
  name: varchar("name", { length: 100 }).notNull(),
  riskLevel: varchar("risk_level", { length: 20 }).notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH, AGGRESSIVE
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("riskProfiles_updatedAt_idx").on(table.updatedAt)
          }));

// Risk Management: Specific limits for organizations
export const riskLimits = pgTable("risk_limits", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }).unique(),
  maxOrderValue: numeric("max_order_value", { precision: 15, scale: 2 }).notNull().default("100000.00"),
  maxPositionSize: numeric("max_position_size", { precision: 15, scale: 2 }).notNull().default("500000.00"),
  maxDailyLoss: numeric("max_daily_loss", { precision: 15, scale: 2 }).notNull().default("5000.00"),
  maxOpenPositions: integer("max_open_positions").notNull().default(10),
  maxOrderQuantity: numeric("max_order_quantity", { precision: 12, scale: 4 }).notNull().default("1000.0000"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("riskLimits_updatedAt_idx").on(table.updatedAt)
          }));

// Risk Management: Audit trail for risk validation events
export const riskEvents = pgTable("risk_events", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  ruleName: varchar("rule_name", { length: 100 }).notNull(),
  action: varchar("action", { length: 10 }).notNull(), // ALLOW, WARN, BLOCK
  message: varchar("message", { length: 255 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull().default("INFO"), // INFO, WARNING, CRITICAL
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            orderIdIdx: index("riskEvents_orderId_idx").on(table.orderId),
            timestampIdx: index("riskEvents_timestamp_idx").on(table.timestamp)
          }));

// Portfolios managed by organizations containing capital ledgers and margins
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }).unique(),
  accountId: integer("account_id"), // Linked to accounts table
  name: varchar("name", { length: 100 }).notNull(),
  cashBalance: numeric("cash_balance", { precision: 15, scale: 2 }).notNull().default("100000.00"),
  buyingPower: numeric("buying_power", { precision: 15, scale: 2 }).notNull().default("100000.00"),
  realizedPnl: numeric("realized_pnl", { precision: 15, scale: 2 }).notNull().default("0.00"),
  unrealizedPnl: numeric("unrealized_pnl", { precision: 15, scale: 2 }).notNull().default("0.00"),
  marginEnabled: boolean("margin_enabled").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("portfolios_createdAt_idx").on(table.createdAt)
          }));

// Trading Accounts linked to Organizations
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  accountType: varchar("account_type", { length: 20 }).notNull().default("CASH"), // CASH, MARGIN
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("accounts_createdAt_idx").on(table.createdAt)
          }));

// Detailed Fill/Execution Audit Trail
export const executions = pgTable("executions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  portfolioId: integer("portfolio_id").references(() => portfolios.id, { onDelete: "cascade" }),
  exchangeId: varchar("exchange_id", { length: 20 }),
  side: varchar("side", { length: 10 }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  commission: numeric("commission", { precision: 10, scale: 2 }).default("0.00"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            orderIdIdx: index("executions_orderId_idx").on(table.orderId),
            portfolioIdIdx: index("executions_portfolioId_idx").on(table.portfolioId),
            timestampIdx: index("executions_timestamp_idx").on(table.timestamp)
          }));

// Current positions held in a portfolio
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 12 }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull().default("0"),
  averagePrice: numeric("average_price", { precision: 12, scale: 2 }).notNull().default("0"),
  marketPrice: numeric("market_price", { precision: 12, scale: 2 }).notNull().default("0"),
  pnl: numeric("pnl", { precision: 12, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
      { unique_ticker_portfolio: [table.portfolioId, table.ticker] },
      index("positions_portfolio_idx").on(table.portfolioId),
      index("positions_ticker_idx").on(table.ticker)
    ]);

// Orders for buying or selling assets
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  ticker: varchar("ticker", { length: 12 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // MARKET, LIMIT, STOP, STOP_LIMIT
  side: varchar("side", { length: 10 }).notNull(), // BUY, SELL
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  filledQuantity: numeric("filled_quantity", { precision: 12, scale: 4 }).notNull().default("0"),
  price: numeric("price", { precision: 12, scale: 2 }), // Limit price or Stop price
  status: varchar("status", { length: 20 }).notNull().default("CREATED"), // CREATED, VALIDATED, QUEUED, EXECUTING, EXECUTED, PARTIALLY_FILLED, REJECTED, CANCELLED, FAILED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
      index("orders_portfolio_idx").on(table.portfolioId),
      index("orders_ticker_idx").on(table.ticker),
      index("orders_status_idx").on(table.status),
      index("orders_created_idx").on(table.createdAt)
    ]);

// Executed orders and position history for portfolio accounting
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
  ticker: varchar("ticker", { length: 12 }).notNull(),
  side: varchar("side", { length: 10 }).notNull(), // BUY, SELL
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  executionPrice: numeric("execution_price", { precision: 12, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            portfolioIdIdx: index("trades_portfolioId_idx").on(table.portfolioId),
            orderIdIdx: index("trades_orderId_idx").on(table.orderId),
            timestampIdx: index("trades_timestamp_idx").on(table.timestamp)
          }));

// AI Research insights, summaries, and sentiment payloads
export const aiResearchReports = pgTable("ai_research_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 12 }).notNull(),
  summary: varchar("summary", { length: 1000 }).notNull(),
  detailedJson: jsonb("detailed_json").default({}),
  analysisTimestamp: timestamp("analysis_timestamp").defaultNow().notNull(),
});

// AI Decision Engine: Core decision logs and consensus outcomes
export const aiDecisions = pgTable("ai_decisions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // MARKET_ANALYSIS, STOCK_ANALYSIS, RISK_ANALYSIS, etc.
  decision: jsonb("decision").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }).default("0.00"),
  modelIds: jsonb("model_ids").notNull().default([]), // Array of model IDs used in consensus
  consensusMetadata: jsonb("consensus_metadata").default({}),
  status: varchar("status", { length: 20 }).default("COMPLETED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("aiDecisions_status_idx").on(table.status),
            createdAtIdx: index("aiDecisions_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("aiDecisions_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  decisionId: integer("decision_id").references(() => aiDecisions.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 20 }),
  action: varchar("action", { length: 10 }), // BUY, SELL, HOLD, NEUTRAL
  rationale: text("rationale"),
  isApplied: boolean("is_applied").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            decisionIdIdx: index("aiRecommendations_decisionId_idx").on(table.decisionId),
            createdAtIdx: index("aiRecommendations_createdAt_idx").on(table.createdAt)
          }));

// Strategy Engine: Registry and rule management
export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // TREND_FOLLOWING, MOMENTUM, etc.
  description: text("description"),
  isActive: boolean("is_active").default(false).notNull(),
  priority: integer("priority").default(0).notNull(),
  config: jsonb("config").default({}).notNull(), // Specific rules/params for this strategy
  confidenceThreshold: numeric("confidence_threshold", { precision: 5, scale: 4 }).default("0.7000"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("strategies_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("strategies_updatedAt_idx").on(table.updatedAt)
          }));



export const strategyRules = pgTable("strategy_rules", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id").references(() => strategies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  condition: text("condition").notNull(), // DSL or code snippet for rule evaluation
  action: varchar("action", { length: 20 }).notNull(), // ALLOW, MODIFY, REJECT
  priority: integer("priority").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyRules_strategyId_idx").on(table.strategyId)
          }));

export const strategyExecutions = pgTable("strategy_executions", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id").references(() => strategies.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  decisionId: integer("decision_id").references(() => aiDecisions.id),
  inputData: jsonb("input_data").notNull(),
  outputAction: varchar("output_action", { length: 20 }).notNull(), // ALLOW, MODIFY, REJECT
  modifiedData: jsonb("modified_data"),
  rationale: text("rationale"),
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyExecutions_strategyId_idx").on(table.strategyId),
            decisionIdIdx: index("strategyExecutions_decisionId_idx").on(table.decisionId),
            createdAtIdx: index("strategyExecutions_createdAt_idx").on(table.createdAt),
            strategyIdcreatedAtIdx: index("strategyExecutions_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

export const strategyResults = pgTable("strategy_results", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").references(() => strategyExecutions.id, { onDelete: "cascade" }),
  pnl: numeric("pnl", { precision: 15, scale: 2 }),
  success: boolean("success").notNull(),
  metrics: jsonb("metrics").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            executionIdIdx: index("strategyResults_executionId_idx").on(table.executionId),
            timestampIdx: index("strategyResults_timestamp_idx").on(table.timestamp)
          }));

// Research Engine: Explainable institutional research reports
export const researchReports = pgTable("research_reports", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // MARKET, STOCK, SECTOR, etc.
  title: varchar("title", { length: 255 }).notNull(),
  content: jsonb("content").notNull(), // Report content (Summary, Analysis, AI Consensus, etc.)
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 4 }),
  decisionId: integer("decision_id").references(() => aiDecisions.id),
  strategyId: integer("strategy_id").references(() => strategies.id),
  status: varchar("status", { length: 20 }).default("COMPLETED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            decisionIdIdx: index("researchReports_decisionId_idx").on(table.decisionId),
            strategyIdIdx: index("researchReports_strategyId_idx").on(table.strategyId),
            statusIdx: index("researchReports_status_idx").on(table.status),
            createdAtIdx: index("researchReports_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("researchReports_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("researchReports_status_createdAt_idx").on(table.status, table.createdAt),
            decisionIdstatusIdx: index("researchReports_decisionId_status_idx").on(table.decisionId, table.status),
            strategyIdcreatedAtIdx: index("researchReports_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

export const researchSources = pgTable("research_sources", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => researchReports.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  url: varchar("url", { length: 255 }),
  type: varchar("type", { length: 50 }), // NEWS, FILING, SOCIAL, MARKET_DATA
  relevance: numeric("relevance", { precision: 3, scale: 2 }),
});

export const researchEvidence = pgTable("research_evidence", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => researchReports.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // CHART, DATA_POINT, QUOTE
  content: jsonb("content").notNull(),
  sourceId: integer("source_id").references(() => researchSources.id),
});

export const researchHistory = pgTable("research_history", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => researchReports.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("researchHistory_timestamp_idx").on(table.timestamp)
          }));

export const researchTemplates = pgTable("research_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  structure: jsonb("structure").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
});

// Analytics Engine: Performance tracking and metrics snapshots
export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // PORTFOLIO, STRATEGY, AI_ACCURACY
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
      index("analyticsSnapshots_org_idx").on(table.organizationId)
    ]);

export const analyticsMetrics = pgTable("analytics_metrics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  value: numeric("value", { precision: 20, scale: 6 }).notNull(),
  metadata: jsonb("metadata").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
      index("analyticsMetrics_org_idx").on(table.organizationId),
      index("analyticsMetrics_name_idx").on(table.name)
    ]);

export const analyticsPerformance = pgTable("analytics_performance", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  targetId: varchar("target_id", { length: 50 }), // strategy_id or model_id
  targetType: varchar("target_type", { length: 50 }), // STRATEGY, MODEL
  winRate: numeric("win_rate", { precision: 5, scale: 4 }),
  profitFactor: numeric("profit_factor", { precision: 10, scale: 2 }),
  sharpeRatio: numeric("sharpe_ratio", { precision: 10, scale: 4 }),
  maxDrawdown: numeric("max_drawdown", { precision: 10, scale: 4 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
      index("analytics_perf_org_idx").on(table.organizationId),
      index("analytics_perf_target_idx").on(table.targetId)
    ]);

export const analyticsDashboards = pgTable("analytics_dashboards", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  layout: jsonb("layout").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
      index("analyticsDashboards_org_idx").on(table.organizationId)
    ]);

export const analyticsReports = pgTable("analytics_reports", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  config: jsonb("config").notNull(),
  status: varchar("status", { length: 20 }).default("COMPLETED").notNull(),
  fileUrl: varchar("file_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
      index("analyticsReports_org_idx").on(table.organizationId)
    ]);

// AI Memory Engine: Trading Intelligence Memory
export const memorySessions = pgTable("memory_sessions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  metadata: jsonb("metadata").default({}),
}, (table) => [
      index("memorySessions_org_idx").on(table.organizationId),
      index("memorySessions_user_idx").on(table.userId)
    ]);

export const memoryEvents = pgTable("memory_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => memorySessions.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // AI_DECISION, STRATEGY_RESULT, etc.
  sourceId: varchar("source_id", { length: 50 }), // ID of the related entity
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
      index("memoryEvents_session_idx").on(table.sessionId),
      index("memoryEvents_type_idx").on(table.type)
    ]);

export const memoryPatterns = pgTable("memory_patterns", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  patternType: varchar("pattern_type", { length: 50 }).notNull(),
  logic: jsonb("logic").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
      index("memoryPatterns_org_idx").on(table.organizationId)
    ]);

export const memoryFeedback = pgTable("memory_feedback", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => memoryEvents.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  rating: integer("rating"), // 1-5 or -1/1
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("memoryFeedback_createdAt_idx").on(table.createdAt)
          }));

export const memoryEmbeddings = pgTable("memory_embeddings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => memoryEvents.id, { onDelete: "cascade" }),
  vector: jsonb("vector").notNull(), // Simulation of vector storage
  model: varchar("model", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("memoryEmbeddings_createdAt_idx").on(table.createdAt)
          }));

export const memoryKnowledge = pgTable("memory_knowledge", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 100 }).notNull(),
  value: jsonb("value").notNull(),
  tags: jsonb("tags").default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
      index("memoryKnowledge_org_idx").on(table.organizationId),
      index("memoryKnowledge_key_idx").on(table.key)
    ]);

// AI Learning Engine: Performance learning and model/strategy calibration
export const aiLearningRecords = pgTable("ai_learning_records", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // PERFORMANCE, FEEDBACK, FAILURE_ANALYSIS
  sourceId: varchar("source_id", { length: 50 }), // strategy_id or model_id
  findings: jsonb("findings").notNull(),
  impactScore: numeric("impact_score", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
      index("aiLearningRecords_org_idx").on(table.organizationId),
      index("aiLearningRecords_type_idx").on(table.type)
    ]);

export const aiLearningScores = pgTable("ai_learning_scores", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  targetId: varchar("target_id", { length: 50 }).notNull(), // strategy_id or model_id
  targetType: varchar("target_type", { length: 50 }).notNull(), // STRATEGY, MODEL
  learningScore: numeric("learning_score", { precision: 5, scale: 4 }).default("0.5000"),
  confidenceAdjustment: numeric("confidence_adjustment", { precision: 5, scale: 4 }).default("0.0000"),
  ranking: integer("ranking"),
  metadata: jsonb("metadata").default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
      index("aiLearningScores_org_idx").on(table.organizationId),
      index("aiLearningScores_target_idx").on(table.targetId)
    ]);

// Administration audit logs recording workspace events and alerts
export const administrationLogs = pgTable("administration_logs", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 255 }).notNull(),
  severity: varchar("severity", { length: 50 }).notNull().default("info"), // info, warning, critical
  actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("administrationLogs_timestamp_idx").on(table.timestamp)
          }));

// --- AI BRAIN CORE ---


export const aiBrains = pgTable("ai_brains", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(), // 'ONLINE', 'OFFLINE', 'PROCESSING', 'ANALYZING'
  mode: text("mode").notNull(), // 'STANDARD', 'DEEP', 'RAPID', 'CONSENSUS'
  activeTasks: integer("active_tasks").notNull().default(0),
  systemLoad: doublePrecision("system_load").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
            statusIdx: index("aiBrains_status_idx").on(table.status),
            createdAtIdx: index("aiBrains_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiBrains_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("aiBrains_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const brainSessions = pgTable("brain_sessions", {
  id: text("id").primaryKey(),
  brainId: text("brain_id").notNull(),
  status: text("status").notNull(), // 'ACTIVE', 'COMPLETED', 'FAILED'
  context: text("context").notNull(), // JSON
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
}, (table) => ({
            statusIdx: index("brainSessions_status_idx").on(table.status),
            createdAtIdx: index("brainSessions_createdAt_idx").on(table.createdAt),
            completedAtIdx: index("brainSessions_completedAt_idx").on(table.completedAt),
            statuscreatedAtIdx: index("brainSessions_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const brainTasks = pgTable("brain_tasks", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  type: text("type").notNull(), // 'RESEARCH', 'MARKET_ANALYSIS', 'TRADING', etc
  priority: text("priority").notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  complexity: doublePrecision("complexity").notNull(),
  status: text("status").notNull(), // 'PENDING', 'ANALYZING', 'ASSIGNED', 'COLLECTING', 'SCORING', 'COMPLETED', 'FAILED'
  intent: text("intent").notNull(),
  requiredExpertise: text("required_expertise").notNull(), // JSON array
  estimatedTokens: integer("estimated_tokens"),
  estimatedCost: doublePrecision("estimated_cost"),
  estimatedDuration: integer("estimated_duration"),
  confidenceTarget: doublePrecision("confidence_target"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
            sessionIdIdx: index("brainTasks_sessionId_idx").on(table.sessionId),
            statusIdx: index("brainTasks_status_idx").on(table.status),
            createdAtIdx: index("brainTasks_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("brainTasks_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("brainTasks_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const brainReasoning = pgTable("brain_reasoning", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull(),
  step: integer("step").notNull(),
  logic: text("logic").notNull(),
  conclusion: text("conclusion").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  timestamp: text("timestamp").notNull(),
}, (table) => ({
            timestampIdx: index("brainReasoning_timestamp_idx").on(table.timestamp)
          }));

export const brainConsensus = pgTable("brain_consensus", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull(),
  requiredModels: integer("required_models").notNull(),
  achievedModels: integer("achieved_models").notNull().default(0),
  consensusScore: doublePrecision("consensus_score"),
  status: text("status").notNull(), // 'GATHERING', 'REACHED', 'FAILED', 'CONFLICT'
  resolution: text("resolution"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
            statusIdx: index("brainConsensus_status_idx").on(table.status),
            createdAtIdx: index("brainConsensus_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("brainConsensus_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("brainConsensus_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const brainAssignments = pgTable("brain_assignments", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull(),
  modelId: text("model_id").notNull(),
  role: text("role").notNull(), // 'PRIMARY', 'SECONDARY', 'CRITIC', 'VERIFIER'
  status: text("status").notNull(), // 'PENDING', 'EXECUTING', 'COMPLETED', 'FAILED'
  assignedAt: text("assigned_at").notNull(),
  completedAt: text("completed_at"),
  response: text("response"), // JSON
  score: doublePrecision("score"),
}, (table) => ({
            statusIdx: index("brainAssignments_status_idx").on(table.status),
            completedAtIdx: index("brainAssignments_completedAt_idx").on(table.completedAt)
          }));

export const brainHistory = pgTable("brain_history", {
  id: text("id").primaryKey(),
  brainId: text("brain_id").notNull(),
  eventType: text("event_type").notNull(), // 'TASK_COMPLETED', 'CONSENSUS_REACHED', 'OVERLOAD'
  eventData: text("event_data").notNull(), // JSON
  timestamp: text("timestamp").notNull(),
}, (table) => ({
            timestampIdx: index("brainHistory_timestamp_idx").on(table.timestamp)
          }));

// --- AI LEADERBOARD & PERFORMANCE ---

export const aiLeaderboards = pgTable("ai_leaderboards", {
  id: varchar("id", { length: 50 }).primaryKey(),
  categoryId: varchar("category_id", { length: 50 }).notNull(), // OVERALL, RESEARCH, TRADING, STRATEGY, RISK, etc.
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  lastCalculated: timestamp("last_calculated").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("aiLeaderboards_updatedAt_idx").on(table.updatedAt)
          }));

export const aiRankings = pgTable("ai_rankings", {
  id: varchar("id", { length: 50 }).primaryKey(),
  leaderboardId: varchar("leaderboard_id", { length: 50 }).notNull(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  rank: integer("rank").notNull(),
  previousRank: integer("previous_rank"),
  score: doublePrecision("score").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("aiRankings_updatedAt_idx").on(table.updatedAt)
          }));

export const aiScorecards = pgTable("ai_scorecards", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  // Financial/Trading
  winRate: doublePrecision("win_rate").notNull().default(0),
  lossRate: doublePrecision("loss_rate").notNull().default(0),
  roi: doublePrecision("roi").notNull().default(0),
  sharpeRatio: doublePrecision("sharpe_ratio").notNull().default(0),
  profitFactor: doublePrecision("profit_factor").notNull().default(0),
  drawdown: doublePrecision("drawdown").notNull().default(0),
  trades: integer("trades").notNull().default(0),
  // Accuracy/Reasoning
  avgConfidence: doublePrecision("avg_confidence").notNull().default(0),
  consensusAccuracy: doublePrecision("consensus_accuracy").notNull().default(0),
  reasoningAccuracy: doublePrecision("reasoning_accuracy").notNull().default(0),
  predictionAccuracy: doublePrecision("prediction_accuracy").notNull().default(0),
  researchReports: integer("research_reports").notNull().default(0),
  strategySuccess: doublePrecision("strategy_success").notNull().default(0),
  riskScore: doublePrecision("risk_score").notNull().default(0),
  // Technical/System
  latency: doublePrecision("latency").notNull().default(0),
  responseTime: doublePrecision("response_time").notNull().default(0),
  costEfficiency: doublePrecision("cost_efficiency").notNull().default(0),
  tokenUsage: integer("token_usage").notNull().default(0),
  memoryScore: doublePrecision("memory_score").notNull().default(0),
  reliabilityScore: doublePrecision("reliability_score").notNull().default(0),
  healthScore: doublePrecision("health_score").notNull().default(0),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("aiScorecards_updatedAt_idx").on(table.updatedAt)
          }));

export const aiPerformanceHistory = pgTable("ai_performance_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  categoryId: varchar("category_id", { length: 50 }).notNull(),
  previousRank: integer("previous_rank"),
  currentRank: integer("current_rank").notNull(),
  scoreDelta: doublePrecision("score_delta").notNull(),
  reason: text("reason"),
  timestamp: timestamp("timestamp").notNull(),
}, (table) => ({
            timestampIdx: index("aiPerformanceHistory_timestamp_idx").on(table.timestamp)
          }));

export const aiBenchmarks = pgTable("ai_benchmarks", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // GPT, Claude, Gemini, DeepSeek, etc.
  benchmarkType: varchar("benchmark_type", { length: 50 }).notNull(),
  score: doublePrecision("score").notNull(),
  maxScore: doublePrecision("max_score").notNull(),
  timestamp: timestamp("timestamp").notNull(),
}, (table) => ({
            timestampIdx: index("aiBenchmarks_timestamp_idx").on(table.timestamp)
          }));

// --- AI PERFORMANCE LAB & EVALUATION ENGINE ---

export const aiTestSuites = pgTable("ai_test_suites", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // RESEARCH, TRADING, RISK, etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiTestSuites_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiTestSuites_updatedAt_idx").on(table.updatedAt)
          }));

export const aiTestCases = pgTable("ai_test_cases", {
  id: varchar("id", { length: 50 }).primaryKey(),
  suiteId: varchar("suite_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  parameters: jsonb("parameters").default({}),
  expectedOutcome: jsonb("expected_outcome").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiTestCases_createdAt_idx").on(table.createdAt)
          }));

export const aiBenchmarkRuns = pgTable("ai_benchmark_runs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  suiteId: varchar("suite_id", { length: 50 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: doublePrecision("duration"),
  modelsTested: jsonb("models_tested").notNull().default([]),
  status: varchar("status", { length: 50 }).notNull(), // RUNNING, COMPLETED, FAILED
  failures: integer("failures").default(0).notNull(),
  warnings: integer("warnings").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("aiBenchmarkRuns_status_idx").on(table.status),
            createdAtIdx: index("aiBenchmarkRuns_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("aiBenchmarkRuns_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const aiEvaluations = pgTable("ai_evaluations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  runId: varchar("run_id", { length: 50 }).notNull(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  testCaseId: varchar("test_case_id", { length: 50 }).notNull(),
  score: doublePrecision("score").notNull(),
  passed: boolean("passed").notNull(),
  latency: doublePrecision("latency"),
  tokenUsage: integer("token_usage"),
  cost: doublePrecision("cost"),
  details: jsonb("details").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("aiEvaluations_timestamp_idx").on(table.timestamp)
          }));

export const aiMetrics = pgTable("ai_metrics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  evaluationType: varchar("evaluation_type", { length: 50 }).notNull(),
  accuracy: doublePrecision("accuracy").default(0).notNull(),
  precision: doublePrecision("precision").default(0).notNull(),
  recall: doublePrecision("recall").default(0).notNull(),
  confidence: doublePrecision("confidence").default(0).notNull(),
  latency: doublePrecision("latency").default(0).notNull(),
  cost: doublePrecision("cost").default(0).notNull(),
  tokenUsage: integer("token_usage").default(0).notNull(),
  reliability: doublePrecision("reliability").default(0).notNull(),
  consistency: doublePrecision("consistency").default(0).notNull(),
  hallucinationRate: doublePrecision("hallucination_rate").default(0).notNull(),
  reasoningQuality: doublePrecision("reasoning_quality").default(0).notNull(),
  researchQuality: doublePrecision("research_quality").default(0).notNull(),
  riskAwareness: doublePrecision("risk_awareness").default(0).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("aiMetrics_timestamp_idx").on(table.timestamp)
          }));

export const aiPerformanceReports = pgTable("ai_performance_reports", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  runId: varchar("run_id", { length: 50 }),
  overallScore: doublePrecision("overall_score").notNull(),
  categoryScores: jsonb("category_scores").default({}).notNull(),
  recommendations: jsonb("recommendations").default([]),
  strengths: jsonb("strengths").default([]),
  weaknesses: jsonb("weaknesses").default([]),
  improvementSuggestions: jsonb("improvement_suggestions").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiPerformanceReports_createdAt_idx").on(table.createdAt)
          }));

// --- AI FUND MANAGER & CAPITAL ALLOCATION ENGINE ---

export const aiFunds = pgTable("ai_funds", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull().unique(),
  allocatedCapital: doublePrecision("allocated_capital").default(0).notNull(),
  availableCapital: doublePrecision("available_capital").default(0).notNull(),
  reservedCapital: doublePrecision("reserved_capital").default(0).notNull(),
  usedCapital: doublePrecision("used_capital").default(0).notNull(),
  currentExposure: doublePrecision("current_exposure").default(0).notNull(),
  maximumExposure: doublePrecision("maximum_exposure").default(0).notNull(),
  realizedPnl: doublePrecision("realized_pnl").default(0).notNull(),
  unrealizedPnl: doublePrecision("unrealized_pnl").default(0).notNull(),
  roi: doublePrecision("roi").default(0).notNull(),
  drawdown: doublePrecision("drawdown").default(0).notNull(),
  sharpe: doublePrecision("sharpe").default(0).notNull(),
  winRate: doublePrecision("win_rate").default(0).notNull(),
  riskScore: doublePrecision("risk_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiFunds_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiFunds_updatedAt_idx").on(table.updatedAt)
          }));

export const aiAllocations = pgTable("ai_allocations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  amount: doublePrecision("amount").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 50 }).notNull(), // ACTIVE, PENDING, REJECTED, FROZEN
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("aiAllocations_status_idx").on(table.status),
            createdAtIdx: index("aiAllocations_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiAllocations_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("aiAllocations_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const allocationHistory = pgTable("allocation_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  previousAllocation: doublePrecision("previous_allocation").notNull(),
  currentAllocation: doublePrecision("current_allocation").notNull(),
  reason: text("reason").notNull(),
  operator: varchar("operator", { length: 50 }).notNull(),
  scoreSnapshot: jsonb("score_snapshot").default({}).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("allocationHistory_timestamp_idx").on(table.timestamp)
          }));

export const allocationRules = pgTable("allocation_rules", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  minimumScore: doublePrecision("minimum_score").notNull(),
  maximumDrawdown: doublePrecision("maximum_drawdown").notNull(),
  maximumAllocation: doublePrecision("maximum_allocation").notNull(),
  minimumAllocation: doublePrecision("minimum_allocation").notNull(),
  maximumExposure: doublePrecision("maximum_exposure").notNull(),
  promotionThreshold: doublePrecision("promotion_threshold").notNull(),
  demotionThreshold: doublePrecision("demotion_threshold").notNull(),
  freezeThreshold: doublePrecision("freeze_threshold").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("allocationRules_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("allocationRules_updatedAt_idx").on(table.updatedAt)
          }));

export const allocationSnapshots = pgTable("allocation_snapshots", {
  id: varchar("id", { length: 50 }).primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  totalCapital: doublePrecision("total_capital").notNull(),
  allocatedCapital: doublePrecision("allocated_capital").notNull(),
  distribution: jsonb("distribution").default({}).notNull(),
}, (table) => ({
            timestampIdx: index("allocationSnapshots_timestamp_idx").on(table.timestamp)
          }));

export const allocationRecommendations = pgTable("allocation_recommendations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // INCREASE_CAPITAL, DECREASE_CAPITAL, FREEZE, SUSPEND, PROMOTE, DEMOTE, WATCHLIST
  suggestedAmount: doublePrecision("suggested_amount"),
  reasoning: text("reasoning").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // PENDING, APPLIED, REJECTED
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("allocationRecommendations_status_idx").on(table.status),
            createdAtIdx: index("allocationRecommendations_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("allocationRecommendations_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// --- AI TOURNAMENT ARENA & COMPETITION ENGINE ---

export const tournamentSeasons = pgTable("tournament_seasons", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // PLANNED, ACTIVE, COMPLETED
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  championId: varchar("champion_id", { length: 50 }),
  runnerUpId: varchar("runner_up_id", { length: 50 }),
  mvpId: varchar("mvp_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("tournamentSeasons_status_idx").on(table.status),
            createdAtIdx: index("tournamentSeasons_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("tournamentSeasons_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("tournamentSeasons_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const aiTournaments = pgTable("ai_tournaments", {
  id: varchar("id", { length: 50 }).primaryKey(),
  seasonId: varchar("season_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // AI_VS_AI, PROVIDER_VS_PROVIDER, etc.
  status: varchar("status", { length: 50 }).notNull(), // PENDING, ONGOING, COMPLETED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("aiTournaments_status_idx").on(table.status),
            createdAtIdx: index("aiTournaments_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiTournaments_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("aiTournaments_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const tournamentRounds = pgTable("tournament_rounds", {
  id: varchar("id", { length: 50 }).primaryKey(),
  tournamentId: varchar("tournament_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  sequence: integer("sequence").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("tournamentRounds_status_idx").on(table.status),
            createdAtIdx: index("tournamentRounds_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("tournamentRounds_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const tournamentMatches = pgTable("tournament_matches", {
  id: varchar("id", { length: 50 }).primaryKey(),
  roundId: varchar("round_id", { length: 50 }).notNull(),
  participantA: varchar("participant_a", { length: 50 }).notNull(),
  participantB: varchar("participant_b", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // SCHEDULED, IN_PROGRESS, COMPLETED
  winnerId: varchar("winner_id", { length: 50 }),
  loserId: varchar("loser_id", { length: 50 }),
  isDraw: boolean("is_draw").default(false).notNull(),
  matchData: jsonb("match_data").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
            statusIdx: index("tournamentMatches_status_idx").on(table.status),
            createdAtIdx: index("tournamentMatches_createdAt_idx").on(table.createdAt),
            completedAtIdx: index("tournamentMatches_completedAt_idx").on(table.completedAt),
            statuscreatedAtIdx: index("tournamentMatches_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const tournamentResults = pgTable("tournament_results", {
  id: varchar("id", { length: 50 }).primaryKey(),
  matchId: varchar("match_id", { length: 50 }).notNull(),
  participantId: varchar("participant_id", { length: 50 }).notNull(),
  score: doublePrecision("score").notNull(),
  confidence: doublePrecision("confidence").default(0).notNull(),
  roi: doublePrecision("roi").default(0).notNull(),
  sharpe: doublePrecision("sharpe").default(0).notNull(),
  drawdown: doublePrecision("drawdown").default(0).notNull(),
  accuracy: doublePrecision("accuracy").default(0).notNull(),
  riskScore: doublePrecision("risk_score").default(0).notNull(),
  executionTimeMs: integer("execution_time_ms").default(0).notNull(),
  tokenUsage: integer("token_usage").default(0).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("tournamentResults_timestamp_idx").on(table.timestamp)
          }));

export const tournamentScoreboards = pgTable("tournament_scoreboards", {
  id: varchar("id", { length: 50 }).primaryKey(),
  seasonId: varchar("season_id", { length: 50 }).notNull(),
  participantId: varchar("participant_id", { length: 50 }).notNull(),
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  draws: integer("draws").default(0).notNull(),
  winRate: doublePrecision("win_rate").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  ranking: integer("ranking").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  bestStreak: integer("best_streak").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("tournamentScoreboards_updatedAt_idx").on(table.updatedAt)
          }));

// --- AI MEMORY EVOLUTION ENGINE ---

export const aiMemoryProfiles = pgTable("ai_memory_profiles", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull().unique(),
  knowledgeScore: doublePrecision("knowledge_score").default(0).notNull(),
  learningScore: doublePrecision("learning_score").default(0).notNull(),
  experienceScore: doublePrecision("experience_score").default(0).notNull(),
  reasoningScore: doublePrecision("reasoning_score").default(0).notNull(),
  patternScore: doublePrecision("pattern_score").default(0).notNull(),
  confidenceTrend: doublePrecision("confidence_trend").default(0).notNull(),
  growthIndex: doublePrecision("growth_index").default(0).notNull(),
  learningVelocity: doublePrecision("learning_velocity").default(0).notNull(),
  memoryHealth: doublePrecision("memory_health").default(100).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiMemoryProfiles_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiMemoryProfiles_updatedAt_idx").on(table.updatedAt)
          }));

export const aiLearningSessions = pgTable("ai_learning_sessions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  sessionType: varchar("session_type", { length: 50 }).notNull(),
  durationMs: integer("duration_ms").default(0).notNull(),
  eventsProcessed: integer("events_processed").default(0).notNull(),
  insightsGenerated: integer("insights_generated").default(0).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
            statusIdx: index("aiLearningSessions_status_idx").on(table.status),
            createdAtIdx: index("aiLearningSessions_createdAt_idx").on(table.createdAt),
            completedAtIdx: index("aiLearningSessions_completedAt_idx").on(table.completedAt),
            statuscreatedAtIdx: index("aiLearningSessions_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const aiLearningEvents = pgTable("ai_learning_events", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  sessionId: varchar("session_id", { length: 50 }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // SUCCESS, FAILURE, REPEATED_MISTAKE, REPEATED_SUCCESS
  category: varchar("category", { length: 50 }).notNull(), // STRATEGY, RISK, MARKET, RESEARCH
  description: text("description").notNull(),
  impactScore: doublePrecision("impact_score").default(0).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("aiLearningEvents_sessionId_idx").on(table.sessionId),
            timestampIdx: index("aiLearningEvents_timestamp_idx").on(table.timestamp)
          }));

export const aiPatternLibrary = pgTable("ai_pattern_library", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  patternType: varchar("pattern_type", { length: 50 }).notNull(), // WINNING, LOSING, SIGNAL, BEHAVIOR, MARKET
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  frequency: integer("frequency").default(0).notNull(),
  confidence: doublePrecision("confidence").default(0).notNull(),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

export const aiMemorySnapshots = pgTable("ai_memory_snapshots", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  metrics: jsonb("metrics").default({}).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("aiMemorySnapshots_timestamp_idx").on(table.timestamp)
          }));

export const aiMemoryVersions = pgTable("ai_memory_versions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  previousVersion: varchar("previous_version", { length: 50 }),
  currentVersion: varchar("current_version", { length: 50 }).notNull(),
  reason: text("reason").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("aiMemoryVersions_timestamp_idx").on(table.timestamp)
          }));

export const aiExperienceHistory = pgTable("ai_experience_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  experiencePoints: doublePrecision("experience_points").notNull(),
  growthDelta: doublePrecision("growth_delta").notNull(),
  adaptationScore: doublePrecision("adaptation_score").notNull(),
  improvementTrend: doublePrecision("improvement_trend").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("aiExperienceHistory_timestamp_idx").on(table.timestamp)
          }));

export const aiSkillProgress = pgTable("ai_skill_progress", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  skillName: varchar("skill_name", { length: 50 }).notNull(),
  level: integer("level").default(1).notNull(),
  progress: doublePrecision("progress").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("aiSkillProgress_updatedAt_idx").on(table.updatedAt)
          }));


// --- AI KNOWLEDGE GRAPH ENGINE ---
export const knowledgeNodes = pgTable("knowledge_nodes", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  attributes: jsonb("attributes").default({}).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("knowledgeNodes_status_idx").on(table.status),
            createdAtIdx: index("knowledgeNodes_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("knowledgeNodes_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("knowledgeNodes_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const knowledgeEdges = pgTable("knowledge_edges", {
  id: varchar("id", { length: 50 }).primaryKey(),
  sourceNodeId: varchar("source_node_id", { length: 50 }).notNull(),
  targetNodeId: varchar("target_node_id", { length: 50 }).notNull(),
  edgeType: varchar("edge_type", { length: 50 }).notNull(),
  weight: doublePrecision("weight").default(1.0).notNull(),
  attributes: jsonb("attributes").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("knowledgeEdges_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("knowledgeEdges_updatedAt_idx").on(table.updatedAt)
          }));

export const knowledgeCategories = pgTable("knowledge_categories", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("knowledgeCategories_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("knowledgeCategories_updatedAt_idx").on(table.updatedAt)
          }));

export const knowledgeRelationships = pgTable("knowledge_relationships", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("knowledgeRelationships_createdAt_idx").on(table.createdAt)
          }));

export const knowledgePaths = pgTable("knowledge_paths", {
  id: varchar("id", { length: 50 }).primaryKey(),
  startNodeId: varchar("start_node_id", { length: 50 }).notNull(),
  endNodeId: varchar("end_node_id", { length: 50 }).notNull(),
  pathLength: integer("path_length").notNull(),
  pathData: jsonb("path_data").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("knowledgePaths_createdAt_idx").on(table.createdAt)
          }));

export const knowledgeSnapshots = pgTable("knowledge_snapshots", {
  id: varchar("id", { length: 50 }).primaryKey(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  nodeCount: integer("node_count").notNull(),
  edgeCount: integer("edge_count").notNull(),
  metrics: jsonb("metrics").default({}).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("knowledgeSnapshots_timestamp_idx").on(table.timestamp)
          }));

export const knowledgeVersions = pgTable("knowledge_versions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  versionTag: varchar("version_tag", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("knowledgeVersions_createdAt_idx").on(table.createdAt)
          }));

// --- AI COLLABORATION ENGINE ---

export const aiCollaborations = pgTable("ai_collaborations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("aiCollaborations_status_idx").on(table.status),
            createdAtIdx: index("aiCollaborations_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiCollaborations_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("aiCollaborations_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const collaborationSessions = pgTable("collaboration_sessions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  collaborationId: varchar("collaboration_id", { length: 50 }).notNull(),
  objective: text("objective").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("collaborationSessions_status_idx").on(table.status),
            createdAtIdx: index("collaborationSessions_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("collaborationSessions_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("collaborationSessions_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const collaborationMembers = pgTable("collaboration_members", {
  id: varchar("id", { length: 50 }).primaryKey(),
  sessionId: varchar("session_id", { length: 50 }).notNull(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("collaborationMembers_sessionId_idx").on(table.sessionId),
            statusIdx: index("collaborationMembers_status_idx").on(table.status)
          }));

export const collaborationTasks = pgTable("collaboration_tasks", {
  id: varchar("id", { length: 50 }).primaryKey(),
  sessionId: varchar("session_id", { length: 50 }).notNull(),
  memberId: varchar("member_id", { length: 50 }),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  resultData: jsonb("result_data").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("collaborationTasks_sessionId_idx").on(table.sessionId),
            statusIdx: index("collaborationTasks_status_idx").on(table.status),
            createdAtIdx: index("collaborationTasks_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("collaborationTasks_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("collaborationTasks_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const collaborationMessages = pgTable("collaboration_messages", {
  id: varchar("id", { length: 50 }).primaryKey(),
  sessionId: varchar("session_id", { length: 50 }).notNull(),
  senderMemberId: varchar("sender_member_id", { length: 50 }),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("collaborationMessages_sessionId_idx").on(table.sessionId),
            timestampIdx: index("collaborationMessages_timestamp_idx").on(table.timestamp)
          }));

export const collaborationResults = pgTable("collaboration_results", {
  id: varchar("id", { length: 50 }).primaryKey(),
  sessionId: varchar("session_id", { length: 50 }).notNull(),
  finalRecommendation: text("final_recommendation"),
  supportingEvidence: jsonb("supporting_evidence").default([]),
  participatingModels: jsonb("participating_models").default([]),
  executionTimeMs: integer("execution_time_ms"),
  cost: doublePrecision("cost"),
  tokenUsage: jsonb("token_usage").default({}),
  consensusSummary: text("consensus_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("collaborationResults_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("collaborationResults_createdAt_idx").on(table.createdAt)
          }));

export const collaborationConsensus = pgTable("collaboration_consensus", {
  id: varchar("id", { length: 50 }).primaryKey(),
  sessionId: varchar("session_id", { length: 50 }).notNull(),
  agreementScore: doublePrecision("agreement_score").notNull(),
  conflictScore: doublePrecision("conflict_score").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  majorityDecision: text("majority_decision"),
  minorityOpinion: text("minority_opinion"),
  escalationRequired: boolean("escalation_required").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("collaborationConsensus_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("collaborationConsensus_createdAt_idx").on(table.createdAt)
          }));

export const collaborationHistory = pgTable("collaboration_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  sessionId: varchar("session_id", { length: 50 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: jsonb("details").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("collaborationHistory_sessionId_idx").on(table.sessionId),
            timestampIdx: index("collaborationHistory_timestamp_idx").on(table.timestamp)
          }));

// --- STRATEGY REGISTRY ---

export const strategyRegistry = pgTable("strategy_registry", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  owner: varchar("owner", { length: 100 }).notNull(),
  createdBy: varchar("created_by", { length: 100 }).notNull(),
  riskLevel: varchar("risk_level", { length: 50 }).notNull(),
  complexity: integer("complexity").notNull(),
  supportedMarkets: jsonb("supported_markets").default([]),
  supportedInstruments: jsonb("supported_instruments").default([]),
  minimumCapital: doublePrecision("minimum_capital"),
  maximumCapital: doublePrecision("maximum_capital"),
  preferredTimeframe: varchar("preferred_timeframe", { length: 100 }),
  preferredSession: varchar("preferred_session", { length: 100 }),
  createdTime: timestamp("created_time").defaultNow().notNull(),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("strategyRegistry_status_idx").on(table.status)
          }));

export const strategyCategories = pgTable("strategy_categories", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyTags = pgTable("strategy_tags", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  tag: varchar("tag", { length: 50 }).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyTags_strategyId_idx").on(table.strategyId)
          }));

export const strategyDependencies = pgTable("strategy_dependencies", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  dependencyType: varchar("dependency_type", { length: 50 }).notNull(),
  dependencyId: varchar("dependency_id", { length: 50 }).notNull(),
  isRequired: boolean("is_required").default(true).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyDependencies_strategyId_idx").on(table.strategyId)
          }));

export const strategyMetadata = pgTable("strategy_metadata", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyMetadata_strategyId_idx").on(table.strategyId)
          }));

export const strategyCapabilities = pgTable("strategy_capabilities", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  supportsPaperTrading: boolean("supports_paper_trading").default(false).notNull(),
  supportsAi: boolean("supports_ai").default(false).notNull(),
  supportsAutomation: boolean("supports_automation").default(false).notNull(),
  supportsReplay: boolean("supports_replay").default(false).notNull(),
  supportsBacktesting: boolean("supports_backtesting").default(false).notNull(),
  supportsPortfolio: boolean("supports_portfolio").default(false).notNull(),
  supportsMultiAsset: boolean("supports_multi_asset").default(false).notNull(),
  supportsMultiTimeframe: boolean("supports_multi_timeframe").default(false).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyCapabilities_strategyId_idx").on(table.strategyId)
          }));

export const strategyTemplates = pgTable("strategy_templates", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  configTemplate: jsonb("config_template").default({}).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
});

// --- STRATEGY LIFECYCLE MANAGER ---

export const strategyLifecycles = pgTable("strategy_lifecycles", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  currentState: varchar("current_state", { length: 50 }).notNull(),
  previousState: varchar("previous_state", { length: 50 }),
  createdTime: timestamp("created_time").defaultNow().notNull(),
  activatedTime: timestamp("activated_time"),
  pausedTime: timestamp("paused_time"),
  retiredTime: timestamp("retired_time"),
  currentVersion: varchar("current_version", { length: 50 }).notNull(),
  approvalStatus: varchar("approval_status", { length: 50 }),
  approvalBy: varchar("approval_by", { length: 100 }),
  approvalNotes: text("approval_notes"),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyLifecycles_strategyId_idx").on(table.strategyId),
            approvalStatusIdx: index("strategyLifecycles_approvalStatus_idx").on(table.approvalStatus)
          }));

export const strategyStates = pgTable("strategy_states", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyStateHistory = pgTable("strategy_state_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  oldState: varchar("old_state", { length: 50 }),
  newState: varchar("new_state", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: varchar("user_id", { length: 100 }),
  reason: text("reason"),
  notes: text("notes"),
}, (table) => ({
            strategyIdIdx: index("strategyStateHistory_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyStateHistory_timestamp_idx").on(table.timestamp)
          }));

export const strategyTransitions = pgTable("strategy_transitions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  fromState: varchar("from_state", { length: 50 }).notNull(),
  toState: varchar("to_state", { length: 50 }).notNull(),
  isValid: boolean("is_valid").default(true).notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyActivationLogs = pgTable("strategy_activation_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  activatedBy: varchar("activated_by", { length: 100 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  notes: text("notes"),
}, (table) => ({
            strategyIdIdx: index("strategyActivationLogs_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyActivationLogs_timestamp_idx").on(table.timestamp),
            statusIdx: index("strategyActivationLogs_status_idx").on(table.status)
          }));

export const aiModelLifecycles = pgTable("ai_model_lifecycles", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: integer("model_id").references(() => aiModels.id, { onDelete: "cascade" }),
  currentState: varchar("current_state", { length: 50 }).notNull(),
  previousState: varchar("previous_state", { length: 50 }),
  createdTime: timestamp("created_time").defaultNow().notNull(),
  activatedTime: timestamp("activated_time"),
  pausedTime: timestamp("paused_time"),
  retiredTime: timestamp("retired_time"),
  currentVersion: varchar("current_version", { length: 50 }).notNull(),
  approvalStatus: varchar("approval_status", { length: 50 }),
  approvalBy: varchar("approval_by", { length: 100 }),
  approvalNotes: text("approval_notes"),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            approvalStatusIdx: index("aiModelLifecycles_approvalStatus_idx").on(table.approvalStatus)
          }));

export const aiModelStateHistory = pgTable("ai_model_state_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: integer("model_id").references(() => aiModels.id, { onDelete: "cascade" }),
  oldState: varchar("old_state", { length: 50 }),
  newState: varchar("new_state", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: varchar("user_id", { length: 100 }),
  reason: text("reason"),
  notes: text("notes"),
}, (table) => ({
            timestampIdx: index("aiModelStateHistory_timestamp_idx").on(table.timestamp)
          }));

export const aiModelTransitions = pgTable("ai_model_transitions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  fromState: varchar("from_state", { length: 50 }).notNull(),
  toState: varchar("to_state", { length: 50 }).notNull(),
  isValid: boolean("is_valid").default(true).notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const aiModelActivationLogs = pgTable("ai_model_activation_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: integer("model_id").references(() => aiModels.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 50 }).notNull(),
  activatedBy: varchar("activated_by", { length: 100 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  notes: text("notes"),
}, (table) => ({
            timestampIdx: index("aiModelActivationLogs_timestamp_idx").on(table.timestamp),
            statusIdx: index("aiModelActivationLogs_status_idx").on(table.status)
          }));

export const aiModelRetirementLogs = pgTable("ai_model_retirement_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: integer("model_id").references(() => aiModels.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 50 }).notNull(),
  retiredBy: varchar("retired_by", { length: 100 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
}, (table) => ({
            timestampIdx: index("aiModelRetirementLogs_timestamp_idx").on(table.timestamp)
          }));

export const strategyRetirementLogs = pgTable("strategy_retirement_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  retiredBy: varchar("retired_by", { length: 100 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
}, (table) => ({
            strategyIdIdx: index("strategyRetirementLogs_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyRetirementLogs_timestamp_idx").on(table.timestamp)
          }));

// --- STRATEGY BUILDER ---

export const strategyBuilders = pgTable("strategy_builders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").default([]),
  description: text("description"),
  riskLevel: varchar("risk_level", { length: 50 }).default("MEDIUM"),
  marketType: varchar("market_type", { length: 50 }).default("EQUITY"),
  instrumentType: varchar("instrument_type", { length: 50 }).default("SPOT"),
  timeframe: varchar("timeframe", { length: 50 }).default("15M"),
  status: varchar("status", { length: 50 }).default("DRAFT").notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  approvalStatus: varchar("approval_status", { length: 50 }).default("PENDING").notNull(),
  sha256Reference: varchar("sha256_reference", { length: 64 }),
  rules: jsonb("rules").default([]),
  createdBy: varchar("created_by", { length: 100 }).default("SYSTEM").notNull(),
  updatedBy: varchar("updated_by", { length: 100 }).default("SYSTEM").notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyBuilders_strategyId_idx").on(table.strategyId)
          }));

export const strategyBlocks = pgTable("strategy_blocks", {
  id: varchar("id", { length: 50 }).primaryKey(),
  builderId: varchar("builder_id", { length: 50 }).notNull(),
  blockType: varchar("block_type", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyConnections = pgTable("strategy_connections", {
  id: varchar("id", { length: 50 }).primaryKey(),
  builderId: varchar("builder_id", { length: 50 }).notNull(),
  sourceBlockId: varchar("source_block_id", { length: 50 }).notNull(),
  targetBlockId: varchar("target_block_id", { length: 50 }).notNull(),
  sourcePort: varchar("source_port", { length: 50 }),
  targetPort: varchar("target_port", { length: 50 }),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyLayouts = pgTable("strategy_layouts", {
  id: varchar("id", { length: 50 }).primaryKey(),
  builderId: varchar("builder_id", { length: 50 }).notNull(),
  blockId: varchar("block_id", { length: 50 }).notNull(),
  positionX: doublePrecision("position_x").notNull(),
  positionY: doublePrecision("position_y").notNull(),
  width: doublePrecision("width"),
  height: doublePrecision("height"),
  isCollapsed: boolean("is_collapsed").default(false),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyParameters = pgTable("strategy_parameters", {
  id: varchar("id", { length: 50 }).primaryKey(),
  blockId: varchar("block_id", { length: 50 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
  valueType: varchar("value_type", { length: 50 }).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyValidation = pgTable("strategy_validation", {
  id: varchar("id", { length: 50 }).primaryKey(),
  builderId: varchar("builder_id", { length: 50 }).notNull(),
  isValid: boolean("is_valid").default(false).notNull(),
  errors: jsonb("errors").default([]),
  warnings: jsonb("warnings").default([]),
  validatedTime: timestamp("validated_time").defaultNow().notNull(),
});

export const strategyBuilderHistory = pgTable("strategy_builder_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  builderId: varchar("builder_id", { length: 50 }).notNull(),
  snapshot: jsonb("snapshot").notNull(),
  userId: varchar("user_id", { length: 100 }),
  reason: text("reason"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

// --- STRATEGY VERSIONING ---

export const strategyVersions = pgTable("strategy_versions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  majorVersion: integer("major_version").notNull(),
  minorVersion: integer("minor_version").notNull(),
  patchVersion: integer("patch_version").notNull(),
  semanticVersion: varchar("semantic_version", { length: 50 }).notNull(),
  versionType: varchar("version_type", { length: 50 }).notNull(), // Experimental, Stable, Production, Archived
  lifecycleState: varchar("lifecycle_state", { length: 50 }).notNull(),
  validationStatus: varchar("validation_status", { length: 50 }).notNull(),
  author: varchar("author", { length: 100 }),
  notes: text("notes"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyVersions_strategyId_idx").on(table.strategyId)
          }));

export const strategyVersionHistory = pgTable("strategy_version_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // CREATED, RESTORED, CLONED
  userId: varchar("user_id", { length: 100 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
}, (table) => ({
            strategyIdIdx: index("strategyVersionHistory_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyVersionHistory_timestamp_idx").on(table.timestamp)
          }));

export const strategyChangeLogs = pgTable("strategy_change_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  blocksAdded: integer("blocks_added").default(0),
  blocksRemoved: integer("blocks_removed").default(0),
  parametersChanged: integer("parameters_changed").default(0),
  connectionsChanged: integer("connections_changed").default(0),
  validationResult: varchar("validation_result", { length: 50 }),
  riskChanges: text("risk_changes"),
  aiDependencyChanges: text("ai_dependency_changes"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyVersionTags = pgTable("strategy_version_tags", {
  id: varchar("id", { length: 50 }).primaryKey(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  tag: varchar("tag", { length: 50 }).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategySnapshots = pgTable("strategy_snapshots", {
  id: varchar("id", { length: 50 }).primaryKey(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  builderLayout: jsonb("builder_layout").notNull(),
  blocks: jsonb("blocks").notNull(),
  connections: jsonb("connections").notNull(),
  parameters: jsonb("parameters").notNull(),
  metadata: jsonb("metadata"),
  dependencies: jsonb("dependencies"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyRestorePoints = pgTable("strategy_restore_points", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  reason: text("reason"),
  restoredBy: varchar("restored_by", { length: 100 }),
  restoredTime: timestamp("restored_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyRestorePoints_strategyId_idx").on(table.strategyId)
          }));

// --- STRATEGY OPTIMIZER ---

export const strategyOptimizations = pgTable("strategy_optimizations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  score: doublePrecision("score"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyOptimizations_strategyId_idx").on(table.strategyId),
            statusIdx: index("strategyOptimizations_status_idx").on(table.status)
          }));

export const strategyOptimizationRuns = pgTable("strategy_optimization_runs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  optimizationId: varchar("optimization_id", { length: 50 }).notNull(),
  runType: varchar("run_type", { length: 50 }).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  result: jsonb("result"),
});

export const strategyOptimizationRules = pgTable("strategy_optimization_rules", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  minimumWinRate: doublePrecision("minimum_win_rate"),
  maximumDrawdown: doublePrecision("maximum_drawdown"),
  targetSharpe: doublePrecision("target_sharpe"),
  targetProfitFactor: doublePrecision("target_profit_factor"),
  maximumRisk: doublePrecision("maximum_risk"),
  minimumConfidence: doublePrecision("minimum_confidence"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyRecommendations = pgTable("strategy_recommendations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  optimizationId: varchar("optimization_id", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  suggestedChanges: jsonb("suggested_changes").notNull(),
  confidenceScore: doublePrecision("confidence_score"),
  expectedBenefit: text("expected_benefit"),
  expectedRisk: text("expected_risk"),
  notes: text("notes"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyParameterAnalysis = pgTable("strategy_parameter_analysis", {
  id: varchar("id", { length: 50 }).primaryKey(),
  optimizationId: varchar("optimization_id", { length: 50 }).notNull(),
  blockId: varchar("block_id", { length: 50 }).notNull(),
  parameterKey: varchar("parameter_key", { length: 100 }).notNull(),
  currentValue: text("current_value"),
  optimalValue: text("optimal_value"),
  impactScore: doublePrecision("impact_score"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyOptimizationHistory = pgTable("strategy_optimization_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  optimizationId: varchar("optimization_id", { length: 50 }).notNull(),
  userId: varchar("user_id", { length: 100 }),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyOptimizationHistory_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyOptimizationHistory_timestamp_idx").on(table.timestamp)
          }));

// --- STRATEGY BACKTESTING ---

export const strategyBacktests = pgTable("strategy_backtests", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyBacktests_strategyId_idx").on(table.strategyId),
            statusIdx: index("strategyBacktests_status_idx").on(table.status)
          }));

export const strategyBacktestRuns = pgTable("strategy_backtest_runs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  backtestId: varchar("backtest_id", { length: 50 }).notNull(),
  configuration: jsonb("configuration").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  progress: integer("progress").default(0),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
}, (table) => ({
            statusIdx: index("strategyBacktestRuns_status_idx").on(table.status)
          }));

export const strategyBacktestOrders = pgTable("strategy_backtest_orders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  runId: varchar("run_id", { length: 50 }).notNull(),
  paperOrderId: integer("paper_order_id"),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  side: varchar("side", { length: 20 }).notNull(),
  quantity: varchar("quantity", { length: 50 }).notNull(),
  price: varchar("price", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("strategyBacktestOrders_status_idx").on(table.status)
          }));

export const strategyBacktestPositions = pgTable("strategy_backtest_positions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  runId: varchar("run_id", { length: 50 }).notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  quantity: varchar("quantity", { length: 50 }).notNull(),
  averagePrice: varchar("average_price", { length: 50 }).notNull(),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
});

export const strategyBacktestTrades = pgTable("strategy_backtest_trades", {
  id: varchar("id", { length: 50 }).primaryKey(),
  runId: varchar("run_id", { length: 50 }).notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  side: varchar("side", { length: 20 }).notNull(),
  quantity: varchar("quantity", { length: 50 }).notNull(),
  executionPrice: varchar("execution_price", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("strategyBacktestTrades_timestamp_idx").on(table.timestamp)
          }));

export const strategyBacktestMetrics = pgTable("strategy_backtest_metrics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  runId: varchar("run_id", { length: 50 }).notNull(),
  netProfit: doublePrecision("net_profit"),
  grossProfit: doublePrecision("gross_profit"),
  grossLoss: doublePrecision("gross_loss"),
  roi: doublePrecision("roi"),
  cagr: doublePrecision("cagr"),
  winRate: doublePrecision("win_rate"),
  profitFactor: doublePrecision("profit_factor"),
  sharpeRatio: doublePrecision("sharpe_ratio"),
  maxDrawdown: doublePrecision("max_drawdown"),
  recoveryFactor: doublePrecision("recovery_factor"),
  totalTrades: integer("total_trades"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyBacktestReports = pgTable("strategy_backtest_reports", {
  id: varchar("id", { length: 50 }).primaryKey(),
  runId: varchar("run_id", { length: 50 }).notNull(),
  summary: text("summary"),
  riskAnalysis: text("risk_analysis"),
  suggestions: text("suggestions"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyBacktestEquityCurve = pgTable("strategy_backtest_equity_curve", {
  id: varchar("id", { length: 50 }).primaryKey(),
  runId: varchar("run_id", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  equity: doublePrecision("equity").notNull(),
}, (table) => ({
            timestampIdx: index("strategyBacktestEquityCurve_timestamp_idx").on(table.timestamp)
          }));

export const strategyBacktestHistory = pgTable("strategy_backtest_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  runId: varchar("run_id", { length: 50 }).notNull(),
  userId: varchar("user_id", { length: 100 }),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyBacktestHistory_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyBacktestHistory_timestamp_idx").on(table.timestamp)
          }));

// --- STRATEGY LEADERBOARD ---

export const strategySeasons = pgTable("strategy_seasons", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // Weekly, Monthly, Quarterly, Yearly, All Time
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyLeaderboards = pgTable("strategy_leaderboards", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  seasonId: varchar("season_id", { length: 50 }).notNull(),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
});

export const strategyRankings = pgTable("strategy_rankings", {
  id: varchar("id", { length: 50 }).primaryKey(),
  leaderboardId: varchar("leaderboard_id", { length: 50 }).notNull(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  rank: integer("rank").notNull(),
  previousRank: integer("previous_rank"),
  score: doublePrecision("score").notNull(),
  rating: varchar("rating", { length: 50 }),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyRankings_strategyId_idx").on(table.strategyId)
          }));

export const strategyScorecards = pgTable("strategy_scorecards", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  seasonId: varchar("season_id", { length: 50 }),
  overallScore: doublePrecision("overall_score").notNull(),
  backtestingScore: doublePrecision("backtesting_score"),
  paperTradingScore: doublePrecision("paper_trading_score"),
  riskScore: doublePrecision("risk_score"),
  consistencyScore: doublePrecision("consistency_score"),
  capitalEfficiency: doublePrecision("capital_efficiency"),
  recoveryScore: doublePrecision("recovery_score"),
  executionQuality: doublePrecision("execution_quality"),
  compositeRating: varchar("composite_rating", { length: 50 }),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyScorecards_strategyId_idx").on(table.strategyId)
          }));

export const strategyRatingHistory = pgTable("strategy_rating_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  rating: varchar("rating", { length: 50 }).notNull(),
  score: doublePrecision("score").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyRatingHistory_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyRatingHistory_timestamp_idx").on(table.timestamp)
          }));

export const strategyBenchmarks = pgTable("strategy_benchmarks", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  benchmarkName: varchar("benchmark_name", { length: 100 }).notNull(),
  strategyReturn: doublePrecision("strategy_return"),
  benchmarkReturn: doublePrecision("benchmark_return"),
  alpha: doublePrecision("alpha"),
  beta: doublePrecision("beta"),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyBenchmarks_strategyId_idx").on(table.strategyId)
          }));

export const strategyAwards = pgTable("strategy_awards", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  seasonId: varchar("season_id", { length: 50 }),
  awardType: varchar("award_type", { length: 100 }).notNull(),
  description: text("description"),
  awardedTime: timestamp("awarded_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyAwards_strategyId_idx").on(table.strategyId)
          }));

export const strategyScoreHistory = pgTable("strategy_score_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  score: doublePrecision("score").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyScoreHistory_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyScoreHistory_timestamp_idx").on(table.timestamp)
          }));

// --- STRATEGY MARKETPLACE ---

export const strategyMarketplace = pgTable("strategy_marketplace", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyPublications = pgTable("strategy_publications", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  publisher: varchar("publisher", { length: 100 }).notNull(),
  visibility: varchar("visibility", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }),
  tags: jsonb("tags"),
  description: text("description"),
  releaseNotes: text("release_notes"),
  publicationDate: timestamp("publication_date").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyPublications_strategyId_idx").on(table.strategyId)
          }));

export const strategyTemplateLibrary = pgTable("strategy_template_library", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  snapshot: jsonb("snapshot").notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyDownloadHistory = pgTable("strategy_download_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  publicationId: varchar("publication_id", { length: 50 }).notNull(),
  userId: varchar("user_id", { length: 100 }).notNull(),
  downloadDate: timestamp("download_date").defaultNow().notNull(),
});

export const strategyInstallations = pgTable("strategy_installations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  publicationId: varchar("publication_id", { length: 50 }).notNull(),
  userId: varchar("user_id", { length: 100 }).notNull(),
  installedStrategyId: varchar("installed_strategy_id", { length: 50 }).notNull(),
  installationDate: timestamp("installation_date").defaultNow().notNull(),
});

export const strategyReviews = pgTable("strategy_reviews", {
  id: varchar("id", { length: 50 }).primaryKey(),
  publicationId: varchar("publication_id", { length: 50 }).notNull(),
  rating: integer("rating").notNull(),
  reviewNotes: text("review_notes"),
  reviewer: varchar("reviewer", { length: 100 }).notNull(),
  approvalStatus: varchar("approval_status", { length: 50 }).notNull(),
  reviewDate: timestamp("review_date").defaultNow().notNull(),
}, (table) => ({
            approvalStatusIdx: index("strategyReviews_approvalStatus_idx").on(table.approvalStatus)
          }));

export const strategyUsageStatistics = pgTable("strategy_usage_statistics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  publicationId: varchar("publication_id", { length: 50 }).notNull(),
  installCount: integer("install_count").default(0),
  cloneCount: integer("clone_count").default(0),
  usageCount: integer("usage_count").default(0),
  backtestCount: integer("backtest_count").default(0),
  paperTradingCount: integer("paper_trading_count").default(0),
  popularityScore: doublePrecision("popularity_score").default(0),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
});

export const strategyFeatured = pgTable("strategy_featured", {
  id: varchar("id", { length: 50 }).primaryKey(),
  publicationId: varchar("publication_id", { length: 50 }).notNull(),
  featuredStartDate: timestamp("featured_start_date").defaultNow().notNull(),
  featuredEndDate: timestamp("featured_end_date"),
  priority: integer("priority").default(0),
});

export const strategyAnalytics = pgTable("strategy_analytics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  totalTrades: integer("total_trades").default(0),
  profitFactor: doublePrecision("profit_factor").default(0),
  winRate: doublePrecision("win_rate").default(0),
  maxDrawdown: doublePrecision("max_drawdown").default(0),
  roi: doublePrecision("roi").default(0),
  sharpeRatio: doublePrecision("sharpe_ratio").default(0),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyAnalytics_strategyId_idx").on(table.strategyId)
          }));

export const strategyPerformanceSummary = pgTable("strategy_performance_summary", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  netProfit: doublePrecision("net_profit").default(0).notNull(),
  grossProfit: doublePrecision("gross_profit").default(0).notNull(),
  grossLoss: doublePrecision("gross_loss").default(0).notNull(),
  roi: doublePrecision("roi").default(0).notNull(),
  cagr: doublePrecision("cagr").default(0).notNull(),
  profitFactor: doublePrecision("profit_factor").default(0).notNull(),
  sharpeRatio: doublePrecision("sharpe_ratio").default(0).notNull(),
  sortinoRatio: doublePrecision("sortino_ratio").default(0).notNull(),
  calmarRatio: doublePrecision("calmar_ratio").default(0).notNull(),
  winRate: doublePrecision("win_rate").default(0).notNull(),
  lossRate: doublePrecision("loss_rate").default(0).notNull(),
  averageTrade: doublePrecision("average_trade").default(0).notNull(),
  recoveryFactor: doublePrecision("recovery_factor").default(0).notNull(),
  maxDrawdown: doublePrecision("max_drawdown").default(0).notNull(),
  averageHoldingTime: doublePrecision("average_holding_time").default(0).notNull(),
  capitalUtilization: doublePrecision("capital_utilization").default(0).notNull(),
  strategyStability: doublePrecision("strategy_stability").default(0).notNull(),
  executionEfficiency: doublePrecision("execution_efficiency").default(0).notNull(),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyPerformanceSummary_strategyId_idx").on(table.strategyId)
          }));

export const strategyDailyMetrics = pgTable("strategy_daily_metrics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  date: timestamp("date").notNull(),
  pnl: doublePrecision("pnl").default(0).notNull(),
  roi: doublePrecision("roi").default(0).notNull(),
  drawdown: doublePrecision("drawdown").default(0).notNull(),
  tradesCount: integer("trades_count").default(0).notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyDailyMetrics_strategyId_idx").on(table.strategyId)
          }));

export const strategyMonthlyMetrics = pgTable("strategy_monthly_metrics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  pnl: doublePrecision("pnl").default(0).notNull(),
  roi: doublePrecision("roi").default(0).notNull(),
  maxDrawdown: doublePrecision("max_drawdown").default(0).notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyMonthlyMetrics_strategyId_idx").on(table.strategyId)
          }));

export const strategyYearlyMetrics = pgTable("strategy_yearly_metrics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  year: integer("year").notNull(),
  pnl: doublePrecision("pnl").default(0).notNull(),
  roi: doublePrecision("roi").default(0).notNull(),
  maxDrawdown: doublePrecision("max_drawdown").default(0).notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyYearlyMetrics_strategyId_idx").on(table.strategyId)
          }));

export const strategyMetricHistory = pgTable("strategy_metric_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  metricValue: doublePrecision("metric_value").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyMetricHistory_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyMetricHistory_timestamp_idx").on(table.timestamp)
          }));

export const strategyAttribution = pgTable("strategy_attribution", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  entryLogicContribution: doublePrecision("entry_logic_contribution").default(0).notNull(),
  exitLogicContribution: doublePrecision("exit_logic_contribution").default(0).notNull(),
  riskEngineContribution: doublePrecision("risk_engine_contribution").default(0).notNull(),
  aiBrainContribution: doublePrecision("ai_brain_contribution").default(0).notNull(),
  optimizerContribution: doublePrecision("optimizer_contribution").default(0).notNull(),
  paperTradingContribution: doublePrecision("paper_trading_contribution").default(0).notNull(),
  marketConditionsContribution: doublePrecision("market_conditions_contribution").default(0).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyAttribution_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyAttribution_timestamp_idx").on(table.timestamp)
          }));

export const strategyComparison = pgTable("strategy_comparison", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyIdA: varchar("strategy_id_a", { length: 50 }).notNull(),
  strategyIdB: varchar("strategy_id_b", { length: 50 }).notNull(),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  valueA: doublePrecision("value_a"),
  valueB: doublePrecision("value_b"),
  comparisonResult: text("comparison_result"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("strategyComparison_timestamp_idx").on(table.timestamp)
          }));

export const strategyReports = pgTable("strategy_reports", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }),
  reportType: varchar("report_type", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  content: jsonb("content").notNull(),
  createdBy: varchar("created_by", { length: 100 }),
  createdTime: timestamp("created_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyReports_strategyId_idx").on(table.strategyId)
          }));

export const strategyDashboardCache = pgTable("strategy_dashboard_cache", {
  id: varchar("id", { length: 50 }).primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull(),
  data: jsonb("data").notNull(),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
});

export const strategyGovernance = pgTable("strategy_governance", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Draft"),
  riskLevel: varchar("risk_level", { length: 50 }),
  governanceScore: doublePrecision("governance_score").default(1.0),
  isCompliant: boolean("is_compliant").default(true),
  lastReviewDate: timestamp("last_review_date"),
  updatedBy: varchar("updated_by", { length: 100 }),
  updatedTime: timestamp("updated_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyGovernance_strategyId_idx").on(table.strategyId),
            statusIdx: index("strategyGovernance_status_idx").on(table.status)
          }));

export const strategyPolicies = pgTable("strategy_policies", {
  id: varchar("id", { length: 50 }).primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  minThreshold: doublePrecision("min_threshold"),
  maxThreshold: doublePrecision("max_threshold"),
  severity: varchar("severity", { length: 50 }).default("Warning"),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

export const strategyPolicyRules = pgTable("strategy_policy_rules", {
  id: varchar("id", { length: 50 }).primaryKey(),
  policyId: varchar("policy_id", { length: 50 }).notNull(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  operator: varchar("operator", { length: 50 }).notNull(),
  targetValue: varchar("target_value", { length: 100 }),
  errorMessage: text("error_message"),
});

export const strategyPermissions = pgTable("strategy_permissions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("Executor"),
  canEdit: boolean("can_edit").default(false).notNull(),
  canRun: boolean("can_run").default(false).notNull(),
  canApprove: boolean("can_approve").default(false).notNull(),
  grantedBy: varchar("granted_by", { length: 100 }),
  grantedTime: timestamp("granted_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyPermissions_strategyId_idx").on(table.strategyId)
          }));

export const strategyApprovals = pgTable("strategy_approvals", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  version: varchar("version", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull(),
  reviewerEmail: varchar("reviewer_email", { length: 255 }).notNull(),
  reviewerRole: varchar("reviewer_role", { length: 50 }),
  comments: text("comments"),
  decisionTime: timestamp("decision_time").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyApprovals_strategyId_idx").on(table.strategyId),
            statusIdx: index("strategyApprovals_status_idx").on(table.status)
          }));

export const strategyReviewRequests = pgTable("strategy_review_requests", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  requestedBy: varchar("requested_by", { length: 255 }).notNull(),
  assigneeEmail: varchar("assignee_email", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("Open"),
  notes: text("notes"),
  requestedTime: timestamp("requested_time").defaultNow().notNull(),
  completedTime: timestamp("completed_time"),
}, (table) => ({
            strategyIdIdx: index("strategyReviewRequests_strategyId_idx").on(table.strategyId),
            statusIdx: index("strategyReviewRequests_status_idx").on(table.status)
          }));

export const strategyReviewHistory = pgTable("strategy_review_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  requestId: varchar("request_id", { length: 50 }).notNull(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  reviewerEmail: varchar("reviewer_email", { length: 255 }).notNull(),
  reviewNotes: text("review_notes"),
  scoreAwarded: doublePrecision("score_awarded").default(1.0),
  decision: varchar("decision", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            requestIdIdx: index("strategyReviewHistory_requestId_idx").on(table.requestId),
            strategyIdIdx: index("strategyReviewHistory_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyReviewHistory_timestamp_idx").on(table.timestamp)
          }));

export const strategyCompliance = pgTable("strategy_compliance", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  policyId: varchar("policy_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Compliant"),
  measuredValue: doublePrecision("measured_value"),
  targetValue: doublePrecision("target_value"),
  checkTime: timestamp("check_time").defaultNow().notNull(),
  details: text("details"),
}, (table) => ({
            strategyIdIdx: index("strategyCompliance_strategyId_idx").on(table.strategyId),
            statusIdx: index("strategyCompliance_status_idx").on(table.status)
          }));


export const strategyAuditLogs = pgTable("strategy_audit_logs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }),
  action: varchar("action", { length: 100 }).notNull(),
  performedBy: varchar("performed_by", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  originalState: text("original_state"),
  newState: text("new_state"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyAuditLogs_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyAuditLogs_timestamp_idx").on(table.timestamp)
          }));

export const aiAchievements = pgTable("ai_achievements", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  criteria: jsonb("criteria").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiAchievements_createdAt_idx").on(table.createdAt)
          }));

export const aiModelAchievements = pgTable("ai_model_achievements", {
  id: varchar("id", { length: 50 }).primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  achievementId: varchar("achievement_id", { length: 50 }).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const strategyGovernanceHistory = pgTable("strategy_governance_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  previousStatus: varchar("previous_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }).notNull(),
  reason: text("reason"),
  changedBy: varchar("changed_by", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyGovernanceHistory_strategyId_idx").on(table.strategyId),
            timestampIdx: index("strategyGovernanceHistory_timestamp_idx").on(table.timestamp)
          }));

// =========================================================
// STAGE 16: ENTERPRISE LEARNING TRIGGER ENGINE TABLES
// =========================================================

export const learningTrigger = pgTable("learning_trigger", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("CREATED"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("learningTrigger_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("learningTrigger_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("learningTrigger_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("learningTrigger_correlationId_idx").on(table.correlationId),
            statusIdx: index("learningTrigger_status_idx").on(table.status),
            createdAtIdx: index("learningTrigger_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("learningTrigger_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("learningTrigger_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("learningTrigger_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const learningDispatch = pgTable("learning_dispatch", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  idempotencyKey: varchar("idempotency_key", { length: 100 }).notNull(),
  deliveryChannel: varchar("delivery_channel", { length: 100 }).default("RabbitMQ/Kafka"),
  dispatchStatus: varchar("dispatch_status", { length: 50 }).notNull().default("DISPATCHED"),
  payload: jsonb("payload").notNull(),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("learningDispatch_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("learningDispatch_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("learningDispatch_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("learningDispatch_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("learningDispatch_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("learningDispatch_updatedAt_idx").on(table.updatedAt)
          }));

export const learningAcknowledgement = pgTable("learning_acknowledgement", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  dispatchId: varchar("dispatch_id", { length: 100 }),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  ackStatus: varchar("ack_status", { length: 50 }).notNull().default("COMPLETED"),
  roundtripLatencyMs: integer("roundtrip_latency_ms").default(18),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("learningAcknowledgement_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("learningAcknowledgement_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("learningAcknowledgement_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("learningAcknowledgement_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("learningAcknowledgement_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("learningAcknowledgement_updatedAt_idx").on(table.updatedAt)
          }));

export const learningRetry = pgTable("learning_retry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  retryCount: integer("retry_count").default(1).notNull(),
  backoffDelayMs: integer("backoff_delay_ms").default(1000).notNull(),
  reason: text("reason"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("learningRetry_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("learningRetry_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("learningRetry_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("learningRetry_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("learningRetry_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("learningRetry_updatedAt_idx").on(table.updatedAt)
          }));

export const learningTriggerAudit = pgTable("learning_trigger_audit", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  action: varchar("action", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  details: text("details"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("learningTriggerAudit_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("learningTriggerAudit_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("learningTriggerAudit_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("learningTriggerAudit_correlationId_idx").on(table.correlationId),
            statusIdx: index("learningTriggerAudit_status_idx").on(table.status),
            createdAtIdx: index("learningTriggerAudit_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("learningTriggerAudit_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("learningTriggerAudit_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("learningTriggerAudit_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const learningTriggerEvent = pgTable("learning_trigger_event", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  source: varchar("source", { length: 100 }).default("LifecycleWorkspace"),
  destination: varchar("destination", { length: 100 }).default("LearningWorkspace"),
  payload: jsonb("payload").notNull(),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("learningTriggerEvent_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("learningTriggerEvent_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("learningTriggerEvent_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("learningTriggerEvent_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("learningTriggerEvent_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("learningTriggerEvent_updatedAt_idx").on(table.updatedAt)
          }));

export const learningDeadLetter = pgTable("learning_dead_letter", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  failureReason: text("failure_reason").notNull(),
  attemptsCount: integer("attempts_count").default(3).notNull(),
  status: varchar("status", { length: 50 }).default("DEAD_LETTER"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("learningDeadLetter_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("learningDeadLetter_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("learningDeadLetter_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("learningDeadLetter_correlationId_idx").on(table.correlationId),
            statusIdx: index("learningDeadLetter_status_idx").on(table.status),
            createdAtIdx: index("learningDeadLetter_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("learningDeadLetter_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("learningDeadLetter_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("learningDeadLetter_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

// =========================================================
// STAGE 17: ENTERPRISE EVOLUTION TRIGGER ENGINE TABLES
// =========================================================

export const evolutionTrigger = pgTable("evolution_trigger", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  learningReferenceId: varchar("learning_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("CREATED"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("evolutionTrigger_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("evolutionTrigger_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("evolutionTrigger_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("evolutionTrigger_correlationId_idx").on(table.correlationId),
            statusIdx: index("evolutionTrigger_status_idx").on(table.status),
            createdAtIdx: index("evolutionTrigger_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("evolutionTrigger_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("evolutionTrigger_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("evolutionTrigger_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const evolutionDispatch = pgTable("evolution_dispatch", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  learningReferenceId: varchar("learning_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  idempotencyKey: varchar("idempotency_key", { length: 100 }).notNull(),
  deliveryChannel: varchar("delivery_channel", { length: 100 }).default("RabbitMQ/Kafka"),
  dispatchStatus: varchar("dispatch_status", { length: 50 }).notNull().default("DISPATCHED"),
  payload: jsonb("payload").notNull(),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("evolutionDispatch_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("evolutionDispatch_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("evolutionDispatch_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("evolutionDispatch_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("evolutionDispatch_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("evolutionDispatch_updatedAt_idx").on(table.updatedAt)
          }));

export const evolutionAcknowledgement = pgTable("evolution_acknowledgement", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  dispatchId: varchar("dispatch_id", { length: 100 }),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  learningReferenceId: varchar("learning_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  ackStatus: varchar("ack_status", { length: 50 }).notNull().default("COMPLETED"),
  roundtripLatencyMs: integer("roundtrip_latency_ms").default(12),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("evolutionAcknowledgement_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("evolutionAcknowledgement_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("evolutionAcknowledgement_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("evolutionAcknowledgement_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("evolutionAcknowledgement_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("evolutionAcknowledgement_updatedAt_idx").on(table.updatedAt)
          }));

export const evolutionRetry = pgTable("evolution_retry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  learningReferenceId: varchar("learning_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  retryCount: integer("retry_count").default(1).notNull(),
  backoffDelayMs: integer("backoff_delay_ms").default(1000).notNull(),
  reason: text("reason"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("evolutionRetry_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("evolutionRetry_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("evolutionRetry_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("evolutionRetry_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("evolutionRetry_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("evolutionRetry_updatedAt_idx").on(table.updatedAt)
          }));

export const evolutionTriggerAudit = pgTable("evolution_trigger_audit", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  learningReferenceId: varchar("learning_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  action: varchar("action", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  details: text("details"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("evolutionTriggerAudit_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("evolutionTriggerAudit_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("evolutionTriggerAudit_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("evolutionTriggerAudit_correlationId_idx").on(table.correlationId),
            statusIdx: index("evolutionTriggerAudit_status_idx").on(table.status),
            createdAtIdx: index("evolutionTriggerAudit_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("evolutionTriggerAudit_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("evolutionTriggerAudit_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("evolutionTriggerAudit_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const evolutionTriggerEvent = pgTable("evolution_trigger_event", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  learningReferenceId: varchar("learning_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  source: varchar("source", { length: 100 }).default("LifecycleWorkspace"),
  destination: varchar("destination", { length: 100 }).default("EvolutionWorkspace"),
  payload: jsonb("payload").notNull(),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("evolutionTriggerEvent_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("evolutionTriggerEvent_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("evolutionTriggerEvent_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("evolutionTriggerEvent_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("evolutionTriggerEvent_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("evolutionTriggerEvent_updatedAt_idx").on(table.updatedAt)
          }));

export const evolutionDeadLetter = pgTable("evolution_dead_letter", {
  id: varchar("id", { length: 100 }).primaryKey(),
  triggerId: varchar("trigger_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  learningReferenceId: varchar("learning_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  failureReason: text("failure_reason").notNull(),
  attemptsCount: integer("attempts_count").default(3).notNull(),
  status: varchar("status", { length: 50 }).default("DEAD_LETTER"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("evolutionDeadLetter_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("evolutionDeadLetter_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("evolutionDeadLetter_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("evolutionDeadLetter_correlationId_idx").on(table.correlationId),
            statusIdx: index("evolutionDeadLetter_status_idx").on(table.status),
            createdAtIdx: index("evolutionDeadLetter_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("evolutionDeadLetter_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("evolutionDeadLetter_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("evolutionDeadLetter_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const lifecycleCompletion = pgTable("lifecycle_completion", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-LIFECYCLE-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }).notNull(),
  tradeJournalId: varchar("trade_journal_id", { length: 50 }).notNull(),
  performanceReferenceId: varchar("performance_reference_id", { length: 50 }).notNull(),
  learningReferenceId: varchar("learning_reference_id", { length: 50 }).notNull(),
  evolutionReferenceId: varchar("evolution_reference_id", { length: 50 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  completionStatus: varchar("completion_status", { length: 50 }).notNull().default("COMPLETED"),
  isLocked: integer("is_locked").default(1).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("lifecycleCompletion_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("lifecycleCompletion_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("lifecycleCompletion_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("lifecycleCompletion_correlationId_idx").on(table.correlationId),
            completedAtIdx: index("lifecycleCompletion_completedAt_idx").on(table.completedAt),
            createdAtIdx: index("lifecycleCompletion_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("lifecycleCompletion_updatedAt_idx").on(table.updatedAt)
          }));

export const qaTestSuite = pgTable("qa_test_suite", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-QA-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull().default("MOD-001"),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  domain: varchar("domain", { length: 100 }).notNull(),
  suiteName: varchar("suite_name", { length: 150 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("PASSED"),
  passedCount: integer("passed_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  totalCount: integer("total_count").notNull().default(0),
  executionTimeMs: integer("execution_time_ms").notNull().default(0),
  correlationId: varchar("correlation_id", { length: 100 }),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("qaTestSuite_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("qaTestSuite_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("qaTestSuite_portfolioId_idx").on(table.portfolioId),
            statusIdx: index("qaTestSuite_status_idx").on(table.status),
            correlationIdIdx: index("qaTestSuite_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("qaTestSuite_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("qaTestSuite_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("qaTestSuite_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("qaTestSuite_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const qaDomainResult = pgTable("qa_domain_result", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-QA-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull().default("MOD-001"),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  domainNumber: integer("domain_number").notNull(),
  domainName: varchar("domain_name", { length: 150 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("PASSED"),
  scorePercent: integer("score_percent").notNull().default(100),
  details: text("details"),
  correlationId: varchar("correlation_id", { length: 100 }),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("qaDomainResult_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("qaDomainResult_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("qaDomainResult_portfolioId_idx").on(table.portfolioId),
            statusIdx: index("qaDomainResult_status_idx").on(table.status),
            correlationIdIdx: index("qaDomainResult_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("qaDomainResult_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("qaDomainResult_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("qaDomainResult_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("qaDomainResult_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const qaCertificationReport = pgTable("qa_certification_report", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-QA-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull().default("MOD-ALL"),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  reportTitle: varchar("report_title", { length: 200 }).notNull().default("AI ARINA Enterprise OS V2.0 QA Certification"),
  overallStatus: varchar("overall_status", { length: 50 }).notNull().default("PASSED_CERTIFIED"),
  domainsVerifiedCount: integer("domains_verified_count").notNull().default(15),
  stagesVerifiedCount: integer("stages_verified_count").notNull().default(17),
  totalTestsRun: integer("total_tests_run").notNull().default(340),
  totalTestsPassed: integer("total_tests_passed").notNull().default(340),
  totalTestsFailed: integer("total_tests_failed").notNull().default(0),
  certificationTimestamp: timestamp("certification_timestamp").defaultNow().notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  version: varchar("version", { length: 20 }).notNull().default("2.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("qaCertificationReport_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("qaCertificationReport_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("qaCertificationReport_portfolioId_idx").on(table.portfolioId),
            correlationIdIdx: index("qaCertificationReport_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("qaCertificationReport_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("qaCertificationReport_updatedAt_idx").on(table.updatedAt)
          }));

export const qaAuditLog = pgTable("qa_audit_log", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-QA-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull().default("MOD-001"),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  action: varchar("action", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  details: text("details"),
  correlationId: varchar("correlation_id", { length: 100 }),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("qaAuditLog_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("qaAuditLog_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("qaAuditLog_portfolioId_idx").on(table.portfolioId),
            statusIdx: index("qaAuditLog_status_idx").on(table.status),
            correlationIdIdx: index("qaAuditLog_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("qaAuditLog_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("qaAuditLog_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("qaAuditLog_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("qaAuditLog_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const systemBootTable = pgTable("system_boot", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  bootId: varchar("boot_id", { length: 100 }).notNull(),
  genesisSessionId: varchar("genesis_session_id", { length: 100 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("BOOTING"),
  configVersion: varchar("config_version", { length: 20 }).notNull().default("2.0.0"),
  dbVersion: varchar("db_version", { length: 20 }).notNull().default("2.0.0"),
  workspacesRegisteredCount: integer("workspaces_registered_count").notNull().default(0),
  aiModelsRegisteredCount: integer("ai_models_registered_count").notNull().default(0),
  walletsInitializedCount: integer("wallets_initialized_count").notNull().default(0),
  tradingLockStatus: varchar("trading_lock_status", { length: 50 }).notNull().default("LOCKED"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            correlationIdIdx: index("systemBootTable_correlationId_idx").on(table.correlationId),
            statusIdx: index("systemBootTable_status_idx").on(table.status),
            createdAtIdx: index("systemBootTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("systemBootTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("systemBootTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const genesisSessionTable = pgTable("genesis_session", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  bootId: varchar("boot_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("INITIATED"),
  zeroStateConfirmed: boolean("zero_state_confirmed").notNull().default(false),
  auditHash: varchar("audit_hash", { length: 128 }).notNull(),
  initiatedBy: varchar("initiated_by", { length: 100 }).notNull().default("SYSTEM_BOOT_PROCESS"),
  details: text("details"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("genesisSessionTable_status_idx").on(table.status),
            createdAtIdx: index("genesisSessionTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("genesisSessionTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("genesisSessionTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const systemStateTable = pgTable("system_state", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  systemStatus: varchar("system_status", { length: 50 }).notNull().default("ZERO_STATE_READY"),
  tradingLockActive: boolean("trading_lock_active").notNull().default(true),
  aiActivationAllowed: boolean("ai_activation_allowed").notNull().default(false),
  activeAiModelsCount: integer("active_ai_models_count").notNull().default(0),
  totalAiModelsCount: integer("total_ai_models_count").notNull().default(28),
  totalCapitalATM: numeric("total_capital_atm", { precision: 28, scale: 8 }).notNull().default("0.00000000"),
  totalReservedCapitalATM: numeric("total_reserved_capital_atm", { precision: 28, scale: 8 }).notNull().default("0.00000000"),
  totalMarginATM: numeric("total_margin_atm", { precision: 28, scale: 8 }).notNull().default("0.00000000"),
  activeOrdersCount: integer("active_orders_count").notNull().default(0),
  activePositionsCount: integer("active_positions_count").notNull().default(0),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("systemStateTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("systemStateTable_updatedAt_idx").on(table.updatedAt)
          }));

export const workspaceRegistryTable = pgTable("workspace_registry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull(),
  workspaceName: varchar("workspace_name", { length: 100 }).notNull(),
  responsibility: text("responsibility").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("REGISTERED"),
  isFactoryDefault: boolean("is_factory_default").notNull().default(true),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("workspaceRegistryTable_status_idx").on(table.status),
            createdAtIdx: index("workspaceRegistryTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("workspaceRegistryTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("workspaceRegistryTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const aiRegistryTable = pgTable("ai_registry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull(),
  modelNumber: integer("model_number").notNull(),
  modelName: varchar("model_name", { length: 100 }).notNull(),
  strategyType: varchar("strategy_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("OFF"),
  lifecycleState: varchar("lifecycle_state", { length: 50 }).notNull().default("IDLE"),
  walletBalanceATM: numeric("wallet_balance_atm", { precision: 28, scale: 8 }).notNull().default("0.00000000"),
  portfolioValueATM: numeric("portfolio_value_atm", { precision: 28, scale: 8 }).notNull().default("0.00000000"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("aiRegistryTable_status_idx").on(table.status),
            createdAtIdx: index("aiRegistryTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiRegistryTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("aiRegistryTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const walletRegistryTable = pgTable("wallet_registry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull(),
  walletType: varchar("wallet_type", { length: 50 }).notNull(),
  ownerEntityId: varchar("owner_entity_id", { length: 100 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("ATM"),
  balance: numeric("balance", { precision: 28, scale: 8 }).notNull().default("0.00000000"),
  reservedBalance: numeric("reserved_balance", { precision: 28, scale: 8 }).notNull().default("0.00000000"),
  usedBalance: numeric("used_balance", { precision: 28, scale: 8 }).notNull().default("0.00000000"),
  status: varchar("status", { length: 50 }).notNull().default("ZERO_STATE_INITIALIZED"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("walletRegistryTable_status_idx").on(table.status),
            createdAtIdx: index("walletRegistryTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("walletRegistryTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("walletRegistryTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const bootAuditTable = pgTable("boot_audit", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  genesisSessionId: varchar("genesis_session_id", { length: 100 }).notNull(),
  bootId: varchar("boot_id", { length: 100 }).notNull(),
  workspaceCount: integer("workspace_count").notNull().default(11),
  aiModelCount: integer("ai_model_count").notNull().default(28),
  walletCount: integer("wallet_count").notNull().default(8),
  configVersion: varchar("config_version", { length: 20 }).notNull().default("2.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  auditHash: varchar("audit_hash", { length: 128 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("bootAuditTable_timestamp_idx").on(table.timestamp),
            createdAtIdx: index("bootAuditTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("bootAuditTable_updatedAt_idx").on(table.updatedAt)
          }));

export const systemEventsTable = pgTable("system_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  sourceModule: varchar("source_module", { length: 100 }).notNull().default("GENESIS_ENGINE"),
  payload: text("payload").notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            correlationIdIdx: index("systemEventsTable_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("systemEventsTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("systemEventsTable_updatedAt_idx").on(table.updatedAt)
          }));

export const bootEventsTable = pgTable("boot_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  sourceModule: varchar("source_module", { length: 100 }).notNull().default("GENESIS_ENGINE"),
  payload: text("payload").notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            correlationIdIdx: index("bootEventsTable_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("bootEventsTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("bootEventsTable_updatedAt_idx").on(table.updatedAt)
          }));

export const qaBenchmarkRecord = pgTable("qa_benchmark_record", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-QA-01"),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull().default("MOD-001"),
  walletId: varchar("wallet_id", { length: 50 }),
  portfolioId: varchar("portfolio_id", { length: 50 }),
  positionId: varchar("position_id", { length: 50 }),
  lifecycleId: varchar("lifecycle_id", { length: 50 }),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  metricValue: varchar("metric_value", { length: 100 }).notNull(),
  targetThreshold: varchar("target_threshold", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("PASSED"),
  correlationId: varchar("correlation_id", { length: 100 }),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("qaBenchmarkRecord_aiModelId_idx").on(table.aiModelId),
            walletIdIdx: index("qaBenchmarkRecord_walletId_idx").on(table.walletId),
            portfolioIdIdx: index("qaBenchmarkRecord_portfolioId_idx").on(table.portfolioId),
            statusIdx: index("qaBenchmarkRecord_status_idx").on(table.status),
            correlationIdIdx: index("qaBenchmarkRecord_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("qaBenchmarkRecord_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("qaBenchmarkRecord_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("qaBenchmarkRecord_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("qaBenchmarkRecord_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const marketStateTable = pgTable("market_state", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-MKT-03"),
  exchangeCode: varchar("exchange_code", { length: 20 }).notNull(),
  exchangeName: varchar("exchange_name", { length: 100 }).notNull(),
  exchangeStatus: varchar("exchange_status", { length: 50 }).notNull().default("ACTIVE"),
  tradingSession: varchar("trading_session", { length: 50 }).notNull().default("CLOSED"),
  marketAvailability: varchar("market_availability", { length: 50 }).notNull().default("AVAILABLE"),
  marketCalendarStatus: varchar("market_calendar_status", { length: 50 }).notNull().default("VERIFIED"),
  currentState: varchar("current_state", { length: 50 }).notNull().default("CLOSED"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("marketStateTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("marketStateTable_updatedAt_idx").on(table.updatedAt)
          }));

export const tradingCalendarTable = pgTable("trading_calendar", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-MKT-03"),
  exchangeCode: varchar("exchange_code", { length: 20 }).notNull(),
  calendarDate: varchar("calendar_date", { length: 20 }).notNull(),
  isTradingDay: boolean("is_trading_day").notNull().default(true),
  isHoliday: boolean("is_holiday").notNull().default(false),
  holidayName: varchar("holiday_name", { length: 100 }),
  isSettlementDay: boolean("is_settlement_day").notNull().default(true),
  isExpiryDay: boolean("is_expiry_day").notNull().default(false),
  isSpecialSession: boolean("is_special_session").notNull().default(false),
  isMaintenanceWindow: boolean("is_maintenance_window").notNull().default(false),
  isEarlyClose: boolean("is_early_close").notNull().default(false),
  noTradingWindowActive: boolean("no_trading_window_active").notNull().default(false),
  status: varchar("status", { length: 50 }).notNull().default("VERIFIED"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("tradingCalendarTable_status_idx").on(table.status),
            createdAtIdx: index("tradingCalendarTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("tradingCalendarTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("tradingCalendarTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const masterRegistryTable = pgTable("master_registry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  masterType: varchar("master_type", { length: 100 }).notNull(),
  masterName: varchar("master_name", { length: 100 }).notNull(),
  recordCount: integer("record_count").notNull().default(0),
  duplicateCount: integer("duplicate_count").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("VALIDATED"),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("masterRegistryTable_status_idx").on(table.status),
            createdAtIdx: index("masterRegistryTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("masterRegistryTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("masterRegistryTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const runtimeLockTable = pgTable("runtime_lock", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  runtimeName: varchar("runtime_name", { length: 100 }).notNull(),
  runtimeType: varchar("runtime_type", { length: 100 }).notNull(),
  lockStatus: varchar("lock_status", { length: 50 }).notNull().default("LOCKED"),
  unlockedAt: timestamp("unlocked_at"),
  lockedBy: varchar("locked_by", { length: 100 }).notNull().default("GENESIS_RUNTIME_LOCK_ENGINE"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("runtimeLockTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("runtimeLockTable_updatedAt_idx").on(table.updatedAt)
          }));

export const recoverySessionTable = pgTable("recovery_session", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  bootId: varchar("boot_id", { length: 100 }).notNull(),
  recoveryMode: varchar("recovery_mode", { length: 50 }).notNull().default("STANDBY"),
  safeModeActive: boolean("safe_mode_active").notNull().default(false),
  rollbackSupported: boolean("rollback_supported").notNull().default(true),
  configRecoveryStatus: varchar("config_recovery_status", { length: 50 }).notNull().default("VERIFIED"),
  workspaceRecoveryStatus: varchar("workspace_recovery_status", { length: 50 }).notNull().default("VERIFIED"),
  databaseRecoveryStatus: varchar("database_recovery_status", { length: 50 }).notNull().default("VERIFIED"),
  auditTrailStatus: varchar("audit_trail_status", { length: 50 }).notNull().default("HEALTHY"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("recoverySessionTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("recoverySessionTable_updatedAt_idx").on(table.updatedAt)
          }));

export const startupChecklistTable = pgTable("startup_checklist", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-GENESIS-01"),
  bootId: varchar("boot_id", { length: 100 }).notNull(),
  checkName: varchar("check_name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("PASSED"),
  details: text("details"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("startupChecklistTable_status_idx").on(table.status),
            createdAtIdx: index("startupChecklistTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("startupChecklistTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("startupChecklistTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// ====================================================
// EP02: ENTERPRISE TREASURY & ATM CURRENCY SCHEMAS
// ====================================================

// Module 1 & 2: Enterprise Treasury Vault
export const treasuryTable = pgTable("treasury", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-TREASURY-01"),
  totalMintedAtm: numeric("total_minted_atm", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  reservedAtm: numeric("reserved_atm", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  allocatedAtm: numeric("allocated_atm", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  availableAtm: numeric("available_atm", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"), // ACTIVE, LOCKED, STANDBY
  healthScore: integer("health_score").notNull().default(100),
  currencyCode: varchar("currency_code", { length: 20 }).notNull().default("ATM"),
  currencySymbol: varchar("currency_symbol", { length: 10 }).notNull().default("ATM"),
  inrConversionRate: numeric("inr_conversion_rate", { precision: 10, scale: 4 }).notNull().default("1.0000"), // Fixed 1 ATM = ₹1
  dailyCapitalLimitAtm: numeric("daily_capital_limit_atm", { precision: 20, scale: 4 }).notNull().default("10000000.0000"),
  monthlyCapitalLimitAtm: numeric("monthly_capital_limit_atm", { precision: 20, scale: 4 }).notNull().default("100000000.0000"),
  perAiLimitAtm: numeric("per_ai_limit_atm", { precision: 20, scale: 4 }).notNull().default("1000000.0000"),
  perPortfolioLimitAtm: numeric("per_portfolio_limit_atm", { precision: 20, scale: 4 }).notNull().default("5000000.0000"),
  emergencyStopLimitAtm: numeric("emergency_stop_limit_atm", { precision: 20, scale: 4 }).notNull().default("50000000.0000"),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).notNull().default("2.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("treasuryTable_status_idx").on(table.status),
            createdAtIdx: index("treasuryTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("treasuryTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("treasuryTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// Module 2: Enterprise Treasury Transactional Ledger
export const treasuryLedgerTable = pgTable("treasury_ledger", {
  id: varchar("id", { length: 100 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("TNT-MAIN-001"),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull().default("WKS-TREASURY-01"),
  entryType: varchar("entry_type", { length: 50 }).notNull(), // MINT, ALLOCATE, RESERVE, RELEASE, WALLET_FUNDING
  amountAtm: numeric("amount_atm", { precision: 20, scale: 4 }).notNull(),
  amountInrReference: numeric("amount_inr_reference", { precision: 20, scale: 4 }).notNull(),
  balanceAfterAtm: numeric("balance_after_atm", { precision: 20, scale: 4 }).notNull(),
  sourceAccount: varchar("source_account", { length: 100 }).notNull(),
  destinationAccount: varchar("destination_account", { length: 100 }).notNull(),
  description: text("description"),
  performedBy: varchar("performed_by", { length: 100 }).notNull().default("TREASURY_ENGINE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("treasuryLedgerTable_createdAt_idx").on(table.createdAt)
          }));

// Module 3: Enterprise Capital Mint Engine
export const capitalMintTable = pgTable("capital_mint", {
  id: varchar("id", { length: 100 }).primaryKey(),
  mintId: varchar("mint_id", { length: 100 }).notNull().unique(),
  capitalBatchId: varchar("capital_batch_id", { length: 100 }).notNull(),
  amountAtm: numeric("amount_atm", { precision: 20, scale: 4 }).notNull(),
  purpose: varchar("purpose", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("MINTED"), // APPROVED, AUTHORIZED, MINTED, REJECTED
  authorizedBy: varchar("authorized_by", { length: 100 }).notNull().default("TREASURY_CHIEF_OFFICER"),
  certificateHash: varchar("certificate_hash", { length: 128 }).notNull(),
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("capitalMintTable_status_idx").on(table.status),
            createdAtIdx: index("capitalMintTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("capitalMintTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// Module 4: Enterprise Capital Allocation
export const capitalAllocationTable = pgTable("capital_allocation", {
  id: varchar("id", { length: 100 }).primaryKey(),
  allocationId: varchar("allocation_id", { length: 100 }).notNull().unique(),
  targetType: varchar("target_type", { length: 50 }).notNull(), // AI_MODEL, WALLET, PORTFOLIO
  targetId: varchar("target_id", { length: 100 }).notNull(),
  amountAtm: numeric("amount_atm", { precision: 20, scale: 4 }).notNull(),
  allocatedBy: varchar("allocated_by", { length: 100 }).notNull().default("TREASURY_ALLOCATION_ENGINE"),
  dailyLimitAtm: numeric("daily_limit_atm", { precision: 20, scale: 4 }),
  monthlyLimitAtm: numeric("monthly_limit_atm", { precision: 20, scale: 4 }),
  status: varchar("status", { length: 50 }).notNull().default("APPROVED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("capitalAllocationTable_status_idx").on(table.status),
            createdAtIdx: index("capitalAllocationTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("capitalAllocationTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// Module 6: Enterprise Capital Reservation
export const capitalReservationTable = pgTable("capital_reservation", {
  id: varchar("id", { length: 100 }).primaryKey(),
  reservationId: varchar("reservation_id", { length: 100 }).notNull().unique(),
  reservationType: varchar("reservation_type", { length: 50 }).notNull(), // ATM, MARGIN, RISK_RESERVE, EMERGENCY_RESERVE
  amountAtm: numeric("amount_atm", { precision: 20, scale: 4 }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"), // ACTIVE, RELEASED, EXPIRED
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("capitalReservationTable_status_idx").on(table.status),
            createdAtIdx: index("capitalReservationTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("capitalReservationTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// Module 7: Enterprise Capital Release
export const capitalReleaseTable = pgTable("capital_release", {
  id: varchar("id", { length: 100 }).primaryKey(),
  releaseId: varchar("release_id", { length: 100 }).notNull().unique(),
  reservationId: varchar("reservation_id", { length: 100 }),
  amountAtm: numeric("amount_atm", { precision: 20, scale: 4 }).notNull(),
  releaseType: varchar("release_type", { length: 50 }).notNull(), // UNUSED_FUNDS, MARGIN, CANCELLED_ORDER, EXPIRED_RESERVATION, SETTLEMENT
  releasedBy: varchar("released_by", { length: 100 }).notNull().default("TREASURY_RELEASE_ENGINE"),
  reason: varchar("reason", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("capitalReleaseTable_createdAt_idx").on(table.createdAt)
          }));

// Module 5: Enterprise Wallet Funding Engine
export const walletFundingTable = pgTable("wallet_funding", {
  id: varchar("id", { length: 100 }).primaryKey(),
  fundingId: varchar("funding_id", { length: 100 }).notNull().unique(),
  walletType: varchar("wallet_type", { length: 50 }).notNull(), // PAPER_WALLET, AI_WALLET, RESERVE_WALLET, MARGIN_WALLET, PROFIT_WALLET, LOSS_WALLET, FEE_WALLET
  walletAddress: varchar("wallet_address", { length: 100 }).notNull(),
  amountAtm: numeric("amount_atm", { precision: 20, scale: 4 }).notNull(),
  fundedBy: varchar("funded_by", { length: 100 }).notNull().default("TREASURY_WALLET_ENGINE"),
  txHash: varchar("tx_hash", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("walletFundingTable_createdAt_idx").on(table.createdAt)
          }));

// Module 11: Enterprise Treasury Events
export const treasuryEventsTable = pgTable("treasury_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  eventId: varchar("event_id", { length: 100 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // CapitalMinted, CapitalAllocated, CapitalReserved, CapitalReleased, WalletFunded, AllocationRejected, TreasuryLocked, TreasuryUnlocked
  payload: jsonb("payload").notNull(),
  publishedBy: varchar("published_by", { length: 100 }).notNull().default("TREASURY_EVENT_BUS"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("treasuryEventsTable_createdAt_idx").on(table.createdAt)
          }));

// Module 2 & 9: Enterprise Treasury Audit Log
export const treasuryAuditTable = pgTable("treasury_audit", {
  id: varchar("id", { length: 100 }).primaryKey(),
  auditId: varchar("audit_id", { length: 100 }).notNull().unique(),
  action: varchar("action", { length: 100 }).notNull(),
  actor: varchar("actor", { length: 100 }).notNull().default("SYSTEM"),
  details: jsonb("details").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            auditIdIdx: index("treasuryAuditTable_auditId_idx").on(table.auditId),
            createdAtIdx: index("treasuryAuditTable_createdAt_idx").on(table.createdAt)
          }));

// Module 14: Boot Performance Metrics (EP01 Polish)
export const bootPerformanceMetricsTable = pgTable("boot_performance_metrics", {
  id: varchar("id", { length: 100 }).primaryKey(),
  bootId: varchar("boot_id", { length: 100 }).notNull(),
  bootDurationMs: integer("boot_duration_ms").notNull(),
  genesisDurationMs: integer("genesis_duration_ms").notNull(),
  validationDurationMs: integer("validation_duration_ms").notNull(),
  runtimeInitDurationMs: integer("runtime_init_duration_ms").notNull(),
  systemStartupDurationMs: integer("system_startup_duration_ms").notNull(),
  cpuUsagePercent: doublePrecision("cpu_usage_percent").notNull(),
  memoryUsageMb: doublePrecision("memory_usage_mb").notNull(),
  activeServicesCount: integer("active_services_count").notNull(),
  totalServicesCount: integer("total_services_count").notNull(),
  genesisHealthScore: integer("genesis_health_score").notNull().default(100),
  startupCertificateHash: varchar("startup_certificate_hash", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("bootPerformanceMetricsTable_createdAt_idx").on(table.createdAt)
          }));

// Module 14: Genesis Version & Boot History (EP01 Polish)
export const genesisVersionHistoryTable = pgTable("genesis_version_history", {
  id: varchar("id", { length: 100 }).primaryKey(),
  version: varchar("version", { length: 50 }).notNull(),
  eventCategory: varchar("event_category", { length: 50 }).notNull(), // GENESIS_VERSION, BOOT, UPGRADE, RESTART
  description: text("description").notNull(),
  performedBy: varchar("performed_by", { length: 100 }).notNull().default("GENESIS_BOOT_ENGINE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("genesisVersionHistoryTable_createdAt_idx").on(table.createdAt)
          }));

// ====================================================
// EP02.1: ENTERPRISE TREASURY COMPLETION ENGINE SCHEMAS
// ====================================================

// Module 16: Capital Lifecycle Table
export const treasuryLifecycleTable = pgTable("treasury_lifecycle", {
  id: varchar("id", { length: 100 }).primaryKey(),
  capitalId: varchar("capital_id", { length: 100 }).notNull().unique(),
  batchId: varchar("batch_id", { length: 100 }).notNull(),
  amountAtm: numeric("amount_atm", { precision: 20, scale: 4 }).notNull(),
  currentStage: varchar("current_stage", { length: 50 }).notNull().default("CREATED"), // CREATED, VAULT, ALLOCATED, FUNDED, RESERVED, TRADING, SETTLEMENT, PROFIT_LOSS, ACCOUNTING, RECONCILIATION, CLOSED, ARCHIVE
  history: jsonb("history").notNull().default([]),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("treasuryLifecycleTable_status_idx").on(table.status),
            createdAtIdx: index("treasuryLifecycleTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("treasuryLifecycleTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("treasuryLifecycleTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// Module 17: Treasury State History Table
export const treasuryStateHistoryTable = pgTable("treasury_state_history", {
  id: varchar("id", { length: 100 }).primaryKey(),
  capitalId: varchar("capital_id", { length: 100 }).notNull(),
  previousState: varchar("previous_state", { length: 50 }).notNull(),
  newState: varchar("new_state", { length: 50 }).notNull(),
  transitionBy: varchar("transition_by", { length: 100 }).notNull().default("STATE_MACHINE_ENGINE"),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("treasuryStateHistoryTable_createdAt_idx").on(table.createdAt)
          }));

// Module 18: Enterprise AI Funding Policy Table
export const aiFundingPolicyTable = pgTable("ai_funding_policy", {
  id: varchar("id", { length: 100 }).primaryKey(),
  aiModelId: varchar("ai_model_id", { length: 100 }).notNull().unique(),
  minAtm: numeric("min_atm", { precision: 20, scale: 4 }).notNull().default("1000.0000"),
  maxAtm: numeric("max_atm", { precision: 20, scale: 4 }).notNull().default("1000000.0000"),
  dailyFundingLimitAtm: numeric("daily_funding_limit_atm", { precision: 20, scale: 4 }).notNull().default("100000.0000"),
  weeklyFundingLimitAtm: numeric("weekly_funding_limit_atm", { precision: 20, scale: 4 }).notNull().default("500000.0000"),
  monthlyFundingLimitAtm: numeric("monthly_funding_limit_atm", { precision: 20, scale: 4 }).notNull().default("2000000.0000"),
  fundingFrequencyHours: integer("funding_frequency_hours").notNull().default(24),
  requiresApproval: boolean("requires_approval").notNull().default(true),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("aiFundingPolicyTable_aiModelId_idx").on(table.aiModelId),
            createdAtIdx: index("aiFundingPolicyTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiFundingPolicyTable_updatedAt_idx").on(table.updatedAt)
          }));

// Module 19: Paper / Live Treasury Isolation Table
export const paperLiveTreasuryTable = pgTable("paper_live_treasury", {
  id: varchar("id", { length: 100 }).primaryKey(),
  mode: varchar("mode", { length: 20 }).notNull().unique(), // PAPER or LIVE
  totalMintedAtm: numeric("total_minted_atm", { precision: 20, scale: 4 }).notNull().default("1000000.0000"),
  reservedAtm: numeric("reserved_atm", { precision: 20, scale: 4 }).notNull().default("100000.0000"),
  allocatedAtm: numeric("allocated_atm", { precision: 20, scale: 4 }).notNull().default("200000.0000"),
  availableAtm: numeric("available_atm", { precision: 20, scale: 4 }).notNull().default("700000.0000"),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("paperLiveTreasuryTable_status_idx").on(table.status),
            createdAtIdx: index("paperLiveTreasuryTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("paperLiveTreasuryTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("paperLiveTreasuryTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// Module 20: Enterprise Treasury Certificates Table
export const treasuryCertificatesTable = pgTable("treasury_certificates", {
  id: varchar("id", { length: 100 }).primaryKey(),
  certificateId: varchar("certificate_id", { length: 100 }).notNull().unique(),
  certType: varchar("cert_type", { length: 50 }).notNull(), // MINT, ALLOCATION, WALLET_FUNDING, RESERVATION, RELEASE, SETTLEMENT, CLOSE
  treasuryId: varchar("treasury_id", { length: 100 }).notNull().default("TREASURY-VAULT-MAIN"),
  walletId: varchar("wallet_id", { length: 100 }),
  aiModelId: varchar("ai_model_id", { length: 100 }),
  amountAtm: numeric("amount_atm", { precision: 20, scale: 4 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sha256Hash: varchar("sha256_hash", { length: 128 }).notNull(),
  digitalSignature: varchar("digital_signature", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            certificateIdIdx: index("treasuryCertificatesTable_certificateId_idx").on(table.certificateId),
            walletIdIdx: index("treasuryCertificatesTable_walletId_idx").on(table.walletId),
            aiModelIdIdx: index("treasuryCertificatesTable_aiModelId_idx").on(table.aiModelId),
            timestampIdx: index("treasuryCertificatesTable_timestamp_idx").on(table.timestamp),
            createdAtIdx: index("treasuryCertificatesTable_createdAt_idx").on(table.createdAt)
          }));

// Module 21: Capital Flow Inspector Table
export const capitalFlowInspectorTable = pgTable("capital_flow_inspector", {
  id: varchar("id", { length: 100 }).primaryKey(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull().unique(),
  amountAtm: numeric("amount_atm", { precision: 20, scale: 4 }).notNull(),
  currentStage: varchar("current_stage", { length: 50 }).notNull(), // Treasury, Wallet, Reserve, Trading, Settlement, Accounting, Treasury Return
  status: varchar("status", { length: 50 }).notNull().default("IN_PROGRESS"), // IN_PROGRESS, COMPLETED, FAILED
  traceData: jsonb("trace_data").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            correlationIdIdx: index("capitalFlowInspectorTable_correlationId_idx").on(table.correlationId),
            statusIdx: index("capitalFlowInspectorTable_status_idx").on(table.status),
            createdAtIdx: index("capitalFlowInspectorTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("capitalFlowInspectorTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("capitalFlowInspectorTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

// Module 23: Enterprise Emergency Treasury Log Table
export const treasuryEmergencyLogTable = pgTable("treasury_emergency_log", {
  id: varchar("id", { length: 100 }).primaryKey(),
  action: varchar("action", { length: 100 }).notNull(), // EMERGENCY_FREEZE, EMERGENCY_UNLOCK, EMERGENCY_ALLOCATION, EMERGENCY_STOP, TREASURY_RECOVERY
  actor: varchar("actor", { length: 100 }).notNull().default("TREASURY_CHIEF_OFFICER"),
  details: jsonb("details").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("treasuryEmergencyLogTable_createdAt_idx").on(table.createdAt)
          }));

// Module 24: Enterprise Capital Reconciliation Table
export const capitalReconciliationTable = pgTable("capital_reconciliation", {
  id: varchar("id", { length: 100 }).primaryKey(),
  reportId: varchar("report_id", { length: 100 }).notNull().unique(),
  treasuryAtm: numeric("treasury_atm", { precision: 20, scale: 4 }).notNull(),
  walletAtm: numeric("wallet_atm", { precision: 20, scale: 4 }).notNull(),
  accountingAtm: numeric("accounting_atm", { precision: 20, scale: 4 }).notNull(),
  ledgerAtm: numeric("ledger_atm", { precision: 20, scale: 4 }).notNull(),
  portfolioAtm: numeric("portfolio_atm", { precision: 20, scale: 4 }).notNull(),
  journalAtm: numeric("journal_atm", { precision: 20, scale: 4 }).notNull(),
  executionAtm: numeric("execution_atm", { precision: 20, scale: 4 }).notNull(),
  settlementAtm: numeric("settlement_atm", { precision: 20, scale: 4 }).notNull(),
  isReconciled: boolean("is_reconciled").notNull().default(true),
  auditSummary: text("audit_summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("capitalReconciliationTable_createdAt_idx").on(table.createdAt)
          }));

// Module 25: Enterprise Indian Market Capital Policy Table
export const indianMarketPolicyTable = pgTable("indian_market_policy", {
  id: varchar("id", { length: 100 }).primaryKey(),
  segment: varchar("segment", { length: 50 }).notNull().unique(), // NSE_EQUITY, ETF, INDEX, STOCK_FUTURES, INDEX_FUTURES, STOCK_OPTIONS, INDEX_OPTIONS, MCX_COMMODITY
  segmentName: varchar("segment_name", { length: 100 }).notNull(),
  minCapitalAtm: numeric("min_capital_atm", { precision: 20, scale: 4 }).notNull(),
  maxCapitalAtm: numeric("max_capital_atm", { precision: 20, scale: 4 }).notNull(),
  reservePolicyPercent: numeric("reserve_policy_percent", { precision: 5, scale: 2 }).notNull().default("10.00"),
  marginPolicyPercent: numeric("margin_policy_percent", { precision: 5, scale: 2 }).notNull().default("20.00"),
  settlementPolicy: varchar("settlement_policy", { length: 50 }).notNull().default("T+1"),
  exposureLimitAtm: numeric("exposure_limit_atm", { precision: 20, scale: 4 }).notNull(),
  cryptoAllowed: boolean("crypto_allowed").notNull().default(false),
  forexAllowed: boolean("forex_allowed").notNull().default(false),
  usMarketAllowed: boolean("us_market_allowed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("indianMarketPolicyTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("indianMarketPolicyTable_updatedAt_idx").on(table.updatedAt)
          }));

// ====================================================
// EP03: ENTERPRISE AI ACTIVATION & RUNTIME MANAGEMENT ENGINE SCHEMAS
// ====================================================

export const aiActivationTable = pgTable("ai_activation", {
  id: varchar("id", { length: 100 }).primaryKey(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
  aiModelId: varchar("ai_model_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("REGISTERED"), // REGISTERED, OFF, READY, ACTIVATION_PENDING, ACTIVATING, ACTIVE, PAUSED, STOPPING, STOPPED, FAILED, RECOVERING, ARCHIVED
  operator: varchar("operator", { length: 100 }).notNull().default("AI_CHIEF_OFFICER"),
  details: jsonb("details").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            correlationIdIdx: index("aiActivationTable_correlationId_idx").on(table.correlationId),
            aiModelIdIdx: index("aiActivationTable_aiModelId_idx").on(table.aiModelId),
            statusIdx: index("aiActivationTable_status_idx").on(table.status),
            createdAtIdx: index("aiActivationTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiActivationTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("aiActivationTable_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("aiActivationTable_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const aiRuntimeTable = pgTable("ai_runtime", {
  id: varchar("id", { length: 100 }).primaryKey(),
  runtimeId: varchar("runtime_id", { length: 100 }).notNull().unique(),
  aiModelId: varchar("ai_model_id", { length: 100 }).notNull(),
  tenantId: varchar("tenant_id", { length: 100 }).notNull().default("TENANT-ENTERPRISE-01"),
  workspaceId: varchar("workspace_id", { length: 100 }).notNull().default("WORKSPACE-CORE-01"),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }).notNull().default("v2.0.0"),
  status: varchar("status", { length: 50 }).notNull().default("OFF"),
  runtimeOwner: varchar("runtime_owner", { length: 100 }).notNull(),
  sessionOwner: varchar("session_owner", { length: 100 }).notNull(),
  marketOwner: varchar("market_owner", { length: 100 }).notNull().default("NSE_BSE_MCX"),
  restartCount: integer("restart_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("aiRuntimeTable_aiModelId_idx").on(table.aiModelId),
            sessionIdIdx: index("aiRuntimeTable_sessionId_idx").on(table.sessionId),
            statusIdx: index("aiRuntimeTable_status_idx").on(table.status),
            createdAtIdx: index("aiRuntimeTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiRuntimeTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("aiRuntimeTable_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("aiRuntimeTable_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const aiRuntimeLicenseTable = pgTable("ai_runtime_license", {
  id: varchar("id", { length: 100 }).primaryKey(),
  licenseId: varchar("license_id", { length: 100 }).notNull().unique(),
  runtimeId: varchar("runtime_id", { length: 100 }).notNull(),
  aiModelId: varchar("ai_model_id", { length: 100 }).notNull(),
  activationDate: timestamp("activation_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  version: varchar("version", { length: 50 }).notNull().default("v2.0.0"),
  signature: varchar("signature", { length: 256 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("aiRuntimeLicenseTable_aiModelId_idx").on(table.aiModelId),
            statusIdx: index("aiRuntimeLicenseTable_status_idx").on(table.status),
            createdAtIdx: index("aiRuntimeLicenseTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("aiRuntimeLicenseTable_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("aiRuntimeLicenseTable_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const aiRuntimeResourceTable = pgTable("ai_runtime_resource", {
  id: varchar("id", { length: 100 }).primaryKey(),
  runtimeId: varchar("runtime_id", { length: 100 }).notNull().unique(),
  cpuAllocated: varchar("cpu_allocated", { length: 50 }).notNull().default("4 vCPU"),
  ramAllocated: varchar("ram_allocated", { length: 50 }).notNull().default("16 GB"),
  threads: integer("threads").notNull().default(8),
  priority: varchar("priority", { length: 50 }).notNull().default("HIGH"),
  executionQueueSize: integer("execution_queue_size").notNull().default(1000),
  executionSlot: varchar("execution_slot", { length: 50 }).notNull().default("SLOT-01"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiRuntimeResourceTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiRuntimeResourceTable_updatedAt_idx").on(table.updatedAt)
          }));

export const aiRuntimeQuotaTable = pgTable("ai_runtime_quota", {
  id: varchar("id", { length: 100 }).primaryKey(),
  runtimeId: varchar("runtime_id", { length: 100 }).notNull().unique(),
  cpuLimitPercent: numeric("cpu_limit_percent", { precision: 5, scale: 2 }).notNull().default("85.00"),
  memoryLimitGb: numeric("memory_limit_gb", { precision: 10, scale: 2 }).notNull().default("32.00"),
  executionLimitSec: integer("execution_limit_sec").notNull().default(3600),
  apiLimitPerMin: integer("api_limit_per_min").notNull().default(1000),
  runtimeDurationSec: integer("runtime_duration_sec").notNull().default(86400),
  maxConcurrentTasks: integer("max_concurrent_tasks").notNull().default(10),
  throttled: boolean("throttled").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiRuntimeQuotaTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiRuntimeQuotaTable_updatedAt_idx").on(table.updatedAt)
          }));

export const aiRuntimeAuditTable = pgTable("ai_runtime_audit", {
  id: varchar("id", { length: 100 }).primaryKey(),
  runtimeId: varchar("runtime_id", { length: 100 }).notNull(),
  auditType: varchar("audit_type", { length: 50 }).notNull(), // ACTIVATION, HEARTBEAT, RESTART, RECOVERY, SHUTDOWN, AUTHORIZATION, LICENSE
  actor: varchar("actor", { length: 100 }).notNull().default("SYSTEM"),
  details: jsonb("details").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiRuntimeAuditTable_createdAt_idx").on(table.createdAt)
          }));

export const aiRuntimeCertificateTable = pgTable("ai_runtime_certificate", {
  id: varchar("id", { length: 100 }).primaryKey(),
  certificateId: varchar("certificate_id", { length: 100 }).notNull().unique(),
  runtimeId: varchar("runtime_id", { length: 100 }).notNull(),
  aiModelId: varchar("ai_model_id", { length: 100 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull().default("AI_CHIEF_OFFICER"),
  sha256Hash: varchar("sha256_hash", { length: 128 }).notNull(),
  digitalSignature: varchar("digital_signature", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            certificateIdIdx: index("aiRuntimeCertificateTable_certificateId_idx").on(table.certificateId),
            aiModelIdIdx: index("aiRuntimeCertificateTable_aiModelId_idx").on(table.aiModelId),
            createdAtIdx: index("aiRuntimeCertificateTable_createdAt_idx").on(table.createdAt)
          }));

export const aiRuntimeCertificateRegistryTable = pgTable("ai_runtime_certificate_registry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  certificateId: varchar("certificate_id", { length: 100 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("VALID"), // VALID, REVOKED, RENEWED
  history: jsonb("history").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            certificateIdIdx: index("aiRuntimeCertificateRegistryTable_certificateId_idx").on(table.certificateId),
            statusIdx: index("aiRuntimeCertificateRegistryTable_status_idx").on(table.status),
            createdAtIdx: index("aiRuntimeCertificateRegistryTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("aiRuntimeCertificateRegistryTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("aiRuntimeCertificateRegistryTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const aiRuntimeEventsTable = pgTable("ai_runtime_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  runtimeId: varchar("runtime_id", { length: 100 }),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("aiRuntimeEventsTable_createdAt_idx").on(table.createdAt)
          }));


// ====================================================
// EP04: ENTERPRISE MARKET CONNECTIVITY & MASTER DATA ENGINE SCHEMAS
// ====================================================

export const exchangeRegistryTable = pgTable("exchange_registry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  exchangeId: varchar("exchange_id", { length: 100 }).notNull().unique(),
  exchangeCode: varchar("exchange_code", { length: 50 }).notNull(),
  exchangeName: varchar("exchange_name", { length: 100 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Kolkata").notNull(),
  country: varchar("country", { length: 50 }).default("India").notNull(),
  currency: varchar("currency", { length: 20 }).default("INR").notNull(),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  version: varchar("version", { length: 50 }).default("1.0.0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("exchangeRegistryTable_status_idx").on(table.status),
            createdAtIdx: index("exchangeRegistryTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("exchangeRegistryTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("exchangeRegistryTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const marketConnectivityTable = pgTable("market_connectivity", {
  id: varchar("id", { length: 100 }).primaryKey(),
  exchangeId: varchar("exchange_id", { length: 100 }).notNull().unique(),
  primaryFeedUrl: varchar("primary_feed_url", { length: 255 }).notNull(),
  secondaryFeedUrl: varchar("secondary_feed_url", { length: 255 }).notNull(),
  healthStatus: varchar("health_status", { length: 50 }).default("HEALTHY").notNull(),
  feedStatus: varchar("feed_status", { length: 50 }).default("CONNECTED").notNull(),
  reconnectCount: integer("reconnect_count").default(0).notNull(),
  failoverActive: boolean("failover_active").default(false).notNull(),
  lastHeartbeatAt: timestamp("last_heartbeat_at").defaultNow().notNull(),
  latencyMs: integer("latency_ms").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("marketConnectivityTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("marketConnectivityTable_updatedAt_idx").on(table.updatedAt)
          }));

export const instrumentMasterTable = pgTable("instrument_master", {
  id: varchar("id", { length: 100 }).primaryKey(),
  instrumentId: varchar("instrument_id", { length: 100 }).notNull().unique(),
  instrumentType: varchar("instrument_type", { length: 100 }).notNull(), // Equity, ETF, Index, Stock Futures, Index Futures, Stock Options, Index Options, MCX Commodity
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  exchangeId: varchar("exchange_id", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            instrumentIdIdx: index("instrumentMasterTable_instrumentId_idx").on(table.instrumentId),
            statusIdx: index("instrumentMasterTable_status_idx").on(table.status),
            createdAtIdx: index("instrumentMasterTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("instrumentMasterTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("instrumentMasterTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const symbolMasterTable = pgTable("symbol_master", {
  id: varchar("id", { length: 100 }).primaryKey(),
  instrumentId: varchar("instrument_id", { length: 100 }).notNull(),
  tradingSymbol: varchar("trading_symbol", { length: 100 }).notNull(),
  displaySymbol: varchar("display_symbol", { length: 100 }).notNull(),
  exchangeSymbol: varchar("exchange_symbol", { length: 100 }).notNull(),
  brokerSymbol: varchar("broker_symbol", { length: 100 }).notNull(),
  internalSymbol: varchar("internal_symbol", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            instrumentIdIdx: index("symbolMasterTable_instrumentId_idx").on(table.instrumentId),
            createdAtIdx: index("symbolMasterTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("symbolMasterTable_updatedAt_idx").on(table.updatedAt)
          }));

export const isinMasterTable = pgTable("isin_master", {
  id: varchar("id", { length: 100 }).primaryKey(),
  isin: varchar("isin", { length: 50 }).notNull().unique(),
  securityName: varchar("security_name", { length: 255 }).notNull(),
  exchangeMapping: varchar("exchange_mapping", { length: 100 }).notNull(),
  listingStatus: varchar("listing_status", { length: 50 }).default("LISTED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("isinMasterTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("isinMasterTable_updatedAt_idx").on(table.updatedAt)
          }));

export const derivativeMasterTable = pgTable("derivative_master", {
  id: varchar("id", { length: 100 }).primaryKey(),
  instrumentId: varchar("instrument_id", { length: 100 }).notNull(),
  underlying: varchar("underlying", { length: 100 }).notNull(),
  optionType: varchar("option_type", { length: 50 }), // CE, PE, XX
  futureType: varchar("future_type", { length: 50 }), // FUTIDX, FUTSTK
  strike: numeric("strike", { precision: 20, scale: 4 }),
  expiry: timestamp("expiry"),
  contract: varchar("contract", { length: 100 }),
  series: varchar("series", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            instrumentIdIdx: index("derivativeMasterTable_instrumentId_idx").on(table.instrumentId),
            createdAtIdx: index("derivativeMasterTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("derivativeMasterTable_updatedAt_idx").on(table.updatedAt)
          }));

export const expiryMasterTable = pgTable("expiry_master", {
  id: varchar("id", { length: 100 }).primaryKey(),
  expiryDate: timestamp("expiry_date").notNull(),
  expiryType: varchar("expiry_type", { length: 50 }).notNull(), // WEEKLY, MONTHLY, QUARTERLY, COMMODITY
  isWeekly: boolean("is_weekly").default(false).notNull(),
  isMonthly: boolean("is_monthly").default(false).notNull(),
  isQuarterly: boolean("is_quarterly").default(false).notNull(),
  isCommodity: boolean("is_commodity").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("expiryMasterTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("expiryMasterTable_updatedAt_idx").on(table.updatedAt)
          }));

export const lotSizeMasterTable = pgTable("lot_size_master", {
  id: varchar("id", { length: 100 }).primaryKey(),
  instrumentId: varchar("instrument_id", { length: 100 }).notNull(),
  lotSize: integer("lot_size").default(1).notNull(),
  freezeQuantity: integer("freeze_quantity").default(0).notNull(),
  maximumQuantity: integer("maximum_quantity").default(0).notNull(),
  minimumQuantity: integer("minimum_quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            instrumentIdIdx: index("lotSizeMasterTable_instrumentId_idx").on(table.instrumentId),
            createdAtIdx: index("lotSizeMasterTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("lotSizeMasterTable_updatedAt_idx").on(table.updatedAt)
          }));

export const tickSizeMasterTable = pgTable("tick_size_master", {
  id: varchar("id", { length: 100 }).primaryKey(),
  instrumentId: varchar("instrument_id", { length: 100 }).notNull(),
  tickSize: numeric("tick_size", { precision: 10, scale: 4 }).default("0.05").notNull(),
  pricePrecision: integer("price_precision").default(2).notNull(),
  quantityPrecision: integer("quantity_precision").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            instrumentIdIdx: index("tickSizeMasterTable_instrumentId_idx").on(table.instrumentId),
            createdAtIdx: index("tickSizeMasterTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("tickSizeMasterTable_updatedAt_idx").on(table.updatedAt)
          }));

export const sectorMasterTable = pgTable("sector_master", {
  id: varchar("id", { length: 100 }).primaryKey(),
  instrumentId: varchar("instrument_id", { length: 100 }).notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  subIndustry: varchar("sub_industry", { length: 100 }).notNull(),
  marketCapCategory: varchar("market_cap_category", { length: 50 }).notNull(), // LARGE, MID, SMALL
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            instrumentIdIdx: index("sectorMasterTable_instrumentId_idx").on(table.instrumentId),
            createdAtIdx: index("sectorMasterTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("sectorMasterTable_updatedAt_idx").on(table.updatedAt)
          }));

export const marketFeedTable = pgTable("market_feed", {
  id: varchar("id", { length: 100 }).primaryKey(),
  feedStatus: varchar("feed_status", { length: 50 }).default("CONNECTED").notNull(),
  feedHealth: varchar("feed_health", { length: 50 }).default("HEALTHY").notNull(),
  feedVersion: varchar("feed_version", { length: 50 }).default("1.0.0").notNull(),
  feedSource: varchar("feed_source", { length: 100 }).default("DIRECT").notNull(),
  feedQuality: varchar("feed_quality", { length: 50 }).default("HIGH").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("marketFeedTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("marketFeedTable_updatedAt_idx").on(table.updatedAt)
          }));

export const marketCacheTable = pgTable("market_cache", {
  id: varchar("id", { length: 100 }).primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(),
  cacheValue: jsonb("cache_value").notNull().default({}),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("marketCacheTable_createdAt_idx").on(table.createdAt)
          }));

export const marketMetadataTable = pgTable("market_metadata", {
  id: varchar("id", { length: 100 }).primaryKey(),
  createdBy: varchar("created_by", { length: 100 }).default("SYSTEM").notNull(),
  updatedBy: varchar("updated_by", { length: 100 }).default("SYSTEM").notNull(),
  source: varchar("source", { length: 100 }).default("NSE_FEED").notNull(),
  version: varchar("version", { length: 50 }).default("1.0.0").notNull(),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("marketMetadataTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("marketMetadataTable_updatedAt_idx").on(table.updatedAt)
          }));

export const marketEventsTable = pgTable("market_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // ExchangeConnected, ExchangeDisconnected, FeedStarted, FeedStopped, FeedRecovered, MasterUpdated, InstrumentAdded, InstrumentDisabled
  exchangeId: varchar("exchange_id", { length: 100 }),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("marketEventsTable_createdAt_idx").on(table.createdAt)
          }));

// ====================================================
// EP04.1: ENTERPRISE MARKET COMPLETION ENGINE EXTRA SCHEMAS
// ====================================================

export const marketVersionsTable = pgTable("market_versions", {
  id: varchar("id", { length: 100 }).primaryKey(),
  masterVersion: varchar("master_version", { length: 50 }).notNull(),
  schemaVersion: varchar("schema_version", { length: 50 }).notNull(),
  dataVersion: varchar("data_version", { length: 50 }).notNull(),
  exchangeVersion: varchar("exchange_version", { length: 50 }).notNull(),
  feedVersion: varchar("feed_version", { length: 50 }).notNull(),
  rollbackPayload: text("rollback_payload").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 100 }).notNull(),
  checksum: varchar("checksum", { length: 255 }).notNull(),
  versionAudit: text("version_audit").notNull(),
}, (table) => ({
            createdAtIdx: index("marketVersionsTable_createdAt_idx").on(table.createdAt)
          }));

export const instrumentLifecycleHistoryTable = pgTable("instrument_lifecycle_history", {
  id: varchar("id", { length: 100 }).primaryKey(),
  instrumentId: varchar("instrument_id", { length: 100 }).notNull(),
  oldState: varchar("old_state", { length: 50 }).notNull(),
  newState: varchar("new_state", { length: 50 }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            instrumentIdIdx: index("instrumentLifecycleHistoryTable_instrumentId_idx").on(table.instrumentId),
            createdAtIdx: index("instrumentLifecycleHistoryTable_createdAt_idx").on(table.createdAt)
          }));

export const masterDataProposalsTable = pgTable("master_data_proposals", {
  id: varchar("id", { length: 100 }).primaryKey(),
  status: varchar("status", { length: 50 }).notNull(),
  payload: text("payload").notNull(),
  errors: text("errors"),
  operator: varchar("operator", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  validatedAt: timestamp("validated_at"),
  approvedAt: timestamp("approved_at"),
  synchronizedAt: timestamp("synchronized_at"),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
}, (table) => ({
            statusIdx: index("masterDataProposalsTable_status_idx").on(table.status),
            createdAtIdx: index("masterDataProposalsTable_createdAt_idx").on(table.createdAt),
            approvedAtIdx: index("masterDataProposalsTable_approvedAt_idx").on(table.approvedAt),
            correlationIdIdx: index("masterDataProposalsTable_correlationId_idx").on(table.correlationId),
            statuscreatedAtIdx: index("masterDataProposalsTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const marketLineageTable = pgTable("market_lineage", {
  id: varchar("id", { length: 100 }).primaryKey(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  importOperator: varchar("import_operator", { length: 100 }).notNull(),
  importAt: timestamp("import_at").notNull(),
  validationStatus: varchar("validation_status", { length: 50 }).notNull(),
  validationAt: timestamp("validation_at").notNull(),
  approvalOperator: varchar("approval_operator", { length: 100 }),
  approvalAt: timestamp("approval_at"),
  publicationAt: timestamp("publication_at"),
  consumers: text("consumers").notNull(),
}, (table) => ({
            correlationIdIdx: index("marketLineageTable_correlationId_idx").on(table.correlationId)
          }));

export const marketAuditChainTable = pgTable("market_audit_chain", {
  id: varchar("id", { length: 100 }).primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }).notNull(),
  payloadHash: varchar("payload_hash", { length: 128 }).notNull(),
  previousHash: varchar("previous_hash", { length: 128 }).notNull(),
  currentHash: varchar("current_hash", { length: 128 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("marketAuditChainTable_createdAt_idx").on(table.createdAt)
          }));

export const feedQualityMetricsTable = pgTable("feed_quality_metrics", {
  id: varchar("id", { length: 100 }).primaryKey(),
  exchangeId: varchar("exchange_id", { length: 100 }).notNull(),
  latencyMs: integer("latency_ms").notNull(),
  packetLoss: numeric("packet_loss", { precision: 5, scale: 2 }).notNull(),
  duplicateTicks: integer("duplicate_ticks").notNull(),
  missingTicks: integer("missing_ticks").notNull(),
  feedDelayMs: integer("feed_delay_ms").notNull(),
  feedConfidence: numeric("feed_confidence", { precision: 5, scale: 2 }).notNull(),
  qualityScore: numeric("quality_score", { precision: 5, scale: 2 }).notNull(),
  healthState: varchar("health_state", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("feedQualityMetricsTable_createdAt_idx").on(table.createdAt)
          }));

export const connectivityCertificatesTable = pgTable("connectivity_certificates", {
  id: varchar("id", { length: 100 }).primaryKey(),
  certificateType: varchar("certificate_type", { length: 50 }).notNull(),
  exchangeId: varchar("exchange_id", { length: 100 }),
  feedUrl: varchar("feed_url", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sha256Hash: varchar("sha256_hash", { length: 128 }).notNull(),
  digitalSignature: varchar("digital_signature", { length: 256 }).notNull(),
  verificationStatus: varchar("verification_status", { length: 50 }).default("VERIFIED").notNull(),
}, (table) => ({
            timestampIdx: index("connectivityCertificatesTable_timestamp_idx").on(table.timestamp)
          }));

export const marketRecoveryJobsTable = pgTable("market_recovery_jobs", {
  id: varchar("id", { length: 100 }).primaryKey(),
  failureType: varchar("failure_type", { length: 100 }).notNull(),
  recoveryAction: varchar("recovery_action", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  auditTrail: text("audit_trail").notNull(),
  certificateId: varchar("certificate_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
            statusIdx: index("marketRecoveryJobsTable_status_idx").on(table.status),
            certificateIdIdx: index("marketRecoveryJobsTable_certificateId_idx").on(table.certificateId),
            createdAtIdx: index("marketRecoveryJobsTable_createdAt_idx").on(table.createdAt),
            completedAtIdx: index("marketRecoveryJobsTable_completedAt_idx").on(table.completedAt),
            statuscreatedAtIdx: index("marketRecoveryJobsTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const marketDependencyRegistryTable = pgTable("market_dependency_registry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  consumerWorkspace: varchar("consumer_workspace", { length: 100 }).notNull().unique(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
}, (table) => ({
            statusIdx: index("marketDependencyRegistryTable_status_idx").on(table.status)
          }));

// ====================================================
// EP05: ENTERPRISE INDIAN MARKET OPERATING SYSTEM SCHEMAS
// ====================================================

export const indianTradingCalendarTable = pgTable("indian_trading_calendar", {
  id: varchar("id", { length: 100 }).primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(), // YYYY-MM-DD
  dayType: varchar("day_type", { length: 50 }).notNull(), // WEEKDAY, WEEKEND, HOLIDAY, SPECIAL_SESSION, EMERGENCY_CLOSURE
  sessionName: varchar("session_name", { length: 100 }), // e.g. "Diwali Muhurat Trading" or "Independence Day"
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("indianTradingCalendarTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("indianTradingCalendarTable_updatedAt_idx").on(table.updatedAt)
          }));

export const indianMarketSessionTable = pgTable("indian_market_session", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionType: varchar("session_type", { length: 50 }).notNull(), // PRE_OPEN, NORMAL, PRE_CLOSE, POST_CLOSE, HOLIDAY, MAINTENANCE, EMERGENCY_STOP
  startTime: varchar("start_time", { length: 50 }).notNull(), // HH:MM
  endTime: varchar("end_time", { length: 50 }).notNull(), // HH:MM
  isActive: boolean("is_active").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("indianMarketSessionTable_updatedAt_idx").on(table.updatedAt)
          }));

export const indianMarketClockTable = pgTable("indian_market_clock", {
  id: varchar("id", { length: 100 }).primaryKey(),
  exchangeTime: timestamp("exchange_time").notNull(),
  serverTime: timestamp("server_time").notNull(),
  systemTime: timestamp("system_time").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Kolkata").notNull(),
  driftMs: integer("drift_ms").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("indianMarketClockTable_createdAt_idx").on(table.createdAt)
          }));

export const indianMarketRuntimeTable = pgTable("indian_market_runtime", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g. "settlement", "expiry", "circuit", "auction", "corporate"
  runtimeKey: varchar("runtime_key", { length: 100 }).notNull().unique(),
  runtimeValue: jsonb("runtime_value").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("indianMarketRuntimeTable_updatedAt_idx").on(table.updatedAt)
          }));

export const indianMarketOperatingPolicyTable = pgTable("indian_market_operating_policy", {
  id: varchar("id", { length: 100 }).primaryKey(),
  policyName: varchar("policy_name", { length: 100 }).notNull().unique(), // NSE_POLICY, BSE_POLICY, MCX_POLICY, PAPER_POLICY, LIVE_POLICY, EMERGENCY_POLICY
  description: varchar("description", { length: 255 }),
  rules: jsonb("rules").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("indianMarketOperatingPolicyTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("indianMarketOperatingPolicyTable_updatedAt_idx").on(table.updatedAt)
          }));

export const indianMarketValidationTable = pgTable("indian_market_validation", {
  id: varchar("id", { length: 100 }).primaryKey(),
  moduleName: varchar("module_name", { length: 100 }).notNull(), // RESEARCH, AI_INTELLIGENCE, STRATEGY, COMMITTEE, LIFECYCLE, PAPER_TRADING, TRADING
  isValid: boolean("is_valid").notNull(),
  checksRun: jsonb("checks_run").notNull().default({}),
  errors: jsonb("errors").notNull().default([]),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
});

export const indianMarketEventsTable = pgTable("indian_market_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // TradingDayStarted, TradingDayEnded, MarketOpened, MarketClosed, SettlementStarted, SettlementCompleted, ExpiryStarted, ExpiryCompleted, AuctionStarted, AuctionEnded, CircuitTriggered, CorporateActionApplied
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("indianMarketEventsTable_createdAt_idx").on(table.createdAt)
          }));

// ====================================================
// EP06 — ENTERPRISE RESEARCH WORKSPACE
// ====================================================

export const researchProjectsTable = pgTable("research_projects", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  objective: text("objective").notNull(),
  owner: varchar("owner", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull(), // HIGH, MEDIUM, LOW
  status: varchar("status", { length: 50 }).notNull(), // ACTIVE, COMPLETED, ARCHIVED
  category: varchar("category", { length: 100 }).notNull(), // EQUITY, ETF, INDEX, FUTURES, OPTIONS, COMMODITIES
  tags: jsonb("tags").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("researchProjectsTable_status_idx").on(table.status),
            createdAtIdx: index("researchProjectsTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("researchProjectsTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("researchProjectsTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const researchJobsTable = pgTable("research_jobs", {
  id: varchar("id", { length: 100 }).primaryKey(),
  projectId: varchar("project_id", { length: 100 }).notNull(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  jobType: varchar("job_type", { length: 50 }).notNull(), // MANUAL, SCHEDULED, RECURRING, REALTIME
  status: varchar("status", { length: 50 }).notNull(), // PAUSED, COMPLETED, RUNNING, IDLE, FAILED
  schedule: varchar("schedule", { length: 100 }), // One Time, Daily, Weekly, Monthly, Market Open, Market Close
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("researchJobsTable_status_idx").on(table.status),
            createdAtIdx: index("researchJobsTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("researchJobsTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("researchJobsTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const researchDatasetsTable = pgTable("research_datasets", {
  id: varchar("id", { length: 100 }).primaryKey(),
  projectId: varchar("project_id", { length: 100 }).notNull(),
  datasetName: varchar("dataset_name", { length: 255 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull().default(0),
  checksum: varchar("checksum", { length: 100 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  isValid: boolean("is_valid").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("researchDatasetsTable_timestamp_idx").on(table.timestamp),
            createdAtIdx: index("researchDatasetsTable_createdAt_idx").on(table.createdAt)
          }));

export const researchWatchlistsTable = pgTable("research_watchlists", {
  id: varchar("id", { length: 100 }).primaryKey(),
  watchlistName: varchar("watchlist_name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // SECTOR, INDEX, STOCK, DERIVATIVE, COMMODITY
  symbols: jsonb("symbols").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("researchWatchlistsTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("researchWatchlistsTable_updatedAt_idx").on(table.updatedAt)
          }));

export const researchEvidenceTable = pgTable("ep06_research_evidence", {
  id: varchar("id", { length: 100 }).primaryKey(),
  projectId: varchar("project_id", { length: 100 }).notNull(),
  observation: text("observation").notNull(),
  reference: varchar("reference", { length: 255 }).notNull(),
  confidence: integer("confidence").notNull().default(100), // 0 to 100
  correlationId: varchar("correlation_id", { length: 100 }),
  timestamp: timestamp("timestamp").notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            correlationIdIdx: index("researchEvidenceTable_correlationId_idx").on(table.correlationId),
            timestampIdx: index("researchEvidenceTable_timestamp_idx").on(table.timestamp),
            createdAtIdx: index("researchEvidenceTable_createdAt_idx").on(table.createdAt)
          }));

export const researchNotesTable = pgTable("research_notes", {
  id: varchar("id", { length: 100 }).primaryKey(),
  projectId: varchar("project_id", { length: 100 }).notNull(),
  noteText: text("note_text").notNull(),
  authorType: varchar("author_type", { length: 50 }).notNull(), // ANALYST, AI, MANUAL
  isPinned: boolean("is_pinned").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("researchNotesTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("researchNotesTable_updatedAt_idx").on(table.updatedAt)
          }));

export const researchTimelineTable = pgTable("research_timeline", {
  id: varchar("id", { length: 100 }).primaryKey(),
  projectId: varchar("project_id", { length: 100 }).notNull(),
  event: varchar("event", { length: 100 }).notNull(), // ResearchStarted, ResearchUpdated, ResearchCompleted, ResearchArchived
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
            timestampIdx: index("researchTimelineTable_timestamp_idx").on(table.timestamp)
          }));

export const researchRuntimeTable = pgTable("research_runtime", {
  id: varchar("id", { length: 100 }).primaryKey(),
  jobId: varchar("job_id", { length: 100 }).notNull(),
  queueName: varchar("queue_name", { length: 100 }).notNull(), // DEFAULT, HIGH_PRIORITY
  workerId: varchar("worker_id", { length: 100 }).notNull(),
  priority: integer("priority").notNull().default(0),
  executionStatus: varchar("execution_status", { length: 50 }).notNull(), // QUEUED, PROCESSING, COMPLETED, FAILED
  retryCount: integer("retry_count").notNull().default(0),
  logs: text("logs").notNull().default(""),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
});

export const researchEventsTable = pgTable("research_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // ResearchStarted, ResearchCompleted, DatasetCreated, DatasetValidated, WatchlistUpdated, ResearchArchived
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("researchEventsTable_createdAt_idx").on(table.createdAt)
          }));

// ====================================================
// MODULE 4: RESEARCH SIMULATION & IMPACT SCHEMAS
// ====================================================

export const researchSimulationImpactTable = pgTable("research_simulation_impact", {
  id: varchar("id", { length: 100 }).primaryKey(),
  assetVector: varchar("asset_vector", { length: 255 }).notNull(),
  assetClass: varchar("asset_class", { length: 50 }).notNull(), // EQUITY, ETF, INDEX, FUTURES, OPTIONS, COMMODITY, CURRENCY, INTEREST_RATE
  category: varchar("category", { length: 100 }).notNull(),
  shortTermImpact: varchar("short_term_impact", { length: 100 }).notNull(),
  mediumTermImpact: varchar("medium_term_impact", { length: 100 }).notNull(),
  impactDirection: varchar("impact_direction", { length: 50 }).notNull(), // BULLISH, BEARISH, NEUTRAL, MODERATE_POSITIVE, MODERATE_BEARISH
  impactMagnitude: doublePrecision("impact_magnitude").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  evidenceCount: integer("evidence_count").notNull().default(0),
  sourceCount: integer("source_count").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  researchPackageId: varchar("research_package_id", { length: 100 }),
  verificationStatus: varchar("verification_status", { length: 50 }).notNull().default("VERIFIED"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  assetClassIdx: index("researchSimImpact_assetClass_idx").on(table.assetClass),
  packageIdx: index("researchSimImpact_packageId_idx").on(table.researchPackageId),
  timestampIdx: index("researchSimImpact_timestamp_idx").on(table.timestamp)
}));

export const researchSimulationCorrelationsTable = pgTable("research_simulation_correlations", {
  id: varchar("id", { length: 100 }).primaryKey(),
  entityA: varchar("entity_a", { length: 255 }).notNull(),
  entityB: varchar("entity_b", { length: 255 }).notNull(),
  correlationCoefficient: doublePrecision("correlation_coefficient"),
  correlationType: varchar("correlation_type", { length: 50 }).notNull(), // POSITIVE, NEGATIVE, NEUTRAL, LEADING, LAGGING, REGIME_DEPENDENT, INSUFFICIENT_DATA
  observationWindow: varchar("observation_window", { length: 50 }).notNull(),
  sampleSize: integer("sample_size").notNull().default(0),
  statisticalConfidence: doublePrecision("statistical_confidence").default(0),
  relationshipDirection: varchar("relationship_direction", { length: 50 }).notNull(), // DIRECT, INVERSE, NON_LINEAR
  strength: varchar("strength", { length: 50 }).notNull(), // HIGH, MODERATE, LOW, WEAK, EXTREME, INSUFFICIENT_DATA
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sourceDataset: varchar("source_dataset", { length: 255 }).notNull(),
  datasetVersion: varchar("dataset_version", { length: 50 }).notNull(),
  researchPackageId: varchar("research_package_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  entityPairIdx: index("researchSimCorr_entities_idx").on(table.entityA, table.entityB),
  packageIdx: index("researchSimCorr_packageId_idx").on(table.researchPackageId),
  typeIdx: index("researchSimCorr_type_idx").on(table.correlationType)
}));

export const researchSimulationDuplicatesTable = pgTable("research_simulation_duplicates", {
  id: varchar("id", { length: 100 }).primaryKey(),
  originalResearchId: varchar("original_research_id", { length: 100 }).notNull(),
  comparedResearchId: varchar("compared_research_id", { length: 100 }).notNull(),
  similarityScore: doublePrecision("similarity_score").notNull(),
  detectionType: varchar("detection_type", { length: 50 }).notNull(), // EXACT_DUPLICATE, SEMANTIC_DUPLICATE, RELATED_BUT_DISTINCT, CONTRADICTORY, NEW_INFORMATION
  matchingFields: jsonb("matching_fields").notNull().default([]),
  resolutionStatus: varchar("resolution_status", { length: 50 }).notNull().default("OPEN"), // OPEN, RESOLVED, DISMISSED, ARCHIVED, MERGED
  source: varchar("source", { length: 100 }).notNull().default("DUPLICATE_ENGINE"),
  provenance: jsonb("provenance").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  origIdx: index("researchSimDup_orig_idx").on(table.originalResearchId),
  typeIdx: index("researchSimDup_type_idx").on(table.detectionType),
  statusIdx: index("researchSimDup_status_idx").on(table.resolutionStatus)
}));

export const researchSimulationConsensusTable = pgTable("research_simulation_consensus", {
  id: varchar("id", { length: 100 }).primaryKey(),
  researchQuestion: text("research_question").notNull(),
  modelsEvaluated: integer("models_evaluated").notNull(),
  consensusStatus: varchar("consensus_status", { length: 50 }).notNull(), // UNANIMOUS, STRONG_CONSENSUS, MAJORITY, SPLIT, NO_CONSENSUS, INSUFFICIENT_DATA
  agreementPercent: doublePrecision("agreement_percent").notNull(),
  disagreementPercent: doublePrecision("disagreement_percent").notNull(),
  majorityView: text("majority_view").notNull(),
  minorityView: text("minority_view"),
  confidence: doublePrecision("confidence"),
  confidenceComponents: jsonb("confidence_components").default({}),
  contradictoryEvidence: jsonb("contradictory_evidence").default([]),
  uncertainty: text("uncertainty"),
  requiredVerification: text("required_verification"),
  evidenceCount: integer("evidence_count").notNull().default(0),
  sourceCount: integer("source_count").notNull().default(0),
  researchPackageId: varchar("research_package_id", { length: 100 }),
  datasetVersion: varchar("dataset_version", { length: 50 }),
  verificationStatus: varchar("verification_status", { length: 50 }).notNull().default("VERIFIED"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("researchSimConsensus_status_idx").on(table.consensusStatus),
  packageIdx: index("researchSimConsensus_packageId_idx").on(table.researchPackageId)
}));

export const researchSimulationModelRunsTable = pgTable("research_simulation_model_runs", {
  id: varchar("id", { length: 100 }).primaryKey(),
  consensusId: varchar("consensus_id", { length: 100 }).notNull(),
  modelId: varchar("model_id", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  conclusion: text("conclusion").notNull(),
  direction: varchar("direction", { length: 50 }).notNull(), // BULLISH, BEARISH, NEUTRAL
  confidence: doublePrecision("confidence").notNull(),
  supportingEvidence: jsonb("supporting_evidence").default([]),
  assumptions: jsonb("assumptions").default([]),
  risks: jsonb("risks").default([]),
  uncertainty: text("uncertainty"),
  weight: doublePrecision("weight").notNull().default(1.0),
  agreesWithConsensus: boolean("agrees_with_consensus").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  consensusIdx: index("researchSimModelRuns_consensusId_idx").on(table.consensusId),
  modelIdx: index("researchSimModelRuns_modelId_idx").on(table.modelId)
}));

export const researchConsensusEvidenceLinksTable = pgTable("research_consensus_evidence_links", {
  id: varchar("id", { length: 100 }).primaryKey(),
  consensusId: varchar("consensus_id", { length: 100 }).notNull(),
  evidenceId: varchar("evidence_id", { length: 100 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  datasetVersion: varchar("dataset_version", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  consensusIdx: index("researchConsensusEvLinks_consensusId_idx").on(table.consensusId)
}));

// ====================================================
// EP07: ENTERPRISE AI INTELLIGENCE WORKSPACE SCHEMAS
// ====================================================

export const intelligenceSessions = pgTable("intelligence_sessions", {
  id: varchar("id", { length: 100 }).primaryKey(), // Session ID
  aiModelId: varchar("ai_model_id", { length: 100 }).notNull(),
  workspaceId: varchar("workspace_id", { length: 100 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull(), // PENDING, ACTIVE, COMPLETED, FAILED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("intelligenceSessions_aiModelId_idx").on(table.aiModelId),
            correlationIdIdx: index("intelligenceSessions_correlationId_idx").on(table.correlationId),
            statusIdx: index("intelligenceSessions_status_idx").on(table.status),
            createdAtIdx: index("intelligenceSessions_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("intelligenceSessions_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("intelligenceSessions_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("intelligenceSessions_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const intelligenceContext = pgTable("intelligence_context", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  marketContext: jsonb("market_context").notNull().default({}),
  sectorContext: jsonb("sector_context").notNull().default({}),
  instrumentContext: jsonb("instrument_context").notNull().default({}),
  derivativeContext: jsonb("derivative_context").notNull().default({}),
  tradingContext: jsonb("trading_context").notNull().default({}),
  historicalContext: jsonb("historical_context").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("intelligenceContext_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("intelligenceContext_createdAt_idx").on(table.createdAt)
          }));

export const intelligenceReasoning = pgTable("intelligence_reasoning", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  observations: jsonb("observations").notNull().default([]),
  relationships: jsonb("relationships").notNull().default([]),
  patterns: jsonb("patterns").notNull().default([]),
  dependencies: jsonb("dependencies").notNull().default([]),
  marketBehaviour: text("market_behaviour").notNull(),
  // Explainability fields from Module 5
  why: text("why").notNull().default(""),
  whyNot: text("why_not").notNull().default(""),
  supportingFacts: jsonb("supporting_facts").notNull().default([]),
  missingFacts: jsonb("missing_facts").notNull().default([]),
  evidenceSummary: text("evidence_summary").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("intelligenceReasoning_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("intelligenceReasoning_createdAt_idx").on(table.createdAt)
          }));

export const intelligenceConfidence = pgTable("intelligence_confidence", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  confidenceScore: doublePrecision("confidence_score").notNull(),
  evidenceWeight: doublePrecision("evidence_weight").notNull(),
  observationScore: doublePrecision("observation_score").notNull(),
  dataQualityScore: doublePrecision("data_quality_score").notNull(),
  reasoningStability: doublePrecision("reasoning_stability").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("intelligenceConfidence_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("intelligenceConfidence_createdAt_idx").on(table.createdAt)
          }));

export const intelligenceHypothesis = pgTable("intelligence_hypothesis", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  hypothesis: text("hypothesis").notNull(),
  alternativeHypothesis: text("alternative_hypothesis").notNull(),
  rejectedHypothesis: text("rejected_hypothesis").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  evidenceLinks: jsonb("evidence_links").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("intelligenceHypothesis_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("intelligenceHypothesis_createdAt_idx").on(table.createdAt)
          }));

export const intelligenceGraph = pgTable("intelligence_graph", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  observationGraph: jsonb("observation_graph").notNull().default({}),
  evidenceGraph: jsonb("evidence_graph").notNull().default({}),
  relationshipGraph: jsonb("relationship_graph").notNull().default({}),
  dependencyGraph: jsonb("dependency_graph").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("intelligenceGraph_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("intelligenceGraph_createdAt_idx").on(table.createdAt)
          }));

export const intelligenceRuntime = pgTable("intelligence_runtime", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  queueName: varchar("queue_name", { length: 100 }).notNull(), // DEFAULT, HIGH_PRIORITY
  priority: integer("priority").notNull().default(0),
  executionStatus: varchar("execution_status", { length: 50 }).notNull(), // QUEUED, PROCESSING, COMPLETED, FAILED
  retryCount: integer("retry_count").notNull().default(0),
  timeoutMs: integer("timeout_ms").notNull().default(30000),
  logs: text("logs").notNull().default(""),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
}, (table) => ({
            sessionIdIdx: index("intelligenceRuntime_sessionId_idx").on(table.sessionId)
          }));

export const intelligenceEvents = pgTable("intelligence_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // ReasoningStarted, ReasoningCompleted, HypothesisCreated, ContextBuilt, ConfidenceUpdated, ExplainabilityGenerated
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("intelligenceEvents_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("intelligenceEvents_createdAt_idx").on(table.createdAt)
          }));

export const intelligenceAudit = pgTable("intelligence_audit", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  auditType: varchar("audit_type", { length: 50 }).notNull(), // Reasoning, Evidence, Confidence, Context, Hypothesis
  hash: varchar("hash", { length: 64 }).notNull(), // SHA-256 Protected
  content: jsonb("content").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("intelligenceAudit_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("intelligenceAudit_createdAt_idx").on(table.createdAt)
          }));

// EP08 - Enterprise Strategy Workspace Tables
export const strategyRegistryTable = pgTable("strategy_registry", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  owner: varchar("owner", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("ENABLED"), // ENABLED, DISABLED
  tags: jsonb("tags").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            statusIdx: index("strategyRegistryTable_status_idx").on(table.status),
            createdAtIdx: index("strategyRegistryTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("strategyRegistryTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("strategyRegistryTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const strategyLibraryTable = pgTable("strategy_library", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  rules: jsonb("rules").notNull().default([]),
});

export const strategyParametersTable = pgTable("strategy_parameters", {
  id: varchar("id", { length: 100 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  riskProfile: varchar("risk_profile", { length: 50 }).notNull(),
  timeframe: varchar("timeframe", { length: 50 }).notNull(),
  volumeRules: jsonb("volume_rules").notNull().default({}),
  liquidityRules: jsonb("liquidity_rules").notNull().default({}),
  volatilityRules: jsonb("volatility_rules").notNull().default({}),
  trendRules: jsonb("trend_rules").notNull().default({}),
  sessionRules: jsonb("session_rules").notNull().default({}),
  marketConditions: jsonb("market_conditions").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyParametersTable_strategyId_idx").on(table.strategyId),
            createdAtIdx: index("strategyParametersTable_createdAt_idx").on(table.createdAt),
            strategyIdcreatedAtIdx: index("strategyParametersTable_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

export const strategyEvaluationTable = pgTable("strategy_evaluation", {
  id: varchar("id", { length: 100 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  score: integer("score").notNull(),
  marketStatusValid: boolean("market_status_valid").notNull(),
  contextValid: boolean("context_valid").notNull(),
  reasoningValid: boolean("reasoning_valid").notNull(),
  confidenceValid: boolean("confidence_valid").notNull(),
  evaluationDetails: jsonb("evaluation_details").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyEvaluationTable_strategyId_idx").on(table.strategyId),
            sessionIdIdx: index("strategyEvaluationTable_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("strategyEvaluationTable_createdAt_idx").on(table.createdAt),
            strategyIdcreatedAtIdx: index("strategyEvaluationTable_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

export const strategyRankingTable = pgTable("strategy_ranking", {
  id: varchar("id", { length: 100 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  score: integer("score").notNull(),
  confidence: integer("confidence").notNull(),
  suitability: varchar("suitability", { length: 50 }).notNull(), // HIGH, MEDIUM, LOW
  priority: integer("priority").notNull(),
  rankOrder: integer("rank_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyRankingTable_strategyId_idx").on(table.strategyId),
            createdAtIdx: index("strategyRankingTable_createdAt_idx").on(table.createdAt),
            strategyIdcreatedAtIdx: index("strategyRankingTable_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

export const strategyCandidatesTable = pgTable("strategy_candidates", {
  id: varchar("id", { length: 100 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  aiModelId: varchar("ai_model_id", { length: 100 }).notNull(),
  instrument: varchar("instrument", { length: 100 }).notNull(),
  direction: varchar("direction", { length: 50 }).notNull(), // LONG, SHORT, NEUTRAL
  confidence: integer("confidence").notNull(),
  reasoningRef: varchar("reasoning_ref", { length: 100 }).notNull(),
  status: varchar("status", { length: 100 }).notNull().default("PENDING_COMMITTEE_DECISION"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyCandidatesTable_strategyId_idx").on(table.strategyId),
            aiModelIdIdx: index("strategyCandidatesTable_aiModelId_idx").on(table.aiModelId),
            statusIdx: index("strategyCandidatesTable_status_idx").on(table.status),
            createdAtIdx: index("strategyCandidatesTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("strategyCandidatesTable_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("strategyCandidatesTable_aiModelId_status_idx").on(table.aiModelId, table.status),
            strategyIdcreatedAtIdx: index("strategyCandidatesTable_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

export const strategyRuntimeTable = pgTable("strategy_runtime", {
  id: varchar("id", { length: 100 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  queueName: varchar("queue_name", { length: 100 }).notNull(),
  priority: integer("priority").notNull().default(0),
  executionStatus: varchar("execution_status", { length: 50 }).notNull(), // QUEUED, PROCESSING, COMPLETED, FAILED
  retryCount: integer("retry_count").notNull().default(0),
  timeoutMs: integer("timeout_ms").notNull().default(30000),
  logs: text("logs").notNull().default(""),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
}, (table) => ({
            strategyIdIdx: index("strategyRuntimeTable_strategyId_idx").on(table.strategyId)
          }));

export const strategyEventsTable = pgTable("strategy_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyEventsTable_strategyId_idx").on(table.strategyId),
            createdAtIdx: index("strategyEventsTable_createdAt_idx").on(table.createdAt),
            strategyIdcreatedAtIdx: index("strategyEventsTable_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

export const strategyAuditTable = pgTable("strategy_audit", {
  id: varchar("id", { length: 100 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  auditType: varchar("audit_type", { length: 50 }).notNull(), // Strategy, Evaluation, Ranking, Candidate, Parameter
  hash: varchar("hash", { length: 64 }).notNull(), // SHA-256 Protected
  content: jsonb("content").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("strategyAuditTable_strategyId_idx").on(table.strategyId),
            createdAtIdx: index("strategyAuditTable_createdAt_idx").on(table.createdAt),
            strategyIdcreatedAtIdx: index("strategyAuditTable_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

// EP09 - Enterprise Committee Workspace Tables
export const committeeSessionsTable = pgTable("committee_sessions", {
  id: varchar("id", { length: 100 }).primaryKey(),
  aiModelId: varchar("ai_model_id", { length: 100 }).notNull(),
  workspaceId: varchar("workspace_id", { length: 100 }).notNull(),
  candidateId: varchar("candidate_id", { length: 100 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            aiModelIdIdx: index("committeeSessionsTable_aiModelId_idx").on(table.aiModelId),
            correlationIdIdx: index("committeeSessionsTable_correlationId_idx").on(table.correlationId),
            statusIdx: index("committeeSessionsTable_status_idx").on(table.status),
            createdAtIdx: index("committeeSessionsTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("committeeSessionsTable_status_createdAt_idx").on(table.status, table.createdAt),
            aiModelIdstatusIdx: index("committeeSessionsTable_aiModelId_status_idx").on(table.aiModelId, table.status)
          }));

export const committeeMembersTable = pgTable("committee_members", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(), // Primary AI, Secondary AI, Risk Reviewer, Market Reviewer, Compliance Reviewer, Human Observer
  weight: integer("weight").notNull().default(1),
  vote: varchar("vote", { length: 50 }).notNull().default("ABSTAIN"), // APPROVE, REJECT, HOLD, ABSTAIN
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("committeeMembersTable_sessionId_idx").on(table.sessionId),
            statusIdx: index("committeeMembersTable_status_idx").on(table.status),
            createdAtIdx: index("committeeMembersTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("committeeMembersTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const committeeVotesTable = pgTable("committee_votes", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  memberId: varchar("member_id", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  vote: varchar("vote", { length: 50 }).notNull(), // APPROVE, REJECT, HOLD, ABSTAIN
  weight: integer("weight").notNull().default(1),
  reason: text("reason").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("committeeVotesTable_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("committeeVotesTable_createdAt_idx").on(table.createdAt)
          }));

export const committeeConsensusTable = pgTable("committee_consensus", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  consensusScore: integer("consensus_score").notNull(),
  approvalPercent: doublePrecision("approval_percent").notNull(),
  conflictPercent: doublePrecision("conflict_percent").notNull(),
  confidence: integer("confidence").notNull(),
  decisionStability: varchar("decision_stability", { length: 50 }).notNull(), // STABLE, UNSTABLE, MARGINAL
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("committeeConsensusTable_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("committeeConsensusTable_createdAt_idx").on(table.createdAt)
          }));

export const committeeDecisionsTable = pgTable("committee_decisions", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  candidateId: varchar("candidate_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // APPROVED, REJECTED, ON_HOLD
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("committeeDecisionsTable_sessionId_idx").on(table.sessionId),
            statusIdx: index("committeeDecisionsTable_status_idx").on(table.status),
            createdAtIdx: index("committeeDecisionsTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("committeeDecisionsTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const committeeCertificatesTable = pgTable("committee_certificates", {
  id: varchar("id", { length: 100 }).primaryKey(),
  decisionId: varchar("decision_id", { length: 100 }).notNull(),
  consensusScore: integer("consensus_score").notNull(),
  sha256Hash: varchar("sha256_hash", { length: 64 }).notNull(),
  digitalSignature: text("digital_signature").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            decisionIdIdx: index("committeeCertificatesTable_decisionId_idx").on(table.decisionId),
            createdAtIdx: index("committeeCertificatesTable_createdAt_idx").on(table.createdAt)
          }));

export const committeeRuntimeTable = pgTable("committee_runtime", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  queueName: varchar("queue_name", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // QUEUED, PROCESSING, COMPLETED, FAILED
  retryCount: integer("retry_count").notNull().default(0),
  timeoutMs: integer("timeout_ms").notNull().default(30000),
  logs: text("logs").notNull().default(""),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
}, (table) => ({
            sessionIdIdx: index("committeeRuntimeTable_sessionId_idx").on(table.sessionId),
            statusIdx: index("committeeRuntimeTable_status_idx").on(table.status)
          }));

export const committeeEventsTable = pgTable("committee_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // CommitteeStarted, VotingStarted, ConsensusCompleted, DecisionApproved, DecisionRejected, DecisionHeld
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("committeeEventsTable_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("committeeEventsTable_createdAt_idx").on(table.createdAt)
          }));

export const committeeAuditTable = pgTable("committee_audit", {
  id: varchar("id", { length: 100 }).primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  auditType: varchar("audit_type", { length: 100 }).notNull(), // Voting, Decision, Consensus, Certificate, Runtime
  hash: varchar("hash", { length: 64 }).notNull(),
  content: jsonb("content").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            sessionIdIdx: index("committeeAuditTable_sessionId_idx").on(table.sessionId),
            createdAtIdx: index("committeeAuditTable_createdAt_idx").on(table.createdAt)
          }));

// EP10 - Enterprise Decision Authorization & Execution Control Tables
export const decisionPackagesTable = pgTable("decision_packages", {
  id: varchar("id", { length: 100 }).primaryKey(),
  decisionId: varchar("decision_id", { length: 100 }).notNull(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  aiModel: varchar("ai_model", { length: 100 }).notNull(),
  instrument: varchar("instrument", { length: 50 }).notNull(),
  direction: varchar("direction", { length: 20 }).notNull(),
  confidence: doublePrecision("confidence").notNull().default(0),
  consensus: integer("consensus").notNull().default(0),
  certificate: text("certificate").notNull(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
  packageHash: varchar("package_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            decisionIdIdx: index("decisionPackagesTable_decisionId_idx").on(table.decisionId),
            strategyIdIdx: index("decisionPackagesTable_strategyId_idx").on(table.strategyId),
            correlationIdIdx: index("decisionPackagesTable_correlationId_idx").on(table.correlationId),
            createdAtIdx: index("decisionPackagesTable_createdAt_idx").on(table.createdAt),
            strategyIdcreatedAtIdx: index("decisionPackagesTable_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

export const executionAuthorizationTable = pgTable("execution_authorization", {
  id: varchar("id", { length: 100 }).primaryKey(),
  packageId: varchar("package_id", { length: 100 }).notNull(),
  committeeCertificateVerified: boolean("committee_certificate_verified").notNull().default(false),
  consensusVerified: boolean("consensus_verified").notNull().default(false),
  aiRuntimeVerified: boolean("ai_runtime_verified").notNull().default(false),
  treasuryVerified: boolean("treasury_verified").notNull().default(false),
  marketVerified: boolean("market_verified").notNull().default(false),
  executionPermission: boolean("execution_permission").notNull().default(false),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"), // APPROVED, REJECTED
  reason: text("reason").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            packageIdIdx: index("executionAuthorizationTable_packageId_idx").on(table.packageId),
            statusIdx: index("executionAuthorizationTable_status_idx").on(table.status),
            createdAtIdx: index("executionAuthorizationTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("executionAuthorizationTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const executionQueueTable = pgTable("execution_queue", {
  id: varchar("id", { length: 100 }).primaryKey(),
  packageId: varchar("package_id", { length: 100 }).notNull(),
  priority: integer("priority").notNull().default(1),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"), // PENDING, PROCESSING, RETRYING, SUCCESS, FAILED, CANCELLED
  retryCount: integer("retry_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(3),
  timeoutMs: integer("timeout_ms").notNull().default(30000),
  error: text("error").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            packageIdIdx: index("executionQueueTable_packageId_idx").on(table.packageId),
            statusIdx: index("executionQueueTable_status_idx").on(table.status),
            createdAtIdx: index("executionQueueTable_createdAt_idx").on(table.createdAt),
            updatedAtIdx: index("executionQueueTable_updatedAt_idx").on(table.updatedAt),
            statuscreatedAtIdx: index("executionQueueTable_status_createdAt_idx").on(table.status, table.createdAt)
          }));

export const executionContextTable = pgTable("execution_context", {
  id: varchar("id", { length: 100 }).primaryKey(), // Execution ID
  lifecycleId: varchar("lifecycle_id", { length: 100 }).notNull(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  packageId: varchar("package_id", { length: 100 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("RUNNING"), // RUNNING, COMPLETED, FAILED
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            strategyIdIdx: index("executionContextTable_strategyId_idx").on(table.strategyId),
            packageIdIdx: index("executionContextTable_packageId_idx").on(table.packageId),
            correlationIdIdx: index("executionContextTable_correlationId_idx").on(table.correlationId),
            statusIdx: index("executionContextTable_status_idx").on(table.status),
            createdAtIdx: index("executionContextTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("executionContextTable_status_createdAt_idx").on(table.status, table.createdAt),
            strategyIdcreatedAtIdx: index("executionContextTable_strategyId_createdAt_idx").on(table.strategyId, table.createdAt)
          }));

export const executionLockTable = pgTable("execution_lock", {
  id: varchar("id", { length: 100 }).primaryKey(),
  lockType: varchar("lock_type", { length: 50 }).notNull(), // DECISION, EXECUTION, LIFECYCLE, QUEUE
  lockKey: varchar("lock_key", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("executionLockTable_createdAt_idx").on(table.createdAt)
          }));

export const executionRoutingTable = pgTable("execution_routing", {
  id: varchar("id", { length: 100 }).primaryKey(),
  executionId: varchar("execution_id", { length: 100 }).notNull(),
  targetRoute: varchar("target_route", { length: 50 }).notNull(), // 'PAPER_TRADING'
  status: varchar("status", { length: 50 }).notNull().default("ROUTED"), // ROUTED, COMPLETED, FAILED
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            executionIdIdx: index("executionRoutingTable_executionId_idx").on(table.executionId),
            statusIdx: index("executionRoutingTable_status_idx").on(table.status),
            createdAtIdx: index("executionRoutingTable_createdAt_idx").on(table.createdAt),
            statuscreatedAtIdx: index("executionRoutingTable_status_createdAt_idx").on(table.status, table.createdAt),
            executionIdstatusIdx: index("executionRoutingTable_executionId_status_idx").on(table.executionId, table.status)
          }));

export const executionCertificateTable = pgTable("execution_certificate", {
  id: varchar("id", { length: 100 }).primaryKey(),
  executionId: varchar("execution_id", { length: 100 }).notNull(),
  lifecycleId: varchar("lifecycle_id", { length: 100 }).notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  digitalSignature: text("digital_signature").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            executionIdIdx: index("executionCertificateTable_executionId_idx").on(table.executionId),
            createdAtIdx: index("executionCertificateTable_createdAt_idx").on(table.createdAt)
          }));

export const workspacePreferencesTable = pgTable("workspace_preferences", {
  userId: varchar("user_id", { length: 100 }).primaryKey(),
  workspaceLayout: text("workspace_layout").notNull().default("GRID"),
  savedViews: jsonb("saved_views").notNull().default([]),
  gridSize: integer("grid_size").notNull().default(12),
  tableColumns: jsonb("table_columns").notNull().default({}),
  inspectorWidth: integer("inspector_width").notNull().default(400),
  pinnedPanels: jsonb("pinned_panels").notNull().default([]),
  shortcuts: jsonb("shortcuts").notNull().default({}),
  defaultFilters: jsonb("default_filters").notNull().default({}),
  themeOverride: varchar("theme_override", { length: 50 }).notNull().default("SYSTEM"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
            updatedAtIdx: index("workspacePreferencesTable_updatedAt_idx").on(table.updatedAt)
          }));

export const executionEventsTable = pgTable("execution_events", {
  id: varchar("id", { length: 100 }).primaryKey(),
  packageId: varchar("package_id", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // DecisionReceived, PackageCreated, ExecutionAuthorized, ExecutionRejected, LifecycleStarted, ExecutionCompleted
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            packageIdIdx: index("executionEventsTable_packageId_idx").on(table.packageId),
            createdAtIdx: index("executionEventsTable_createdAt_idx").on(table.createdAt)
          }));

export const executionAuditTable = pgTable("execution_audit", {
  id: varchar("id", { length: 100 }).primaryKey(),
  auditType: varchar("audit_type", { length: 100 }).notNull(), // Authorization, Execution, Certificate, Queue, Routing
  hash: varchar("hash", { length: 64 }).notNull(),
  content: jsonb("content").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
            createdAtIdx: index("executionAuditTable_createdAt_idx").on(table.createdAt)
          }));














// --- FOUNDATION PATCH FP04 - Enterprise Settings & Workspace Preference Consolidation ---
export const system_settings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedBy: varchar("updated_by", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workspace_preferences = pgTable("workspace_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workspaceId: varchar("workspace_id", { length: 100 }).notNull(),
  preferences: jsonb("preferences").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userWorkspaceUnique: unique("user_workspace_unique").on(table.userId, table.workspaceId)
}));

export const preference_versions = pgTable("preference_versions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workspaceId: varchar("workspace_id", { length: 100 }).notNull(),
  preferences: jsonb("preferences").notNull(),
  version: integer("version").notNull(),
  updatedBy: varchar("updated_by", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// EP11: Enterprise Order Management (OMS)
// ==========================================

export const omsOrderBook = pgTable("order_book", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  state: varchar("state", { length: 20 }).notNull().default('PENDING'), // PENDING, QUEUED, WORKING, FILLED, CANCELLED, REJECTED, EXPIRED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const omsOrderQueue = pgTable("order_queue", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  queueType: varchar("queue_type", { length: 50 }).notNull().default('PRIORITY'), // PRIORITY, RETRY, FAILED, RECOVERY
  priority: integer("priority").default(0),
  queuedAt: timestamp("queued_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  status: varchar("status", { length: 20 }).default('WAITING'),
});

export const omsOrderFill = pgTable("order_fill", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  fillPrice: numeric("fill_price", { precision: 12, scale: 2 }).notNull(),
  averagePrice: numeric("average_price", { precision: 12, scale: 2 }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  remainingQuantity: numeric("remaining_quantity", { precision: 12, scale: 4 }).notNull(),
  slippage: numeric("slippage", { precision: 12, scale: 4 }).default("0"),
  executionTime: timestamp("execution_time").defaultNow().notNull(),
});

export const omsOrderState = pgTable("order_state", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  previousState: varchar("previous_state", { length: 20 }),
  newState: varchar("new_state", { length: 20 }).notNull(), // CREATED, VALIDATED, QUEUED, WAITING, ROUTED, FILLED, PARTIAL, REJECTED, CANCELLED, EXPIRED
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  reason: text("reason"),
});

export const omsOrderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventPayload: jsonb("event_payload"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

export const omsOrderCertificate = pgTable("order_certificate", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  sha256Certificate: text("sha256_certificate").notNull(),
  executionSignature: text("execution_signature").notNull(),
  integrityHash: text("integrity_hash").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const omsOrderAudit = pgTable("order_audit", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(), // STATUS_CHANGE, FILL, REJECT, CANCEL, RETRY
  details: text("details"),
  auditTime: timestamp("audit_time").defaultNow().notNull(),
});

// ==========================================
// EP12: Enterprise Portfolio & Position Management (PMS)
// ==========================================

export const pmsPortfolios = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  portfolioOwner: varchar("portfolio_owner", { length: 100 }).notNull(),
  portfolioType: varchar("portfolio_type", { length: 50 }).notNull().default('PAPER'), // PAPER, LIVE, MARGIN
  status: varchar("status", { length: 20 }).notNull().default('ACTIVE'), // ACTIVE, SUSPENDED, ARCHIVED
  currency: varchar("currency", { length: 10 }).notNull().default('INR'), // ATM Currency ONLY
  totalValue: numeric("total_value", { precision: 15, scale: 2 }).notNull().default("0.00"),
  cashBalance: numeric("cash_balance", { precision: 15, scale: 2 }).notNull().default("100000.00"),
  realizedPnl: numeric("realized_pnl", { precision: 15, scale: 2 }).notNull().default("0.00"),
  unrealizedPnl: numeric("unrealized_pnl", { precision: 15, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pmsPositions = pgTable("portfolio_positions", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => pmsPortfolios.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  exchange: varchar("exchange", { length: 20 }).notNull().default('NSE'),
  segment: varchar("segment", { length: 20 }).notNull().default('EQUITY'),
  direction: varchar("direction", { length: 10 }).notNull().default('LONG'), // LONG, SHORT
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull().default("0"),
  averagePrice: numeric("average_price", { precision: 12, scale: 2 }).notNull().default("0"),
  currentPrice: numeric("current_price", { precision: 12, scale: 2 }).notNull().default("0"),
  marketValue: numeric("market_value", { precision: 15, scale: 2 }).notNull().default("0"),
  realizedPnl: numeric("realized_pnl", { precision: 12, scale: 2 }).notNull().default("0"),
  unrealizedPnl: numeric("unrealized_pnl", { precision: 12, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 20 }).notNull().default('OPEN'), // OPEN, PARTIAL_CLOSE, FULL_CLOSE, ARCHIVED
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pmsHoldings = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => pmsPortfolios.id, { onDelete: "cascade" }),
  holdingType: varchar("holding_type", { length: 50 }).notNull(), // EQUITY, ETF, INDEX, FUTURES, OPTIONS, MCX
  totalValue: numeric("total_value", { precision: 15, scale: 2 }).notNull().default("0"),
  allocationPercentage: numeric("allocation_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pmsSnapshots = pgTable("portfolio_snapshots", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => pmsPortfolios.id, { onDelete: "cascade" }),
  snapshotType: varchar("snapshot_type", { length: 20 }).notNull().default('LIVE'), // LIVE, DAILY, WEEKLY, MONTHLY
  totalValue: numeric("total_value", { precision: 15, scale: 2 }).notNull(),
  cashBalance: numeric("cash_balance", { precision: 15, scale: 2 }).notNull(),
  netExposure: numeric("net_exposure", { precision: 15, scale: 2 }).notNull(),
  realizedPnl: numeric("realized_pnl", { precision: 15, scale: 2 }).notNull(),
  unrealizedPnl: numeric("unrealized_pnl", { precision: 15, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const pmsExposure = pgTable("portfolio_exposure", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => pmsPortfolios.id, { onDelete: "cascade" }),
  netExposure: numeric("net_exposure", { precision: 15, scale: 2 }).notNull().default("0"),
  grossExposure: numeric("gross_exposure", { precision: 15, scale: 2 }).notNull().default("0"),
  longExposure: numeric("long_exposure", { precision: 15, scale: 2 }).notNull().default("0"),
  shortExposure: numeric("short_exposure", { precision: 15, scale: 2 }).notNull().default("0"),
  marketExposure: numeric("market_exposure", { precision: 15, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pmsPerformance = pgTable("portfolio_performance", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => pmsPortfolios.id, { onDelete: "cascade" }),
  returns: numeric("returns", { precision: 8, scale: 4 }).notNull().default("0"),
  winningPercentage: numeric("winning_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  losingPercentage: numeric("losing_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  averageHoldingPeriod: numeric("average_holding_period", { precision: 10, scale: 2 }).notNull().default("0"), // in hours
  turnover: numeric("turnover", { precision: 10, scale: 4 }).notNull().default("0"),
  performanceTrend: varchar("performance_trend", { length: 20 }).notNull().default('FLAT'), // UP, DOWN, FLAT
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pmsEvents = pgTable("portfolio_events", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => pmsPortfolios.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventPayload: jsonb("event_payload"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

export const pmsAudit = pgTable("portfolio_audit", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => pmsPortfolios.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(),
  details: text("details"),
  auditTime: timestamp("audit_time").defaultNow().notNull(),
});

// ==========================================
// EP13: Enterprise Risk Management (RMS)
// ==========================================

export const rmsRiskProfiles = pgTable("risk_profiles", {
  id: serial("id").primaryKey(),
  profileOwner: varchar("profile_owner", { length: 100 }).notNull(),
  riskLevel: varchar("risk_level", { length: 50 }).notNull().default('MODERATE'), // LOW, MODERATE, HIGH, AGGRESSIVE
  riskContext: varchar("risk_context", { length: 50 }).notNull().default('ENTERPRISE'),
  status: varchar("status", { length: 20 }).notNull().default('ACTIVE'), // ACTIVE, SUSPENDED, HALTED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rmsRiskRules = pgTable("risk_rules", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => rmsRiskProfiles.id, { onDelete: "cascade" }),
  ruleType: varchar("rule_type", { length: 50 }).notNull(), // MAX_POSITION, MAX_ORDER, MAX_LOSS, MAX_EXPOSURE, MAX_DRAWDOWN
  ruleValue: numeric("rule_value", { precision: 15, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rmsRiskExposure = pgTable("risk_exposure", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => rmsRiskProfiles.id, { onDelete: "cascade" }),
  netExposure: numeric("net_exposure", { precision: 15, scale: 2 }).notNull().default("0"),
  grossExposure: numeric("gross_exposure", { precision: 15, scale: 2 }).notNull().default("0"),
  longExposure: numeric("long_exposure", { precision: 15, scale: 2 }).notNull().default("0"),
  shortExposure: numeric("short_exposure", { precision: 15, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rmsRiskMargin = pgTable("risk_margin", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => rmsRiskProfiles.id, { onDelete: "cascade" }),
  requiredMargin: numeric("required_margin", { precision: 15, scale: 2 }).notNull().default("0"),
  availableMargin: numeric("available_margin", { precision: 15, scale: 2 }).notNull().default("0"),
  blockedMargin: numeric("blocked_margin", { precision: 15, scale: 2 }).notNull().default("0"),
  marginUtilization: numeric("margin_utilization", { precision: 5, scale: 2 }).notNull().default("0"), // Percentage
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rmsRiskLimits = pgTable("risk_limits", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => rmsRiskProfiles.id, { onDelete: "cascade" }),
  limitType: varchar("limit_type", { length: 50 }).notNull(), // POSITION, ORDER, CAPITAL
  limitValue: numeric("limit_value", { precision: 15, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 15, scale: 2 }).notNull().default("0"),
  breached: boolean("breached").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rmsRiskEvents = pgTable("risk_events", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => rmsRiskProfiles.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventPayload: jsonb("event_payload"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

export const rmsRiskCertificates = pgTable("risk_certificates", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => rmsRiskProfiles.id, { onDelete: "cascade" }),
  orderId: integer("order_id").notNull(),
  sha256Certificate: text("sha256_certificate").notNull(),
  riskSignature: text("risk_signature").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('APPROVED'), // APPROVED, REJECTED
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const rmsRiskAudit = pgTable("risk_audit", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => rmsRiskProfiles.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(),
  details: text("details"),
  auditTime: timestamp("audit_time").defaultNow().notNull(),
});

// ==========================================
// EP14: Enterprise Paper Trading Execution Engine
// ==========================================

export const ep14ExecutionRuntime = pgTable("ep14_execution_runtime", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
  executionContext: varchar("execution_context", { length: 50 }).notNull().default('PAPER_TRADING'),
  status: varchar("status", { length: 20 }).notNull().default('READY'), // READY, MATCHING, PARTIAL_FILL, FILLED, REJECTED, EXPIRED, FAILED
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ep14ExecutionFill = pgTable("ep14_execution_fill", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").references(() => ep14ExecutionRuntime.id, { onDelete: "cascade" }),
  fillType: varchar("fill_type", { length: 50 }).notNull(), // FULL_FILL, PARTIAL_FILL, MULTIPLE_FILL
  filledQuantity: numeric("filled_quantity", { precision: 15, scale: 4 }).notNull(),
  averageFillPrice: numeric("average_fill_price", { precision: 15, scale: 2 }).notNull(),
  remainingQuantity: numeric("remaining_quantity", { precision: 15, scale: 4 }).notNull(),
  filledAt: timestamp("filled_at").defaultNow().notNull(),
});

export const ep14ExecutionLatency = pgTable("ep14_execution_latency", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").references(() => ep14ExecutionRuntime.id, { onDelete: "cascade" }),
  exchangeLatencyMs: integer("exchange_latency_ms").notNull().default(0),
  networkDelayMs: integer("network_delay_ms").notNull().default(0),
  executionDelayMs: integer("execution_delay_ms").notNull().default(0),
  queueDelayMs: integer("queue_delay_ms").notNull().default(0),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const ep14ExecutionSlippage = pgTable("ep14_execution_slippage", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").references(() => ep14ExecutionRuntime.id, { onDelete: "cascade" }),
  expectedPrice: numeric("expected_price", { precision: 15, scale: 2 }).notNull(),
  actualPrice: numeric("actual_price", { precision: 15, scale: 2 }).notNull(),
  slippageType: varchar("slippage_type", { length: 50 }).notNull(), // POSITIVE, NEGATIVE, ZERO
  slippageAmount: numeric("slippage_amount", { precision: 15, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const ep14ExecutionEvents = pgTable("ep14_execution_events", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").references(() => ep14ExecutionRuntime.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventPayload: jsonb("event_payload"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

export const ep14ExecutionCertificate = pgTable("ep14_execution_certificate", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").references(() => ep14ExecutionRuntime.id, { onDelete: "cascade" }),
  sha256Certificate: text("sha256_certificate").notNull(),
  executionSignature: text("execution_signature").notNull(),
  executionProof: text("execution_proof").notNull(),
  integrityHash: text("integrity_hash").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const ep14ExecutionAudit = pgTable("ep14_execution_audit", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").references(() => ep14ExecutionRuntime.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(),
  details: text("details"),
  auditTime: timestamp("audit_time").defaultNow().notNull(),
});

// ==========================================
// EP15: Enterprise Trade Lifecycle & Journal (TLJMS)
// ==========================================

export const ep15TradeRegistry = pgTable("ep15_trade_registry", {
  id: serial("id").primaryKey(),
  tradeId: varchar("trade_id", { length: 100 }).notNull(),
  executionId: integer("execution_id"),
  orderId: integer("order_id"),
  positionId: integer("position_id"),
  portfolioId: integer("portfolio_id"),
  tradeContext: varchar("trade_context", { length: 100 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('CREATED'), // CREATED, EXECUTED, PARTIAL, COMPLETED, CLOSED, CANCELLED, ARCHIVED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ep15TradeJournal = pgTable("ep15_trade_journal", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").references(() => ep15TradeRegistry.id, { onDelete: "cascade" }),
  journalEntry: text("journal_entry").notNull(),
  aiDecisionReference: varchar("ai_decision_reference", { length: 100 }),
  strategyReference: varchar("strategy_reference", { length: 100 }),
  committeeReference: varchar("committee_reference", { length: 100 }),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const ep15TradeTimeline = pgTable("ep15_trade_timeline", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").references(() => ep15TradeRegistry.id, { onDelete: "cascade" }),
  decisionTime: timestamp("decision_time"),
  omsTime: timestamp("oms_time"),
  riskApprovalTime: timestamp("risk_approval_time"),
  executionTime: timestamp("execution_time"),
  closeTime: timestamp("close_time"),
  archiveTime: timestamp("archive_time"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ep15TradeReplay = pgTable("ep15_trade_replay", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").references(() => ep15TradeRegistry.id, { onDelete: "cascade" }),
  replayData: jsonb("replay_data"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const ep15TradeEvidence = pgTable("ep15_trade_evidence", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").references(() => ep15TradeRegistry.id, { onDelete: "cascade" }),
  evidenceType: varchar("evidence_type", { length: 50 }).notNull(), // FILL, LATENCY, SLIPPAGE, CERTIFICATE
  evidencePayload: jsonb("evidence_payload"),
  storedAt: timestamp("stored_at").defaultNow().notNull(),
});

export const ep15TradePerformance = pgTable("ep15_trade_performance", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").references(() => ep15TradeRegistry.id, { onDelete: "cascade" }),
  holdingTimeMs: integer("holding_time_ms"),
  executionQualityScore: numeric("execution_quality_score", { precision: 5, scale: 2 }),
  fillQualityScore: numeric("fill_quality_score", { precision: 5, scale: 2 }),
  slippagePercentage: numeric("slippage_percentage", { precision: 10, scale: 4 }),
  averageFillPrice: numeric("average_fill_price", { precision: 15, scale: 2 }),
  tradeDurationMs: integer("trade_duration_ms"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export const ep15TradeCertificate = pgTable("ep15_trade_certificate", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").references(() => ep15TradeRegistry.id, { onDelete: "cascade" }),
  sha256Certificate: text("sha256_certificate").notNull(),
  integrityHash: text("integrity_hash").notNull(),
  digitalSignature: text("digital_signature").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const ep15TradeAudit = pgTable("ep15_trade_audit", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").references(() => ep15TradeRegistry.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(),
  details: text("details"),
  auditTime: timestamp("audit_time").defaultNow().notNull(),
});

export const ep15TradeEvents = pgTable("ep15_trade_events", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").references(() => ep15TradeRegistry.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventPayload: jsonb("event_payload"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

// ==========================================
// EP16: Enterprise Accounting & General Ledger (EGLS)
// ==========================================

export const ep16ChartOfAccounts = pgTable("ep16_chart_of_accounts", {
  id: serial("id").primaryKey(),
  accountCode: varchar("account_code", { length: 50 }).notNull().unique(),
  accountName: varchar("account_name", { length: 100 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  currency: varchar("currency", { length: 10 }).notNull().default('ATM'),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ep16JournalEntries = pgTable("ep16_journal_entries", {
  id: serial("id").primaryKey(),
  entryNumber: varchar("entry_number", { length: 100 }).notNull().unique(),
  tradeId: integer("trade_id"),
  description: text("description"),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).notNull().default('POSTED'), // DRAFT, POSTED, REVERSED
  totalDebit: numeric("total_debit", { precision: 20, scale: 4 }).notNull(),
  totalCredit: numeric("total_credit", { precision: 20, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ep16LedgerTransactions = pgTable("ep16_ledger_transactions", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => ep16JournalEntries.id, { onDelete: "cascade" }),
  accountId: integer("account_id").references(() => ep16ChartOfAccounts.id, { onDelete: "restrict" }),
  transactionType: varchar("transaction_type", { length: 10 }).notNull(), // DEBIT, CREDIT
  amount: numeric("amount", { precision: 20, scale: 4 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 20, scale: 4 }),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
});

export const ep16GeneralLedger = pgTable("ep16_general_ledger", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => ep16ChartOfAccounts.id, { onDelete: "restrict" }).unique(),
  currentBalance: numeric("current_balance", { precision: 20, scale: 4 }).notNull().default("0"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const ep16AccountingPeriods = pgTable("ep16_accounting_periods", {
  id: serial("id").primaryKey(),
  periodName: varchar("period_name", { length: 100 }).notNull(),
  periodType: varchar("period_type", { length: 20 }).notNull(), // DAILY, MONTHLY, QUARTERLY, YEARLY
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('OPEN'), // OPEN, CLOSED
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ep16TrialBalance = pgTable("ep16_trial_balance", {
  id: serial("id").primaryKey(),
  periodId: integer("period_id").references(() => ep16AccountingPeriods.id, { onDelete: "cascade" }),
  accountId: integer("account_id").references(() => ep16ChartOfAccounts.id, { onDelete: "restrict" }),
  debitBalance: numeric("debit_balance", { precision: 20, scale: 4 }).notNull().default("0"),
  creditBalance: numeric("credit_balance", { precision: 20, scale: 4 }).notNull().default("0"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const ep16FinancialStatements = pgTable("ep16_financial_statements", {
  id: serial("id").primaryKey(),
  periodId: integer("period_id").references(() => ep16AccountingPeriods.id, { onDelete: "cascade" }),
  statementType: varchar("statement_type", { length: 50 }).notNull(), // PROFIT_LOSS, BALANCE_SHEET
  payload: jsonb("payload").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const ep16AccountingCertificates = pgTable("ep16_accounting_certificates", {
  id: serial("id").primaryKey(),
  referenceId: integer("reference_id").notNull(), // Could be Journal Entry ID or Period ID
  referenceType: varchar("reference_type", { length: 50 }).notNull(), // JOURNAL_ENTRY, PERIOD_CLOSE
  sha256Certificate: text("sha256_certificate").notNull(),
  integrityHash: text("integrity_hash").notNull(),
  digitalSignature: text("digital_signature").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const ep16AccountingAudit = pgTable("ep16_accounting_audit", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  auditTime: timestamp("audit_time").defaultNow().notNull(),
});

// EP20 Operations Tables
export const operationsServices = pgTable("operations_services", {
  id: serial("id").primaryKey(),
  epCode: varchar("ep_code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("ONLINE"),
  latencyMs: doublePrecision("latency_ms").default(0),
  errorRatePercent: doublePrecision("error_rate_percent").default(0),
  availabilityPercent: doublePrecision("availability_percent").default(100.0),
  version: varchar("version", { length: 50 }).default("v2.0.0"),
  lastPing: timestamp("last_ping").defaultNow().notNull(),
});

export const operationsRuntime = pgTable("operations_runtime", {
  id: serial("id").primaryKey(),
  activeWorkersCount: integer("active_workers_count").default(0),
  activeJobsCount: integer("active_jobs_count").default(0),
  backgroundTasksCount: integer("background_tasks_count").default(0),
  avgExecutionTimeMs: doublePrecision("avg_execution_time_ms").default(0),
  totalFailures24h: integer("total_failures_24h").default(0),
  totalRetries24h: integer("total_retries_24h").default(0),
  threadUtilizationPercent: doublePrecision("thread_utilization_percent").default(0),
  workerDetails: jsonb("worker_details").default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const operationsQueues = pgTable("operations_queues", {
  id: serial("id").primaryKey(),
  pendingJobs: integer("pending_jobs").default(0),
  processingJobs: integer("processing_jobs").default(0),
  completedJobs: integer("completed_jobs").default(0),
  failedJobs: integer("failed_jobs").default(0),
  deadLetterQueueCount: integer("dead_letter_queue_count").default(0),
  retryQueueCount: integer("retry_queue_count").default(0),
  queuesDetails: jsonb("queues_details").default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const operationsIncidents = pgTable("operations_incidents", {
  id: serial("id").primaryKey(),
  incidentId: varchar("incident_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  severity: varchar("severity", { length: 10 }).notNull().default("P3"),
  status: varchar("status", { length: 20 }).notNull().default("OPEN"),
  affectedService: varchar("affected_service", { length: 255 }).notNull(),
  timeline: jsonb("timeline").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const operationsMaintenance = pgTable("operations_maintenance", {
  id: serial("id").primaryKey(),
  maintenanceId: varchar("maintenance_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  mode: varchar("mode", { length: 50 }).notNull().default("READ_ONLY"),
  targetModule: varchar("target_module", { length: 100 }).default("GLOBAL"),
  status: varchar("status", { length: 20 }).notNull().default("SCHEDULED"),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  flagKey: varchar("flag_key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  scope: varchar("scope", { length: 50 }).notNull().default("GLOBAL"),
  targetWorkspaceOrModule: varchar("target_workspace_or_module", { length: 100 }),
  gradualRolloutPercent: integer("gradual_rollout_percent").default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const operationsHealth = pgTable("operations_health", {
  id: serial("id").primaryKey(),
  overallScore: doublePrecision("overall_score").default(100.0),
  availabilityScore: doublePrecision("availability_score").default(100.0),
  latencyScore: doublePrecision("latency_score").default(100.0),
  errorRateScore: doublePrecision("error_rate_score").default(100.0),
  recoveryScore: doublePrecision("recovery_score").default(100.0),
  perModuleHealth: jsonb("per_module_health").default({}),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export const operationsEvents = pgTable("operations_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  moduleCode: varchar("module_code", { length: 50 }),
  payload: jsonb("payload").default({}),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const operationsAudit = pgTable("operations_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  operator: varchar("operator", { length: 255 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// EP21 Reporting & Business Intelligence Tables
export const reportingKpis = pgTable("reporting_kpis", {
  id: serial("id").primaryKey(),
  kpiId: varchar("kpi_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull().default("EXECUTIVE"),
  currentValue: varchar("current_value", { length: 100 }).notNull(),
  previousValue: varchar("previous_value", { length: 100 }),
  targetValue: varchar("target_value", { length: 100 }),
  unit: varchar("unit", { length: 20 }),
  trendPercent: doublePrecision("trend_percent").default(0),
  isPositive: boolean("is_positive").default(true),
  status: varchar("status", { length: 20 }).default("OPTIMAL"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const reportingReports = pgTable("reporting_reports", {
  id: serial("id").primaryKey(),
  reportId: varchar("report_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull().default("EXECUTIVE"),
  generatedBy: varchar("generated_by", { length: 255 }).notNull(),
  format: varchar("format", { length: 20 }).notNull().default("PDF"),
  downloadUrl: varchar("download_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reportingBiQueries = pgTable("reporting_bi_queries", {
  id: serial("id").primaryKey(),
  queryId: varchar("query_id", { length: 50 }).notNull().unique(),
  dimension: varchar("dimension", { length: 100 }).notNull(),
  metric: varchar("metric", { length: 100 }).notNull(),
  timeframe: varchar("timeframe", { length: 50 }).notNull().default("YTD"),
  rowsData: jsonb("rows_data").default([]),
  totalValue: doublePrecision("total_value").default(0),
  computedInMs: integer("computed_in_ms").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reportingSchedules = pgTable("reporting_schedules", {
  id: serial("id").primaryKey(),
  scheduleId: varchar("schedule_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull().default("EXECUTIVE"),
  frequency: varchar("frequency", { length: 50 }).notNull().default("DAILY"),
  recipientEmails: jsonb("recipient_emails").default([]),
  nextRun: timestamp("next_run").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  format: varchar("format", { length: 20 }).default("PDF"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reportingAudit = pgTable("reporting_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  operator: varchar("operator", { length: 255 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ====================================================
// EP22: Enterprise AI Governance & Model Lifecycle Management (AIGML)
// ====================================================

export const aiModelRegistry = pgTable("ai_model_registry", {
  id: serial("id").primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  family: varchar("family", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  owner: varchar("owner", { length: 255 }).notNull(),
  capabilities: jsonb("capabilities").default([]),
  license: varchar("license", { length: 100 }).default("Proprietary"),
  status: varchar("status", { length: 50 }).notNull().default("REGISTERED"),
  approvalStage: varchar("approval_stage", { length: 50 }).notNull().default("Draft"),
  releaseDate: varchar("release_date", { length: 50 }),
  workspace: varchar("workspace", { length: 100 }).default("GLOBAL_SYSTEM"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiModelVersions = pgTable("ai_model_versions", {
  id: serial("id").primaryKey(),
  versionId: varchar("version_id", { length: 50 }).notNull().unique(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  versionNumber: varchar("version_number", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("TESTING"),
  releaseNotes: text("release_notes"),
  compatibilityMatrix: jsonb("compatibility_matrix").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiModelLifecycle = pgTable("ai_model_lifecycle", {
  id: serial("id").primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  previousStatus: varchar("previous_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }).notNull(),
  transitionReason: text("transition_reason"),
  changedBy: varchar("changed_by", { length: 255 }).notNull(),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

export const aiModelEvaluations = pgTable("ai_model_evaluations", {
  id: serial("id").primaryKey(),
  evaluationId: varchar("evaluation_id", { length: 50 }).notNull().unique(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  accuracyPercent: doublePrecision("accuracy_percent").default(0),
  latencyMs: integer("latency_ms").default(0),
  reliabilityPercent: doublePrecision("reliability_percent").default(0),
  costPer1kTokensUSD: doublePrecision("cost_per_1k_tokens_usd").default(0),
  tokenUsage24h: integer("token_usage_24h").default(0),
  successRatePercent: doublePrecision("success_rate_percent").default(0),
  failureRatePercent: doublePrecision("failure_rate_percent").default(0),
  hallucinationRatePercent: doublePrecision("hallucination_rate_percent").default(0),
  responseQualityScore: doublePrecision("response_quality_score").default(0),
  evaluatedAt: timestamp("evaluated_at").defaultNow().notNull(),
});

export const aiModelBenchmarks = pgTable("ai_model_benchmarks", {
  id: serial("id").primaryKey(),
  benchmarkId: varchar("benchmark_id", { length: 50 }).notNull().unique(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  suiteName: varchar("suite_name", { length: 100 }).notNull(),
  score: doublePrecision("score").default(0),
  metrics: jsonb("metrics").default({}),
  runDate: timestamp("run_date").defaultNow().notNull(),
});

export const aiModelLeaderboard = pgTable("ai_model_leaderboard", {
  id: serial("id").primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull().unique(),
  rank: integer("rank").notNull(),
  accuracyScore: doublePrecision("accuracy_score").default(0),
  latencyScore: doublePrecision("latency_score").default(0),
  costEfficiencyScore: doublePrecision("cost_efficiency_score").default(0),
  reliabilityScore: doublePrecision("reliability_score").default(0),
  overallScore: doublePrecision("overall_score").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiProviderRegistry = pgTable("ai_provider_registry", {
  id: serial("id").primaryKey(),
  providerId: varchar("provider_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  apiStatus: varchar("api_status", { length: 50 }).default("HEALTHY"),
  supportedModelsCount: integer("supported_models_count").default(0),
  avgLatencyMs: integer("avg_latency_ms").default(0),
  rateLimitRpm: integer("rate_limit_rpm").default(5000),
  activeKeyConfigured: boolean("active_key_configured").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiPolicyRegistry = pgTable("ai_policy_registry", {
  id: serial("id").primaryKey(),
  policyId: varchar("policy_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  policyType: varchar("policy_type", { length: 100 }).notNull(),
  scope: varchar("scope", { length: 100 }).default("GLOBAL"),
  rules: jsonb("rules").default({}),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiDeployments = pgTable("ai_deployments", {
  id: serial("id").primaryKey(),
  deploymentId: varchar("deployment_id", { length: 50 }).notNull().unique(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  environment: varchar("environment", { length: 50 }).default("PRODUCTION"),
  status: varchar("status", { length: 50 }).default("DEPLOYED"),
  healthStatus: varchar("health_status", { length: 50 }).default("HEALTHY"),
  deployedAt: timestamp("deployed_at").defaultNow().notNull(),
  activeWorkerCount: integer("active_worker_count").default(1),
});

export const aiGovernanceAudit = pgTable("ai_governance_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  modelId: varchar("model_id", { length: 50 }),
  operator: varchar("operator", { length: 255 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// EP23 Enterprise Compliance & Regulatory Engine (ECRE)
export const complianceRules = pgTable("compliance_rules", {
  id: serial("id").primaryKey(),
  ruleId: varchar("rule_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  owner: varchar("owner", { length: 255 }).notNull(),
  version: varchar("version", { length: 20 }).default("v1.0"),
  effectiveDate: varchar("effective_date", { length: 50 }),
  status: varchar("status", { length: 50 }).default("ACTIVE"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const compliancePolicies = pgTable("compliance_policies", {
  id: serial("id").primaryKey(),
  policyId: varchar("policy_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  scope: varchar("scope", { length: 255 }).default("GLOBAL"),
  enforcementMode: varchar("enforcement_mode", { length: 50 }).default("STRICT_BLOCK"),
  rulesCount: integer("rules_count").default(0),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceValidations = pgTable("compliance_validations", {
  id: serial("id").primaryKey(),
  validationId: varchar("validation_id", { length: 50 }).notNull().unique(),
  targetModule: varchar("target_module", { length: 50 }).notNull(),
  ruleId: varchar("rule_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  validatedAt: timestamp("validated_at").defaultNow().notNull(),
  details: text("details"),
});

export const complianceViolations = pgTable("compliance_violations", {
  id: serial("id").primaryKey(),
  violationId: varchar("violation_id", { length: 50 }).notNull().unique(),
  ruleId: varchar("rule_id", { length: 50 }).notNull(),
  ruleName: varchar("rule_name", { length: 255 }),
  targetModule: varchar("target_module", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).default("OPEN"),
  impactDescription: text("impact_description"),
});

export const complianceExceptions = pgTable("compliance_exceptions", {
  id: serial("id").primaryKey(),
  exceptionId: varchar("exception_id", { length: 50 }).notNull().unique(),
  ruleId: varchar("rule_id", { length: 50 }).notNull(),
  requestedBy: varchar("requested_by", { length: 255 }).notNull(),
  approvedBy: varchar("approved_by", { length: 255 }).notNull(),
  businessJustification: text("business_justification").notNull(),
  expiryDate: varchar("expiry_date", { length: 50 }),
  status: varchar("status", { length: 50 }).default("APPROVED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceEvidence = pgTable("compliance_evidence", {
  id: serial("id").primaryKey(),
  evidenceId: varchar("evidence_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  checksumSha256: varchar("checksum_sha256", { length: 64 }).notNull(),
  fileFormat: varchar("file_format", { length: 20 }).default("PDF"),
  storedUrl: varchar("stored_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceReports = pgTable("compliance_reports", {
  id: serial("id").primaryKey(),
  reportId: varchar("report_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  period: varchar("period", { length: 50 }),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("FINAL"),
  downloadUrl: varchar("download_url", { length: 500 }),
});

export const complianceCertificates = pgTable("compliance_certificates", {
  id: serial("id").primaryKey(),
  certificateId: varchar("certificate_id", { length: 50 }).notNull().unique(),
  certificateType: varchar("certificate_type", { length: 100 }).notNull(),
  issuedTo: varchar("issued_to", { length: 255 }).notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  sha256Hash: varchar("sha256_hash", { length: 64 }).notNull(),
  status: varchar("status", { length: 20 }).default("VALID"),
});

export const complianceAudit = pgTable("compliance_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  operator: varchar("operator", { length: 255 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// EP24 Enterprise Observability & Performance Analytics (EOPA)
export const observabilityMetrics = pgTable("observability_metrics", {
  id: serial("id").primaryKey(),
  metricId: varchar("metric_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  value: doublePrecision("value").notNull(),
  unit: varchar("unit", { length: 20 }).default("%"),
  status: varchar("status", { length: 20 }).default("NORMAL"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const observabilityTraces = pgTable("observability_traces", {
  id: serial("id").primaryKey(),
  traceId: varchar("trace_id", { length: 50 }).notNull().unique(),
  correlationId: varchar("correlation_id", { length: 50 }),
  rootModule: varchar("root_module", { length: 50 }).notNull(),
  totalDurationMs: doublePrecision("total_duration_ms").notNull(),
  spansCount: integer("spans_count").default(1),
  status: varchar("status", { length: 20 }).default("COMPLETED"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const observabilitySpans = pgTable("observability_spans", {
  id: serial("id").primaryKey(),
  spanId: varchar("span_id", { length: 50 }).notNull().unique(),
  traceId: varchar("trace_id", { length: 50 }).notNull(),
  parentSpanId: varchar("parent_span_id", { length: 50 }),
  moduleName: varchar("module_name", { length: 50 }).notNull(),
  operation: varchar("operation", { length: 255 }).notNull(),
  durationMs: doublePrecision("duration_ms").notNull(),
  status: varchar("status", { length: 20 }).default("OK"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const observabilityLogs = pgTable("observability_logs", {
  id: serial("id").primaryKey(),
  logId: varchar("log_id", { length: 50 }).notNull().unique(),
  traceId: varchar("trace_id", { length: 50 }),
  sourceModule: varchar("source_module", { length: 50 }).notNull(),
  logLevel: varchar("log_level", { length: 20 }).default("INFO"),
  category: varchar("category", { length: 50 }).default("APP"),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const observabilityErrors = pgTable("observability_errors", {
  id: serial("id").primaryKey(),
  errorId: varchar("error_id", { length: 50 }).notNull().unique(),
  errorType: varchar("error_type", { length: 50 }).notNull(),
  sourceModule: varchar("source_module", { length: 50 }).notNull(),
  message: text("message").notNull(),
  count: integer("count").default(1),
  failureRatePct: doublePrecision("failure_rate_pct").default(0.0),
  lastOccurredAt: timestamp("last_occurred_at").defaultNow().notNull(),
});

export const observabilityCapacity = pgTable("observability_capacity", {
  id: serial("id").primaryKey(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  currentUsagePct: doublePrecision("current_usage_pct").notNull(),
  forecast30DaysPct: doublePrecision("forecast_30_days_pct").notNull(),
  forecast90DaysPct: doublePrecision("forecast_90_days_pct").notNull(),
  recommendedAction: text("recommended_action"),
  status: varchar("status", { length: 30 }).default("OPTIMAL"),
});

export const observabilitySlo = pgTable("observability_slo", {
  id: serial("id").primaryKey(),
  serviceId: varchar("service_id", { length: 50 }).notNull().unique(),
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  targetAvailabilityPct: doublePrecision("target_availability_pct").notNull(),
  currentAvailabilityPct: doublePrecision("current_availability_pct").notNull(),
  latencySloMs: doublePrecision("latency_slo_ms").notNull(),
  currentP95Ms: doublePrecision("current_p95_ms").notNull(),
  errorBudgetRemainingPct: doublePrecision("error_budget_remaining_pct").notNull(),
  status: varchar("status", { length: 30 }).default("MEETING_SLO"),
});

export const observabilityEvents = pgTable("observability_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  sourceModule: varchar("source_module", { length: 50 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const observabilityAudit = pgTable("observability_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 20 }).default("LOW"),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// EP25 Enterprise Backup & Disaster Recovery (EBDR)
export const backupPolicies = pgTable("backup_policies", {
  id: serial("id").primaryKey(),
  policyId: varchar("policy_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  backupType: varchar("backup_type", { length: 30 }).notNull(),
  frequency: varchar("frequency", { length: 30 }).notNull(),
  targetScope: text("target_scope").notNull(),
  retentionDays: integer("retention_days").default(30),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const backupSnapshots = pgTable("backup_snapshots", {
  id: serial("id").primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 50 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  sourceModule: varchar("source_module", { length: 100 }).notNull(),
  sizeMb: doublePrecision("size_mb").notNull(),
  checksumSha256: varchar("checksum_sha256", { length: 128 }).notNull(),
  status: varchar("status", { length: 30 }).default("READY"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const backupJobs = pgTable("backup_jobs", {
  id: serial("id").primaryKey(),
  jobId: varchar("job_id", { length: 50 }).notNull().unique(),
  policyId: varchar("policy_id", { length: 50 }).notNull(),
  backupType: varchar("backup_type", { length: 30 }).notNull(),
  snapshotId: varchar("snapshot_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).default("IN_PROGRESS"),
  sizeMb: doublePrecision("size_mb").notNull(),
  durationMs: integer("duration_ms").default(0),
  checksumSha256: varchar("checksum_sha256", { length: 128 }).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const backupRestores = pgTable("backup_restores", {
  id: serial("id").primaryKey(),
  restoreId: varchar("restore_id", { length: 50 }).notNull().unique(),
  snapshotId: varchar("snapshot_id", { length: 50 }).notNull(),
  restoreType: varchar("restore_type", { length: 30 }).notNull(),
  targetDestination: text("target_destination").notNull(),
  status: varchar("status", { length: 30 }).default("IN_PROGRESS"),
  initiatedBy: varchar("initiated_by", { length: 100 }).notNull(),
  validationResult: text("validation_result"),
  restoredAt: timestamp("restored_at").defaultNow().notNull(),
});

export const backupRecovery = pgTable("backup_recovery", {
  id: serial("id").primaryKey(),
  recoveryPointId: varchar("recovery_point_id", { length: 50 }).notNull().unique(),
  version: varchar("version", { length: 50 }).notNull(),
  windowMinutes: integer("window_minutes").default(5),
  status: varchar("status", { length: 30 }).default("READY"),
  checksumSha256: varchar("checksum_sha256", { length: 128 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const backupRetention = pgTable("backup_retention", {
  id: serial("id").primaryKey(),
  ruleId: varchar("rule_id", { length: 50 }).notNull().unique(),
  backupType: varchar("backup_type", { length: 30 }).notNull(),
  retentionDays: integer("retention_days").default(30),
  autoArchive: boolean("auto_archive").default(true),
  expiryAction: varchar("expiry_action", { length: 30 }).default("COLD_STORAGE"),
  totalStoredMb: doublePrecision("total_stored_mb").default(0.0),
});

export const backupCertificates = pgTable("backup_certificates", {
  id: serial("id").primaryKey(),
  certificateId: varchar("certificate_id", { length: 50 }).notNull().unique(),
  certificateType: varchar("certificate_type", { length: 50 }).notNull(),
  snapshotOrJobId: varchar("snapshot_or_job_id", { length: 50 }).notNull(),
  sha256Hash: varchar("sha256_hash", { length: 128 }).notNull(),
  status: varchar("status", { length: 20 }).default("VALID"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const backupEvents = pgTable("backup_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  sourceModule: varchar("source_module", { length: 50 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const backupAudit = pgTable("backup_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// EP26 Enterprise Scheduler & Automation Engine (ESAE)
export const schedulerJobs = pgTable("scheduler_jobs", {
  id: serial("id").primaryKey(),
  jobId: varchar("job_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  ownerModule: varchar("owner_module", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 30 }).default("NORMAL"),
  status: varchar("status", { length: 30 }).default("PENDING"),
  scheduleType: varchar("schedule_type", { length: 30 }).notNull(),
  cronExpression: varchar("cron_expression", { length: 100 }),
  nextRunAt: timestamp("next_run_at"),
  lastRunAt: timestamp("last_run_at"),
  dependenciesJson: text("dependencies_json"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  timeoutMs: integer("timeout_ms").default(30000),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schedulerSchedules = pgTable("scheduler_schedules", {
  id: serial("id").primaryKey(),
  scheduleId: varchar("schedule_id", { length: 50 }).notNull().unique(),
  jobId: varchar("job_id", { length: 50 }).notNull(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  scheduleType: varchar("schedule_type", { length: 30 }).notNull(),
  expressionOrDelay: varchar("expression_or_delay", { length: 100 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  isEnabled: boolean("is_enabled").default(true),
  nextRunAt: timestamp("next_run_at"),
});

export const schedulerDependencies = pgTable("scheduler_dependencies", {
  id: serial("id").primaryKey(),
  nodeId: varchar("node_id", { length: 50 }).notNull().unique(),
  jobId: varchar("job_id", { length: 50 }).notNull(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  dependsOnJobIdsJson: text("depends_on_job_ids_json"),
  executionOrder: integer("execution_order").default(1),
  isBlocked: boolean("is_blocked").default(false),
  status: varchar("status", { length: 30 }).default("PENDING"),
});

export const schedulerQueue = pgTable("scheduler_queue", {
  id: serial("id").primaryKey(),
  queueId: varchar("queue_id", { length: 50 }).notNull().unique(),
  jobId: varchar("job_id", { length: 50 }).notNull(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  priority: varchar("priority", { length: 30 }).notNull(),
  status: varchar("status", { length: 30 }).default("QUEUED"),
  workerNode: varchar("worker_node", { length: 100 }),
  retryAttempt: integer("retry_attempt").default(0),
  queuedAt: timestamp("queued_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const schedulerRuntime = pgTable("scheduler_runtime", {
  id: serial("id").primaryKey(),
  workerId: varchar("worker_id", { length: 50 }).notNull().unique(),
  workerType: varchar("worker_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).default("ONLINE"),
  currentJobId: varchar("current_job_id", { length: 50 }),
  processedCount: integer("processed_count").default(0),
  uptimeSeconds: integer("uptime_seconds").default(0),
});

export const schedulerRetry = pgTable("scheduler_retry", {
  id: serial("id").primaryKey(),
  retryId: varchar("retry_id", { length: 50 }).notNull().unique(),
  jobId: varchar("job_id", { length: 50 }).notNull(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  failedAttempt: integer("failed_attempt").default(1),
  lastError: text("last_error"),
  nextRetryAt: timestamp("next_retry_at"),
  exponentialBackoffSec: integer("exponential_backoff_sec").default(60),
  inDeadLetterQueue: boolean("in_dead_letter_queue").default(false),
});

export const schedulerCalendar = pgTable("scheduler_calendar", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 50 }).notNull().unique(),
  jobId: varchar("job_id", { length: 50 }).notNull(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  recurrence: varchar("recurrence", { length: 100 }),
  status: varchar("status", { length: 30 }).default("UPCOMING"),
});

export const schedulerEvents = pgTable("scheduler_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  sourceModule: varchar("source_module", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const schedulerAudit = pgTable("scheduler_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// EP27 Enterprise API Gateway & External Integrations (EAGI)
export const gatewayRoutes = pgTable("gateway_routes", {
  id: serial("id").primaryKey(),
  routeId: varchar("route_id", { length: 50 }).notNull().unique(),
  path: varchar("path", { length: 255 }).notNull(),
  targetModule: varchar("target_module", { length: 100 }).notNull(),
  targetEndpoint: varchar("target_endpoint", { length: 255 }).notNull(),
  version: varchar("version", { length: 20 }).default("v1"),
  authRequired: boolean("auth_required").default(true),
  allowedMethodsJson: text("allowed_methods_json"),
  rateLimitPerMin: integer("rate_limit_per_min").default(600),
  status: varchar("status", { length: 30 }).default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gatewayVersions = pgTable("gateway_versions", {
  id: serial("id").primaryKey(),
  versionId: varchar("version_id", { length: 50 }).notNull().unique(),
  version: varchar("version", { length: 20 }).notNull(),
  releaseDate: varchar("release_date", { length: 30 }),
  deprecationDate: varchar("deprecation_date", { length: 30 }),
  activeRoutesCount: integer("active_routes_count").default(0),
  compatibilityStatus: varchar("compatibility_status", { length: 30 }).default("CURRENT"),
});

export const gatewayApiKeys = pgTable("gateway_api_keys", {
  id: serial("id").primaryKey(),
  keyId: varchar("key_id", { length: 50 }).notNull().unique(),
  keyPrefix: varchar("key_prefix", { length: 50 }).notNull(),
  ownerName: varchar("owner_name", { length: 100 }).notNull(),
  organization: varchar("organization", { length: 100 }),
  assignedRole: varchar("assigned_role", { length: 50 }),
  rateLimitTier: varchar("rate_limit_tier", { length: 50 }),
  status: varchar("status", { length: 30 }).default("ACTIVE"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

export const gatewayRateLimits = pgTable("gateway_rate_limits", {
  id: serial("id").primaryKey(),
  ruleId: varchar("rule_id", { length: 50 }).notNull().unique(),
  scope: varchar("scope", { length: 50 }).notNull(),
  requestsPerMinute: integer("requests_per_minute").notNull(),
  burstCapacity: integer("burst_capacity").notNull(),
  currentUsagePercent: doublePrecision("current_usage_percent").default(0),
  status: varchar("status", { length: 30 }).default("ENFORCED"),
});

export const gatewayWebhooks = pgTable("gateway_webhooks", {
  id: serial("id").primaryKey(),
  webhookId: varchar("webhook_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  direction: varchar("direction", { length: 30 }).notNull(),
  targetUrl: text("target_url").notNull(),
  eventSubscriptionsJson: text("event_subscriptions_json"),
  signatureVerified: boolean("signature_verified").default(true),
  deliverySuccessRate: doublePrecision("delivery_success_rate").default(100.0),
  status: varchar("status", { length: 30 }).default("DELIVERED"),
  lastTriggeredAt: timestamp("last_triggered_at"),
});

export const gatewayConnectors = pgTable("gateway_connectors", {
  id: serial("id").primaryKey(),
  connectorId: varchar("connector_id", { length: 50 }).notNull().unique(),
  connectorName: varchar("connector_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  endpointUrl: text("endpoint_url").notNull(),
  authMethod: varchar("auth_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).default("HEALTHY"),
  avgLatencyMs: integer("avg_latency_ms").default(0),
});

export const gatewayAnalytics = pgTable("gateway_analytics", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 30 }).notNull(),
  totalRequestsToday: integer("total_requests_today").default(0),
  avgLatencyMs: doublePrecision("avg_latency_ms").default(0),
  success2xxCount: integer("success_2xx_count").default(0),
  client4xxCount: integer("client_4xx_count").default(0),
  server5xxCount: integer("server_5xx_count").default(0),
  rateLimitBlocksCount: integer("rate_limit_blocks_count").default(0),
  gatewayHealthScore: doublePrecision("gateway_health_score").default(100.0),
});

export const gatewayEvents = pgTable("gateway_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  sourceModule: varchar("source_module", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const gatewayAudit = pgTable("gateway_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  clientIp: varchar("client_ip", { length: 50 }),
  operatorOrApiKey: varchar("operator_or_api_key", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// EP28 Enterprise Security Operations Center (SOC)
export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 50 }).notNull().unique(),
  sourceModule: varchar("source_module", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  clientIp: varchar("client_ip", { length: 50 }),
  severity: varchar("severity", { length: 30 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const securityThreats = pgTable("security_threats", {
  id: serial("id").primaryKey(),
  threatId: varchar("threat_id", { length: 50 }).notNull().unique(),
  threatType: varchar("threat_type", { length: 50 }).notNull(),
  targetResource: varchar("target_resource", { length: 255 }).notNull(),
  sourceIp: varchar("source_ip", { length: 50 }),
  detectedCount: integer("detected_count").default(1),
  status: varchar("status", { length: 30 }).default("ACTIVE"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
});

export const securityIntrusions = pgTable("security_intrusions", {
  id: serial("id").primaryKey(),
  intrusionId: varchar("intrusion_id", { length: 50 }).notNull().unique(),
  detectionType: varchar("detection_type", { length: 50 }).notNull(),
  sourceIp: varchar("source_ip", { length: 50 }).notNull(),
  attemptedResource: varchar("attempted_resource", { length: 255 }),
  blockedCount: integer("blocked_count").default(1),
  status: varchar("status", { length: 30 }).default("BLOCKED"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const securityVulnerabilities = pgTable("security_vulnerabilities", {
  id: serial("id").primaryKey(),
  vulnerabilityId: varchar("vulnerability_id", { length: 50 }).notNull().unique(),
  cveOrIdentifier: varchar("cve_or_identifier", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 30 }).notNull(),
  affectedComponent: varchar("affected_component", { length: 255 }).notNull(),
  status: varchar("status", { length: 30 }).default("OPEN"),
  owner: varchar("owner", { length: 100 }),
  discoveredAt: timestamp("discovered_at").defaultNow().notNull(),
});

export const securitySecrets = pgTable("security_secrets", {
  id: serial("id").primaryKey(),
  secretId: varchar("secret_id", { length: 50 }).notNull().unique(),
  secretName: varchar("secret_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  rotationStatus: varchar("rotation_status", { length: 30 }).default("HEALTHY"),
  lastRotatedAt: timestamp("last_rotated_at"),
  expiresAt: timestamp("expires_at"),
});

export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  alertId: varchar("alert_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  severity: varchar("severity", { length: 30 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  isAcknowledged: boolean("is_acknowledged").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const securityIncidents = pgTable("security_incidents", {
  id: serial("id").primaryKey(),
  incidentId: varchar("incident_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  severity: varchar("severity", { length: 30 }).notNull(),
  status: varchar("status", { length: 30 }).default("OPEN"),
  assignee: varchar("assignee", { length: 100 }),
  containmentDetails: text("containment_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const securityRuntime = pgTable("security_runtime", {
  id: serial("id").primaryKey(),
  workerId: varchar("worker_id", { length: 50 }).notNull().unique(),
  workerType: varchar("worker_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).default("ONLINE"),
  processedCount: integer("processed_count").default(0),
  uptimeSeconds: integer("uptime_seconds").default(0),
});

export const securityAudit = pgTable("security_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// EP29 Enterprise Release & Environment Management (EREM)
export const releaseEnvironments = pgTable("release_environments", {
  id: serial("id").primaryKey(),
  envId: varchar("env_id", { length: 50 }).notNull().unique(),
  envName: varchar("env_name", { length: 50 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 30 }).default("HEALTHY"),
  activeVersion: varchar("active_version", { length: 50 }),
  activeDeploymentId: varchar("active_deployment_id", { length: 50 }),
  hostUrl: varchar("host_url", { length: 255 }),
  lastDeployedAt: timestamp("last_deployed_at").defaultNow().notNull(),
});

export const releaseVersions = pgTable("release_versions", {
  id: serial("id").primaryKey(),
  versionId: varchar("version_id", { length: 50 }).notNull().unique(),
  semver: varchar("semver", { length: 50 }).notNull(),
  releaseTag: varchar("release_tag", { length: 100 }).notNull(),
  commitHash: varchar("commit_hash", { length: 100 }).notNull(),
  isRollbackTarget: boolean("is_rollback_target").default(true),
  compatibilityStatus: varchar("compatibility_status", { length: 50 }).default("COMPATIBLE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const releaseRegistry = pgTable("release_registry", {
  id: serial("id").primaryKey(),
  releaseId: varchar("release_id", { length: 50 }).notNull().unique(),
  version: varchar("version", { length: 50 }).notNull(),
  releaseName: varchar("release_name", { length: 255 }).notNull(),
  owner: varchar("owner", { length: 100 }).notNull(),
  releaseNotes: text("release_notes"),
  approvalStatus: varchar("approval_status", { length: 50 }).default("DRAFT"),
  targetEnvironment: varchar("target_environment", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const releaseDeployments = pgTable("release_deployments", {
  id: serial("id").primaryKey(),
  deploymentId: varchar("deployment_id", { length: 50 }).notNull().unique(),
  releaseId: varchar("release_id", { length: 50 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  environment: varchar("environment", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).default("QUEUED"),
  pipelineStep: varchar("pipeline_step", { length: 50 }).default("BUILD"),
  triggeredBy: varchar("triggered_by", { length: 100 }).notNull(),
  durationSeconds: integer("duration_seconds").default(0),
  deployedAt: timestamp("deployed_at").defaultNow().notNull(),
});

export const releaseConfigurations = pgTable("release_configurations", {
  id: serial("id").primaryKey(),
  configId: varchar("config_id", { length: 50 }).notNull().unique(),
  environment: varchar("environment", { length: 50 }).notNull(),
  profileName: varchar("profile_name", { length: 255 }).notNull(),
  secretsReferenceCount: integer("secrets_reference_count").default(0),
  lastUpdatedBy: varchar("last_updated_by", { length: 100 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const releaseApprovals = pgTable("release_approvals", {
  id: serial("id").primaryKey(),
  approvalId: varchar("approval_id", { length: 50 }).notNull().unique(),
  releaseId: varchar("release_id", { length: 50 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  approverRole: varchar("approver_role", { length: 50 }).notNull(),
  approverName: varchar("approver_name", { length: 100 }).notNull(),
  decision: varchar("decision", { length: 30 }).notNull(),
  comments: text("comments"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const releaseRollbacks = pgTable("release_rollbacks", {
  id: serial("id").primaryKey(),
  rollbackId: varchar("rollback_id", { length: 50 }).notNull().unique(),
  deploymentId: varchar("deployment_id", { length: 50 }).notNull(),
  environment: varchar("environment", { length: 50 }).notNull(),
  fromVersion: varchar("from_version", { length: 50 }).notNull(),
  toVersion: varchar("to_version", { length: 50 }).notNull(),
  rollbackType: varchar("rollback_type", { length: 50 }).default("APPLICATION"),
  executedBy: varchar("executed_by", { length: 100 }).notNull(),
  status: varchar("status", { length: 30 }).default("SUCCESS"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const releaseRuntime = pgTable("release_runtime", {
  id: serial("id").primaryKey(),
  workerId: varchar("worker_id", { length: 50 }).notNull().unique(),
  workerType: varchar("worker_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).default("ONLINE"),
  processedJobs: integer("processed_jobs").default(0),
  uptimeSeconds: integer("uptime_seconds").default(0),
});

export const releaseAudit = pgTable("release_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// EP30 Enterprise Certification & Production Readiness (ECPR)
export const certificationRuns = pgTable("certification_runs", {
  id: serial("id").primaryKey(),
  certificateId: varchar("certificate_id", { length: 100 }).notNull().unique(),
  overallDecision: varchar("overall_decision", { length: 30 }).notNull(),
  overallScore: integer("overall_score").default(0),
  certifiedBy: varchar("certified_by", { length: 150 }).notNull(),
  certifiedAt: timestamp("certified_at").defaultNow().notNull(),
});

export const certificationResults = pgTable("certification_results", {
  id: serial("id").primaryKey(),
  certificateId: varchar("certificate_id", { length: 100 }).notNull(),
  moduleId: varchar("module_id", { length: 50 }).notNull(),
  moduleName: varchar("module_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 30 }).default("PASSED"),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const certificationScores = pgTable("certification_scores", {
  id: serial("id").primaryKey(),
  certificateId: varchar("certificate_id", { length: 100 }).notNull().unique(),
  architectureScore: integer("architecture_score").default(100),
  securityScore: integer("security_score").default(100),
  performanceScore: integer("performance_score").default(100),
  complianceScore: integer("compliance_score").default(100),
  reliabilityScore: integer("reliability_score").default(100),
  maintainabilityScore: integer("maintainability_score").default(100),
  productionReadinessScore: integer("production_readiness_score").default(100),
  evaluatedAt: timestamp("evaluated_at").defaultNow().notNull(),
});

export const certificationEvidence = pgTable("certification_evidence", {
  id: serial("id").primaryKey(),
  evidenceId: varchar("evidence_id", { length: 50 }).notNull().unique(),
  certificateId: varchar("certificate_id", { length: 100 }).notNull(),
  evidenceType: varchar("evidence_type", { length: 100 }).notNull(),
  evidencePayload: text("evidence_payload").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const certificationAudit = pgTable("certification_audit", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 50 }).notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Phase 2.1A: Constitution Engine Foundation & Enterprise Upgrade
export const constitutionVersions = pgTable("constitution_versions", {
  id: serial("id").primaryKey(),
  versionId: varchar("version_id", { length: 50 }).notNull().unique(),
  parentVersionId: varchar("parent_version_id", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  hash: varchar("hash", { length: 128 }).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  metadata: jsonb("metadata").default({}),
  createdBy: varchar("created_by", { length: 100 }).default("SYSTEM").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const constitutionRegistry = pgTable("constitution_registry", {
  id: serial("id").primaryKey(),
  registryId: varchar("registry_id", { length: 100 }).notNull().unique(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).default("GOVERNANCE").notNull(),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  config: jsonb("config").default({}),
  isLocked: boolean("is_locked").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const constitutionModules = pgTable("constitution_modules", {
  id: serial("id").primaryKey(),
  moduleId: varchar("module_id", { length: 100 }).notNull().unique(),
  moduleName: varchar("module_name", { length: 255 }).notNull(),
  version: varchar("version", { length: 50 }).default("1.0.0").notNull(),
  status: varchar("status", { length: 50 }).default("REGISTERED").notNull(),
  capabilities: jsonb("capabilities").default([]),
  dependencies: jsonb("dependencies").default([]),
  signature: varchar("signature", { length: 255 }),
  registeredBy: varchar("registered_by", { length: 100 }).default("ADMIN").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow().notNull(),
});

export const constitutionMetadata = pgTable("constitution_metadata", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  isReadOnly: boolean("is_read_only").default(true).notNull(),
  updatedBy: varchar("updated_by", { length: 100 }).default("SYSTEM").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const constitutionRules = pgTable("constitution_rules", {
  id: serial("id").primaryKey(),
  ruleId: varchar("rule_id", { length: 100 }).notNull().unique(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  priority: integer("priority").default(1).notNull(),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  config: jsonb("config").default({}),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const constitutionSnapshots = pgTable("constitution_snapshots", {
  id: serial("id").primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 100 }).notNull().unique(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  hash: varchar("hash", { length: 128 }).notNull(),
  snapshotData: jsonb("snapshot_data").notNull(),
  isReadOnly: boolean("is_read_only").default(true).notNull(),
  createdBy: varchar("created_by", { length: 100 }).default("SYSTEM").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const constitutionAuditTrail = pgTable("constitution_audit_trail", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 100 }).notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 100 }).notNull(),
  targetId: varchar("target_id", { length: 100 }).notNull(),
  operator: varchar("operator", { length: 100 }).default("SYSTEM").notNull(),
  details: jsonb("details").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const constitutionPolicies = pgTable("constitution_policies", {
  id: serial("id").primaryKey(),
  policyId: varchar("policy_id", { length: 100 }).notNull().unique(),
  policyName: varchar("policy_name", { length: 255 }).notNull(),
  versionId: varchar("version_id", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  priority: integer("priority").default(1).notNull(),
  version: varchar("version", { length: 50 }).default("1.0.0").notNull(),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  config: jsonb("config").default({}),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Phase 2.2 & 2.2A: Research Center Foundation & Enterprise Hardening Tables
export const researchItems = pgTable("research_items", {
  id: serial("id").primaryKey(),
  researchId: varchar("research_id", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("DRAFT").notNull(),
  source: varchar("source", { length: 100 }),
  sourceUrl: varchar("source_url", { length: 500 }),
  author: varchar("author", { length: 100 }),
  tags: jsonb("tags").default([]),
  metadata: jsonb("metadata").default({}),
  confidenceLevel: varchar("confidence_level", { length: 50 }).default("MEDIUM"),
  qualityScore: numeric("quality_score", { precision: 5, scale: 2 }).default("75.00"),
  isDuplicate: boolean("is_duplicate").default(false),
  duplicateOf: varchar("duplicate_of", { length: 100 }),
  duplicateType: varchar("duplicate_type", { length: 100 }),
  evidenceCount: integer("evidence_count").default(0),
  organizationId: varchar("organization_id", { length: 100 }),
  createdBy: varchar("created_by", { length: 100 }).default("SYSTEM").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchCategories = pgTable("research_categories", {
  id: serial("id").primaryKey(),
  categoryId: varchar("category_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  isSystem: boolean("is_system").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchTags = pgTable("research_tags", {
  id: serial("id").primaryKey(),
  tagId: varchar("tag_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchMetadata = pgTable("research_metadata", {
  id: serial("id").primaryKey(),
  researchId: varchar("research_id", { length: 100 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: jsonb("value").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchSourceRegistry = pgTable("research_source_registry", {
  id: serial("id").primaryKey(),
  sourceId: varchar("source_id", { length: 100 }).notNull().unique(),
  sourceName: varchar("source_name", { length: 150 }).notNull(),
  sourceType: varchar("source_type", { length: 100 }).notNull(),
  priority: integer("priority").default(1).notNull(),
  reliabilityScore: numeric("reliability_score", { precision: 5, scale: 2 }).default("80.00").notNull(),
  trustLevel: varchar("trust_level", { length: 50 }).default("HIGH").notNull(),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchPipelineRuns = pgTable("research_pipeline_runs", {
  id: serial("id").primaryKey(),
  runId: varchar("run_id", { length: 100 }).notNull().unique(),
  researchId: varchar("research_id", { length: 100 }).notNull(),
  currentStage: varchar("current_stage", { length: 50 }).notNull(),
  executionTimeMs: integer("execution_time_ms").default(0),
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  stageHistory: jsonb("stage_history").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchEntities = pgTable("research_entities", {
  id: serial("id").primaryKey(),
  entityId: varchar("entity_id", { length: 100 }).notNull().unique(),
  researchId: varchar("research_id", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  value: varchar("value", { length: 255 }),
  symbol: varchar("symbol", { length: 50 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchRelationships = pgTable("research_relationships", {
  id: serial("id").primaryKey(),
  relationshipId: varchar("relationship_id", { length: 100 }).notNull().unique(),
  sourceResearchId: varchar("source_research_id", { length: 100 }).notNull(),
  targetResearchId: varchar("target_research_id", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  strength: numeric("strength", { precision: 3, scale: 2 }).default("1.00"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const researchVersions = pgTable("research_versions", {
  id: serial("id").primaryKey(),
  versionId: varchar("version_id", { length: 100 }).notNull().unique(),
  researchId: varchar("research_id", { length: 100 }).notNull(),
  versionNumber: integer("version_number").notNull(),
  previousVersionId: varchar("previous_version_id", { length: 100 }),
  content: text("content").notNull(),
  summary: text("summary"),
  author: varchar("author", { length: 100 }).notNull(),
  rollbackMetadata: jsonb("rollback_metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Phase 2.3 AI Brain Foundation Schema
// ==========================================

export const brainKnowledge = pgTable("brain_knowledge", {
  id: serial("id").primaryKey(),
  knowledgeId: varchar("knowledge_id", { length: 100 }).notNull().unique(),
  researchId: varchar("research_id", { length: 100 }),
  knowledgeType: varchar("knowledge_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  content: text("content").notNull(),
  tags: jsonb("tags").default([]),
  confidence: numeric("confidence", { precision: 5, scale: 2 }).default("85.00"),
  source: varchar("source", { length: 150 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const brainMemory = pgTable("brain_memory", {
  id: serial("id").primaryKey(),
  memoryId: varchar("memory_id", { length: 100 }).notNull().unique(),
  memoryType: varchar("memory_type", { length: 100 }).notNull(),
  key: varchar("key", { length: 150 }).notNull(),
  value: jsonb("value").notNull(),
  sessionId: varchar("sessionId", { length: 100 }),
  ttl: integer("ttl"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const brainContext = pgTable("brain_context", {
  id: serial("id").primaryKey(),
  contextId: varchar("context_id", { length: 100 }).notNull().unique(),
  contextType: varchar("context_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  payload: jsonb("payload").notNull(),
  reasoning: text("reasoning"),
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }).default("85.00"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brainFoundationSessions = pgTable("brain_foundation_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(),
  userId: varchar("user_id", { length: 100 }).default("SYSTEM"),
  status: varchar("status", { length: 50 }).default("ACTIVE"),
  memorySummary: jsonb("memory_summary").default({}),
  activeContextId: varchar("active_context_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const brainMetadata = pgTable("brain_metadata", {
  id: serial("id").primaryKey(),
  metadataId: varchar("metadata_id", { length: 100 }).notNull().unique(),
  key: varchar("key", { length: 100 }).notNull(),
  value: jsonb("value").default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// Phase 2.4 AI Decision Engine Foundation Schema
// ==========================================

export const decisionRecords = pgTable("decision_records", {
  id: serial("id").primaryKey(),
  decisionId: varchar("decision_id", { length: 100 }).notNull().unique(),
  contextId: varchar("context_id", { length: 100 }),
  symbol: varchar("symbol", { length: 100 }),
  decisionType: varchar("decision_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("CREATED").notNull(),
  confidence: varchar("confidence", { length: 50 }).default("MEDIUM").notNull(),
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }).default("75.00"),
  riskScore: numeric("risk_score", { precision: 5, scale: 2 }).default("30.00"),
  priority: varchar("priority", { length: 50 }).default("NORMAL").notNull(),
  reasoningSummary: text("reasoning_summary"),
  supportingEvidence: jsonb("supporting_evidence").default([]),
  knowledgeReferences: jsonb("knowledge_references").default([]),
  policyReferences: jsonb("policy_references").default([]),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const decisionContext = pgTable("decision_context", {
  id: serial("id").primaryKey(),
  contextRecordId: varchar("context_record_id", { length: 100 }).notNull().unique(),
  decisionId: varchar("decision_id", { length: 100 }).notNull(),
  brainContextId: varchar("brain_context_id", { length: 100 }),
  snapshot: jsonb("snapshot").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const decisionEvidence = pgTable("decision_evidence", {
  id: serial("id").primaryKey(),
  evidenceId: varchar("evidence_id", { length: 100 }).notNull().unique(),
  decisionId: varchar("decision_id", { length: 100 }).notNull(),
  evidenceType: varchar("evidence_type", { length: 100 }).notNull(),
  source: varchar("source", { length: 150 }),
  content: text("content"),
  score: numeric("score", { precision: 5, scale: 2 }).default("80.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const decisionMetadata = pgTable("decision_metadata", {
  id: serial("id").primaryKey(),
  metadataId: varchar("metadata_id", { length: 100 }).notNull().unique(),
  decisionId: varchar("decision_id", { length: 100 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: jsonb("value").default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const decisionHistory = pgTable("decision_history", {
  id: serial("id").primaryKey(),
  historyId: varchar("history_id", { length: 100 }).notNull().unique(),
  decisionId: varchar("decision_id", { length: 100 }).notNull(),
  fromStatus: varchar("from_status", { length: 50 }),
  toStatus: varchar("to_status", { length: 50 }).notNull(),
  changedBy: varchar("changed_by", { length: 100 }).default("SYSTEM"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const strategyEngineDefinitions = pgTable("strategy_engine_definitions", {
  id: serial("id").primaryKey(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  strategyType: varchar("strategy_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("DRAFT").notNull(),
  timeframe: varchar("timeframe", { length: 50 }).default("1D"),
  symbol: varchar("symbol", { length: 100 }),
  config: jsonb("config").default({}),
  description: text("description"),
  author: varchar("author", { length: 100 }).default("SYSTEM"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const strategyEngineSignals = pgTable("strategy_engine_signals", {
  id: serial("id").primaryKey(),
  signalId: varchar("signal_id", { length: 100 }).notNull().unique(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 100 }).notNull(),
  timeframe: varchar("timeframe", { length: 50 }).default("1D"),
  signalType: varchar("signal_type", { length: 50 }).notNull(),
  confidence: varchar("confidence", { length: 50 }).default("MEDIUM").notNull(),
  strength: numeric("strength", { precision: 5, scale: 2 }).default("75.00"),
  priority: varchar("priority", { length: 50 }).default("NORMAL").notNull(),
  supportingContext: jsonb("supporting_context").default({}),
  reasoningSummary: text("reasoning_summary"),
  lifecycleStatus: varchar("lifecycle_status", { length: 50 }).default("ACTIVE").notNull(),
  metadata: jsonb("metadata").default({}),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const strategyEngineMetadata = pgTable("strategy_engine_metadata", {
  id: serial("id").primaryKey(),
  metadataId: varchar("metadata_id", { length: 100 }).notNull().unique(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: jsonb("value").default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const strategyEngineHistory = pgTable("strategy_engine_history", {
  id: serial("id").primaryKey(),
  historyId: varchar("history_id", { length: 100 }).notNull().unique(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  fromStatus: varchar("from_status", { length: 50 }),
  toStatus: varchar("to_status", { length: 50 }).notNull(),
  changedBy: varchar("changed_by", { length: 100 }).default("SYSTEM"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const strategyEngineExecutionLogs = pgTable("strategy_engine_execution_logs", {
  id: serial("id").primaryKey(),
  logId: varchar("log_id", { length: 100 }).notNull().unique(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull(),
  runId: varchar("run_id", { length: 100 }).notNull(),
  stage: varchar("stage", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  executionTimeMs: integer("execution_time_ms").default(0),
  failureReason: text("failure_reason"),
  details: jsonb("details").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const runtimeGovernancePolicies = pgTable("runtime_governance_policies", {
  id: serial("id").primaryKey(),
  policyId: varchar("policy_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  enforcementLevel: varchar("enforcement_level", { length: 50 }).notNull().default("STRICT_BLOCK"),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  priority: integer("priority").default(10),
  ruleConfig: jsonb("rule_config").default({}),
  description: text("description"),
  author: varchar("author", { length: 100 }).default("SYSTEM"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const runtimeGovernanceCircuitBreakers = pgTable("runtime_governance_circuit_breakers", {
  id: serial("id").primaryKey(),
  target: varchar("target", { length: 100 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("CLOSED"),
  tripCount: integer("trip_count").default(0),
  lastTrippedAt: timestamp("last_tripped_at"),
  cooldownMs: integer("cooldown_ms").default(60000),
  reason: text("reason"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const runtimeGovernanceKillSwitches = pgTable("runtime_governance_kill_switches", {
  id: serial("id").primaryKey(),
  scope: varchar("scope", { length: 50 }).notNull().unique(),
  isActive: boolean("is_active").default(false).notNull(),
  activatedBy: varchar("activated_by", { length: 100 }),
  activatedAt: timestamp("activated_at"),
  reason: text("reason"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const runtimeGovernanceAuditLogs = pgTable("runtime_governance_audit_logs", {
  id: serial("id").primaryKey(),
  logId: varchar("log_id", { length: 100 }).notNull().unique(),
  evaluationId: varchar("evaluation_id", { length: 100 }),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  actorId: varchar("actor_id", { length: 100 }),
  resultStatus: varchar("result_status", { length: 50 }).notNull(),
  riskScore: doublePrecision("risk_score").default(0.0),
  details: jsonb("details").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fundAccounts = pgTable("fund_accounts", {
  id: serial("id").primaryKey(),
  fundId: varchar("fund_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  fundType: varchar("fund_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  totalCapital: doublePrecision("total_capital").default(0.0).notNull(),
  allocatedCapital: doublePrecision("allocated_capital").default(0.0).notNull(),
  reservedCapital: doublePrecision("reserved_capital").default(0.0).notNull(),
  availableCapital: doublePrecision("available_capital").default(0.0).notNull(),
  frozenCapital: doublePrecision("frozen_capital").default(0.0).notNull(),
  releasedCapital: doublePrecision("released_capital").default(0.0).notNull(),
  utilizedCapital: doublePrecision("utilized_capital").default(0.0).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  parentFundId: varchar("parent_fund_id", { length: 100 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fundAllocations = pgTable("fund_allocations", {
  id: serial("id").primaryKey(),
  allocationId: varchar("allocation_id", { length: 100 }).notNull().unique(),
  sourceFundId: varchar("source_fund_id", { length: 100 }).notNull(),
  targetFundId: varchar("target_fund_id", { length: 100 }).notNull(),
  amount: doublePrecision("amount").notNull(),
  allocationStrategy: varchar("allocation_strategy", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  notes: text("notes"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fundReservations = pgTable("fund_reservations", {
  id: serial("id").primaryKey(),
  reservationId: varchar("reservation_id", { length: 100 }).notNull().unique(),
  fundId: varchar("fund_id", { length: 100 }).notNull(),
  amount: doublePrecision("amount").notNull(),
  purpose: varchar("purpose", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("RESERVED"),
  expiresAt: timestamp("expires_at"),
  releasedAt: timestamp("released_at"),
  consumedAt: timestamp("consumed_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fundTransactions = pgTable("fund_transactions", {
  id: serial("id").primaryKey(),
  transactionId: varchar("transaction_id", { length: 100 }).notNull().unique(),
  fundId: varchar("fund_id", { length: 100 }).notNull(),
  operation: varchar("operation", { length: 50 }).notNull(),
  amount: doublePrecision("amount").default(0.0).notNull(),
  sourceFundId: varchar("source_fund_id", { length: 100 }),
  targetFundId: varchar("target_fund_id", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("SUCCESS"),
  failureReason: text("failure_reason"),
  actorId: varchar("actor_id", { length: 100 }).default("SYSTEM"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fundMetadata = pgTable("fund_metadata", {
  id: serial("id").primaryKey(),
  fundId: varchar("fund_id", { length: 100 }).notNull().unique(),
  riskTier: varchar("risk_tier", { length: 50 }).default("MEDIUM"),
  maxAllocationLimit: doublePrecision("max_allocation_limit"),
  maxReservationLimit: doublePrecision("max_reservation_limit"),
  owner: varchar("owner", { length: 100 }).default("SYSTEM"),
  tags: jsonb("tags").default([]),
  customRules: jsonb("custom_rules").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wallet Foundation Tables (Phase 2.8)
export const walletAccounts = pgTable("wallet_accounts", {
  id: serial("id").primaryKey(),
  walletId: varchar("wallet_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  walletType: varchar("wallet_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  ownerId: varchar("owner_id", { length: 100 }),
  parentWalletId: varchar("parent_wallet_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletBalances = pgTable("wallet_balances", {
  id: serial("id").primaryKey(),
  walletId: varchar("wallet_id", { length: 100 }).notNull().unique(),
  currentBalance: doublePrecision("current_balance").default(0.0).notNull(),
  availableBalance: doublePrecision("available_balance").default(0.0).notNull(),
  lockedBalance: doublePrecision("locked_balance").default(0.0).notNull(),
  pendingBalance: doublePrecision("pending_balance").default(0.0).notNull(),
  reservedBalance: doublePrecision("reserved_balance").default(0.0).notNull(),
  totalCredits: doublePrecision("total_credits").default(0.0).notNull(),
  totalDebits: doublePrecision("total_debits").default(0.0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  transactionId: varchar("transaction_id", { length: 100 }).notNull().unique(),
  referenceId: varchar("reference_id", { length: 100 }).notNull(),
  sourceWalletId: varchar("source_wallet_id", { length: 100 }),
  destinationWalletId: varchar("destination_wallet_id", { length: 100 }),
  amount: doublePrecision("amount").notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("SUCCESS"),
  failureReason: text("failure_reason"),
  initiator: varchar("initiator", { length: 100 }).default("SYSTEM").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walletLedger = pgTable("wallet_ledger", {
  id: serial("id").primaryKey(),
  ledgerId: varchar("ledger_id", { length: 100 }).notNull().unique(),
  transactionId: varchar("transaction_id", { length: 100 }).notNull(),
  referenceId: varchar("reference_id", { length: 100 }).notNull(),
  sourceWalletId: varchar("source_wallet_id", { length: 100 }),
  destinationWalletId: varchar("destination_wallet_id", { length: 100 }),
  amount: doublePrecision("amount").notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  entrySeq: integer("entry_seq").notNull(),
  initiator: varchar("initiator", { length: 100 }).default("SYSTEM").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walletMetadata = pgTable("wallet_metadata", {
  id: serial("id").primaryKey(),
  walletId: varchar("wallet_id", { length: 100 }).notNull().unique(),
  riskTier: varchar("risk_tier", { length: 50 }).default("LOW"),
  dailyTransferLimit: doublePrecision("daily_transfer_limit"),
  maxBalanceLimit: doublePrecision("max_balance_limit"),
  tags: jsonb("tags").default([]),
  customRules: jsonb("custom_rules").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Risk Engine Foundation Tables (Phase 2.9)
export const riskEngineProfiles = pgTable("risk_engine_profiles", {
  id: serial("id").primaryKey(),
  profileId: varchar("profile_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  riskLevel: varchar("risk_level", { length: 50 }).notNull().default("MEDIUM"),
  targetId: varchar("target_id", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  assessmentId: varchar("assessment_id", { length: 100 }).notNull().unique(),
  requestId: varchar("request_id", { length: 100 }).notNull(),
  targetId: varchar("target_id", { length: 100 }).notNull(),
  riskType: varchar("risk_type", { length: 50 }).notNull(),
  riskScore: doublePrecision("risk_score").default(0.0).notNull(),
  riskLevel: varchar("risk_level", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  metrics: jsonb("metrics").default({}),
  reasons: jsonb("reasons").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const riskEngineLimits = pgTable("risk_engine_limits", {
  id: serial("id").primaryKey(),
  profileId: varchar("profile_id", { length: 100 }).notNull().unique(),
  maxPositionSize: doublePrecision("max_position_size").default(100000.0),
  maxDailyLoss: doublePrecision("max_daily_loss").default(5000.0),
  maxCapitalUtilization: doublePrecision("max_capital_utilization").default(80.0),
  maxConcentrationRatio: doublePrecision("max_concentration_ratio").default(25.0),
  maxDrawdown: doublePrecision("max_drawdown").default(15.0),
  minLiquidityScore: doublePrecision("min_liquidity_score").default(60.0),
  requiredMarginRatio: doublePrecision("required_margin_ratio").default(10.0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const riskEngineEvents = pgTable("risk_engine_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 100 }).notNull().unique(),
  assessmentId: varchar("assessment_id", { length: 100 }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  riskType: varchar("risk_type", { length: 50 }).notNull(),
  riskLevel: varchar("risk_level", { length: 50 }).notNull(),
  details: jsonb("details").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const riskHistory = pgTable("risk_history", {
  id: serial("id").primaryKey(),
  historyId: varchar("history_id", { length: 100 }).notNull().unique(),
  targetId: varchar("target_id", { length: 100 }).notNull(),
  riskScore: doublePrecision("risk_score").notNull(),
  riskLevel: varchar("risk_level", { length: 50 }).notNull(),
  metrics: jsonb("metrics").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const riskEngineMetadata = pgTable("risk_engine_metadata", {
  id: serial("id").primaryKey(),
  profileId: varchar("profile_id", { length: 100 }).notNull().unique(),
  volatilityThreshold: doublePrecision("volatility_threshold").default(30.0),
  marginCallLevel: doublePrecision("margin_call_level").default(85.0),
  tags: jsonb("tags").default([]),
  customRules: jsonb("custom_rules").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Phase 2.10 Enterprise OMS Foundation Tables
export const omsOrders = pgTable("oms_orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 100 }).notNull().unique(),
  decisionId: varchar("decision_id", { length: 100 }).notNull(),
  strategyId: varchar("strategy_id", { length: 100 }),
  riskAssessmentId: varchar("risk_assessment_id", { length: 100 }),
  fundId: varchar("fund_id", { length: 100 }),
  walletId: varchar("wallet_id", { length: 100 }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  instrument: varchar("instrument", { length: 50 }).default("EQUITY").notNull(),
  market: varchar("market", { length: 50 }).default("SPOT").notNull(),
  exchange: varchar("exchange", { length: 50 }).default("NSE").notNull(),
  side: varchar("side", { length: 20 }).notNull(),
  orderType: varchar("order_type", { length: 30 }).notNull(),
  quantity: doublePrecision("quantity").notNull(),
  price: doublePrecision("price"),
  stopPrice: doublePrecision("stop_price"),
  timeInForce: varchar("time_in_force", { length: 20 }).default("DAY").notNull(),
  priority: integer("priority").default(1).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("CREATED"),
  filledQuantity: doublePrecision("filled_quantity").default(0.0).notNull(),
  averageFillPrice: doublePrecision("average_fill_price"),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const omsOrderHistory = pgTable("oms_order_history", {
  id: serial("id").primaryKey(),
  historyId: varchar("history_id", { length: 100 }).notNull().unique(),
  orderId: varchar("order_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const omsExecutionQueue = pgTable("oms_execution_queue", {
  id: serial("id").primaryKey(),
  queueId: varchar("queue_id", { length: 100 }).notNull().unique(),
  orderId: varchar("order_id", { length: 100 }).notNull(),
  priority: integer("priority").default(1).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("QUEUED"),
  queuedAt: timestamp("queued_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const omsOrderMetadata = pgTable("oms_order_metadata", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 100 }).notNull().unique(),
  clientTag: varchar("client_tag", { length: 100 }),
  executionVenue: varchar("execution_venue", { length: 100 }),
  algoStrategy: varchar("algo_strategy", { length: 100 }),
  tags: jsonb("tags").default([]),
  customRules: jsonb("custom_rules").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const omsFoundationOrderEvents = pgTable("oms_order_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 100 }).notNull().unique(),
  orderId: varchar("order_id", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const omsStateTransitions = pgTable("oms_state_transitions", {
  id: serial("id").primaryKey(),
  transitionId: varchar("transition_id", { length: 100 }).notNull().unique(),
  orderId: varchar("order_id", { length: 100 }).notNull(),
  fromState: varchar("from_state", { length: 50 }),
  toState: varchar("to_state", { length: 50 }).notNull(),
  reason: text("reason"),
  passed: boolean("passed").default(true).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const portfolioAccounts = pgTable("portfolio_accounts", {
  id: serial("id").primaryKey(),
  portfolioId: varchar("portfolio_id", { length: 100 }).notNull().unique(),
  fundId: varchar("fund_id", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  totalValue: doublePrecision("total_value").default(0.0).notNull(),
  cashBalance: doublePrecision("cash_balance").default(0.0).notNull(),
  unrealizedPnl: doublePrecision("unrealized_pnl").default(0.0).notNull(),
  realizedPnl: doublePrecision("realized_pnl").default(0.0).notNull(),
  grossExposure: doublePrecision("gross_exposure").default(0.0).notNull(),
  netExposure: doublePrecision("net_exposure").default(0.0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioPositions = pgTable("portfolio_positions", {
  id: serial("id").primaryKey(),
  positionId: varchar("position_id", { length: 100 }).notNull().unique(),
  portfolioId: varchar("portfolio_id", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  positionType: varchar("position_type", { length: 50 }).notNull().default("DELIVERY"),
  status: varchar("status", { length: 50 }).notNull().default("OPEN"),
  netQuantity: doublePrecision("net_quantity").default(0.0).notNull(),
  averagePrice: doublePrecision("average_price").default(0.0).notNull(),
  currentPrice: doublePrecision("current_price").default(0.0).notNull(),
  marketValue: doublePrecision("market_value").default(0.0).notNull(),
  costValue: doublePrecision("cost_value").default(0.0).notNull(),
  unrealizedPnl: doublePrecision("unrealized_pnl").default(0.0).notNull(),
  realizedPnl: doublePrecision("realized_pnl").default(0.0).notNull(),
  todaysPnl: doublePrecision("todays_pnl").default(0.0).notNull(),
  totalPnl: doublePrecision("total_pnl").default(0.0).notNull(),
  roi: doublePrecision("roi").default(0.0).notNull(),
  capitalUsed: doublePrecision("capital_used").default(0.0).notNull(),
  exposure: doublePrecision("exposure").default(0.0).notNull(),
  holdingPeriodDays: integer("holding_period_days").default(0).notNull(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  holdingId: varchar("holding_id", { length: 100 }).notNull().unique(),
  portfolioId: varchar("portfolio_id", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  assetClass: varchar("asset_class", { length: 50 }).default("EQUITY").notNull(),
  quantity: doublePrecision("quantity").default(0.0).notNull(),
  averageCost: doublePrecision("average_cost").default(0.0).notNull(),
  currentPrice: doublePrecision("current_price").default(0.0).notNull(),
  totalCost: doublePrecision("total_cost").default(0.0).notNull(),
  currentValue: doublePrecision("current_value").default(0.0).notNull(),
  unrealizedPnl: doublePrecision("unrealized_pnl").default(0.0).notNull(),
  weight: doublePrecision("weight").default(0.0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioSnapshots = pgTable("portfolio_snapshots", {
  id: serial("id").primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 100 }).notNull().unique(),
  portfolioId: varchar("portfolio_id", { length: 100 }).notNull(),
  snapshotType: varchar("snapshot_type", { length: 50 }).notNull(),
  totalValue: doublePrecision("total_value").default(0.0).notNull(),
  unrealizedPnl: doublePrecision("unrealized_pnl").default(0.0).notNull(),
  realizedPnl: doublePrecision("realized_pnl").default(0.0).notNull(),
  grossExposure: doublePrecision("gross_exposure").default(0.0).notNull(),
  netExposure: doublePrecision("net_exposure").default(0.0).notNull(),
  positionCount: integer("position_count").default(0).notNull(),
  data: jsonb("data").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const portfolioPnl = pgTable("portfolio_pnl", {
  id: serial("id").primaryKey(),
  pnlRecordId: varchar("pnl_record_id", { length: 100 }).notNull().unique(),
  portfolioId: varchar("portfolio_id", { length: 100 }).notNull(),
  positionId: varchar("position_id", { length: 100 }),
  symbol: varchar("symbol", { length: 50 }),
  dailyMtm: doublePrecision("daily_mtm").default(0.0).notNull(),
  runningMtm: doublePrecision("running_mtm").default(0.0).notNull(),
  realizedPnl: doublePrecision("realized_pnl").default(0.0).notNull(),
  unrealizedPnl: doublePrecision("unrealized_pnl").default(0.0).notNull(),
  totalPnl: doublePrecision("total_pnl").default(0.0).notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfolioEvents = pgTable("portfolio_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 100 }).notNull().unique(),
  portfolioId: varchar("portfolio_id", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const portfolioMetadata = pgTable("portfolio_metadata", {
  id: serial("id").primaryKey(),
  portfolioId: varchar("portfolio_id", { length: 100 }).notNull().unique(),
  manager: varchar("manager", { length: 100 }),
  benchmark: varchar("benchmark", { length: 100 }),
  riskLimits: jsonb("risk_limits").default({}),
  customTags: jsonb("custom_tags").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Phase 2.12 Enterprise Accounting & Financial Control Tables
export const accountBalances = pgTable("account_balances", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  accountCode: varchar("account_code", { length: 50 }),
  periodId: integer("period_id"),
  openingBalance: doublePrecision("opening_balance").default(0.0).notNull(),
  closingBalance: doublePrecision("closing_balance").default(0.0).notNull(),
  currentBalance: doublePrecision("current_balance").default(0.0).notNull(),
  runningBalance: doublePrecision("running_balance").default(0.0).notNull(),
  debitTotal: doublePrecision("debit_total").default(0.0).notNull(),
  creditTotal: doublePrecision("credit_total").default(0.0).notNull(),
  periodBalance: doublePrecision("period_balance").default(0.0).notNull(),
  carryForward: doublePrecision("carry_forward").default(0.0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reconciliationReports = pgTable("reconciliation_reports", {
  id: serial("id").primaryKey(),
  reportId: varchar("report_id", { length: 100 }).notNull().unique(),
  fundStatus: varchar("fund_status", { length: 50 }).default("BALANCED").notNull(),
  walletStatus: varchar("wallet_status", { length: 50 }).default("BALANCED").notNull(),
  omsStatus: varchar("oms_status", { length: 50 }).default("BALANCED").notNull(),
  portfolioStatus: varchar("portfolio_status", { length: 50 }).default("BALANCED").notNull(),
  accountingStatus: varchar("accounting_status", { length: 50 }).default("BALANCED").notNull(),
  missingEntries: jsonb("missing_entries").default([]),
  mismatches: jsonb("mismatches").default([]),
  duplicates: jsonb("duplicates").default([]),
  brokenChain: boolean("broken_chain").default(false).notNull(),
  status: varchar("status", { length: 50 }).default("BALANCED").notNull(),
  summary: text("summary"),
  details: jsonb("details").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  auditId: varchar("audit_id", { length: 100 }).notNull().unique(),
  correlationId: varchar("correlation_id", { length: 100 }),
  category: varchar("category", { length: 50 }).notNull(), // AI, USER, ORDERS, RISK, PORTFOLIO, WALLET, FUND, ACCOUNTING, CONFIGURATION, SYSTEM
  action: varchar("action", { length: 100 }).notNull(),
  actorId: varchar("actor_id", { length: 100 }).default("SYSTEM").notNull(),
  targetId: varchar("target_id", { length: 100 }),
  details: jsonb("details").default({}),
  isImmutable: boolean("is_immutable").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventRegistry = pgTable("event_registry", {
  id: serial("id").primaryKey(),
  topic: varchar("topic", { length: 100 }).notNull(),
  subscriberName: varchar("subscriber_name", { length: 100 }).notNull(),
  endpoint: varchar("endpoint", { length: 255 }),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventStore = pgTable("event_store", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 100 }).notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  sourceModule: varchar("source_module", { length: 50 }).notNull(), // ORDER, PORTFOLIO, WALLET, FUND, RISK, ACCOUNTING, AUDIT
  payload: jsonb("payload").default({}),
  correlationId: varchar("correlation_id", { length: 100 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const correlationRegistry = pgTable("correlation_registry", {
  id: serial("id").primaryKey(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull().unique(),
  decisionId: varchar("decision_id", { length: 100 }),
  riskAssessmentId: varchar("risk_assessment_id", { length: 100 }),
  orderId: varchar("order_id", { length: 100 }),
  positionId: varchar("position_id", { length: 100 }),
  journalEntryId: varchar("journal_entry_id", { length: 100 }),
  auditId: varchar("audit_id", { length: 100 }),
  status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const metadataRegistry = pgTable("metadata_registry", {
  id: serial("id").primaryKey(),
  metadataId: varchar("metadata_id", { length: 100 }).notNull().unique(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: jsonb("value").default({}),
  version: integer("version").default(1).notNull(),
  lifecycleState: varchar("lifecycle_state", { length: 50 }).default("ACTIVE").notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const entityVersions = pgTable("entity_versions", {
  id: serial("id").primaryKey(),
  versionId: varchar("version_id", { length: 100 }).notNull().unique(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }).notNull(),
  versionNumber: integer("version_number").notNull(),
  snapshotData: jsonb("snapshot_data").default({}).notNull(),
  createdVersion: integer("created_version").default(1).notNull(),
  currentVersion: integer("current_version").default(1).notNull(),
  previousVersion: integer("previous_version"),
  rollbackMetadata: jsonb("rollback_metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemConfiguration = pgTable("system_configuration", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(), // FINANCIAL, ACCOUNTING, FEATURE_FLAGS, RUNTIME
  value: jsonb("value").default({}).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Primary Alias Exports for Accounting
export const accountingAccounts = ep16ChartOfAccounts;
export const journalEntries = ep16JournalEntries;
export const generalLedger = ep16GeneralLedger;
export const trialBalance = ep16TrialBalance;
export const financialPeriods = ep16AccountingPeriods;

// Phase 2 Hardening Tables for AI Brain & Wallet
export const brainKnowledgeGraph = pgTable("brain_knowledge_graph", {
  id: serial("id").primaryKey(),
  graphId: varchar("graph_id", { length: 100 }).notNull().unique(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  properties: jsonb("properties").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const brainKnowledgeRelationships = pgTable("brain_knowledge_relationships", {
  id: serial("id").primaryKey(),
  relationshipId: varchar("relationship_id", { length: 100 }).notNull().unique(),
  sourceId: varchar("source_id", { length: 100 }).notNull(),
  targetId: varchar("target_id", { length: 100 }).notNull(),
  relationType: varchar("relation_type", { length: 100 }).notNull(),
  semanticWeight: numeric("semantic_weight", { precision: 5, scale: 2 }).default("1.00"),
  dependencyType: varchar("dependency_type", { length: 100 }).default("ASSOCIATIVE"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brainCache = pgTable("brain_cache", {
  id: serial("id").primaryKey(),
  cacheId: varchar("cache_id", { length: 100 }).notNull().unique(),
  cacheType: varchar("cache_type", { length: 50 }).notNull(), // KNOWLEDGE, CONTEXT, EMBEDDING
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(),
  cacheValue: jsonb("cache_value").notNull(),
  ttlMs: integer("ttl_ms").default(300000).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brainConflictLog = pgTable("brain_conflict_log", {
  id: serial("id").primaryKey(),
  conflictId: varchar("conflict_id", { length: 100 }).notNull().unique(),
  knowledgeIdA: varchar("knowledge_id_a", { length: 100 }).notNull(),
  knowledgeIdB: varchar("knowledge_id_b", { length: 100 }).notNull(),
  conflictType: varchar("conflict_type", { length: 100 }).notNull(), // DUPLICATE, CONFLICTING_CONTENT, OUTDATED
  resolutionStatus: varchar("resolution_status", { length: 50 }).default("AUTO_RESOLVED").notNull(),
  resolutionDetails: jsonb("resolution_details").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walletIdempotencyKeys = pgTable("wallet_idempotency_keys", {
  id: serial("id").primaryKey(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull().unique(),
  requestHash: varchar("request_hash", { length: 128 }).notNull(),
  status: varchar("status", { length: 50 }).default("PROCESSING").notNull(),
  responsePayload: jsonb("response_payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletSettlements = pgTable("wallet_settlements", {
  id: serial("id").primaryKey(),
  settlementId: varchar("settlement_id", { length: 100 }).notNull().unique(),
  transactionId: varchar("transaction_id", { length: 100 }).notNull(),
  walletId: varchar("wallet_id", { length: 100 }).notNull(),
  amount: doublePrecision("amount").notNull(),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(), // PENDING, PROCESSING, SETTLED, FAILED, REVERSED
  settledAt: timestamp("settled_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletReservations = pgTable("wallet_reservations", {
  id: serial("id").primaryKey(),
  reservationId: varchar("reservation_id", { length: 100 }).notNull().unique(),
  walletId: varchar("wallet_id", { length: 100 }).notNull(),
  amount: doublePrecision("amount").notNull(),
  purpose: varchar("purpose", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("RESERVED").notNull(), // RESERVED, RELEASED, EXPIRED, CANCELLED
  expiresAt: timestamp("expires_at"),
  releasedAt: timestamp("released_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletFraudAlerts = pgTable("wallet_fraud_alerts", {
  id: serial("id").primaryKey(),
  alertId: varchar("alert_id", { length: 100 }).notNull().unique(),
  walletId: varchar("wallet_id", { length: 100 }),
  alertType: varchar("alert_type", { length: 100 }).notNull(), // DUPLICATE_TRANSFER, REPLAY_REQUEST, DUPLICATE_LEDGER, UNEXPECTED_BALANCE_CHANGE
  severity: varchar("severity", { length: 50 }).default("HIGH").notNull(),
  details: jsonb("details").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ====================================================
// EP-04: TECHNICAL INDICATOR & SIGNAL ENGINE TABLES
// ====================================================

export const indicatorDefinitionsTable = pgTable("indicator_definitions", {
  id: serial("id").primaryKey(),
  indicatorId: varchar("indicator_id", { length: 100 }).notNull().unique(), // e.g. "SMA_20", "RSI_14"
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // TREND, MOMENTUM, VOLATILITY, VOLUME, PRICE_ACTION
  parameters: jsonb("parameters").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const indicatorValuesTable = pgTable("indicator_values", {
  id: serial("id").primaryKey(),
  indicatorId: varchar("indicator_id", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 100 }).notNull(),
  timeframe: varchar("timeframe", { length: 20 }).notNull(), // "1m", "3m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1mo"
  value: doublePrecision("value").notNull(),
  extraData: jsonb("extra_data").default({}),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const indicatorCacheTable = pgTable("indicator_cache", {
  id: serial("id").primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(), // e.g. "SMA_20:RELIANCE:1h"
  cacheValue: jsonb("cache_value").default({}).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const indicatorHistoryTable = pgTable("indicator_history", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 100 }).notNull(),
  timeframe: varchar("timeframe", { length: 20 }).notNull(),
  indicatorType: varchar("indicator_type", { length: 50 }).notNull(), // e.g. "SMA", "EMA", "RSI"
  values: jsonb("values").default([]).notNull(), // Array of { timestamp, value, extraData }
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const signalEventsTable = pgTable("signal_events", {
  id: serial("id").primaryKey(),
  signalId: varchar("signal_id", { length: 100 }).notNull().unique(), // e.g. "sig-12345"
  symbol: varchar("symbol", { length: 100 }).notNull(),
  timeframe: varchar("timeframe", { length: 20 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "BULLISH", "BEARISH", "NEUTRAL"
  action: varchar("action", { length: 50 }).notNull(), // "STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"
  confidence: doublePrecision("confidence").notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  indicatorSource: varchar("indicator_source", { length: 100 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const signalHistoryTable = pgTable("signal_history", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 100 }).notNull(),
  timeframe: varchar("timeframe", { length: 20 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  confidence: doublePrecision("confidence").notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  indicatorSource: varchar("indicator_source", { length: 100 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const signalMetadataTable = pgTable("signal_metadata", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ====================================================
// EP-05: NEWS INTELLIGENCE, CORPORATE ACTIONS, CALENDAR
// ====================================================

export const newsArticlesTable = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  newsId: varchar("news_id", { length: 100 }).notNull().unique(),
  headline: varchar("headline", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // MARKET, COMPANY, ECONOMY, POLICY, etc.
  source: varchar("source", { length: 100 }).notNull(), // Reuter, Exchange, Corporate Bulletin, etc.
  language: varchar("language", { length: 10 }).default("en").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  importance: varchar("importance", { length: 30 }).default("MEDIUM").notNull(), // CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL
  tags: jsonb("tags").default([]).notNull(), // Array of strings
  affectedSymbols: jsonb("affected_symbols").default([]).notNull(), // Array of strings
  sentimentScore: doublePrecision("sentiment_score").default(0.0).notNull(), // -1.0 to +1.0
  sentimentLabel: varchar("sentiment_label", { length: 20 }).default("NEUTRAL").notNull(), // BULLISH, BEARISH, NEUTRAL
  extraData: jsonb("extra_data").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsSourcesTable = pgTable("news_sources", {
  id: serial("id").primaryKey(),
  sourceId: varchar("source_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // EXCHANGE_BULLETINS, CORPORATE_ANNOUNCEMENTS, ECONOMIC_RELEASES, etc.
  url: varchar("url", { length: 255 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsCategoriesTable = pgTable("news_categories", {
  id: serial("id").primaryKey(),
  categoryId: varchar("category_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
});

export const newsTagsTable = pgTable("news_tags", {
  id: serial("id").primaryKey(),
  tag: varchar("tag", { length: 100 }).notNull().unique(),
  description: text("description"),
});

export const newsSymbolMappingTable = pgTable("news_symbol_mapping", {
  id: serial("id").primaryKey(),
  newsId: varchar("news_id", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 100 }).notNull(),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  sector: varchar("sector", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  company: varchar("company", { length: 150 }),
  instrument: varchar("instrument", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const corporateActionsTable = pgTable("corporate_actions", {
  id: serial("id").primaryKey(),
  actionId: varchar("action_id", { length: 100 }).notNull().unique(),
  symbol: varchar("symbol", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // BONUS, SPLIT, DIVIDEND, RIGHTS_ISSUE, MERGER, DEMERGER, NAME_CHANGE, DELISTING, SUSPENSION
  value: doublePrecision("value"), // Numeric value like dividend per share
  ratio: varchar("ratio", { length: 50 }), // For splits/bonus e.g. "1:10", "5:1"
  exDate: timestamp("ex_date"),
  recordDate: timestamp("record_date"),
  paymentDate: timestamp("payment_date"),
  announcementDate: timestamp("announcement_date"),
  currency: varchar("currency", { length: 10 }),
  description: text("description").notNull(),
  status: varchar("status", { length: 30 }).default("UPCOMING").notNull(), // UPCOMING, EFFECTIVE, COMPLETED, CANCELLED
  extraData: jsonb("extra_data").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const economicCalendarTable = pgTable("economic_calendar", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 100 }).notNull().unique(),
  country: varchar("country", { length: 100 }).notNull(),
  eventName: varchar("event_name", { length: 200 }).notNull(), // GDP, CPI, WPI, REPO_RATE, etc.
  actual: doublePrecision("actual"),
  forecast: doublePrecision("forecast"),
  previous: doublePrecision("previous"),
  importance: varchar("importance", { length: 30 }).notNull(), // CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL
  timeframe: varchar("timeframe", { length: 50 }), // e.g. "Q2 2026", "Jun 2026"
  publishedAt: timestamp("published_at").notNull(),
  currency: varchar("currency", { length: 10 }),
  category: varchar("category", { length: 50 }).notNull(), // GDP, INFLATION, INTEREST_RATE, LABOR, PRODUCTION, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const economicEventsTable = pgTable("economic_events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 100 }).notNull().unique(),
  eventName: varchar("event_name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // GDP, CPI, WPI, etc.
  description: text("description"),
  frequency: varchar("frequency", { length: 30 }), // MONTHLY, QUARTERLY, ANNUALLY
  country: varchar("country", { length: 100 }).notNull(),
  importance: varchar("importance", { length: 30 }).notNull(),
  currency: varchar("currency", { length: 10 }),
});

export const newsHistoryTable = pgTable("news_history", {
  id: serial("id").primaryKey(),
  newsId: varchar("news_id", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // CREATED, MODIFIED, CATEGORIZED, ARCHIVED
  performedBy: varchar("performed_by", { length: 100 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: jsonb("details").default({}).notNull(),
});

export const newsMetadataTable = pgTable("news_metadata", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// EP-06 Market Analytics Engine Tables

export const marketStatisticsTable = pgTable("market_statistics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  averagePrice: doublePrecision("average_price").notNull(),
  medianPrice: doublePrecision("median_price").notNull(),
  vwap: doublePrecision("vwap").notNull(),
  priceDistribution: jsonb("price_distribution").notNull(), // array of bins
  stdDev: doublePrecision("std_dev").notNull(),
  variance: doublePrecision("variance").notNull(),
  rangeAnalysis: jsonb("range_analysis").notNull(), // { high, low, range, rangePercent }
  marketBreadth: jsonb("market_breadth").notNull(), // { advanceDeclineRatio, advances, declines }
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trendStatisticsTable = pgTable("trend_statistics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  trendStrength: doublePrecision("trend_strength").notNull(), // 0 to 100
  trendDuration: integer("trend_duration").notNull(), // in periods/bars
  trendStability: doublePrecision("trend_stability").notNull(), // R-squared or similar
  reversalDetected: boolean("reversal_detected").default(false).notNull(),
  trendPersistence: doublePrecision("trend_persistence").notNull(), // Autocorrelation
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const volumeStatisticsTable = pgTable("volume_statistics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  averageVolume: doublePrecision("average_volume").notNull(),
  relativeVolume: doublePrecision("relative_volume").notNull(),
  volumeProfile: jsonb("volume_profile").notNull(), // array of { price, volume }
  liquidityScore: doublePrecision("liquidity_score").notNull(), // 0 to 100
  participationScore: doublePrecision("participation_score").notNull(), // 0 to 100
  volumeDistribution: jsonb("volume_distribution").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const volatilityStatisticsTable = pgTable("volatility_statistics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  atr: doublePrecision("atr").notNull(),
  realizedVolatility: doublePrecision("realized_volatility").notNull(),
  historicalVolatility: doublePrecision("historical_volatility").notNull(),
  volatilityRank: doublePrecision("volatility_rank").notNull(), // 0 to 100
  volatilityPercentile: doublePrecision("volatility_percentile").notNull(), // 0 to 100
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const correlationMatrixTable = pgTable("correlation_matrix", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  symbols: jsonb("symbols").notNull(), // array of symbols
  matrix: jsonb("matrix").notNull(), // 2D array or object
  sectorCorrelation: jsonb("sector_correlation").notNull(),
  indexCorrelation: jsonb("index_correlation").notNull(),
  rollingCorrelation: jsonb("rolling_correlation").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketHealthTable = pgTable("market_health", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  breadthScore: doublePrecision("breadth_score").notNull(),
  liquidityIndex: doublePrecision("liquidity_index").notNull(),
  momentumIndex: doublePrecision("momentum_index").notNull(),
  volatilityIndex: doublePrecision("volatility_index").notNull(),
  participationIndex: doublePrecision("participation_index").notNull(),
  compositeScore: doublePrecision("composite_score").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analyticsHistoryTable = pgTable("analytics_history", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 50 }), // optional if market-wide
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  metricValue: doublePrecision("metric_value").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const aiConsensusMemory = pgTable("ai_consensus_memory", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  topic: varchar("topic", { length: 255 }).notNull(),
  intent: varchar("intent", { length: 255 }),
  finalDecision: text("final_decision").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  summary: text("summary").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiConsensusRounds = pgTable("ai_consensus_rounds", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiConsensusMemory.id, { onDelete: "cascade" }),
  roundNumber: integer("round_number").notNull(),
  roundType: varchar("round_type", { length: 50 }).notNull(), // 'OPENING', 'EVIDENCE', 'COUNTER', 'REBUTTAL', 'FINAL'
  proposal: text("proposal"),
  roundMetadata: jsonb("round_metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiEvidence = pgTable("ai_evidence", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiConsensusMemory.id, { onDelete: "cascade" }),
  roundId: integer("round_id").references(() => aiConsensusRounds.id, { onDelete: "cascade" }),
  modelId: integer("model_id").references(() => aiModels.id),
  modelName: varchar("model_name", { length: 100 }).notNull(),
  evidenceType: varchar("evidence_type", { length: 50 }).notNull(), // 'MARKET_DATA', 'INDICATORS', 'SCANNER', 'NEWS', 'ECONOMIC_CALENDAR', 'CORPORATE_ACTIONS', 'ANALYTICS', 'HISTORICAL', 'UNKNOWN'
  content: text("content").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  source: varchar("source", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiReliabilityHistory = pgTable("ai_reliability_history", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").references(() => aiModels.id, { onDelete: "cascade" }),
  modelName: varchar("model_name", { length: 100 }).notNull(),
  historicalAccuracy: doublePrecision("historical_accuracy").notNull().default(1.0),
  responseStability: doublePrecision("response_stability").notNull().default(1.0),
  latency: doublePrecision("latency").notNull().default(0.0),
  timeoutRate: doublePrecision("timeout_rate").notNull().default(0.0),
  failureRate: doublePrecision("failure_rate").notNull().default(0.0),
  domainExpertise: jsonb("domain_expertise").default({}),
  weightedReliability: doublePrecision("weighted_reliability").notNull().default(1.0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiConsensusAudit = pgTable("ai_consensus_audit", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiConsensusMemory.id, { onDelete: "cascade" }),
  roundId: integer("round_id"),
  actionType: varchar("action_type", { length: 100 }).notNull(), // 'PROMPT', 'RESPONSE', 'WEIGHT_CHANGE', 'CONSENSUS_CHANGE', 'FINAL_REPORT'
  actor: varchar("actor", { length: 100 }).notNull(), // model name or 'SYSTEM'
  payload: jsonb("payload").notNull().default({}),
  hash: varchar("hash", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiConsensusQuality = pgTable("ai_consensus_quality", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiConsensusMemory.id, { onDelete: "cascade" }).unique(),
  agreementPercent: doublePrecision("agreement_percent").notNull(),
  evidenceQuality: doublePrecision("evidence_quality").notNull(),
  reasoningQuality: doublePrecision("reasoning_quality").notNull(),
  confidenceQuality: doublePrecision("confidence_quality").notNull(),
  reliabilityWeight: doublePrecision("reliability_weight").notNull(),
  consensusStability: doublePrecision("consensus_stability").notNull(),
  overallGrade: varchar("overall_grade", { length: 10 }).notNull(), // 'A', 'B', 'C', 'D', 'F'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiResearchSessions = pgTable("ai_research_sessions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  topic: varchar("topic", { length: 255 }).notNull(),
  intent: varchar("intent", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  consensusSessionId: integer("consensus_session_id").references(() => aiConsensusMemory.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiResearchIntelReports = pgTable("ai_research_intel_reports", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiResearchSessions.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  finalVerdict: varchar("final_verdict", { length: 50 }).notNull(), // BUY, SELL, HOLD
  marketBias: varchar("market_bias", { length: 50 }).notNull(), // BULLISH, BEARISH, NEUTRAL
  bullishScore: doublePrecision("bullish_score").notNull(),
  bearishScore: doublePrecision("bearish_score").notNull(),
  neutralScore: doublePrecision("neutral_score").notNull(),
  trendStrength: doublePrecision("trend_strength").notNull(),
  riskLevel: varchar("risk_level", { length: 50 }).notNull(), // LOW, MEDIUM, HIGH, EXTREME
  opportunityScore: doublePrecision("opportunity_score").notNull(),
  confidenceScore: doublePrecision("confidence_score").notNull(),
  executiveSummary: text("executive_summary").notNull(),
  detailedReportMarkdown: text("detailed_report_markdown").notNull(),
  detailedReportJson: jsonb("detailed_report_json").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiResearchReasoning = pgTable("ai_research_reasoning", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => aiResearchIntelReports.id, { onDelete: "cascade" }),
  nodeType: varchar("node_type", { length: 50 }).notNull(), // CLAIM, REASON, COUNTER, REBUTTAL, RISK
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiResearchEvidenceTable = pgTable("ai_research_evidence", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => aiResearchIntelReports.id, { onDelete: "cascade" }),
  sourceId: varchar("source_id", { length: 255 }),
  sourceType: varchar("source_type", { length: 100 }).notNull(), // NEWS, INDICATOR, NEWS_SUMMARY, MACRO
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  ranking: integer("ranking").notNull(),
  credibilityScore: doublePrecision("credibility_score").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiResearchGraph = pgTable("ai_research_graph", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  sourceId: varchar("source_id", { length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: varchar("target_id", { length: 100 }).notNull(),
  relationType: varchar("relation_type", { length: 100 }).notNull(), // IMPACTS, INFLUENCES, CORRELATES
  weight: doublePrecision("weight").notNull().default(1.0),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiResearchMetricsTable = pgTable("ai_research_metrics", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiResearchSessions.id, { onDelete: "cascade" }),
  durationMs: integer("duration_ms").notNull(),
  processingTimeMs: integer("processing_time_ms").notNull(),
  evidenceCount: integer("evidence_count").notNull(),
  reasoningDepth: integer("reasoning_depth").notNull(),
  confidenceTrend: jsonb("confidence_trend").default([]),
  researchQuality: doublePrecision("research_quality").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiPerformance = pgTable("ai_performance", {
  id: serial("id").primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  responseTime: doublePrecision("response_time").notNull().default(0),
  reasoningDepth: doublePrecision("reasoning_depth").notNull().default(0),
  evidenceCoverage: doublePrecision("evidence_coverage").notNull().default(0),
  confidenceStability: doublePrecision("confidence_stability").notNull().default(0),
  researchQuality: doublePrecision("research_quality").notNull().default(0),
  consensusContribution: doublePrecision("consensus_contribution").notNull().default(0),
  accuracy: doublePrecision("accuracy").notNull().default(0),
  reliability: doublePrecision("reliability").notNull().default(0),
  latency: doublePrecision("latency").notNull().default(0),
  tokensUsed: integer("tokens_used").notNull().default(0),
  cost: doublePrecision("cost").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const aiPerformanceMetrics = pgTable("ai_performance_metrics", {
  id: serial("id").primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  rollingAccuracy: doublePrecision("rolling_accuracy").notNull().default(0),
  movingAccuracy: doublePrecision("moving_accuracy").notNull().default(0),
  trendAnalysis: jsonb("trend_analysis").default({}),
  performanceDrift: doublePrecision("performance_drift").notNull().default(0),
  regressionDetected: boolean("regression_detected").notNull().default(false),
  improvementRate: doublePrecision("improvement_rate").notNull().default(0),
  decayRate: doublePrecision("decay_rate").notNull().default(0),
  benchmarkComparison: jsonb("benchmark_comparison").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiLearningHistory = pgTable("ai_learning_history", {
  id: serial("id").primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  successPatterns: jsonb("success_patterns").default([]),
  failurePatterns: jsonb("failure_patterns").default([]),
  researchOutcomes: jsonb("research_outcomes").default([]),
  consensusOutcomes: jsonb("consensus_outcomes").default([]),
  knowledgeUpdates: jsonb("knowledge_updates").default([]),
  historicalBehavior: jsonb("historical_behavior").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiLearningFeedback = pgTable("ai_learning_feedback", {
  id: serial("id").primaryKey(),
  modelId: varchar("model_id", { length: 50 }).notNull(),
  strengths: jsonb("strengths").default([]),
  weaknesses: jsonb("weaknesses").default([]),
  recurringErrors: jsonb("recurring_errors").default([]),
  missingEvidence: jsonb("missing_evidence").default([]),
  reasoningGaps: jsonb("reasoning_gaps").default([]),
  improvementSuggestions: jsonb("improvement_suggestions").default([]),
  confidenceCalibration: doublePrecision("confidence_calibration").notNull().default(1.0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- AI GOVERNANCE, SAFETY & EXPLAINABILITY ENGINE TABLES ---

export const aiGovernanceSessions = pgTable("ai_governance_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  requestPayload: jsonb("request_payload"),
  responsePayload: jsonb("response_payload"),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"), // APPROVED, REJECTED, ESCALATED
  policyCheckStatus: varchar("policy_check_status", { length: 50 }).notNull(), // PASSED, FAILED
  safetyCheckStatus: varchar("safety_check_status", { length: 50 }).notNull(), // PASSED, FAILED
  governanceLatencyMs: integer("governance_latency_ms"),
  auditHash: varchar("audit_hash", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiPolicyViolations = pgTable("ai_policy_violations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiGovernanceSessions.id, { onDelete: "cascade" }),
  policyName: varchar("policy_name", { length: 100 }).notNull(),
  policyType: varchar("policy_type", { length: 50 }).notNull(), // CONSTITUTION, RISK, COMPLIANCE, PROVIDER, etc.
  violationDetails: text("violation_details").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiSafetyReports = pgTable("ai_safety_reports", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiGovernanceSessions.id, { onDelete: "cascade" }),
  modelId: varchar("model_id", { length: 50 }),
  promptRiskScore: doublePrecision("prompt_risk_score").notNull().default(0.0),
  outputRiskScore: doublePrecision("output_risk_score").notNull().default(0.0),
  riskFlags: jsonb("risk_flags").default([]).notNull(), // list of detected risk strings
  scannerLogs: text("scanner_logs"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiExplainability = pgTable("ai_explainability", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiGovernanceSessions.id, { onDelete: "cascade" }),
  evidenceTrace: jsonb("evidence_trace").default([]).notNull(),
  reasoningTrace: jsonb("reasoning_trace").default([]).notNull(),
  confidenceExplanation: text("confidence_explanation"),
  decisionFactors: jsonb("decision_factors").default([]).notNull(),
  riskFactors: jsonb("risk_factors").default([]).notNull(),
  alternativeViews: jsonb("alternative_views").default([]).notNull(),
  minorityOpinion: text("minority_opinion"),
  modelContributions: jsonb("model_contributions").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiCompliance = pgTable("ai_compliance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiGovernanceSessions.id, { onDelete: "cascade" }),
  complianceScore: doublePrecision("compliance_score").notNull().default(100.0),
  policyCompliance: boolean("policy_compliance").notNull().default(true),
  ruleCompliance: boolean("rule_compliance").notNull().default(true),
  evidenceCompleteness: boolean("evidence_completeness").notNull().default(true),
  researchCompleteness: boolean("research_completeness").notNull().default(true),
  explainabilityCompleteness: boolean("explainability_completeness").notNull().default(true),
  confidenceValidation: boolean("confidence_validation").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiHumanReviews = pgTable("ai_human_reviews", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiGovernanceSessions.id, { onDelete: "cascade" }),
  reviewerId: integer("reviewer_id").references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"), // PENDING, APPROVED, REJECTED, ESCALATED
  reviewerNotes: text("reviewer_notes"),
  escalationReason: text("escalation_reason"),
  decisionOverride: boolean("decision_override").default(false).notNull(),
  approvalHistory: jsonb("approval_history").default([]).notNull(),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiGovernanceMetrics = pgTable("ai_governance_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  policyViolationsCount: integer("policy_violations_count").notNull().default(0),
  safetyViolationsCount: integer("safety_violations_count").notNull().default(0),
  governanceLatencyAvg: doublePrecision("governance_latency_avg").notNull().default(0.0),
  reviewQueueSize: integer("review_queue_size").notNull().default(0),
  approvalTimeAvg: doublePrecision("approval_time_avg").notNull().default(0.0),
  auditVolume: integer("audit_volume").notNull().default(0),
  explainabilityCoverage: doublePrecision("explainability_coverage").notNull().default(0.0),
  complianceScoreAvg: doublePrecision("compliance_score_avg").notNull().default(100.0),
});

export const aiAuditReplay = pgTable("ai_audit_replay", {
  id: serial("id").primaryKey(),
  originalSessionId: integer("original_session_id"),
  replayTriggeredBy: integer("replay_triggered_by").references(() => users.id),
  replayStatus: varchar("replay_status", { length: 50 }).notNull().default("COMPLETED"),
  discrepancyDetected: boolean("discrepancy_detected").default(false).notNull(),
  originalHash: varchar("original_hash", { length: 64 }).notNull(),
  replayHash: varchar("replay_hash", { length: 64 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Organization Engine Tables
export const orgOrganizations = pgTable("org_organizations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  logo: text("logo"),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  locale: varchar("locale", { length: 10 }).default("en-US").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  tradingRegion: varchar("trading_region", { length: 50 }).default("US").notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(), // ACTIVE, SUSPENDED, ARCHIVED
  branding: jsonb("branding").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orgWorkspaces = pgTable("org_workspaces", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => orgOrganizations.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  visibility: varchar("visibility", { length: 20 }).default("PRIVATE").notNull(), // PRIVATE, PUBLIC, INTERNAL
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(), // ACTIVE, DELETED, ARCHIVED
  preferences: jsonb("preferences").default({}).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orgMembers = pgTable("org_members", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => orgOrganizations.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 50 }).default("MEMBER").notNull(), // OWNER, ADMIN, MEMBER
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(), // ACTIVE, SUSPENDED, PENDING
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
});

export const orgSettings = pgTable("org_settings", {
  organizationId: varchar("organization_id", { length: 50 }).references(() => orgOrganizations.id, { onDelete: "cascade" }).primaryKey(),
  aiPreferences: jsonb("ai_preferences").default({}).notNull(),
  securitySettings: jsonb("security_settings").default({}).notNull(),
  workspaceDefaults: jsonb("workspace_defaults").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orgActivity = pgTable("org_activity", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  workspaceId: varchar("workspace_id", { length: 50 }),
  userId: integer("user_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orgMetadata = pgTable("org_metadata", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'ORGANIZATION', 'WORKSPACE'
  entityId: varchar("entity_id", { length: 50 }).notNull(),
  metaKey: varchar("meta_key", { length: 100 }).notNull(),
  metaValue: text("meta_value"),
});

// RBAC Engine Tables
export const rbacRoles = pgTable("rbac_roles", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isCustom: boolean("is_custom").default(false).notNull(),
  parentRoleId: varchar("parent_role_id", { length: 50 }), // Self-reference for inheritance
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rbacPermissions = pgTable("rbac_permissions", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rbacRolePermissions = pgTable("rbac_role_permissions", {
  id: serial("id").primaryKey(),
  roleId: varchar("role_id", { length: 50 }).references(() => rbacRoles.id, { onDelete: "cascade" }).notNull(),
  permissionId: varchar("permission_id", { length: 100 }).references(() => rbacPermissions.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rbacUserRoles = pgTable("rbac_user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  roleId: varchar("role_id", { length: 50 }).references(() => rbacRoles.id, { onDelete: "cascade" }).notNull(),
  organizationId: varchar("organization_id", { length: 50 }),
  workspaceId: varchar("workspace_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rbacPolicies = pgTable("rbac_policies", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  effect: varchar("effect", { length: 10 }).notNull(), // 'ALLOW', 'DENY'
  actions: jsonb("actions").default([]).notNull(), // List of string actions or wildcard ["*"]
  resources: jsonb("resources").default([]).notNull(), // List of string resources or wildcard ["*"]
  conditions: jsonb("conditions").default({}).notNull(), // Conditional rules, time-based, IP, ownership, etc.
  organizationId: varchar("organization_id", { length: 50 }),
  workspaceId: varchar("workspace_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rbacPermissionLogs = pgTable("rbac_permission_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 255 }).notNull(),
  organizationId: varchar("organization_id", { length: 50 }),
  workspaceId: varchar("workspace_id", { length: 50 }),
  decision: varchar("decision", { length: 20 }).notNull(), // 'GRANTED', 'DENIED'
  reason: text("reason"),
  latencyMs: integer("latency_ms").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rbacCache = pgTable("rbac_cache", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  permissions: jsonb("permissions").default([]).notNull(), // Cached resolved permission set
  expiresAt: timestamp("expires_at").notNull(),
});

// Collab Engine Tables
export const collabComments = pgTable("collab_comments", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id"), // self reference is handled dynamically in code
  resourceId: varchar("resource_id", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collabMentions = pgTable("collab_mentions", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").references(() => collabComments.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collabTasks = pgTable("collab_tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assigneeId: integer("assignee_id").references(() => users.id, { onDelete: "set null" }),
  creatorId: integer("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  dueDate: timestamp("due_date"),
  priority: varchar("priority", { length: 50 }).default("MEDIUM").notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  status: varchar("status", { length: 50 }).default("TODO").notNull(), // 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'
  labels: jsonb("labels").default([]).notNull(),
  organizationId: varchar("organization_id", { length: 50 }),
  workspaceId: varchar("workspace_id", { length: 50 }),
  resourceId: varchar("resource_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collabShares = pgTable("collab_shares", {
  id: serial("id").primaryKey(),
  resourceId: varchar("resource_id", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(), // 'RESEARCH', 'REPORT', 'STRATEGY', 'KNOWLEDGE'
  creatorId: integer("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  shareType: varchar("share_type", { length: 50 }).default("WORKSPACE").notNull(), // 'INTERNAL_LINK', 'WORKSPACE', 'ORGANIZATION', 'PUBLIC_READ'
  organizationId: varchar("organization_id", { length: 50 }),
  workspaceId: varchar("workspace_id", { length: 50 }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collabActivity = pgTable("collab_activity", {
  id: serial("id").primaryKey(),
  workspaceId: varchar("workspace_id", { length: 50 }),
  organizationId: varchar("organization_id", { length: 50 }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'COMMENT', 'TASK', 'SHARE', 'PRESENCE', 'MEMBER'
  details: jsonb("details").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collabPresence = pgTable("collab_presence", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("ONLINE").notNull(), // 'ONLINE', 'AWAY', 'OFFLINE'
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  activeWorkspaceId: varchar("active_workspace_id", { length: 50 }),
  isTyping: boolean("is_typing").default(false).notNull(),
  typingResourceId: varchar("typing_resource_id", { length: 100 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Event Center & Notification Tables
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 100 }).unique().notNull(), // Deduplication unique key
  type: varchar("type", { length: 100 }).notNull(), // 'research.created', 'task.assigned', etc.
  category: varchar("category", { length: 50 }).notNull(), // 'RESEARCH', 'AI_MODELS', 'CONSENSUS', 'LEARNING', 'GOVERNANCE', 'ORGANIZATIONS', 'WORKSPACES', 'RBAC', 'COLLAB', 'AUDIT'
  actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
  workspaceId: varchar("workspace_id", { length: 50 }),
  organizationId: varchar("organization_id", { length: 50 }),
  data: jsonb("data").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventSubscriptions = pgTable("event_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  roleId: varchar("role_id", { length: 50 }),
  workspaceId: varchar("workspace_id", { length: 50 }),
  organizationId: varchar("organization_id", { length: 50 }),
  category: varchar("category", { length: 50 }), // null represents all categories
  minPriority: varchar("min_priority", { length: 20 }).default("LOW").notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  isMuted: boolean("is_muted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enterpriseNotifications = pgTable("enterprise_notifications", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  priority: varchar("priority", { length: 50 }).default("LOW").notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  isRead: boolean("is_read").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  emailEnabled: boolean("email_enabled").default(false).notNull(),
  inAppEnabled: boolean("in_app_enabled").default(true).notNull(),
  digestFrequency: varchar("digest_frequency", { length: 50 }).default("IMMEDIATE").notNull(), // 'IMMEDIATE', 'DAILY', 'WEEKLY'
  muteCategories: jsonb("mute_categories").default([]).notNull(), // JSON array of category names
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationDelivery = pgTable("notification_delivery", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").references(() => enterpriseNotifications.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(), // 'PENDING', 'SENT', 'FAILED', 'RETRY'
  retryCount: integer("retry_count").default(0).notNull(),
  errorDetails: text("error_details"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationMetrics = pgTable("notification_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  publishedEvents: integer("published_events").default(0).notNull(),
  deliveredNotifications: integer("delivered_notifications").default(0).notNull(),
  failedDeliveries: integer("failed_deliveries").default(0).notNull(),
  avgLatencyMs: integer("avg_latency_ms").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enterprise Workflow & Approval Engine Tables
export const workflowTemplates = pgTable("workflow_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // 'SEQUENTIAL', 'PARALLEL'
  sourceModule: varchar("source_module", { length: 100 }).notNull(), // 'RESEARCH', 'GOVERNANCE', etc.
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull(),
  steps: jsonb("steps").default([]).notNull(), // Array of step definitions: { name, requiredRole, requiredPermission }
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowInstances = pgTable("workflow_instances", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => workflowTemplates.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  sourceModule: varchar("source_module", { length: 100 }).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  status: varchar("status", { length: 50 }).default("DRAFT").notNull(), // 'DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED', 'COMPLETED', 'EXPIRED'
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  workspaceId: varchar("workspace_id", { length: 50 }).notNull(),
  initiatorId: integer("initiator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  currentStepIndex: integer("current_step_index").default(0).notNull(),
  data: jsonb("data").default({}).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowSteps = pgTable("workflow_steps", {
  id: serial("id").primaryKey(),
  workflowInstanceId: integer("workflow_instance_id").references(() => workflowInstances.id, { onDelete: "cascade" }).notNull(),
  stepIndex: integer("step_index").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(), // 'PENDING', 'APPROVED', 'REJECTED', 'SKIPPED'
  requiredRole: varchar("required_role", { length: 100 }),
  requiredPermission: varchar("required_permission", { length: 100 }),
  assignedUserId: integer("assigned_user_id").references(() => users.id, { onDelete: "set null" }), // Delegation target
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowApprovals = pgTable("workflow_approvals", {
  id: serial("id").primaryKey(),
  workflowInstanceId: integer("workflow_instance_id").references(() => workflowInstances.id, { onDelete: "cascade" }).notNull(),
  stepId: integer("step_id").references(() => workflowSteps.id, { onDelete: "cascade" }).notNull(),
  approverId: integer("approver_id").references(() => users.id, { onDelete: "set null" }).notNull(),
  approverRole: varchar("approver_role", { length: 100 }),
  decision: varchar("decision", { length: 50 }).notNull(), // 'APPROVED', 'REJECTED', 'RETURNED'
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflowHistory = pgTable("workflow_history", {
  id: serial("id").primaryKey(),
  workflowInstanceId: integer("workflow_instance_id").references(() => workflowInstances.id, { onDelete: "cascade" }).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // 'CREATE', 'SUBMIT', 'APPROVE', 'REJECT', 'RETURN', 'CANCEL', 'ESCALATE', 'DELEGATE'
  actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }).notNull(),
  stepIndex: integer("step_index"),
  comments: text("comments"),
  data: jsonb("data").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflowMetrics = pgTable("workflow_metrics", {
  id: serial("id").primaryKey(),
  workflowInstanceId: integer("workflow_instance_id").references(() => workflowInstances.id, { onDelete: "cascade" }).notNull(),
  executionDurationMs: integer("execution_duration_ms").default(0).notNull(),
  approvalLatencyMs: integer("approval_latency_ms").default(0).notNull(),
  escalationCount: integer("escalation_count").default(0).notNull(),
  timeoutCount: integer("timeout_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enterprise Audit Center Tables
export const auditRecords = pgTable("audit_records", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  workspaceId: varchar("workspace_id", { length: 50 }),
  actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  sourceModule: varchar("source_module", { length: 50 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }),
  resourceId: varchar("resource_id", { length: 100 }),
  correlationId: varchar("correlation_id", { length: 100 }),
  workflowId: integer("workflow_id"),
  severity: varchar("severity", { length: 50 }).default("INFO").notNull(),
  details: jsonb("details").default({}).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  hash: text("hash").notNull(), // Integrity hash
  previousHash: text("previous_hash"), // Chain integrity
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditTimeline = pgTable("audit_timeline", {
  id: serial("id").primaryKey(),
  auditRecordId: varchar("audit_record_id", { length: 50 }).references(() => auditRecords.id, { onDelete: "cascade" }).notNull(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  workspaceId: varchar("workspace_id", { length: 50 }),
  timelineType: varchar("timeline_type", { length: 50 }).notNull(), // 'GLOBAL', 'ORG', 'WORKSPACE', 'USER', 'RESOURCE', 'WORKFLOW'
  targetId: varchar("target_id", { length: 100 }).notNull(), // User ID, Org ID, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditExports = pgTable("audit_exports", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  requestedById: integer("requested_by_id").references(() => users.id, { onDelete: "set null" }).notNull(),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(),
  format: varchar("format", { length: 20 }).default("CSV").notNull(),
  filters: jsonb("filters").default({}).notNull(),
  downloadUrl: text("download_url"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditIntegrity = pgTable("audit_integrity", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  lastVerifiedRecordId: varchar("last_verified_record_id", { length: 50 }),
  status: varchar("status", { length: 50 }).default("VALID").notNull(), // 'VALID', 'COMPROMISED'
  lastVerifiedAt: timestamp("last_verified_at").defaultNow().notNull(),
});

export const auditMetrics = pgTable("audit_metrics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  totalRecords: integer("total_records").default(0).notNull(),
  searchVolume: integer("search_volume").default(0).notNull(),
  exportVolume: integer("export_volume").default(0).notNull(),
  integrityFailures: integer("integrity_failures").default(0).notNull(),
  storageBytes: integer("storage_bytes").default(0).notNull(),
});

// Enterprise Order Management Engine
export const enterpriseOrders = pgTable("enterprise_orders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  clientOrderId: varchar("client_order_id", { length: 100 }).notNull(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  workspaceId: varchar("workspace_id", { length: 50 }),
  aiModelId: varchar("ai_model_id", { length: 50 }),
  strategyId: varchar("strategy_id", { length: 50 }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  exchange: varchar("exchange", { length: 50 }).notNull(),
  side: varchar("side", { length: 10 }).notNull(), // 'BUY', 'SELL'
  orderType: varchar("order_type", { length: 20 }).notNull(), // 'MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'
  quantity: numeric("quantity").notNull(),
  filledQuantity: numeric("filled_quantity").default("0").notNull(),
  price: numeric("price"),
  triggerPrice: numeric("trigger_price"),
  status: varchar("status", { length: 20 }).default("CREATED").notNull(),
  version: integer("version").default(1).notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enterpriseOrderHistory = pgTable("enterprise_order_history", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 50 }).references(() => enterpriseOrders.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  version: integer("version").notNull(),
  details: jsonb("details").default({}),
  changedBy: integer("changed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enterpriseOrderVersions = pgTable("enterprise_order_versions", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 50 }).references(() => enterpriseOrders.id, { onDelete: "cascade" }).notNull(),
  versionNumber: integer("version_number").notNull(),
  previousVersionId: integer("previous_version_id"),
  changeReason: varchar("change_reason", { length: 255 }),
  changedBy: integer("changed_by").references(() => users.id, { onDelete: "set null" }),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  orderSnapshot: jsonb("order_snapshot").notNull(),
});

export const enterpriseOrderIdempotency = pgTable("enterprise_order_idempotency", {
  idempotencyKey: varchar("idempotency_key", { length: 100 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  requestHash: varchar("request_hash", { length: 255 }).notNull(),
  responseStatus: integer("response_status").notNull(),
  responseBody: jsonb("response_body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enterpriseOrderMetrics = pgTable("enterprise_order_metrics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  date: date("date").notNull(),
  totalOrders: integer("total_orders").default(0).notNull(),
  createdOrders: integer("created_orders").default(0).notNull(),
  filledOrders: integer("filled_orders").default(0).notNull(),
  cancelledOrders: integer("cancelled_orders").default(0).notNull(),
  rejectedOrders: integer("rejected_orders").default(0).notNull(),
  expiredOrders: integer("expired_orders").default(0).notNull(),
  modifiedOrders: integer("modified_orders").default(0).notNull(),
  validationFailures: integer("validation_failures").default(0).notNull(),
  duplicateRequests: integer("duplicate_requests").default(0).notNull(),
  totalVolume: numeric("total_volume").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgDateIdx: uniqueIndex("ent_order_metrics_org_date_idx").on(table.organizationId, table.date)
}));


// EP-02: Enterprise Paper Trading Executions
export const enterpriseExecutions = pgTable("enterprise_executions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  orderId: varchar("order_id", { length: 50 }).notNull().references(() => enterpriseOrders.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  side: varchar("side", { length: 10 }).notNull(), // BUY, SELL
  executionType: varchar("execution_type", { length: 20 }).notNull(), // MARKET, LIMIT, STOP, STOP_LIMIT
  quantity: numeric("quantity").notNull(),
  price: numeric("price").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // PENDING, MATCHING, PARTIALLY_FILLED, FILLED, REJECTED, EXPIRED, FAILED
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enterpriseExecutionHistory = pgTable("enterprise_execution_history", {
  id: serial("id").primaryKey(),
  executionId: varchar("execution_id", { length: 50 }).notNull().references(() => enterpriseExecutions.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
});

export const enterpriseExecutionMetrics = pgTable("enterprise_execution_metrics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  date: date("date").notNull(),
  totalExecutions: integer("total_executions").default(0).notNull(),
  totalVolume: numeric("total_volume").default("0").notNull(),
  fillRate: numeric("fill_rate").default("0").notNull(),
  rejectRate: numeric("reject_rate").default("0").notNull(),
  avgLatencyMs: integer("avg_latency_ms").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgDateUnique: uniqueIndex("enterprise_execution_metrics_org_date_idx").on(table.organizationId, table.date)
}));
export const enterprisePortfolios = pgTable("enterprise_portfolios", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // PAPER
  status: varchar("status", { length: 20 }).notNull(), // ACTIVE, SUSPENDED
  cashBalance: numeric("cash_balance").notNull().default("0"),
  blockedCash: numeric("blocked_cash").notNull().default("0"),
  availableCash: numeric("available_cash").notNull().default("0"),
  equity: numeric("equity").notNull().default("0"),
  usedMargin: numeric("used_margin").notNull().default("0"),
  availableMargin: numeric("available_margin").notNull().default("0"),
  buyingPower: numeric("buying_power").notNull().default("0"),
  portfolioValue: numeric("portfolio_value").notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enterprisePositions = pgTable("enterprise_positions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  portfolioId: varchar("portfolio_id", { length: 50 }).notNull().references(() => enterprisePortfolios.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  assetClass: varchar("asset_class", { length: 50 }).notNull(), // NSE_STOCKS, BSE_STOCKS, ETF, INDEX, STOCK_FUTURES, INDEX_FUTURES, STOCK_OPTIONS, INDEX_OPTIONS, MCX_COMMODITIES
  status: varchar("status", { length: 20 }).notNull(), // OPEN, CLOSED
  openQuantity: numeric("open_quantity").notNull().default("0"),
  averagePrice: numeric("average_price").notNull().default("0"),
  currentMarketPrice: numeric("current_market_price").notNull().default("0"),
  marketValue: numeric("market_value").notNull().default("0"),
  unrealizedPnl: numeric("unrealized_pnl").notNull().default("0"),
  realizedPnl: numeric("realized_pnl").notNull().default("0"),
  holdingPeriodDays: integer("holding_period_days").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgPortfolioSymbolUnique: uniqueIndex("ep_pos_org_port_sym_idx").on(table.organizationId, table.portfolioId, table.symbol)
}));

export const enterprisePortfolioSnapshots = pgTable("enterprise_portfolio_snapshots", {
  id: serial("id").primaryKey(),
  portfolioId: varchar("portfolio_id", { length: 50 }).notNull().references(() => enterprisePortfolios.id, { onDelete: "cascade" }),
  snapshotDate: date("snapshot_date").notNull(),
  cashBalance: numeric("cash_balance").notNull(),
  equity: numeric("equity").notNull(),
  portfolioValue: numeric("portfolio_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enterprisePositionHistory = pgTable("enterprise_position_history", {
  id: serial("id").primaryKey(),
  positionId: varchar("position_id", { length: 50 }).notNull().references(() => enterprisePositions.id, { onDelete: "cascade" }),
  executionId: varchar("execution_id", { length: 50 }),
  action: varchar("action", { length: 20 }).notNull(), // OPEN, INCREASE, REDUCE, CLOSE, REOPEN
  quantity: numeric("quantity").notNull(),
  price: numeric("price").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
export const enterpriseTradeJournal = pgTable("enterprise_trade_journal", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  portfolioId: varchar("portfolio_id", { length: 50 }).notNull(),
  positionId: varchar("position_id", { length: 50 }).notNull(),
  executionId: varchar("execution_id", { length: 50 }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  action: varchar("action", { length: 20 }).notNull(), // OPEN, CLOSE, PARTIAL_CLOSE, SCALE_IN, SCALE_OUT, REJECTED, CANCELLED
  side: varchar("side", { length: 10 }).notNull(), // BUY, SELL
  quantity: numeric("quantity").notNull().default("0"),
  price: numeric("price").notNull().default("0"),
  grossPnl: numeric("gross_pnl").default("0"),
  netPnl: numeric("net_pnl").default("0"),
  transactionCosts: numeric("transaction_costs").default("0"),
  status: varchar("status", { length: 20 }).notNull(), // COMPLETED, REJECTED
  metadata: jsonb("metadata"), // Notes, AI context, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enterpriseTradeLedger = pgTable("enterprise_trade_ledger", {
  id: serial("id").primaryKey(),
  journalId: varchar("journal_id", { length: 50 }).notNull().references(() => enterpriseTradeJournal.id, { onDelete: "cascade" }),
  entryType: varchar("entry_type", { length: 20 }).notNull(), // DEBIT, CREDIT
  amount: numeric("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enterprisePnlSnapshots = pgTable("enterprise_pnl_snapshots", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  portfolioId: varchar("portfolio_id", { length: 50 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(), // DAILY, WEEKLY, MONTHLY, YEARLY
  snapshotDate: date("snapshot_date").notNull(),
  realizedPnl: numeric("realized_pnl").notNull().default("0"),
  unrealizedPnl: numeric("unrealized_pnl").notNull().default("0"),
  grossPnl: numeric("gross_pnl").notNull().default("0"),
  netPnl: numeric("net_pnl").notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enterpriseTradeStatistics = pgTable("enterprise_trade_statistics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).notNull(),
  portfolioId: varchar("portfolio_id", { length: 50 }).notNull(),
  totalTrades: integer("total_trades").notNull().default(0),
  winningTrades: integer("winning_trades").notNull().default(0),
  losingTrades: integer("losing_trades").notNull().default(0),
  winRate: numeric("win_rate").notNull().default("0"),
  lossRate: numeric("loss_rate").notNull().default("0"),
  averageHoldingTimeDays: numeric("average_holding_time_days").notNull().default("0"),
  averageProfit: numeric("average_profit").notNull().default("0"),
  averageLoss: numeric("average_loss").notNull().default("0"),
  largestWin: numeric("largest_win").notNull().default("0"),
  largestLoss: numeric("largest_loss").notNull().default("0"),
  profitFactor: numeric("profit_factor").notNull().default("0"),
  expectancy: numeric("expectancy").notNull().default("0"),
  averageRiskReward: numeric("average_risk_reward").notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

// =========================================================
// EP27 ENTERPRISE API GATEWAY & EXTERNAL INTEGRATIONS (EAGI)
// =========================================================

export const enterpriseGatewayRegistry = pgTable("enterprise_gateway_registry", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  serviceType: varchar("service_type", { length: 50 }).notNull(),
  baseUrl: varchar("base_url", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("gw_registry_status_idx").on(table.status),
  index("gw_registry_type_idx").on(table.serviceType)
]);

export const enterpriseGatewayRoutes = pgTable("enterprise_gateway_routes", {
  id: varchar("id", { length: 50 }).primaryKey(),
  registryId: varchar("registry_id", { length: 50 }).references(() => enterpriseGatewayRegistry.id, { onDelete: "cascade" }),
  path: varchar("path", { length: 255 }).notNull(),
  targetModule: varchar("target_module", { length: 100 }).notNull(),
  targetEndpoint: varchar("target_endpoint", { length: 255 }).notNull(),
  version: varchar("version", { length: 20 }).default("v1").notNull(),
  allowedMethods: jsonb("allowed_methods").default([]).notNull(),
  authRequired: boolean("auth_required").default(true).notNull(),
  rateLimitPerMin: integer("rate_limit_per_min").default(600).notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("gw_routes_path_idx").on(table.path),
  index("gw_routes_version_idx").on(table.version),
  index("gw_routes_status_idx").on(table.status)
]);

export const enterpriseGatewayMetrics = pgTable("enterprise_gateway_metrics", {
  id: serial("id").primaryKey(),
  routeId: varchar("route_id", { length: 50 }).references(() => enterpriseGatewayRoutes.id, { onDelete: "set null" }),
  requestsCount: integer("requests_count").default(0).notNull(),
  avgLatencyMs: numeric("avg_latency_ms", { precision: 10, scale: 2 }).default("0.00").notNull(),
  successCount: integer("success_count").default(0).notNull(),
  clientErrorCount: integer("client_error_count").default(0).notNull(),
  serverErrorCount: integer("server_error_count").default(0).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("gw_metrics_route_idx").on(table.routeId),
  index("gw_metrics_ts_idx").on(table.timestamp)
]);

export const enterpriseGatewayLogs = pgTable("enterprise_gateway_logs", {
  id: serial("id").primaryKey(),
  correlationId: varchar("correlation_id", { length: 100 }).notNull(),
  requestId: varchar("request_id", { length: 100 }).notNull(),
  clientIp: varchar("client_ip", { length: 45 }),
  consumerId: varchar("consumer_id", { length: 50 }),
  routeId: varchar("route_id", { length: 50 }),
  path: varchar("path", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: integer("status_code").notNull(),
  executionTimeMs: integer("execution_time_ms").default(0).notNull(),
  errorDetails: text("error_details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("gw_logs_corr_idx").on(table.correlationId),
  index("gw_logs_req_idx").on(table.requestId),
  index("gw_logs_route_idx").on(table.routeId),
  index("gw_logs_ts_idx").on(table.timestamp)
]);

export const enterpriseGatewayHealth = pgTable("enterprise_gateway_health", {
  id: serial("id").primaryKey(),
  serviceName: varchar("service_name", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  latencyMs: integer("latency_ms").default(0).notNull(),
  lastChecked: timestamp("last_checked").defaultNow().notNull(),
}, (table) => [
  index("gw_health_svc_idx").on(table.serviceName),
  index("gw_health_ts_idx").on(table.lastChecked)
]);

export const enterpriseGatewayRateLimits = pgTable("enterprise_gateway_rate_limits", {
  id: varchar("id", { length: 50 }).primaryKey(),
  scope: varchar("scope", { length: 50 }).notNull(),
  targetId: varchar("target_id", { length: 100 }),
  requestsPerMinute: integer("requests_per_minute").notNull(),
  burstCapacity: integer("burst_capacity").notNull(),
  currentUsagePercent: numeric("current_usage_percent", { precision: 5, scale: 2 }).default("0.00").notNull(),
  status: varchar("status", { length: 20 }).default("ENFORCED").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("gw_rl_scope_idx").on(table.scope),
  index("gw_rl_target_idx").on(table.targetId)
]);

export const enterpriseGatewayVersions = pgTable("enterprise_gateway_versions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  version: varchar("version", { length: 20 }).notNull(),
  releaseDate: date("release_date").notNull(),
  deprecationDate: date("deprecation_date"),
  activeRoutesCount: integer("active_routes_count").default(0).notNull(),
  status: varchar("status", { length: 20 }).default("SUPPORTED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("gw_ver_version_idx").on(table.version)
]);

export const enterpriseGatewayConsumers = pgTable("enterprise_gateway_consumers", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  apiKeyPrefix: varchar("api_key_prefix", { length: 50 }),
  assignedRole: varchar("assigned_role", { length: 50 }),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
}, (table) => [
  index("gw_consumers_org_idx").on(table.organizationId),
  index("gw_consumers_status_idx").on(table.status)
]);

export const enterpriseGatewayPolicies = pgTable("enterprise_gateway_policies", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  config: jsonb("config").default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("gw_policies_type_idx").on(table.type)
]);

export const enterpriseGatewayUsage = pgTable("enterprise_gateway_usage", {
  id: serial("id").primaryKey(),
  consumerId: varchar("consumer_id", { length: 50 }).references(() => enterpriseGatewayConsumers.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  routeId: varchar("route_id", { length: 50 }).references(() => enterpriseGatewayRoutes.id, { onDelete: "cascade" }),
  dailyRequests: integer("daily_requests").default(0).notNull(),
  dataTransferredBytes: numeric("data_transferred_bytes", { precision: 20, scale: 0 }).default("0").notNull(),
  usageDate: date("usage_date").defaultNow().notNull(),
}, (table) => [
  index("gw_usage_consumer_idx").on(table.consumerId),
  index("gw_usage_org_idx").on(table.organizationId),
  index("gw_usage_date_idx").on(table.usageDate)
]);

// =========================================================
// PHASE 10D ENTERPRISE SECRETS & KEY MANAGEMENT (ESKM)
// =========================================================

export const enterpriseSecrets = pgTable("enterprise_secrets", {
  id: varchar("id", { length: 50 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 50 }).references(() => organizations.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id", { length: 50 }).default("default_tenant").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // API_KEY, OPENROUTER, LLM, DB_CREDENTIAL, REDIS, JWT_SECRET, ENCRYPTION_KEY, WEBHOOK_SECRET, SMTP, OAUTH
  maskedValue: varchar("masked_value", { length: 100 }).notNull(),
  encryptedValue: text("encrypted_value").notNull(),
  environment: varchar("environment", { length: 20 }).default("PRODUCTION").notNull(),
  currentVersion: integer("current_version").default(1).notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  autoRotateDays: integer("auto_rotate_days").default(90).notNull(),
  expiresAt: timestamp("expires_at"),
  lastRotatedAt: timestamp("last_rotated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("sec_org_idx").on(table.organizationId),
  index("sec_tenant_idx").on(table.tenantId),
  index("sec_cat_idx").on(table.category),
  index("sec_status_idx").on(table.status),
  index("sec_env_idx").on(table.environment)
]);

export const enterpriseSecretVersions = pgTable("enterprise_secret_versions", {
  id: serial("id").primaryKey(),
  secretId: varchar("secret_id", { length: 50 }).references(() => enterpriseSecrets.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  maskedValue: varchar("masked_value", { length: 100 }).notNull(),
  encryptedValue: text("encrypted_value").notNull(),
  createdReason: varchar("created_reason", { length: 100 }).default("INITIAL_CREATION"),
  createdBy: varchar("created_by", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sec_ver_secret_idx").on(table.secretId),
  index("sec_ver_num_idx").on(table.version)
]);

export const enterpriseSecretRotation = pgTable("enterprise_secret_rotation", {
  id: varchar("id", { length: 50 }).primaryKey(),
  secretId: varchar("secret_id", { length: 50 }).references(() => enterpriseSecrets.id, { onDelete: "cascade" }),
  rotationPolicy: varchar("rotation_policy", { length: 50 }).default("SCHEDULED_90_DAYS").notNull(),
  status: varchar("status", { length: 20 }).default("COMPLETED").notNull(),
  previousVersion: integer("previous_version").notNull(),
  newVersion: integer("new_version").notNull(),
  triggeredBy: varchar("triggered_by", { length: 100 }).notNull(),
  scheduledAt: timestamp("scheduled_at").defaultNow().notNull(),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
}, (table) => [
  index("sec_rot_secret_idx").on(table.secretId),
  index("sec_rot_status_idx").on(table.status)
]);

export const enterpriseSecretAccess = pgTable("enterprise_secret_access", {
  id: serial("id").primaryKey(),
  secretId: varchar("secret_id", { length: 50 }).references(() => enterpriseSecrets.id, { onDelete: "cascade" }),
  accessorId: varchar("accessor_id", { length: 100 }).notNull(),
  accessorRole: varchar("accessor_role", { length: 50 }).notNull(),
  accessType: varchar("access_type", { length: 50 }).notNull(),
  granted: boolean("granted").default(true).notNull(),
  clientIp: varchar("client_ip", { length: 45 }),
  accessedAt: timestamp("accessed_at").defaultNow().notNull(),
}, (table) => [
  index("sec_acc_secret_idx").on(table.secretId),
  index("sec_acc_accessor_idx").on(table.accessorId),
  index("sec_acc_ts_idx").on(table.accessedAt)
]);

export const enterpriseSecretUsage = pgTable("enterprise_secret_usage", {
  id: serial("id").primaryKey(),
  secretId: varchar("secret_id", { length: 50 }).references(() => enterpriseSecrets.id, { onDelete: "cascade" }),
  moduleName: varchar("module_name", { length: 100 }).notNull(),
  dailyAccessCount: integer("daily_access_count").default(0).notNull(),
  lastCallLatencyMs: integer("last_call_latency_ms").default(0).notNull(),
  usageDate: date("usage_date").defaultNow().notNull(),
}, (table) => [
  index("sec_use_secret_idx").on(table.secretId),
  index("sec_use_module_idx").on(table.moduleName),
  index("sec_use_date_idx").on(table.usageDate)
]);

export const enterpriseSecretValidation = pgTable("enterprise_secret_validation", {
  id: serial("id").primaryKey(),
  secretId: varchar("secret_id", { length: 50 }).references(() => enterpriseSecrets.id, { onDelete: "cascade" }),
  validationType: varchar("validation_type", { length: 50 }).notNull(),
  isValid: boolean("is_valid").notNull(),
  checkDetails: text("check_details"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
}, (table) => [
  index("sec_val_secret_idx").on(table.secretId),
  index("sec_val_ts_idx").on(table.checkedAt)
]);

export const enterpriseSecretAudit = pgTable("enterprise_secret_audit", {
  id: serial("id").primaryKey(),
  secretId: varchar("secret_id", { length: 50 }),
  action: varchar("action", { length: 50 }).notNull(),
  performedBy: varchar("performed_by", { length: 100 }).notNull(),
  organizationId: varchar("organization_id", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("sec_aud_secret_idx").on(table.secretId),
  index("sec_aud_action_idx").on(table.action),
  index("sec_aud_ts_idx").on(table.timestamp)
]);

export const enterpriseSecretPermissions = pgTable("enterprise_secret_permissions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  secretId: varchar("secret_id", { length: 50 }).references(() => enterpriseSecrets.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(),
  canReadMetadata: boolean("can_read_metadata").default(true).notNull(),
  canDecryptValue: boolean("can_decrypt_value").default(false).notNull(),
  canRotate: boolean("can_rotate").default(false).notNull(),
  canDelete: boolean("can_delete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sec_perm_secret_idx").on(table.secretId),
  index("sec_perm_role_idx").on(table.role)
]);

export const enterpriseSecretProfiles = pgTable("enterprise_secret_profiles", {
  id: varchar("id", { length: 50 }).primaryKey(),
  profileName: varchar("profile_name", { length: 100 }).notNull(),
  environment: varchar("environment", { length: 20 }).notNull(),
  managedSecretsCount: integer("managed_secrets_count").default(0).notNull(),
  encryptionAlgorithm: varchar("encryption_algorithm", { length: 50 }).default("AES-256-GCM").notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sec_prof_env_idx").on(table.environment)
]);

// =========================================================
// PHASE 10E ENTERPRISE BACKUP & DISASTER RECOVERY (EBDR)
// =========================================================

export const enterpriseBackupJobs = pgTable("enterprise_backup_jobs", {
  id: varchar("id", { length: 50 }).primaryKey(),
  jobName: varchar("job_name", { length: 100 }).notNull(),
  policyId: varchar("policy_id", { length: 50 }),
  backupType: varchar("backup_type", { length: 30 }).notNull(), // FULL, INCREMENTAL, SNAPSHOT, DIFFERENTIAL
  snapshotId: varchar("snapshot_id", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull(), // PENDING, RUNNING, SUCCESS, VERIFIED, FAILED
  sizeMb: integer("size_mb").default(0).notNull(),
  durationMs: integer("duration_ms").default(0).notNull(),
  checksumSha256: varchar("checksum_sha256", { length: 100 }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("bk_job_policy_idx").on(table.policyId),
  index("bk_job_status_idx").on(table.status),
  index("bk_job_type_idx").on(table.backupType)
]);

export const enterpriseBackupSnapshots = pgTable("enterprise_backup_snapshots", {
  id: varchar("id", { length: 50 }).primaryKey(),
  category: varchar("category", { length: 50 }).notNull(), // DATABASE, WORKSPACE, CONFIGURATION, POLICY, SECRETS, GATEWAY, METADATA
  sourceModule: varchar("source_module", { length: 100 }).notNull(),
  sizeMb: integer("size_mb").default(0).notNull(),
  checksumSha256: varchar("checksum_sha256", { length: 100 }).notNull(),
  compressionRatio: varchar("compression_ratio", { length: 20 }).default("2.5:1").notNull(),
  encryptionAlgorithm: varchar("encryption_algorithm", { length: 50 }).default("AES-256-GCM").notNull(),
  status: varchar("status", { length: 20 }).default("READY").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
}, (table) => [
  index("bk_snp_cat_idx").on(table.category),
  index("bk_snp_status_idx").on(table.status)
]);

export const enterpriseBackupHistory = pgTable("enterprise_backup_history", {
  id: serial("id").primaryKey(),
  jobId: varchar("job_id", { length: 50 }),
  snapshotId: varchar("snapshot_id", { length: 50 }),
  action: varchar("action", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  sizeMb: integer("size_mb").default(0).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("bk_hist_job_idx").on(table.jobId),
  index("bk_hist_ts_idx").on(table.timestamp)
]);

export const enterpriseRestoreHistory = pgTable("enterprise_restore_history", {
  id: varchar("id", { length: 50 }).primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 50 }).notNull(),
  restoreType: varchar("restore_type", { length: 50 }).notNull(),
  targetDestination: varchar("target_destination", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  initiatedBy: varchar("initiated_by", { length: 100 }).notNull(),
  restoredAt: timestamp("restored_at").defaultNow().notNull(),
  validationResult: text("validation_result"),
}, (table) => [
  index("rst_hist_snp_idx").on(table.snapshotId),
  index("rst_hist_status_idx").on(table.status)
]);

export const enterpriseBackupValidation = pgTable("enterprise_backup_validation", {
  id: serial("id").primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 50 }).notNull(),
  validationType: varchar("validation_type", { length: 50 }).notNull(),
  passed: boolean("passed").notNull(),
  checkDetails: text("check_details"),
  validatedAt: timestamp("validated_at").defaultNow().notNull(),
}, (table) => [
  index("bk_val_snp_idx").on(table.snapshotId),
  index("bk_val_ts_idx").on(table.validatedAt)
]);

export const enterpriseBackupIntegrity = pgTable("enterprise_backup_integrity", {
  id: serial("id").primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 50 }).notNull(),
  sha256Checksum: varchar("sha256_checksum", { length: 100 }).notNull(),
  blockCorruptionCount: integer("block_corruption_count").default(0).notNull(),
  integrityStatus: varchar("integrity_status", { length: 20 }).default("INTACT").notNull(),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
}, (table) => [
  index("bk_int_snp_idx").on(table.snapshotId),
  index("bk_int_status_idx").on(table.integrityStatus)
]);

export const enterpriseBackupRetention = pgTable("enterprise_backup_retention", {
  id: varchar("id", { length: 50 }).primaryKey(),
  ruleName: varchar("rule_name", { length: 100 }).notNull(),
  backupType: varchar("backup_type", { length: 30 }).notNull(),
  retentionDays: integer("retention_days").notNull(),
  autoArchive: boolean("auto_archive").default(true).notNull(),
  expiryAction: varchar("expiry_action", { length: 30 }).default("COLD_STORAGE").notNull(),
  totalStoredMb: integer("total_stored_mb").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("bk_ret_type_idx").on(table.backupType)
]);

export const enterpriseBackupRecovery = pgTable("enterprise_backup_recovery", {
  id: varchar("id", { length: 50 }).primaryKey(),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  failureMode: varchar("failure_mode", { length: 50 }).notNull(),
  standbyNodeStatus: varchar("standby_node_status", { length: 30 }).default("ACTIVE_STANDBY").notNull(),
  rtoMinutes: integer("rto_minutes").notNull(),
  rpoMinutes: integer("rpo_minutes").notNull(),
  lastDrTestAt: timestamp("last_dr_test_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("HEALTHY").notNull(),
}, (table) => [
  index("bk_rec_status_idx").on(table.status)
]);

export const enterpriseBackupReports = pgTable("enterprise_backup_reports", {
  id: varchar("id", { length: 50 }).primaryKey(),
  reportTitle: varchar("report_title", { length: 100 }).notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(),
  healthScore: integer("health_score").default(100).notNull(),
  summary: text("summary"),
  generatedBy: varchar("generated_by", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("bk_rep_type_idx").on(table.reportType)
]);

export const enterpriseBackupAudit = pgTable("enterprise_backup_audit", {
  id: serial("id").primaryKey(),
  backupOrRestoreId: varchar("backup_or_restore_id", { length: 50 }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  details: text("details"),
  clientIp: varchar("client_ip", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("bk_aud_event_idx").on(table.eventType),
  index("bk_aud_ts_idx").on(table.timestamp)
]);

// Strategy Candidates Engine (Module 7)
export const strategyCandidates = pgTable("strategy_candidates", {
  candidateId: varchar("candidate_id", { length: 50 }).primaryKey(),
  strategyId: varchar("strategy_id", { length: 50 }).notNull(),
  strategyVersion: varchar("strategy_version", { length: 20 }).notNull(),
  workingCopyId: varchar("working_copy_id", { length: 50 }),
  aiModelId: varchar("ai_model_id", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  assetClass: varchar("asset_class", { length: 50 }).notNull(),
  direction: varchar("direction", { length: 10 }).notNull(), // BUY, SELL
  entryPrice: numeric("entry_price", { precision: 12, scale: 4 }),
  stopLoss: numeric("stop_loss", { precision: 12, scale: 4 }),
  targets: jsonb("targets").default([]),
  riskReward: numeric("risk_reward", { precision: 8, scale: 2 }),
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  reasoning: text("reasoning"),
  marketContext: text("market_context"),
  technicalSummary: text("technical_summary"),
  fundamentalSummary: text("fundamental_summary"),
  volumeSummary: text("volume_summary"),
  volatilitySummary: text("volatility_summary"),
  newsSummary: text("news_summary"),
  indicatorSnapshot: jsonb("indicator_snapshot").default({}),
  createdTime: timestamp("created_time").defaultNow().notNull(),
  expiryTime: timestamp("expiry_time"),
  candidateStatus: varchar("candidate_status", { length: 30 }).default("COMMITTEE_PENDING").notNull(), // PENDING, REJECTED, APPROVED, EXPIRED, COMMITTEE_PENDING
  score: numeric("score", { precision: 6, scale: 2 }),
  committeeScore: numeric("committee_score", { precision: 6, scale: 2 }),
  riskScore: numeric("risk_score", { precision: 6, scale: 2 }),
  qualityScore: numeric("quality_score", { precision: 6, scale: 2 }),
  priorityScore: numeric("priority_score", { precision: 6, scale: 2 }),
  duplicateHash: varchar("duplicate_hash", { length: 100 }),
  sha256Reference: varchar("sha256_reference", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("strat_cand_strategy_idx").on(table.strategyId),
  index("strat_cand_status_idx").on(table.candidateStatus),
  index("strat_cand_symbol_idx").on(table.symbol),
  index("strat_cand_hash_idx").on(table.duplicateHash)
]);

export const strategyCandidateVotes = pgTable("strategy_candidate_votes", {
  id: serial("id").primaryKey(),
  candidateId: varchar("candidate_id", { length: 50 }).references(() => strategyCandidates.candidateId, { onDelete: "cascade" }).notNull(),
  committeeMember: varchar("committee_member", { length: 100 }).notNull(),
  vote: varchar("vote", { length: 20 }).notNull(), // APPROVE, REJECT, ABSTAIN
  comment: text("comment"),
  votedAt: timestamp("voted_at").defaultNow().notNull(),
}, (table) => [
  index("cand_votes_cand_idx").on(table.candidateId)
]);

export const strategyCandidateHistory = pgTable("strategy_candidate_history", {
  id: serial("id").primaryKey(),
  candidateId: varchar("candidate_id", { length: 50 }).references(() => strategyCandidates.candidateId, { onDelete: "cascade" }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  operator: varchar("operator", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("cand_hist_cand_idx").on(table.candidateId)
]);

export const strategyCandidateValidation = pgTable("strategy_candidate_validation", {
  id: serial("id").primaryKey(),
  candidateId: varchar("candidate_id", { length: 50 }).references(() => strategyCandidates.candidateId, { onDelete: "cascade" }).notNull(),
  isValid: boolean("is_valid").notNull(),
  ruleName: varchar("rule_name", { length: 100 }).notNull(),
  message: text("message"),
  validatedAt: timestamp("validated_at").defaultNow().notNull(),
}, (table) => [
  index("cand_val_cand_idx").on(table.candidateId)
]);

export const strategyCandidateTags = pgTable("strategy_candidate_tags", {
  id: serial("id").primaryKey(),
  candidateId: varchar("candidate_id", { length: 50 }).references(() => strategyCandidates.candidateId, { onDelete: "cascade" }).notNull(),
  tag: varchar("tag", { length: 50 }).notNull(),
}, (table) => [
  index("cand_tags_cand_idx").on(table.candidateId)
]);

export const strategyCandidateResearch = pgTable("strategy_candidate_research", {
  id: serial("id").primaryKey(),
  candidateId: varchar("candidate_id", { length: 50 }).references(() => strategyCandidates.candidateId, { onDelete: "cascade" }).notNull(),
  researchSource: varchar("research_source", { length: 100 }).notNull(),
  summary: text("summary"),
  sentiment: varchar("sentiment", { length: 20 }),
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  researchedAt: timestamp("researched_at").defaultNow().notNull(),
}, (table) => [
  index("cand_res_cand_idx").on(table.candidateId)
]);

export const enterpriseAlerts = pgTable("enterprise_alerts", {
  id: serial("id").primaryKey(),
  alertId: varchar("alert_id", { length: 50 }).notNull().unique(),
  eventId: varchar("event_id", { length: 50 }).notNull(),
  alertType: varchar("alert_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // INFO, WARNING, CRITICAL
  sourceModule: varchar("source_module", { length: 50 }).notNull(),
  sourceEntity: varchar("source_entity", { length: 100 }),
  aiModelId: varchar("ai_model_id", { length: 100 }),
  provider: varchar("provider", { length: 50 }),
  version: varchar("version", { length: 20 }),
  market: varchar("market", { length: 50 }).default("INDIAN"),
  category: varchar("category", { length: 50 }),
  exchange: varchar("exchange", { length: 50 }),
  labId: varchar("lab_id", { length: 50 }),
  instrument: varchar("instrument", { length: 50 }),
  message: text("message").notNull(),
  eventTimestamp: timestamp("event_timestamp").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("NEW").notNull(), // NEW, READ, ACKNOWLEDGED, RESOLVED
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("enterpriseAlerts_alertId_idx").on(table.alertId),
  index("enterpriseAlerts_eventId_idx").on(table.eventId),
  index("enterpriseAlerts_status_idx").on(table.status),
  index("enterpriseAlerts_severity_idx").on(table.severity),
  index("enterpriseAlerts_sourceModule_idx").on(table.sourceModule),
  index("enterpriseAlerts_aiModelId_idx").on(table.aiModelId),
  index("enterpriseAlerts_createdAt_idx").on(table.createdAt)
]);






