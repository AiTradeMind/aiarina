import { Router } from 'express';
import { OperationsController } from '../controllers/operations.controller';

const router = Router();
const controller = new OperationsController();

router.get('/dashboard', (req, res, next) => controller.getDashboard(req, res, next));
router.get('/services', (req, res, next) => controller.getServices(req, res, next));
router.get('/runtime', (req, res, next) => controller.getRuntime(req, res, next));
router.get('/queues', (req, res, next) => controller.getQueues(req, res, next));
router.get('/incidents', (req, res, next) => controller.getIncidents(req, res, next));
router.post('/incidents', (req, res, next) => controller.createIncident(req, res, next));
router.post('/maintenance', (req, res, next) => controller.createMaintenance(req, res, next));
router.get('/health', (req, res, next) => controller.getHealth(req, res, next));

router.get('/feature-flags', (req, res, next) => controller.getFeatureFlags(req, res, next));
router.post('/feature-flags/toggle', (req, res, next) => controller.toggleFeatureFlag(req, res, next));
router.get('/diagnostics', (req, res, next) => controller.getDiagnostics(req, res, next));
router.get('/audit', (req, res, next) => controller.getAuditLogs(req, res, next));
router.get('/qa', (req, res, next) => controller.getQaReport(req, res, next));

export default router;
