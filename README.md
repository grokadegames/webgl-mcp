# Grokade Games WebGL-MCP

A Model Context Protocol (MCP) server for analyzing and optimizing WebGL games. This server provides tools to analyze WebGL applications, optimize performance, and provide insights into WebGL-based games and applications.

## Features

- WebGL application analysis
- Performance optimization suggestions
- Memory usage analysis
- Engine detection (Unity, Godot, etc.)
- Shader optimization recommendations

## Installation

```bash
# Clone the repository
git clone https://github.com/grokadegames/webgl-mcp.git
cd webgl-mcp

# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

## Usage with MCP-compatible tools

This MCP server is designed to work with MCP-compatible tools to provide context for WebGL applications. To use it:

1. Start the MCP server:

```bash
npm run webgl-mcp
```

2. In your MCP-compatible tool, connect to the MCP server.

3. Use the available tools to analyze and optimize your WebGL applications.

## Available Tools

### analyze-webgl

Analyzes a WebGL build or HTML file.

Parameters:
- `path` (required): Path to WebGL build folder or index.html file

Example:
```
analyze-webgl(path: "/path/to/webgl/build")
```

### optimize-webgl

Suggests optimizations for WebGL applications.

Parameters:
- `path` (required): Path to WebGL build folder or index.html file
- `targetFPS` (optional): Target frames per second
- `memoryLimit` (optional): Memory limit in MB
- `optimizationGoals` (optional): Array of optimization goals ('performance', 'memory', 'quality', 'mobile')

Example:
```
optimize-webgl(path: "/path/to/webgl/build", targetFPS: 60, optimizationGoals: ["performance", "mobile"])
```

### analyze-performance

Analyzes performance metrics.

Parameters:
- `path` (required): Path to WebGL build folder or index.html file
- `duration` (optional): Duration of performance test in seconds

Example:
```
analyze-performance(path: "/path/to/webgl/build", duration: 30)
```

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Scripts

- `npm run build`: Build the TypeScript project
- `npm run dev`: Run the development server with hot reloading
- `npm run start`: Start the compiled server
- `npm run webgl-mcp`: Start the WebGL MCP server
- `npm run simple-mcp`: Start a simple MCP server for testing
- `npm run test`: Run tests
- `npm run lint`: Run linting
- `npm run format`: Format code

## License

MIT

## Author

Grokade Games 