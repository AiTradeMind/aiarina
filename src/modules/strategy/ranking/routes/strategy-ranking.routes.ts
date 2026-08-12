import { Router } from 'express';
import { strategyRankingController } from '../controllers/strategy-ranking.controller.ts';

const router = Router();

router.get('/ranking', strategyRankingController.getRankings);
router.post('/ranking/:rankingId/status', strategyRankingController.updateStatus);
router.post('/ranking/bulk', strategyRankingController.bulkOperation);

export { router as strategyRankingRouter };
