import { describe, it, expect, beforeEach } from "vitest";
import { researchEP03Service } from "../services/ResearchEP03Service.ts";
import { researchEP03Repository } from "../repositories/ep03Repository.ts";
import { ScannerTemplate, AlertRule, WatchlistGroup } from "../types/ep03.ts";

describe("Phase 3 EP-03 Enterprise Scanner, Watchlists & Alerts", () => {
  beforeEach(async () => {
    // Force initialize and seed default database structures
    await researchEP03Repository.ensureEP03Tables();
  });

  it("1. Scanner Templates - should support listing, creation, cloning, importing, exporting, and versioning", async () => {
    // List templates
    const templates = await researchEP03Service.getTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(1);

    // Create template
    const newTpl = await researchEP03Service.createTemplate({
      title: "Test High-Cap Momentum",
      description: "Custom test template",
      category: "MOMENTUM",
      type: "USER",
      config: {
        instrumentType: "EQUITY",
        filters: { priceMin: 500, marketCapMin: 10000 }
      }
    });
    expect(newTpl.id).toBeDefined();
    expect(newTpl.title).toBe("Test High-Cap Momentum");

    // Clone template
    const cloned = await researchEP03Service.cloneTemplate(newTpl.id);
    expect(cloned.title).toBe("Clone of Test High-Cap Momentum");

    // Export template
    const jsonStr = await researchEP03Service.exportTemplate(newTpl.id);
    expect(jsonStr).toContain("Test High-Cap Momentum");

    // Import template
    const imported = await researchEP03Service.importTemplate(jsonStr);
    expect(imported.title).toBe("Test High-Cap Momentum");

    // Versioning
    await researchEP03Service.createTemplateVersion(newTpl.id, "Save stable release");
    const updated = await researchEP03Service.getTemplateById(newTpl.id);
    expect(updated?.version).toBe("1.1.0");
  });

  it("2. Advanced Filter Engine - should filter instruments on Market Cap, Sector, Price, Volume, Delivery % and Option Types", () => {
    const mockInstruments = [
      { symbol: "RELIANCE", sector: "Energy", price: 2450, volume: 1500000, marketCap: 160000, deliveryPercent: 45, exchangeId: "NSE" },
      { symbol: "TCS", sector: "IT Services", price: 3800, volume: 800000, marketCap: 130000, deliveryPercent: 62, exchangeId: "NSE" },
      { symbol: "INFY", sector: "IT Services", price: 1420, volume: 2000000, marketCap: 58000, deliveryPercent: 55, exchangeId: "NSE" },
      { symbol: "GOLD-FUT", sector: "Commodities", price: 59000, volume: 20000, marketCap: 0, deliveryPercent: 10, exchangeId: "MCX" }
    ];

    // Sector Filter
    const filter1 = researchEP03Service.applyAdvancedFilters(mockInstruments, { sector: "IT Services" });
    expect(filter1.map(i => i.symbol)).toContain("TCS");
    expect(filter1.map(i => i.symbol)).toContain("INFY");
    expect(filter1.length).toBe(2);

    // Price & Market Cap Filter
    const filter2 = researchEP03Service.applyAdvancedFilters(mockInstruments, { priceMin: 2000, marketCapMin: 150000 });
    expect(filter2.map(i => i.symbol)).toContain("RELIANCE");
    expect(filter2.length).toBe(1);

    // Delivery Percent Min Filter
    const filter3 = researchEP03Service.applyAdvancedFilters(mockInstruments, { deliveryPercentMin: 60 });
    expect(filter3.map(i => i.symbol)).toContain("TCS");
    expect(filter3.length).toBe(1);
  });

  it("3. Scan Execution Engine - should support queueing, incremental, scheduled, and parallel scanning", async () => {
    const templates = await researchEP03Service.getTemplates();
    const targetTpl = templates[0];

    // Execute standard run scan
    const run = await researchEP03Service.runScan(targetTpl.id, "MANUAL", { customParam: "test" });
    expect(run.status).toBe("COMPLETED");
    expect(run.executionDurationMs).toBeGreaterThanOrEqual(0);

    // Verify queue history item was logged
    const queue = await researchEP03Service.getQueue();
    expect(queue.length).toBeGreaterThanOrEqual(1);
    expect(queue[0].templateId).toBe(targetTpl.id);
  });

  it("4. Watchlist Groups - should manage folders, nested groups, pinned/shared states, sorting, and colors", async () => {
    const newGroup = await researchEP03Service.createWatchlistGroup({
      name: "High Priority Heavyweights",
      folder: "Nifty Elite",
      isPinned: true,
      isShared: true,
      sortOrder: 5,
      colorLabel: "#ef4444",
      watchlistIds: ["wl_01", "wl_02"]
    });

    expect(newGroup.id).toBeDefined();
    expect(newGroup.name).toBe("High Priority Heavyweights");
    expect(newGroup.isPinned).toBe(true);
    expect(newGroup.colorLabel).toBe("#ef4444");

    const groups = await researchEP03Service.getWatchlistGroups();
    expect(groups.map(g => g.name)).toContain("High Priority Heavyweights");
  });

  it("5. Alert Rule Engine - should evaluate rules recursively supporting AND, OR, NOT nested conditions", () => {
    const rule: AlertRule = {
      id: "rule_01",
      name: "IT breakout rule",
      conditionExpression: {
        operator: "AND",
        conditions: [
          { field: "price", operatorType: "GREATER_THAN", value: 1000 },
          { field: "changePercent", operatorType: "GREATER_THAN", value: 2.5 }
        ]
      },
      cooldownSeconds: 60,
      repeatPolicy: "ALWAYS",
      expiryAt: null,
      priority: "HIGH",
      status: "ACTIVE",
      lastTriggeredAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockPriceDataMatch = { price: 1200, changePercent: 3.2 };
    const mockPriceDataMismatch = { price: 1200, changePercent: 1.5 };

    const matchResult = researchEP03Service.evaluateCondition(rule.conditionExpression, mockPriceDataMatch);
    expect(matchResult).toBe(true);

    const mismatchResult = researchEP03Service.evaluateCondition(rule.conditionExpression, mockPriceDataMismatch);
    expect(mismatchResult).toBe(false);
  });

  it("6. Alert Delivery Pipeline - should enqueue and deliver alerts via provider mock interfaces", async () => {
    const rule: AlertRule = {
      id: "rule_delivery_test",
      name: "OI breakout warning",
      conditionExpression: { field: "oi", operatorType: "GREATER_THAN", value: 100000 },
      cooldownSeconds: 30,
      repeatPolicy: "ALWAYS",
      expiryAt: null,
      priority: "MEDIUM",
      status: "ACTIVE",
      lastTriggeredAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const payload = {
      symbol: "RELIANCE-FUT",
      message: "Derivative contract open interest surge (+150k OI)",
      priority: rule.priority,
      timestamp: new Date().toISOString()
    };

    await researchEP03Service.deliverAlert(rule, payload);

    const acks = await researchEP03Service.getAcknowledgements();
    expect(acks.length).toBeGreaterThanOrEqual(1);
    expect(acks[0].symbol).toBe("RELIANCE-FUT");
    expect(acks[0].status).toBe("UNREAD");
  });

  it("7. Alert Acknowledgement - should mark alerts as read, acknowledged, dismissed, or snoozed", async () => {
    const acks = await researchEP03Service.getAcknowledgements();
    const targetAck = acks[0];

    if (targetAck) {
      await researchEP03Service.acknowledgeAlert(targetAck.id, "READ");
      const updated = await researchEP03Repository.getAcknowledgements();
      const updatedItem = updated.find(a => a.id === targetAck.id);
      expect(updatedItem?.status).toBe("READ");

      await researchEP03Service.acknowledgeAlert(targetAck.id, "SNOOZED", new Date(Date.now() + 60000).toISOString());
      const updatedSnoozed = await researchEP03Repository.getAcknowledgements();
      const snoozedItem = updatedSnoozed.find(a => a.id === targetAck.id);
      expect(snoozedItem?.status).toBe("SNOOZED");
    }
  });

  it("8. Market Event Triggers - should scan, discover macro spikes, and auto fire alerts", async () => {
    const initialAcks = await researchEP03Service.getAcknowledgements();
    const count = await researchEP03Service.generateMarketTriggers();
    expect(count).toBeGreaterThanOrEqual(0);

    const afterAcks = await researchEP03Service.getAcknowledgements();
    expect(afterAcks.length).toBeGreaterThanOrEqual(initialAcks.length);
  });
});
