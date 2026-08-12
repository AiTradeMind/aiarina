import { Router } from "express";
import {
  AuthController,
  UserController,
  OrganizationController,
  RoleController,
} from "../controllers/index.ts";
import { requirePermission, requireOrganizationMembership } from "../../../middleware/auth.ts";

export const identityRouter = Router();

const authCtrl = new AuthController();
const userCtrl = new UserController();
const orgCtrl = new OrganizationController();
const roleCtrl = new RoleController();

// Public Authentication Endpoints
identityRouter.post("/auth/login", (req, res, next) => authCtrl.login(req, res, next));
identityRouter.post("/auth/logout", (req, res, next) => authCtrl.logout(req, res, next));
identityRouter.post("/auth/refresh", (req, res, next) => authCtrl.refresh(req, res, next));

// Protected Identity & Session Details
identityRouter.get("/auth/me", (req, res, next) => authCtrl.me(req, res, next));

// Users Management Endpoints (Admin protected for mutations)
identityRouter.get("/users", requirePermission("admin"), (req, res, next) => userCtrl.getAllUsers(req, res, next));
identityRouter.get("/users/:id", (req, res, next) => userCtrl.getUserById(req, res, next));
identityRouter.post("/users", requirePermission("admin"), (req, res, next) => userCtrl.createUser(req, res, next));
identityRouter.put("/users/:id", requirePermission("admin"), (req, res, next) => userCtrl.updateUser(req, res, next));
identityRouter.delete("/users/:id", requirePermission("admin"), (req, res, next) => userCtrl.deleteUser(req, res, next));

// Organizations Endpoints (Access protected; Admin can create)
identityRouter.get("/organizations", (req, res, next) => orgCtrl.getAllOrganizations(req, res, next));
identityRouter.get("/organizations/:id", requireOrganizationMembership(), (req, res, next) => orgCtrl.getOrganizationById(req, res, next));
identityRouter.post("/organizations", requirePermission("admin"), (req, res, next) => orgCtrl.createOrganization(req, res, next));

// Roles Endpoints (Access protected)
identityRouter.get("/roles", (req, res, next) => roleCtrl.getAllRoles(req, res, next));
identityRouter.get("/roles/:name", (req, res, next) => roleCtrl.getRoleByName(req, res, next));

