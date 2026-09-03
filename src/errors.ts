const TRUNCATE_LEN = 200;
const BODY_FALLBACK = "(no response body)";

/**
 * An error raised when talking to the JuicyAds API: either a non-2xx HTTP
 * response or a transport failure before any response arrived.
 *
 * `status` is the HTTP status when an HTTP response was received; `code` is
 * the numeric code the API echoes in its JSON error body, when present.
 * Messages are written so they never include the API token.
 */
export class ApiError extends Error {
  readonly status: number | undefined;
  readonly code: unknown;

  constructor(message: string, status?: number, code?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Builds a friendly ApiError from a non-2xx HTTP response, decoding the API's
 * JSON error shape `{"code":4xx,"message":"..."}` when present. Non-JSON or
 * empty bodies fall back to a truncated copy of the raw body.
 */
export async function toApiError(res: Response): Promise<ApiError> {
  const status = res.status;
  const raw = await res.text();

  let message = BODY_FALLBACK;
  let bodyCode: unknown;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Not JSON — keep raw text below.
  }

  const isJsonError =
    parsed !== null &&
    typeof parsed === "object" &&
    typeof (parsed as { message?: unknown }).message === "string";
  if (isJsonError) {
    message = (parsed as { message: string }).message;
    bodyCode = (parsed as { code?: unknown }).code;
  } else if (raw.length > 0) {
    message = raw.length > TRUNCATE_LEN ? `${raw.slice(0, TRUNCATE_LEN)}…` : raw;
  }

  let hint = "";
  if (status === 401) {
    hint = " — the JUICYADS_API_TOKEN is invalid or unauthorized for this endpoint";
  } else if (status === 404) {
    hint =
      " — endpoint not found; double-check the Publisher-vs-Advertiser path shape (publisher paths take no campaign id)";
  }

  const codePart = bodyCode === undefined ? "" : `, code ${String(bodyCode)}`;
  return new ApiError(`JuicyAds API error (HTTP ${status}${codePart}): ${message}${hint}`, status, bodyCode);
}

/**
 * Builds a friendly ApiError for a request that failed before any HTTP
 * response arrived (DNS/TLS/network error, or timeout).
 */
export function toNetworkError(cause: unknown): ApiError {
  const detail = cause instanceof Error ? cause.message : String(cause);
  return new ApiError(
    `JuicyAds request failed before a response: ${detail}. Check connectivity to https://api.juicyads.com.`,
  );
}
