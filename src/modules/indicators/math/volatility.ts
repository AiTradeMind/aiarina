import { NormalizedBar } from "../types/index.ts";
import { calculateEMA, calculateSMA } from "./movingAverages.ts";
import { calculateATRRaw } from "./trend.ts";

/**
 * Calculates Standard Deviation.
 */
export function calculateStdDev(bars: NormalizedBar[], period: number, field: keyof NormalizedBar = "close"): number[] {
  const len = bars.length;
  const result = bars.map(() => 0);
  if (len < period) return result;

  const sma = calculateSMA(bars, period, field);

  for (let i = period - 1; i < len; i++) {
    const mean = sma[i];
    let varianceSum = 0;
    for (let j = 0; j < period; j++) {
      const val = Number(bars[i - j][field]);
      varianceSum += Math.pow(val - mean, 2);
    }
    result[i] = Math.sqrt(varianceSum / period);
  }
  return result;
}

/**
 * Calculates Average True Range (ATR).
 */
export function calculateATR(bars: NormalizedBar[], period = 14): number[] {
  return calculateATRRaw(bars, period);
}

/**
 * Calculates Bollinger Bands.
 */
export function calculateBollingerBands(
  bars: NormalizedBar[],
  period = 20,
  multiplier = 2
): { middle: number[]; upper: number[]; lower: number[] } {
  const len = bars.length;
  const middle = calculateSMA(bars, period);
  const stddev = calculateStdDev(bars, period);

  const upper = bars.map(() => 0);
  const lower = bars.map(() => 0);

  for (let i = 0; i < len; i++) {
    if (i >= period - 1) {
      upper[i] = middle[i] + multiplier * stddev[i];
      lower[i] = middle[i] - multiplier * stddev[i];
    }
  }

  return { middle, upper, lower };
}

/**
 * Calculates Keltner Channel.
 */
export function calculateKeltnerChannel(
  bars: NormalizedBar[],
  emaPeriod = 20,
  atrPeriod = 10,
  multiplier = 2
): { middle: number[]; upper: number[]; lower: number[] } {
  const len = bars.length;
  const middle = calculateEMA(bars, emaPeriod);
  const atr = calculateATRRaw(bars, atrPeriod);

  const upper = bars.map(() => 0);
  const lower = bars.map(() => 0);

  for (let i = 0; i < len; i++) {
    const limitPeriod = Math.max(emaPeriod, atrPeriod);
    if (i >= limitPeriod - 1) {
      upper[i] = middle[i] + multiplier * atr[i];
      lower[i] = middle[i] - multiplier * atr[i];
    }
  }

  return { middle, upper, lower };
}

/**
 * Calculates Donchian Channel.
 */
export function calculateDonchianChannel(
  bars: NormalizedBar[],
  period = 20
): { upper: number[]; lower: number[]; middle: number[] } {
  const len = bars.length;
  const upper = bars.map(() => 0);
  const lower = bars.map(() => 0);
  const middle = bars.map(() => 0);

  if (len < period) return { upper, lower, middle };

  for (let i = period - 1; i < len; i++) {
    let maxHigh = -Infinity;
    let minLow = Infinity;
    for (let j = 0; j < period; j++) {
      const idx = i - j;
      const h = Number(bars[idx].high);
      const l = Number(bars[idx].low);
      if (h > maxHigh) maxHigh = h;
      if (l < minLow) minLow = l;
    }
    upper[i] = maxHigh;
    lower[i] = minLow;
    middle[i] = (maxHigh + minLow) / 2;
  }

  return { upper, lower, middle };
}

/**
 * Calculates Historical Volatility (HV, Annualized %).
 */
export function calculateHistoricalVolatility(bars: NormalizedBar[], period = 20): number[] {
  const len = bars.length;
  const result = bars.map(() => 0);
  if (len < period + 1) return result;

  // Log returns
  const logReturns: number[] = [0];
  for (let i = 1; i < len; i++) {
    const prevClose = Number(bars[i - 1].close);
    const curClose = Number(bars[i].close);
    if (prevClose === 0 || curClose === 0) {
      logReturns.push(0);
    } else {
      logReturns.push(Math.log(curClose / prevClose));
    }
  }

  // Calculate moving standard deviation of returns
  for (let i = period; i < len; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += logReturns[i - j];
    }
    const mean = sum / period;

    let varianceSum = 0;
    for (let j = 0; j < period; j++) {
      varianceSum += Math.pow(logReturns[i - j] - mean, 2);
    }
    const stdDevOfReturns = Math.sqrt(varianceSum / period);

    // Annualize (assumes 252 trading days per year)
    result[i] = stdDevOfReturns * Math.sqrt(252) * 100;
  }

  return result;
}
