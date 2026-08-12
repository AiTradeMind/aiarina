import { Request, Response } from "express";
import { BrainService } from "../services/brain.service.ts";
import { BRAIN_ERRORS } from "../constants/index.ts";
import logger from "../../../lib/logger.ts";

export class BrainController {
  private service: BrainService;

  constructor(service?: BrainService) {
    this.service = service || new BrainService();
  }

  /**
   * GET /brain
   * Overview & summary of AI Brain Foundation
   */
  public getOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const summary = await this.service.getSummary();
      const health = await this.service.getHealth();
      res.json({
        success: true,
        data: {
          name: "AAOS AI Brain Foundation",
          version: "Phase 2.3",
          summary,
          health,
        },
      });
    } catch (err: any) {
      logger.error({ type: "BRAIN_CONTROLLER_ERROR", error: err.message }, "Error in getOverview");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /brain/health
   * Detailed health diagnostics
   */
  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.service.getHealth();
      res.json({ success: true, data: health });
    } catch (err: any) {
      logger.error({ type: "BRAIN_CONTROLLER_ERROR", error: err.message }, "Error in getHealth");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /brain/knowledge
   * Query structured knowledge
   */
  public getKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { knowledgeType, researchId, tag, keyword, minConfidence, limit } = req.query;
      const results = await this.service.queryKnowledge({
        knowledgeType: knowledgeType as any,
        researchId: researchId as string,
        tag: tag as string,
        keyword: keyword as string,
        minConfidence: minConfidence ? Number(minConfidence) : undefined,
        limit: limit ? Number(limit) : 50,
      });
      res.json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      logger.error({ type: "BRAIN_CONTROLLER_ERROR", error: err.message }, "Error in getKnowledge");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /brain/memory
   * Query memory records
   */
  public getMemory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memoryType, key, sessionId, limit } = req.query;
      const results = await this.service.queryMemory({
        memoryType: memoryType as any,
        key: key as string,
        sessionId: sessionId as string,
        limit: limit ? Number(limit) : 50,
      });
      res.json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      logger.error({ type: "BRAIN_CONTROLLER_ERROR", error: err.message }, "Error in getMemory");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /brain/context
   * Query reasoning contexts
   */
  public getContext = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contextType, contextId, limit } = req.query;
      const results = await this.service.queryContexts({
        contextType: contextType as any,
        contextId: contextId as string,
        limit: limit ? Number(limit) : 50,
      });
      res.json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      logger.error({ type: "BRAIN_CONTROLLER_ERROR", error: err.message }, "Error in getContext");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /brain/context/build
   * Build a reasoning context
   */
  public buildContext = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contextType, title, knowledgeIds, researchIds, entitySymbols, customInputs, userContext } = req.body;
      const record = await this.service.buildContext({
        contextType,
        title,
        knowledgeIds,
        researchIds,
        entitySymbols,
        customInputs,
        userContext,
      });
      res.status(201).json({ success: true, data: record });
    } catch (err: any) {
      logger.error({ type: "BRAIN_CONTROLLER_ERROR", error: err.message }, "Error in buildContext");
      res.status(400).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /brain/memory/store
   * Store a memory record
   */
  public storeMemory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { memoryType, key, value, sessionId, ttl, metadata } = req.body;
      const record = await this.service.storeMemory({
        memoryType,
        key,
        value,
        sessionId,
        ttl,
        metadata,
      });
      res.status(201).json({ success: true, data: record });
    } catch (err: any) {
      logger.error({ type: "BRAIN_CONTROLLER_ERROR", error: err.message }, "Error in storeMemory");
      res.status(400).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /brain/research/process
   * Process research item arriving from Research Center
   */
  public processResearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { researchId, title, content, category, summary, tags, source, confidenceScore, metadata } = req.body;
      if (!researchId || !title || !content) {
        res.status(400).json({ success: false, error: "researchId, title, and content are required" });
        return;
      }
      const result = await this.service.processResearchItem(
        { researchId, title, content, category, summary, tags, source, confidenceScore, metadata },
        (req as any).user?.id || "SYSTEM"
      );
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ type: "BRAIN_CONTROLLER_ERROR", error: err.message }, "Error in processResearch");
      res.status(400).json({ success: false, error: err.message });
    }
  };
}
