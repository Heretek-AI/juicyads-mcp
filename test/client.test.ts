import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { JuicyAdsClient } from "../src/client.ts";

const BASE = "https://api.example.test";
const realFetch = globalThis.fetch;

interface Call {
  url: string;
  headers: Record<string, string> | undefined;
  method: string | undefined;
}

/** A fresh client whose fetch is stubbed to record the exact request. */
function makeClient(token = "tok", calls: Call[] = []): JuicyAdsClient {
  globalThis.fetch = ((input: string, init?: RequestInit) => {
    calls.push({
      url: String(input),
      headers: init?.headers as Record<string, string> | undefined,
      method: init?.method,
    });
    return Promise.resolve(
      new Response('[{"probe": true}]', {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  }) as typeof fetch;
  return new JuicyAdsClient({ token, baseUrl: BASE });
}

after(() => {
  globalThis.fetch = realFetch;
});

function header(call: Call, name: string): string | undefined {
  const key = Object.keys(call.headers ?? {}).find((k) => k.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : call.headers?.[key];
}

describe("JuicyAdsClient URL building", () => {
  it("list-campaigns hits /campaigns/popunders/{token}", async () => {
    const calls: Call[] = [];
    const c = makeClient("tok", calls);
    await c.listCampaigns();
    assert.equal(calls[0]?.url, `${BASE}/campaigns/popunders/tok`);
  });

  it("advertiser stats carry the campaign id and hyphen dates", async () => {
    const calls: Call[] = [];
    const c = makeClient("tok", calls);
    await c.getAdvertiserStats("CAM1", "2026-09-02", "2026-09-08");
    assert.equal(
      calls[0]?.url,
      `${BASE}/statistics/popunders/advertiser/tok/CAM1/2026-09-02/2026-09-08`,
    );
  });

  it("advertiser by-country and by-site append their suffix", async () => {
    const calls: Call[] = [];
    const c = makeClient("tok", calls);
    await c.getAdvertiserStatsByCountry("CAM1", "2026-09-02", "2026-09-08");
    await c.getAdvertiserStatsBySite("CAM1", "2026-09-02", "2026-09-08");
    assert.equal(
      calls[0]?.url,
      `${BASE}/statistics/popunders/advertiser/tok/CAM1/2026-09-02/2026-09-08/country`,
    );
    assert.equal(
      calls[1]?.url,
      `${BASE}/statistics/popunders/advertiser/tok/CAM1/2026-09-02/2026-09-08/site`,
    );
  });

  it("publisher stats take NO campaign id and still use hyphen dates", async () => {
    const calls: Call[] = [];
    const c = makeClient("tok", calls);
    await c.getPublisherStats("2026-09-02", "2026-09-08");
    assert.equal(
      calls[0]?.url,
      `${BASE}/statistics/popunders/publisher/tok/2026-09-02/2026-09-08`,
    );
    // The only structural difference from advertiser is the missing campaign segment:
    assert.ok(!calls[0]!.url.includes("CAM"));
  });

  it("publisher by-country and by-site append their suffix", async () => {
    const calls: Call[] = [];
    const c = makeClient("tok", calls);
    await c.getPublisherStatsByCountry("2026-09-02", "2026-09-08");
    await c.getPublisherStatsBySite("2026-09-02", "2026-09-08");
    assert.equal(
      calls[0]?.url,
      `${BASE}/statistics/popunders/publisher/tok/2026-09-02/2026-09-08/country`,
    );
    assert.equal(
      calls[1]?.url,
      `${BASE}/statistics/popunders/publisher/tok/2026-09-02/2026-09-08/site`,
    );
  });

  it("URL-encodes hostile path segments (campaign id and token)", async () => {
    const calls: Call[] = [];
    const c = makeClient("t o/k", calls);
    await c.getAdvertiserStats("a b/c?d", "2026-09-02", "2026-09-08");
    assert.ok(calls[0]!.url.startsWith(`${BASE}/statistics/popunders/advertiser/t%20o%2Fk/`));
    assert.ok(calls[0]!.url.includes("/a%20b%2Fc%3Fd/"));
  });

  it("GET requests; token only ever in the path, never in headers", async () => {
    const calls: Call[] = [];
    const c = makeClient("secrettoken", calls);
    await c.listCampaigns();
    const call = calls[0]!;
    assert.equal(call.method, undefined); // default GET
    assert.ok(!call.url.includes("?"), "no query string");
    assert.equal(header(call, "authorization"), undefined);
    assert.equal(header(call, "accept"), "application/json");
    assert.ok((header(call, "user-agent") ?? "").startsWith("juicyads-mcp/"));
  });

  it("returns the parsed JSON body verbatim", async () => {
    const c = makeClient("tok");
    const body = (await c.getPublisherStats("2026-09-02", "2026-09-08")) as unknown[];
    assert.equal(body.length, 1);
    assert.deepEqual(body[0], { probe: true });
  });
});

describe("client error mapping", () => {
  it("maps a 401 JSON error to a message with the token hint — and never echoes the token", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ code: 401, message: "unauthorized" }), { status: 401 }),
      )) as typeof fetch;
    const c = new JuicyAdsClient({ token: "SECRETTOK123", baseUrl: BASE });
    await assert.rejects(
      () => c.listCampaigns(),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        const msg = err.message;
        assert.ok(msg.includes("HTTP 401"));
        assert.ok(msg.includes("code 401"));
        assert.ok(msg.includes("unauthorized"));
        assert.ok(msg.includes("JUICYADS_API_TOKEN"));
        assert.ok(!msg.includes("SECRETTOK123"));
        return true;
      },
    );
  });

  it("maps a non-JSON 500 body into the message", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(new Response("Internal Server Error", { status: 500 }))) as typeof fetch;
    const c = new JuicyAdsClient({ token: "tok", baseUrl: BASE });
    await assert.rejects(() => c.getPublisherStats("2026-09-02", "2026-09-08"), /HTTP 500.*Internal Server Error/);
  });

  it("turns a transport failure into a connectivity error", async () => {
    globalThis.fetch = (() => Promise.reject(new TypeError("fetch failed"))) as typeof fetch;
    const c = new JuicyAdsClient({ token: "tok", baseUrl: BASE });
    await assert.rejects(() => c.getPublisherStats("2026-09-02", "2026-09-08"), /connectivity to https:\/\/api\.juicyads\.com/);
  });
});
