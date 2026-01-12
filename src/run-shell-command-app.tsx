/**
 * @file App that demonstrates a few features using MCP Apps SDK + React.
 */
import type { App } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
// import styles from "./mcp-app.module.css";

const IMPLEMENTATION = { name: "Run Shell Command", version: "1.0.0" };

const log = {
  info: console.log.bind(console, "[APP]"),
  warn: console.warn.bind(console, "[APP]"),
  error: console.error.bind(console, "[APP]"),
};

function extractText(callToolResult: CallToolResult): string {
  const { text } = callToolResult.content?.find((c) => c.type === "text")!;
  return text;
}

function RunShellCommandApp() {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null);
  const { app, error } = useApp({
    appInfo: IMPLEMENTATION,
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => {
        log.info("App is being torn down");
        return {};
      };
      app.ontoolinput = async (input) => {
        log.info("Received tool call input:", input);
      };

      app.ontoolresult = async (result) => {
        log.info("Received tool call result:", result);
        setToolResult(result);
      };

      app.onerror = log.error;
    },
  });

  if (error)
    return (
      <div>
        <strong>ERROR:</strong> {error.message}
      </div>
    );
  if (!app) return <div>Connecting...</div>;

  return <RunShellCommandAppInner app={app} toolResult={toolResult} />;
}

interface RunShellCommandAppInnerProps {
  app: App;
  toolResult: CallToolResult | null;
}

type ExecutionState =
  | "initialized"
  | "success"
  | "failed"
  | "rejected"
  | "executing";

const pickStateColor = (state: ExecutionState): string => {
  switch (state) {
    case "initialized":
      return "text-white";
    case "executing":
      return "text-yellow-500";
    case "success":
      return "text-green-500";
    default:
      return "text-red-500";
  }
};

function RunShellCommandAppInner({
  app,
  toolResult,
}: RunShellCommandAppInnerProps) {
  const [shellCommand, setShellCommand] = useState("");
  const [executionState, setExecutionState] =
    useState<ExecutionState>("initialized");
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  useEffect(() => {
    if (toolResult) {
      setShellCommand(extractText(toolResult));
    }
  }, [toolResult]);

  const handleAccept = useCallback(async () => {
    setExecutionState("executing");
    const result = await app.callServerTool({
      name: "execute-shell-command",
      arguments: { shellCommand: shellCommand },
    });

    log.info("execute-shell-command result:", result);
    if (!!result.isError) {
      setExecutionState("failed");
    } else {
      setExecutionState("success");
    }
    setExecutionResult(extractText(result));
  }, [app, shellCommand]);
  const handleReject = useCallback(async () => {
    setExecutionState("rejected");
  }, [app]);

  return (
    <main className="p-2">
      <p className="font-bold mb-4">Watch activity in the DevTools console!</p>
      <div className="flex">
        <div className="flex-1 whitespace-pre-wrap break-all">
          <p>
            <strong>Execution State:</strong>{" "}
            <span className={pickStateColor(executionState)}>
              {executionState}
            </span>
          </p>
          <p>
            <strong>Shell Command:</strong> {shellCommand}
          </p>
          {executionResult !== null && (
            <p>
              <strong>Result:</strong> {executionResult}
            </p>
          )}
        </div>
        <div className="flex-none">
          <button
            className="btn-primary"
            disabled={executionState !== "initialized"}
            onClick={handleAccept}
          >
            Allow
          </button>
          <button
            className="btn-primary"
            disabled={executionState !== "initialized"}
            onClick={handleReject}
          >
            Deny
          </button>
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RunShellCommandApp />
  </StrictMode>,
);
