import { Router } from "express";
import { AIController } from "../controllers/index.ts";
import { aiDecisionRouter } from "../decision/routes/index.ts";
import { aiMemoryRouter } from "../memory/routes/index.ts";
import { aiLearningRouter } from "../learning/routes/index.ts";

export const aiRouter = Router();
const aiCtrl = new AIController();

// Mount sub-modules
aiRouter.use(aiDecisionRouter);
aiRouter.use(aiMemoryRouter);
aiRouter.use(aiLearningRouter);

// Consensus & Multi-Round Debate Endpoints
aiRouter.post("/ai/consensus/debate", (req, res, next) => aiCtrl.runConsensusDebate(req, res, next));
aiRouter.get("/ai/consensus/session/:id", (req, res, next) => aiCtrl.getConsensusSession(req, res, next));
aiRouter.get("/ai/consensus/memory", (req, res, next) => aiCtrl.getConsensusMemory(req, res, next));
aiRouter.get("/ai/consensus/reliability", (req, res, next) => aiCtrl.getConsensusReliability(req, res, next));
aiRouter.get("/ai/consensus/audit", (req, res, next) => aiCtrl.getConsensusAudit(req, res, next));
aiRouter.get("/ai/consensus/quality", (req, res, next) => aiCtrl.getConsensusQuality(req, res, next));

// Research Orchestration & Decision Intelligence Endpoints
aiRouter.post("/ai/research/run", (req, res, next) => aiCtrl.runResearch(req, res, next));
aiRouter.get("/ai/research/session/:id", (req, res, next) => aiCtrl.getResearchSession(req, res, next));
aiRouter.get("/ai/research/memory", (req, res, next) => aiCtrl.getResearchMemory(req, res, next));
aiRouter.get("/ai/research/graph", (req, res, next) => aiCtrl.getResearchGraph(req, res, next));
aiRouter.get("/ai/research/metrics", (req, res, next) => aiCtrl.getResearchMetrics(req, res, next));

// Provider Registry Management Endpoints
aiRouter.get("/ai/providers", (req, res, next) => aiCtrl.getProviders(req, res, next));
aiRouter.post("/ai/providers", (req, res, next) => aiCtrl.registerProvider(req, res, next));
aiRouter.put("/ai/providers/:id", (req, res, next) => aiCtrl.updateProvider(req, res, next));
aiRouter.get("/ai/providers/health", (req, res, next) => aiCtrl.getHealth(req, res, next));

// Model Metadata List Endpoint
aiRouter.get("/ai/models", (req, res, next) => aiCtrl.getModels(req, res, next));

// Model Performance, Ranking & Learning Engine Endpoints
aiRouter.get("/ai/performance", (req, res, next) => aiCtrl.getPerformance(req, res, next));
aiRouter.get("/ai/performance/metrics", (req, res, next) => aiCtrl.getPerformanceMetrics(req, res, next));
aiRouter.get("/ai/performance/:modelId", (req, res, next) => aiCtrl.getPerformanceById(req, res, next));
aiRouter.get("/ai/rankings", (req, res, next) => aiCtrl.getRankings(req, res, next));
aiRouter.get("/ai/scorecards", (req, res, next) => aiCtrl.getScorecards(req, res, next));
aiRouter.get("/ai/learning", (req, res, next) => aiCtrl.getLearning(req, res, next));
aiRouter.get("/ai/learning/:modelId", (req, res, next) => aiCtrl.getLearningById(req, res, next));
aiRouter.get("/ai/benchmarks", (req, res, next) => aiCtrl.getBenchmarks(req, res, next));

// Enterprise Model Gateway Core Endpoints
aiRouter.post("/ai/gateway/request", (req, res, next) => aiCtrl.dispatchRequest(req, res, next));
aiRouter.get("/ai/gateway/history", (req, res, next) => aiCtrl.getRequestHistory(req, res, next));
aiRouter.get("/ai/gateway/metrics", (req, res, next) => aiCtrl.getMetrics(req, res, next));
aiRouter.post("/ai/gateway/test", (req, res, next) => aiCtrl.testConnection(req, res, next));

// Legacy System Endpoints
aiRouter.post("/ai/provider/register", (req, res, next) => aiCtrl.registerProvider(req, res, next));
aiRouter.get("/ai/providers/health", (req, res, next) => aiCtrl.getHealth(req, res, next));
aiRouter.get("/ai/health", (req, res, next) => aiCtrl.getHealth(req, res, next));
aiRouter.get("/ai/usage", (req, res, next) => aiCtrl.getUsage(req, res, next));
aiRouter.get("/ai/cost", (req, res, next) => aiCtrl.getCost(req, res, next));
aiRouter.post("/ai/complete", (req, res, next) => aiCtrl.complete(req, res, next));
aiRouter.post("/ai/chat", (req, res, next) => aiCtrl.chat(req, res, next));
aiRouter.post("/ai/stream", (req, res, next) => aiCtrl.stream(req, res, next));
aiRouter.post("/ai/init", (req, res, next) => aiCtrl.initialize(req, res, next));
