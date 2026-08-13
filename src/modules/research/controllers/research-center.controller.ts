import { Request, Response, NextFunction } from "express";
import { ResearchCenterService } from "../services/research-center.service.ts";
import { CreateResearchDTO, UpdateResearchDTO, ResearchFilterQuery } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class ResearchCenterController {
  private service: ResearchCenterService;

  constructor(service?: ResearchCenterService) {
    this.service = service || new ResearchCenterService();
  }

  /**
   * GET /research
   * Search, filter, and list research items
   */
  public async getResearchItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        keyword,
        category,
        status,
        fromDate,
        toDate,
        tag,
        source,
        organizationId,
        limit,
        offset,
      } = req.query;

      const filter: ResearchFilterQuery = {
        keyword: keyword ? String(keyword) : undefined,
        category: category ? String(category) : undefined,
        status: status ? (String(status) as any) : undefined,
        fromDate: fromDate ? String(fromDate) : undefined,
        toDate: toDate ? String(toDate) : undefined,
        tag: tag ? String(tag) : undefined,
        source: source ? String(source) : undefined,
        organizationId: organizationId ? String(organizationId) : undefined,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      };

      const result = await this.service.searchResearch(filter);
      res.status(200).json({
        success: true,
        data: result.items,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        filter: result.filter,
      });
    } catch (error: any) {
      logger.error({ type: "RESEARCH_CONTROLLER_ERROR", error: error.message }, "Error fetching research items");
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve research items",
      });
    }
  }

  /**
   * GET /research/categories
   * List all supported research categories
   */
  public async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.service.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
        total: categories.length,
      });
    } catch (error: any) {
      logger.error({ type: "RESEARCH_CONTROLLER_ERROR", error: error.message }, "Error fetching research categories");
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve research categories",
      });
    }
  }

  /**
   * GET /research/status
   * List all supported research statuses
   */
  public async getStatuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statuses = this.service.getStatuses();
      res.status(200).json({
        success: true,
        data: statuses,
        total: statuses.length,
      });
    } catch (error: any) {
      logger.error({ type: "RESEARCH_CONTROLLER_ERROR", error: error.message }, "Error fetching research statuses");
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve research statuses",
      });
    }
  }

  /**
   * GET /research/:id
   * Get single research item by ID
   */
  public async getResearchById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.service.getResearchById(id);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        error: error.message || "Failed to retrieve research item",
      });
    }
  }

  /**
   * POST /research
   * Create a new research item
   */
  public async createResearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateResearchDTO = req.body;
      const operator = (req as any).user?.userId || (req.headers["x-user-id"] as string) || "SYSTEM";

      if (!dto || !dto.title || !dto.content) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: title and content are mandatory.",
        });
        return;
      }

      const item = await this.service.createResearch(dto, operator);
      res.status(201).json({
        success: true,
        data: item,
        message: "Research item created and classified successfully.",
      });
    } catch (error: any) {
      logger.error({ type: "RESEARCH_CONTROLLER_ERROR", error: error.message }, "Error creating research item");
      res.status(400).json({
        success: false,
        error: error.message || "Failed to create research item",
      });
    }
  }

  /**
   * PUT /research/:id
   * Update an existing research item
   */
  public async updateResearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateResearchDTO = req.body;
      const operator = (req as any).user?.userId || (req.headers["x-user-id"] as string) || "SYSTEM";

      const updated = await this.service.updateResearch(id, dto, operator);
      res.status(200).json({
        success: true,
        data: updated,
        message: "Research item updated successfully.",
      });
    } catch (error: any) {
      const status = error.message.includes("not found") ? 404 : 400;
      res.status(status).json({
        success: false,
        error: error.message || "Failed to update research item",
      });
    }
  }

  /**
   * DELETE /research/:id
   * Delete a research item
   */
  public async deleteResearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const operator = (req as any).user?.userId || (req.headers["x-user-id"] as string) || "SYSTEM";

      await this.service.deleteResearch(id, operator);
      res.status(200).json({
        success: true,
        message: `Research item ${id} deleted successfully.`,
      });
    } catch (error: any) {
      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        error: error.message || "Failed to delete research item",
      });
    }
  }
}
