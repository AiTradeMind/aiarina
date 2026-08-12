import { NormalizedBar } from "../types/index.ts";
import { calculateEMA } from "./movingAverages.ts";

/**
 * Calculates On-Balance Volume (OBV).
 */
export function calculateOBV(bars: NormalizedBar[]): number[] {
  const result: number[] = [];
  if (bars.length === 0) return [];

  let currentOBV = 0;
  result.push(currentOBV);

  for (let i = 1; i < bars.length; i++) {
    const prevClose = Number(bars[i - 1].close);
    const curClose = Number(bars[i].close);
    const vol = Number(bars[i].volume);

    if (curClose > prevClose) {
      currentOBV += vol;
    } else if (curClose < prevClose) {
      currentOBV -= vol;
    }
    result.push(currentOBV);
  }

  return result;
}

/**
 * Calculates Volume Weighted Average Price (VWAP).
 */
export function calculateVWAP(bars: NormalizedBar[]): number[] {
  const result: number[] = [];
  let pvSum = 0;
  let volSum = 0;

  for (let i = 0; i < bars.length; i++) {
    const h = Number(bars[i].high);
    const l = Number(bars[i].low);
    const c = Number(bars[i].close);
    const v = Number(bars[i].volume);

    const typicalPrice = (h + l + c) / 3;
    pvSum += typicalPrice * v;
    volSum += v;

    result.push(volSum === 0 ? typicalPrice : pvSum / volSum);
  }

  return result;
}

/**
 * Calculates Accumulation Distribution (A/D).
 */
export function calculateAD(bars: NormalizedBar[]): number[] {
  const result: number[] = [];
  if (bars.length === 0) return [];

  let adSum = 0;

  for (let i = 0; i < bars.length; i++) {
    const h = Number(bars[i].high);
    const l = Number(bars[i].low);
    const c = Number(bars[i].close);
    const v = Number(bars[i].volume);

    let mfm = 0;
    if (h !== l) {
      mfm = ((c - l) - (h - c)) / (h - l);
    }
    const mfv = mfm * v;
    adSum += mfv;
    result.push(adSum);
  }

  return result;
}

/**
 * Calculates Chaikin Money Flow (CMF).
 */
export function calculateCMF(bars: NormalizedBar[], period = 20): number[] {
  const result: number[] = [];
  if (bars.length < period) return bars.map(() => 0);

  const mfvs: number[] = [];
  const vols: number[] = [];

  for (let i = 0; i < bars.length; i++) {
    const h = Number(bars[i].high);
    const l = Number(bars[i].low);
    const c = Number(bars[i].close);
    const v = Number(bars[i].volume);

    let mfm = 0;
    if (h !== l) {
      mfm = ((c - l) - (h - c)) / (h - l);
    }
    mfvs.push(mfm * v);
    vols.push(v);
  }

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }
    let mfvSum = 0;
    let volSum = 0;
    for (let j = 0; j < period; j++) {
      mfvSum += mfvs[i - j];
      volSum += vols[i - j];
    }
    result.push(volSum === 0 ? 0 : mfvSum / volSum);
  }

  return result;
}

/**
 * Calculates Money Flow Index (MFI).
 */
export function calculateMFI(bars: NormalizedBar[], period = 14): number[] {
  const result: number[] = [];
  if (bars.length < period + 1) return bars.map(() => 50);

  const typicalPrices = bars.map(b => (Number(b.high) + Number(b.low) + Number(b.close)) / 3);
  const rawMoneyFlows = bars.map((b, i) => typicalPrices[i] * Number(b.volume));

  // Pad the start
  for (let i = 0; i < period; i++) {
    result.push(50);
  }

  for (let i = period; i < bars.length; i++) {
    let posFlow = 0;
    let negFlow = 0;

    for (let j = 0; j < period; j++) {
      const idx = i - j;
      if (typicalPrices[idx] > typicalPrices[idx - 1]) {
        posFlow += rawMoneyFlows[idx];
      } else if (typicalPrices[idx] < typicalPrices[idx - 1]) {
        negFlow += rawMoneyFlows[idx];
      }
    }

    if (negFlow === 0) {
      result.push(100);
    } else {
      const moneyRatio = posFlow / negFlow;
      result.push(100 - 100 / (1 + moneyRatio));
    }
  }

  return result;
}

/**
 * Calculates Volume Oscillator.
 */
export function calculateVolumeOscillator(bars: NormalizedBar[], shortPeriod = 5, longPeriod = 10): number[] {
  // Map volumes as closes to use calculateEMA
  const volBars: NormalizedBar[] = bars.map(b => ({
    ...b,
    close: Number(b.volume),
    open: Number(b.volume),
    high: Number(b.volume),
    low: Number(b.volume)
  }));

  const shortEma = calculateEMA(volBars, shortPeriod);
  const longEma = calculateEMA(volBars, longPeriod);

  const result: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i < longPeriod - 1) {
      result.push(0);
    } else if (longEma[i] === 0) {
      result.push(0);
    } else {
      result.push(((shortEma[i] - longEma[i]) / longEma[i]) * 100);
    }
  }
  return result;
}
