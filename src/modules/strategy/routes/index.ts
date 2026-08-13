import { Router } from "express";
import { StrategyService } from "../services/strategy.service.ts";

export const strategyRouter = Router();
const service = StrategyService.getInstance();

// POST /api/strategy/create
strategyRouter.post("/create", async (req, res) => {
  try {
    const { name, category, owner, tags } = req.body;
    if (!name || !category || !owner) {
      return res.status(400).json({ error: "Missing required fields: name, category, or owner" });
    }

    const strategy = await service.createStrategy(name, category, owner, tags || []);
    res.status(201).json(strategy);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/strategy/library
strategyRouter.get("/library", async (req, res) => {
  try {
    const items = await service.getLibraryItems();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/strategy/evaluation
strategyRouter.get("/evaluation", async (req, res) => {
  try {
    const evaluations = await service.getEvaluations();
    res.json(evaluations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/strategy/ranking
strategyRouter.get("/ranking", async (req, res) => {
  try {
    const rankings = await service.compileStrategyRankings();
    res.json(rankings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/strategy/candidates
strategyRouter.get("/candidates", async (req, res) => {
  try {
    const candidates = await service.getCandidates();
    res.json(candidates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/strategy/runtime
strategyRouter.get("/runtime", async (req, res) => {
  try {
    const runtimes = await service.getRuntimes();
    res.json(runtimes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Extra helper routes for interactive UI controls:
// GET /api/strategy/all
strategyRouter.get("/all", async (req, res) => {
  try {
    const list = await service.getStrategies();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/strategy/parameters/:strategyId
strategyRouter.get("/parameters/:strategyId", async (req, res) => {
  try {
    const params = await service.getParametersForStrategy(req.params.strategyId);
    res.json(params);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/strategy/parameters
strategyRouter.post("/parameters", async (req, res) => {
  try {
    const { strategyId, riskProfile, timeframe, volumeRules, liquidityRules, volatilityRules, trendRules, sessionRules, marketConditions } = req.body;
    if (!strategyId) {
      return res.status(400).json({ error: "strategyId is required" });
    }
    const params = await service.updateParameters(
      strategyId,
      riskProfile || "MODERATE",
      timeframe || "15M",
      volumeRules || {},
      liquidityRules || {},
      volatilityRules || {},
      trendRules || {},
      sessionRules || {},
      marketConditions || []
    );
    res.json(params);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/strategy/queue
strategyRouter.post("/queue", async (req, res) => {
  try {
    const { strategyId, priority } = req.body;
    if (!strategyId) {
      return res.status(400).json({ error: "strategyId is required" });
    }
    const job = await service.queueStrategyJob(strategyId, priority || 50);
    res.json(job);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/strategy/events
strategyRouter.get("/events", async (req, res) => {
  try {
    const list = await service.getEvents();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/strategy/audits
strategyRouter.get("/audits", async (req, res) => {
  try {
    const list = await service.getAudits();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/strategy/toggle-status
strategyRouter.post("/toggle-status", async (req, res) => {
  try {
    const { strategyId, status } = req.body;
    if (!strategyId || !status) {
      return res.status(400).json({ error: "strategyId and status are required" });
    }
    await service.updateStrategyStatus(strategyId, status);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

let inMemoryActiveStrategy: any = null;

// GET /api/strategy/active
strategyRouter.get("/active", async (req, res) => {
  try {
    if (!inMemoryActiveStrategy) {
      const all = await service.getStrategies();
      if (all && all.length > 0) {
        inMemoryActiveStrategy = {
          id: all[0].id,
          strategyId: all[0].id,
          name: all[0].name,
          category: all[0].category || "Trend Following",
          version: all[0].version || "1.0.0",
          isCertified: true,
          currentStage: "BUILDER",
          currentStatus: all[0].status || "ENABLED",
          description: "Institutional strategy model",
          rules: ["Fast EMA (9) > Slow EMA (21)", "ATR Volatility Filter Enabled"],
          riskLevel: "MEDIUM",
          marketType: "EQUITY",
          instrumentType: "SPOT",
          timeframe: "15M"
        };
      }
    }
    res.json({ status: "success", data: inMemoryActiveStrategy });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/strategy/active
strategyRouter.post("/active", async (req, res) => {
  try {
    const { activeStrategy } = req.body;
    if (activeStrategy) {
      inMemoryActiveStrategy = activeStrategy;
    }
    res.json({ status: "success", data: inMemoryActiveStrategy });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
