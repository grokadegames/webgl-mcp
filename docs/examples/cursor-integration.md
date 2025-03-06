# Using WebGL MCP in Cursor IDE

This guide shows how to use the WebGL MCP server with Cursor IDE for analyzing and optimizing WebGL games.

## Setup

1. **Install the MCP Server**:
   ```bash
   git clone https://github.com/yourusername/WebGL-MCP.git
   cd WebGL-MCP
   npm install
   npm start
   ```

2. **Configure Cursor IDE**:
   - Open Cursor IDE
   - Go to Settings > Extensions
   - Enable MCP integration
   - Add server URL: `ws://localhost:3000`

## Basic Usage

### 1. Analyze a WebGL Game

1. Open your WebGL game project in Cursor
2. Right-click on the game's HTML file
3. Select "Analyze with WebGL MCP"
4. View results in the MCP panel

Example response:
```json
{
  "engine": "Unity",
  "confidence": 0.95,
  "features": [
    "WebGL 2.0",
    "Compressed Textures",
    "WebAssembly"
  ],
  "recommendations": [
    "Enable GPU instancing",
    "Implement texture streaming",
    "Add mobile touch controls"
  ]
}
```

### 2. Optimize for Mobile

1. Open the MCP panel
2. Click "Optimize for Mobile"
3. Configure target devices
4. Apply recommendations

Example configuration:
```typescript
await client.prompt('optimize-mobile', {
  engineId: 'unity',
  targetDevices: ['ios', 'android'],
  powerEfficient: true
});
```

### 3. Monitor Performance

1. Start your game in development mode
2. Open the MCP Performance panel
3. Monitor real-time metrics:
   - FPS
   - Memory usage
   - Draw calls
   - WebGL state

Example metrics view:
```typescript
const metrics = await client.getResource('metrics://unity-game');
console.log(metrics.contents[0].metadata);
```

## Advanced Features

### Custom Engine Detection

Add custom engine signatures:
```typescript
const customEngine = {
  name: 'MyEngine',
  signatures: [
    { type: 'script', patterns: ['myengine.js'] },
    { type: 'canvas', patterns: ['game-viewport'] }
  ]
};
```

### Template Modification

Customize the game template:
```typescript
await client.tool('modify-template', {
  title: 'My Game',
  loadingBar: true,
  compression: true,
  customStyles: `
    .game-container {
      width: 100%;
      height: 100%;
    }
  `
});
```

### Performance Optimization

Apply recommended optimizations:
```typescript
await client.prompt('optimize-webgl', {
  engineId: 'unity',
  targetFPS: 60,
  optimizationGoals: ['performance', 'memory']
});
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   ```
   Error: Could not connect to MCP server
   ```
   Solution: Ensure the server is running and the port is correct

2. **Engine Not Detected**
   ```
   Warning: No game engine detected
   ```
   Solution: Check if your game's HTML includes the necessary engine markers

3. **WebGL Context Lost**
   ```
   Error: WebGL context lost
   ```
   Solution: Implement context restoration handling

## Best Practices

1. **Regular Analysis**
   - Run analysis before each release
   - Monitor performance trends
   - Track optimization progress

2. **Mobile Testing**
   - Test on various devices
   - Monitor power consumption
   - Verify touch controls

3. **Asset Management**
   - Use compressed textures
   - Implement asset streaming
   - Monitor memory usage

## Next Steps

- Explore the [API Reference](../api/README.md)
- Check out more [Examples](README.md)
- Join our [Discord community](https://discord.gg/yourdiscord) 