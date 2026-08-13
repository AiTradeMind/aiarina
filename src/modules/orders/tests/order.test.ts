import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { sql } from "drizzle-orm";
import { orderEngine } from "../services/OrderEngine.ts";
import { orderRepository } from "../repositories/OrderRepository.ts";
import { auditRepository } from "../../audit/repositories/AuditRepository.ts";
import { CreateOrderPayload } from "../types/index.ts";

describe("Enterprise Order Management Foundation", () => {
  const orgId = "org_order_test";
  const actorId = 123;
  let createdOrderId: string;

  beforeAll(async () => {
    const db = getDb();
    await orderRepository.ensureOrderTables();
    await auditRepository.ensureAuditTables();
    
    await db.execute(sql`
      INSERT INTO organizations (id, name, description)
      VALUES (${orgId}, 'Order Test Org', 'Org for order testing')
      ON CONFLICT (id) DO NOTHING;
    `);
    
    await db.execute(sql`
      INSERT INTO users (id, email, role)
      VALUES (${actorId}, 'order_tester@test.com', 'trader')
      ON CONFLICT (id) DO NOTHING;
    `);

    await db.execute(sql`DELETE FROM enterprise_orders WHERE organization_id = ${orgId}`);
    await db.execute(sql`DELETE FROM audit_records WHERE organization_id = ${orgId}`);
  });

  afterAll(async () => {
    const db = getDb();
    await db.execute(sql`DELETE FROM enterprise_orders WHERE organization_id = ${orgId}`);
    await db.execute(sql`DELETE FROM audit_records WHERE organization_id = ${orgId}`);
  });

  it("should create a new order and generate audit log", async () => {
    const payload: CreateOrderPayload = {
      clientOrderId: "client_order_001",
      organizationId: orgId,
      symbol: "AAPL",
      exchange: "NASDAQ",
      side: "BUY",
      orderType: "LIMIT",
      quantity: "100.5",
      price: "150.25",
    };

    const order = await orderEngine.createOrder(actorId, payload);
    createdOrderId = order.id;

    expect(order.id).toBeDefined();
    expect(order.status).toBe("CREATED");
    expect(order.version).toBe(1);
    expect(order.clientOrderId).toBe("client_order_001");

    // Verify audit record was created
    const audits = await auditRepository.searchRecords({
      organizationId: orgId,
      resourceType: "ORDER",
      resourceId: order.id
    });
    expect(audits.length).toBeGreaterThan(0);
    expect(audits[0].action).toBe("ORDER_CREATED");
  });

  it("should fail validation on invalid order data", async () => {
    const payload: CreateOrderPayload = {
      clientOrderId: "client_order_002",
      organizationId: orgId,
      symbol: "AAPL",
      exchange: "NASDAQ",
      side: "BUY",
      orderType: "LIMIT",
      quantity: "-10", // Invalid quantity
      price: "150.25",
    };

    await expect(orderEngine.createOrder(actorId, payload)).rejects.toThrow(/Validation Error: quantity must be a positive number/);
  });

  it("should enforce unique clientOrderId per tenant", async () => {
    const payload: CreateOrderPayload = {
      clientOrderId: "client_order_001", // Duplicate
      organizationId: orgId,
      symbol: "MSFT",
      exchange: "NASDAQ",
      side: "SELL",
      orderType: "MARKET",
      quantity: "50",
    };

    await expect(orderEngine.createOrder(actorId, payload)).rejects.toThrow(/Duplicate clientOrderId/);
  });

  it("should allow state transitions and generate audit logs", async () => {
    const updatedOrder = await orderEngine.transitionStatus(actorId, createdOrderId, orgId, "VALIDATED");
    
    expect(updatedOrder.status).toBe("VALIDATED");
    expect(updatedOrder.version).toBe(2);

    const audits = await auditRepository.searchRecords({
      organizationId: orgId,
      resourceType: "ORDER",
      resourceId: createdOrderId
    });

    expect(audits.some(a => a.action === "ORDER_STATUS_CHANGED")).toBe(true);
  });

  it("should reject invalid state transitions", async () => {
    // Current state is VALIDATED
    // Cannot jump straight to FILLED from VALIDATED
    await expect(orderEngine.transitionStatus(actorId, createdOrderId, orgId, "FILLED")).rejects.toThrow(/State Transition Error/);
  });

  it("should maintain immutable version history", async () => {
    const { orderVersionService } = await import("../services/OrderVersionService.ts");
    const versions = await orderVersionService.getOrderVersions(createdOrderId);
    
    // 1 version from create, 1 from transition to VALIDATED
    expect(versions.length).toBeGreaterThanOrEqual(2);
    expect(versions[0].versionNumber).toBe(2);
    expect(versions[1].versionNumber).toBe(1);
    expect(versions[0].previousVersionId).toBe(1);
  });

  it("should support idempotency keys to prevent duplicate creation", async () => {
    const { orderService } = await import("../services/OrderService.ts");
    const idempotencyKey = "test_idemp_123";
    const payload = {
      clientOrderId: "client_order_002",
      organizationId: orgId,
      symbol: "GOOGL",
      exchange: "NASDAQ",
      side: "BUY" as const,
      orderType: "MARKET" as const,
      quantity: "20",
    };

    // First request
    const order1 = await orderService.createOrder(actorId, payload, idempotencyKey);
    expect(order1.id).toBeDefined();

    // Second request with same key
    const order2 = await orderService.createOrder(actorId, payload, idempotencyKey);
    expect(order2.id).toEqual(order1.id); // Should return the exact same object

    // If payload changes but key is same, should throw
    const payloadDifferent = { ...payload, quantity: "30" };
    await expect(orderService.createOrder(actorId, payloadDifferent, idempotencyKey)).rejects.toThrow(/Idempotency Error/);
  });
});
