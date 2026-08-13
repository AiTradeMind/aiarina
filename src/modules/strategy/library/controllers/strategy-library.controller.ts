import { Request, Response } from "express";
import { StrategyLibraryService } from "../services/strategy-library.service.ts";
import logger from "../../../../lib/logger.ts";

export class StrategyLibraryController {
  private service = StrategyLibraryService.getInstance();

  public listTemplates = async (req: Request, res: Response) => {
    try {
      const {
        searchQuery,
        category,
        marketType,
        riskLevel,
        timeframe,
        status,
        approvalStatus,
        author,
        favoritesOnly,
        coreOnly,
        institutionalOnly,
        sortKey,
        sortDir,
        page,
        limit
      } = req.query;

      const filters = {
        searchQuery: searchQuery ? String(searchQuery) : undefined,
        category: category ? String(category) : undefined,
        marketType: marketType ? String(marketType) : undefined,
        riskLevel: riskLevel ? String(riskLevel) : undefined,
        timeframe: timeframe ? String(timeframe) : undefined,
        status: status ? String(status) : undefined,
        approvalStatus: approvalStatus ? String(approvalStatus) : undefined,
        author: author ? String(author) : undefined,
        favoritesOnly: favoritesOnly === 'true',
        coreOnly: coreOnly === 'true',
        institutionalOnly: institutionalOnly === 'true',
        sortKey: sortKey as any,
        sortDir: sortDir as any,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 50
      };

      const result = await this.service.listTemplates(filters);
      res.json(result);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error listing strategy templates");
      res.status(500).json({ error: err.message || "Failed to list strategy templates" });
    }
  };

  public getTemplateById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const template = await this.service.getTemplateById(id);
      if (!template) {
        return res.status(404).json({ error: `Strategy template "${id}" not found.` });
      }
      res.json(template);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error retrieving strategy template");
      res.status(500).json({ error: err.message || "Failed to retrieve strategy template" });
    }
  };

  public createTemplate = async (req: Request, res: Response) => {
    try {
      const input = req.body;
      const created = await this.service.createTemplate(input);
      res.status(201).json(created);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error creating strategy template");
      res.status(400).json({ error: err.message || "Failed to create strategy template" });
    }
  };

  public updateTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await this.service.updateTemplate(id, updates);
      res.json(updated);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error updating strategy template");
      res.status(400).json({ error: err.message || "Failed to update strategy template" });
    }
  };

  public deleteTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteTemplate(id);
      res.json(result);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error deleting strategy template");
      res.status(400).json({ error: err.message || "Failed to delete strategy template" });
    }
  };

  public cloneTemplate = async (req: Request, res: Response) => {
    try {
      const id = req.params.id || req.body.id || req.body.templateId;
      const { newName } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Template ID is required for cloning." });
      }
      const cloned = await this.service.cloneTemplate(id, newName);
      res.status(201).json(cloned);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error cloning strategy template");
      res.status(400).json({ error: err.message || "Failed to clone strategy template" });
    }
  };

  public archiveTemplate = async (req: Request, res: Response) => {
    try {
      const id = req.params.id || req.body.id || req.body.templateId;
      if (!id) {
        return res.status(400).json({ error: "Template ID is required for archiving." });
      }
      const archived = await this.service.archiveTemplate(id);
      res.json(archived);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error archiving strategy template");
      res.status(400).json({ error: err.message || "Failed to archive strategy template" });
    }
  };

  public toggleFavorite = async (req: Request, res: Response) => {
    try {
      const id = req.params.id || req.body.id || req.body.templateId;
      if (!id) {
        return res.status(400).json({ error: "Template ID is required for favoriting." });
      }
      const updated = await this.service.toggleFavorite(id);
      res.json(updated);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error favoriting strategy template");
      res.status(400).json({ error: err.message || "Failed to favorite strategy template" });
    }
  };

  public importTemplate = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const imported = await this.service.importTemplate(payload);
      res.status(201).json(imported);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error importing strategy template");
      res.status(400).json({ error: err.message || "Failed to import strategy template" });
    }
  };

  public exportTemplate = async (req: Request, res: Response) => {
    try {
      const id = req.params.id || (req.query.id as string);
      if (!id) {
        return res.status(400).json({ error: "Template ID is required for export." });
      }
      const exported = await this.service.exportTemplate(id);
      res.json(exported);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error exporting strategy template");
      res.status(400).json({ error: err.message || "Failed to export strategy template" });
    }
  };

  public useTemplate = async (req: Request, res: Response) => {
    try {
      const id = req.params.id || req.body.id || req.body.templateId;
      const { targetName } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Template ID is required." });
      }
      const result = await this.service.useTemplate(id, targetName);
      res.json(result);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error using strategy template");
      res.status(400).json({ error: err.message || "Failed to use strategy template" });
    }
  };

  public getHistoryTimeline = async (req: Request, res: Response) => {
    try {
      const id = req.params.id || (req.query.id as string);
      if (!id) {
        return res.status(400).json({ error: "Template ID is required." });
      }
      const history = await this.service.getHistoryTimeline(id);
      res.json(history);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error fetching template history");
      res.status(500).json({ error: err.message || "Failed to fetch template history" });
    }
  };

  public listCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.service.listCategories();
      res.json(categories);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error listing template categories");
      res.status(500).json({ error: err.message || "Failed to list template categories" });
    }
  };

  public getVersions = async (req: Request, res: Response) => {
    try {
      const id = req.params.id || (req.query.id as string);
      if (!id) {
        return res.status(400).json({ error: "Template ID is required." });
      }
      const versions = await this.service.getVersions(id);
      res.json(versions);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error fetching template versions");
      res.status(500).json({ error: err.message || "Failed to fetch template versions" });
    }
  };

  public getAnalytics = async (req: Request, res: Response) => {
    try {
      const id = req.params.id || (req.query.id as string);
      if (!id) {
        return res.status(400).json({ error: "Template ID is required." });
      }
      const analytics = await this.service.getAnalytics(id);
      res.json(analytics);
    } catch (err: any) {
      logger.error({ error: err.message }, "Error fetching template analytics");
      res.status(500).json({ error: err.message || "Failed to fetch template analytics" });
    }
  };
}
