import { Request, Response } from "express";
import { StrategyParametersService } from "../services/strategy-parameters.service.ts";
import { EMPTY_PARAMETER_OVERVIEW } from "../types/index.ts";
import { pino } from "pino";

const logger = pino({ name: "strategy-parameters-controller" });

export class StrategyParametersController {
  private service: StrategyParametersService;

  constructor() {
    this.service = StrategyParametersService.getInstance();
  }

  public getParameters = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.params;
      const strategyName = req.query.name as string | undefined;

      if (!strategyId) {
        return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW });
      }

      const overview = await this.service.getParametersOverview(strategyId, strategyName);
      return res.json({ success: true, data: overview || EMPTY_PARAMETER_OVERVIEW });
    } catch (err: any) {
      logger.error({ err }, "Error getting parameters");
      return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW, error: err?.message });
    }
  };

  public updateParameters = async (req: Request, res: Response) => {
    try {
      const { strategyId, updates, userName, reason } = req.body;

      if (!strategyId) {
        return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW });
      }

      if (!updates || !Array.isArray(updates)) {
        const legacyBody = req.body;
        const legacyUpdates: Array<{ parameterId: string; newValue: any }> = [];
        if (legacyBody.riskProfile) legacyUpdates.push({ parameterId: 'max_account_risk_per_trade', newValue: legacyBody.riskProfile === 'CONSERVATIVE' ? 0.5 : legacyBody.riskProfile === 'AGGRESSIVE' ? 2.0 : 1.0 });
        if (legacyBody.timeframe) legacyUpdates.push({ parameterId: 'trading_session_window', newValue: legacyBody.timeframe });
        
        if (legacyUpdates.length > 0) {
          const overview = await this.service.updateParameters(
            strategyId,
            legacyUpdates,
            userName || 'ADMIN_USER',
            reason || 'Legacy Parameter Update'
          );
          return res.json({ success: true, data: overview || EMPTY_PARAMETER_OVERVIEW });
        }

        return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW });
      }

      const overview = await this.service.updateParameters(
        strategyId,
        updates,
        userName || 'ADMIN_USER',
        reason || 'Manual Parameter Calibration'
      );

      return res.json({ success: true, data: overview || EMPTY_PARAMETER_OVERVIEW });
    } catch (err: any) {
      logger.error({ err }, "Error updating parameters");
      return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW, error: err?.message });
    }
  };

  public resetParameters = async (req: Request, res: Response) => {
    try {
      const { strategyId, type, parameterId, groupName, userName } = req.body;

      if (!strategyId) {
        return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW });
      }

      let overview;
      if (type === 'SINGLE' && parameterId) {
        overview = await this.service.resetParameter(strategyId, parameterId, userName || 'ADMIN_USER');
      } else if (type === 'GROUP' && groupName) {
        overview = await this.service.resetGroup(strategyId, groupName, userName || 'ADMIN_USER');
      } else {
        overview = await this.service.resetAll(strategyId, userName || 'ADMIN_USER');
      }

      return res.json({ success: true, data: overview || EMPTY_PARAMETER_OVERVIEW });
    } catch (err: any) {
      logger.error({ err }, "Error resetting parameters");
      return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW, error: err?.message });
    }
  };

  public lockParameter = async (req: Request, res: Response) => {
    try {
      const { strategyId, parameterId, locked, reason, userName } = req.body;

      if (!strategyId || !parameterId) {
        return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW });
      }

      const overview = await this.service.setParameterLock(
        strategyId,
        parameterId,
        locked ?? true,
        reason,
        userName || 'ADMIN_USER'
      );

      return res.json({ success: true, data: overview || EMPTY_PARAMETER_OVERVIEW });
    } catch (err: any) {
      logger.error({ err }, "Error locking parameter");
      return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW, error: err?.message });
    }
  };

  public bulkOperation = async (req: Request, res: Response) => {
    try {
      const { strategyId, operation, parameterIds, payload, userName } = req.body;

      if (!strategyId || !operation || !parameterIds) {
        return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW });
      }

      const overview = await this.service.bulkPerformOperation(
        strategyId,
        operation,
        parameterIds,
        payload,
        userName || 'ADMIN_USER'
      );

      return res.json({ success: true, data: overview || EMPTY_PARAMETER_OVERVIEW });
    } catch (err: any) {
      logger.error({ err }, "Error executing bulk operation");
      return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW, error: err?.message });
    }
  };

  public restoreVersion = async (req: Request, res: Response) => {
    try {
      const { strategyId, versionNumber, userName } = req.body;

      if (!strategyId || !versionNumber) {
        return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW });
      }

      const overview = await this.service.restoreVersion(
        strategyId,
        versionNumber,
        userName || 'ADMIN_USER'
      );

      return res.json({ success: true, data: overview || EMPTY_PARAMETER_OVERVIEW });
    } catch (err: any) {
      logger.error({ err }, "Error restoring version");
      return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW, error: err?.message });
    }
  };

  public getPresets = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.params;
      if (!strategyId) return res.json({ success: true, data: [] });

      const repo = (this.service as any).repo;
      const presets = await repo.getPresetsByStrategyId(strategyId);
      return res.json({ success: true, data: presets || [] });
    } catch (err: any) {
      logger.error({ err }, "Error getting presets");
      return res.json({ success: true, data: [] });
    }
  };

  public applyPreset = async (req: Request, res: Response) => {
    try {
      const { strategyId, presetName, userName } = req.body;

      if (!strategyId || !presetName) {
        return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW });
      }

      const overview = await this.service.applyPreset(strategyId, presetName, userName || 'ADMIN_USER');
      return res.json({ success: true, data: overview || EMPTY_PARAMETER_OVERVIEW });
    } catch (err: any) {
      logger.error({ err }, "Error applying preset");
      return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW, error: err?.message });
    }
  };

  public createPreset = async (req: Request, res: Response) => {
    try {
      const { strategyId, presetName, description, parametersData, userName } = req.body;

      if (!strategyId || !presetName) {
        return res.status(400).json({ error: "strategyId and presetName are required" });
      }

      const preset = await this.service.createPreset(
        strategyId,
        presetName,
        description || '',
        parametersData,
        userName || 'ADMIN_USER'
      );

      return res.status(201).json({ success: true, data: preset });
    } catch (err: any) {
      logger.error({ err }, "Error creating preset");
      return res.status(500).json({ error: err.message || "Failed to create preset" });
    }
  };

  public updatePreset = async (req: Request, res: Response) => {
    try {
      const { presetId } = req.params;
      const updates = req.body;
      if (!presetId) return res.status(400).json({ error: "presetId is required" });

      await this.service.updatePreset(presetId, updates);
      return res.json({ success: true });
    } catch (err: any) {
      logger.error({ err }, "Error updating preset");
      return res.status(500).json({ error: err.message || "Failed to update preset" });
    }
  };

  public duplicatePreset = async (req: Request, res: Response) => {
    try {
      const { presetId, newPresetName } = req.body;
      if (!presetId || !newPresetName) return res.status(400).json({ error: "presetId and newPresetName are required" });

      const copy = await this.service.duplicatePreset(presetId, newPresetName);
      return res.status(201).json({ success: true, data: copy });
    } catch (err: any) {
      logger.error({ err }, "Error duplicating preset");
      return res.status(500).json({ error: err.message || "Failed to duplicate preset" });
    }
  };

  public deletePreset = async (req: Request, res: Response) => {
    try {
      const { presetId } = req.params;
      if (!presetId) return res.status(400).json({ error: "presetId is required" });

      await this.service.deletePreset(presetId);
      return res.json({ success: true });
    } catch (err: any) {
      logger.error({ err }, "Error deleting preset");
      return res.status(500).json({ error: err.message || "Failed to delete preset" });
    }
  };

  public getRuntimeApprovedParameters = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.params;
      const isAiConsumer = req.query.ai === 'true';

      if (!strategyId) return res.json({ success: true, data: [] });

      const approved = await this.service.getRuntimeApprovedParameters(strategyId, isAiConsumer);
      return res.json({
        success: true,
        data: {
          strategyId,
          isAiConsumer,
          timestamp: new Date().toISOString(),
          parameters: approved || []
        }
      });
    } catch (err: any) {
      logger.error({ err }, "Error getting runtime approved parameters");
      return res.json({ success: true, data: { parameters: [] } });
    }
  };

  public simulateRisk = async (req: Request, res: Response) => {
    try {
      const result = this.service.calculateRiskSimulation(req.body);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error({ err }, "Error calculating risk simulation");
      return res.status(500).json({ error: err.message || "Failed to calculate risk simulation" });
    }
  };

  public exportParameters = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.params;
      if (!strategyId) {
        return res.status(400).json({ error: "strategyId is required" });
      }

      const jsonStr = await this.service.exportParameters(strategyId);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=strategy-${strategyId}-parameters.json`);
      return res.send(jsonStr);
    } catch (err: any) {
      logger.error({ err }, "Error exporting parameters");
      return res.status(500).json({ error: err.message || "Failed to export parameters" });
    }
  };

  public importParameters = async (req: Request, res: Response) => {
    try {
      const { strategyId, jsonContent, userName } = req.body;

      if (!strategyId || !jsonContent) {
        return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW });
      }

      const overview = await this.service.importParameters(strategyId, jsonContent, userName || 'ADMIN_USER');
      return res.json({ success: true, data: overview || EMPTY_PARAMETER_OVERVIEW });
    } catch (err: any) {
      logger.error({ err }, "Error importing parameters");
      return res.json({ success: true, data: EMPTY_PARAMETER_OVERVIEW, error: err?.message });
    }
  };
}
