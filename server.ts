import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
  RESOURCE_URI_META_KEY,
} from "@modelcontextprotocol/ext-apps/server";
import { startServer } from "./src/server-utils.js";
import { z } from "zod";
import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCallback);

const DIST_DIR = path.join(import.meta.dirname, "dist");

/**
 * Creates a new MCP server instance with tools and resources registered.
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: "Run Shell Command (React)",
    version: "1.0.0",
  });

  // Two-part registration: tool + resource, tied together by the resource URI.
  const resourceUri = "ui://get-time/mcp-app.html";

  // Register a tool with UI metadata. When the host calls this tool, it reads
  // `_meta[RESOURCE_URI_META_KEY]` to know which resource to fetch and render
  // as an interactive UI.
  registerAppTool(
    server,
    "get-time",
    {
      title: "Get Time",
      description: "Returns the current server time as an ISO 8601 string.",
      inputSchema: {},
      _meta: { [RESOURCE_URI_META_KEY]: resourceUri },
    },
    async (): Promise<CallToolResult> => {
      const time = new Date().toISOString();
      return { content: [{ type: "text", text: time }] };
    },
  );

  // Register the resource, which returns the bundled HTML/JavaScript for the UI.
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE, _meta: { ui: {} } },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "mcp-app.html"),
        "utf-8",
      );

      return {
        contents: [
          { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  const resourceUriForRunShellCommandApp =
    "ui://run-shell-command/run-shell-command-app.html";

  registerAppTool(
    server,
    "run-shell-command",
    {
      title: "Run Shell Command",
      description: "Run shell command on server",
      inputSchema: {
        shellCommand: z.string().describe("The command to execute"),
      },
      _meta: { [RESOURCE_URI_META_KEY]: resourceUriForRunShellCommandApp },
    },
    async ({ shellCommand }): Promise<CallToolResult> => {
      return { content: [{ type: "text", text: shellCommand as string }] };
    },
  );

  registerAppResource(
    server,
    resourceUriForRunShellCommandApp,
    resourceUriForRunShellCommandApp,
    { mimeType: RESOURCE_MIME_TYPE, _meta: { ui: {} } },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "run-shell-command-app.html"),
        "utf-8",
      );

      return {
        contents: [
          {
            uri: resourceUriForRunShellCommandApp,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
          },
        ],
      };
    },
  );

  server.registerTool(
    "execute-shell-command",
    {
      title: "Execute shell command",
      description:
        "Execute shell command at the server. This tool can only be called by human.",
      inputSchema: {
        shellCommand: z.string(),
      },
    },
    async ({ shellCommand }): Promise<CallToolResult> => {
      let res: CallToolResult = {
        content: [
          { type: "text", text: "Failed to execute the shell command" },
        ],
        isError: true,
      };

      try {
        const { stdout, stderr } = await exec(shellCommand);

        if (stderr) {
          res = { content: [{ type: "text", text: stderr }], isError: true };
        } else {
          res = { content: [{ type: "text", text: stdout }] };
        }
      } catch (error) {
        res = {
          content: [{ type: "text", text: JSON.stringify(error) }],
          isError: true,
        };
      }

      return res;
    },
  );

  return server;
}

startServer(createServer);
