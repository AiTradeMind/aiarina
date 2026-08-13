import { Router } from "express";
import { VersioningController } from "../controllers/index.ts";

const router = Router();
const controller = new VersioningController();

router.get("/", controller.getVersions.bind(controller));
router.get("/analytics", controller.getAnalytics.bind(controller));
router.get("/compare/versions", controller.compareVersions.bind(controller));
router.get("/history/:id", controller.getHistory.bind(controller));
router.get("/diff/:id", controller.getDiff.bind(controller));
router.get("/changelog/:id", controller.getChangelog.bind(controller));
router.get("/:strategyId", controller.getVersions.bind(controller));
router.get("/version/:id", controller.getVersionById.bind(controller));
router.get("/:id", controller.getVersionById.bind(controller));

router.post("/create", controller.createVersion.bind(controller));
router.post("/release", controller.releaseVersion.bind(controller));
router.post("/rollback", controller.rollbackVersion.bind(controller));
router.post("/archive", controller.archiveVersion.bind(controller));
router.post("/restore", controller.restoreVersion.bind(controller));
router.post("/clone", controller.cloneVersion.bind(controller));

export { router as strategyVersioningRouter };

