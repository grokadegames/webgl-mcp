# WebGL MCP Server

A Model Context Protocol (MCP) server for analyzing, optimizing, and managing WebGL-based games and applications. This server provides tools and resources for detecting game engines, analyzing WebGL capabilities, and optimizing performance across different platforms.

## Features

- **Engine Detection**: Automatically detect and analyze various game engines:
  - Unity WebGL
  - Godot
  - Construct
  - GDevelop
  - PICO-8
  - TIC-80
  - Bitsy
  - PuzzleScript
  - p5.js
  - And more...

- **WebGL Analysis**:
  - WebGL 1.0/2.0 capability detection
  - Extension support analysis
  - Texture compression support
  - Performance metrics tracking
  - Memory usage monitoring

- **Optimization Tools**:
  - Template modification for better performance
  - Mobile optimization suggestions
  - Asset loading optimization
  - Memory management recommendations
  - Touch input handling

## Installation

1. **Prerequisites**:
   ```bash
   # Make sure you have Node.js 16+ installed
   node --version
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Install Type Definitions**:
   ```bash
   npm install --save-dev @types/winston @types/express @types/ws @modelcontextprotocol/sdk
   ```

## Usage

1. **Start the Server**:
   ```bash
   npm start
   ```

2. **Connect via MCP Client**:
   ```typescript
   import { McpClient } from '@modelcontextprotocol/sdk';

   const client = new McpClient('ws://localhost:3000');
   await client.connect();
   ```

3. **Use with Cursor IDE**:
   - Open Cursor IDE
   - Install the MCP extension
   - Connect to `ws://localhost:3000`
   - Use the WebGL analysis tools from the MCP panel

## API Reference

### Resources

1. **WebGL Context** (`webgl://{contextId}`):
   - Get WebGL context information and capabilities

2. **Performance Metrics** (`metrics://{engineId}`):
   - Real-time performance monitoring
   - WebGL capabilities
   - Memory usage stats

3. **Engine Analysis** (`analysis://{engineId}`):
   - Engine detection results
   - Feature support
   - Optimization recommendations

4. **Template Configuration** (`template://{engineId}`):
   - Template management
   - Customization options

### Tools

1. **analyze-build**:
   ```typescript
   const result = await client.tool('analyze-build', {
     buildPath: './build'
   });
   ```

2. **detect-engine**:
   ```typescript
   const result = await client.tool('detect-engine', {
     html: document.documentElement.outerHTML
   });
   ```

3. **modify-template**:
   ```typescript
   const result = await client.tool('modify-template', {
     title: 'My Game',
     loadingBar: true,
     compression: true
   });
   ```

### Prompts

1. **optimize-webgl**:
   ```typescript
   const result = await client.prompt('optimize-webgl', {
     engineId: 'unity',
     targetFPS: 60,
     optimizationGoals: ['performance', 'mobile']
   });
   ```

2. **optimize-mobile**:
   ```typescript
   const result = await client.prompt('optimize-mobile', {
     engineId: 'unity',
     targetDevices: ['ios', 'android'],
     powerEfficient: true
   });
   ```

## Configuration

Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## Development

1. **Build the Project**:
   ```bash
   npm run build
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Development Mode**:
   ```bash
   npm run dev
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/WebGL-MCP/issues)
- Documentation: [Full documentation](docs/README.md)
- Discord: [Join our community](https://discord.gg/yourdiscord) 