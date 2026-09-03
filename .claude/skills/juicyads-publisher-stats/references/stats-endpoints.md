# JuicyAds API v1 — endpoint map and field tables

Source: `https://api.juicyads.com/docs/v1.txt` (the official, complete v1 surface —
7 read-only `GET` endpoints). Verified live 2026-09-02.

## General rules

- Base URL `https://api.juicyads.com`; every endpoint is HTTP `GET`.
- The API token is a **URL path segment** `{token}` on every endpoint (injected from
  `JUICYADS_API_TOKEN`; never in headers/query).
- Dates are `YYYY-MM-DD` everywhere — request paths *and* response fields. (The docs
  name publisher placeholders `start_date`/`end_date` with underscores, but the real
  URL still takes `2026-09-02`, not `2026_09_02` — verified: underscores return 404.)
- No pagination, no query parameters.
- Responses are JSON arrays of objects. **Every field value is a string or `null`**
  (stringly typed) — never coerce numbers.
- Errors are JSON `{ "code": 4xx, "message": "…" }`. `401` unauthorized, `404` not
  found.

## Path-shape differences (the easy way to mis-call this API)

| | Advertiser stats | Publisher stats |
|---|---|---|
| Path role | `/statistics/popunders/advertiser/{token}/{campaign-id}/{sd}/{ed}` | `/statistics/popunders/publisher/{token}/{sd}/{ed}` |
| Campaign id | **required** in path | **none** (account-wide) |
| Response fields | `spend`, `imps` | `total`, `paid` |
| Role | campaigns you buy | traffic sold on your sites |

Both use the same hyphenated `YYYY-MM-DD` dates.

## Endpoints

### 1. GET /campaigns/popunders/{token} — advertiser side
Lists the account's PopUnder campaigns (the campaigns *you buy*).
Fields: `id`, `campaign_name`, `buyer_id`, `accepted_countries`, `daily_max`,
`daily_max_reached`, `url`, `amount`, `throttle`, `active`, `suspend`,
`hide_campaign`, `lockdate`, `last_active`, `last_modified` (all string or null).

### 2–4. Advertiser statistics (per campaign)
`GET /statistics/popunders/advertiser/{token}/{campaign-id}/{start-date}/{end-date}`
with optional suffixes `/country` and `/site`.

| Grouping | Suffix | Row fields |
|---|---|---|
| by date | *(none)* | `thedate`, `spend`, `imps` |
| by country | `/country` | `country_code`, `spend`, `imps` |
| by site | `/site` | `site_id`, `spend`, `imps` |

`spend` = amount spent buying that traffic; `imps` = impressions.

### 5–7. Publisher statistics (account-wide — no campaign id)
`GET /statistics/popunders/publisher/{token}/{start}/{end}` with optional suffixes
`/country` and `/site`.

| Grouping | Suffix | Row fields |
|---|---|---|
| by date | *(none)* | `thedate`, `total`, `paid` |
| by country | `/country` | `country_code`, `total`, `paid` |
| by site | `/site` | `site_id`, `total`, `paid` |

`total` = count of traffic (e.g. impressions served on your sites); `paid` = the
amount you earned. Rows are sorted by the grouping key.

## Corresponding MCP tools

`list-campaigns`, `get-advertiser-stats`, `get-advertiser-stats-by-country`,
`get-advertiser-stats-by-site`, `get-publisher-stats`, `get-publisher-stats-by-country`,
`get-publisher-stats-by-site` — one tool per endpoint, 1:1. All stats tools default
dates to the last 7 days (inclusive) when omitted.
