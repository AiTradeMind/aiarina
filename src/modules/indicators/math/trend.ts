import { NormalizedBar } from "../types/index.ts";
import { calculateEMA } from "./movingAverages.ts";

/**
 * Calculates DMI (+DI, -DI) and ADX.
 */
export function calculateADXAndDMI(
  bars: NormalizedBar[],
  period = 14
): { adx: number[]; plusDI: number[]; minusDI: number[] } {
  const len = bars.length;
  if (len < period + 1) {
    return {
      adx: bars.map(() => 0),
      plusDI: bars.map(() => 0),
      minusDI: bars.map(() => 0),
    };
  }

  const tr: number[] = [0];
  const plusDM: number[] = [0];
  const minusDM: number[] = [0];

  for (let i = 1; i < len; i++) {
    const curHigh = Number(bars[i].high);
    const curLow = Number(bars[i].low);
    const prevHigh = Number(bars[i - 1].high);
    const prevLow = Number(bars[i - 1].low);
    const prevClose = Number(bars[i - 1].close);

    // True Range
    const tr1 = curHigh - curLow;
    const tr2 = Math.abs(curHigh - prevClose);
    const tr3 = Math.abs(curLow - prevClose);
    tr.push(Math.max(tr1, tr2, tr3));

    // Directional Movements
    const upMove = curHigh - prevHigh;
    const downMove = prevLow - curLow;

    if (upMove > downMove && upMove > 0) {
      plusDM.push(upMove);
    } else {
      plusDM.push(0);
    }

    if (downMove > upMove && downMove > 0) {
      minusDM.push(downMove);
    } else {
      minusDM.push(0);
    }
  }

  // Smooth using Wilder's smoothing technique
  const smoothedTR: number[] = bars.map(() => 0);
  const smoothedPlusDM: number[] = bars.map(() => 0);
  const smoothedMinusDM: number[] = bars.map(() => 0);

  let initialTR = 0;
  let initialPlusDM = 0;
  let initialMinusDM = 0;

  for (let i = 1; i <= period; i++) {
    initialTR += tr[i];
    initialPlusDM += plusDM[i];
    initialMinusDM += minusDM[i];
  }

  smoothedTR[period] = initialTR;
  smoothedPlusDM[period] = initialPlusDM;
  smoothedMinusDM[period] = initialMinusDM;

  for (let i = period + 1; i < len; i++) {
    smoothedTR[i] = smoothedTR[i - 1] - smoothedTR[i - 1] / period + tr[i];
    smoothedPlusDM[i] = smoothedPlusDM[i - 1] - smoothedPlusDM[i - 1] / period + plusDM[i];
    smoothedMinusDM[i] = smoothedMinusDM[i - 1] - smoothedMinusDM[i - 1] / period + minusDM[i];
  }

  const plusDI: number[] = bars.map(() => 0);
  const minusDI: number[] = bars.map(() => 0);
  const dx: number[] = bars.map(() => 0);

  for (let i = period; i < len; i++) {
    const trVal = smoothedTR[i];
    if (trVal === 0) {
      plusDI[i] = 0;
      minusDI[i] = 0;
    } else {
      plusDI[i] = 100 * (smoothedPlusDM[i] / trVal);
      minusDI[i] = 100 * (smoothedMinusDM[i] / trVal);
    }

    const diff = Math.abs(plusDI[i] - minusDI[i]);
    const sum = plusDI[i] + minusDI[i];
    dx[i] = sum === 0 ? 0 : 100 * (diff / sum);
  }

  // Smooth DX to get ADX
  const adx: number[] = bars.map(() => 0);
  let initialDX = 0;
  for (let i = period; i < period * 2; i++) {
    if (i < len) initialDX += dx[i];
  }
  
  const adxStartIndex = Math.min(period * 2 - 1, len - 1);
  adx[adxStartIndex] = initialDX / period;

  for (let i = adxStartIndex + 1; i < len; i++) {
    adx[i] = (adx[i - 1] * (period - 1) + dx[i]) / period;
  }

  return { adx, plusDI, minusDI };
}

/**
 * Calculates Average True Range (ATR) helper.
 */
export function calculateATRRaw(bars: NormalizedBar[], period = 14): number[] {
  const atr: number[] = bars.map(() => 0);
  if (bars.length < period) return atr;

  const trs: number[] = [0];
  for (let i = 1; i < bars.length; i++) {
    const high = Number(bars[i].high);
    const low = Number(bars[i].low);
    const prevClose = Number(bars[i - 1].close);
    trs.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }

  let initialSum = 0;
  for (let i = 1; i <= period; i++) {
    initialSum += trs[i];
  }
  atr[period] = initialSum / period;

  for (let i = period + 1; i < bars.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + trs[i]) / period;
  }
  return atr;
}

/**
 * Calculates SuperTrend.
 */
export function calculateSuperTrend(
  bars: NormalizedBar[],
  period = 10,
  multiplier = 3
): { superTrend: number[]; direction: number[] } {
  const len = bars.length;
  const result = bars.map(() => 0);
  const direction = bars.map(() => 1); // 1 for long, -1 for short

  if (len < period) return { superTrend: result, direction };

  const atr = calculateATRRaw(bars, period);

  const upperBand = bars.map(() => 0);
  const lowerBand = bars.map(() => 0);

  for (let i = period; i < len; i++) {
    const med = (Number(bars[i].high) + Number(bars[i].low)) / 2;
    const atrVal = atr[i];

    upperBand[i] = med + multiplier * atrVal;
    lowerBand[i] = med - multiplier * atrVal;

    // Refined final bands logic
    const prevUpper = upperBand[i - 1];
    const prevLower = lowerBand[i - 1];
    const prevClose = Number(bars[i - 1].close);

    if (upperBand[i] > prevUpper && prevClose < prevUpper) {
      upperBand[i] = prevUpper;
    }
    if (lowerBand[i] < prevLower && prevClose > prevLower) {
      lowerBand[i] = prevLower;
    }

    if (Number(bars[i].close) > upperBand[i - 1]) {
      direction[i] = 1;
    } else if (Number(bars[i].close) < lowerBand[i - 1]) {
      direction[i] = -1;
    } else {
      direction[i] = direction[i - 1];
    }

    result[i] = direction[i] === 1 ? lowerBand[i] : upperBand[i];
  }

  return { superTrend: result, direction };
}

/**
 * Calculates Ichimoku Kinko Hyo.
 */
export function calculateIchimoku(
  bars: NormalizedBar[],
  tenkanPeriod = 9,
  kijunPeriod = 26,
  senkouBPeriod = 52,
  displacement = 26
): {
  tenkanSen: number[];
  kijunSen: number[];
  senkouSpanA: number[];
  senkouSpanB: number[];
  chikouSpan: number[];
} {
  const len = bars.length;
  const tenkanSen = bars.map(() => 0);
  const kijunSen = bars.map(() => 0);
  const senkouSpanA = bars.map(() => 0);
  const senkouSpanB = bars.map(() => 0);
  const chikouSpan = bars.map(() => 0);

  const getHighLowMid = (sliceBars: NormalizedBar[]) => {
    let high = -Infinity;
    let low = Infinity;
    for (const b of sliceBars) {
      if (Number(b.high) > high) high = Number(b.high);
      if (Number(b.low) < low) low = Number(b.low);
    }
    return (high + low) / 2;
  };

  for (let i = 0; i < len; i++) {
    // Tenkan Sen
    if (i >= tenkanPeriod - 1) {
      tenkanSen[i] = getHighLowMid(bars.slice(i - tenkanPeriod + 1, i + 1));
    }
    // Kijun Sen
    if (i >= kijunPeriod - 1) {
      kijunSen[i] = getHighLowMid(bars.slice(i - kijunPeriod + 1, i + 1));
    }
    // Senkou Span A (shifted 26 periods forward, so we plot for index i based on i - displacement)
    const refIndex = i - displacement;
    if (refIndex >= 0 && tenkanSen[refIndex] > 0 && kijunSen[refIndex] > 0) {
      senkouSpanA[i] = (tenkanSen[refIndex] + kijunSen[refIndex]) / 2;
    }
    // Senkou Span B
    if (i >= senkouBPeriod + displacement - 1) {
      senkouSpanB[i] = getHighLowMid(bars.slice(i - senkouBPeriod - displacement + 1, i - displacement + 1));
    }
    // Chikou Span (lagged 26 periods)
    if (i + displacement < len) {
      chikouSpan[i] = Number(bars[i + displacement].close);
    }
  }

  return { tenkanSen, kijunSen, senkouSpanA, senkouSpanB, chikouSpan };
}

/**
 * Calculates Parabolic SAR (PSAR).
 */
export function calculatePSAR(
  bars: NormalizedBar[],
  step = 0.02,
  maxStep = 0.2
): number[] {
  const len = bars.length;
  const sar = bars.map(() => 0);
  if (len < 2) return sar;

  let isLong = Number(bars[1].close) > Number(bars[0].close);
  let ep = isLong ? Number(bars[1].high) : Number(bars[1].low);
  let af = step;
  let currentSAR = isLong ? Number(bars[0].low) : Number(bars[0].high);

  sar[0] = currentSAR;
  sar[1] = currentSAR;

  for (let i = 2; i < len; i++) {
    const prevSAR = currentSAR;
    const curHigh = Number(bars[i - 1].high);
    const curLow = Number(bars[i - 1].low);

    if (isLong) {
      currentSAR = prevSAR + af * (ep - prevSAR);
      // Ensure SAR is not above the low of the last two periods
      const lowLimit = Math.min(Number(bars[i - 1].low), Number(bars[i - 2].low));
      if (currentSAR > lowLimit) currentSAR = lowLimit;

      if (Number(bars[i].low) < currentSAR) {
        isLong = false;
        currentSAR = ep; // Reverse SAR
        ep = Number(bars[i].low);
        af = step;
      } else {
        if (Number(bars[i].high) > ep) {
          ep = Number(bars[i].high);
          af = Math.min(af + step, maxStep);
        }
      }
    } else {
      currentSAR = prevSAR + af * (ep - prevSAR);
      // Ensure SAR is not below the high of the last two periods
      const highLimit = Math.max(Number(bars[i - 1].high), Number(bars[i - 2].high));
      if (currentSAR < highLimit) currentSAR = highLimit;

      if (Number(bars[i].high) > currentSAR) {
        isLong = true;
        currentSAR = ep; // Reverse SAR
        ep = Number(bars[i].high);
        af = step;
      } else {
        if (Number(bars[i].low) < ep) {
          ep = Number(bars[i].low);
          af = Math.min(af + step, maxStep);
        }
      }
    }
    sar[i] = currentSAR;
  }

  return sar;
}

/**
 * Calculates Aroon Indicator.
 */
export function calculateAroon(
  bars: NormalizedBar[],
  period = 25
): { aroonUp: number[]; aroonDown: number[] } {
  const len = bars.length;
  const aroonUp = bars.map(() => 0);
  const aroonDown = bars.map(() => 0);

  if (len < period) return { aroonUp, aroonDown };

  for (let i = period - 1; i < len; i++) {
    let highestIndex = -1;
    let highestHigh = -Infinity;
    let lowestIndex = -1;
    let lowestLow = Infinity;

    for (let j = 0; j < period; j++) {
      const idx = i - j;
      const h = Number(bars[idx].high);
      const l = Number(bars[idx].low);

      if (h > highestHigh) {
        highestHigh = h;
        highestIndex = j;
      }
      if (l < lowestLow) {
        lowestLow = l;
        lowestIndex = j;
      }
    }

    aroonUp[i] = ((period - highestIndex) / period) * 100;
    aroonDown[i] = ((period - lowestIndex) / period) * 100;
  }

  return { aroonUp, aroonDown };
}

/**
 * Calculates Moving Average Ribbon (6 EMAs).
 */
export function calculateMARibbon(
  bars: NormalizedBar[],
  periods = [5, 10, 15, 20, 25, 30]
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const p of periods) {
    result[`ema_${p}`] = calculateEMA(bars, p);
  }
  return result;
}
