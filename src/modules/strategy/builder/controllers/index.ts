import { Request, Response } from "express";
import { BuilderService } from "../services/index.ts";

export class BuilderController {
  private service = new BuilderService();

  private buildResponse<T>(
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data: T | null = null,
    errors: string[] = []
  ): void {
    res.status(statusCode).json({
      success,
      message,
      data,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  public listStrategies = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.listStrategies();
      this.buildResponse(res, 200, result.success, result.message, result.data, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error while listing strategies", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public getStrategyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        return this.buildResponse(res, 400, false, "Missing Strategy ID", null, ["Strategy ID parameter is required."]);
      }
      const result = await this.service.findStrategyById(id);
      const code = result.success ? 200 : 404;
      this.buildResponse(res, code, result.success, result.message, result.data, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error while getting strategy", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public createStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== "object") {
        return this.buildResponse(res, 400, false, "Invalid request payload", null, ["Request body must be a valid JSON object."]);
      }
      const result = await this.service.createStrategy(payload);
      const code = result.success ? 201 : 400;
      this.buildResponse(res, code, result.success, result.message, result.data || null, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error while creating strategy", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public updateStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        return this.buildResponse(res, 400, false, "Missing Strategy ID", null, ["Strategy ID parameter is required."]);
      }
      const payload = req.body;
      if (!payload || typeof payload !== "object") {
        return this.buildResponse(res, 400, false, "Invalid request payload", null, ["Request body must be a valid JSON object."]);
      }
      const result = await this.service.updateStrategy(id, payload);
      const code = result.success ? 200 : (result.message === "Strategy not found" ? 404 : 400);
      this.buildResponse(res, code, result.success, result.message, result.data || null, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error while updating strategy", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public deleteStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        return this.buildResponse(res, 400, false, "Missing Strategy ID", null, ["Strategy ID parameter is required."]);
      }
      const result = await this.service.deleteStrategy(id);
      const code = result.success ? 200 : 404;
      this.buildResponse(res, code, result.success, result.message, null, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error while deleting strategy", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public cloneStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        return this.buildResponse(res, 400, false, "Missing Strategy ID", null, ["Strategy ID parameter is required."]);
      }
      const { name, createdBy } = req.body || {};
      const result = await this.service.cloneStrategy(id, name, createdBy);
      const code = result.success ? 201 : 400;
      this.buildResponse(res, code, result.success, result.message, result.data || null, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error while cloning strategy", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public bulkOperation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { action, ids, updatedBy } = req.body || {};
      if (!action || !ids) {
        return this.buildResponse(res, 400, false, "Missing action or strategy IDs", null, ["Action and IDs array are required."]);
      }
      const result = await this.service.bulkOperation(action, ids, updatedBy);
      const code = result.success ? 200 : 400;
      this.buildResponse(res, code, result.success, result.message, result, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error during bulk operation", null, [err.message || "Unknown error"]);
    }
  };

  public getHistoryTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        return this.buildResponse(res, 400, false, "Missing Strategy ID", null, ["Strategy ID parameter is required."]);
      }
      const result = await this.service.getHistoryTimeline(id);
      this.buildResponse(res, 200, result.success, result.message, result.data, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error getting strategy history", null, [err.message || "Unknown error"]);
    }
  };

  public saveRules = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const { rules } = req.body || {};
      if (!id) {
        return this.buildResponse(res, 400, false, "Missing Strategy ID", null, ["Strategy ID parameter is required."]);
      }
      const result = await this.service.saveRules(id, rules);
      const code = result.success ? 200 : 400;
      this.buildResponse(res, code, result.success, result.message, null, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error while saving rules", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public loadRules = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        return this.buildResponse(res, 400, false, "Missing Strategy ID", null, ["Strategy ID parameter is required."]);
      }
      const result = await this.service.loadRules(id);
      const code = result.success ? 200 : 404;
      this.buildResponse(res, code, result.success, result.message, result.data || null, result.errors);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error while loading rules", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public getBuilderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const builder = await this.service.getBuilderById(id);
      if (!builder) {
        return this.buildResponse(res, 404, false, "Builder graph not found", null, ["Builder graph not found."]);
      }
      this.buildResponse(res, 200, true, "Builder graph retrieved successfully", builder, []);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error getting builder graph", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public saveBuilderContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.service.saveBuilderContent(id, req.body);
      if (!result.success) {
        return this.buildResponse(res, 400, false, result.error || "Save failed", null, [result.error || "Save failed"]);
      }
      this.buildResponse(res, 200, true, "Builder saved successfully", null, []);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error saving builder content", null, [err.message || "Unknown error"]);
    } finally {
    }
  };

  public validateBuilder = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const result = await this.service.validateBuilder(id);
      if (!result.success) {
        return this.buildResponse(res, 400, false, result.error || "Validation failed", null, [result.error || "Validation failed"]);
      }
      this.buildResponse(res, 200, true, "Validation completed", result.data, []);
    } catch (err: any) {
      this.buildResponse(res, 500, false, "Internal Server Error validating builder", null, [err.message || "Unknown error"]);
    } finally {
    }
  };
}
