import { Request, Response, NextFunction } from "express";
import { ConstitutionService } from "../services/constitution.service.ts";
import { RegisterModuleDTO } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class ConstitutionController {
  private service: ConstitutionService;

  constructor(service?: ConstitutionService) {
    this.service = service || new ConstitutionService();
  }

  /**
   * GET /constitution
   * Returns complete Constitution summary
   */
  getConstitution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.service.getConstitution();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      logger.error({ type: "CONSTITUTION_CONTROLLER_ERROR", error: error.message }, "Error fetching constitution");
      next(error);
    }
  };

  /**
   * GET /constitution/version
   * Returns current active version and version history
   */
  getVersion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const versionData = await this.service.getVersion();
      res.status(200).json({
        success: true,
        data: versionData,
      });
    } catch (error: any) {
      logger.error({ type: "CONSTITUTION_CONTROLLER_ERROR", error: error.message }, "Error fetching constitution version");
      next(error);
    }
  };

  /**
   * GET /constitution/modules
   * Returns registered modules
   */
  getModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const modulesData = await this.service.getModules();
      res.status(200).json({
        success: true,
        data: modulesData,
      });
    } catch (error: any) {
      logger.error({ type: "CONSTITUTION_CONTROLLER_ERROR", error: error.message }, "Error fetching constitution modules");
      next(error);
    }
  };

  /**
   * POST /constitution/modules/register
   * Registers a new module into the Constitution Engine
   * Protected for Administrators
   */
  registerModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { moduleId, moduleName, version, capabilities, dependencies, signature } = req.body;

      if (!moduleId || typeof moduleId !== "string") {
        res.status(400).json({ success: false, error: "Validation failed: moduleId string is required" });
        return;
      }

      if (!moduleName || typeof moduleName !== "string") {
        res.status(400).json({ success: false, error: "Validation failed: moduleName string is required" });
        return;
      }

      if (!version || typeof version !== "string") {
        res.status(400).json({ success: false, error: "Validation failed: version string is required" });
        return;
      }

      const dto: RegisterModuleDTO = {
        moduleId: moduleId.trim(),
        moduleName: moduleName.trim(),
        version: version.trim(),
        capabilities: Array.isArray(capabilities) ? capabilities : [],
        dependencies: Array.isArray(dependencies) ? dependencies : [],
        signature: typeof signature === "string" ? signature.trim() : undefined,
        registeredBy: (req as any).user?.email || (req as any).user?.role || "ADMIN",
      };

      const registeredModule = await this.service.registerModule(dto);

      res.status(201).json({
        success: true,
        message: "Module registered successfully into Constitution Engine",
        data: registeredModule,
      });
    } catch (error: any) {
      logger.error({ type: "CONSTITUTION_CONTROLLER_ERROR", error: error.message }, "Error registering constitution module");
      res.status(400).json({ success: false, error: error.message });
    }
  };

  /**
   * GET /constitution/health
   * Health monitoring check for Constitution Engine
   */
  getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.service.getHealth();
      const statusCode = health.status === "UNHEALTHY" ? 503 : 200;
      res.status(statusCode).json({
        success: health.status !== "UNHEALTHY",
        data: health,
      });
    } catch (error: any) {
      logger.error({ type: "CONSTITUTION_CONTROLLER_ERROR", error: error.message }, "Error checking constitution health");
      res.status(503).json({
        success: false,
        error: error.message,
      });
    }
  };
}
