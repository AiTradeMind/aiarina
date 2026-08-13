CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"name" varchar(100) NOT NULL,
	"account_type" varchar(20) DEFAULT 'CASH' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "administration_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar(255) NOT NULL,
	"severity" varchar(50) DEFAULT 'info' NOT NULL,
	"actor_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_allocations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"amount" double precision NOT NULL,
	"reason" text,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_benchmark_runs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"suite_id" varchar(50) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" double precision,
	"models_tested" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(50) NOT NULL,
	"failures" integer DEFAULT 0 NOT NULL,
	"warnings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_benchmarks" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"benchmark_type" varchar(50) NOT NULL,
	"score" double precision NOT NULL,
	"max_score" double precision NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_brains" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"mode" text NOT NULL,
	"active_tasks" integer DEFAULT 0 NOT NULL,
	"system_load" double precision DEFAULT 0 NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_collaborations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_cost" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"amount" numeric(15, 6) DEFAULT '0.00' NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_decisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"type" varchar(50) NOT NULL,
	"decision" jsonb NOT NULL,
	"confidence" numeric(5, 4) DEFAULT '0.00',
	"model_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"consensus_metadata" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(20) DEFAULT 'COMPLETED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_evaluations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"run_id" varchar(50) NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"test_case_id" varchar(50) NOT NULL,
	"score" double precision NOT NULL,
	"passed" boolean NOT NULL,
	"latency" double precision,
	"token_usage" integer,
	"cost" double precision,
	"details" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_experience_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"experience_points" double precision NOT NULL,
	"growth_delta" double precision NOT NULL,
	"adaptation_score" double precision NOT NULL,
	"improvement_trend" double precision NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_funds" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"allocated_capital" double precision DEFAULT 0 NOT NULL,
	"available_capital" double precision DEFAULT 0 NOT NULL,
	"reserved_capital" double precision DEFAULT 0 NOT NULL,
	"used_capital" double precision DEFAULT 0 NOT NULL,
	"current_exposure" double precision DEFAULT 0 NOT NULL,
	"maximum_exposure" double precision DEFAULT 0 NOT NULL,
	"realized_pnl" double precision DEFAULT 0 NOT NULL,
	"unrealized_pnl" double precision DEFAULT 0 NOT NULL,
	"roi" double precision DEFAULT 0 NOT NULL,
	"drawdown" double precision DEFAULT 0 NOT NULL,
	"sharpe" double precision DEFAULT 0 NOT NULL,
	"win_rate" double precision DEFAULT 0 NOT NULL,
	"risk_score" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_funds_model_id_unique" UNIQUE("model_id")
);
--> statement-breakpoint
CREATE TABLE "ai_leaderboards" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"category_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"last_calculated" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_events" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"session_id" varchar(50),
	"event_type" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"impact_score" double precision DEFAULT 0 NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"type" varchar(50) NOT NULL,
	"source_id" varchar(50),
	"findings" jsonb NOT NULL,
	"impact_score" numeric(5, 4),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"target_id" varchar(50) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"learning_score" numeric(5, 4) DEFAULT '0.5000',
	"confidence_adjustment" numeric(5, 4) DEFAULT '0.0000',
	"ranking" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_learning_sessions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"session_type" varchar(50) NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"events_processed" integer DEFAULT 0 NOT NULL,
	"insights_generated" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_memory_profiles" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"knowledge_score" double precision DEFAULT 0 NOT NULL,
	"learning_score" double precision DEFAULT 0 NOT NULL,
	"experience_score" double precision DEFAULT 0 NOT NULL,
	"reasoning_score" double precision DEFAULT 0 NOT NULL,
	"pattern_score" double precision DEFAULT 0 NOT NULL,
	"confidence_trend" double precision DEFAULT 0 NOT NULL,
	"growth_index" double precision DEFAULT 0 NOT NULL,
	"learning_velocity" double precision DEFAULT 0 NOT NULL,
	"memory_health" double precision DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_memory_profiles_model_id_unique" UNIQUE("model_id")
);
--> statement-breakpoint
CREATE TABLE "ai_memory_snapshots" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_memory_versions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"previous_version" varchar(50),
	"current_version" varchar(50) NOT NULL,
	"reason" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_metrics" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"evaluation_type" varchar(50) NOT NULL,
	"accuracy" double precision DEFAULT 0 NOT NULL,
	"precision" double precision DEFAULT 0 NOT NULL,
	"recall" double precision DEFAULT 0 NOT NULL,
	"confidence" double precision DEFAULT 0 NOT NULL,
	"latency" double precision DEFAULT 0 NOT NULL,
	"cost" double precision DEFAULT 0 NOT NULL,
	"token_usage" integer DEFAULT 0 NOT NULL,
	"reliability" double precision DEFAULT 0 NOT NULL,
	"consistency" double precision DEFAULT 0 NOT NULL,
	"hallucination_rate" double precision DEFAULT 0 NOT NULL,
	"reasoning_quality" double precision DEFAULT 0 NOT NULL,
	"research_quality" double precision DEFAULT 0 NOT NULL,
	"risk_awareness" double precision DEFAULT 0 NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer,
	"model_name" varchar(100) NOT NULL,
	"context_window" integer,
	"cost_per_1k_prompt" numeric(10, 6) DEFAULT '0.00',
	"cost_per_1k_completion" numeric(10, 6) DEFAULT '0.00',
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_pattern_library" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"pattern_type" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"frequency" integer DEFAULT 0 NOT NULL,
	"confidence" double precision DEFAULT 0 NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_performance_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"category_id" varchar(50) NOT NULL,
	"previous_rank" integer,
	"current_rank" integer NOT NULL,
	"score_delta" double precision NOT NULL,
	"reason" text,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_performance_reports" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"run_id" varchar(50),
	"overall_score" double precision NOT NULL,
	"category_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"strengths" jsonb DEFAULT '[]'::jsonb,
	"weaknesses" jsonb DEFAULT '[]'::jsonb,
	"improvement_suggestions" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_provider_health" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer,
	"status" varchar(20) NOT NULL,
	"latency_ms" integer,
	"last_check" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"base_url" varchar(255),
	"api_key" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_providers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ai_rankings" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"leaderboard_id" varchar(50) NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"rank" integer NOT NULL,
	"previous_rank" integer,
	"score" double precision NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"decision_id" integer,
	"ticker" varchar(20),
	"action" varchar(10),
	"rationale" text,
	"is_applied" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_request_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"model_id" integer,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"latency_ms" integer,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_research_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"ticker" varchar(12) NOT NULL,
	"summary" varchar(1000) NOT NULL,
	"detailed_json" jsonb DEFAULT '{}'::jsonb,
	"analysis_timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_scorecards" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"win_rate" double precision DEFAULT 0 NOT NULL,
	"loss_rate" double precision DEFAULT 0 NOT NULL,
	"roi" double precision DEFAULT 0 NOT NULL,
	"sharpe_ratio" double precision DEFAULT 0 NOT NULL,
	"profit_factor" double precision DEFAULT 0 NOT NULL,
	"drawdown" double precision DEFAULT 0 NOT NULL,
	"trades" integer DEFAULT 0 NOT NULL,
	"avg_confidence" double precision DEFAULT 0 NOT NULL,
	"consensus_accuracy" double precision DEFAULT 0 NOT NULL,
	"reasoning_accuracy" double precision DEFAULT 0 NOT NULL,
	"prediction_accuracy" double precision DEFAULT 0 NOT NULL,
	"research_reports" integer DEFAULT 0 NOT NULL,
	"strategy_success" double precision DEFAULT 0 NOT NULL,
	"risk_score" double precision DEFAULT 0 NOT NULL,
	"latency" double precision DEFAULT 0 NOT NULL,
	"response_time" double precision DEFAULT 0 NOT NULL,
	"cost_efficiency" double precision DEFAULT 0 NOT NULL,
	"token_usage" integer DEFAULT 0 NOT NULL,
	"memory_score" double precision DEFAULT 0 NOT NULL,
	"reliability_score" double precision DEFAULT 0 NOT NULL,
	"health_score" double precision DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_skill_progress" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"skill_name" varchar(50) NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"progress" double precision DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_test_cases" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"suite_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"parameters" jsonb DEFAULT '{}'::jsonb,
	"expected_outcome" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_test_suites" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"version" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_tournaments" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"season_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"model_id" integer,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "allocation_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"previous_allocation" double precision NOT NULL,
	"current_allocation" double precision NOT NULL,
	"reason" text NOT NULL,
	"operator" varchar(50) NOT NULL,
	"score_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "allocation_recommendations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"suggested_amount" double precision,
	"reasoning" text NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "allocation_rules" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"minimum_score" double precision NOT NULL,
	"maximum_drawdown" double precision NOT NULL,
	"maximum_allocation" double precision NOT NULL,
	"minimum_allocation" double precision NOT NULL,
	"maximum_exposure" double precision NOT NULL,
	"promotion_threshold" double precision NOT NULL,
	"demotion_threshold" double precision NOT NULL,
	"freeze_threshold" double precision NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "allocation_snapshots" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"total_capital" double precision NOT NULL,
	"allocated_capital" double precision NOT NULL,
	"distribution" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_dashboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"name" varchar(100) NOT NULL,
	"layout" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"name" varchar(100) NOT NULL,
	"value" numeric(20, 6) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"target_id" varchar(50),
	"target_type" varchar(50),
	"win_rate" numeric(5, 4),
	"profit_factor" numeric(10, 2),
	"sharpe_ratio" numeric(10, 4),
	"max_drawdown" numeric(10, 4),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"title" varchar(255) NOT NULL,
	"config" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'COMPLETED' NOT NULL,
	"file_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"type" varchar(50) NOT NULL,
	"data" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"action" varchar(100) NOT NULL,
	"status" varchar(20) NOT NULL,
	"details" varchar(255),
	"ip_address" varchar(45),
	"user_agent" varchar(255),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brain_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"model_id" text NOT NULL,
	"role" text NOT NULL,
	"status" text NOT NULL,
	"assigned_at" text NOT NULL,
	"completed_at" text,
	"response" text,
	"score" double precision
);
--> statement-breakpoint
CREATE TABLE "brain_consensus" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"required_models" integer NOT NULL,
	"achieved_models" integer DEFAULT 0 NOT NULL,
	"consensus_score" double precision,
	"status" text NOT NULL,
	"resolution" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brain_history" (
	"id" text PRIMARY KEY NOT NULL,
	"brain_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_data" text NOT NULL,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brain_reasoning" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"step" integer NOT NULL,
	"logic" text NOT NULL,
	"conclusion" text NOT NULL,
	"confidence" double precision NOT NULL,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brain_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"brain_id" text NOT NULL,
	"status" text NOT NULL,
	"context" text NOT NULL,
	"created_at" text NOT NULL,
	"completed_at" text
);
--> statement-breakpoint
CREATE TABLE "brain_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"type" text NOT NULL,
	"priority" text NOT NULL,
	"complexity" double precision NOT NULL,
	"status" text NOT NULL,
	"intent" text NOT NULL,
	"required_expertise" text NOT NULL,
	"estimated_tokens" integer,
	"estimated_cost" double precision,
	"estimated_duration" integer,
	"confidence_target" double precision,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_consensus" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"session_id" varchar(50) NOT NULL,
	"agreement_score" double precision NOT NULL,
	"conflict_score" double precision NOT NULL,
	"confidence" double precision NOT NULL,
	"majority_decision" text,
	"minority_opinion" text,
	"escalation_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"session_id" varchar(50) NOT NULL,
	"action" varchar(100) NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_members" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"session_id" varchar(50) NOT NULL,
	"model_id" varchar(50) NOT NULL,
	"role" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_messages" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"session_id" varchar(50) NOT NULL,
	"sender_member_id" varchar(50),
	"content" text NOT NULL,
	"message_type" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_results" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"session_id" varchar(50) NOT NULL,
	"final_recommendation" text,
	"supporting_evidence" jsonb DEFAULT '[]'::jsonb,
	"participating_models" jsonb DEFAULT '[]'::jsonb,
	"execution_time_ms" integer,
	"cost" double precision,
	"token_usage" jsonb DEFAULT '{}'::jsonb,
	"consensus_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_sessions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"collaboration_id" varchar(50) NOT NULL,
	"objective" text NOT NULL,
	"status" varchar(50) NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_tasks" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"session_id" varchar(50) NOT NULL,
	"member_id" varchar(50),
	"description" text NOT NULL,
	"status" varchar(50) NOT NULL,
	"result_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"source" varchar(50) NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"entity_id" varchar(50),
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchanges" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	"is_open" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"portfolio_id" integer,
	"exchange_id" varchar(20),
	"side" varchar(10) NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"commission" numeric(10, 2) DEFAULT '0.00',
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instrument_types" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" serial PRIMARY KEY NOT NULL,
	"exchange_id" varchar(20),
	"type_id" varchar(50),
	"symbol" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expiry_date" timestamp,
	"lot_size" integer DEFAULT 1 NOT NULL,
	"tick_size" numeric(10, 4) DEFAULT '0.05' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_categories" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_edges" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"source_node_id" varchar(50) NOT NULL,
	"target_node_id" varchar(50) NOT NULL,
	"edge_type" varchar(50) NOT NULL,
	"weight" double precision DEFAULT 1 NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_nodes" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_paths" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"start_node_id" varchar(50) NOT NULL,
	"end_node_id" varchar(50) NOT NULL,
	"path_length" integer NOT NULL,
	"path_data" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_relationships" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_snapshots" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"node_count" integer NOT NULL,
	"edge_count" integer NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_versions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"version_tag" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"exchange_id" varchar(20),
	"status" varchar(50) NOT NULL,
	"message" varchar(255),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"user_id" integer,
	"organization_id" varchar(50),
	"role" varchar(50),
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"vector" jsonb NOT NULL,
	"model" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"type" varchar(50) NOT NULL,
	"source_id" varchar(50),
	"data" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"user_id" integer,
	"rating" integer,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_knowledge" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_patterns" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"name" varchar(100) NOT NULL,
	"description" text,
	"pattern_type" varchar(50) NOT NULL,
	"logic" jsonb NOT NULL,
	"confidence" numeric(5, 4),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"title" varchar(100) NOT NULL,
	"message" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer,
	"user_id" integer,
	"ticker" varchar(12) NOT NULL,
	"type" varchar(20) NOT NULL,
	"side" varchar(10) NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"filled_quantity" numeric(12, 4) DEFAULT '0' NOT NULL,
	"price" numeric(12, 2),
	"status" varchar(20) DEFAULT 'CREATED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"balance" numeric(15, 2) DEFAULT '100000.00' NOT NULL,
	"initial_balance" numeric(15, 2) DEFAULT '100000.00' NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "paper_accounts_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "paper_journal" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"trade_id" integer,
	"entry_type" varchar(20) NOT NULL,
	"notes" varchar(255),
	"pnl" numeric(12, 2),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"ticker" varchar(12) NOT NULL,
	"type" varchar(20) NOT NULL,
	"side" varchar(10) NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"price" numeric(12, 2),
	"status" varchar(20) DEFAULT 'CREATED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"ticker" varchar(12) NOT NULL,
	"quantity" numeric(12, 4) DEFAULT '0' NOT NULL,
	"average_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper_trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"organization_id" varchar(50),
	"ticker" varchar(12) NOT NULL,
	"side" varchar(10) NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"execution_price" numeric(12, 2) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"name" varchar(100) PRIMARY KEY NOT NULL,
	"description" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"account_id" integer,
	"name" varchar(100) NOT NULL,
	"cash_balance" numeric(15, 2) DEFAULT '100000.00' NOT NULL,
	"buying_power" numeric(15, 2) DEFAULT '100000.00' NOT NULL,
	"realized_pnl" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"unrealized_pnl" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"margin_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolios_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer,
	"ticker" varchar(12) NOT NULL,
	"quantity" numeric(12, 4) DEFAULT '0' NOT NULL,
	"average_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"market_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"pnl" numeric(12, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_evidence" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer,
	"type" varchar(50) NOT NULL,
	"content" jsonb NOT NULL,
	"source_id" integer
);
--> statement-breakpoint
CREATE TABLE "research_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer,
	"action" varchar(50) NOT NULL,
	"user_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" jsonb NOT NULL,
	"confidence_score" numeric(5, 4),
	"decision_id" integer,
	"strategy_id" integer,
	"status" varchar(20) DEFAULT 'COMPLETED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer,
	"name" varchar(100) NOT NULL,
	"url" varchar(255),
	"type" varchar(50),
	"relevance" numeric(3, 2)
);
--> statement-breakpoint
CREATE TABLE "research_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"structure" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"user_id" integer,
	"order_id" integer,
	"rule_name" varchar(100) NOT NULL,
	"action" varchar(10) NOT NULL,
	"message" varchar(255) NOT NULL,
	"severity" varchar(20) DEFAULT 'INFO' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"max_order_value" numeric(15, 2) DEFAULT '100000.00' NOT NULL,
	"max_position_size" numeric(15, 2) DEFAULT '500000.00' NOT NULL,
	"max_daily_loss" numeric(15, 2) DEFAULT '5000.00' NOT NULL,
	"max_open_positions" integer DEFAULT 10 NOT NULL,
	"max_order_quantity" numeric(12, 4) DEFAULT '1000.0000' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "risk_limits_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "risk_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"name" varchar(100) NOT NULL,
	"risk_level" varchar(20) DEFAULT 'MEDIUM' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "risk_profiles_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_name" varchar(50),
	"permission_name" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"name" varchar(50) PRIMARY KEY NOT NULL,
	"description" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(50),
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"confidence_threshold" numeric(5, 4) DEFAULT '0.7000',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_activation_logs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"version" varchar(50) NOT NULL,
	"activated_by" varchar(100),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "strategy_analytics" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"total_trades" integer DEFAULT 0,
	"profit_factor" double precision DEFAULT 0,
	"win_rate" double precision DEFAULT 0,
	"max_drawdown" double precision DEFAULT 0,
	"roi" double precision DEFAULT 0,
	"sharpe_ratio" double precision DEFAULT 0,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_approvals" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"version" varchar(50),
	"status" varchar(50) NOT NULL,
	"reviewer_email" varchar(255) NOT NULL,
	"reviewer_role" varchar(50),
	"comments" text,
	"decision_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_attribution" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"entry_logic_contribution" double precision DEFAULT 0 NOT NULL,
	"exit_logic_contribution" double precision DEFAULT 0 NOT NULL,
	"risk_engine_contribution" double precision DEFAULT 0 NOT NULL,
	"ai_brain_contribution" double precision DEFAULT 0 NOT NULL,
	"optimizer_contribution" double precision DEFAULT 0 NOT NULL,
	"paper_trading_contribution" double precision DEFAULT 0 NOT NULL,
	"market_conditions_contribution" double precision DEFAULT 0 NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_audit_logs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50),
	"action" varchar(100) NOT NULL,
	"performed_by" varchar(255) NOT NULL,
	"ip_address" varchar(50),
	"original_state" text,
	"new_state" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_awards" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"season_id" varchar(50),
	"award_type" varchar(100) NOT NULL,
	"description" text,
	"awarded_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_backtest_equity_curve" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"run_id" varchar(50) NOT NULL,
	"timestamp" timestamp NOT NULL,
	"equity" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_backtest_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"run_id" varchar(50) NOT NULL,
	"user_id" varchar(100),
	"notes" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_backtest_metrics" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"run_id" varchar(50) NOT NULL,
	"net_profit" double precision,
	"gross_profit" double precision,
	"gross_loss" double precision,
	"roi" double precision,
	"cagr" double precision,
	"win_rate" double precision,
	"profit_factor" double precision,
	"sharpe_ratio" double precision,
	"max_drawdown" double precision,
	"recovery_factor" double precision,
	"total_trades" integer,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_backtest_orders" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"run_id" varchar(50) NOT NULL,
	"paper_order_id" integer,
	"ticker" varchar(20) NOT NULL,
	"type" varchar(20) NOT NULL,
	"side" varchar(20) NOT NULL,
	"quantity" varchar(50) NOT NULL,
	"price" varchar(50),
	"status" varchar(50) NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_backtest_positions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"run_id" varchar(50) NOT NULL,
	"ticker" varchar(20) NOT NULL,
	"quantity" varchar(50) NOT NULL,
	"average_price" varchar(50) NOT NULL,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_backtest_reports" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"run_id" varchar(50) NOT NULL,
	"summary" text,
	"risk_analysis" text,
	"suggestions" text,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_backtest_runs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"backtest_id" varchar(50) NOT NULL,
	"configuration" jsonb NOT NULL,
	"status" varchar(50) NOT NULL,
	"progress" integer DEFAULT 0,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp
);
--> statement-breakpoint
CREATE TABLE "strategy_backtest_trades" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"run_id" varchar(50) NOT NULL,
	"ticker" varchar(20) NOT NULL,
	"side" varchar(20) NOT NULL,
	"quantity" varchar(50) NOT NULL,
	"execution_price" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_backtests" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_benchmarks" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"benchmark_name" varchar(100) NOT NULL,
	"strategy_return" double precision,
	"benchmark_return" double precision,
	"alpha" double precision,
	"beta" double precision,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_blocks" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"builder_id" varchar(50) NOT NULL,
	"block_type" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_builder_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"builder_id" varchar(50) NOT NULL,
	"snapshot" jsonb NOT NULL,
	"user_id" varchar(100),
	"reason" text,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_builders" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"version" varchar(50) NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_capabilities" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"supports_paper_trading" boolean DEFAULT false NOT NULL,
	"supports_ai" boolean DEFAULT false NOT NULL,
	"supports_automation" boolean DEFAULT false NOT NULL,
	"supports_replay" boolean DEFAULT false NOT NULL,
	"supports_backtesting" boolean DEFAULT false NOT NULL,
	"supports_portfolio" boolean DEFAULT false NOT NULL,
	"supports_multi_asset" boolean DEFAULT false NOT NULL,
	"supports_multi_timeframe" boolean DEFAULT false NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_categories" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_change_logs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"blocks_added" integer DEFAULT 0,
	"blocks_removed" integer DEFAULT 0,
	"parameters_changed" integer DEFAULT 0,
	"connections_changed" integer DEFAULT 0,
	"validation_result" varchar(50),
	"risk_changes" text,
	"ai_dependency_changes" text,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_comparison" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id_a" varchar(50) NOT NULL,
	"strategy_id_b" varchar(50) NOT NULL,
	"metric_name" varchar(100) NOT NULL,
	"value_a" double precision,
	"value_b" double precision,
	"comparison_result" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_compliance" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"policy_id" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'Compliant' NOT NULL,
	"measured_value" double precision,
	"target_value" double precision,
	"check_time" timestamp DEFAULT now() NOT NULL,
	"details" text
);
--> statement-breakpoint
CREATE TABLE "strategy_connections" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"builder_id" varchar(50) NOT NULL,
	"source_block_id" varchar(50) NOT NULL,
	"target_block_id" varchar(50) NOT NULL,
	"source_port" varchar(50),
	"target_port" varchar(50),
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_daily_metrics" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"date" timestamp NOT NULL,
	"pnl" double precision DEFAULT 0 NOT NULL,
	"roi" double precision DEFAULT 0 NOT NULL,
	"drawdown" double precision DEFAULT 0 NOT NULL,
	"trades_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_dashboard_cache" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"cache_key" varchar(255) NOT NULL,
	"data" jsonb NOT NULL,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_dependencies" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"dependency_type" varchar(50) NOT NULL,
	"dependency_id" varchar(50) NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_download_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"publication_id" varchar(50) NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"download_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_id" integer,
	"organization_id" varchar(50),
	"decision_id" integer,
	"input_data" jsonb NOT NULL,
	"output_action" varchar(20) NOT NULL,
	"modified_data" jsonb,
	"rationale" text,
	"latency_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_featured" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"publication_id" varchar(50) NOT NULL,
	"featured_start_date" timestamp DEFAULT now() NOT NULL,
	"featured_end_date" timestamp,
	"priority" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "strategy_governance" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'Draft' NOT NULL,
	"risk_level" varchar(50),
	"governance_score" double precision DEFAULT 1,
	"is_compliant" boolean DEFAULT true,
	"last_review_date" timestamp,
	"updated_by" varchar(100),
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_governance_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"previous_status" varchar(50),
	"new_status" varchar(50) NOT NULL,
	"reason" text,
	"changed_by" varchar(255),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_installations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"publication_id" varchar(50) NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"installed_strategy_id" varchar(50) NOT NULL,
	"installation_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_layouts" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"builder_id" varchar(50) NOT NULL,
	"block_id" varchar(50) NOT NULL,
	"position_x" double precision NOT NULL,
	"position_y" double precision NOT NULL,
	"width" double precision,
	"height" double precision,
	"is_collapsed" boolean DEFAULT false,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_leaderboards" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"season_id" varchar(50) NOT NULL,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_lifecycles" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"current_state" varchar(50) NOT NULL,
	"previous_state" varchar(50),
	"created_time" timestamp DEFAULT now() NOT NULL,
	"activated_time" timestamp,
	"paused_time" timestamp,
	"retired_time" timestamp,
	"current_version" varchar(50) NOT NULL,
	"approval_status" varchar(50),
	"approval_by" varchar(100),
	"approval_notes" text,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_marketplace" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_metadata" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_metric_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"metric_name" varchar(100) NOT NULL,
	"metric_value" double precision NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_monthly_metrics" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"pnl" double precision DEFAULT 0 NOT NULL,
	"roi" double precision DEFAULT 0 NOT NULL,
	"max_drawdown" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_optimization_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"optimization_id" varchar(50) NOT NULL,
	"user_id" varchar(100),
	"notes" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_optimization_rules" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"minimum_win_rate" double precision,
	"maximum_drawdown" double precision,
	"target_sharpe" double precision,
	"target_profit_factor" double precision,
	"maximum_risk" double precision,
	"minimum_confidence" double precision,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_optimization_runs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"optimization_id" varchar(50) NOT NULL,
	"run_type" varchar(50) NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"result" jsonb
);
--> statement-breakpoint
CREATE TABLE "strategy_optimizations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"score" double precision,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_parameter_analysis" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"optimization_id" varchar(50) NOT NULL,
	"block_id" varchar(50) NOT NULL,
	"parameter_key" varchar(100) NOT NULL,
	"current_value" text,
	"optimal_value" text,
	"impact_score" double precision,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_parameters" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"block_id" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"value_type" varchar(50) NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_performance_summary" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"net_profit" double precision DEFAULT 0 NOT NULL,
	"gross_profit" double precision DEFAULT 0 NOT NULL,
	"gross_loss" double precision DEFAULT 0 NOT NULL,
	"roi" double precision DEFAULT 0 NOT NULL,
	"cagr" double precision DEFAULT 0 NOT NULL,
	"profit_factor" double precision DEFAULT 0 NOT NULL,
	"sharpe_ratio" double precision DEFAULT 0 NOT NULL,
	"sortino_ratio" double precision DEFAULT 0 NOT NULL,
	"calmar_ratio" double precision DEFAULT 0 NOT NULL,
	"win_rate" double precision DEFAULT 0 NOT NULL,
	"loss_rate" double precision DEFAULT 0 NOT NULL,
	"average_trade" double precision DEFAULT 0 NOT NULL,
	"recovery_factor" double precision DEFAULT 0 NOT NULL,
	"max_drawdown" double precision DEFAULT 0 NOT NULL,
	"average_holding_time" double precision DEFAULT 0 NOT NULL,
	"capital_utilization" double precision DEFAULT 0 NOT NULL,
	"strategy_stability" double precision DEFAULT 0 NOT NULL,
	"execution_efficiency" double precision DEFAULT 0 NOT NULL,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_permissions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'Executor' NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	"can_run" boolean DEFAULT false NOT NULL,
	"can_approve" boolean DEFAULT false NOT NULL,
	"granted_by" varchar(100),
	"granted_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_policies" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"min_threshold" double precision,
	"max_threshold" double precision,
	"severity" varchar(50) DEFAULT 'Warning',
	"created_time" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "strategy_policies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "strategy_policy_rules" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"policy_id" varchar(50) NOT NULL,
	"rule_name" varchar(255) NOT NULL,
	"operator" varchar(50) NOT NULL,
	"target_value" varchar(100),
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "strategy_publications" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"publisher" varchar(100) NOT NULL,
	"visibility" varchar(50) NOT NULL,
	"category" varchar(50),
	"tags" jsonb,
	"description" text,
	"release_notes" text,
	"publication_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_rankings" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"leaderboard_id" varchar(50) NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"rank" integer NOT NULL,
	"previous_rank" integer,
	"score" double precision NOT NULL,
	"rating" varchar(50),
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_rating_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"rating" varchar(50) NOT NULL,
	"score" double precision NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_recommendations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"optimization_id" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"suggested_changes" jsonb NOT NULL,
	"confidence_score" double precision,
	"expected_benefit" text,
	"expected_risk" text,
	"notes" text,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_registry" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"version" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"owner" varchar(100) NOT NULL,
	"created_by" varchar(100) NOT NULL,
	"risk_level" varchar(50) NOT NULL,
	"complexity" integer NOT NULL,
	"supported_markets" jsonb DEFAULT '[]'::jsonb,
	"supported_instruments" jsonb DEFAULT '[]'::jsonb,
	"minimum_capital" double precision,
	"maximum_capital" double precision,
	"preferred_timeframe" varchar(100),
	"preferred_session" varchar(100),
	"created_time" timestamp DEFAULT now() NOT NULL,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_reports" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50),
	"report_type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"content" jsonb NOT NULL,
	"created_by" varchar(100),
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_restore_points" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"reason" text,
	"restored_by" varchar(100),
	"restored_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"execution_id" integer,
	"pnl" numeric(15, 2),
	"success" boolean NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_retirement_logs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"version" varchar(50) NOT NULL,
	"retired_by" varchar(100),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"reason" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "strategy_review_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"request_id" varchar(50) NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"reviewer_email" varchar(255) NOT NULL,
	"review_notes" text,
	"score_awarded" double precision DEFAULT 1,
	"decision" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_review_requests" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"requested_by" varchar(255) NOT NULL,
	"assignee_email" varchar(255),
	"status" varchar(50) DEFAULT 'Open' NOT NULL,
	"notes" text,
	"requested_time" timestamp DEFAULT now() NOT NULL,
	"completed_time" timestamp
);
--> statement-breakpoint
CREATE TABLE "strategy_reviews" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"publication_id" varchar(50) NOT NULL,
	"rating" integer NOT NULL,
	"review_notes" text,
	"reviewer" varchar(100) NOT NULL,
	"approval_status" varchar(50) NOT NULL,
	"review_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_id" integer,
	"name" varchar(100) NOT NULL,
	"condition" text NOT NULL,
	"action" varchar(20) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_score_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"score" double precision NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_scorecards" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"season_id" varchar(50),
	"overall_score" double precision NOT NULL,
	"backtesting_score" double precision,
	"paper_trading_score" double precision,
	"risk_score" double precision,
	"consistency_score" double precision,
	"capital_efficiency" double precision,
	"recovery_score" double precision,
	"execution_quality" double precision,
	"composite_rating" varchar(50),
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_seasons" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_snapshots" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"builder_layout" jsonb NOT NULL,
	"blocks" jsonb NOT NULL,
	"connections" jsonb NOT NULL,
	"parameters" jsonb NOT NULL,
	"metadata" jsonb,
	"dependencies" jsonb,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_state_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"old_state" varchar(50),
	"new_state" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(100),
	"reason" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "strategy_states" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_tags" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"tag" varchar(50) NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_template_library" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_templates" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"config_template" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"category" varchar(100) NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_transitions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"from_state" varchar(50) NOT NULL,
	"to_state" varchar(50) NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_usage_statistics" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"publication_id" varchar(50) NOT NULL,
	"install_count" integer DEFAULT 0,
	"clone_count" integer DEFAULT 0,
	"usage_count" integer DEFAULT 0,
	"backtest_count" integer DEFAULT 0,
	"paper_trading_count" integer DEFAULT 0,
	"popularity_score" double precision DEFAULT 0,
	"updated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_validation" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"builder_id" varchar(50) NOT NULL,
	"is_valid" boolean DEFAULT false NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb,
	"warnings" jsonb DEFAULT '[]'::jsonb,
	"validated_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_version_history" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"user_id" varchar(100),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "strategy_version_tags" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"version_id" varchar(50) NOT NULL,
	"tag" varchar(50) NOT NULL,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_versions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"major_version" integer NOT NULL,
	"minor_version" integer NOT NULL,
	"patch_version" integer NOT NULL,
	"semantic_version" varchar(50) NOT NULL,
	"version_type" varchar(50) NOT NULL,
	"lifecycle_state" varchar(50) NOT NULL,
	"validation_status" varchar(50) NOT NULL,
	"author" varchar(100),
	"notes" text,
	"created_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_yearly_metrics" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"strategy_id" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"pnl" double precision DEFAULT 0 NOT NULL,
	"roi" double precision DEFAULT 0 NOT NULL,
	"max_drawdown" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" varchar(20) NOT NULL,
	"component" varchar(50) NOT NULL,
	"message" varchar(255) NOT NULL,
	"stack_trace" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_matches" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"round_id" varchar(50) NOT NULL,
	"participant_a" varchar(50) NOT NULL,
	"participant_b" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"winner_id" varchar(50),
	"loser_id" varchar(50),
	"is_draw" boolean DEFAULT false NOT NULL,
	"match_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tournament_results" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"match_id" varchar(50) NOT NULL,
	"participant_id" varchar(50) NOT NULL,
	"score" double precision NOT NULL,
	"confidence" double precision DEFAULT 0 NOT NULL,
	"roi" double precision DEFAULT 0 NOT NULL,
	"sharpe" double precision DEFAULT 0 NOT NULL,
	"drawdown" double precision DEFAULT 0 NOT NULL,
	"accuracy" double precision DEFAULT 0 NOT NULL,
	"risk_score" double precision DEFAULT 0 NOT NULL,
	"execution_time_ms" integer DEFAULT 0 NOT NULL,
	"token_usage" integer DEFAULT 0 NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_rounds" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"tournament_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"sequence" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_scoreboards" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"season_id" varchar(50) NOT NULL,
	"participant_id" varchar(50) NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"win_rate" double precision DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"ranking" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_seasons" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"status" varchar(50) NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"champion_id" varchar(50),
	"runner_up_id" varchar(50),
	"mvp_id" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer,
	"order_id" integer,
	"ticker" varchar(12) NOT NULL,
	"side" varchar(10) NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"execution_price" numeric(12, 2) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'trader' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "administration_logs" ADD CONSTRAINT "administration_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_cost" ADD CONSTRAINT "ai_cost_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_decisions" ADD CONSTRAINT "ai_decisions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_decisions" ADD CONSTRAINT "ai_decisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_records" ADD CONSTRAINT "ai_learning_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_learning_scores" ADD CONSTRAINT "ai_learning_scores_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_provider_id_ai_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_provider_health" ADD CONSTRAINT "ai_provider_health_provider_id_ai_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_decision_id_ai_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."ai_decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_request_logs" ADD CONSTRAINT "ai_request_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_request_logs" ADD CONSTRAINT "ai_request_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_request_logs" ADD CONSTRAINT "ai_request_logs_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_research_reports" ADD CONSTRAINT "ai_research_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_dashboards" ADD CONSTRAINT "analytics_dashboards_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_performance" ADD CONSTRAINT "analytics_performance_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_reports" ADD CONSTRAINT "analytics_reports_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_reports" ADD CONSTRAINT "analytics_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_log" ADD CONSTRAINT "event_log_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_log" ADD CONSTRAINT "event_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instruments" ADD CONSTRAINT "instruments_exchange_id_exchanges_id_fk" FOREIGN KEY ("exchange_id") REFERENCES "public"."exchanges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instruments" ADD CONSTRAINT "instruments_type_id_instrument_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."instrument_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_status" ADD CONSTRAINT "market_status_exchange_id_exchanges_id_fk" FOREIGN KEY ("exchange_id") REFERENCES "public"."exchanges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_role_roles_name_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_embeddings" ADD CONSTRAINT "memory_embeddings_event_id_memory_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."memory_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_events" ADD CONSTRAINT "memory_events_session_id_memory_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."memory_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_feedback" ADD CONSTRAINT "memory_feedback_event_id_memory_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."memory_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_feedback" ADD CONSTRAINT "memory_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_knowledge" ADD CONSTRAINT "memory_knowledge_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_patterns" ADD CONSTRAINT "memory_patterns_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_sessions" ADD CONSTRAINT "memory_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_sessions" ADD CONSTRAINT "memory_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_accounts" ADD CONSTRAINT "paper_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_journal" ADD CONSTRAINT "paper_journal_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_journal" ADD CONSTRAINT "paper_journal_trade_id_paper_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."paper_trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_orders" ADD CONSTRAINT "paper_orders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_orders" ADD CONSTRAINT "paper_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_positions" ADD CONSTRAINT "paper_positions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_trades" ADD CONSTRAINT "paper_trades_order_id_paper_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."paper_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_trades" ADD CONSTRAINT "paper_trades_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_evidence" ADD CONSTRAINT "research_evidence_report_id_research_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."research_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_evidence" ADD CONSTRAINT "research_evidence_source_id_research_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."research_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_history" ADD CONSTRAINT "research_history_report_id_research_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."research_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_history" ADD CONSTRAINT "research_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_reports" ADD CONSTRAINT "research_reports_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_reports" ADD CONSTRAINT "research_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_reports" ADD CONSTRAINT "research_reports_decision_id_ai_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."ai_decisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_reports" ADD CONSTRAINT "research_reports_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_sources" ADD CONSTRAINT "research_sources_report_id_research_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."research_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_events" ADD CONSTRAINT "risk_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_events" ADD CONSTRAINT "risk_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_events" ADD CONSTRAINT "risk_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_limits" ADD CONSTRAINT "risk_limits_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_profiles" ADD CONSTRAINT "risk_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_name_roles_name_fk" FOREIGN KEY ("role_name") REFERENCES "public"."roles"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_name_permissions_name_fk" FOREIGN KEY ("permission_name") REFERENCES "public"."permissions"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_executions" ADD CONSTRAINT "strategy_executions_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_executions" ADD CONSTRAINT "strategy_executions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_executions" ADD CONSTRAINT "strategy_executions_decision_id_ai_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."ai_decisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_results" ADD CONSTRAINT "strategy_results_execution_id_strategy_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."strategy_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_rules" ADD CONSTRAINT "strategy_rules_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_learning_records_org_idx" ON "ai_learning_records" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ai_learning_records_type_idx" ON "ai_learning_records" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ai_learning_scores_org_idx" ON "ai_learning_scores" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ai_learning_scores_target_idx" ON "ai_learning_scores" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "analytics_dashboards_org_idx" ON "analytics_dashboards" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "analytics_metrics_org_idx" ON "analytics_metrics" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "analytics_metrics_name_idx" ON "analytics_metrics" USING btree ("name");--> statement-breakpoint
CREATE INDEX "analytics_perf_org_idx" ON "analytics_performance" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "analytics_perf_target_idx" ON "analytics_performance" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "analytics_reports_org_idx" ON "analytics_reports" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "analytics_snapshots_org_idx" ON "analytics_snapshots" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "event_log_org_idx" ON "event_log" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "event_log_type_idx" ON "event_log" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "event_log_created_idx" ON "event_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "instruments_symbol_idx" ON "instruments" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "instruments_exchange_idx" ON "instruments" USING btree ("exchange_id");--> statement-breakpoint
CREATE INDEX "memberships_org_idx" ON "memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "memory_events_session_idx" ON "memory_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "memory_events_type_idx" ON "memory_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "memory_knowledge_org_idx" ON "memory_knowledge" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "memory_knowledge_key_idx" ON "memory_knowledge" USING btree ("key");--> statement-breakpoint
CREATE INDEX "memory_patterns_org_idx" ON "memory_patterns" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "memory_sessions_org_idx" ON "memory_sessions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "memory_sessions_user_idx" ON "memory_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_portfolio_idx" ON "orders" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "orders_ticker_idx" ON "orders" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "paper_journal_org_idx" ON "paper_journal" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "paper_orders_org_idx" ON "paper_orders" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "paper_orders_ticker_idx" ON "paper_orders" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX "paper_orders_status_idx" ON "paper_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "paper_orders_created_idx" ON "paper_orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "paper_positions_org_idx" ON "paper_positions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "paper_trades_org_idx" ON "paper_trades" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "paper_trades_ticker_idx" ON "paper_trades" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX "positions_portfolio_idx" ON "positions" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "positions_ticker_idx" ON "positions" USING btree ("ticker");