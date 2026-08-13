import { Router } from "express";
import { organizationController } from "../controllers/OrganizationController.ts";
import { workspaceController } from "../controllers/WorkspaceController.ts";

export const orgRouter = Router();

// --- Organizations ---
orgRouter.post("/orgs", (req, res) => organizationController.createOrganization(req, res));
orgRouter.get("/orgs", (req, res) => organizationController.listMyOrganizations(req, res));
orgRouter.get("/orgs/:id", (req, res) => organizationController.getOrganization(req, res));
orgRouter.patch("/orgs/:id", (req, res) => organizationController.updateOrganization(req, res));
orgRouter.delete("/orgs/:id", (req, res) => organizationController.archiveOrganization(req, res));
orgRouter.post("/orgs/:id/restore", (req, res) => organizationController.restoreOrganization(req, res));

// --- Org Settings & Stats ---
orgRouter.get("/orgs/:id/settings", (req, res) => organizationController.getSettings(req, res));
orgRouter.patch("/orgs/:id/settings", (req, res) => organizationController.updateSettings(req, res));
orgRouter.get("/orgs-stats", (req, res) => organizationController.getObservabilityStats(req, res));

// --- Workspaces ---
orgRouter.post("/workspaces", (req, res) => workspaceController.createWorkspace(req, res));
orgRouter.get("/workspaces", (req, res) => workspaceController.listWorkspaces(req, res));
orgRouter.get("/workspaces/:id", (req, res) => workspaceController.getWorkspace(req, res));
orgRouter.patch("/workspaces/:id", (req, res) => workspaceController.updateWorkspace(req, res));
orgRouter.delete("/workspaces/:id", (req, res) => workspaceController.archiveWorkspace(req, res));
orgRouter.post("/workspaces/:id/restore", (req, res) => workspaceController.restoreWorkspace(req, res));
orgRouter.post("/workspaces/:id/transfer", (req, res) => workspaceController.transferOwnership(req, res));

// --- Member Management ---
orgRouter.get("/orgs/:id/members", (req, res) => organizationController.listMembers(req, res));
orgRouter.post("/orgs/:id/members", (req, res) => organizationController.inviteMember(req, res));
orgRouter.delete("/orgs/:id/members/:memberId", (req, res) => organizationController.removeMember(req, res));
orgRouter.post("/orgs/:id/members/:memberId/suspend", (req, res) => organizationController.suspendMember(req, res));
orgRouter.post("/orgs/:id/members/:memberId/restore", (req, res) => organizationController.restoreMember(req, res));
orgRouter.post("/orgs/:id/transfer", (req, res) => organizationController.transferOwnership(req, res));
