# Grokade Games WebGL-MCP

A Model Context Protocol (MCP) server for analyzing and optimizing WebGL games. This server provides tools to analyze WebGL applications, optimize performance, and provide insights into WebGL-based games and applications.

<a href="https://glama.ai/mcp/servers/l5zh0e3z4x">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/l5zh0e3z4x/badge" alt="WebGL-Server MCP server" />
</a>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP: v1.0](https://img.shields.io/badge/MCP-v1.0-blue.svg)](https://modelcontextprotocol.io/)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage with MCP-compatible tools](#usage-with-mcp-compatible-tools)
- [Available Tools](#available-tools)
- [Better Minimal WebGL Template Integration](#better-minimal-webgl-template-integration)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

The Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools. This WebGL-MCP server implements the protocol to provide specialized WebGL analysis and optimization tools for game developers and web application creators.

By using this server with MCP-compatible tools like AI-powered IDEs, you can easily analyze your WebGL applications, get optimization recommendations, and improve your game's performance across different platforms.

## Features

- WebGL application analysis
- Performance optimization suggestions
- Memory usage analysis
- Engine detection (Unity, Godot, etc.)
- Shader optimization recommendations
- Template detection and analysis
- Template-specific optimization suggestions
- Mobile optimization recommendations
- File structure and size analysis
- WebGL capability assessment

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- A WebGL application or game to analyze

## Quick Start

```bash
# Clone the repository
git clone https://github.com/grokadegames/webgl-mcp.git
cd webgl-mcp

# Install dependencies
npm install

# Start the MCP server
npm run webgl-mcp
```

Now you can connect to the server using any MCP-compatible client and use the available tools to analyze your WebGL applications.

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

Or use the provided script:

```bash
./run-mcp.sh
```

2. In your MCP-compatible tool (such as an AI-powered IDE or agent), connect to the MCP server.

3. Use the available tools to analyze and optimize your WebGL applications.

## Available Tools

### analyze-webgl

Analyzes a WebGL build or HTML file. Provides information about the template used, features detected, file structure, and optimization recommendations.

Parameters:
- `path` (required): Path to WebGL build folder or index.html file

Example:
```
analyze-webgl(path: "/path/to/webgl/build")
```

Output includes:
- Template analysis (type, features, etc.)
- Build statistics (file counts, sizes)
- Large file detection
- Optimization recommendations

### optimize-webgl

Suggests optimizations for WebGL applications based on specific goals.

Parameters:
- `path` (required): Path to WebGL build folder or index.html file
- `targetFPS` (optional): Target frames per second
- `memoryLimit` (optional): Memory limit in MB
- `optimizationGoals` (optional): Array of optimization goals ('performance', 'memory', 'quality', 'mobile')

Example:
```
optimize-webgl(path: "/path/to/webgl/build", targetFPS: 60, optimizationGoals: ["performance", "mobile"])
```

Output includes:
- Template-specific optimization recommendations
- Code and asset optimization suggestions
- Mobile-specific optimizations (when specified)
- Memory usage improvements (when specified)

### analyze-performance

Analyzes performance metrics and provides performance-specific recommendations.

Parameters:
- `path` (required): Path to WebGL build folder or index.html file
- `duration` (optional): Duration of performance test in seconds

Example:
```
analyze-performance(path: "/path/to/webgl/build", duration: 30)
```

Output includes:
- WebGL capabilities assessment
- Performance bottleneck identification
- Frame rate analysis
- Asset loading optimization suggestions

## Better Minimal WebGL Template Integration

This MCP server has special support for analyzing and recommending optimizations when using the [Better Minimal WebGL Template](https://seansleblanc.itch.io/better-minimal-webgl-template), a highly optimized template for Unity WebGL builds. This external resource is used as a reference for best practices and optimizations.

### Template Version Considerations

The Better Minimal WebGL Template comes in different versions for different Unity versions:

- **Version 2.2**: For Unity 2020.2 and higher - Includes loading bar functionality
- **Version 2.1**: For Unity 2020.1 - Similar features to 2.2 without some newer functionality
- **Version 1.1**: For Unity 2019.x and lower - Core functionality without newer features

The MCP server will analyze and detect features based on any version but may provide different recommendations depending on which template version is being used.

### Template Features Analyzed

- Canvas scaling for different screen sizes
- Loading progress visualization
- Mobile device detection and optimization
- Pixel art rendering optimization

### Best Practices for Using Better Minimal WebGL Template

Based on the official template documentation:

1. **Canvas Scaling**: Always enable scaling for responsive games
   - Maintains aspect ratio while filling the window
   - Centers the canvas in the window
   - Works well on all screen sizes

2. **Mobile Optimization**:
   - The template automatically detects mobile devices and sets appropriate viewport settings
   - No additional code is needed for basic mobile support

3. **Pixel Art Games**:
   - Use the "Optimize for pixel art" option for crisp pixel rendering
   - This enables proper CSS image rendering properties across all browsers

4. **Loading Visualization**:
   - The template includes a simple, effective loading bar
   - No complex UI elements that could slow down initial loading

5. **Background Customization**:
   - Set a custom background color that complements your game's aesthetic
   - The transparent game container ensures the background is visible

6. **Ideal for Embedding**:
   - Works perfectly on sites like itch.io that provide external full-screen buttons
   - Lightweight with minimal overhead

7. **Full-screen Behavior**:
   - When embedded in sites like itch.io, use their full-screen button rather than implementing your own
   - The template will automatically scale to fill the available space when in full-screen mode
   - For standalone deployments, consider adding a simple full-screen button

8. **Compatibility**:
   - Works across all major browsers
   - Degrades gracefully when features aren't supported

### Template Implementation

To implement the Better Minimal WebGL Template in your Unity project:

1. Download the appropriate version for your Unity version from [itch.io](https://seansleblanc.itch.io/better-minimal-webgl-template) (external resource)
2. Extract the WebGLTemplates folder to your Unity project's Assets folder
3. In Unity, go to File > Build Settings > WebGL > Player Settings
4. Under Resolution and Presentation, select the "BetterMinimal" template
5. Configure the options:
   - Enter a color in the "Background" field (e.g., "#000" for black)
   - Enter "false" in the "Scale to fit" field to disable scaling (default is true)
   - Enter "true" in the "Optimize for pixel art" field for pixel art games (default is false)

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

We welcome contributions that improve the analysis capabilities, add new optimization techniques, or enhance the MCP integration.

## Troubleshooting

Common issues and solutions:

- **Connection failures**: Ensure your MCP client is configured correctly to connect to the server
- **Path not found**: Verify that the path to your WebGL build is correct and accessible
- **Analysis errors**: Make sure your WebGL build has all the necessary files, including index.html

For more detailed troubleshooting, check the logs in the `error.log` and `combined.log` files.

## Scripts

- `npm run build`: Build the TypeScript project
- `npm run dev`: Run the development server with hot reloading
- `npm run start`: Start the compiled server
- `npm run webgl-mcp`: Start the WebGL MCP server
- `npm run simple-mcp`: Start a simple MCP server for testing
- `npm run test`: Run tests
- `npm run lint`: Run linting
- `npm run format`: Format code

## Contributing

We welcome contributions from the community! Whether you want to fix bugs, improve documentation, or add new features, please feel free to submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Contact

Grokade Games - [Website](https://grokadegames.com)

Project Link: [https://github.com/grokadegames/webgl-mcp](https://github.com/grokadegames/webgl-mcp)