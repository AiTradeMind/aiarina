import { Router } from 'express';
import { ReportingController } from '../controllers/reporting.controller';

const router = Router();
const controller = new ReportingController();

router.get('/dashboard', (req, res, next) => controller.getDashboard(req, res, next));
router.get('/kpis', (req, res, next) => controller.getKpis(req, res, next));
router.get('/trading', (req, res, next) => controller.getTrading(req, res, next));
router.get('/financial', (req, res, next) => controller.getFinancial(req, res, next));
router.get('/operational', (req, res, next) => controller.getOperational(req, res, next));
router.get('/compliance', (req, res, next) => controller.getCompliance(req, res, next));
router.post('/bi/query', (req, res, next) => controller.runBiQuery(req, res, next));
router.get('/reports', (req, res, next) => controller.getReports(req, res, next));
router.post('/builder', (req, res, next) => controller.createCustomReport(req, res, next));
router.post('/export', (req, res, next) => controller.createCustomReport(req, res, next));
router.get('/schedules', (req, res, next) => controller.getSchedules(req, res, next));
router.post('/schedules', (req, res, next) => controller.createSchedule(req, res, next));
router.get('/qa', (req, res, next) => controller.getQaReport(req, res, next));

export default router;
