import { Router } from "express";
import { rbacController } from "../controllers/RBACController.ts";
import { authenticateToken } from "../../../middleware/auth.ts";

export const rbacRouter = Router();

// Hook up authentication middleware
rbacRouter.use(authenticateToken as any);

// Part 8 APIs
rbacRouter.post("/roles", rbacController.createRole as any);
rbacRouter.get("/roles", rbacController.getRoles as any);
rbacRouter.patch("/roles/:id", rbacController.updateRole as any);
rbacRouter.delete("/roles/:id", rbacController.deleteRole as any);

rbacRouter.post("/permissions", rbacController.createPermission as any);
rbacRouter.get("/permissions", rbacController.getPermissions as any);

rbacRouter.post("/assign-role", rbacController.assignRole as any);
rbacRouter.post("/check", rbacController.checkAccess as any);
rbacRouter.get("/logs", rbacController.getLogs as any);
rbacRouter.get("/stats", rbacController.getStats as any);
