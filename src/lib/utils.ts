import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ensureArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

export function isInvalidOrg(orgId: any): boolean {
  if (!orgId) return true;
  const lower = String(orgId).toLowerCase();
  return (
    lower === "dev-org-id" ||
    lower === "default-org" ||
    lower === "mock-org" ||
    lower === "development-org" ||
    lower === "temp-org" ||
    lower === "undefined" ||
    lower === "null" ||
    lower.trim() === ""
  );
}

export function formatCurrency(value: number, decimals: number = 2): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(absValue);

  return `${isNegative ? '-' : ''}$${formatted}`;
}

export function formatPercent(value: number, decimals: number = 2): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);

  return `${formatted}%`;
}

export function formatDeltaPercent(value: number, decimals: number = 2): string {
  const isNegative = value < 0;
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Math.abs(value));

  return `${isNegative ? '-' : '+'}${formatted}%`;
}

export const getDeterministicRandom = (input: string, seed: number) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(Math.sin(hash + seed) * 10000) % 1;
};

import { format as dateFnsFormat } from 'date-fns';

export function safeDate(dateValue: any): Date | null {
  if (dateValue === undefined || dateValue === null || dateValue === '') return null;
  try {
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
}

export function safeFormat(dateValue: any, formatStr: string, fallback: string = '--'): string {
  const d = safeDate(dateValue);
  if (!d) return fallback;
  try {
    return dateFnsFormat(d, formatStr);
  } catch (e) {
    return fallback;
  }
}

export function safeToLocaleString(dateValue: any, fallback: string = '--'): string {
  const d = safeDate(dateValue);
  if (!d) return fallback;
  try {
    return d.toLocaleString();
  } catch (e) {
    return fallback;
  }
}

export function safeToLocaleDateString(dateValue: any, fallback: string = '--', options?: Intl.DateTimeFormatOptions): string {
  const d = safeDate(dateValue);
  if (!d) return fallback;
  try {
    return d.toLocaleDateString(undefined, options);
  } catch (e) {
    return fallback;
  }
}

export function safeToLocaleTimeString(dateValue: any, fallback: string = '--'): string {
  const d = safeDate(dateValue);
  if (!d) return fallback;
  try {
    return d.toLocaleTimeString();
  } catch (e) {
    return fallback;
  }
}
