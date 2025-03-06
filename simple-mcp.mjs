// Simple WebGL MCP server for testing
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Grokade Games WebGL-MCP",
  version: "1.0.0"
});

// Add a simple tool for testing
server.tool(
  "analyze-webgl",
  {
    path: z.string().describe("Path to WebGL build folder or index.html file")
  },
  async ({ path }) => {
    console.error("Analyzing WebGL at path:", path);
    return {
      content: [{
        type: "text",
        text: "Analyzing WebGL at path: " + path
      }]
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("WebGL MCP Server started and connected to transport");
