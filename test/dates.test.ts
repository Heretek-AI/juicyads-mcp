import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  todayStr,
  daysAgoStr,
  defaultRange,
  isValidDateStr,
  assertValidRange,
  resolveRange,
} from "../src/dates.ts";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

describe("todayStr / daysAgoStr", () => {
  it("returns YYYY-MM-DD", () => {
    assert.match(todayStr(), DATE_RE);
  });

  it("daysAgoStr(n) is a valid date n days before todayStr()", () => {
    const today = new Date(`${todayStr()}T00:00:00Z`);
    const ago = new Date(`${daysAgoStr(6)}T00:00:00Z`);
    const diffMs = today.getTime() - ago.getTime();
    assert.equal(diffMs, 6 * 24 * 60 * 60 * 1000);
  });
});

describe("defaultRange", () => {
  it("is an inclusive 7-day window ending today", () => {
    const r = defaultRange();
    assert.equal(r.end, todayStr());
    assert.equal(r.start, daysAgoStr(6));
    assert.ok(r.start <= r.end);
  });
});

describe("isValidDateStr", () => {
  it("accepts real calendar dates", () => {
    assert.equal(isValidDateStr("2026-09-02"), true);
    assert.equal(isValidDateStr("2024-02-29"), true); // leap year
    assert.equal(isValidDateStr("2026-01-31"), true);
  });

  it("rejects malformed and impossible dates", () => {
    assert.equal(isValidDateStr("2026-02-31"), false);
    assert.equal(isValidDateStr("2026-13-01"), false);
    assert.equal(isValidDateStr("2026-00-10"), false);
    assert.equal(isValidDateStr("2023-02-29"), false); // not a leap year
    assert.equal(isValidDateStr("2026-9-02"), false); // month not zero-padded
    assert.equal(isValidDateStr("2026-09-2"), false); // day not zero-padded
    assert.equal(isValidDateStr("not-a-date"), false);
    assert.equal(isValidDateStr(""), false);
  });
});

describe("assertValidRange", () => {
  it("accepts start == end", () => {
    assert.doesNotThrow(() => assertValidRange("2026-09-01", "2026-09-01"));
  });

  it("rejects an impossible start date", () => {
    assert.throws(() => assertValidRange("2026-02-31", "2026-09-01"), /2026-02-31/);
  });

  it("rejects an impossible end date", () => {
    assert.throws(() => assertValidRange("2026-09-01", "2026-13-01"), /2026-13-01/);
  });

  it("rejects reversed ranges with both values in the message", () => {
    assert.throws(
      () => assertValidRange("2026-09-05", "2026-09-01"),
      (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        return msg.includes("2026-09-05") && msg.includes("2026-09-01");
      },
    );
  });
});

describe("resolveRange", () => {
  it("defaults absent dates to the last 7 days", () => {
    const r = resolveRange();
    assert.equal(r.end, todayStr());
    assert.equal(r.start, daysAgoStr(6));
  });

  it("defaults only the missing edge", () => {
    const r = resolveRange("2026-08-01");
    assert.equal(r.start, "2026-08-01");
    assert.equal(r.end, todayStr());
  });

  it("passes provided dates through after validation", () => {
    assert.deepEqual(resolveRange("2026-08-01", "2026-08-10"), {
      start: "2026-08-01",
      end: "2026-08-10",
    });
  });

  it("throws on a reversed provided range", () => {
    assert.throws(() => resolveRange("2026-09-10", "2026-09-01"), /must be on or before/);
  });
});
