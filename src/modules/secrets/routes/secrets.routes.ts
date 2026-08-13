import { Router } from 'express';
import { EnterpriseSecretsController } from '../controllers/secrets.controller';

const router = Router();

// GET Endpoints
router.get('/', EnterpriseSecretsController.getOverview);
router.get('/status', EnterpriseSecretsController.getStatus);
router.get('/list', EnterpriseSecretsController.listSecrets);
router.get('/history', EnterpriseSecretsController.getHistory);
router.get('/versions', EnterpriseSecretsController.getVersions);
router.get('/usage', EnterpriseSecretsController.getUsage);
router.get('/rotation', EnterpriseSecretsController.getRotation);
router.get('/validation', EnterpriseSecretsController.getValidation);
router.get('/permissions', EnterpriseSecretsController.getPermissions);
router.get('/preview', EnterpriseSecretsController.getPreview);

// POST Endpoints
router.post('/create', EnterpriseSecretsController.createSecret);
router.post('/rotate', EnterpriseSecretsController.rotateSecret);
router.post('/verify', EnterpriseSecretsController.verifySecret);
router.post('/import', EnterpriseSecretsController.importSecrets);
router.post('/export', EnterpriseSecretsController.exportSecrets);

export default router;
