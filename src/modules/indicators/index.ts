export { indicatorsRouter } from "./routes/index.ts";
export { IndicatorRepository, indicatorRepo } from "./repositories/IndicatorRepository.ts";
export { 
  IndicatorService, 
  indicatorService,
  IndicatorRegistry,
  IndicatorMetadata,
  IndicatorHealth,
  IndicatorLifecycle 
} from "./services/IndicatorService.ts";
export { SignalEngine, signalEngine } from "./services/SignalEngine.ts";
export * from "./types/index.ts";
