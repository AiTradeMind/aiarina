import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { orderEngine } from "../services/OrderEngine.ts";
import { orderRepository } from "../repositories/OrderRepository.ts";
import { orderMetricsService } from "../services/OrderMetricsService.ts";
import { orderAnalyticsService } from "../services/OrderAnalyticsService.ts";
import { orderHealthService } from "../services/OrderHealthService.ts";

describe("Order Analytics & Observability", () => {
  const orgId = "org_test_analytics";
  const actorId = 1;

  beforeAll(async () => {
    await orderRepository.ensureOrderTables();
  });

  afterAll(async () => {
    await getDb().execute(require("drizzle-orm").sql`DELETE FROM enterprise_order_metrics WHERE organization_id = ${orgId}`);
    await getDb().execute(require("drizzle-orm").sql`DELETE FROM enterprise_orders WHERE organization_id = ${orgId}`);
  });

  it("should record metrics on order creation", async () => {
    const payload = {
      clientOrderId: "client_analytics_001",
      organizationId: orgId,
      symbol: "MSFT",
      exchange: "NASDAQ",
      side: "BUY" as const,
      orderType: "MARKET" as const,
      quantity: "100",
      price: "350.50"
    };

    const order = await orderEngine.createOrder(actorId, payload);
    
    // Give background async processes a moment if there were any, though ours are awaited
    const metrics = await orderMetricsService.getMetrics(orgId);
    
    expect(metrics).toBeDefined();
    expect(metrics.totalOrders).toBeGreaterThanOrEqual(1);
    expect(metrics.createdOrders).toBeGreaterThanOrEqual(1);
    expect(parseFloat(metrics.totalVolume)).toBeGreaterThanOrEqual(35050);
  });

  it("should record metrics on status transitions", async () => {
    const payload = {
      clientOrderId: "client_analytics_002",
      organizationId: orgId,
      symbol: "NVDA",
      exchange: "NASDAQ",
      side: "SELL" as const,
      orderType: "LIMIT" as const,
      quantity: "50",
      price: "900.00"
    };

    const order = await orderEngine.createOrder(actorId, payload);
    
    // Transition to FILLED
    await orderEngine.transitionStatus(actorId, order.id, orgId, "VALIDATED");
    await orderEngine.transitionStatus(actorId, order.id, orgId, "QUEUED");
    await orderEngine.transitionStatus(actorId, order.id, orgId, "PARTIALLY_FILLED");
    await orderEngine.transitionStatus(actorId, order.id, orgId, "FILLED");

    const metrics = await orderMetricsService.getMetrics(orgId);
    expect(metrics.filledOrders).toBeGreaterThanOrEqual(1);
  });

  it("should handle validation failures and record them", async () => {
    const payload = {
      clientOrderId: "client_analytics_003",
      organizationId: orgId,
      symbol: "INVALID_SYMBOL", // Will be OK for now since no symbol check, let's fail quantity
      exchange: "NASDAQ",
      side: "BUY" as const,
      orderType: "MARKET" as const,
      quantity: "2000000", // > MAX_QUANTITY
      price: "100"
    };

    await expect(orderEngine.createOrder(actorId, payload)).rejects.toThrow(/Policy Violation: Quantity exceeds/);

    const metrics = await orderMetricsService.getMetrics(orgId);
    expect(metrics.validationFailures).toBeGreaterThanOrEqual(1);
  });

  it("should generate a health report", async () => {
    const health = await orderHealthService.getHealth(orgId);
    expect(health).toBeDefined();
    expect(health.status).toBeDefined();
    expect(health.throughput).toBeGreaterThanOrEqual(2);
    expect(health.successRate).toBeDefined();
    expect(health.errorRate).toBeDefined();
  });

  it("should aggregate dashboard data", async () => {
    const dashboard = await orderAnalyticsService.getDashboard(orgId);
    expect(dashboard).toBeDefined();
    expect(dashboard.dailySummary).toBeDefined();
    expect(dashboard.distributions).toBeDefined();
    expect(dashboard.distributions.side.length).toBeGreaterThanOrEqual(2); // BUY and SELL
  });
});
