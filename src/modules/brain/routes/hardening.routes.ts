import { Router } from "express";
import { brainHardeningEngine } from "../services/brain-hardening.service.ts";

export const brainHardeningRouter = Router();

brainHardeningRouter.post("/graph/node", async (req, res, next) => {
  try {
    const { entityType, name, properties } = req.body;
    const node = await brainHardeningEngine.createKnowledgeNode(entityType, name, properties);
    res.json({ success: true, data: node });
  } catch (error) {
    next(error);
  }
});

brainHardeningRouter.post("/graph/link", async (req, res, next) => {
  try {
    const { sourceId, targetId, relationType, weight, dependencyType } = req.body;
    const link = await brainHardeningEngine.linkNodes(sourceId, targetId, relationType, weight, dependencyType);
    res.json({ success: true, data: link });
  } catch (error) {
    next(error);
  }
});

brainHardeningRouter.get("/graph/traverse/:nodeId", async (req, res, next) => {
  try {
    const result = await brainHardeningEngine.traverseGraph(req.params.nodeId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

brainHardeningRouter.post("/memory/consolidate", async (req, res, next) => {
  try {
    const result = await brainHardeningEngine.consolidateMemory(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

brainHardeningRouter.post("/retrieve/semantic", async (req, res, next) => {
  try {
    const { query, limit } = req.body;
    const results = await brainHardeningEngine.semanticRetrieve(query, limit);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

brainHardeningRouter.post("/conflicts/resolve", async (req, res, next) => {
  try {
    const { knowledgeAId, knowledgeBId, type } = req.body;
    const resolved = await brainHardeningEngine.detectAndResolveConflicts(knowledgeAId, knowledgeBId, type);
    res.json({ success: true, data: resolved });
  } catch (error) {
    next(error);
  }
});

brainHardeningRouter.get("/metrics", async (req, res, next) => {
  try {
    const metrics = await brainHardeningEngine.getBrainMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
});
