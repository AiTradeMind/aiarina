import { Router } from "express";
import { aiActivationController } from "../controllers/aiActivation.controller.ts";

const router = Router();

router.post("/ai/activate", (req, res) => aiActivationController.activate(req, res));
router.post("/ai/pause", (req, res) => aiActivationController.pause(req, res));
router.post("/ai/resume", (req, res) => aiActivationController.resume(req, res));
router.post("/ai/stop", (req, res) => aiActivationController.stop(req, res));
router.post("/ai/restart", (req, res) => aiActivationController.restart(req, res));

router.get("/ai/status", (req, res) => aiActivationController.getStatus(req, res));
router.get("/ai/runtime", (req, res) => aiActivationController.getRuntime(req, res));
router.get("/ai/health", (req, res) => aiActivationController.getHealth(req, res));
router.get("/ai/license", (req, res) => aiActivationController.getLicense(req, res));
router.get("/ai/quota", (req, res) => aiActivationController.getQuota(req, res));

router.get("/ai/certificates", (req, res) => aiActivationController.getCertificates(req, res));
router.get("/ai/audits", (req, res) => aiActivationController.getAudits(req, res));
router.get("/ai/events", (req, res) => aiActivationController.getEvents(req, res));
router.get("/ai/qa", (req, res) => aiActivationController.runQa(req, res));

export const aiActivationRouter = router;
