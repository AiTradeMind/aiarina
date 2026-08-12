import { NormalizedBar, SignalEvent, SignalType, SignalAction } from "../types/index.ts";
import { calculateRSI, calculateMACD } from "../math/momentum.ts";
import { calculateBollingerBands } from "../math/volatility.ts";
import { calculateEMA } from "../math/movingAverages.ts";
import { calculateSuperTrend } from "../math/trend.ts";
import { calculatePivotPoints, detectGaps, calculateMarketStructure } from "../math/priceAction.ts";

export class SignalEngine {
  /**
   * Generates a consolidated signal event based on multi-indicator consensus rules.
   */
  public generateConsolidatedSignal(
    symbol: string,
    timeframe: string,
    bars: NormalizedBar[]
  ): SignalEvent {
    if (bars.length < 35) {
      return {
        signalId: `sig-${symbol}-${timeframe}-${Date.now()}`,
        symbol,
        timeframe,
        type: "NEUTRAL",
        action: "HOLD",
        confidence: 0.5,
        reason: "Insufficient historical bars to perform reliable technical signal generation.",
        indicatorSource: "SYSTEM_INITIALIZATION",
        timestamp: new Date()
      };
    }

    const latestBar = bars[bars.length - 1];
    const prevBar = bars[bars.length - 2];
    const close = Number(latestBar.close);
    const prevClose = Number(prevBar.close);

    const votes = {
      bullish: 0,
      bearish: 0,
      totalWeight: 0
    };

    const triggers: string[] = [];

    // 1. EMA 9 & EMA 21 Crossover (Weight: 2)
    try {
      const ema9 = calculateEMA(bars, 9);
      const ema21 = calculateEMA(bars, 21);
      const idx = bars.length - 1;
      
      const currDiff = ema9[idx] - ema21[idx];
      const prevDiff = ema9[idx - 1] - ema21[idx - 1];

      if (currDiff > 0 && prevDiff <= 0) {
        votes.bullish += 2;
        triggers.push("EMA_GOLDEN_CROSS");
      } else if (currDiff < 0 && prevDiff >= 0) {
        votes.bearish += 2;
        triggers.push("EMA_DEATH_CROSS");
      }
      votes.totalWeight += 2;
    } catch {}

    // 2. RSI Thresholds (Weight: 2)
    try {
      const rsi = calculateRSI(bars, 14);
      const currentRsi = rsi[rsi.length - 1];
      const prevRsi = rsi[rsi.length - 2];

      if (currentRsi < 30) {
        votes.bullish += 1.5;
        triggers.push(`RSI_OVERSOLD_${currentRsi.toFixed(1)}`);
      } else if (currentRsi > 70) {
        votes.bearish += 1.5;
        triggers.push(`RSI_OVERBOUGHT_${currentRsi.toFixed(1)}`);
      }

      // Overbought/oversold reentry crossovers
      if (prevRsi < 30 && currentRsi >= 30) {
        votes.bullish += 2;
        triggers.push("RSI_OVERSOLD_REENTRY");
      } else if (prevRsi > 70 && currentRsi <= 70) {
        votes.bearish += 2;
        triggers.push("RSI_OVERBOUGHT_REENTRY");
      }
      votes.totalWeight += 2;
    } catch {}

    // 3. MACD Crossover (Weight: 2)
    try {
      const macd = calculateMACD(bars, 12, 26, 9);
      const idx = bars.length - 1;
      
      const currMacd = macd.macdLine[idx];
      const currSig = macd.signalLine[idx];
      const prevMacd = macd.macdLine[idx - 1];
      const prevSig = macd.signalLine[idx - 1];

      if (currMacd > currSig && prevMacd <= prevSig) {
        votes.bullish += 2;
        triggers.push("MACD_BULLISH_CROSSOVER");
      } else if (currMacd < currSig && prevMacd >= prevSig) {
        votes.bearish += 2;
        triggers.push("MACD_BEARISH_CROSSOVER");
      }
      votes.totalWeight += 2;
    } catch {}

    // 4. Bollinger Bands (Weight: 1.5)
    try {
      const bb = calculateBollingerBands(bars, 20, 2);
      const idx = bars.length - 1;
      if (close <= bb.lower[idx]) {
        votes.bullish += 1.5;
        triggers.push("BOLLINGER_LOWER_SUPPORT_TOUCH");
      } else if (close >= bb.upper[idx]) {
        votes.bearish += 1.5;
        triggers.push("BOLLINGER_UPPER_RESISTANCE_TOUCH");
      }
      votes.totalWeight += 1.5;
    } catch {}

    // 5. SuperTrend (Weight: 2.5)
    try {
      const st = calculateSuperTrend(bars, 10, 3);
      const idx = bars.length - 1;
      if (st.direction[idx] === 1 && st.direction[idx - 1] === -1) {
        votes.bullish += 2.5;
        triggers.push("SUPERTREND_BUY_FLIP");
      } else if (st.direction[idx] === -1 && st.direction[idx - 1] === 1) {
        votes.bearish += 2.5;
        triggers.push("SUPERTREND_SELL_FLIP");
      }
      votes.totalWeight += 2.5;
    } catch {}

    // 6. Gaps & Pivots (Weight: 1)
    try {
      const pivots = calculatePivotPoints(bars.slice(0, -1)); // pivot relative to yesterday
      if (close > pivots.r1 && prevClose <= pivots.r1) {
        votes.bullish += 1;
        triggers.push("PIVOT_R1_BREAKOUT");
      } else if (close < pivots.s1 && prevClose >= pivots.s1) {
        votes.bearish += 1;
        triggers.push("PIVOT_S1_BREAKDOWN");
      }

      const gaps = detectGaps(bars, 0.3); // Gaps > 0.3%
      if (gaps.length > 0) {
        const lastGap = gaps[gaps.length - 1];
        if (lastGap.index === bars.length - 1) {
          if (lastGap.type === "UP") {
            votes.bullish += 1;
            triggers.push("GAP_UP_LAUNCH");
          } else {
            votes.bearish += 1;
            triggers.push("GAP_DOWN_LAUNCH");
          }
        }
      }
      votes.totalWeight += 1;
    } catch {}

    // 7. Market Structure (Weight: 1.5)
    try {
      const markers = calculateMarketStructure(bars, 2);
      if (markers.length > 0) {
        const latestMarker = markers[markers.length - 1];
        // If the latest structural marker is nearby (within 3 bars)
        if (bars.length - 1 - latestMarker.index <= 3) {
          if (latestMarker.type === "HH" || latestMarker.type === "HL") {
            votes.bullish += 1.5;
            triggers.push(`STRUCTURE_UP_${latestMarker.type}`);
          } else if (latestMarker.type === "LL" || latestMarker.type === "LH") {
            votes.bearish += 1.5;
            triggers.push(`STRUCTURE_DOWN_${latestMarker.type}`);
          }
        }
      }
      votes.totalWeight += 1.5;
    } catch {}

    // Consensus Assessment
    let type: SignalType = "NEUTRAL";
    let action: SignalAction = "HOLD";
    let confidence = 0.5;
    let reason = "The market indicators remain mixed, establishing a consolidated hold consensus.";

    const bullPct = votes.bullish / (votes.totalWeight || 1);
    const bearPct = votes.bearish / (votes.totalWeight || 1);

    if (bullPct >= 0.4 && bullPct > bearPct) {
      type = "BULLISH";
      action = bullPct >= 0.65 ? "STRONG_BUY" : "BUY";
      confidence = bullPct;
      reason = `Bullish consensus verified via ${triggers.filter(t => t.includes("BULL") || t.includes("CROSS") || t.includes("UP") || t.includes("SUPPORT") || t.includes("BUY")).join(", ") || "positive price-momentum factors"}.`;
    } else if (bearPct >= 0.4 && bearPct > bullPct) {
      type = "BEARISH";
      action = bearPct >= 0.65 ? "STRONG_SELL" : "SELL";
      confidence = bearPct;
      reason = `Bearish consensus verified via ${triggers.filter(t => t.includes("BEAR") || t.includes("CROSS") || t.includes("DOWN") || t.includes("RESISTANCE") || t.includes("SELL")).join(", ") || "negative price-momentum factors"}.`;
    } else {
      if (triggers.length > 0) {
        reason = `Indeterminate market state. Conflicting signs triggered: ${triggers.join(", ")}. Maintain existing portfolio boundaries.`;
      }
    }

    return {
      signalId: `sig-${symbol}-${timeframe}-${Date.now()}`,
      symbol,
      timeframe,
      type,
      action,
      confidence: parseFloat(confidence.toFixed(4)),
      reason,
      indicatorSource: triggers.join("+") || "MARKET_BALANCE",
      timestamp: new Date()
    };
  }
}

export const signalEngine = new SignalEngine();
