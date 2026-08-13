import { Router } from "express";
import { MarketController } from "../controllers/index.ts";

export const marketRouter = Router();
const marketCtrl = new MarketController();

// ====================================================
// EP04 MODULE 21 API ENDPOINTS
// ====================================================
marketRouter.get("/market/exchanges", (req, res, next) => marketCtrl.getExchanges(req, res, next));
marketRouter.get("/market/instruments", (req, res, next) => marketCtrl.getInstruments(req, res, next));
marketRouter.get("/market/symbols", (req, res, next) => marketCtrl.getSymbols(req, res, next));
marketRouter.get("/market/expiry", (req, res, next) => marketCtrl.getExpiry(req, res, next));
marketRouter.get("/market/lot-size", (req, res, next) => marketCtrl.getLotSize(req, res, next));
marketRouter.get("/market/tick-size", (req, res, next) => marketCtrl.getTickSize(req, res, next));
marketRouter.get("/market/candles", (req, res, next) => marketCtrl.getCandles(req, res, next));
marketRouter.get("/market/stream", (req, res, next) => marketCtrl.streamMarketData(req, res, next));
marketRouter.get("/market/feed", (req, res, next) => marketCtrl.getFeed(req, res, next));
marketRouter.get("/market/cache", (req, res, next) => marketCtrl.getCache(req, res, next));

marketRouter.post("/market/reset", (req, res, next) => marketCtrl.resetMarketData(req, res, next));

// Extra operations for synchronization, connectivity, event logs, classifications
marketRouter.post("/market/reconnect", (req, res, next) => marketCtrl.triggerReconnect(req, res, next));
marketRouter.post("/market/disconnect", (req, res, next) => marketCtrl.triggerDisconnect(req, res, next));
marketRouter.post("/market/failover", (req, res, next) => marketCtrl.toggleFailover(req, res, next));
marketRouter.post("/market/sync", (req, res, next) => marketCtrl.synchronize(req, res, next));
marketRouter.get("/market/events", (req, res, next) => marketCtrl.getEvents(req, res, next));
marketRouter.get("/market/metadata", (req, res, next) => marketCtrl.getMetadata(req, res, next));
marketRouter.get("/market/isins", (req, res, next) => marketCtrl.getIsins(req, res, next));
marketRouter.get("/market/derivatives", (req, res, next) => marketCtrl.getDerivatives(req, res, next));
marketRouter.get("/market/sectors", (req, res, next) => marketCtrl.getSectors(req, res, next));
marketRouter.post("/market/cache/clear", (req, res, next) => marketCtrl.clearCache(req, res, next));
marketRouter.post("/market/instruments/toggle", (req, res, next) => marketCtrl.toggleInstrumentStatus(req, res, next));
marketRouter.post("/market/feed/update", (req, res, next) => marketCtrl.updateFeedEngine(req, res, next));

// ====================================================
// EP04.1 ENTERPRISE COMPLETE ROUTES
// ====================================================
marketRouter.get("/market/versions", (req, res, next) => marketCtrl.getVersions(req, res, next));
marketRouter.post("/market/rollback", (req, res, next) => marketCtrl.rollbackToVersion(req, res, next));
marketRouter.get("/market/feed-quality", (req, res, next) => marketCtrl.getFeedQualityMetrics(req, res, next));
marketRouter.post("/market/feed-quality/simulate", (req, res, next) => marketCtrl.simulateFeedMetricsUpdate(req, res, next));
marketRouter.post("/market/instruments/transition", (req, res, next) => marketCtrl.transitionInstrumentState(req, res, next));
marketRouter.get("/market/instruments/lifecycle-history", (req, res, next) => marketCtrl.getLifecycleHistory(req, res, next));
marketRouter.get("/market/proposals", (req, res, next) => marketCtrl.getProposals(req, res, next));
marketRouter.post("/market/proposals", (req, res, next) => marketCtrl.submitProposal(req, res, next));
marketRouter.post("/market/proposals/:id/validate", (req, res, next) => marketCtrl.validateProposal(req, res, next));
marketRouter.post("/market/proposals/:id/approve", (req, res, next) => marketCtrl.approveProposal(req, res, next));
marketRouter.post("/market/proposals/:id/publish", (req, res, next) => marketCtrl.publishProposal(req, res, next));
marketRouter.get("/market/lineages", (req, res, next) => marketCtrl.getLineages(req, res, next));
marketRouter.get("/market/audit-chain", (req, res, next) => marketCtrl.getAuditChain(req, res, next));
marketRouter.get("/market/dependencies", (req, res, next) => marketCtrl.getDependencies(req, res, next));
marketRouter.post("/market/dependencies", (req, res, next) => marketCtrl.registerDependency(req, res, next));
marketRouter.get("/market/certificates", (req, res, next) => marketCtrl.getCertificates(req, res, next));
marketRouter.post("/market/certificates", (req, res, next) => marketCtrl.generateCertificate(req, res, next));
marketRouter.get("/market/recovery-jobs", (req, res, next) => marketCtrl.getRecoveryJobs(req, res, next));
marketRouter.post("/market/recovery/heal", (req, res, next) => marketCtrl.triggerSelfHealing(req, res, next));

// ====================================================
// PRESERVED LEGACY ENDPOINTS (BACKWARD COMPATIBILITY)
// ====================================================
marketRouter.get("/market/status", (req, res, next) => marketCtrl.getMarketStatus(req, res, next));
marketRouter.get("/exchanges", (req, res, next) => marketCtrl.getExchanges(req, res, next));
marketRouter.get("/instrument-types", (req, res, next) => marketCtrl.getInstrumentTypes(req, res, next));
marketRouter.get("/instruments", (req, res, next) => marketCtrl.getLegacyInstruments(req, res, next));
marketRouter.get("/instruments/search", (req, res, next) => marketCtrl.getLegacyInstruments(req, res, next));
marketRouter.get("/instruments/:id", (req, res, next) => marketCtrl.getInstrumentById(req, res, next));
