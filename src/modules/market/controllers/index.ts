import { Request, Response, NextFunction } from "express";
import { MarketService } from "../services/index.ts";
import { InstrumentSearchFilters } from "../types/index.ts";

const marketService = new MarketService();

export class MarketController {
  // ====================================================
  // EP04 MODULE 21 API ENDPOINTS
  // ====================================================

  // GET /api/market/exchanges
  async getExchanges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getExchangeRegistries();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/instruments
  async getInstruments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getInstrumentMasters();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/symbols
  async getSymbols(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getSymbolMasters();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/expiry
  async getExpiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getExpiryMasters();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/lot-size
  async getLotSize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getLotSizes();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/tick-size
  async getTickSize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getTickSizes();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/candles
  async getCandles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const symbol = (req.query.symbol as string) || "RELIANCE.NS";
      const timeframe = (req.query.timeframe as string) || "1D";
      const result = await marketService.getMarketCandles(symbol, timeframe);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/stream
  async streamMarketData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const symbol = (req.query.symbol as string) || "RELIANCE.NS";
      const timeframe = (req.query.timeframe as string) || "1D";

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      if (typeof (res as any).flushHeaders === "function") {
        (res as any).flushHeaders();
      }

      const health = await marketService.getMarketCandles(symbol, timeframe);

      if (health.status === "NOT_CONFIGURED" || health.status === "DISCONNECTED") {
        res.write(`event: status\ndata: ${JSON.stringify({ status: health.status, symbol, timeframe })}\n\n`);
      } else {
        res.write(`event: status\ndata: ${JSON.stringify({ status: "CONNECTED", symbol, timeframe })}\n\n`);
      }

      const interval = setInterval(() => {
        res.write(`: heartbeat\n\n`);
      }, 15000);

      req.on("close", () => {
        clearInterval(interval);
      });
    } catch (error: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/market/feed
  async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const engine = await marketService.getMarketFeedEngine();
      const connections = await marketService.getMarketConnectivities();
      res.status(200).json({
        engine,
        connections
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/cache
  async getCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = req.query.key as string;
      if (key) {
        const val = await marketService.getCache(key);
        res.status(200).json({ key, value: val });
        return;
      }
      res.status(200).json({ message: "No cache key provided. Set '?key=xyz'" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // ====================================================
  // EXTRA OPERATIONAL EP04 ENDPOINTS
  // ====================================================

  // POST /api/market/reconnect
  async triggerReconnect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { exchangeId } = req.body;
      if (!exchangeId) {
        res.status(400).json({ error: "exchangeId is required" });
        return;
      }
      await marketService.triggerReconnect(exchangeId);
      res.status(200).json({ success: true, message: `Reconnected successfully to ${exchangeId}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/disconnect
  async triggerDisconnect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { exchangeId } = req.body;
      if (!exchangeId) {
        res.status(400).json({ error: "exchangeId is required" });
        return;
      }
      await marketService.triggerDisconnect(exchangeId);
      res.status(200).json({ success: true, message: `Disconnected ${exchangeId} feeds` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/failover
  async toggleFailover(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { exchangeId, active } = req.body;
      if (!exchangeId) {
        res.status(400).json({ error: "exchangeId is required" });
        return;
      }
      await marketService.toggleFailover(exchangeId, active);
      res.status(200).json({ success: true, message: `Failover updated for ${exchangeId} to ${active}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/sync
  async synchronize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body;
      if (!payload || !payload.instruments) {
        res.status(400).json({ error: "Invalid sync package format. Missing 'instruments' parameter." });
        return;
      }
      const result = await marketService.synchronizeMarketMasterData(payload);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/events
  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getMarketEvents();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/metadata
  async getMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getMarketMetadata();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/isins
  async getIsins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getIsinMasters();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/derivatives
  async getDerivatives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getDerivativeMasters();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/sectors
  async getSectors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getSectors();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/cache/clear
  async clearCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await marketService.clearCache();
      res.status(200).json({ success: true, message: "Cache invalidated and flushed successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/instruments/toggle
  async toggleInstrumentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instrumentId, status } = req.body;
      if (!instrumentId || !status) {
        res.status(400).json({ error: "instrumentId and status are required" });
        return;
      }
      if (status === 'ACTIVE') {
        await marketService.enableInstrument(instrumentId);
      } else {
        await marketService.disableInstrument(instrumentId);
      }
      res.status(200).json({ success: true, message: `Status updated to ${status} for ${instrumentId}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/feed/update
  async updateFeedEngine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      await marketService.updateFeedEngine(data);
      res.status(200).json({ success: true, message: "Feed Engine configuration applied" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // ====================================================
  // EP04.1 ENTERPRISE COMPLETE API ENDPOINTS
  // ====================================================

  // GET /api/market/versions
  async getVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getVersions();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/rollback
  async rollbackToVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { versionId, operator } = req.body;
      if (!versionId || !operator) {
        res.status(400).json({ error: "versionId and operator are required" });
        return;
      }
      const result = await marketService.rollbackToVersion(versionId, operator);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/feed-quality
  async getFeedQualityMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getFeedQualityMetrics();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/feed-quality/simulate
  async simulateFeedMetricsUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { exchangeId, latencyMs, packetLoss } = req.body;
      if (!exchangeId || latencyMs === undefined || packetLoss === undefined) {
        res.status(400).json({ error: "exchangeId, latencyMs and packetLoss are required" });
        return;
      }
      await marketService.simulateFeedMetricsUpdate(exchangeId, latencyMs, packetLoss);
      res.status(200).json({ success: true, message: `Simulated metrics updated for ${exchangeId}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/instruments/transition
  async transitionInstrumentState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instrumentId, toState, reason, operator } = req.body;
      if (!instrumentId || !toState || !reason || !operator) {
        res.status(400).json({ error: "instrumentId, toState, reason and operator are required" });
        return;
      }
      await marketService.transitionInstrumentState(instrumentId, toState, reason, operator);
      res.status(200).json({ success: true, message: `Transitioned instrument ${instrumentId} to state ${toState}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/instruments/lifecycle-history
  async getLifecycleHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instrumentId = req.query.instrumentId as string;
      const result = await marketService.getLifecycleHistory(instrumentId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/proposals
  async getProposals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getProposals();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/proposals
  async submitProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { payload, operator } = req.body;
      if (!payload || !operator) {
        res.status(400).json({ error: "payload and operator are required" });
        return;
      }
      const result = await marketService.submitProposal(payload, operator);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/proposals/:id/validate
  async validateProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const result = await marketService.validateProposal(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/proposals/:id/approve
  async approveProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const { operator } = req.body;
      if (!operator) {
        res.status(400).json({ error: "operator is required to approve" });
        return;
      }
      await marketService.approveProposal(id, operator);
      res.status(200).json({ success: true, message: `Approved proposal ${id}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/proposals/:id/publish
  async publishProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const { operator } = req.body;
      if (!operator) {
        res.status(400).json({ error: "operator is required to publish" });
        return;
      }
      const result = await marketService.publishAndSynchronizeProposal(id, operator);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/lineages
  async getLineages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getLineages();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/audit-chain
  async getAuditChain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getAuditChain();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/dependencies
  async getDependencies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getDependencies();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/dependencies
  async registerDependency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workspace } = req.body;
      if (!workspace) {
        res.status(400).json({ error: "workspace name is required" });
        return;
      }
      await marketService.registerDependency(workspace);
      res.status(201).json({ success: true, message: `Registered workspace: ${workspace}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/certificates
  async getCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getCertificates();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/certificates
  async generateCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, exchangeId, feedUrl } = req.body;
      if (!type) {
        res.status(400).json({ error: "certificate type is required" });
        return;
      }
      const result = await marketService.generateCertificate(type, exchangeId, feedUrl);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/market/recovery-jobs
  async getRecoveryJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getRecoveryJobs();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/market/recovery/heal
  async triggerSelfHealing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { failureType, operator } = req.body;
      if (!failureType || !operator) {
        res.status(400).json({ error: "failureType and operator are required" });
        return;
      }
      const result = await marketService.triggerSelfHealing(failureType, operator);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // ====================================================
  // PRESERVED LEGACY CONTROLLERS (MAPPED TO OLD API ENDPOINTS)
  // ====================================================
  async getInstrumentTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketService.getInstrumentTypes();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLegacyInstruments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: InstrumentSearchFilters = {
        symbol: req.query.symbol as string,
        name: req.query.name as string,
        exchangeId: req.query.exchangeId as string,
        typeId: req.query.typeId as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };
      const result = await marketService.getInstruments(filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getInstrumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await marketService.getInstrumentById(id);
      if (!result) {
        res.status(404).json({ error: "Instrument not found" });
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMarketStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exchangeId = req.query.exchangeId as string;
      const result = await marketService.getMarketStatus(exchangeId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async resetMarketData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { confirm, resetState } = req.body || {};
      const result = await marketService.resetMarketTestData({
        confirm: Boolean(confirm),
        resetState: resetState || "OFF"
      });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Market reset operation failed"
      });
    }
  }
}
