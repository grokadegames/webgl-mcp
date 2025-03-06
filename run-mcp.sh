#!/bin/bash

# Run the WebGL MCP server
echo "Starting WebGL MCP Server..."
echo "Use this with MCP-compatible tools like Cursor by providing the following tools:"
echo "- analyze-webgl: Analyzes a WebGL build or HTML file"
echo "- optimize-webgl: Provides optimization recommendations for WebGL builds"
echo "- analyze-performance: Analyzes performance metrics for WebGL builds"
echo ""
echo "Example usage in Cursor:"
echo "analyze-webgl(path: '/path/to/webgl/build')"
echo ""

# Run the server
node webgl-mcp.mjs
