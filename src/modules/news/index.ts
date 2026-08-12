export { newsRouter } from "./routes/index.ts";
export { newsRepo, NewsRepository } from "./repositories/NewsRepository.ts";
export {
  newsService,
  NewsService,
  NewsRegistry,
  NewsHealth,
  NewsLifecycle
} from "./services/NewsService.ts";
export { newsController, NewsController } from "./controllers/NewsController.ts";
export * from "./types/index.ts";
