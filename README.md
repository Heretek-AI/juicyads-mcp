# juicyads-mcp

An MCP server + Claude Code skills for [JuicyAds](https://www.juicyads.com/), the ad
network. The MCP server wraps the **JuicyAds API v1** (its full documented surface:
7 read-only `GET` endpoints) as one tool per endpoint. The skills encode JuicyAds
domain knowledge from the official help center (dynamic-link macros, S2S postbacks,
content ratings, account rules).

The account is primarily a **publisher (seller)** here, so the publisher earnings
tools lead — but every documented endpoint is covered on both sides.

## What's in the repo

- **MCP server** (TypeScript, root of this repo) — `src/`, builds to `dist/`.
- **Skills** — `.claude/skills/`:
  - `juicyads-publisher-stats` — pull and interpret publisher earnings/traffic via
    the MCP tools (dates default to the last 7 days).
  - `juicyads-tracking` — dynamic-link macros/tokens and S2S postback URL templates
    for banner and popunder campaigns.
  - `juicyads-policy` — content ratings (Non Nude / Softcore / Hardcore) and account
    rules (one account buys + sells; account-manager thresholds).

## Requirements

- Node.js ≥ 24 (tests also rely on Node's built-in type stripping for `.ts`)

## Install & build

```sh
npm install
npm run build        # tsc -> dist/
npm run typecheck    # type-checks src + test (no emit)
```

## Connect the MCP server to Claude Code

Run from the repo root. The server reads `JUICYADS_API_TOKEN` from the process
environment at startup (it is a URL path segment on every JuicyAds request) and
**fails fast** with guidance if it is missing.

**Option A — project-scoped `.mcp.json` (committed).** This repo ships one that
interpolates the token from the shell you launch Claude from:

```sh
export JUICYADS_API_TOKEN=<your token>
claude
```

The token then lives only in your shell profile/session — never in the repo.

**Option B — register with a literal env value (single-user machines):**

```sh
claude mcp add juicyads --env JUICYADS_API_TOKEN=<your token> -- node dist/index.js
```

Note: `claude mcp add --env` writes the literal value into Claude Code's config
(`~/.claude.json`), so prefer Option A on shared machines.

The token must not be committed or shared; see `.env.example`. A local `.env` file
is gitignored and can be used with `set -a; source .env` for local runs.

## Tools (server name `juicyads`, surface as `mcp__juicyads__*`)

| Tool | Endpoint | Notes |
|---|---|---|
| `list-campaigns` | `GET /campaigns/popunders/{token}` | campaigns you buy |
| `get-advertiser-stats` | `GET /statistics/popunders/advertiser/{token}/{cid}/{sd}/{ed}` | `thedate, spend, imps` |
| `get-advertiser-stats-by-country` | `…/country` | `country_code, spend, imps` |
| `get-advertiser-stats-by-site` | `…/site` | `site_id, spend, imps` |
| `get-publisher-stats` | `GET /statistics/popunders/publisher/{token}/{sd}/{ed}` | **no campaign id**; `thedate, total, paid` |
| `get-publisher-stats-by-country` | `…/country` | `country_code, total, paid` |
| `get-publisher-stats-by-site` | `…/site` | `site_id, total, paid` |

All stats tools take optional `start_date`/`end_date` in `YYYY-MM-DD` (default: a
rolling inclusive last-7-day window). Advertiser tools also require a `campaign_id`.

## API facts baked into the tools (learned + verified)

- **Stringly typed.** Every field comes back as a JSON string or `null` (including
  `total`, `paid`, `spend`, `imps`, ids). Tools return it verbatim — never coerce.
- **Dates are hyphenated `YYYY-MM-DD` everywhere.** The docs name publisher
  placeholders `start_date`/`end_date`, but underscore dates return 404 (verified
  live); the only real difference is that publisher paths take **no campaign id**.
- Advertiser rows use `spend`/`imps`; publisher rows use `total`/`paid`.
- Errors are `{ "code": 4xx, "message": … }`; 401 and 404 get extra hints. A
  publisher-only token may get 401/404 from advertiser endpoints — that is a role
  limitation, not a bug.

## Development

```sh
npm test                 # unit tests + (skipped without a token) live integration
npm run test:unit        # offline unit tests (no env needed, no network)
npm run test:live        # live API smoke tests — requires JUICYADS_API_TOKEN
npm run dev              # run the server from src with node --watch
```

Unit tests cover the load-bearing URL shapes (advertiser hyphen dates + campaign
segment vs publisher no-campaign path), date validation, and error mapping — all
offline, with `fetch` stubbed. The live suite self-skips when
`JUICYADS_API_TOKEN` is unset.

## Architecture

Pure, unit-testable core with no SDK/zod imports: `src/client.ts` (the only network
module), `src/dates.ts`, `src/errors.ts`, `src/types.ts`, `src/constants.ts`. `src/
tools.ts` maps 7 tools onto the client and registers them on an
`McpServer` (the `@modelcontextprotocol/server` v2 line); `src/index.ts` wires the
token check, server, and stdio transport.

## Publishing & releases

The package is published to npm as **`@heretek-ai/juicyads-mcp`** (public, scoped
under the `heretek-ai` organization). Anyone can run the server without cloning:

```sh
# register the MCP server from the npm package
export JUICYADS_API_TOKEN=<your token>
claude mcp add juicyads --env JUICYADS_API_TOKEN=$JUICYADS_API_TOKEN -- npx -y @heretek-ai/juicyads-mcp
```

### First publish (local CLI)

The first version must be published from a local CLI (npm trusted-publishing config
lives on the package's own settings page, which only exists after the package is on
the registry):

```sh
npm login            # authenticate to the registry
npm publish          # publishConfig.access: public is already set
```

### Subsequent releases (GitHub Actions, no npm token)

After the first publish, activate the dormant `.github/workflows/publish.yml` by
adding it as a **trusted publisher** on the npm package: npmjs.com →
`@heretek-ai/juicyads-mcp` → Settings → Trusted publishing → GitHub Actions →
org `Heretek-AI`, repo `juicyads-mcp`, workflow `publish.yml`, allowed action
`npm publish`. Then releases are tag-driven:

```sh
npm version patch   # or minor / major — updates package.json + tags vX.Y.Z
git push --tags
```

The workflow runs `npm publish` with the GitHub OIDC token (`id-token: write`), which
generates npm **provenance** attestations automatically. Verify a published release
with `npm audit signatures`. The workflow needs Node ≥ 22.14 / npm ≥ 11.5.1 on the
runner (satisfied by the pinned Node 24) and GitHub-hosted runners.

## License

MIT — see `LICENSE`.
