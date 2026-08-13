import { Request, Response } from 'express';
import { strategyRuntimeService } from '../services/strategy-runtime.service.ts';

export class StrategyRuntimeController {
  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const strategyId = (req.query.strategyId as string) || 'STRAT-001';
      const overview = await strategyRuntimeService.getSessions(strategyId);
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = await strategyRuntimeService.getSessionById(id);
      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }
      res.json({ success: true, data: session });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const { strategyId, ...data } = req.body;
      const overview = await strategyRuntimeService.createSession(strategyId || 'STRAT-001', data);
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async retrySession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, operator } = req.body;
      const overview = await strategyRuntimeService.retrySession(sessionId, operator || 'Enterprise Operator');
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async cancelSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, operator } = req.body;
      const overview = await strategyRuntimeService.cancelSession(sessionId, operator || 'Enterprise Operator');
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async archiveSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, operator } = req.body;
      const overview = await strategyRuntimeService.archiveSession(sessionId, operator || 'Enterprise Operator');
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async updateState(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { state, operator, comment } = req.body;
      const overview = await strategyRuntimeService.updateSessionState(sessionId, state, operator || 'Enterprise Operator', comment);
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async updatePriority(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { priority, operator } = req.body;
      const overview = await strategyRuntimeService.updatePriority(sessionId, priority, operator || 'Enterprise Operator');
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async bulkOperation(req: Request, res: Response): Promise<void> {
    try {
      const { strategyId, operation, sessionIds, operator } = req.body;
      const overview = await strategyRuntimeService.bulkOperation(strategyId || 'STRAT-001', operation, sessionIds, operator || 'Enterprise Operator');
      res.json({ success: true, data: overview });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }

  async getPackage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = await strategyRuntimeService.getSessionById(id);
      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }
      res.json({
        success: true,
        data: {
          packageId: `PKG-${session.sessionId}`,
          strategySnapshot: session.strategySnapshot,
          parametersSnapshot: session.parametersSnapshot,
          rankingSnapshot: session.rankingSnapshot,
          candidateSnapshot: session.candidateSnapshot,
          sha256Reference: session.sha256Reference,
          timestamp: session.createdTime
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = await strategyRuntimeService.getSessionById(id);
      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }
      res.json({ success: true, data: session.logs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = await strategyRuntimeService.getSessionById(id);
      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }
      res.json({ success: true, data: session.history });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const strategyId = (req.query.strategyId as string) || 'STRAT-001';
      const overview = await strategyRuntimeService.getSessions(strategyId);
      res.json({ success: true, data: overview.statistics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getWorkers(req: Request, res: Response): Promise<void> {
    try {
      const workers = await strategyRuntimeService.getWorkers();
      res.json({ success: true, data: workers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getQueue(req: Request, res: Response): Promise<void> {
    try {
      const strategyId = (req.query.strategyId as string) || 'STRAT-001';
      const queue = await strategyRuntimeService.getQueue(strategyId);
      res.json({ success: true, data: queue });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async resetStrategy(req: Request, res: Response): Promise<void> {
    try {
      const { confirm, resetState } = req.body || {};
      const result = await strategyRuntimeService.resetStrategyData({
        confirm: Boolean(confirm),
        resetState: resetState || "OFF"
      });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Strategy reset operation failed"
      });
    }
  }
}

export const strategyRuntimeController = new StrategyRuntimeController();
