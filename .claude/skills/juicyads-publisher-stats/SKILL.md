---
name: juicyads-publisher-stats
description: "Pull and interpret JuicyAds PUBLISHER (seller) earnings and traffic statistics. Use whenever the user asks about JuicyAds revenue, earnings, paid, impressions, payouts, or daily/country/site breakdowns of their own publisher account, or asks which JuicyAds statistics tool to call. Operates through the juicyads MCP server tools get-publisher-stats, get-publisher-stats-by-country, and get-publisher-stats-by-site."
---

# JuicyAds publisher statistics

This account is a JuicyAds **publisher (seller)**: other advertisers buy traffic that
displays on your sites, and you earn from it. JuicyAds exposes read-only earnings
through the `juicyads` MCP server. **Prefer the three publisher tools below.** The
advertiser-side tools (`list-campaigns`, `get-advertiser-stats*`) describe campaigns
*you buy* and may return an empty array or a 401/404 for a publisher-only token —
report that as-is rather than treating it as a bug.

## Tools (server name `juicyads`; surface as `mcp__juicyads__*`)

| Tool | Returns |
|---|---|
| `get-publisher-stats` | rows per day: `[{ "thedate", "total", "paid" }, …]` |
| `get-publisher-stats-by-country` | rows per country code: `[{ "country_code", "total", "paid" }, …]` |
| `get-publisher-stats-by-site` | rows per site id: `[{ "site_id", "total", "paid" }, …]` |

## Calling conventions

- **Dates are optional.** Omit them for a rolling inclusive last-7-day window ending
  today; pass `start_date`/`end_date` in `YYYY-MM-DD` to bound the window.
- The JuicyAds API is **stringly typed**: every value comes back as a string or
  `null`, including `total` and `paid`. Do not coerce or reformat values; present
  them as returned. If you sum rows for the user, treat `null`/empty as absent and
  note that you summed the raw string values.
- `total` is a count (e.g. impressions served); `paid` is the amount earned. Neither
  raw field carries a currency symbol or decimal guarantee.

## How to answer "what did I earn …"

1. Call `get-publisher-stats` with no dates → per-day rows.
2. If the user wants *where* the earnings came from → `get-publisher-stats-by-site`,
   or `get-publisher-stats-by-country` for a geo breakdown.
3. Sum the `paid` column for a period total and present it clearly, e.g.
   "≈ 12.345 paid over the last 7 days", flagged as coming from the `paid` field.

See `references/stats-endpoints.md` for the full endpoint map and field tables, and
`references/reporting-workflow.md` for interpretation, sanity checks, and what "no
rows" means.
