import { Router } from 'express';
import { EnterpriseCertificationController } from '../controllers/certification.controller';

const router = Router();

router.get('/dashboard', EnterpriseCertificationController.getDashboard);
router.get('/results', EnterpriseCertificationController.getResults);
router.get('/scorecard', EnterpriseCertificationController.getScorecard);
router.get('/evidence', EnterpriseCertificationController.getEvidence);
router.get('/audit', EnterpriseCertificationController.getAudit);
router.get('/qa', EnterpriseCertificationController.getQaReport);

router.post('/run', EnterpriseCertificationController.runCertification);
router.post('/export', EnterpriseCertificationController.exportCertificate);

export default router;
