# Database Schema Gap Analysis: AAOS 28/31 vs. Render PostgreSQL Schema

This report identifies the structural, relational, and data-integrity gaps between the **Master Enterprise Data Model (AAOS 28/31)** and the simplified **Render PostgreSQL Schema** currently initialized in the database.

---

## 📊 High-Level Comparison Summary

| Metric / Dimension | Enterprise Data Model (AAOS 28/31) | Render PostgreSQL Schema | Gap Severity & Action |
| :--- | :--- | :--- | :--- |
| **Total Tables** | 15 Tables | 5 Tables | **CRITICAL**: Missing 10 core tables. |
| **Security / Auth** | Custom layouts, settings, AES-encrypted API Keys | Basic user table only | **HIGH**: Missing encrypted provider keys. |
| **Market Data** | Stateful master instruments, real-time caches, news feed | Handled via raw strings on trade transactions | **CRITICAL**: No market ticker/spread indexing. |
| **Credit Ledger** | Hierarchical accounts, leverage limits, balance states | Flat portfolio balance tracking | **HIGH**: Cannot track margins, leverage, or buying power. |
| **Order Routing** | Full lifecycle orders tracking (`orders` and `trades`) | Flattened `trades` table without life-cycle | **CRITICAL**: No limit/stop order state queues. |
| **AI Systems** | Prompt registry, model tracking, confidence levels | Basic `ai_reports` table | **MEDIUM**: Devoiced prompt versioning. |
| **Administration** | Risk profiles, system config, granular logs | Generic logs only | **HIGH**: Missing automated risk liquidator params. |

---

## 🔍 Detailed Workspace-by-Workspace Gap Analysis

### 1. Bloomberg-Style & Trading Workspaces
*   **Existing Render Schema**: Lacked `instruments`, `market_data_snapshots`, and `news_feed` tables. Trade entries recorded tickers as arbitrary strings (`symbol`).
*   **Enterprise Spec (AAOS 28/31)**: Requires structured `instruments` entries mapped to foreign keys on trades, and streaming-ready `market_data_snapshots` containing real-time bids/asks to prevent latency in order book calculation.
*   **Functional Impact**: Without an independent `instruments` catalog, the system cannot enforce market constraints (tick sizes, lot sizes, trading suspensions) or join streaming tick data into news panels.

### 2. Order Routing & Lifecycle Management
*   **Existing Render Schema**: Only had a single flat `trades` table.
*   **Enterprise Spec (AAOS 28/31)**: Requires a dual-state `orders` and `trades` model. Orders flow through multiple lifecycle states (`PENDING`, `PARTIALLY_FILLED`, `FILLED`, `CANCELLED`, `REJECTED`) and support distinct limit/stop price conditions.
*   **Functional Impact**: The simplified schema is unable to host limit orders, stop losses, or partial fills. Every order is forced to immediately execute as a market order, violating basic institutional trading rules.

### 3. Capital Accounts & Margin Ledgering
*   **Existing Render Schema**: A single `portfolios` table with a basic `balance` field.
*   **Enterprise Spec (AAOS 28/31)**: Distinguishes between primary corporate `accounts` (cash vs margin structures with leverage constraints) and sub-trading `portfolios`, backed by detailed `portfolio_balances` (available purchasing power, reserved capital for pending orders, and maintenance margin loans).
*   **Functional Impact**: Risk of "double spending" cash balance in simultaneous limit order postings. Lacks the mathematical framework to calculate maintenance margins or issue margin calls.

### 4. AI Workspace & Quantitative Analytics
*   **Existing Render Schema**: Provided a basic `ai_reports` table.
*   **Enterprise Spec (AAOS 28/31)**: Implements `ai_models` (model versions, temperature/topK parameters), `ai_prompts` (system templates and instruction versions), and `ai_insights` (combining confidence scores, sentiment labels, and rich JSON structures).
*   **Functional Impact**: Incapable of versioning system prompts or verifying statistical confidence in generative AI outputs.

### 5. Settings & Connections Workspace
*   **Existing Render Schema**: Lacked custom configuration and user setting tables.
*   **Enterprise Spec (AAOS 28/31)**: Requires `user_settings` (for custom theme layout matrices) and AES-256 secure `api_keys` to proxy requests to third-party endpoints (e.g. Alpaca, Gemini, Finnhub).
*   **Functional Impact**: Users cannot customize workspace denseness or securely persistent API credentials, forcing credentials to either be hardcoded or passed raw through non-secure routes.

### 6. Administration & Risk Control Workspace
*   **Existing Render Schema**: A single generic logs table.
*   **Enterprise Spec (AAOS 28/31)**: Requires `risk_profiles` (defining auto-liquidation daily drawdown and daily loss caps) and `system_configurations` for global runtime variables.
*   **Functional Impact**: Administrative controls are unable to set firm-wide trading blocks or enforce circuit-breaker liquidation triggers on portfolios breaching max drawdown limits.

---

## 🛠️ Step-by-Step Remediation Strategy

To align the database to the AITradeMinds AAOS 31 enterprise specification without losing current records, the following execution steps are recommended during Phase 1 database migration:

1.  **Step 1: Identity & Settings Provisioning**
    *   Initialize `user_settings` and `api_keys` with foreign key relationships linked to existing `users`.
2.  **Step 2: Core Asset Class Setup**
    *   Deploy the `instruments` and `market_data_snapshots` tables. Seed `instruments` with major equities and forex pairs.
3.  **Step 3: Account / Portfolio Refactoring**
    *   Create the `accounts` table. Map existing users to default `margin` accounts.
    *   Add `account_id` to `portfolios` and populate existing records. Migrate flat `portfolios.balance` figures into structured `portfolio_balances`.
4.  **Step 4: Order Lifecycle & Trades Decoupling**
    *   Create the `orders` table.
    *   Alter `trades` to reference `orders.id` (nullable initially for historical imports) and establish foreign-key associations with `instruments` instead of free-text strings.
5.  **Step 5: AI Engine Registry**
    *   Initialize `ai_models` and `ai_prompts`. Map existing reports into structured `ai_insights` or `research_reports`.
6.  **Step 6: Risk Circuit Breakers Activation**
    *   Initialize `risk_profiles` and seed with standard corporate risk limits to safeguard capital.
