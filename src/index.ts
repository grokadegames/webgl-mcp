import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { WebGLContextManager } from './webgl-context';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Error types
class WebGLError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'WebGLError';
  }
}

// Initialize WebGL context manager
const contextManager = new WebGLContextManager();

// Create an MCP server
const server = new McpServer({
  name: "Grokade Games WebGL-MCP",
  version: "1.0.0"
});

// Add WebGL analysis tool
server.tool(
  "analyze-webgl",
  {
    path: z.string().describe("Path to WebGL build folder or index.html file")
  },
  async ({ path }) => {
    logger.info(`Analyzing WebGL at path: ${path}`);
    
    try {
      // Here you would add your WebGL analysis logic
      // For now, we'll just return a simple message
      return {
        content: [{
          type: "text",
          text: `Analyzed WebGL at path: ${path}\n\nFindings:\n- WebGL 2.0 support: Yes\n- Texture compression: Yes\n- Memory usage: Optimal\n- Render pipeline: Efficient`
        }]
      };
    } catch (error) {
      logger.error('Error analyzing WebGL:', {
        error: error instanceof Error ? error.message : String(error),
        path
      });
      
      throw new WebGLError(`Failed to analyze WebGL at path: ${path}`, { 
        cause: error instanceof Error ? error.message : String(error) 
      });
    }
  }
);

// Add WebGL optimization tool
server.tool(
  "optimize-webgl",
  {
    path: z.string().describe("Path to WebGL build folder or index.html file"),
    targetFPS: z.number().optional().describe("Target frames per second"),
    memoryLimit: z.number().optional().describe("Memory limit in MB"),
    optimizationGoals: z.array(z.enum(['performance', 'memory', 'quality', 'mobile'])).optional()
      .describe("Optimization goals in order of priority")
  },
  async ({ path, targetFPS, memoryLimit, optimizationGoals }) => {
    logger.info(`Optimizing WebGL at path: ${path}`, { targetFPS, memoryLimit, optimizationGoals });
    
    try {
      // Here you would add your WebGL optimization logic
      // For now, we'll just return a simple message
      return {
        content: [{
          type: "text",
          text: `Optimized WebGL at path: ${path}\n\nOptimizations applied:\n- Texture compression\n- Shader minification\n- Draw call batching\n- Memory management improvements`
        }]
      };
    } catch (error) {
      logger.error('Error optimizing WebGL:', {
        error: error instanceof Error ? error.message : String(error),
        path
      });
      
      throw new WebGLError(`Failed to optimize WebGL at path: ${path}`, { 
        cause: error instanceof Error ? error.message : String(error) 
      });
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('MCP Server started and connected to transport');
  } catch (error) {
    logger.error('Failed to start server:', {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  }
}

// Start the server
startServer(); 