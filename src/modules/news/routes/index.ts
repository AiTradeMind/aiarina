import { Router } from "express";
import { newsController } from "../controllers/NewsController.ts";

export const newsRouter = Router();

// News Routing
newsRouter.get("/news", newsController.getNews);
newsRouter.get("/news/latest", newsController.getLatest);
newsRouter.get("/news/search", newsController.search);
newsRouter.get("/news/company/:symbol", newsController.getByCompany);
newsRouter.get("/news/categories", newsController.getCategories);
newsRouter.get("/news/health", newsController.getHealth);

// Corporate Actions Routing
newsRouter.get("/corporate-actions", newsController.getCorporateActions);
newsRouter.get("/corporate-actions/:symbol", newsController.getCorporateActionsBySymbol);

// Economic Calendar Routing
newsRouter.get("/economic-calendar", newsController.getEconomicCalendar);
newsRouter.get("/economic-calendar/upcoming", newsController.getUpcomingEconomicEvents);
