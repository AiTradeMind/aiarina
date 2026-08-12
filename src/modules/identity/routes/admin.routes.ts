import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

export const adminRouter = Router();
const controller = new AdminController();

// GET endpoints required by Module 13 API
adminRouter.get('/users', (req, res, next) => controller.getUsers(req, res, next));
adminRouter.get('/organizations', (req, res, next) => controller.getOrganizations(req, res, next));
adminRouter.get('/teams', (req, res, next) => controller.getTeams(req, res, next));
adminRouter.get('/roles', (req, res, next) => controller.getRoles(req, res, next));
adminRouter.get('/permissions', (req, res, next) => controller.getPermissions(req, res, next));
adminRouter.get('/sessions', (req, res, next) => controller.getSessions(req, res, next));
adminRouter.get('/api-keys', (req, res, next) => controller.getApiKeys(req, res, next));
adminRouter.get('/security-policies', (req, res, next) => controller.getSecurityPolicies(req, res, next));
adminRouter.get('/audit', (req, res, next) => controller.getAuditLogs(req, res, next));
adminRouter.get('/runtime', (req, res, next) => controller.getRuntimeMetric(req, res, next));
adminRouter.get('/qa', (req, res, next) => controller.getQaReport(req, res, next));

// POST endpoints required by Module 13 API
adminRouter.post('/users', (req, res, next) => controller.createUser(req, res, next));
adminRouter.post('/roles', (req, res, next) => controller.createRole(req, res, next));
adminRouter.post('/api-keys', (req, res, next) => controller.createApiKey(req, res, next));
adminRouter.post('/sessions/revoke', (req, res, next) => controller.revokeSession(req, res, next));
adminRouter.post('/security-policies/toggle', (req, res, next) => controller.toggleSecurityPolicy(req, res, next));
adminRouter.post('/workspace-check', (req, res, next) => controller.checkWorkspaceAccess(req, res, next));
