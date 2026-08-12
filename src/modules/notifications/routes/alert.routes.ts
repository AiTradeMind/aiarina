import { Router } from 'express';
import { AlertController } from '../controllers/AlertController.ts';

const router = Router();

router.get('/', AlertController.getAlerts);
router.get('/:id', AlertController.getAlertById);
router.post('/:id/read', AlertController.markAsRead);
router.post('/:id/acknowledge', AlertController.acknowledgeAlert);
router.post('/:id/resolve', AlertController.resolveAlert);

export { router as alertRouter };
