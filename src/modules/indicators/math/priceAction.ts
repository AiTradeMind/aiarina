import { NormalizedBar } from "../types/index.ts";

export interface PivotPointsResult {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

/**
 * Calculates Pivot Points (Standard).
 */
export function calculatePivotPoints(bars: NormalizedBar[]): PivotPointsResult {
  if (bars.length === 0) {
    return { pivot: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 };
  }

  // Usually calculated on previous complete bar (e.g. previous day/hour)
  const prevBar = bars[bars.length - 1];
  const h = Number(prevBar.high);
  const l = Number(prevBar.low);
  const c = Number(prevBar.close);

  const pp = (h + l + c) / 3;
  const r1 = 2 * pp - l;
  const s1 = 2 * pp - h;
  const r2 = pp + (h - l);
  const s2 = pp - (h - l);
  const r3 = h + 2 * (pp - l);
  const s3 = l - 2 * (h - pp);

  return { pivot: pp, r1, r2, r3, s1, s2, s3 };
}

export interface SwingPoint {
  index: number;
  timestamp: string | Date;
  price: number;
  type: "HIGH" | "LOW";
}

/**
 * Detects Swing Highs and Swing Lows (Left and Right strength = 2).
 */
export function detectSwingPoints(bars: NormalizedBar[], strength = 2): SwingPoint[] {
  const points: SwingPoint[] = [];
  const len = bars.length;
  if (len < 2 * strength + 1) return [];

  for (let i = strength; i < len - strength; i++) {
    const curHigh = Number(bars[i].high);
    const curLow = Number(bars[i].low);

    let isSwingHigh = true;
    let isSwingLow = true;

    for (let j = 1; j <= strength; j++) {
      if (Number(bars[i - j].high) >= curHigh || Number(bars[i + j].high) > curHigh) {
        isSwingHigh = false;
      }
      if (Number(bars[i - j].low) <= curLow || Number(bars[i + j].low) < curLow) {
        isSwingLow = false;
      }
    }

    if (isSwingHigh) {
      points.push({ index: i, timestamp: bars[i].timestamp, price: curHigh, type: "HIGH" });
    }
    if (isSwingLow) {
      points.push({ index: i, timestamp: bars[i].timestamp, price: curLow, type: "LOW" });
    }
  }

  return points;
}

export interface GapResult {
  index: number;
  timestamp: string | Date;
  gapSize: number;
  gapPercent: number;
  type: "UP" | "DOWN";
}

/**
 * Detects price Gaps.
 */
export function detectGaps(bars: NormalizedBar[], thresholdPercent = 0.5): GapResult[] {
  const gaps: GapResult[] = [];
  if (bars.length < 2) return [];

  for (let i = 1; i < bars.length; i++) {
    const prevClose = Number(bars[i - 1].close);
    const curOpen = Number(bars[i].open);
    if (prevClose === 0) continue;

    const gapSize = curOpen - prevClose;
    const gapPercent = (gapSize / prevClose) * 100;

    if (Math.abs(gapPercent) >= thresholdPercent) {
      gaps.push({
        index: i,
        timestamp: bars[i].timestamp,
        gapSize,
        gapPercent,
        type: gapPercent > 0 ? "UP" : "DOWN",
      });
    }
  }

  return gaps;
}

export interface StructureMarker {
  index: number;
  timestamp: string | Date;
  type: "HH" | "LH" | "HL" | "LL"; // Higher High, Lower High, Higher Low, Lower Low
  price: number;
}

/**
 * Identifies market structure HH, LH, HL, LL from Swing Points.
 */
export function calculateMarketStructure(bars: NormalizedBar[], strength = 2): StructureMarker[] {
  const swings = detectSwingPoints(bars, strength);
  const markers: StructureMarker[] = [];

  let lastHigh: SwingPoint | null = null;
  let lastLow: SwingPoint | null = null;

  for (const sw of swings) {
    if (sw.type === "HIGH") {
      if (lastHigh) {
        if (sw.price > lastHigh.price) {
          markers.push({ index: sw.index, timestamp: sw.timestamp, type: "HH", price: sw.price });
        } else {
          markers.push({ index: sw.index, timestamp: sw.timestamp, type: "LH", price: sw.price });
        }
      }
      lastHigh = sw;
    } else {
      if (lastLow) {
        if (sw.price < lastLow.price) {
          markers.push({ index: sw.index, timestamp: sw.timestamp, type: "LL", price: sw.price });
        } else {
          markers.push({ index: sw.index, timestamp: sw.timestamp, type: "HL", price: sw.price });
        }
      }
      lastLow = sw;
    }
  }

  return markers;
}

/**
 * Calculates Dynamic Support and Resistance levels from active swing points.
 */
export function calculateSupportResistance(bars: NormalizedBar[], strength = 2): { support: number[]; resistance: number[] } {
  const swings = detectSwingPoints(bars, strength);
  const support = bars.map(() => 0);
  const resistance = bars.map(() => 0);

  let currentSupport = 0;
  let currentResistance = 0;

  const swingMap = new Map<number, SwingPoint>();
  for (const sw of swings) {
    swingMap.set(sw.index, sw);
  }

  for (let i = 0; i < bars.length; i++) {
    const sw = swingMap.get(i);
    if (sw) {
      if (sw.type === "LOW") {
        currentSupport = sw.price;
      } else {
        currentResistance = sw.price;
      }
    }
    support[i] = currentSupport;
    resistance[i] = currentResistance;
  }

  return { support, resistance };
}
