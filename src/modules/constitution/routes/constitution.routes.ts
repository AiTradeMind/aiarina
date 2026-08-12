import { Router } from "express";
import { ConstitutionController } from "../controllers/constitution.controller.ts";
import { authenticateToken, requireRole } from "../../../middleware/auth.ts";

export const constitutionRouter = Router();
const controller = new ConstitutionController();

// GET /constitution - Supreme Constitution overview
constitutionRouter.get("/", controller.getConstitution);

// GET /constitution/version - Constitution active version and history
constitutionRouter.get("/version", controller.getVersion);

// GET /constitution/modules - Registered Constitution modules
constitutionRouter.get("/modules", controller.getModules);

// POST /constitution/modules/register - Admin module registration
constitutionRouter.post(
  "/modules/register",
  authenticateToken,
  requireRole(["admin"]),
  controller.registerModule
);

// GET /constitution/health - Constitution Engine health monitoring
constitutionRouter.get("/health", controller.getHealth);
