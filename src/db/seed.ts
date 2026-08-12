import { getDb, closeDb } from "./client.ts";
import { 
  users, 
  portfolios, 
  trades, 
  aiResearchReports, 
  administrationLogs, 
  organizations, 
  roles, 
  permissions, 
  rolePermissions, 
  memberships,
  exchanges,
  instrumentTypes,
  instruments,
  marketStatus
} from "./schema.ts";
import bcryptjs from "bcryptjs";

async function seed() {
  console.log("Initializing database seed for AIARINA 1.0...");
  const db = getDb();

  const adminHash = bcryptjs.hashSync("adminpassword123", 10);
  const traderHash = bcryptjs.hashSync("traderpassword123", 10);
  const analystHash = bcryptjs.hashSync("analystpassword123", 10);

  try {
    // 1. Seed Organizations
    console.log("Seeding organizations...");
    await db.insert(organizations).values([
      { id: "org-1", name: "AIARINA Capital", description: "Enterprise Multi-Asset Quantitative Fund" },
      { id: "org-2", name: "Alpha Tactical Asset Management", description: "High-frequency tactical portfolio manager" },
      { id: "org-3", name: "Long-Only Watcher LLC", description: "Passive equity research and market analyst watcher" }
    ]);

    // 2. Seed Roles and Permissions
    console.log("Seeding roles and permissions...");
    await db.insert(roles).values([
      { name: "admin", description: "Enterprise system administrator" },
      { name: "trader", description: "Institutional trader" },
      { name: "analyst", description: "Financial analyst" }
    ]);

    await db.insert(permissions).values([
      { name: "read", description: "General read access" },
      { name: "write", description: "General write access" },
      { name: "execute", description: "Trade execution access" },
      { name: "admin", description: "Administrative access" }
    ]);

    await db.insert(rolePermissions).values([
      { roleName: "admin", permissionName: "read" },
      { roleName: "admin", permissionName: "write" },
      { roleName: "admin", permissionName: "execute" },
      { roleName: "admin", permissionName: "admin" },
      { roleName: "trader", permissionName: "read" },
      { roleName: "trader", permissionName: "write" },
      { roleName: "trader", permissionName: "execute" },
      { roleName: "analyst", permissionName: "read" },
      { roleName: "analyst", permissionName: "write" }
    ]);

    // 3. Market Master Data
    console.log("Seeding Market Master data...");
    await db.insert(exchanges).values([
      { id: "NSE", name: "National Stock Exchange", description: "India's leading stock exchange", timezone: "Asia/Kolkata", isOpen: true },
      { id: "BSE", name: "Bombay Stock Exchange", description: "The oldest stock exchange in Asia", timezone: "Asia/Kolkata", isOpen: true },
      { id: "MCX", name: "Multi Commodity Exchange", description: "India's largest commodity derivatives exchange", timezone: "Asia/Kolkata", isOpen: true }
    ]);

    await db.insert(instrumentTypes).values([
      { id: "EQUITY", name: "Equity" },
      { id: "ETF", name: "Exchange Traded Fund" },
      { id: "INDEX", name: "Index" },
      { id: "STOCK_FUTURES", name: "Stock Futures" },
      { id: "INDEX_FUTURES", name: "Index Futures" },
      { id: "STOCK_OPTIONS", name: "Stock Options" },
      { id: "INDEX_OPTIONS", name: "Index Options" }
    ]);

    await db.insert(instruments).values([
      { symbol: "RELIANCE", name: "Reliance Industries Limited", exchangeId: "NSE", typeId: "EQUITY", lotSize: 1, tickSize: "0.05" },
      { symbol: "TCS", name: "Tata Consultancy Services Limited", exchangeId: "NSE", typeId: "EQUITY", lotSize: 1, tickSize: "0.05" },
      { symbol: "HDFCBANK", name: "HDFC Bank Limited", exchangeId: "NSE", typeId: "EQUITY", lotSize: 1, tickSize: "0.05" },
      { symbol: "NIFTY 50", name: "Nifty 50 Index", exchangeId: "NSE", typeId: "INDEX", lotSize: 50, tickSize: "0.05" },
      { symbol: "BANKNIFTY", name: "Nifty Bank Index", exchangeId: "NSE", typeId: "INDEX", lotSize: 15, tickSize: "0.05" }
    ]);

    await db.insert(marketStatus).values([
      { exchangeId: "NSE", status: "OPEN", message: "Market is open for normal trading" },
      { exchangeId: "BSE", status: "OPEN", message: "Market is open for normal trading" },
      { exchangeId: "MCX", status: "OPEN", message: "Market is open for normal trading" }
    ]);

    // 4. Seed Enterprise Users
    console.log("Seeding users...");
    const insertedUsers = await db.insert(users).values([
      {
        email: "admin@aiarina.com",
        role: "admin",
        settings: {
          passwordHash: adminHash,
          theme: "dark",
          density: "high",
          compactPalette: true,
        },
      },
      {
        email: "trader1@aiarina.com",
        role: "trader",
        settings: {
          passwordHash: traderHash,
          theme: "dark",
          density: "high",
          defaultWorkspace: "Bloomberg-style",
        },
      },
      {
        email: "analyst1@aiarina.com",
        role: "analyst",
        settings: {
          passwordHash: analystHash,
          theme: "light",
          density: "medium",
          defaultWorkspace: "Research",
        },
      }
    ]).returning();

    const adminUser = insertedUsers[0];
    const traderUser = insertedUsers[1];
    const analystUser = insertedUsers[2];

    // 4. Seed Memberships
    console.log("Seeding memberships...");
    await db.insert(memberships).values([
      { userId: adminUser.id, organizationId: "org-1", role: "admin" },
      { userId: traderUser.id, organizationId: "org-2", role: "trader" },
      { userId: analystUser.id, organizationId: "org-3", role: "analyst" }
    ]);

    // 5. Seed Portfolios
    console.log("Seeding portfolios...");
    const insertedPortfolios = await db.insert(portfolios).values([
      {
        organizationId: "org-1",
        name: "Enterprise Core Fund",
        cashBalance: "15000000.00",
        marginEnabled: true,
      },
      {
        organizationId: "org-2",
        name: "Alpha Tactical Portfolio",
        cashBalance: "500000.00",
        marginEnabled: true,
      },
      {
        organizationId: "org-3",
        name: "Paper Long-Only Watcher",
        cashBalance: "100000.00",
        marginEnabled: false,
      }
    ]).returning();

    const coreFund = insertedPortfolios[0];
    const tacticalFund = insertedPortfolios[1];

    // 6. Seed Execution Trades
    console.log("Seeding trade history logs...");
    await db.insert(trades).values([
      {
        portfolioId: coreFund.id,
        ticker: "RELIANCE",
        side: "BUY",
        quantity: "1000.0000",
        executionPrice: "185.50",
      },
      {
        portfolioId: coreFund.id,
        ticker: "SBIN",
        side: "BUY",
        quantity: "5000.0000",
        executionPrice: "450.25",
      },
      {
        portfolioId: tacticalFund.id,
        ticker: "TCS",
        side: "BUY",
        quantity: "250.0000",
        executionPrice: "210.10",
      },
      {
        portfolioId: tacticalFund.id,
        ticker: "SBIN",
        side: "SELL",
        quantity: "100.0000",
        executionPrice: "480.00",
      }
    ]);

    // 7. Seed AI Research Reports
    console.log("Seeding intelligence insights...");
    await db.insert(aiResearchReports).values([
      {
        userId: analystUser.id,
        ticker: "SBIN",
        summary: "NVIDIA shows exceptionally strong demand for Hopper and Blackwell architectures. Gross margins remain healthy at 75%+. Recommend Buy on minor pullbacks.",
        detailedJson: {
          recommendation: "STRONG_BUY",
          targetPrice: 550,
          horizon: "12M",
          risks: ["Supply chain bottlenecks", "Hyperscaler capex consolidation"],
          score: 9.4
        }
      },
      {
        userId: analystUser.id,
        ticker: "RELIANCE",
        summary: "Apple is consolidating key product features with local AI model endpoints. High retention rates offset sluggish global device shipment volumes.",
        detailedJson: {
          recommendation: "ACCUMULATE",
          targetPrice: 205,
          horizon: "6M",
          risks: ["Regulatory headwinds in Europe", "Longer hardware replacement cycles"],
          score: 8.1
        }
      }
    ]);

    // 8. Seed System Audit Logs
    console.log("Seeding system audit trails...");
    await db.insert(administrationLogs).values([
      {
        action: "DATABASE_INITIALIZED",
        severity: "info",
        actorId: adminUser.id,
      },
      {
        action: "SEEDED_ENTERPRISE_IDENTITY",
        severity: "info",
        actorId: adminUser.id,
      },
      {
        action: "RISK_MARGIN_CALIBRATION",
        severity: "warning",
        actorId: adminUser.id,
      }
    ]);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Failed to seed database:", error);
    throw error;
  } finally {
    await closeDb();
  }
}

// Run seeding script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { seed };
