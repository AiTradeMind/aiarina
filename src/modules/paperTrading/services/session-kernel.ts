import { MarketStatusType, ExchangeHoliday, TradingSessionMetadata, SessionClockState, SimulationSession } from "../types/session.ts";
import { EventBusService } from "../../events/services/index.ts";
import logger from "../../../lib/logger";

export class TradingSessionKernel {
  private static instance: TradingSessionKernel;
  private eventBus = EventBusService.getInstance();

  // Holidays for standard US exchange
  private holidays: ExchangeHoliday[] = [
    { date: "2026-01-01", name: "New Year's Day" },
    { date: "2026-01-19", name: "Martin Luther King Jr. Day" },
    { date: "2026-02-16", name: "Washington's Birthday" },
    { date: "2026-04-03", name: "Good Friday" },
    { date: "2026-05-25", name: "Memorial Day" },
    { date: "2026-06-19", name: "Juneteenth" },
    { date: "2026-07-03", name: "Independence Day (Observed)" },
    { date: "2026-09-07", name: "Labor Day" },
    { date: "2026-11-26", name: "Thanksgiving Day" },
    { date: "2026-12-25", name: "Christmas Day" }
  ];

  // In-memory active simulation clock state (session recovery can use persistent files, we default to current time)
  private clockState: SessionClockState = {
    currentVirtualTime: new Date().toISOString(),
    speed: 1,
    isPaused: false,
    marketStatus: "OPEN"
  };

  private activeSession: TradingSessionMetadata = {
    id: "default-session",
    name: "Default Paper Session",
    description: "Standard real-time paper trading session",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isSimulation: false
  };

  private intervalTimer: NodeJS.Timeout | null = null;

  public static getInstance(): TradingSessionKernel {
    if (!TradingSessionKernel.instance) {
      TradingSessionKernel.instance = new TradingSessionKernel();
    }
    return TradingSessionKernel.instance;
  }

  constructor() {
    this.startClockLoop();
    this.recoverSession();
  }

  /**
   * Recovers the last active clock state or session to ensure restart recovery.
   */
  private recoverSession() {
    try {
      logger.info("[SessionKernel] Initiating session recovery procedures...");
      // In a production app, we would query the database/file for session state,
      // here we initialize with current time and robust defaults.
      this.updateMarketStatus(new Date(this.clockState.currentVirtualTime));
      logger.info("[SessionKernel] Session successfully recovered.");
    } catch (err: any) {
      logger.error(`[SessionKernel] Session recovery failed: ${err.message}`);
    }
  }

  private startClockLoop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }

    // Every 1 second real-time, increment the virtual clock based on simulation speed
    this.intervalTimer = setInterval(() => {
      if (this.clockState.isPaused) return;

      const currentMs = new Date(this.clockState.currentVirtualTime).getTime();
      // Increments clock virtual time (speed is multipliers of real-time: 1 = 1s virtual per 1s real, etc.)
      const timeIncrement = 1000 * this.clockState.speed;
      const nextTime = new Date(currentMs + timeIncrement);

      const oldStatus = this.clockState.marketStatus;
      this.clockState.currentVirtualTime = nextTime.toISOString();
      const newStatus = this.updateMarketStatus(nextTime);

      // Trigger status transitions events
      if (oldStatus !== newStatus) {
        this.publishStatusTransition(oldStatus, newStatus);
      }
    }, 1000);
  }

  /**
   * Determines Market Status based on Time and Date
   */
  public getMarketStatusForTime(time: Date): MarketStatusType {
    const dateStr = time.toISOString().split('T')[0];
    
    // Check Holidays
    if (this.holidays.some(h => h.date === dateStr)) {
      return "CLOSED";
    }

    const day = time.getUTCDay();
    // Check Weekends (Saturday = 6, Sunday = 0)
    if (day === 0 || day === 6) {
      return "CLOSED";
    }

    const hours = time.getUTCHours();
    const minutes = time.getUTCMinutes();
    const totalMinutes = hours * 60 + minutes;

    // US Market is typically 9:30 AM to 4:00 PM EST. In UTC, standard is 14:30 to 21:00 UTC.
    // Let's use standard UTC offsets (approximate for simulation simplicity):
    // Pre-open: 13:00 - 14:30 UTC
    // Open: 14:30 - 21:00 UTC
    // Auction: 21:00 - 21:15 UTC
    // Closed: 21:15 - 22:00 UTC
    // After-market: 22:00 - 24:00 UTC and 00:00 - 13:00 UTC

    const preOpenStart = 13 * 60; // 13:00 UTC
    const openStart = 14 * 60 + 30; // 14:30 UTC
    const auctionStart = 21 * 60; // 21:00 UTC
    const closedStart = 21 * 60 + 15; // 21:15 UTC
    const afterMarketStart = 22 * 60; // 22:00 UTC

    if (totalMinutes >= preOpenStart && totalMinutes < openStart) {
      return "PRE_OPEN";
    } else if (totalMinutes >= openStart && totalMinutes < auctionStart) {
      return "OPEN";
    } else if (totalMinutes >= auctionStart && totalMinutes < closedStart) {
      return "AUCTION";
    } else if (totalMinutes >= closedStart && totalMinutes < afterMarketStart) {
      return "CLOSED";
    } else {
      return "AFTER_MARKET";
    }
  }

  private updateMarketStatus(time: Date): MarketStatusType {
    const status = this.getMarketStatusForTime(time);
    this.clockState.marketStatus = status;
    return status;
  }

  private async publishStatusTransition(from: MarketStatusType, to: MarketStatusType) {
    logger.info(`[SessionKernel] Market Status transition: ${from} -> ${to}`);
    await this.eventBus.publish({
      eventType: "MARKET_STATUS_CHANGED",
      source: "SESSION_KERNEL",
      organizationId: "system",
      payload: {
        from,
        to,
        virtualTime: this.clockState.currentVirtualTime,
        sessionMetadata: this.activeSession
      },
      notify: {
        title: "Market Status Transition",
        message: `Exchange venue has transitioned from ${from} to ${to}.`,
        type: "INFO"
      }
    });
  }

  // --- Clock Controls (Simulation Engine) ---

  public pause() {
    this.clockState.isPaused = true;
    logger.info("[SimulationEngine] Simulation paused.");
    this.eventBus.publish({
      eventType: "SIMULATION_PAUSED",
      source: "SIMULATION_ENGINE",
      organizationId: "system",
      payload: { virtualTime: this.clockState.currentVirtualTime }
    });
  }

  public resume() {
    this.clockState.isPaused = false;
    logger.info("[SimulationEngine] Simulation resumed.");
    this.eventBus.publish({
      eventType: "SIMULATION_RESUMED",
      source: "SIMULATION_ENGINE",
      organizationId: "system",
      payload: { virtualTime: this.clockState.currentVirtualTime, speed: this.clockState.speed }
    });
  }

  public setSpeed(speed: number) {
    if (speed <= 0) throw new Error("Speed multiplier must be greater than zero.");
    this.clockState.speed = speed;
    logger.info(`[SimulationEngine] Simulation speed set to ${speed}x.`);
    this.eventBus.publish({
      eventType: "SIMULATION_SPEED_CHANGED",
      source: "SIMULATION_ENGINE",
      organizationId: "system",
      payload: { virtualTime: this.clockState.currentVirtualTime, speed }
    });
  }

  public stepForward(seconds: number = 60) {
    const currentMs = new Date(this.clockState.currentVirtualTime).getTime();
    const nextTime = new Date(currentMs + (seconds * 1000));
    
    const oldStatus = this.clockState.marketStatus;
    this.clockState.currentVirtualTime = nextTime.toISOString();
    const newStatus = this.updateMarketStatus(nextTime);

    logger.info(`[SimulationEngine] Stepped forward ${seconds} seconds to ${this.clockState.currentVirtualTime}.`);

    if (oldStatus !== newStatus) {
      this.publishStatusTransition(oldStatus, newStatus);
    }

    this.eventBus.publish({
      eventType: "SIMULATION_STEPPED",
      source: "SIMULATION_ENGINE",
      organizationId: "system",
      payload: { virtualTime: this.clockState.currentVirtualTime, steps: seconds }
    });
  }

  public startSimulationSession(name: string, startTime: string, endTime: string, speedMultiplier = 1): SimulationSession {
    this.clockState.currentVirtualTime = startTime;
    this.clockState.speed = speedMultiplier;
    this.clockState.isPaused = false;
    this.updateMarketStatus(new Date(startTime));

    this.activeSession = {
      id: "sim-" + crypto.randomUUID().substring(0, 8),
      name,
      description: `Historical replay from ${startTime} to ${endTime}`,
      startTime,
      endTime,
      isSimulation: true
    };

    logger.info(`[SimulationEngine] Historical Replay Session started: ${name}`);
    this.eventBus.publish({
      eventType: "SIMULATION_SESSION_STARTED",
      source: "SIMULATION_ENGINE",
      organizationId: "system",
      payload: { session: this.activeSession, clockState: this.clockState }
    });

    return {
      id: this.activeSession.id,
      organizationId: "system",
      name: this.activeSession.name,
      status: "RUNNING",
      startVirtualTime: startTime,
      endVirtualTime: endTime,
      currentVirtualTime: startTime,
      speedMultiplier,
      createdAt: new Date().toISOString()
    };
  }

  // --- Getters ---

  public getClockState(): SessionClockState {
    return this.clockState;
  }

  public getActiveSession(): TradingSessionMetadata {
    return this.activeSession;
  }

  public getHolidays(): ExchangeHoliday[] {
    return this.holidays;
  }
}
export const tradingSessionKernel = TradingSessionKernel.getInstance();
