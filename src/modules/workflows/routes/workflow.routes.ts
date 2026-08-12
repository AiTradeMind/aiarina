import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth.ts";
import { workflowController } from "../controllers/WorkflowController.ts";

const router = Router();

// Apply auth middleware to all workflow endpoints
router.use(authenticateToken as any);

// POST /api/workflows/templates
router.post("/templates", workflowController.createTemplate as any);

// GET /api/workflows/templates
router.get("/templates", workflowController.listTemplates as any);

// POST /api/workflows/start
router.post("/start", workflowController.startWorkflow as any);

// GET /api/workflows/history
router.get("/history", workflowController.getHistory as any);

// GET /api/workflows/:id
router.get("/:id", workflowController.getWorkflowById as any);

// POST /api/workflows/:id/approve
router.post("/:id/approve", workflowController.approveWorkflow as any);

// POST /api/workflows/:id/reject
router.post("/:id/reject", workflowController.rejectWorkflow as any);

// POST /api/workflows/:id/return
router.post("/:id/return", workflowController.returnWorkflow as any);

// POST /api/workflows/:id/cancel
router.post("/:id/cancel", workflowController.cancelWorkflow as any);

// POST /api/workflows/:id/delegate
router.post("/:id/delegate", workflowController.delegateWorkflow as any);

// POST /api/workflows/:id/escalate
router.post("/:id/escalate", workflowController.escalateWorkflow as any);

export default router;
