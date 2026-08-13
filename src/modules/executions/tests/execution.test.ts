import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { executionService } from "../services/ExecutionService.ts";
import { executionRepository } from "../repositories/ExecutionRepository.ts";
import { orderRepository } from "../../orders/repositories/OrderRepository.ts";
import { auditRepository } from "../../audit/repositories/AuditRepository.ts";
import { sql } from "drizzle-orm";

describe("Enterprise Paper Trading Execution Engine", () => {
  const orgId = "org_exec_test";
  const actorId = 1;
  let validatedOrderId: string;
  let rejectedOrderId: string;

  beforeAll(async () => {
    const db = getDb();
    await executionRepository.ensureExecutionTables();
    await orderRepository.ensureOrderTables();
    await auditRepository.ensureAuditTables();
    
    await db.execute(sql`DELETE FROM enterprise_execution_history`);
    await db.execute(sql`DELETE FROM enterprise_executions`);
    await db.execute(sql`DELETE FROM enterprise_orders WHERE organization_id = ${orgId}`);

    // Setup org
    await db.execute(sql`
      INSERT INTO organizations (id, name, description) 
      VALUES (${orgId}, 'Test Exec Org', 'Test')
      ON CONFLICT DO NOTHING
    `);

    // Setup positions for price resolution
    await db.execute(sql`
      INSERT INTO positions (portfolio_id, ticker, quantity, market_price)
      VALUES (NULL, 'AAPL', 100, 150.25)
    `);

    // Setup orders
    const order1 = await orderRepository.createOrder({
      id: "ord_exec_001",
      clientOrderId: "client_ord_001",
      organizationId: orgId,
      symbol: "AAPL",
      exchange: "NASDAQ",
      side: "BUY",
      orderType: "MARKET",
      quantity: "10",
      status: "VALIDATED"
    } as any);
    validatedOrderId = order1.id;

    const order2 = await orderRepository.createOrder({
      id: "ord_exec_002",
      clientOrderId: "client_ord_002",
      organizationId: orgId,
      symbol: "MSFT",
      exchange: "NASDAQ",
      side: "BUY",
      orderType: "MARKET",
      quantity: "10",
      status: "REJECTED"
    } as any);
    rejectedOrderId = order2.id;
  });

  afterAll(async () => {
    const db = getDb();
    await db.execute(sql`DELETE FROM enterprise_execution_history`);
    await db.execute(sql`DELETE FROM enterprise_executions`);
    await db.execute(sql`DELETE FROM enterprise_orders WHERE organization_id = ${orgId}`);
  });

  it("should fail to execute a rejected order", async () => {
    await expect(executionService.runExecution(actorId, {
      orderId: rejectedOrderId,
      organizationId: orgId
    })).rejects.toThrow(/not eligible for execution/);
  });

  it("should successfully execute a validated market order and resolve price", async () => {
    const execution = await executionService.runExecution(actorId, {
      orderId: validatedOrderId,
      organizationId: orgId
    });

    expect(execution).toBeDefined();
    expect(execution.status).toBe('FILLED');
    expect(execution.price).toBe('150.25'); // From our positions mock

    const history = await executionService.getExecutionHistory(execution.id);
    expect(history.length).toBeGreaterThanOrEqual(2); // PENDING, MATCHING, FILLED
  });

  it("should generate audit records", async () => {
    const db = getDb();
    const audits = await db.execute(sql`
      SELECT * FROM audit_records 
      WHERE organization_id = ${orgId} AND resource_type = 'EXECUTION'
    `);
    const count = (audits as any).rows?.length ?? (audits as any).length ?? 0;
    expect(count).toBeGreaterThan(0);
  });
});
