import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { JuicyAdsClient } from "../src/client.ts";
import { ApiError } from "../src/errors.ts";
import { defaultRange } from "../src/dates.ts";

/**
 * Live smoke tests against the real JuicyAds API. The whole suite is skipped
 * unless JUICYADS_API_TOKEN is set, so `npm test` stays green (and performs no
 * network I/O) in environments without a token. Run with:
 *
 *   JUICYADS_API_TOKEN=… npm run test:live
 */

const token = process.env.JUICYADS_API_TOKEN?.trim();
const skip = token ? false : "JUICYADS_API_TOKEN not set — skipping live integration tests";

describe("JuicyAds live API (integration)", { skip }, () => {
  const client = new JuicyAdsClient({ token: token ?? "" });
  const { start, end } = defaultRange();

  // A campaign id observed on the advertiser side, if this token has one.
  let campaignId: string | undefined;

  // A token with no advertiser-side access returns 401/404 from advertiser
  // endpoints — that is a legitimate role limitation, not a failure. These
  // tests report it as a diagnostic instead of failing.
  function isRoleError(err: unknown): boolean {
    return err instanceof ApiError && (err.status === 401 || err.status === 404);
  }

  before(async () => {
    try {
      const campaigns = (await client.listCampaigns()) as Array<Record<string, unknown>>;
      campaignId = campaigns.map((c) => String(c.id)).find((id) => id.length > 0);
    } catch (err) {
      if (!isRoleError(err)) {
        throw err;
      }
      // No advertiser-side visibility — campaign-dependent tests will diagnose.
    }
  });

  it("publisher stats by date: array of {thedate,total,paid} rows, values string|null", async (t) => {
    const rows = (await client.getPublisherStats(start, end)) as Array<Record<string, unknown>>;
    assert.ok(Array.isArray(rows), "publisher by-date response should be an array");
    t.diagnostic(`publisher by-date returned ${rows.length} rows`);
    for (const row of rows) {
      for (const key of ["thedate", "total", "paid"]) {
        assert.ok(key in row, `publisher by-date row missing key "${key}"`);
        const v = row[key];
        assert.ok(typeof v === "string" || v === null, `"${key}" should be string|null, got ${typeof v}`);
      }
    }
  });

  it("publisher stats by country: array of {country_code,total,paid} rows", async (t) => {
    const rows = (await client.getPublisherStatsByCountry(start, end)) as Array<Record<string, unknown>>;
    assert.ok(Array.isArray(rows), "publisher by-country response should be an array");
    t.diagnostic(`publisher by-country returned ${rows.length} rows`);
    for (const key of ["country_code", "total", "paid"]) {
      assert.ok(key in (rows[0] ?? {}), `expected key "${key}" on by-country rows`);
    }
  });

  it("publisher stats by site: array of {site_id,total,paid} rows", async (t) => {
    const rows = (await client.getPublisherStatsBySite(start, end)) as Array<Record<string, unknown>>;
    assert.ok(Array.isArray(rows), "publisher by-site response should be an array");
    t.diagnostic(`publisher by-site returned ${rows.length} rows`);
    for (const key of ["site_id", "total", "paid"]) {
      assert.ok(key in (rows[0] ?? {}), `expected key "${key}" on by-site rows`);
    }
  });

  it("list-campaigns: array of campaign rows with the documented keys", async (t) => {
    let data: unknown;
    try {
      data = await client.listCampaigns();
    } catch (err) {
      if (isRoleError(err)) {
        t.diagnostic(`advertiser side unavailable for this token: ${(err as Error).message}`);
        return;
      }
      throw err;
    }
    assert.ok(Array.isArray(data), "list-campaigns response should be an array");
    const rows = data as Array<Record<string, unknown>>;
    t.diagnostic(`list-campaigns returned ${rows.length} campaigns`);
    if (rows[0]) {
      for (const key of ["id", "campaign_name", "url", "amount", "active", "accepted_countries"]) {
        assert.ok(key in rows[0], `campaign row missing key "${key}"`);
      }
    }
  });

  it("advertiser stats for the first visible campaign: {thedate,spend,imps} rows", async (t) => {
    if (!campaignId) {
      t.diagnostic("no advertiser campaign visible for this token — skipping advertiser stats");
      return;
    }
    try {
      const rows = (await client.getAdvertiserStats(campaignId, start, end)) as Array<
        Record<string, unknown>
      >;
      assert.ok(Array.isArray(rows), "advertiser by-date response should be an array");
      t.diagnostic(`advertiser stats for campaign ${campaignId}: ${rows.length} rows`);
      for (const key of ["thedate", "spend", "imps"]) {
        assert.ok(key in (rows[0] ?? {}), `expected key "${key}" on advertiser by-date rows`);
      }
    } catch (err) {
      if (isRoleError(err)) {
        t.diagnostic(`advertiser stats unavailable for this token: ${(err as Error).message}`);
        return;
      }
      throw err;
    }
  });
});
