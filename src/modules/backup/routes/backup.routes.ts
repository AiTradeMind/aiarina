import { Router } from 'express';
import { EnterpriseBackupController } from '../controllers/backup.controller';

const router = Router();

// GET Endpoints
router.get('/', EnterpriseBackupController.getStatus);
router.get('/status', EnterpriseBackupController.getStatus);
router.get('/jobs', EnterpriseBackupController.getJobs);
router.get('/history', EnterpriseBackupController.getHistory);
router.get('/snapshots', EnterpriseBackupController.getSnapshots);
router.get('/retention', EnterpriseBackupController.getRetention);
router.get('/recovery', EnterpriseBackupController.getRecovery);
router.get('/reports', EnterpriseBackupController.getReports);
router.get('/validation', EnterpriseBackupController.getValidation);
router.get('/integrity', EnterpriseBackupController.getIntegrity);

// Backward Compatible GET Endpoints
router.get('/dashboard', EnterpriseBackupController.getDashboard);
router.get('/policies', EnterpriseBackupController.getPolicies);
router.get('/restore', EnterpriseBackupController.getRestore);
router.get('/certificates', EnterpriseBackupController.getCertificates);
router.get('/audit', EnterpriseBackupController.getAudit);
router.get('/qa', EnterpriseBackupController.getQaReport);

// POST Endpoints
router.post('/create', EnterpriseBackupController.createBackup);
router.post('/restore', EnterpriseBackupController.executeRestore);
router.post('/verify', EnterpriseBackupController.verifyBackup);
router.post('/simulate', EnterpriseBackupController.simulateRecovery);
router.post('/export', EnterpriseBackupController.exportBackup);

export default router;
