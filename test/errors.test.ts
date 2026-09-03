import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiError, toApiError, toNetworkError } from "../src/errors.ts";

describe("toApiError", () => {
  it("decodes the API JSON error shape and attaches status + code", async () => {
    const res = new Response(JSON.stringify({ code: 401, message: "Unauthorized" }), { status: 401 });
    const err = await toApiError(res);
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 401);
    assert.equal(err.code, 401);
    assert.match(err.message, /HTTP 401/);
    assert.match(err.message, /code 401/);
    assert.match(err.message, /Unauthorized/);
  });

  it("adds a token hint on 401", async () => {
    const res = new Response(JSON.stringify({ code: 401, message: "Unauthorized" }), { status: 401 });
    const err = await toApiError(res);
    assert.match(err.message, /JUICYADS_API_TOKEN/);
  });

  it("adds a path-shape hint on 404", async () => {
    const res = new Response(JSON.stringify({ code: 404, message: "Page not found" }), { status: 404 });
    const err = await toApiError(res);
    assert.match(err.message, /Page not found/);
    assert.match(err.message, /campaign id/);
  });

  it("includes a short non-JSON body and truncates long ones", async () => {
    const short = new Response("Internal Server Error", { status: 500 });
    assert.match((await toApiError(short)).message, /Internal Server Error/);

    const longBody = "x".repeat(500);
    const long = new Response(longBody, { status: 502 });
    const msg = (await toApiError(long)).message;
    assert.ok(msg.length < 500, "long body should be truncated");
    assert.match(msg, /…$/);
  });

  it("falls back cleanly for an empty non-JSON body", async () => {
    const res = new Response("", { status: 500 });
    assert.match((await toApiError(res)).message, /no response body/);
  });
});

describe("toNetworkError", () => {
  it("wraps a fetch rejection with a connectivity message", () => {
    const err = toNetworkError(new TypeError("fetch failed"));
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, undefined);
    assert.match(err.message, /fetch failed/);
    assert.match(err.message, /connectivity to https:\/\/api\.juicyads\.com/);
  });

  it("never adds the API token to error text", async () => {
    const token = "sekrit-token-value";
    // HTTP path: our message is built only from the server body + fixed hints,
    // never from the token the client holds (the client-level leak check lives
    // in client.test.ts).
    const httpErr = await toApiError(
      new Response(JSON.stringify({ code: 401, message: "nope" }), { status: 401 }),
    );
    assert.ok(!httpErr.message.includes(token));
    // Network path: a cause that does not mention the token must not gain it.
    const netErr = toNetworkError(new Error("ECONNRESET"));
    assert.ok(!netErr.message.includes(token));
  });
});
