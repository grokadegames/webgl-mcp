# Grokade Games WebGL-MCP

A Model Context Protocol (MCP) server for analyzing and optimizing WebGL games. This server provides tools to analyze WebGL applications, optimize performance, and provide insights into WebGL-based games and applications.

## Features

- WebGL application analysis
- Performance optimization suggestions
- Memory usage analysis
- Engine detection (Unity, Godot, etc.)
- Shader optimization recommendations
- Better Minimal WebGL Template detection and analysis
- Template-specific optimization suggestions
- Mobile optimization recommendations

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

2. In your MCP-compatible tool, connect to the MCP server.

3. Use the available tools to analyze and optimize your WebGL applications.

## Available Tools

### analyze-webgl

Analyzes a WebGL build or HTML file. Provides information about the template used, features detected, and optimization recommendations.

Parameters:
- `path` (required): Path to WebGL build folder or index.html file

Example:
```
analyze-webgl(path: "/path/to/webgl/build")
```

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

### analyze-performance

Analyzes performance metrics and provides performance-specific recommendations.

Parameters:
- `path` (required): Path to WebGL build folder or index.html file
- `duration` (optional): Duration of performance test in seconds

Example:
```
analyze-performance(path: "/path/to/webgl/build", duration: 30)
```

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