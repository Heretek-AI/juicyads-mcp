/**
 * Row shapes returned by the JuicyAds API v1.
 *
 * The API is stringly-typed: every field comes back as a JSON string or null,
 * including numeric-looking ones (`total`, `paid`, `spend`, `imps`, ids).
 * These interfaces document the expected shapes for readers; the client passes
 * responses through verbatim and never coerces values to numbers.
 */

export interface CampaignRow {
  id: string | null;
  campaign_name: string | null;
  buyer_id: string | null;
  accepted_countries: string | null;
  daily_max: string | null;
  daily_max_reached: string | null;
  url: string | null;
  amount: string | null;
  throttle: string | null;
  active: string | null;
  suspend: string | null;
  hide_campaign: string | null;
  lockdate: string | null;
  last_active: string | null;
  last_modified: string | null;
}

/** Advertiser statistics (spend/imps) grouped by date. */
export interface AdvertiserDateRow {
  thedate: string | null;
  spend: string | null;
  imps: string | null;
}

/** Advertiser statistics grouped by country code. */
export interface AdvertiserCountryRow {
  country_code: string | null;
  spend: string | null;
  imps: string | null;
}

/** Advertiser statistics grouped by site id. */
export interface AdvertiserSiteRow {
  site_id: string | null;
  spend: string | null;
  imps: string | null;
}

/** Publisher statistics (total/paid) grouped by date. */
export interface PublisherDateRow {
  thedate: string | null;
  total: string | null;
  paid: string | null;
}

/** Publisher statistics grouped by country code. */
export interface PublisherCountryRow {
  country_code: string | null;
  total: string | null;
  paid: string | null;
}

/** Publisher statistics grouped by site id. */
export interface PublisherSiteRow {
  site_id: string | null;
  total: string | null;
  paid: string | null;
}
