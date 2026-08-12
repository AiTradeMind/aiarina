import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { sql } from "drizzle-orm";
import { riskRepository } from "../repositories/RiskRepository.ts";
import { riskEngine } from "../engines/RiskEngine.ts";
import { randomUUID } from "crypto";

describe("EP04 Enterprise Risk Engine", () => {
  const orgId = "org_risk_test";
  const portfolioId = "port_risk_001";
  const aiModelId = "ai_risk_001";

  beforeAll(async () => {
    const db = getDb();
    await riskRepository.ensureTables();
    
    // Add policies and metrics
    await db.execute(sql`
       INSERT INTO enterprise_risk_policies (id, organization_id, entity_type, entity_id, risk_type, limit_value, action)
       VALUES 
       (${randomUUID()}, ${orgId}, 'PORTFOLIO', ${portfolioId}, 'EXPOSURE', '100000', 'BLOCK'),
       (${randomUUID()}, ${orgId}, 'AI_MODEL', ${aiModelId}, 'DAILY_LOSS', '5000', 'BLOCK'),
       (${randomUUID()}, ${orgId}, 'AI_MODEL', ${aiModelId}, 'CONSECUTIVE_LOSSES', '3', 'BLOCK')
    `);

    await db.execute(sql`
       INSERT INTO enterprise_risk_metrics (id, organization_id, entity_type, entity_id, current_exposure, daily_loss, consecutive_losses)
       VALUES 
       (${randomUUID()}, ${orgId}, 'PORTFOLIO', ${portfolioId}, '90000', '0', 0),
       (${randomUUID()}, ${orgId}, 'AI_MODEL', ${aiModelId}, '0', '6000', 0)
    `);
  });

  afterAll(async () => {
    const db = getDb();
    await db.execute(sql`DELETE FROM enterprise_risk_policies WHERE organization_id = ${orgId}`);
    await db.execute(sql`DELETE FROM enterprise_risk_metrics WHERE organization_id = ${orgId}`);
    await db.execute(sql`DELETE FROM enterprise_risk_events WHERE organization_id = ${orgId}`);
  });

  it("should allow trade within portfolio exposure limits", async () => {
    const result = await riskEngine.validatePreTrade({
      organizationId: orgId,
      portfolioId: portfolioId,
      symbol: "AAPL",
      side: "BUY",
      quantity: "50",
      price: "100" // 5000 value, current 90000 + 5000 = 95000 <= 100000
    });
    
    expect(result.valid).toBe(true);
  });

  it("should block trade exceeding portfolio exposure limits", async () => {
    const result = await riskEngine.validatePreTrade({
      organizationId: orgId,
      portfolioId: portfolioId,
      symbol: "AAPL",
      side: "BUY",
      quantity: "150",
      price: "100" // 15000 value, current 90000 + 15000 = 105000 > 100000
    });
    
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("exposure limit breached");
  });

  it("should block AI model exceeding daily loss limit", async () => {
    const result = await riskEngine.validatePreTrade({
      organizationId: orgId,
      portfolioId: portfolioId,
      symbol: "AAPL",
      side: "BUY",
      quantity: "10",
      price: "100",
      aiModelId: aiModelId // AI Model has 6000 daily loss, limit is 5000
    });
    
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("AI Model daily loss limit breached");
  });
});
