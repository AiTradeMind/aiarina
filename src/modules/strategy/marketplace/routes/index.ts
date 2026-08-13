import { Router } from "express";
import { MarketplaceController } from "../controllers";

const router = Router();
const controller = new MarketplaceController();

router.get("/", controller.getMarketplaces);
router.get("/publications", controller.getPublications);
router.get("/templates", controller.getTemplates);
router.get("/featured", controller.getFeatured);
router.get("/reviews", controller.getReviews);
router.get("/usage-statistics", controller.getUsageStatistics);
router.post("/publish", controller.publishStrategy);
router.post("/install", controller.installStrategy);
router.post("/clone", controller.cloneStrategy);

export { router as strategyMarketplaceRouter };
