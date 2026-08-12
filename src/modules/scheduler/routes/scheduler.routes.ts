import { Router } from 'express';
import { EnterpriseSchedulerController } from '../controllers/scheduler.controller';

const router = Router();

router.get('/dashboard', EnterpriseSchedulerController.getDashboard);
router.get('/jobs', EnterpriseSchedulerController.getJobs);
router.get('/schedules', EnterpriseSchedulerController.getSchedules);
router.get('/dependencies', EnterpriseSchedulerController.getDependencies);
router.get('/rules', EnterpriseSchedulerController.getRules);
router.get('/queue', EnterpriseSchedulerController.getQueue);
router.get('/retries', EnterpriseSchedulerController.getRetries);
router.get('/calendar', EnterpriseSchedulerController.getCalendar);
router.get('/audit', EnterpriseSchedulerController.getAudit);
router.get('/workers', EnterpriseSchedulerController.getWorkers);
router.get('/qa', EnterpriseSchedulerController.getQaReport);

router.post('/job', EnterpriseSchedulerController.createJob);
router.post('/run', EnterpriseSchedulerController.runJob);
router.post('/cancel', EnterpriseSchedulerController.cancelJob);

export default router;
