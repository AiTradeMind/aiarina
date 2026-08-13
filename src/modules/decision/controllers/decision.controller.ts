import { Request, Response } from "express";
import { DecisionService } from "../services/decision.service.ts";
import logger from "../../../lib/logger.ts";

export class DecisionController {
  private service: DecisionService;

  constructor(service?: DecisionService) {
    this.service = service || new DecisionService();
  }

  /**
   * GET /decision
   * List decisions and get summary overview
   */
  public getDecisions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { decisionType, status, symbol, limit } = req.query;
      const decisions = await this.service.queryDecisions({
        decisionType: decisionType as any,
        status: status as any,
        symbol: symbol as string,
        limit: limit ? Number(limit) : 50,
      });
      const summary = await this.service.getSummary();
      const health = await this.service.getHealth();

      res.json({
        success: true,
        data: {
          name: "AAOS AI Decision Engine Foundation",
          version: "Phase 2.4",
          count: decisions.length,
          decisions,
          summary,
          health,
        },
      });
    } catch (err: any) {
      logger.error({ type: "DECISION_CONTROLLER_ERROR", error: err.message }, "Error in getDecisions");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /decision/health
   * Health diagnostics
   */
  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.service.getHealth();
      res.json({ success: true, data: health });
    } catch (err: any) {
      logger.error({ type: "DECISION_CONTROLLER_ERROR", error: err.message }, "Error in getHealth");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /decision/status
   * Summary status distribution
   */
  public getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const summary = await this.service.getSummary();
      res.json({ success: true, data: summary });
    } catch (err: any) {
      logger.error({ type: "DECISION_CONTROLLER_ERROR", error: err.message }, "Error in getStatus");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /decision/history
   * Decision status transition audit history
   */
  public getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { decisionId } = req.query;
      const history = await this.service.getHistory(decisionId as string);
      res.json({ success: true, count: history.length, data: history });
    } catch (err: any) {
      logger.error({ type: "DECISION_CONTROLLER_ERROR", error: err.message }, "Error in getHistory");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /decision/:id
   * Get single decision record by ID
   */
  public getDecisionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const decision = await this.service.getDecisionById(id);
      if (!decision) {
        res.status(404).json({ success: false, error: `Decision with ID [${id}] not found.` });
        return;
      }
      const history = await this.service.getHistory(id);
      res.json({ success: true, data: { decision, history } });
    } catch (err: any) {
      logger.error({ type: "DECISION_CONTROLLER_ERROR", error: err.message }, "Error in getDecisionById");
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /decision/evaluate
   * Evaluate context/evidence and generate AI decision
   */
  public evaluateDecision = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        contextId,
        brainContext,
        brainKnowledge,
        brainMemory,
        researchEvidence,
        symbol,
        userOverrideType,
        customInputs,
      } = req.body;

      const operator = (req as any).user?.id || "SYSTEM";
      const record = await this.service.evaluateDecision({
        contextId,
        brainContext,
        brainKnowledge,
        brainMemory,
        researchEvidence,
        symbol,
        userOverrideType,
        customInputs,
        operator,
      });

      res.status(201).json({ success: true, data: record });
    } catch (err: any) {
      logger.error({ type: "DECISION_CONTROLLER_ERROR", error: err.message }, "Error in evaluateDecision");
      res.status(400).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /decision/:id/approve
   * Approve a decision
   */
  public approveDecision = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const operator = (req as any).user?.id || "SYSTEM";
      const record = await this.service.approveDecision(id, operator);
      if (!record) {
        res.status(404).json({ success: false, error: `Decision with ID [${id}] not found.` });
        return;
      }
      res.json({ success: true, data: record });
    } catch (err: any) {
      logger.error({ type: "DECISION_CONTROLLER_ERROR", error: err.message }, "Error in approveDecision");
      res.status(400).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /decision/:id/reject
   * Reject a decision
   */
  public rejectDecision = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const operator = (req as any).user?.id || "SYSTEM";
      const record = await this.service.rejectDecision(id, operator, reason);
      if (!record) {
        res.status(404).json({ success: false, error: `Decision with ID [${id}] not found.` });
        return;
      }
      res.json({ success: true, data: record });
    } catch (err: any) {
      logger.error({ type: "DECISION_CONTROLLER_ERROR", error: err.message }, "Error in rejectDecision");
      res.status(400).json({ success: false, error: err.message });
    }
  };
}
