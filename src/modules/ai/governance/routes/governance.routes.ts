import { Router } from 'express';
import { AIGovernanceController } from '../controllers/governance.controller';

const router = Router();
const controller = new AIGovernanceController();

// === EP22 EXISTING MODEL LIFECYCLE & REGISTRY ROUTES ===

router.get('/models', (req, res, next) => controller.getModels(req, res, next));
router.get('/providers', (req, res, next) => controller.getProviders(req, res, next));
router.get('/evaluations', (req, res, next) => controller.getEvaluations(req, res, next));
router.get('/leaderboard', (req, res, next) => controller.getLeaderboard(req, res, next));
router.get('/deployments', (req, res, next) => controller.getDeployments(req, res, next));
router.get('/policies', (req, res, next) => controller.getPolicies(req, res, next));
router.get('/versions', (req, res, next) => controller.getVersions(req, res, next));
router.get('/audit', (req, res, next) => controller.getAudit(req, res, next));
router.get('/qa', (req, res, next) => controller.getQaReport(req, res, next));

router.post('/register', (req, res, next) => controller.registerModel(req, res, next));
router.post('/approve', (req, res, next) => controller.approveModel(req, res, next));
router.post('/promote', (req, res, next) => controller.promoteModel(req, res, next));
router.post('/rollback', (req, res, next) => controller.rollbackModel(req, res, next));
router.post('/retire', (req, res, next) => controller.retireModel(req, res, next));

// === EP06 PHASE 4 RUNTIME GOVERNANCE PIPELINE ROUTES ===

router.get('/sessions', (req, res, next) => controller.getSessions(req, res, next));
router.get('/session/:id', (req, res, next) => controller.getSessionDetail(req, res, next));
router.post('/sessions', (req, res, next) => controller.createGovernanceSession(req, res, next));

router.get('/reviews', (req, res, next) => controller.getHumanReviewQueue(req, res, next));
router.post('/reviews/:id/decision', (req, res, next) => controller.submitHumanReviewDecision(req, res, next));

router.get('/metrics-snapshots', (req, res, next) => controller.getMetricsHistory(req, res, next));

router.post('/replay', (req, res, next) => controller.triggerAuditReplay(req, res, next));
router.get('/replay', (req, res, next) => controller.getAuditReplayHistory(req, res, next));

export default router;
