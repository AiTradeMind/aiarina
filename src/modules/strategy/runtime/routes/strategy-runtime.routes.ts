import { Router } from 'express';
import { strategyRuntimeController } from '../controllers/strategy-runtime.controller.ts';

const router = Router();

router.get('/runtime', strategyRuntimeController.getSessions);
router.get('/runtime/metrics', strategyRuntimeController.getMetrics);
router.get('/runtime/workers', strategyRuntimeController.getWorkers);
router.get('/runtime/queue', strategyRuntimeController.getQueue);
router.get('/runtime/package/:id', strategyRuntimeController.getPackage);
router.get('/runtime/logs/:id', strategyRuntimeController.getLogs);
router.get('/runtime/history/:id', strategyRuntimeController.getHistory);
router.get('/runtime/:id', strategyRuntimeController.getSessionById);

router.post('/runtime/create', strategyRuntimeController.createSession);
router.post('/runtime/retry', strategyRuntimeController.retrySession);
router.post('/runtime/cancel', strategyRuntimeController.cancelSession);
router.post('/runtime/archive', strategyRuntimeController.archiveSession);
router.post('/runtime/:sessionId/state', strategyRuntimeController.updateState);
router.post('/runtime/:sessionId/priority', strategyRuntimeController.updatePriority);
router.post('/runtime/bulk', strategyRuntimeController.bulkOperation);
router.post('/runtime/reset', strategyRuntimeController.resetStrategy);
router.post('/reset', strategyRuntimeController.resetStrategy);

export { router as strategyRuntimeRouter };
