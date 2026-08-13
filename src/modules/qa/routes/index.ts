import { Router } from "express";
import { qaController } from "../controllers/qa.controller.ts";

const router = Router();

router.post("/certify", qaController.certifyPlatform);
router.get("/reports/latest", qaController.getLatestReport);
router.get("/domains", qaController.getDomainResults);
router.get("/benchmarks", qaController.getBenchmarks);
router.get("/audit-logs", qaController.getAuditLogs);

export { router as qaRouter };
