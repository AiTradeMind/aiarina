import { Router } from 'express';
import { EnterpriseReleaseController } from '../controllers/releases.controller';

const router = Router();

router.get('/dashboard', EnterpriseReleaseController.getDashboard);
router.get('/environments', EnterpriseReleaseController.getEnvironments);
router.get('/releases', EnterpriseReleaseController.getReleases);
router.get('/versions', EnterpriseReleaseController.getVersions);
router.get('/deployments', EnterpriseReleaseController.getDeployments);
router.get('/configurations', EnterpriseReleaseController.getConfigurations);
router.get('/audit', EnterpriseReleaseController.getAudit);
router.get('/approvals', EnterpriseReleaseController.getApprovals);
router.get('/rollbacks', EnterpriseReleaseController.getRollbacks);
router.get('/workers', EnterpriseReleaseController.getWorkers);
router.get('/qa', EnterpriseReleaseController.getQaReport);

router.post('/deploy', EnterpriseReleaseController.deploy);
router.post('/rollback', EnterpriseReleaseController.rollback);
router.post('/approve', EnterpriseReleaseController.approve);

export default router;
