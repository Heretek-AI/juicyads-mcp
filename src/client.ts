import { BASE_URL, DEFAULT_TIMEOUT_MS, USER_AGENT } from "./constants.ts";
import { toApiError, toNetworkError } from "./errors.ts";

export interface JuicyAdsClientOptions {
  /** The JuicyAds API token, placed as a URL path segment on every request. */
  token: string;
  /** Overridable for tests/mocks. Defaults to the live API base URL. */
  baseUrl?: string;
  /** Abort timeout per request in ms. Defaults to 20s. */
  timeoutMs?: number;
}

/**
 * Thin, network-only client for the JuicyAds API v1 — the only module that
 * touches the network. All three options are injectable so unit tests need no
 * environment and no real network. Responses are passed through verbatim:
 * the API is stringly-typed and this client never coerces field values.
 */
export class JuicyAdsClient {
  readonly #token: string;
  readonly #baseUrl: string;
  readonly #timeoutMs: number;

  constructor(options: JuicyAdsClientOptions) {
    this.#token = options.token;
    this.#baseUrl = (options.baseUrl ?? BASE_URL).replace(/\/+$/, "");
    this.#timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /** GET /campaigns/popunders/{token} — the account's PopUnder campaigns. */
  async listCampaigns(): Promise<unknown> {
    return this.#get(`/campaigns/popunders/${this.#enc(this.#token)}`);
  }

  /** Advertiser stats by date (advertiser paths carry a campaign id). */
  async getAdvertiserStats(campaignId: string, start: string, end: string): Promise<unknown> {
    return this.#get(
      `/statistics/popunders/advertiser/${this.#enc(this.#token)}/${this.#enc(campaignId)}/${this.#enc(start)}/${this.#enc(end)}`,
    );
  }

  /** Advertiser stats grouped by country code. */
  async getAdvertiserStatsByCountry(campaignId: string, start: string, end: string): Promise<unknown> {
    return this.#get(
      `/statistics/popunders/advertiser/${this.#enc(this.#token)}/${this.#enc(campaignId)}/${this.#enc(start)}/${this.#enc(end)}/country`,
    );
  }

  /** Advertiser stats grouped by site id. */
  async getAdvertiserStatsBySite(campaignId: string, start: string, end: string): Promise<unknown> {
    return this.#get(
      `/statistics/popunders/advertiser/${this.#enc(this.#token)}/${this.#enc(campaignId)}/${this.#enc(start)}/${this.#enc(end)}/site`,
    );
  }

  /** Publisher stats by date (publisher paths take no campaign id). */
  async getPublisherStats(start: string, end: string): Promise<unknown> {
    return this.#get(
      `/statistics/popunders/publisher/${this.#enc(this.#token)}/${this.#enc(start)}/${this.#enc(end)}`,
    );
  }

  /** Publisher stats grouped by country code. */
  async getPublisherStatsByCountry(start: string, end: string): Promise<unknown> {
    return this.#get(
      `/statistics/popunders/publisher/${this.#enc(this.#token)}/${this.#enc(start)}/${this.#enc(end)}/country`,
    );
  }

  /** Publisher stats grouped by site id. */
  async getPublisherStatsBySite(start: string, end: string): Promise<unknown> {
    return this.#get(
      `/statistics/popunders/publisher/${this.#enc(this.#token)}/${this.#enc(start)}/${this.#enc(end)}/site`,
    );
  }

  #enc(segment: string): string {
    return encodeURIComponent(segment);
  }

  async #get(path: string): Promise<unknown> {
    let res: Response;
    try {
      res = await fetch(`${this.#baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        signal: AbortSignal.timeout(this.#timeoutMs),
      });
    } catch (cause) {
      throw toNetworkError(cause);
    }
    if (!res.ok) {
      throw await toApiError(res);
    }
    return (await res.json()) as unknown;
  }
}
