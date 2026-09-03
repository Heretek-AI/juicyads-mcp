# Dynamic link tokens / macros

Source: JuicyAds help articles *Dynamic Links (aka Tokens / Macros)* (`226488048`)
and *Dynamic Linking (aka Tokens / Macros) and how to use them* (`226351807`).
Verified 2026-09-02.

**There is no `{click_id}` macro.** The unique per-click identifier is
`{dynamicS2S}`.

## Core macros

| Token | Substituted value | Available |
|---|---|---|
| `{dynamicPUB}` | Publisher ID | Banners and Pops |
| `{dynamicSITE}` | SiteID # the ad displayed on | Banners and Pops |
| `{dynamicZNE}` | AdZone ID # the ad displayed on | **Banners only** — Pops are sold by SiteID only |
| `{dynamicIMG}` | Campaign Image ID # | **Banners only** |
| `{dynamicIMGNAME}` | Campaign image filename (at upload) without the extension | **Banners only** |
| `{dynamicCMP}` | The JuicyAds campaign ID # | Banners and Pops |
| `{dynamicGEO}` | 2-character country code (US, CA, TW, …) | Banners and Pops |
| `{dynamicS2S}` | Unique per-click id, 31 chars (e.g. `2016090657ce3f40009809.96070516`) | Banners and Pops |
| `{dynamicBID}` | Cost per click (CPC) / cost per impression (CPM) at click/impression time (e.g. CPC $0.01, CPM $0.0001) | Banners and Pops |

## Date and time (banners)

| Token | Substituted value | Available |
|---|---|---|
| `{dynamicDATE}` | Date of the transaction | Banners |
| `{dynamicHOUR}` | Hour of the transaction | Banners |

## Device and connection (popunders only)

| Token | Substituted value | Available |
|---|---|---|
| `{dynamicCON}` | Connection type: Wifi or Carrier | PopUnders only |
| `{dynamicDTY}` | Device type | PopUnders only |
| `{dynamicDOS}` | Device OS (iOS, Android, …) | PopUnders only |

## How to use them

Dynamic linking works on **all JuicyAds URL links**: Direct Buy, Network Campaigns,
PopUnders, and Mobile Campaigns. Append a token to the end of a URL; JuicyAds passes
the runtime value back into your URL string. Typical purpose: set unique tracking
codes and identify which Sites/Zones/Devices convert, then block or remove the ones
that do not.

Examples (token → substituted value):

- `http://randomsite.com/affiliates/in/?track={dynamicSITE}&tour=wFE6&campaign=DPLqH`
  → `…/?track=54321&tour=wFE6&campaign=DPLqH` (Site ID substituted)
- Multiple tokens: join them with an **underscore** between tokens —
  `https://example.com/in.php?track={dynamicGEO}_{dynamicSITE}_{dynamicCMP}`
  → `…/in.php?track=US_54321_10251` (Geo_SiteID_CampaignID)

If unsure where the tag goes in a third-party funnel, ask the affiliate where their
tracking link is consumed. Tokens substitute into your own query parameters — keep
the rest of the URL structurally valid.
