const TOKEN_ENV = "JUICYADS_API_TOKEN";

/**
 * Reads the JuicyAds API token from the environment.
 *
 * Call this once at server startup (never at module import time) so unit tests and
 * any non-server consumers can construct clients without an env var set.
 *
 * The JuicyAds API treats the token as a URL path segment on every endpoint, so a
 * missing token is a hard startup error with instructions rather than a deferred
 * failure on first tool call.
 */
export function getApiToken(): string {
  const token = process.env[TOKEN_ENV];
  if (!token || token.trim() === "") {
    throw new Error(
      `${TOKEN_ENV} is not set. The JuicyAds API token is required and is passed as a URL path segment. ` +
        `Start the server with: claude mcp add juicyads --env ${TOKEN_ENV}=<token> -- node dist/index.js`,
    );
  }
  return token;
}
