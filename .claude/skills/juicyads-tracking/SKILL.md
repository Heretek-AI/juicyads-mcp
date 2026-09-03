---
name: juicyads-tracking
description: "JuicyAds conversion-tracking and link-building reference: dynamic link macros/tokens such as {dynamicS2S}, {dynamicSITE}, {dynamicGEO}, and server-to-server (S2S) postback URLs for banner and popunder campaigns. Use when generating, explaining, or debugging JuicyAds tracking links, click tokens, macros, or postback/pixel integration."
---

# JuicyAds tracking: dynamic links and S2S postbacks

Two linked mechanisms move click and conversion data in and out of JuicyAds:

1. **Dynamic link tokens (macros)** — you append tokens to a click/campaign URL and
   JuicyAds substitutes runtime values (site id, geo, the unique click id, …) when it
   fires the link, so *your* tracking server receives per-click data.
2. **S2S postbacks** — when a conversion (signup/sale/install) happens in your
   funnel, your server calls JuicyAds back with the unique click id so the event is
   attributed to the originating click/campaign/zone.

## The one rule that matters

**There is no `{click_id}` token on JuicyAds.** The unique per-click identifier is
`{dynamicS2S}` (a 31-character string such as `2016090657ce3f40009809.96070516`), and
it is the value a postback must return in its `s2s=` parameter for attribution to
work.

## Quick reference

- Full macro inventory + availability: `references/link-macros.md`
- Postback URL templates for banners and popunders: `references/s2s-postbacks.md`
- Obtaining your real postback URLs is a dashboard action (Campaign →
  **Performance Tracking** → **S2S Postbacks**), not an API call — the API is
  read-only and does not create or edit campaigns.

## Building a compliant tracking link

1. Decide what you need to know per click (site? zone? geo? offer variant?).
2. Pick the matching tokens from `references/link-macros.md`.
3. Append them as query parameters; join multiple tokens with an underscore between
   tokens, e.g. `?track={dynamicGEO}_{dynamicSITE}_{dynamicCMP}`.
4. Keep `{dynamicS2S}` in every click URL if you intend to post back conversions.

Banner campaigns expose zone/image ids (`{dynamicZNE}`, `{dynamicIMG}`) and can
attribute postbacks down to the zone; **popunders are sold by site only** and expose
no zone/image tokens.
