import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { sql } from "drizzle-orm";
import { tradeRepository } from "../repositories/TradeRepository.ts";
import { tradeJournalEngine } from "../engines/TradeJournalEngine.ts";
import { pnlEngine } from "../engines/PnLEngine.ts";
import { TradeCostConfig } from "../types/ep05.ts";

describe("EP05 Enterprise Trade Journal & PnL Engine", () => {
  const orgId = "org_tj_test";
  const portfolioId = "port_tj_001";
  
  const config: TradeCostConfig = {
    enableBrokerage: true,
    brokerageRate: 0.0003,
    enableExchangeCharges: false,
    exchangeChargeRate: 0,
    enableSTT: true,
    sttRate: 0.001,
    enableGST: false,
    gstRate: 0,
    enableSebi: false,
    sebiRate: 0,
    enableStampDuty: false,
    stampDutyRate: 0
  };

  beforeAll(async () => {
    const db = getDb();
    await tradeRepository.ensureTables();
    
    // Check if org exists, else create
    await db.execute(sql`
      INSERT INTO organizations (id, name, description) 
      VALUES (${orgId}, 'Test TJ Org', 'Test')
      ON CONFLICT DO NOTHING
    `);
  });

  afterAll(async () => {
    const db = getDb();
    await db.execute(sql`DELETE FROM enterprise_trade_ledger`);
    await db.execute(sql`DELETE FROM enterprise_trade_journal WHERE organization_id = ${orgId}`);
  });

  it("should calculate correct costs for BUY", () => {
    // 10 qty * 100 price = 1000 value
    // Brokerage: 1000 * 0.0003 = 0.3
    // STT (only on SELL for testing logic): 0
    const costs = pnlEngine.calculateCosts(10, 100, "BUY", config);
    expect(costs).toBeCloseTo(0.3);
  });

  it("should calculate correct costs for SELL", () => {
    // 10 qty * 100 price = 1000 value
    // Brokerage: 1000 * 0.0003 = 0.3
    // STT: 1000 * 0.001 = 1
    // Total = 1.3
    const costs = pnlEngine.calculateCosts(10, 100, "SELL", config);
    expect(costs).toBeCloseTo(1.3);
  });

  it("should calculate correct PnL for CLOSE action", () => {
    const result = pnlEngine.calculateRealizedPnl(100, 110, 10, "BUY", 1.3);
    // Gross: (110 - 100) * 10 = 100
    // Net: 100 - 1.3 = 98.7
    expect(result.grossPnl).toBe(100);
    expect(result.netPnl).toBe(98.7);
  });

  it("should log a TRADE OPEN journal entry and create a ledger record for costs", async () => {
    const journal = await tradeJournalEngine.logTrade({
      organizationId: orgId,
      portfolioId: portfolioId,
      positionId: "pos_tj_1",
      executionId: "exec_tj_1",
      symbol: "RELIANCE",
      action: "OPEN",
      side: "BUY",
      quantity: "100",
      price: "2500",
      status: "COMPLETED",
      config
    });

    expect(journal.symbol).toBe("RELIANCE");
    expect(journal.action).toBe("OPEN");
    
    // value = 250,000
    // costs = 250,000 * 0.0003 = 75
    expect(parseFloat(journal.transactionCosts)).toBe(75);
    expect(parseFloat(journal.netPnl)).toBe(-75); // Net PnL is initially just negative costs
    expect(parseFloat(journal.grossPnl)).toBe(0);
  });

  it("should log a TRADE CLOSE journal entry with positive PnL and ledger updates", async () => {
    const journal = await tradeJournalEngine.logTrade({
      organizationId: orgId,
      portfolioId: portfolioId,
      positionId: "pos_tj_1",
      executionId: "exec_tj_2",
      symbol: "RELIANCE",
      action: "CLOSE",
      side: "SELL",
      quantity: "100",
      price: "2600",
      entryPrice: "2500",
      status: "COMPLETED",
      config
    });

    expect(journal.action).toBe("CLOSE");
    
    // value = 260,000
    // costs = 260,000 * 0.0003 + 260,000 * 0.001 = 78 + 260 = 338
    // gross = (2600 - 2500) * 100 = 10000
    // net = 10000 - 338 = 9662
    expect(parseFloat(journal.transactionCosts)).toBeCloseTo(338);
    expect(parseFloat(journal.grossPnl)).toBe(10000);
    expect(parseFloat(journal.netPnl)).toBeCloseTo(9662);
  });
});
