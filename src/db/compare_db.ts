import { getDb } from "./client.ts";
import { sql } from "drizzle-orm";

async function compareSchema() {
  const db = getDb();
  console.log("Comparing database schema...\n");

  try {
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    const dbTables = new Set(tables.rows.map((r: any) => r.table_name));
    
    // List of tables expected from schema.ts (simplified list for check)
    const expectedTables = [
        "users", "organizations", "roles", "permissions", "role_permissions", "memberships",
        "exchanges", "instrument_types", "instruments", "market_status",
        "paper_accounts", "paper_orders", "paper_positions", "paper_trades", "paper_journal",
        "ai_providers", "ai_models", "ai_provider_health", "ai_usage", "ai_cost", "ai_request_logs",
        "event_log", "notifications", "audit_events", "system_events",
        "risk_profiles", "risk_limits", "risk_events",
        "portfolios", "accounts", "executions", "positions", "orders", "trades",
        "ai_research_reports", "ai_decisions", "ai_recommendations",
        "strategies", "strategy_rules", "strategy_executions", "strategy_results",
        "research_reports", "research_sources", "research_evidence", "research_history", "research_templates",
        "analytics_snapshots", "analytics_metrics", "analytics_performance", "analytics_dashboards", "analytics_reports",
        "memory_sessions", "memory_events", "memory_patterns", "memory_feedback", "memory_embeddings", "memory_knowledge",
        "ai_learning_records", "ai_learning_scores",
        "administration_logs",
        "ai_brains", "brain_sessions", "brain_tasks", "brain_reasoning", "brain_consensus", "brain_assignments", "brain_history",
        "ai_leaderboards", "ai_rankings", "ai_scorecards", "ai_performance_history", "ai_benchmarks",
        "ai_test_suites", "ai_test_cases", "ai_benchmark_runs"
    ];

    console.log("Missing tables:");
    for (const table of expectedTables) {
      if (!dbTables.has(table)) {
        console.log(` - ${table}`);
      }
    }
  } catch (error) {
    console.error("Comparison failed:", error);
  } finally {
    process.exit(0);
  }
}

compareSchema();
