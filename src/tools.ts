import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { JuicyAdsClient } from "./client.ts";
import { resolveRange } from "./dates.ts";

/**
 * Tool registry: one tool per documented JuicyAds v1 endpoint, 1:1.
 *
 * The endpoints differ in path shape (advertiser vs publisher, campaign id
 * present or not), response fields (`spend`/`imps` vs `total`/`paid`), and
 * natural-language intent, so a 1:1 surface with rich per-field descriptions
 * drives more reliable autonomous use than a parametric mega-tool.
 */

const DATE_DESCRIPTION =
  "Inclusive date in YYYY-MM-DD form (the JuicyAds date format). " +
  "Defaults to 6 days ago (rolling inclusive 7-day window ending today).";

const dateFields = {
  start_date: z.string().describe(DATE_DESCRIPTION + " Must be a real calendar date.").optional(),
  end_date: z
    .string()
    .describe(DATE_DESCRIPTION + " Must be on or after start_date.")
    .optional(),
};

const campaignField = {
  campaign_id: z
    .string()
    .describe(
      "The PopUnder campaign id, as a string from list-campaigns. Used as a URL path segment — " +
        "do not convert to a number or strip leading characters.",
    ),
};

const STRINGLY_TYPED_NOTE =
  "The JuicyAds API is stringly-typed: every field is returned verbatim as a JSON string or null " +
  "(including numeric-looking ones) — report values as-is, never coerce or reformat them.";

function jsonText(data: unknown) {
  const serialized = Array.isArray(data) && data.length === 0 ? "[] (0 rows)" : JSON.stringify(data, null, 2);
  return { content: [{ type: "text" as const, text: serialized }] };
}

export function registerAllTools(server: McpServer, client: JuicyAdsClient): void {
  server.registerTool(
    "list-campaigns",
    {
      description:
        "Lists the PopUnder campaigns visible to the account's advertiser side: " +
        "GET /campaigns/popunders/{token}. Response rows include id, campaign_name, accepted_countries, " +
        "daily_max, daily_max_reached, url, amount, throttle, active, suspend, hide_campaign, lockdate. " +
        "If this token has no advertiser-side campaigns the API may return an empty array or an error — " +
        "report what it returns. " + STRINGLY_TYPED_NOTE,
    },
    async () => {
      const data = await client.listCampaigns();
      return jsonText(data);
    },
  );

  server.registerTool(
    "get-advertiser-stats",
    {
      description:
        "Daily statistics (spend, imps) for ONE PopUnder campaign you are buying, grouped by date: " +
        "GET /statistics/popunders/advertiser/{token}/{campaign-id}/{start-date}/{end-date}. " +
        "Advertiser paths carry a campaign id (see get-publisher-stats for the no-campaign-id variant). " +
        "Response rows: thedate, spend, imps. " + STRINGLY_TYPED_NOTE,
      inputSchema: z.object({ ...campaignField, ...dateFields }),
    },
    async (args) => {
      const { start, end } = resolveRange(args.start_date, args.end_date);
      const data = await client.getAdvertiserStats(args.campaign_id, start, end);
      return jsonText(data);
    },
  );

  server.registerTool(
    "get-advertiser-stats-by-country",
    {
      description:
        "Statistics (spend, imps) for ONE PopUnder campaign you are buying, grouped by country code: " +
        "GET /statistics/popunders/advertiser/{token}/{campaign-id}/{start-date}/{end-date}/country. " +
        "Response rows: country_code, spend, imps. " + STRINGLY_TYPED_NOTE,
      inputSchema: z.object({ ...campaignField, ...dateFields }),
    },
    async (args) => {
      const { start, end } = resolveRange(args.start_date, args.end_date);
      const data = await client.getAdvertiserStatsByCountry(args.campaign_id, start, end);
      return jsonText(data);
    },
  );

  server.registerTool(
    "get-advertiser-stats-by-site",
    {
      description:
        "Statistics (spend, imps) for ONE PopUnder campaign you are buying, grouped by site id: " +
        "GET /statistics/popunders/advertiser/{token}/{campaign-id}/{start-date}/{end-date}/site. " +
        "Response rows: site_id, spend, imps. " + STRINGLY_TYPED_NOTE,
      inputSchema: z.object({ ...campaignField, ...dateFields }),
    },
    async (args) => {
      const { start, end } = resolveRange(args.start_date, args.end_date);
      const data = await client.getAdvertiserStatsBySite(args.campaign_id, start, end);
      return jsonText(data);
    },
  );

  server.registerTool(
    "get-publisher-stats",
    {
      description:
        "Publisher earnings/traffic statistics for the authenticated account, grouped by date. " +
        "This is the primary tool for a publisher (seller) account: GET /statistics/popunders/publisher/" +
        "{token}/{start_date}/{end_date}. NOTE: publisher paths take NO campaign id and no per-campaign " +
        "filter (contrast with get-advertiser-stats). Response rows: thedate, total (a count such as " +
        "impressions), paid (the earnings amount). " + STRINGLY_TYPED_NOTE,
      inputSchema: z.object(dateFields),
    },
    async (args) => {
      const { start, end } = resolveRange(args.start_date, args.end_date);
      const data = await client.getPublisherStats(start, end);
      return jsonText(data);
    },
  );

  server.registerTool(
    "get-publisher-stats-by-country",
    {
      description:
        "Publisher earnings/traffic statistics grouped by country code: " +
        "GET /statistics/popunders/publisher/{token}/{start_date}/{end_date}/country. " +
        "Takes NO campaign id. Response rows: country_code, total, paid. " + STRINGLY_TYPED_NOTE,
      inputSchema: z.object(dateFields),
    },
    async (args) => {
      const { start, end } = resolveRange(args.start_date, args.end_date);
      const data = await client.getPublisherStatsByCountry(start, end);
      return jsonText(data);
    },
  );

  server.registerTool(
    "get-publisher-stats-by-site",
    {
      description:
        "Publisher earnings/traffic statistics grouped by site id: " +
        "GET /statistics/popunders/publisher/{token}/{start_date}/{end_date}/site. " +
        "Takes NO campaign id. Response rows: site_id, total, paid. " + STRINGLY_TYPED_NOTE,
      inputSchema: z.object(dateFields),
    },
    async (args) => {
      const { start, end } = resolveRange(args.start_date, args.end_date);
      const data = await client.getPublisherStatsBySite(start, end);
      return jsonText(data);
    },
  );
}
