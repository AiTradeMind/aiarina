# AITradeMinds (AAOS 28/31) Existing Database Inventory

This document represents the comprehensive audit and technical inventory of the full-scale **AITradeMinds Enterprise Data Model** as defined in the master reference projects (AAOS 28 and AAOS 31). This schema is designed to back the high-density financial terminal and automated research execution workflows across all 9 workspaces.

---

## 📂 Logical Module Mapping & Source Files

In the enterprise monorepo configuration of AITradeMinds, the database schema is divided into modular typescript files to manage token constraints and ensure separation of concerns:

1.  **Identity & Security Layer (`@/src/db/schema/identity.ts`)**
2.  **Market Intelligence Layer (`@/src/db/schema/market.ts`)**
3.  **Ledger & Capital Accounts Layer (`@/src/db/schema/ledger.ts`)**
4.  **Order Routing & Execution Layer (`@/src/db/schema/execution.ts`)**
5.  **Generative AI & Quantitative Research Layer (`@/src/db/schema/analytics.ts`)**
6.  **Risk Management & System Configuration Layer (`@/src/db/schema/risk.ts`)**

---

## 🗄️ Detailed Table Inventory

### 1. Identity & Security Module (`identity.ts`)

#### Table: `users`
*   **Description**: Stores master corporate user accounts, roles, and authorization flags.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Unique user identifier.
    *   `email` (`varchar(255)` / `not null` / `unique`): Corporate email used for single-sign on (SSO).
    *   `password_hash` (`varchar(255)` / `not null`): Salted secure hashing credentials.
    *   `role` (`varchar(50)` / `not null` / `default: 'trader'`): Account level authorization (`admin`, `trader`, `analyst`).
    *   `status` (`varchar(50)` / `not null` / `default: 'active'`): User status (`active`, `suspended`, `inactive`).
    *   `created_at` (`timestamp with time zone` / `default: now()`): Enrollment timestamp.
    *   `updated_at` (`timestamp with time zone` / `default: now()`): Modification timestamp.
*   **Constraints**:
    *   `chk_user_role`: CHECK (`role` IN ('admin', 'trader', 'analyst'))
    *   `chk_user_status`: CHECK (`status` IN ('active', 'suspended', 'inactive'))
*   **Indexes**:
    *   `idx_users_email` (btree): Optimized unique lookup for authentication.
    *   `idx_users_role` (btree): Rapid filtering for administrative audit trails.

#### Table: `user_settings`
*   **Description**: Holds custom terminal layout preferences, default workspaces, and UI state parameters.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Configuration row identifier.
    *   `user_id` (`integer` / `not null` / `unique`): Reference to `users.id`.
    *   `theme` (`varchar(50)` / `default: 'dark'`): Palette choice (`dark`, `light`, `bloomberg-amber`).
    *   `density` (`varchar(50)` / `default: 'high'`): Layout packing ratio (`high`, `medium`, `low`).
    *   `default_workspace` (`varchar(100)` / `default: 'Bloomberg'`): Initial screen view configuration.
    *   `notifications_enabled` (`boolean` / `default: true`): Alerts activation flag.
    *   `updated_at` (`timestamp with time zone` / `default: now()`): Modification timestamp.
*   **Foreign Keys**:
    *   `fk_user_settings_users`: `user_id` REFERENCES `users` (`id`) ON DELETE CASCADE
*   **Constraints**:
    *   `chk_settings_theme`: CHECK (`theme` IN ('dark', 'light', 'bloomberg-amber'))
    *   `chk_settings_density`: CHECK (`density` IN ('high', 'medium', 'low'))

#### Table: `api_keys`
*   **Description**: Stores encrypted third-party credentials (brokerages, news APIs, and Gemini AI tokens).
*   **Columns**:
    *   `id` (`serial` / `primary key`): Key identifier.
    *   `user_id` (`integer` / `not null`): Reference to `users.id`.
    *   `provider` (`varchar(100)` / `not null`): Service indicator (e.g., `gemini`, `alpaca`, `finnhub`).
    *   `encrypted_key` (`text` / `not null`): AES-256 encrypted access key.
    *   `encrypted_secret` (`text`): AES-256 encrypted access secret.
    *   `status` (`varchar(50)` / `default: 'active'`): Key operational status (`active`, `revoked`).
    *   `created_at` (`timestamp with time zone` / `default: now()`): Addition timestamp.
*   **Foreign Keys**:
    *   `fk_api_keys_users`: `user_id` REFERENCES `users` (`id`) ON DELETE CASCADE
*   **Indexes**:
    *   `idx_api_keys_user_provider` (btree): Query optimizer for fetching specific connector keys.

---

### 2. Market Intelligence Module (`market.ts`)

#### Table: `instruments`
*   **Description**: Master asset definition table for equities, commodities, futures, and currencies.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Instrument identifier.
    *   `ticker` (`varchar(12)` / `not null` / `unique`): Trading symbol (e.g., `AAPL`, `BTC/USD`).
    *   `name` (`varchar(150)` / `not null`): Asset name.
    *   `asset_class` (`varchar(50)` / `not null`): Asset class (`equity`, `crypto`, `forex`, `commodity`).
    *   `exchange` (`varchar(100)` / `not null`): Listing exchange (`NASDAQ`, `NYSE`, `CME`).
    *   `is_active` (`boolean` / `default: true`): Trading status indicator.
    *   `tick_size` (`numeric(10, 5)` / `default: 0.01`): Minimum price change increment.
    *   `lot_size` (`integer` / `default: 1`): Minimum order share increments.
    *   `currency` (`varchar(3)` / `default: 'USD'`): Native denomination currency.
*   **Indexes**:
    *   `idx_instruments_ticker` (btree): Core lookup index for streaming order books.
    *   `idx_instruments_class` (btree): Grouping filter for market-watch categories.

#### Table: `market_data_snapshots`
*   **Description**: Fast-updating cache containing bids, asks, and trading volumes backing the Bloomberg Workspace.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Row identifier.
    *   `instrument_id` (`integer` / `not null` / `unique`): Reference to `instruments.id`.
    *   `bid` (`numeric(12, 4)` / `not null`): Best bid price.
    *   `ask` (`numeric(12, 4)` / `not null`): Best ask price.
    *   `last_price` (`numeric(12, 4)` / `not null`): Executed price of the last transaction.
    *   `volume` (`bigint` / `not null` / `default: 0`): Daily volume traded.
    *   `timestamp` (`timestamp with time zone` / `default: now()`): Timestamp of last price change.
*   **Foreign Keys**:
    *   `fk_market_snapshots_instruments`: `instrument_id` REFERENCES `instruments` (`id`) ON DELETE CASCADE
*   **Indexes**:
    *   `idx_snapshots_instrument` (btree): Quick retrieval of current ticker spread.

#### Table: `news_feed`
*   **Description**: Consolidates streaming financial news alerts and sentiment analysis for terminal panels.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Article identifier.
    *   `instrument_id` (`integer`): Reference to `instruments.id` (nullable for macro news).
    *   `source` (`varchar(100)` / `not null`): Editorial source (e.g., `Bloomberg`, `Reuters`).
    *   `title` (`varchar(500)` / `not null`): Heading text.
    *   `url` (`text`): External access URL.
    *   `sentiment_score` (`numeric(3, 2)`): Quant value between `-1.00` (bearish) and `+1.00` (bullish).
    *   `published_at` (`timestamp with time zone` / `not null`): Publishing timestamp.
*   **Foreign Keys**:
    *   `fk_news_instruments`: `instrument_id` REFERENCES `instruments` (`id`) ON DELETE SET NULL
*   **Indexes**:
    *   `idx_news_published` (btree): Staggered chronological news list sorting.
    *   `idx_news_sentiment` (btree): Query optimizer for extreme bullish/bearish signal filters.

---

### 3. Ledger & Capital Accounts Module (`ledger.ts`)

#### Table: `accounts`
*   **Description**: Manages institutional trading accounts, leveraging caps, and primary currency settings.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Account identifier.
    *   `user_id` (`integer` / `not null`): Reference to `users.id`.
    *   `account_type` (`varchar(50)` / `not null` / `default: 'margin'`): Credit structure (`cash`, `margin`, `institutional`).
    *   `status` (`varchar(50)` / `default: 'active'`): Operational status (`active`, `frozen`, `closed`).
    *   `base_currency` (`varchar(3)` / `default: 'USD'`): Settlement currency.
    *   `margin_enabled` (`boolean` / `default: false`): Margin allowance flag.
    *   `leverage_limit` (`numeric(5, 2)` / `default: 1.00`): Maximum leverage multiplier.
    *   `created_at` (`timestamp with time zone` / `default: now()`): Establishment timestamp.
*   **Foreign Keys**:
    *   `fk_accounts_users`: `user_id` REFERENCES `users` (`id`) ON DELETE CASCADE
*   **Constraints**:
    *   `chk_account_type`: CHECK (`account_type` IN ('cash', 'margin', 'institutional'))
    *   `chk_account_status`: CHECK (`status` IN ('active', 'frozen', 'closed'))

#### Table: `portfolios`
*   **Description**: Sub-portfolios structured under primary capital accounts for specific algorithmic or discretionary mandate execution.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Portfolio identifier.
    *   `account_id` (`integer` / `not null`): Reference to `accounts.id`.
    *   `name` (`varchar(100)` / `not null`): Portfolio name.
    *   `description` (`varchar(255)`): Strategy description (e.g., `Long-Short AI Alpha`).
    *   `is_active` (`boolean` / `default: true`): Status flag.
    *   `created_at` (`timestamp with time zone` / `default: now()`): Creation timestamp.
*   **Foreign Keys**:
    *   `fk_portfolios_accounts`: `account_id` REFERENCES `accounts` (`id`) ON DELETE CASCADE
*   **Indexes**:
    *   `idx_portfolios_account_id` (btree): Relational connection mapping.

#### Table: `portfolio_balances`
*   **Description**: Detailed capital balances, tracks available purchasing power, locked capital, and maintenance margin.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Balance row identifier.
    *   `portfolio_id` (`integer` / `not null` / `unique`): Reference to `portfolios.id`.
    *   `cash_balance` (`numeric(15, 2)` / `not null`): Available unallocated cash.
    *   `locked_balance` (`numeric(15, 2)` / `default: 0.00`): Capital reserved for pending limit orders.
    *   `margin_balance` (`numeric(15, 2)` / `default: 0.00`): Outstanding margin loan balance.
    *   `updated_at` (`timestamp with time zone` / `default: now()`): Last ledger recalculation timestamp.
*   **Foreign Keys**:
    *   `fk_balances_portfolios`: `portfolio_id` REFERENCES `portfolios` (`id`) ON DELETE CASCADE

---

### 4. Order Routing & Execution Module (`execution.ts`)

#### Table: `orders`
*   **Description**: Stateful order routing log tracking life-cycles of all trade executions.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Order identifier.
    *   `portfolio_id` (`integer` / `not null`): Reference to `portfolios.id`.
    *   `instrument_id` (`integer` / `not null`): Reference to `instruments.id`.
    *   `type` (`varchar(20)` / `not null`): Order instructions (`LIMIT`, `MARKET`, `STOP`, `STOP_LIMIT`).
    *   `side` (`varchar(10)` / `not null`): Action (`BUY`, `SELL`).
    *   `status` (`varchar(50)` / `default: 'PENDING'`): Transaction state (`PENDING`, `FILLED`, `PARTIALLY_FILLED`, `CANCELLED`, `REJECTED`).
    *   `limit_price` (`numeric(12, 4)`): Required price constraint (for Limit/Stop-Limit).
    *   `stop_price` (`numeric(12, 4)`): Trigger price constraint (for Stop/Stop-Limit).
    *   `quantity` (`numeric(12, 4)` / `not null`): Order size.
    *   `remaining_quantity` (`numeric(12, 4)` / `not null`): Filled volume delta.
    *   `time_in_force` (`varchar(10)` / `default: 'GTC'`): Expiry guidelines (`GTC`, `DAY`, `IOC`).
    *   `created_at` (`timestamp with time zone` / `default: now()`): Entry timestamp.
    *   `updated_at` (`timestamp with time zone` / `default: now()`): Life-cycle modification timestamp.
*   **Foreign Keys**:
    *   `fk_orders_portfolios`: `portfolio_id` REFERENCES `portfolios` (`id`) ON DELETE CASCADE
    *   `fk_orders_instruments`: `instrument_id` REFERENCES `instruments` (`id`) ON DELETE CASCADE
*   **Constraints**:
    *   `chk_order_type`: CHECK (`type` IN ('LIMIT', 'MARKET', 'STOP', 'STOP_LIMIT'))
    *   `chk_order_side`: CHECK (`side` IN ('BUY', 'SELL'))
    *   `chk_order_status`: CHECK (`status` IN ('PENDING', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED'))
*   **Indexes**:
    *   `idx_orders_portfolio` (btree): Performance index for open orders.
    *   `idx_orders_status` (btree): Filter index for order matching queues.

#### Table: `trades`
*   **Description**: Audit record of executed fractional and whole trades.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Trade tick identifier.
    *   `order_id` (`integer` / `not null`): Reference to `orders.id`.
    *   `portfolio_id` (`integer` / `not null`): Reference to `portfolios.id`.
    *   `instrument_id` (`integer` / `not null`): Reference to `instruments.id`.
    *   `price` (`numeric(12, 4)` / `not null`): Execution price.
    *   `quantity` (`numeric(12, 4)` / `not null`): Filled volume size.
    *   `commission` (`numeric(10, 4)` / `default: 0.00`): Execution fee.
    *   `executed_at` (`timestamp with time zone` / `default: now()`): Match timestamp.
*   **Foreign Keys**:
    *   `fk_trades_orders`: `order_id` REFERENCES `orders` (`id`) ON DELETE CASCADE
    *   `fk_trades_portfolios`: `portfolio_id` REFERENCES `portfolios` (`id`) ON DELETE CASCADE
    *   `fk_trades_instruments`: `instrument_id` REFERENCES `instruments` (`id`) ON DELETE CASCADE
*   **Indexes**:
    *   `idx_trades_portfolio_date` (btree): Chronological sorting index for trade logs.
    *   `idx_trades_instrument` (btree): Ticker history compilation filter.

#### Table: `positions`
*   **Description**: Holds live net-open exposures and moving average cost bases.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Position identifier.
    *   `portfolio_id` (`integer` / `not null`): Reference to `portfolios.id`.
    *   `instrument_id` (`integer` / `not null`): Reference to `instruments.id`.
    *   `side` (`varchar(10)` / `not null`): Direction (`LONG`, `SHORT`).
    *   `quantity` (`numeric(12, 4)` / `not null`): Total accumulated holding size.
    *   `average_entry_price` (`numeric(12, 4)` / `not null`): Weighted dynamic cost basis.
    *   `unrealized_pnl` (`numeric(15, 4)` / `default: 0.00`): Live return delta (regularly updated).
    *   `realized_pnl` (`numeric(15, 4)` / `default: 0.00`): Harvested returns.
    *   `updated_at` (`timestamp with time zone` / `default: now()`): Last evaluation timestamp.
*   **Foreign Keys**:
    *   `fk_positions_portfolios`: `portfolio_id` REFERENCES `portfolios` (`id`) ON DELETE CASCADE
    *   `fk_positions_instruments`: `instrument_id` REFERENCES `instruments` (`id`) ON DELETE CASCADE
*   **Constraints**:
    *   `chk_position_side`: CHECK (`side` IN ('LONG', 'SHORT'))
*   **Indexes**:
    *   `idx_positions_composite` (btree): UNIQUE INDEX on (`portfolio_id`, `instrument_id`) ensuring unique position consolidation per asset.

---

### 5. Generative AI & Research Module (`analytics.ts`)

#### Table: `ai_models`
*   **Description**: Registers deployed models, fine-tuned configurations, and latency metrics.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Model registry ID.
    *   `name` (`varchar(100)` / `not null`): Model descriptor (e.g., `gemini-1.5-pro`, `gemini-1.5-flash`).
    *   `version` (`varchar(50)` / `not null`): Semantic version or tag.
    *   `status` (`varchar(50)` / `default: 'active'`): Deployment state (`active`, `deprecated`).
    *   `parameters` (`jsonb` / `default: '{}'`): Core runtime options (e.g. `temperature`, `topK`).
    *   `created_at` (`timestamp with time zone` / `default: now()`): Registration date.

#### Table: `ai_prompts`
*   **Description**: Repository of structured system instructions, context mappings, and prompt templates.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Prompt row ID.
    *   `name` (`varchar(150)` / `not null`): Prompt handle.
    *   `template` (`text` / `not null`): Raw prompt string with replacement parameters.
    *   `category` (`varchar(100)`): Domain taxonomy (e.g., `technical_analysis`, `news_sentiment`).
    *   `created_at` (`timestamp with time zone` / `default: now()`): Insertion timestamp.

#### Table: `ai_insights`
*   **Description**: Stores structured research logs, scores, and confidence metrics generated by Gemini.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Insight identifier.
    *   `user_id` (`integer` / `not null`): Reference to `users.id`.
    *   `instrument_id` (`integer` / `not null`): Reference to `instruments.id`.
    *   `prompt_id` (`integer`): Reference to `ai_prompts.id` (nullable).
    *   `summary` (`varchar(1000)` / `not null`): Compressed high-level report.
    *   `full_analysis_json` (`jsonb` / `not null` / `default: '{}'`): Granular report keys.
    *   `sentiment_label` (`varchar(50)`): Classified signal (`bullish`, `bearish`, `neutral`).
    *   `confidence_score` (`numeric(5, 4)`): Computed statistical reliability score.
    *   `created_at` (`timestamp with time zone` / `default: now()`): Analysis generation time.
*   **Foreign Keys**:
    *   `fk_insights_users`: `user_id` REFERENCES `users` (`id`) ON DELETE CASCADE
    *   `fk_insights_instruments`: `instrument_id` REFERENCES `instruments` (`id`) ON DELETE CASCADE
    *   `fk_insights_prompts`: `prompt_id` REFERENCES `ai_prompts` (`id`) ON DELETE SET NULL

#### Table: `research_reports`
*   **Description**: Institutional analyst reports incorporating qualitative summaries, quantitative models, and chart attachments.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Report row ID.
    *   `user_id` (`integer` / `not null`): Reference to `users.id`.
    *   `instrument_id` (`integer` / `not null`): Reference to `instruments.id`.
    *   `title` (`varchar(255)` / `not null`): Report title.
    *   `content_markdown` (`text` / `not null`): Markdown core content of the document.
    *   `attachments` (`jsonb` / `default: '[]'`): Array of visual link paths.
    *   `status` (`varchar(50)` / `default: 'draft'`): Drafting step (`draft`, `published`, `archived`).
    *   `created_at` (`timestamp with time zone` / `default: now()`): Initiation date.
    *   `updated_at` (`timestamp with time zone` / `default: now()`): Last modification date.
*   **Foreign Keys**:
    *   `fk_reports_users`: `user_id` REFERENCES `users` (`id`) ON DELETE CASCADE
    *   `fk_reports_instruments`: `instrument_id` REFERENCES `instruments` (`id`) ON DELETE CASCADE
*   **Constraints**:
    *   `chk_report_status`: CHECK (`status` IN ('draft', 'published', 'archived'))
*   **Indexes**:
    *   `idx_reports_instrument_date` (btree): Speeds research workspace lookup sequences.

---

### 6. Risk Management & System Config Module (`risk.ts`)

#### Table: `risk_profiles`
*   **Description**: Defines account boundaries, daily trailing drawdown thresholds, and safety circuit breakers.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Risk config identifier.
    *   `account_id` (`integer` / `not null` / `unique`): Reference to `accounts.id`.
    *   `risk_score` (`integer` / `default: 5`): User profile class (`1` conservative, `10` speculative).
    *   `max_drawdown_limit` (`numeric(5, 2)` / `default: 15.00`): Trigger threshold for auto-liquidation.
    *   `daily_loss_limit` (`numeric(15, 2)` / `default: 50000.00`): Maximum daily P&L loss allowed.
    *   `updated_at` (`timestamp with time zone` / `default: now()`): Parameter check timestamp.
*   **Foreign Keys**:
    *   `fk_risk_accounts`: `account_id` REFERENCES `accounts` (`id`) ON DELETE CASCADE

#### Table: `system_configurations`
*   **Description**: Operational parameters and rate thresholds driving global back-end limits.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Param identifier.
    *   `key` (`varchar(100)` / `not null` / `unique`): Param name (e.g., `rate_limit_rpm`, `global_max_leverage`).
    *   `value` (`text` / `not null`): Configuration setting.
    *   `description` (`varchar(255)`): Text explanation of impact.
    *   `updated_at` (`timestamp with time zone` / `default: now()`): Configuration update audit.

#### Table: `audit_logs`
*   **Description**: Standard corporate system logs detailing administrative, risk, and security access events.
*   **Columns**:
    *   `id` (`serial` / `primary key`): Log line ID.
    *   `user_id` (`integer`): Reference to `users.id` (nullable for anonymous requests).
    *   `action` (`varchar(255)` / `not null`): Operation summary.
    *   `ip_address` (`varchar(45)`): User connection IP.
    *   `browser_user_agent` (`text`): Browser details.
    *   `severity` (`varchar(50)` / `default: 'info'`): Incident level (`info`, `warning`, `critical`).
    *   `payload` (`jsonb` / `default: '{}'`): Details on payload actions.
    *   `timestamp` (`timestamp with time zone` / `default: now()`): Log creation time.
*   **Foreign Keys**:
    *   `fk_audit_users`: `user_id` REFERENCES `users` (`id`) ON DELETE SET NULL
*   **Constraints**:
    *   `chk_audit_severity`: CHECK (`severity` IN ('info', 'warning', 'critical'))
*   **Indexes**:
    *   `idx_audit_severity_time` (btree): Performance index for log monitoring dashboards.

---

## 🔗 Comprehensive Entity-Relationship Topology

```
   [users] ──(1:1)──> [user_settings]
      │
      ├──(1:N)──> [api_keys]
      │
      ├──(1:N)──> [accounts] ──(1:1)──> [risk_profiles]
      │              │
      │           (1:N)
      │              │
      │              ▼
      │         [portfolios] ──(1:1)──> [portfolio_balances]
      │              │
      │           (1:N)
      │              ├───> [orders] ──(1:N)──> [trades]
      │              │        │                   ▲
      │              │     (1:N)               (1:N)
      │              │        │                   │
      │              │        ▼                   │
      │              ├───── [positions]           │
      │              │        │                   │
      │              │     (1:N)               (1:N)
      │              │        │                   │
      │              │        ▼                   │
      │              └─────> [instruments] ───────┘
      │                         ▲   ▲
      │                      (1:N) (1:N)
      │                         │     │
      ├─────────────────────────┘     │
      │  (reports / insights)         │
      ├──(1:N)──> [research_reports]  │
      │                               │
      └──(1:N)──> [ai_insights] ──────┘
```

The database design cleanly separates identity metadata from low-latency financial order routing, positioning, and high-frequency analytical insights. This structural separation prevents performance bottlenecks, ensuring rapid queries even during heavy usage.
