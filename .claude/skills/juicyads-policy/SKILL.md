---
name: juicyads-policy
description: "JuicyAds content-rating and account policy. Use when vetting whether a site, offer, or ad creative is allowed on JuicyAds, choosing the right content rating (Non Nude, Softcore, or Hardcore), or answering account questions such as buying and selling with one account, payout expectations, or how to get an account manager."
---

# JuicyAds content and account policy

Reference for the rules that gate what you can run and how the account works.

## Content ratings — the short version

JuicyAds offers exactly **three** buyable website content ratings, and it no longer
offers a "General / Non Adult" rating or a guarantee that only safe-for-work content
appears in your ad zones:

1. **Non Nude** — no nudity in the ad *images* (you may still promote nude/hardcore
   *websites*).
2. **Softcore** — nudity allowed, but no hardcore imagery (no penetration/oral
   imagery; many publishers treat any image featuring a penis as hardcore — avoid).
3. **Hardcore** — no content restrictions; publishers may still remove ads they deem
   obscene or off-brand for their site.

Non-compliance gets ads rejected/removed **without prior notice**. Full definitions
and how to classify a site: `references/content-ratings.md`.

## Account model — the short version

- **One account can both buy and sell ads.** All earnings (or account loads) land in
  one balance usable for purchasing or withdrawal. There is no requirement to keep
  advertiser and publisher activity in separate accounts.
- Account managers are free but require **$1,500+ deposited or spent**; below that,
  support handles site issues only, not buying/optimization advice. Details:
  `references/account-rules.md`.

## Where policy meets the API

The campaign settings surfaced by the `list-campaigns` MCP tool are the compliance
levers worth reviewing with a user: `accepted_countries`, `daily_max`,
`daily_max_reached`, `throttle`, `active`, `suspend`, `hide_campaign`. When a user
asks "is my campaign/site allowed", combine the ratings scale below with those
fields — the API itself does not expose content rating, so classify from what the
user tells you about the site/creative.
