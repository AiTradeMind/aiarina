# AIARINA 1.0 Enterprise Migration Queue & Execution Plan

This document establishes the official enterprise-grade architectural blueprint, migration queue, and step-by-step execution roadmap for **AIARINA 1.0**. It serves as the definitive reference for compiling, porting, and modernizing verified modules from the legacy codebases into the final production platform.

---

## 🏗️ Architectural Foundations & Standards

- **Target Destination**: AIARINA 1.0 (Production Repository).
- **Core Business Logic Baseline**: Port the stable trading state engines and risk parameterizations from **AAOS 28**, with performance enhancements and security hardening verified in **AAOS 29**. Avoid experimental features or complex regressions from **AAOS 30**.
- **Aesthetic Direction**: Google AI Studio's sleek, high-density dashboard design serves as our layout and visual guide. No simulated terminal spam, status lines, or unrequested telemetry logs.
- **Data Persistence**: Establish robust cloud-hosted data structures utilizing **Render PostgreSQL**, and completely purge all legacy Supabase integrations.

---

## 🗂️ Phased Migration Queue

```
[ Phase 1: Database ] ──> [ Phase 2: Backend ] ──> [ Phase 3: Shared ]
                                                              │
                                                              ▼
[ Phase 6: Trading ]  <── [ Phase 5: AI Core ]  <── [ Phase 4: UI/UX ]
         │
         ▼
[ Phase 7: Testing ]  ──> [ Phase 8: Deploy ]
```

---

### 🗄️ Phase 1: Database Migration
**Objective**: Build out the Render PostgreSQL schema foundations and permanently decommission all Supabase-related adapters, client connections, and logic.

*   **1.1 Client Purge & Package Configuration**
    *   Deprecate `@supabase/supabase-js` and any related local connection modules.
    *   Install the native PostgreSQL client adapter (`pg` and `@types/pg`).
*   **1.2 Relational Schema Modeling**
    *   Map core tables:
        *   `users`: ID, email, role, settings, created_at.
        *   `portfolios`: ID, user_id, name, cash_balance, margin_enabled, created_at.
        *   `trades`: ID, portfolio_id, ticker, type (BUY/SELL), quantity, execution_price, timestamp.
        *   `ai_research_reports`: ID, user_id, ticker, summary, detailed_json, analysis_timestamp.
        *   `administration_logs`: ID, action, severity, actor_id, timestamp.
*   **1.3 Data Seed Initialization**
    *   Create `/src/db/schema.sql` with strict DDL scripts.
    *   Generate baseline market seed rows containing indices (S&P 500, NASDAQ, Dow Jones) and key enterprise tickers (AAPL, NVDA, TSLA, MSFT) to ensure instant initial launch consistency.
*   **1.4 Phase Verification**
    *   **Build Verification**: Verify local database setup queries can compile.
    *   **TypeScript Verification**: Ensure model mappings pass strict compiler checks (`tsc --noEmit`).
    *   **Smoke Testing**: Execute manual query validations over seed records.
    *   **Git Commit**: Record Phase 1 state (`feat(db): establish PostgreSQL schema and seeds`).

---

### ⚙️ Phase 2: Backend Consolidation
**Objective**: Construct the single, unified Express + Vite backend server, incorporating proxy endpoints to encapsulate and protect downstream APIs.

*   **2.1 Express Base Configuration (`server.ts`)**
    *   Initialize the Express application binding strictly to Port `3000` and Host `0.0.0.0`.
    *   Install JSON and URL-encoded body-parsers, standard CORS protection, and secure header middle-layers.
*   **2.2 Client-Server Asset Routing**
    *   Incorporate Vite dev-mode middleware conditionally using standard `process.env.NODE_ENV !== "production"` checks.
    *   Serve statically bundled built resources (`/dist`) for production instances.
*   **2.3 API Route Hardening**
    *   Implement consolidated `/api` routes:
        *   `GET /api/portfolio`: Query current assets, cash ledger, and margins.
        *   `POST /api/trade/order`: Process limit/market transactions.
        *   `GET /api/market/history`: Deliver historical prices for charts.
        *   `POST /api/ai/research`: Request server-side financial analysis.
*   **2.4 Phase Verification**
    *   **Build Verification**: Build the server module using esbuild compiler configurations.
    *   **TypeScript Verification**: Check API interfaces against types definitions files.
    *   **Smoke Testing**: Ping `/api/health` and verify returns clean JSON status response.
    *   **Git Commit**: Record Phase 2 state (`feat(server): consolidate Express routing and Vite middlewares`).

---

### 🧱 Phase 3: Shared Components & Global Layout
**Objective**: Draft the top-level high-density dashboard frame, incorporating fluid structural responsiveness, Swiss typography pairings, and a modern Command Palette.

*   **3.1 Core Responsive Frame Layout**
    *   Create a fluid workspace container utilizing global Tailwind directives (`w-full max-w-7xl mx-auto`).
    *   Add a Collapsible Left Navigation Bar, displaying clean navigation links paired with standard Lucide symbols.
    *   Add a Global Context Header, rendering real-time clock tickers (UTC/EST) and current connection states.
*   **3.2 Interactive Command Palette Panel**
    *   Create a centralized Command Palette component toggled globally using shortcut patterns (`Cmd+K` / `Ctrl+K`).
    *   Equip the palette with instant navigation indices for all 9 core workspaces, as well as context actions.
*   **3.3 Data Visualization Base Setup**
    *   Configure shared theme presets for `recharts` and `d3` graphs.
    *   Ensure visual alignment with dark-slate high-contrast accents and clean typography sizes.
*   **3.4 Phase Verification**
    *   **Build Verification**: Run standard Vite compilation scripts to verify frontend assets build cleanly.
    *   **TypeScript Verification**: Confirm layout component props conform to strict React interface standards.
    *   **Smoke Testing**: Mount components and trigger navigation shortcuts (`Cmd+K`) to verify prompt popups.
    *   **Git Commit**: Record Phase 3 state (`feat(ui-shared): implement core layout frame and command palette`).

---

### 🖥️ Phase 4: Frontend UI Workspaces
**Objective**: Build out the 9 requested dedicated workspaces inside a clean multi-view single-page interface.

*   **4.1 Institutional Dashboard Workspace**
    *   Create dense metric cards summarizing key indicators: Net Assets, Net Asset Value (NAV), Daily Return %, and Gross Leverage.
    *   Embed a quick-glance multi-ticker watch-list.
*   **4.2 Bloomberg-style Workspace**
    *   Design a high-density, dark terminal-style grid interface.
    *   Embed multi-view components: Live Order Book matrix, Streaming Ticker Feed, and Market News Feed ticker.
*   **4.3 AI Workspace**
    *   Create an advanced workspace containing interactive chat models and financial report prompt helpers.
*   **4.4 Trading Workspace**
    *   Build a responsive transactional terminal: Order entry fields (Market, Limit, Stop), price inputs, buy/sell toggles, and live order confirmation views.
*   **4.5 Research Workspace**
    *   Create a clean research repository pane listing saved analytical reports and ticker sentiment indicators.
*   **4.6 Portfolio Workspace**
    *   Implement asset breakdown views featuring `recharts` Pie Charts and dynamic tables showcasing unrealized P&L.
*   **4.7 Reports Workspace**
    *   Design a generated document index, permitting the viewing and PDF-printing of end-of-day balances and trade transcripts.
*   **4.8 Administration Workspace**
    *   Include a status screen showing system configuration variables, background scheduler statuses, and trade logging audits.
*   **4.9 Settings Workspace**
    *   Deliver customizable configuration modules: User Profile, Theme toggles, and connection key documentation.
*   **4.10 Phase Verification**
    *   **Build Verification**: Execute production compile scripts across all front-end components.
    *   **TypeScript Verification**: Validate that all 9 workspaces compile without type warnings.
    *   **Smoke Testing**: Navigate across each workspace tab to confirm proper state changes.
    *   **Git Commit**: Record Phase 4 state (`feat(ui-workspaces): construct 9 primary workspaces`).

---

### 🧠 Phase 5: AI Workspace Integration
**Objective**: Build secure server-side integrations with the modern `@google/genai` TypeScript SDK to deliver robust analytical research features.

*   **5.1 Safe SDK Client Setup**
    *   Instantiate the `GoogleGenAI` client lazily on the server backend using `process.env.GEMINI_API_KEY`.
    *   Prevent module-level crashes by enforcing explicit fallback error logs when key values are absent.
*   **5.2 Research Inference Handlers**
    *   Expose endpoints for financial research inference:
        *   Prompt template builders for sentiment analysis.
        *   JSON structure builders to produce formatted analytical summaries.
*   **5.3 Client AI Panel Integration**
    *   Render streaming chat responses smoothly with layout animation triggers.
    *   Inject formatted outputs directly into the Research and Reports Workspaces.
*   **5.4 Phase Verification**
    *   **Build Verification**: Compile server-side files to ensure proper import bindings.
    *   **TypeScript Verification**: Verify that the modern `@google/genai` types map correctly.
    *   **Smoke Testing**: Dispatch test prompts to server AI handlers and confirm receiving proper responses.
    *   **Git Commit**: Record Phase 5 state (`feat(ai): integrate GoogleGenAI SDK and server-side research handlers`).

---

### 📈 Phase 6: Trading Engine & Simulator
**Objective**: Establish a secure local backtesting simulation engine, trading business logic, and transactional audit trails.

*   **6.1 Core Transaction State Machine**
    *   Construct portfolio balance verification models to validate cash margins, check purchasing thresholds, and process trades.
    *   Enforce structural trading limitations (no fractional short-selling, no transaction processing on invalid tickers).
*   **6.2 Backtesting Simulator**
    *   Build a historical simulator parsing date parameters, initial funds, and ticker parameters.
    *   Implement historical price estimation models based on standard price-walk generators.
*   **6.3 Portfolio Metrics Calculations**
    *   Write analytical modules to compute standard financial indicators: Sharpe Ratio, maximum historical drawdown, and annualized asset returns.
*   **6.4 Phase Verification**
    *   **Build Verification**: Build the trading engine library with clean module resolution.
    *   **TypeScript Verification**: Assert mathematical and currency parsing types are perfectly typed.
    *   **Smoke Testing**: Run sample historical simulations and verify metrics map correctly to Recharts views.
    *   **Git Commit**: Record Phase 6 state (`feat(trading): deploy trade logic engines and historical simulator`).

---

### 🧪 Phase 7: Comprehensive Testing & Quality Assurance
**Objective**: Confirm complete system health with exhaustive static, build, and responsive checks.

*   **7.1 Automated Static Analysis**
    *   Execute strict codebase checks using the integrated `npm run lint` pipeline.
    *   Perform code audits to remove mock telemetry parameters or experimental flags.
*   **7.2 Core Production Build Test**
    *   Execute standard production build commands (`npm run build`).
    *   Verify server files compile and output correctly to `/dist/server.cjs` and front-end SPA files map to `/dist/index.html`.
*   **7.3 Adaptive Responsive Design Check**
    *   Verify touch boundaries meet standard 44px layout targets on mobile frames.
    *   Verify collapsible responsive sidebars and auto-adjusting tables perform correctly under narrow viewport conditions.
*   **7.4 Phase Verification**
    *   **Build Verification**: Ensure zero errors exist during production packaging phases.
    *   **TypeScript Verification**: Run strict TypeScript checks across all modules.
    *   **Smoke Testing**: Validate that the entire full-stack application loads seamlessly in standard environments.
    *   **Git Commit**: Record Phase 7 state (`chore(qa): perform full validation tests and build audits`).

---

### 🚀 Phase 8: Deployment & Handover
**Objective**: Finalize configuration templates, platform documentation, and production launch variables.

*   **8.1 Deployment Environment Validation**
    *   Confirm environment templates (`.env.example`) list all needed secret key definitions (PostgreSQL connection strings, Gemini API variables).
    *   Review `metadata.json` configurations.
*   **8.2 Platform Finalization**
    *   Construct standard deployment launch scripts in `package.json` mapping to the output of compiled server resources (`dist/server.cjs`).
*   **8.3 Phase Verification**
    *   **Build Verification**: Confirm clean environment compiles successfully.
    *   **TypeScript Verification**: Verify that no ambient TS type errors remain.
    *   **Smoke Testing**: Validate the final application boots and starts on the cloud runtime target successfully.
    *   **Git Commit**: Record Phase 8 state (`chore(release): prepare deployment structures and final documentation`).
