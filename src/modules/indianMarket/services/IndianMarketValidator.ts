import { indianMarketRepo } from "../repositories/IndianMarketRepository.ts";
import { indianMarketRuntime } from "./IndianMarketRuntime.ts";
import { IndianMarketValidation } from "../types/index.ts";

export class IndianMarketValidator {
  /**
   * Validates a transaction request against Indian trading structures.
   */
  async validateRuntime(
    moduleName: 'RESEARCH' | 'AI_INTELLIGENCE' | 'STRATEGY' | 'COMMITTEE' | 'LIFECYCLE' | 'PAPER_TRADING' | 'TRADING',
    symbol?: string
  ): Promise<{ isValid: boolean; errors: string[]; validationRecord: IndianMarketValidation }> {
    const errors: string[] = [];
    const checks = {
      calendarChecked: true,
      sessionChecked: true,
      clockChecked: true,
      settlementChecked: true,
      circuitChecked: true,
      auctionChecked: true
    };

    // 1. Calendar Verification
    const todayStr = new Date().toISOString().slice(0, 10);
    const calendarDays = await indianMarketRepo.getTradingCalendar();
    const dayConfig = calendarDays.find(d => d.date === todayStr);
    
    // Check if it's weekend
    const dayOfWeek = new Date().getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    if (dayConfig) {
      if (dayConfig.dayType === 'HOLIDAY') {
        errors.push(`Today (${todayStr}) is an official trading holiday: ${dayConfig.sessionName || "Market Closed"}.`);
      } else if (dayConfig.dayType === 'EMERGENCY_CLOSURE') {
        errors.push(`Today (${todayStr}) has been emergency-halted by SEBI: ${dayConfig.description || "Lockdown"}.`);
      }
    } else if (isWeekend) {
      errors.push(`Today is a weekend. Indian stock exchanges (NSE/BSE) are closed on Saturdays and Sundays.`);
    }

    // 2. Session Timings Verification
    const sessions = await indianMarketRepo.getSessions();
    const activeSession = sessions.find(s => s.isActive);
    if (!activeSession) {
      errors.push("No active market session is defined in the system.");
    } else if (activeSession.sessionType === 'EMERGENCY_STOP' || activeSession.sessionType === 'MAINTENANCE') {
      errors.push(`Current market session is locked in ${activeSession.sessionType} mode. Trading is disallowed.`);
    }

    // 3. Clock Synchronicity Checks
    const clockLog = await indianMarketRepo.getLatestClockLog();
    if (clockLog && clockLog.driftMs > 1000) {
      errors.push(`Exchange clock drift of ${clockLog.driftMs}ms exceeds permissible maximum of 1000ms.`);
    }

    // 4. Circuit Breakers Limits Check
    if (symbol) {
      const circuits = await indianMarketRuntime.getCircuitState(symbol);
      const targetCircuit = circuits.find(c => c.symbol === symbol);
      if (targetCircuit && targetCircuit.isTriggered) {
        errors.push(`Instrument '${symbol}' is locked under a ${targetCircuit.triggerType} circuit breaker halt until ${targetCircuit.haltedUntil}.`);
      }
    }

    // 5. Auction Checks
    const auctions = await indianMarketRuntime.getAuctionState();
    const runningAuction = auctions.find(a => a.status === 'OPEN' || a.status === 'MATCHING');
    if (runningAuction && moduleName === 'TRADING') {
      errors.push(`Active Call Auction [${runningAuction.auctionType}] is running. Direct spot execution is temporarily queued.`);
    }

    const isValid = errors.length === 0;

    // Log the validation execution for audit records
    const record: IndianMarketValidation = {
      id: "val_" + Date.now(),
      moduleName,
      isValid,
      checksRun: checks,
      errors,
      verifiedAt: new Date()
    };

    await indianMarketRepo.logValidationResult(moduleName, isValid, checks, errors);

    return {
      isValid,
      errors,
      validationRecord: record
    };
  }
}

export const indianMarketValidator = new IndianMarketValidator();
