import { Request, Response } from "express";
import { StrategyCandidatesService } from "../services/strategy-candidates.service.ts";
import { pino } from "pino";

const logger = pino({ name: "strategy-candidates-controller" });
const service = StrategyCandidatesService.getInstance();

export class StrategyCandidatesController {
  static async getOverview(req: Request, res: Response) {
    try {
      const strategyId = (req.query.strategyId as string) || 'STRAT-001';
      const overview = await service.getCandidatesOverview(strategyId);
      res.json({ success: true, data: overview });
    } catch (err: any) {
      logger.error({ err }, "Failed to get candidates overview");
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async submitCandidate(req: Request, res: Response) {
    try {
      const candidateData = req.body;
      if (!candidateData.candidateId || !candidateData.strategyId || !candidateData.symbol) {
        return res.status(400).json({ success: false, error: "Missing required candidate fields: candidateId, strategyId, symbol" });
      }
      const result = await service.validateAndIngestCandidate(candidateData);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ err }, "Failed to submit candidate");
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { candidateId } = req.params;
      const { status, operator, reason } = req.body;
      if (!candidateId || !status) {
        return res.status(400).json({ success: false, error: "candidateId and status are required" });
      }
      const overview = await service.updateCandidateStatus(candidateId, status, operator || 'Enterprise Officer', reason);
      res.json({ success: true, data: overview });
    } catch (err: any) {
      logger.error({ err }, "Failed to update candidate status");
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async vote(req: Request, res: Response) {
    try {
      const { candidateId } = req.params;
      const { committeeMember, vote, comment } = req.body;
      if (!candidateId || !committeeMember || !vote) {
        return res.status(400).json({ success: false, error: "candidateId, committeeMember, and vote are required" });
      }
      const overview = await service.voteOnCandidate(candidateId, committeeMember, vote, comment);
      res.json({ success: true, data: overview });
    } catch (err: any) {
      logger.error({ err }, "Failed to record committee vote");
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async bulkAction(req: Request, res: Response) {
    try {
      const { strategyId, operation, candidateIds, operator } = req.body;
      if (!strategyId || !operation || !Array.isArray(candidateIds)) {
        return res.status(400).json({ success: false, error: "strategyId, operation, and candidateIds array are required" });
      }
      const overview = await service.bulkOperation(strategyId, operation, candidateIds, operator || 'Enterprise Officer');
      res.json({ success: true, data: overview });
    } catch (err: any) {
      logger.error({ err }, "Failed to execute bulk candidate operation");
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
