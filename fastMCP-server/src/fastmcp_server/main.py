import os
import sys
from pathlib import Path
import subprocess

import uvicorn
from mcp.server.fastmcp import FastMCP
from mcp import types
from starlette.middleware.cors import CORSMiddleware

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 3001))
RUN_SHELL_COMMAND_URI = "ui://run-shell-command/run-shell-command-app.html"
UI_RESOURCES_DIR = os.environ.get("UI_RESOURCES_DIR")

URIS = set([RUN_SHELL_COMMAND_URI])

mcp = FastMCP("RHEL MCP Server", port=PORT, stateless_http=True)


@mcp.tool(meta={"ui/resourceUri": RUN_SHELL_COMMAND_URI})
def run_shell_command(shellCommand: str) -> str:
    return shellCommand


@mcp.tool(name="execute-shell-command")
def execute_shell_command(shellCommand: str) -> str:
    print(shellCommand.split())
    result = subprocess.run(
        shellCommand, capture_output=True, text=True, check=True, shell=True
    )

    return result.stdout


_low_level_server = mcp._mcp_server


async def _read_resource_with_meta(req: types.ReadResourceRequest):
    uri = str(req.params.uri)
    file_name = uri.split("/")[-1]

    ui_resources_dir = (
        Path(UI_RESOURCES_DIR)
        if UI_RESOURCES_DIR
        else Path(__file__).parents[3].joinpath("dist")
    )

    html = ui_resources_dir.joinpath(f"{file_name}").read_text()

    if uri in URIS:
        content = types.TextResourceContents.model_validate(
            {
                "uri": uri,
                "mimeType": "text/html;profile=mcp-app",
                "text": html,
                "_meta": {"ui": {"csp": {"resourceDomains": ["https://unpkg.com"]}}},
            }
        )

        return types.ServerResult(types.ReadResourceResult(contents=[content]))

    fallback_contents: list[types.TextResourceContents | types.BlobResourceContents] = [
        types.TextResourceContents(
            uri=req.params.uri, mimeType="text/plain", text="Resource not found"
        )
    ]

    return types.ServerResult(types.ReadResourceResult(contents=fallback_contents))


_low_level_server.request_handlers[types.ReadResourceRequest] = _read_resource_with_meta


def main():
    if "--stdio" in sys.argv:
        mcp.run(transport="stdio")
    else:
        app = mcp.streamable_http_app()
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
        )

        uvicorn.run(app, host=HOST, port=PORT)

    print("Mcp server running")


if __name__ == "__main__":
    main()
