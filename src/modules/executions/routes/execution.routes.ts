import { Router } from "express";
import { executionController } from "../controllers/ExecutionController.ts";

const router = Router();

router.post("/run", executionController.runExecution as any);
router.get("/", executionController.getExecutions as any);
router.get("/:id", executionController.getExecutionById as any);
router.get("/:id/history", executionController.getExecutionHistory as any);

export const enterpriseExecutionRouter = router;
