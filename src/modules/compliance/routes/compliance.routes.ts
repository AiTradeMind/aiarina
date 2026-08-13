import { Router } from 'express';
import { EnterpriseComplianceController } from '../controllers/compliance.controller';

const router = Router();

router.get('/dashboard', EnterpriseComplianceController.getDashboard);
router.get('/rules', EnterpriseComplianceController.getRules);
router.get('/policies', EnterpriseComplianceController.getPolicies);
router.get('/validations', EnterpriseComplianceController.getValidations);
router.get('/violations', EnterpriseComplianceController.getViolations);
router.get('/exceptions', EnterpriseComplianceController.getExceptions);
router.get('/evidence', EnterpriseComplianceController.getEvidence);
router.get('/reports', EnterpriseComplianceController.getReports);
router.get('/certificates', EnterpriseComplianceController.getCertificates);
router.get('/audit', EnterpriseComplianceController.getAudit);
router.get('/qa', EnterpriseComplianceController.getQaReport);

router.post('/validate', EnterpriseComplianceController.validate);
router.post('/exception', EnterpriseComplianceController.createException);

export default router;
