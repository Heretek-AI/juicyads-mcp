#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { getApiToken } from "./config.ts";
import { JuicyAdsClient } from "./client.ts";
import { registerAllTools } from "./tools.ts";

async function main(): Promise<void> {
  // Fail fast before any transport I/O: a missing token must produce a clean
  // stderr line and non-zero exit the moment the server starts.
  const token = getApiToken();

  const server = new McpServer({ name: "juicyads", version: "0.1.0" });
  const client = new JuicyAdsClient({ token });
  registerAllTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
