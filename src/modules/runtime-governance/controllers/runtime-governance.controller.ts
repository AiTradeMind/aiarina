import { Request, Response } from "express";
import { RuntimeGovernanceService } from "../services/runtime-governance.service.ts";
import logger from "../../../lib/logger.ts";

export class RuntimeGovernanceController {
  private static instance: RuntimeGovernanceController;
  private service: RuntimeGovernanceService;

  private constructor() {
    this.service = RuntimeGovernanceService.getInstance();
  }

  public static getInstance(): RuntimeGovernanceController {
    if (!RuntimeGovernanceController.instance) {
      RuntimeGovernanceController.instance = new RuntimeGovernanceController();
    }
    return RuntimeGovernanceController.instance;
  }

  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.service.getHealthStatus();
      res.status(200).json(health);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error fetching Runtime Governance health");
      res.status(500).json({ error: err.message });
    }
  };

  public evaluateAction = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.evaluateAction(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error evaluating Runtime Governance action");
      res.status(500).json({ error: err.message });
    }
  };

  public getPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const policies = await this.service.getActivePolicies();
      res.status(200).json({ policies, count: policies.length });
    } catch (err: any) {
      logger.error({ error: err.message }, "Error fetching policies");
      res.status(500).json({ error: err.message });
    }
  };

  public createPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyData = req.body;
      if (!policyData.policyId || !policyData.name || !policyData.category) {
        res.status(400).json({ error: "policyId, name, and category are required." });
        return;
      }

      const created = await this.service.savePolicy({
        policyId: policyData.policyId,
        name: policyData.name,
        category: policyData.category,
        enforcementLevel: policyData.enforcementLevel || "STRICT_BLOCK",
        status: policyData.status || "ACTIVE",
        priority: policyData.priority || 10,
        ruleConfig: policyData.ruleConfig || {},
        description: policyData.description,
        author: policyData.author || "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json(created);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error creating policy");
      res.status(500).json({ error: err.message });
    }
  };

  public getCircuitBreakers = async (req: Request, res: Response): Promise<void> => {
    try {
      const breakers = await this.service.getAllCircuitBreakers();
      res.status(200).json({ circuitBreakers: breakers, count: breakers.length });
    } catch (err: any) {
      logger.error({ error: err.message }, "Error fetching circuit breakers");
      res.status(500).json({ error: err.message });
    }
  };

  public resetCircuitBreaker = async (req: Request, res: Response): Promise<void> => {
    try {
      const target = req.body.target || req.params.target || "GLOBAL";
      const operator = req.body.operator || "OPERATOR";
      const resetState = await this.service.resetCircuitBreaker(target, operator);
      res.status(200).json(resetState);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error resetting circuit breaker");
      res.status(500).json({ error: err.message });
    }
  };

  public getKillSwitch = async (req: Request, res: Response): Promise<void> => {
    try {
      const scope = (req.query.scope as string) || "GLOBAL";
      const status = await this.service.getKillSwitchStatus(scope);
      res.status(200).json(status || { scope, isActive: false });
    } catch (err: any) {
      logger.error({ error: err.message }, "Error fetching kill switch status");
      res.status(500).json({ error: err.message });
    }
  };

  public activateKillSwitch = async (req: Request, res: Response): Promise<void> => {
    try {
      const scope = req.body.scope || "GLOBAL";
      const operator = req.body.operator || "SYSTEM";
      const reason = req.body.reason || "Manual emergency halt triggered";
      const role = req.body.role || req.headers["x-user-role"] as string || "SUPER_ADMIN";

      const state = await this.service.activateKillSwitch(scope, operator, reason, role);
      res.status(200).json(state);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error activating kill switch");
      res.status(400).json({ error: err.message });
    }
  };

  public deactivateKillSwitch = async (req: Request, res: Response): Promise<void> => {
    try {
      const scope = req.body.scope || "GLOBAL";
      const operator = req.body.operator || "SUPER_ADMIN";
      const reason = req.body.reason || "Emergency cleared following audit";
      const role = req.body.role || req.headers["x-user-role"] as string || "SUPER_ADMIN";

      const state = await this.service.deactivateKillSwitch(scope, operator, reason, role);
      res.status(200).json(state);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error deactivating kill switch");
      res.status(400).json({ error: err.message });
    }
  };

  public getAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await this.service.getAuditLogs(limit);
      res.status(200).json({ logs, count: logs.length });
    } catch (err: any) {
      logger.error({ error: err.message }, "Error fetching audit logs");
      res.status(500).json({ error: err.message });
    }
  };
}
