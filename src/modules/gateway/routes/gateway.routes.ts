import { Router } from 'express';
import { EnterpriseGatewayController } from '../controllers/gateway.controller';

const router = Router();

// Phase 10B Standard API Gateway Routes
router.get('/', EnterpriseGatewayController.getOverview);
router.get('/status', EnterpriseGatewayController.getStatus);
router.get('/health', EnterpriseGatewayController.getHealth);
router.get('/routes', EnterpriseGatewayController.getRoutes);
router.get('/registry', EnterpriseGatewayController.getRegistry);
router.get('/metrics', EnterpriseGatewayController.getMetrics);
router.get('/logs', EnterpriseGatewayController.getLogs);
router.get('/usage', EnterpriseGatewayController.getUsage);
router.get('/policies', EnterpriseGatewayController.getPolicies);
router.get('/versions', EnterpriseGatewayController.getVersions);

router.post('/verify', EnterpriseGatewayController.verifyRequest);

// Backward Compatibility Routes
router.get('/dashboard', EnterpriseGatewayController.getDashboard);
router.get('/api-keys', EnterpriseGatewayController.getApiKeys);
router.get('/rate-limits', EnterpriseGatewayController.getRateLimits);
router.get('/webhooks', EnterpriseGatewayController.getWebhooks);
router.get('/connectors', EnterpriseGatewayController.getConnectors);
router.get('/analytics', EnterpriseGatewayController.getAnalytics);
router.get('/audit', EnterpriseGatewayController.getAudit);
router.get('/qa', EnterpriseGatewayController.getQaReport);

router.post('/webhook', EnterpriseGatewayController.handleWebhook);
router.post('/validate', EnterpriseGatewayController.validateRequest);
router.post('/reload', EnterpriseGatewayController.reloadGateway);

export default router;
