import { NormalizedBar } from "../types/index.ts";

/**
 * Calculates Simple Moving Average (SMA).
 */
export function calculateSMA(bars: NormalizedBar[], period: number, field: keyof NormalizedBar = "close"): number[] {
  const result: number[] = [];
  if (bars.length < period) return bars.map(() => 0);

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += Number(bars[i - j][field]);
    }
    result.push(sum / period);
  }
  return result;
}

/**
 * Calculates Exponential Moving Average (EMA).
 */
export function calculateEMA(bars: NormalizedBar[], period: number, field: keyof NormalizedBar = "close"): number[] {
  const result: number[] = [];
  if (bars.length === 0) return [];
  
  const k = 2 / (period + 1);
  let currentEMA = Number(bars[0][field]);
  result.push(currentEMA);

  for (let i = 1; i < bars.length; i++) {
    const val = Number(bars[i][field]);
    currentEMA = val * k + currentEMA * (1 - k);
    result.push(currentEMA);
  }

  // Zero out values before period to match industry standard padding
  for (let i = 0; i < Math.min(period - 1, bars.length); i++) {
    result[i] = 0;
  }
  return result;
}

/**
 * Calculates Weighted Moving Average (WMA).
 */
export function calculateWMA(bars: NormalizedBar[], period: number, field: keyof NormalizedBar = "close"): number[] {
  const result: number[] = [];
  if (bars.length < period) return bars.map(() => 0);

  const weightSum = (period * (period + 1)) / 2;

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      const weight = period - j;
      sum += Number(bars[i - j][field]) * weight;
    }
    result.push(sum / weightSum);
  }
  return result;
}

/**
 * Calculates Volume Weighted Moving Average (VWMA).
 */
export function calculateVWMA(bars: NormalizedBar[], period: number, field: keyof NormalizedBar = "close"): number[] {
  const result: number[] = [];
  if (bars.length < period) return bars.map(() => 0);

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }
    let pvSum = 0;
    let volSum = 0;
    for (let j = 0; j < period; j++) {
      const bar = bars[i - j];
      const p = Number(bar[field]);
      const v = Number(bar.volume);
      pvSum += p * v;
      volSum += v;
    }
    result.push(volSum === 0 ? Number(bars[i][field]) : pvSum / volSum);
  }
  return result;
}

/**
 * Calculates Hull Moving Average (HMA).
 * HMA = WMA(2 * WMA(price, n/2) - WMA(price, n), sqrt(n))
 */
export function calculateHMA(bars: NormalizedBar[], period: number, field: keyof NormalizedBar = "close"): number[] {
  const result: number[] = [];
  if (bars.length < period) return bars.map(() => 0);

  const halfPeriod = Math.floor(period / 2);
  const sqrtPeriod = Math.floor(Math.sqrt(period));

  // Compute 2 * WMA(n/2)
  const wmaHalf = calculateWMA(bars, halfPeriod, field);
  // Compute WMA(n)
  const wmaFull = calculateWMA(bars, period, field);

  // Compute diff: 2 * WMA1 - WMA2
  const rawDiffBars: NormalizedBar[] = bars.map((bar, i) => {
    const val = 2 * wmaHalf[i] - wmaFull[i];
    return {
      ...bar,
      [field]: val
    };
  });

  // Result is WMA(diff, sqrt(n))
  const hmaRaw = calculateWMA(rawDiffBars, sqrtPeriod, field);

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      result.push(0);
    } else {
      result.push(hmaRaw[i]);
    }
  }
  return result;
}

/**
 * Calculates Kaufman's Adaptive Moving Average (KAMA).
 */
export function calculateKAMA(bars: NormalizedBar[], period: number, field: keyof NormalizedBar = "close"): number[] {
  const result: number[] = [];
  if (bars.length < period) return bars.map(() => 0);

  const fastestSC = 2 / (2 + 1);
  const slowestSC = 2 / (30 + 1);

  let currentKAMA = Number(bars[period - 1][field]);
  
  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }
    if (i === period - 1) {
      result.push(currentKAMA);
      continue;
    }

    // Efficiency Ratio (ER)
    const change = Math.abs(Number(bars[i][field]) - Number(bars[i - period][field]));
    let volatilitySum = 0;
    for (let j = 0; j < period; j++) {
      volatilitySum += Math.abs(Number(bars[i - j][field]) - Number(bars[i - j - 1][field]));
    }

    const er = volatilitySum === 0 ? 0 : change / volatilitySum;
    const sc = Math.pow(er * (fastestSC - slowestSC) + slowestSC, 2);
    
    currentKAMA = currentKAMA + sc * (Number(bars[i][field]) - currentKAMA);
    result.push(currentKAMA);
  }
  return result;
}

/**
 * Calculates Adaptive Moving Average (AMA - custom style/Vidya)
 */
export function calculateAMA(bars: NormalizedBar[], period: number, field: keyof NormalizedBar = "close"): number[] {
  // Use calculateKAMA as our high-performance Adaptive Moving Average algorithm
  return calculateKAMA(bars, period, field);
}
