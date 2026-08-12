import { Router } from 'express';
import { EnterpriseSocController } from '../controllers/security.controller';

const router = Router();

router.get('/', EnterpriseSocController.getStatus);
router.get('/status', EnterpriseSocController.getStatus);
router.get('/events', EnterpriseSocController.getStatus);
router.get('/sessions', EnterpriseSocController.getStatus);
router.get('/devices', EnterpriseSocController.getStatus);
router.get('/metrics', EnterpriseSocController.getStatus);
router.get('/dashboard', EnterpriseSocController.getDashboard);
router.get('/threats', EnterpriseSocController.getThreats);
router.get('/intrusions', EnterpriseSocController.getIntrusions);
router.get('/vulnerabilities', EnterpriseSocController.getVulnerabilities);
router.get('/secrets', EnterpriseSocController.getSecrets);
router.get('/policies', EnterpriseSocController.getPolicies);
router.get('/incidents', EnterpriseSocController.getIncidents);
router.get('/alerts', EnterpriseSocController.getAlerts);
router.get('/audit', EnterpriseSocController.getAudit);
router.get('/workers', EnterpriseSocController.getWorkers);
router.get('/qa', EnterpriseSocController.getQaReport);

router.post('/scan', EnterpriseSocController.triggerScan);
router.post('/rotate-keys', EnterpriseSocController.rotateKeys);
router.post('/verify', EnterpriseSocController.verifyAccess);

export default router;
