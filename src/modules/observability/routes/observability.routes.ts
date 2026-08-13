import { Router } from 'express';
import { EnterpriseObservabilityController } from '../controllers/observability.controller';

const router = Router();

router.get('/dashboard', EnterpriseObservabilityController.getDashboard);
router.get('/metrics', EnterpriseObservabilityController.getMetrics);
router.get('/traces', EnterpriseObservabilityController.getTraces);
router.get('/logs', EnterpriseObservabilityController.getLogs);
router.get('/performance', EnterpriseObservabilityController.getPerformance);
router.get('/errors', EnterpriseObservabilityController.getErrors);
router.get('/capacity', EnterpriseObservabilityController.getCapacity);
router.get('/slo', EnterpriseObservabilityController.getSlo);
router.get('/telemetry', EnterpriseObservabilityController.getTelemetry);
router.get('/audit', EnterpriseObservabilityController.getAudit);
router.get('/qa', EnterpriseObservabilityController.getQaReport);

export default router;
