import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { sql } from "drizzle-orm";
import { portfolioService } from "../services/PortfolioService.ts";
import { portfolioRepository } from "../repositories/PortfolioRepository.ts";
import { positionRepository } from "../repositories/PositionRepository.ts";

describe("Enterprise Portfolio & Position Engine", () => {
  const orgId = "org_portfolio_test";
  const portfolioId = "port_001";
  
  beforeAll(async () => {
    const db = getDb();
    await portfolioRepository.ensurePortfolioTables();
    await positionRepository.ensurePositionTables();
    
    // Setup org
    await db.execute(sql`
      INSERT INTO organizations (id, name, description) 
      VALUES (${orgId}, 'Test Portfolio Org', 'Test')
      ON CONFLICT DO NOTHING
    `);

    // Create Initial Portfolio
    await portfolioRepository.createPortfolio({
      id: portfolioId,
      organizationId: orgId,
      cashBalance: "100000",
      availableCash: "100000",
      type: "PAPER"
    });
  });

  afterAll(async () => {
    const db = getDb();
    await db.execute(sql`DELETE FROM enterprise_position_history`);
    await db.execute(sql`DELETE FROM enterprise_positions`);
    await db.execute(sql`DELETE FROM enterprise_portfolio_snapshots`);
    await db.execute(sql`DELETE FROM enterprise_portfolios WHERE organization_id = ${orgId}`);
  });

  it("should process a BUY execution and open a position", async () => {
    await portfolioService.handleExecution({
      organizationId: orgId,
      portfolioId: portfolioId,
      symbol: "AAPL",
      assetClass: "NSE_STOCKS",
      side: "BUY",
      quantity: "10",
      price: "150.00",
      executionId: "exec_1"
    });

    const summary = await portfolioService.getPortfolioSummary(portfolioId, orgId);
    
    // Cash should decrease by 1500 (10 * 150)
    expect(summary.portfolio.cashBalance).toBe("98500");
    
    // Equity should remain 100000 (98500 cash + 1500 position)
    expect(summary.portfolio.equity).toBe("100000");

    expect(summary.positions.length).toBe(1);
    expect(summary.positions[0].symbol).toBe("AAPL");
    expect(summary.positions[0].openQuantity).toBe("10");
    expect(summary.positions[0].averagePrice).toBe("150.00");
  });

  it("should process a SELL execution and reduce the position", async () => {
    await portfolioService.handleExecution({
      organizationId: orgId,
      portfolioId: portfolioId,
      symbol: "AAPL",
      assetClass: "NSE_STOCKS",
      side: "SELL",
      quantity: "5",
      price: "160.00", // Sold higher
      executionId: "exec_2"
    });

    const summary = await portfolioService.getPortfolioSummary(portfolioId, orgId);
    
    // Cash should increase by 800 (5 * 160)
    expect(summary.portfolio.cashBalance).toBe("99300"); // 98500 + 800
    
    // Equity should be updated. Position market value = 5 * 160 = 800. Equity = 99300 + 800 = 100100
    expect(summary.portfolio.equity).toBe("100100");

    expect(summary.positions.length).toBe(1);
    expect(summary.positions[0].openQuantity).toBe("5");
    
    // Realized PnL = (160 - 150) * 5 = 50
    expect(summary.positions[0].realizedPnl).toBe("50");
  });

  it("should generate a portfolio snapshot", async () => {
    const history = await portfolioService.getPortfolioHistory(portfolioId);
    expect(history.length).toBeGreaterThan(0);
    expect(history[history.length - 1].equity).toBe("100100");
  });

  it("should prevent debit if insufficient cash", async () => {
    await expect(portfolioService.handleExecution({
      organizationId: orgId,
      portfolioId: portfolioId,
      symbol: "MSFT",
      assetClass: "NSE_STOCKS",
      side: "BUY",
      quantity: "1000",
      price: "200.00", // 200,000 required, only ~99300 available
      executionId: "exec_3"
    })).rejects.toThrow(/Insufficient funds/);
  });
});
