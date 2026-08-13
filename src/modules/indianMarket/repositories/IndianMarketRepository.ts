import { eq, and, desc, sql } from "drizzle-orm";
import { getDb, runSafeStartupSeed } from "../../../db/client.ts";
import { 
  indianTradingCalendarTable,
  indianMarketSessionTable,
  indianMarketClockTable,
  indianMarketRuntimeTable,
  indianMarketOperatingPolicyTable,
  indianMarketValidationTable,
  indianMarketEventsTable
} from "../../../db/schema.ts";
import { 
  IndianTradingCalendar, 
  IndianMarketSession, 
  IndianMarketClock, 
  IndianMarketPolicy, 
  IndianMarketValidation, 
  IndianMarketEvent,
  IndianSessionType,
  IndianDayType,
  IndianPolicyRules
} from "../types/index.ts";

export class IndianMarketRepository {
  /**
   * Safe initialization: automatically builds tables if missing and seeds default data.
   */
  async ensureIndianMarketTablesAndMasterData(): Promise<void> {
    const db = getDb();
    console.log("[EP05] Initializing Indian Market Operating System Tables & Master Data...");

    try {
      // 1. Create tables raw fallback to ensure robustness
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS indian_trading_calendar (
          id VARCHAR(100) PRIMARY KEY,
          date VARCHAR(10) NOT NULL UNIQUE,
          day_type VARCHAR(50) NOT NULL,
          session_name VARCHAR(100),
          description VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS indian_market_session (
          id VARCHAR(100) PRIMARY KEY,
          session_type VARCHAR(50) NOT NULL,
          start_time VARCHAR(50) NOT NULL,
          end_time VARCHAR(50) NOT NULL,
          is_active BOOLEAN DEFAULT FALSE NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS indian_market_clock (
          id VARCHAR(100) PRIMARY KEY,
          exchange_time TIMESTAMP NOT NULL,
          server_time TIMESTAMP NOT NULL,
          system_time TIMESTAMP NOT NULL,
          timezone VARCHAR(50) DEFAULT 'Asia/Kolkata' NOT NULL,
          drift_ms INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS indian_market_runtime (
          id VARCHAR(100) PRIMARY KEY,
          runtime_key VARCHAR(100) NOT NULL UNIQUE,
          runtime_value JSONB NOT NULL DEFAULT '{}',
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS indian_market_policy (
          id VARCHAR(100) PRIMARY KEY,
          policy_name VARCHAR(100) NOT NULL UNIQUE,
          description VARCHAR(255),
          rules JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS indian_market_validation (
          id VARCHAR(100) PRIMARY KEY,
          module_name VARCHAR(100) NOT NULL,
          is_valid BOOLEAN NOT NULL,
          checks_run JSONB NOT NULL DEFAULT '{}',
          errors JSONB NOT NULL DEFAULT '[]',
          verified_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS indian_market_events (
          id VARCHAR(100) PRIMARY KEY,
          event_type VARCHAR(100) NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);

      // 2. Seed default Trading Calendar (Diwali, Independence Day, Republic Day, weekends, etc.)
      const calendarCount = await db.execute(sql`SELECT count(*) FROM indian_trading_calendar`);
      const countNum = parseInt((calendarCount.rows[0] as any)?.count || "0");
      if (countNum === 0) {
        console.log("[EP05] Seeding standard Indian trading calendar and regional holidays...");
        const calendarData = [
          { id: "cal_1", date: "2026-01-26", day_type: "HOLIDAY", session_name: "Republic Day", description: "National Holiday - Republic Day of India" },
          { id: "cal_2", date: "2026-03-06", day_type: "HOLIDAY", session_name: "Holi", description: "Holi Festival Closure" },
          { id: "cal_3", date: "2026-04-02", day_type: "HOLIDAY", session_name: "Ram Navami", description: "Ram Navami Closure" },
          { id: "cal_4", date: "2026-05-01", day_type: "HOLIDAY", session_name: "Maharashtra Day", description: "State Holiday - Maharashtra Day" },
          { id: "cal_5", date: "2026-08-15", day_type: "HOLIDAY", session_name: "Independence Day", description: "National Holiday - Independence Day of India" },
          { id: "cal_6", date: "2026-10-02", day_type: "HOLIDAY", session_name: "Gandhi Jayanti", description: "National Holiday - Mahatma Gandhi Birth Anniversary" },
          { id: "cal_7", date: "2026-11-08", day_type: "SPECIAL_SESSION", session_name: "Diwali Muhurat Trading", description: "Diwali Muhurat Auspicious Trading Hour" },
          { id: "cal_8", date: "2026-12-25", day_type: "HOLIDAY", session_name: "Christmas", description: "Christmas Day Market Closure" }
        ];

        for (const item of calendarData) {
          await db.execute(sql`
            INSERT INTO indian_trading_calendar (id, date, day_type, session_name, description)
            VALUES (${item.id}, ${item.date}, ${item.day_type}, ${item.session_name}, ${item.description})
            ON CONFLICT (date) DO NOTHING
          `);
        }
      }

      // 3. Seed default Market Sessions (NSE/BSE timing standards)
      const sessionCount = await db.execute(sql`SELECT count(*) FROM indian_market_session`);
      const sCount = parseInt((sessionCount.rows[0] as any)?.count || "0");
      if (sCount === 0) {
        console.log("[EP05] Seeding standard market session timelines...");
        const sessionData = [
          { id: "sess_pre", session_type: "PRE_OPEN", start_time: "09:00", end_time: "09:15", is_active: false },
          { id: "sess_norm", session_type: "NORMAL", start_time: "09:15", end_time: "15:30", is_active: true },
          { id: "sess_close", session_type: "PRE_CLOSE", start_time: "15:30", end_time: "15:40", is_active: false },
          { id: "sess_post", session_type: "POST_CLOSE", start_time: "15:40", end_time: "16:00", is_active: false },
          { id: "sess_maint", session_type: "MAINTENANCE", start_time: "16:00", end_time: "18:00", is_active: false }
        ];

        for (const item of sessionData) {
          await db.execute(sql`
            INSERT INTO indian_market_session (id, session_type, start_time, end_time, is_active)
            VALUES (${item.id}, ${item.session_type}, ${item.start_time}, ${item.end_time}, ${item.is_active})
            ON CONFLICT (id) DO NOTHING
          `);
        }
      }

      // 4. Seed Policies (NSE, BSE, MCX, Paper, Live, Emergency)
      const policyCount = await db.execute(sql`SELECT count(*) FROM indian_market_policy`);
      const pCount = parseInt((policyCount.rows[0] as any)?.count || "0");
      if (pCount === 0) {
        console.log("[EP05] Seeding standard policy frameworks...");
        const policies = [
          {
            id: "pol_nse",
            policy_name: "NSE_POLICY",
            description: "National Stock Exchange Regulatory Policy Rules",
            rules: JSON.stringify({
              tradingAllowed: true,
              maxLeverage: 5,
              shortSellingEnabled: true,
              circuitBreakerPercentage: 10,
              allowedSegments: ["EQUITY", "DERIVATIVES", "CURRENCY"]
            })
          },
          {
            id: "pol_bse",
            policy_name: "BSE_POLICY",
            description: "Bombay Stock Exchange Compliance Policy Rules",
            rules: JSON.stringify({
              tradingAllowed: true,
              maxLeverage: 5,
              shortSellingEnabled: true,
              circuitBreakerPercentage: 10,
              allowedSegments: ["EQUITY", "DERIVATIVES"]
            })
          },
          {
            id: "pol_mcx",
            policy_name: "MCX_POLICY",
            description: "Multi Commodity Exchange Trading Policy Rules",
            rules: JSON.stringify({
              tradingAllowed: true,
              maxLeverage: 10,
              shortSellingEnabled: false,
              circuitBreakerPercentage: 6,
              allowedSegments: ["COMMODITY"]
            })
          },
          {
            id: "pol_paper",
            policy_name: "PAPER_POLICY",
            description: "Virtual Paper Trading Sandbox Risk Policies",
            rules: JSON.stringify({
              tradingAllowed: true,
              maxLeverage: 1,
              shortSellingEnabled: true,
              circuitBreakerPercentage: 20,
              allowedSegments: ["EQUITY", "DERIVATIVES", "COMMODITY"]
            })
          },
          {
            id: "pol_live",
            policy_name: "LIVE_POLICY",
            description: "Secured Direct Live Execution Trading Policies",
            rules: JSON.stringify({
              tradingAllowed: true,
              maxLeverage: 1,
              shortSellingEnabled: false,
              circuitBreakerPercentage: 10,
              allowedSegments: ["EQUITY"]
            })
          },
          {
            id: "pol_emg",
            policy_name: "EMERGENCY_POLICY",
            description: "Panic Halting and Lockdown Market Policy Rules",
            rules: JSON.stringify({
              tradingAllowed: false,
              maxLeverage: 0,
              shortSellingEnabled: false,
              circuitBreakerPercentage: 0,
              allowedSegments: []
            })
          }
        ];

        for (const pol of policies) {
          await db.execute(sql`
            INSERT INTO indian_market_policy (id, policy_name, description, rules)
            VALUES (${pol.id}, ${pol.policy_name}, ${pol.description}, ${pol.rules}::jsonb)
            ON CONFLICT (policy_name) DO NOTHING
          `);
        }
      }

      // 5. Seed default Indian Market Runtime variables (Expiries, Settlement, Circuit Limits)
      const runtimeCount = await db.execute(sql`SELECT count(*) FROM indian_market_runtime`);
      const rCount = parseInt((runtimeCount.rows[0] as any)?.count || "0");
      if (rCount === 0) {
        console.log("[EP05] Seeding standard market runtime parameters...");
        await db.execute(sql`
          INSERT INTO indian_market_runtime (id, runtime_key, runtime_value)
          VALUES 
            ('rt_settle', 'settlement_state', '{"queue": [], "status": "STABLE", "lastSettledDate": "2026-07-26"}'::jsonb),
            ('rt_expiry', 'expiry_state', '{"weekly": "2026-07-30", "monthly": "2026-07-30", "countdownDays": 3}'::jsonb),
            ('rt_circuit', 'circuit_state', '{"upperCount": 0, "lowerCount": 0, "haltedSymbols": []}'::jsonb),
            ('rt_auction', 'auction_state', '{"currentAuction": null, "volumeTraded": 0}'::jsonb)
          ON CONFLICT (runtime_key) DO NOTHING
        `);
      }

    } catch (error) {
      console.error("[EP05] Failed to bootstrap database tables and master data:", error);
    }
  }

  // ==========================================
  // MODULE 1: Trading Calendar
  // ==========================================
  async getTradingCalendar(): Promise<IndianTradingCalendar[]> {
    const db = getDb();
    const result = await db.select().from(indianTradingCalendarTable);
    return result as any[];
  }

  async addCalendarDay(date: string, dayType: IndianDayType, sessionName?: string, description?: string): Promise<void> {
    const db = getDb();
    const id = "cal_" + Date.now();
    await db.insert(indianTradingCalendarTable).values({
      id,
      date,
      dayType,
      sessionName,
      description,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: indianTradingCalendarTable.date,
      set: { dayType, sessionName, description, updatedAt: new Date() }
    });
  }

  async deleteCalendarDay(date: string): Promise<void> {
    const db = getDb();
    await db.delete(indianTradingCalendarTable).where(eq(indianTradingCalendarTable.date, date));
  }

  // ==========================================
  // MODULE 2: Session Engine
  // ==========================================
  async getSessions(): Promise<IndianMarketSession[]> {
    const db = getDb();
    const result = await db.select().from(indianMarketSessionTable);
    return result as any[];
  }

  async updateSessionActiveState(sessionType: IndianSessionType, isActive: boolean): Promise<void> {
    const db = getDb();
    // First deactivate all
    if (isActive) {
      await db.update(indianMarketSessionTable).set({ isActive: false, updatedAt: new Date() });
    }
    await db.update(indianMarketSessionTable)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(indianMarketSessionTable.sessionType, sessionType));
  }

  async updateSessionTimes(sessionType: IndianSessionType, startTime: string, endTime: string): Promise<void> {
    const db = getDb();
    await db.update(indianMarketSessionTable)
      .set({ startTime, endTime, updatedAt: new Date() })
      .where(eq(indianMarketSessionTable.sessionType, sessionType));
  }

  // ==========================================
  // MODULE 3: Market Clock
  // ==========================================
  async logClockSync(driftMs: number, exchangeTime: Date, serverTime: Date): Promise<void> {
    const db = getDb();
    const id = "clk_" + Date.now();
    await db.insert(indianMarketClockTable).values({
      id,
      exchangeTime,
      serverTime,
      systemTime: new Date(),
      timezone: "Asia/Kolkata",
      driftMs,
      createdAt: new Date()
    });
  }

  async getLatestClockLog(): Promise<IndianMarketClock | null> {
    const db = getDb();
    const result = await db.select()
      .from(indianMarketClockTable)
      .orderBy(desc(indianMarketClockTable.createdAt))
      .limit(1);
    return result.length > 0 ? (result[0] as any) : null;
  }

  // ==========================================
  // MODULE 5-8: Market Runtime State
  // ==========================================
  async getRuntimeState(key: string): Promise<any> {
    const db = getDb();
    const result = await db.select()
      .from(indianMarketRuntimeTable)
      .where(eq(indianMarketRuntimeTable.runtimeKey, key))
      .limit(1);
    return result.length > 0 ? (result[0].runtimeValue as any) : {};
  }

  async setRuntimeState(key: string, value: any): Promise<void> {
    const db = getDb();
    await db.insert(indianMarketRuntimeTable).values({
      id: "rt_" + key,
      runtimeKey: key,
      runtimeValue: value,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: indianMarketRuntimeTable.runtimeKey,
      set: { runtimeValue: value, updatedAt: new Date() }
    });
  }

  // ==========================================
  // MODULE 11: Policy Engine
  // ==========================================
  async getPolicies(): Promise<IndianMarketPolicy[]> {
    const db = getDb();
    const result = await db.select().from(indianMarketOperatingPolicyTable);
    return result as any[];
  }

  async updatePolicyRules(policyName: string, rules: IndianPolicyRules): Promise<void> {
    const db = getDb();
    await db.update(indianMarketOperatingPolicyTable)
      .set({ rules: rules as any, updatedAt: new Date() })
      .where(eq(indianMarketOperatingPolicyTable.policyName, policyName));
  }

  // ==========================================
  // MODULE 10: Validation State
  // ==========================================
  async logValidationResult(moduleName: 'RESEARCH' | 'AI_INTELLIGENCE' | 'STRATEGY' | 'COMMITTEE' | 'LIFECYCLE' | 'PAPER_TRADING' | 'TRADING', isValid: boolean, checksRun: any, errors: string[]): Promise<void> {
    const db = getDb();
    const id = "val_" + Date.now();
    await db.insert(indianMarketValidationTable).values({
      id,
      moduleName,
      isValid,
      checksRun,
      errors,
      verifiedAt: new Date()
    });
  }

  async getLatestValidationHistory(): Promise<IndianMarketValidation[]> {
    const db = getDb();
    const result = await db.select()
      .from(indianMarketValidationTable)
      .orderBy(desc(indianMarketValidationTable.verifiedAt))
      .limit(10);
    return result as any[];
  }

  // ==========================================
  // MODULE 13: Event Engine
  // ==========================================
  async logEvent(eventType: string, payload: any): Promise<void> {
    const db = getDb();
    const id = "evt_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    await db.insert(indianMarketEventsTable).values({
      id,
      eventType,
      payload,
      createdAt: new Date()
    });
  }

  async getEvents(limit = 50): Promise<IndianMarketEvent[]> {
    const db = getDb();
    const result = await db.select()
      .from(indianMarketEventsTable)
      .orderBy(desc(indianMarketEventsTable.createdAt))
      .limit(limit);
    return result as any[];
  }
}

export const indianMarketRepo = new IndianMarketRepository();

// Automatically hook up startup boots
runSafeStartupSeed(() => indianMarketRepo.ensureIndianMarketTablesAndMasterData());
