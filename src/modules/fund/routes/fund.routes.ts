import { Router } from "express";
import { FundController } from "../controllers/fund.controller.ts";

const router = Router();
const controller = new FundController();

router.get("/", controller.getFunds.bind(controller));
router.get("/health", controller.getHealth.bind(controller));
router.get("/allocations", controller.getAllocations.bind(controller));
router.get("/reservations", controller.getReservations.bind(controller));
router.get("/:id", controller.getFundById.bind(controller));

router.post("/create", controller.createFund.bind(controller));
router.post("/allocate", controller.allocateCapital.bind(controller));
router.post("/reserve", controller.reserveCapital.bind(controller));
router.post("/release", controller.releaseCapital.bind(controller));
router.post("/freeze", controller.freezeFund.bind(controller));
router.post("/unfreeze", controller.unfreezeFund.bind(controller));

export { router as fundFoundationRouter };
