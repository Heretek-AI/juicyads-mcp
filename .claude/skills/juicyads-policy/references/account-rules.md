# Account rules: buying + selling, payouts, account managers

Sources: JuicyAds help articles *Can I use one account to Buy and Sell ads?*
(`226308287`), *How can I work with an Account Manager?* (`226483948`), and *What are
"Pending Payments"?* (`226310787`, title only). Verified 2026-09-02.

## One account, both sides

> Yes. When you sign up for an account you can use it for both the selling and buying
> ads. All earnings (or account loads) are placed into your account balance for
> purchasing or withdrawal.

- No separate advertiser/network accounts are required.
- The same API token therefore talks to both sides; `get-publisher-stats*` reads
  earnings, `list-campaigns` / `get-advertiser-stats*` read the campaigns you buy.
  A token can still be role-limited by permissions — treat advertiser-side
  401/404 on a token that works for publisher stats as a role limitation.

## Payouts / pending payments

Earnings accrue to the single balance. The dashboard shows "pending payments" for
amounts in the payout pipeline — that figure differs from raw API `paid` (earned but
not yet payable/paid). Direct users to the Payments page for payout timing; the API
does not expose payout scheduling.

## Account manager

- JuicyAds is self-serve, but a dedicated Account Manager can help optimize campaigns
  and knows the adult industry.
- **No extra charge**, but JuicyAds requires a **minimum deposit of $1,500** (high
  demand). Qualification is spending/depositing **$1,500+**.
- If none is assigned, you must request one. Contact **billk@juicyads.com** or the
  Contact form.
- Managers are located across North/South America and Europe; JuicyAds assigns the
  best fit, or you can ask for a specific person. Sales-team bios:
  https://www.juicyads.com/about/
- Below the threshold, live support is available any time but **cannot** help with
  buying recommendations or optimization inquiries — only site-related inquiries.
