/**
 * Date helpers for the JuicyAds API. All dates are the API's short ISO-8601
 * form `YYYY-MM-DD` — for request paths *and* response fields (verified
 * empirically: the publisher endpoints 404 if given underscore dates).
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Today's date as `YYYY-MM-DD` in the local calendar. */
export function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/** The date `n` days before today as `YYYY-MM-DD` (local calendar). */
export function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export interface DateRange {
  start: string;
  end: string;
}

/** A rolling inclusive last-7-days window ending today. */
export function defaultRange(): DateRange {
  return { start: daysAgoStr(6), end: todayStr() };
}

/** True when `s` is a real calendar date in `YYYY-MM-DD` form. */
export function isValidDateStr(s: string): boolean {
  if (!DATE_RE.test(s)) {
    return false;
  }
  const [y, m, d] = s.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    return false;
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Throws an actionable Error unless `start`/`end` are valid dates with start <= end. */
export function assertValidRange(start: string, end: string): void {
  if (!isValidDateStr(start)) {
    throw new Error(`Invalid start_date "${start}": expected a real calendar date in YYYY-MM-DD form.`);
  }
  if (!isValidDateStr(end)) {
    throw new Error(`Invalid end_date "${end}": expected a real calendar date in YYYY-MM-DD form.`);
  }
  if (start > end) {
    throw new Error(`start_date (${start}) must be on or before end_date (${end}).`);
  }
}

/**
 * Resolves optional tool arguments to a concrete range: absent dates default
 * to the last 7 days (inclusive, ending today), then the pair is validated.
 */
export function resolveRange(start?: string, end?: string): DateRange {
  const fallback = defaultRange();
  const startVal = start ?? fallback.start;
  const endVal = end ?? fallback.end;
  assertValidRange(startVal, endVal);
  return { start: startVal, end: endVal };
}
