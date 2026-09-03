# Publisher reporting workflow

Day-to-day guidance for reading JuicyAds publisher earnings through the API.

## What the numbers mean

- **`total`** — the count of traffic attributed to you in the window (impressions
  served on your sites). A large `total` with small `paid` is normal on a low-CPM
  popunder inventory.
- **`paid`** — the earnings amount for those rows. This is gross earned revenue as
  reported by the API; JuicyAds pays out on its own schedule and may hold payments,
  so a day's `paid` here is *earned*, not necessarily *withdrawn*.
- Every value is a string or null; treat null/empty as "no figure", not zero, unless
  you say you are interpreting it as zero.

## Answering typical questions

- **"What did I earn?"** → `get-publisher-stats` (no dates), sum `paid`, summarize
  by day. Flag which days are missing traffic (no rows) so a short window isn't
  mistaken for "no earnings".
- **"Which sites earn the most?"** → `get-publisher-stats-by-site`. Site ids are
  opaque numeric strings here; map them to domains via the JuicyAds dashboard if the
  user needs names.
- **"Where does my traffic come from?"** → `get-publisher-stats-by-country`.

## Sanity checks

- Cross-check a period total against the JuicyAds **Statistics** tab / **Payments**
  page. The dashboard's "pending payments" figure (see JuicyAds help article
  *What are "Pending Payments"?*, `226310787`) reflects the payout pipeline and will
  differ from raw API `paid`.
- If a window returns `[]` (0 rows), the account served no tracked impressions in
  that window — check the date range first (timezone/day boundaries), then site
  status in the dashboard.
- Because this account can both buy and sell (see the `juicyads-policy` skill),
  confirm which side the user means before mixing `get-publisher-stats*`
  (earnings) with `get-advertiser-stats*` (spend on campaigns you run).

## Recurring checks you can script

Pull the last 7 days daily: `get-publisher-stats` then `get-publisher-stats-by-site`.
Store the raw strings; never reformat them in transit.
