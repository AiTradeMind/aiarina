import { NormalizedBar } from "../types/index.ts";
import { calculateEMA, calculateSMA } from "./movingAverages.ts";

/**
 * Calculates Relative Strength Index (RSI).
 */
export function calculateRSI(bars: NormalizedBar[], period: number): number[] {
  const result: number[] = [];
  if (bars.length < period + 1) return bars.map(() => 50);

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < bars.length; i++) {
    const change = Number(bars[i].close) - Number(bars[i - 1].close);
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  // First RSI Average
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // Pad the first values
  for (let i = 0; i < period; i++) {
    result.push(50);
  }

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - 100 / (1 + firstRS));

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  return result;
}

/**
 * Calculates MACD.
 */
export function calculateMACD(
  bars: NormalizedBar[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const total = bars.length;
  if (total === 0) return { macdLine: [], signalLine: [], histogram: [] };

  const emaFast = calculateEMA(bars, fastPeriod);
  const emaSlow = calculateEMA(bars, slowPeriod);

  const macdLine: number[] = [];
  for (let i = 0; i < total; i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }

  // Calculate EMA of macdLine
  const macdBars: NormalizedBar[] = macdLine.map((val, idx) => ({
    timestamp: bars[idx].timestamp,
    open: val,
    high: val,
    low: val,
    close: val,
    volume: 0,
  }));

  const signalLine = calculateEMA(macdBars, signalPeriod);
  const histogram: number[] = [];

  for (let i = 0; i < total; i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Calculates Commodity Channel Index (CCI).
 */
export function calculateCCI(bars: NormalizedBar[], period: number): number[] {
  const result: number[] = [];
  if (bars.length < period) return bars.map(() => 0);

  const tp: number[] = bars.map(bar => (Number(bar.high) + Number(bar.low) + Number(bar.close)) / 3);

  const tpBars: NormalizedBar[] = tp.map((v, i) => ({
    timestamp: bars[i].timestamp,
    open: v,
    high: v,
    low: v,
    close: v,
    volume: 0
  }));

  const smaTp = calculateSMA(tpBars, period);

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }

    let meanDevSum = 0;
    const currentSma = smaTp[i];
    for (let j = 0; j < period; j++) {
      meanDevSum += Math.abs(tp[i - j] - currentSma);
    }
    const meanDev = meanDevSum / period;

    if (meanDev === 0) {
      result.push(0);
    } else {
      const cci = (tp[i] - currentSma) / (0.015 * meanDev);
      result.push(cci);
    }
  }

  return result;
}

/**
 * Calculates Rate of Change (ROC).
 */
export function calculateROC(bars: NormalizedBar[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i < period) {
      result.push(0);
      continue;
    }
    const oldClose = Number(bars[i - period].close);
    const newClose = Number(bars[i].close);
    if (oldClose === 0) {
      result.push(0);
    } else {
      result.push(((newClose - oldClose) / oldClose) * 100);
    }
  }
  return result;
}

/**
 * Calculates Momentum.
 */
export function calculateMomentum(bars: NormalizedBar[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i < period) {
      result.push(0);
      continue;
    }
    const oldClose = Number(bars[i - period].close);
    const newClose = Number(bars[i].close);
    result.push(newClose - oldClose);
  }
  return result;
}

/**
 * Calculates Awesome Oscillator (AO).
 */
export function calculateAO(bars: NormalizedBar[]): number[] {
  const medianPrices: NormalizedBar[] = bars.map(bar => {
    const med = (Number(bar.high) + Number(bar.low)) / 2;
    return {
      ...bar,
      open: med,
      high: med,
      low: med,
      close: med
    };
  });

  const sma5 = calculateSMA(medianPrices, 5);
  const sma34 = calculateSMA(medianPrices, 34);

  const result: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i < 33) {
      result.push(0);
    } else {
      result.push(sma5[i] - sma34[i]);
    }
  }
  return result;
}

/**
 * Calculates TRIX.
 */
export function calculateTRIX(bars: NormalizedBar[], period: number): number[] {
  const ema1 = calculateEMA(bars, period);
  const ema1Bars = ema1.map((v, i) => ({ ...bars[i], close: v, open: v, high: v, low: v }));
  
  const ema2 = calculateEMA(ema1Bars, period);
  const ema2Bars = ema2.map((v, i) => ({ ...bars[i], close: v, open: v, high: v, low: v }));

  const ema3 = calculateEMA(ema2Bars, period);

  const result: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i === 0 || ema3[i - 1] === 0 || ema3[i] === 0) {
      result.push(0);
    } else {
      result.push(((ema3[i] - ema3[i - 1]) / ema3[i - 1]) * 100);
    }
  }
  return result;
}

/**
 * Calculates True Strength Index (TSI).
 */
export function calculateTSI(bars: NormalizedBar[], r = 25, s = 13): number[] {
  const result: number[] = [];
  if (bars.length < 2) return bars.map(() => 0);

  const pc: number[] = [0];
  const absPc: number[] = [0];

  for (let i = 1; i < bars.length; i++) {
    const diff = Number(bars[i].close) - Number(bars[i - 1].close);
    pc.push(diff);
    absPc.push(Math.abs(diff));
  }

  const pcBars = pc.map((v, i) => ({ ...bars[i], close: v, open: v, high: v, low: v }));
  const absPcBars = absPc.map((v, i) => ({ ...bars[i], close: v, open: v, high: v, low: v }));

  // Double smoothing
  const pcEma1 = calculateEMA(pcBars, r);
  const pcEma1Bars = pcEma1.map((v, i) => ({ ...bars[i], close: v, open: v, high: v, low: v }));
  const pcDoubleEma = calculateEMA(pcEma1Bars, s);

  const absPcEma1 = calculateEMA(absPcBars, r);
  const absPcEma1Bars = absPcEma1.map((v, i) => ({ ...bars[i], close: v, open: v, high: v, low: v }));
  const absPcDoubleEma = calculateEMA(absPcEma1Bars, s);

  for (let i = 0; i < bars.length; i++) {
    if (absPcDoubleEma[i] === 0) {
      result.push(0);
    } else {
      result.push(100 * (pcDoubleEma[i] / absPcDoubleEma[i]));
    }
  }
  return result;
}
