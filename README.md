# RHEL MCP Server Prototype

A prototype MCP (Model Context Protocol) server that demonstrates interactive UI tools for running shell commands and getting server time.

## Features

- **Get Time Tool**: Returns the current server time as an ISO 8601 string with an interactive UI
- **Run Shell Command Tool**: Execute shell commands on the server through an interactive UI
- Built with React, TypeScript, and the MCP SDK

## Prerequisites

- [Bun](https://bun.sh/) (required for running the server)
- Node.js (for npm dependencies)

## Installation

Install the dependencies:

```bash
npm install
```

## Running the Project

### Development Mode

Run the project in development mode with hot reloading:

```bash
npm run dev
```

This will:
1. Watch for changes in the React apps and rebuild automatically
2. Start the MCP server on port 3001

### Production Mode

Build and run the project:

```bash
npm start
```

This will:
1. Build the React apps with Vite
2. Start the MCP server

### Manual Build

To build the apps separately:

```bash
npm run build
```

To run the server only:

```bash
npm run serve
```

### Run Development Mode in Container
```bash
docker-compose up -d --build
```
or
```bash
podman compose up -d --build
```

## Testing the Features

Once the server is running, you can test the two main features:

### 1. Get Time Tool

- Tool name: `get-time`
- Returns the current server time in ISO 8601 format
- Provides an interactive UI for viewing the time

### 2. Run Shell Command Tool

- Tool name: `run-shell-command`
- Allows you to input shell commands through an interactive UI
- Tool name: `execute-shell-command` (actual execution)
- Executes the command on the server and returns stdout/stderr

## Project Structure

```
.
├── server.ts                       # Main MCP server
├── src/
│   ├── mcp-app.tsx                # Get Time React app
│   ├── run-shell-command-app.tsx  # Run Shell Command React app
│   ├── server-utils.ts            # Server utilities
│   └── global.css                 # Global styles
├── dist/                          # Built HTML files
├── mcp-app.html                   # Get Time app entry point
└── run-shell-command-app.html     # Run Shell Command app entry point
```

## Development Scripts

- `npm run dev` - Development mode with hot reloading
- `npm run build` - Build all apps
- `npm run watch` - Watch mode for both apps
- `npm run serve` - Start the server only
- `npm start` - Build and start in production mode

## Visualizing UI Output with basic-host

To see the richer UI output from this MCP server, you can use the `basic-host` example from the `@modelcontextprotocol/ext-apps` repository:

### Setup

1. Clone the ext-apps repository:
   ```bash
   git clone https://github.com/modelcontextprotocol/ext-apps.git
   cd ext-apps
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Navigate to the basic-host example and start it:
   ```bash
   cd examples/basic-host
   npm run dev
   ```

4. Open your browser to http://localhost:8080/

### Using the Host

1. Make sure this MCP server is running on port 3001:
   ```bash
   npm run dev
   ```

2. In the basic-host interface:
   - Select the server (http://localhost:3001)
   - Choose a tool (`get-time` or `run-shell-command`)
   - Provide input parameters (JSON format)
   - Click "Call Tool" to see the interactive UI

The basic-host will load the React UI apps from this server and display them in a secure iframe sandbox, allowing you to interact with the tools through their rich UI interfaces.

## Server Details

The MCP server runs on port **3001** by default and provides:
- Tool registration for interactive UI-based commands
- Resource endpoints for serving the bundled React applications
- Shell command execution capabilities
