import { Router } from "express";
import { RegistryController } from "../controllers/index.ts";

const router = Router();
const controller = new RegistryController();

router.get("/registry", controller.getStrategies.bind(controller));
router.get("/categories", controller.getCategories.bind(controller));
router.get("/templates", controller.getTemplates.bind(controller));
router.get("/registry/:id", controller.getStrategyById.bind(controller));
router.post("/register", controller.registerStrategy.bind(controller));
router.put("/:id", controller.updateStrategy.bind(controller));
router.delete("/:id", controller.deleteStrategy.bind(controller));

export { router as strategyRegistryRouter };
