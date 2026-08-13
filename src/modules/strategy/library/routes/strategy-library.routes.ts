import { Router } from "express";
import { StrategyLibraryController } from "../controllers/strategy-library.controller.ts";

export const strategyLibraryRouter = Router();
const controller = new StrategyLibraryController();

// GET /api/strategy/library -> List templates
strategyLibraryRouter.get("/", controller.listTemplates);

// GET /api/strategy/library/categories -> Categories
strategyLibraryRouter.get("/categories", controller.listCategories);

// POST /api/strategy/library/create -> Create template
strategyLibraryRouter.post("/create", controller.createTemplate);
strategyLibraryRouter.post("/", controller.createTemplate);

// POST /api/strategy/library/import -> Import template JSON
strategyLibraryRouter.post("/import", controller.importTemplate);

// GET /api/strategy/library/export -> Export
strategyLibraryRouter.get("/export", controller.exportTemplate);
strategyLibraryRouter.post("/export", controller.exportTemplate);

// POST /api/strategy/library/clone -> Clone
strategyLibraryRouter.post("/clone", controller.cloneTemplate);

// POST /api/strategy/library/archive -> Archive
strategyLibraryRouter.post("/archive", controller.archiveTemplate);

// GET /api/strategy/library/history -> History
strategyLibraryRouter.get("/history", controller.getHistoryTimeline);

// POST /api/strategy/library/favorite -> Favorite
strategyLibraryRouter.post("/favorite", controller.toggleFavorite);
strategyLibraryRouter.delete("/favorite", controller.toggleFavorite);

// POST /api/strategy/library/use -> Use
strategyLibraryRouter.post("/use", controller.useTemplate);

// Parameterized REST routes
strategyLibraryRouter.get("/:id", controller.getTemplateById);
strategyLibraryRouter.put("/:id", controller.updateTemplate);
strategyLibraryRouter.delete("/:id", controller.deleteTemplate);
strategyLibraryRouter.post("/:id/clone", controller.cloneTemplate);
strategyLibraryRouter.post("/:id/archive", controller.archiveTemplate);
strategyLibraryRouter.post("/:id/favorite", controller.toggleFavorite);
strategyLibraryRouter.delete("/:id/favorite", controller.toggleFavorite);
strategyLibraryRouter.get("/:id/export", controller.exportTemplate);
strategyLibraryRouter.post("/:id/use", controller.useTemplate);
strategyLibraryRouter.get("/:id/history", controller.getHistoryTimeline);
strategyLibraryRouter.get("/:id/versions", controller.getVersions);
strategyLibraryRouter.get("/:id/analytics", controller.getAnalytics);
