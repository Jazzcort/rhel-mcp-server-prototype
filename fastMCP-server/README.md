# FastMCP Server

A Model Context Protocol (MCP) server built with FastMCP that provides shell command execution tools and serves MCP applications.

## Overview

This server implements the MCP protocol to enable AI assistants to execute shell commands and interact with MCP applications. It can run in both stdio mode (for local development) and HTTP mode (for networked access).

## Features

- **Shell Command Tools**: Two MCP tools for executing shell commands
  - `run_shell_command`: Returns the shell command as-is
  - `execute-shell-command`: Executes shell commands and returns output
- **MCP App Serving**: Serves MCP applications with UI resources
- **Dual Transport Modes**: Supports both stdio and HTTP transports
- **CORS Enabled**: HTTP mode includes CORS middleware for cross-origin requests
- **Resource Serving**: Serves HTML resources with MCP-specific metadata and CSP policies

## Installation

### Prerequisites

- Python >= 3.13
- uv (recommended) or pip

### Install Dependencies

```bash
uv sync
```

Or with pip:

```bash
pip install -e .
```

## Usage

### Running in Stdio Mode

For local development and integration with MCP clients:

```bash
mcp-serve --stdio
```

### Running in HTTP Mode

For networked access:

```bash
mcp-serve
```

The server will start on `0.0.0.0:3001` by default.

### Environment Variables

- `HOST`: Host to bind to (default: `0.0.0.0`)
- `PORT`: Port to listen on (default: `3001`)

Example:

```bash
HOST=localhost PORT=8000 mcp-serve
```

## Available Tools

### run_shell_command

Returns the shell command string without executing it.

**Parameters:**
- `shellCommand` (str): The shell command to return

**Returns:** The command string

### execute-shell-command

Executes a shell command and returns its stdout output.

**Parameters:**
- `shellCommand` (str): The shell command to execute

**Returns:** The stdout output from the command

**Note:** This tool executes commands with `shell=True`. Use with caution.

## Project Structure

```
fastMCP-server/
├── src/
│   └── fastmcp_server/
│       ├── __init__.py
│       └── main.py          # Main server implementation
├── pyproject.toml           # Project configuration
├── uv.lock                  # Dependency lock file
└── README.md                # This file
```

## Development

### Project Configuration

The project is configured in `pyproject.toml` with:
- Package name: `fastmcp-server`
- Version: 0.1.0
- Entry point: `mcp-serve` command

### Dependencies

- `mcp[cli]>=1.25.0`: MCP protocol implementation with CLI support
- `uvicorn`: ASGI server for HTTP mode
- `starlette`: Web framework (CORS middleware)

## Security Considerations

The `execute-shell-command` tool executes arbitrary shell commands with `shell=True`. This should only be used in trusted environments. Consider:

- Implementing command validation
- Restricting allowed commands
- Running in a sandboxed environment
- Using proper authentication/authorization in HTTP mode

## License

See project repository for license information.

## Author

Chih-Tao Lee (jason101011113@gmail.com)
