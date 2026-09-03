# S2S postbacks (banners & popunders)

Source: JuicyAds help article *S2S Postbacks (Banners & Popunder)* (`115000243174`).
Verified 2026-09-02.

## Concept

An S2S (server-to-server) postback URL passes conversion data from the affiliate
program back to JuicyAds. Every click carries a unique click id via `{dynamicS2S}`;
the postback returns that id to JuicyAds so the event is attributed to the
originating click (down to the Zone for banner campaigns).

## Where your real URLs come from

This is a dashboard action, not an API call: Campaign → **Performance Tracking** →
**S2S Postbacks**. JuicyAds gives you two URLs per campaign:

- a **Campaign Specific** URL, and
- a **Global** URL usable for all of your campaigns.

The Global URL is recommended — matching is by the unique click id, not by campaign.

## The variable you must get right

`{dynamicS2S}` must be returned in the **`s2s=`** URL variable of the postback.
`amount=` is the only other value you typically adjust (set manually or auto-set by
the affiliate program). A `token=` and `data=` pair are supplied with your real URL
from the UI.

## Banner postbacks

Base template (shape — your real URL from the UI carries your own `c=`, `token=`,
and `data=` values):

```
https://ck.juicyads.com/ilikeitjuicy.php?c={campaign_id}&s2s={dynamicS2S}&amount={amount}&token={per-account}&data={per-account}
```

- Landing URL example: `http://www.mydomain.com/?mycampaign=123&CLICKURL={dynamicS2S}`
- The affiliate program typically forwards its own click id, and the value in `s2s=`
  must be the `{dynamicS2S}` value you captured at click time.

### Optional `goal=` (banner campaigns)

Tracks separate events; **defaults to `1` if omitted; max 3 goals.** Examples from
the docs (goal #1 = Join Page, #2 = Free Signup, #3 = SignUps):

```
...?c=21519&s2s=$CLICKURL&amount=0&goal=1&token=…&data=…
...?c=21519&s2s=$CLICKURL&amount=0&goal=2&token=…&data=…
...?c=21519&s2s=$CLICKURL&amount=10.00&goal=3&token=…&data=…
```

(`$CLICKURL` is how one affiliate program forwards the click id captured from
`{dynamicS2S}`; your program may use a different placeholder — the id is what
matters.)

## Popunder postbacks

Base templates (sample URLs from the docs):

```
# Campaign Specific
https://xapi.juicyads.com/service_s2s.php?c={campaign_id}&s2s={dynamicS2S}&amount={Amount}&token={per-account}

# Global
https://xapi.juicyads.com/service_s2s.php?u={account_id}&s2s={dynamicS2S}&amount={Amount}&token={per-account}
```

- `{Amount}` is a placeholder **you replace** with the actual conversion amount (if
  applicable). `{dynamicS2S}` is auto-populated by JuicyAds when it fires the click.
- `u=` = global account id; `c=` = campaign id.
- Popunder campaigns have **no ImageID# or ZoneID#** — popunders operate under
  SiteID#'s only.

## Testing and operating

- Test successful conversions, failed conversions, and edge cases before production;
  then monitor and optimize.
- Events appear under the **Traffic Sources** tab; raw events are viewable on the
  **S2S Postbacks** page; KPIs/ROI appear under **Statistics**.
- Payout-status postbacks (e.g. paid/unpaid status) are **not** described on this
  page — for those see the related *Tracking Pixels (Banners Campaigns Only)*
  (`226488108`) and *S2S NATS* (`4508251923860`) articles.
