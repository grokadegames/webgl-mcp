import { McpServer, ResourceTemplate, Variables, WebSocketServerTransport } from "@modelcontextprotocol/sdk";
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { z } from 'zod';
import { URL } from 'url';
import { WebGLContextManager } from './webgl-context';
import { WebGLBuildAnalyzer } from './analyzers/build-analyzer';
import { WebGLTemplateModifier } from './template/template-modifier';
import { EngineDetector } from './analyzers/engine-detector';
import { JSDOM } from 'jsdom';
import winston from 'winston';
import { TemplateOptions } from './template/template-modifier';

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

class EngineError extends Error {
  constructor(message: string, public engineId?: string, public details?: any) {
    super(message);
    this.name = 'EngineError';
  }
}

// Create an Express app for serving static files and handling HTTP endpoints
const app = express();
const port = process.env.PORT || 3000;

// Create the WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Initialize managers and analyzers
const contextManager = new WebGLContextManager();
const buildAnalyzer = new WebGLBuildAnalyzer();
const templateModifier = new WebGLTemplateModifier('./templates');
const engineDetector = new EngineDetector();

// Create an MCP server
const mcpServer = new McpServer({
  name: "WebGL-MCP",
  version: "1.0.0",
  onError: (error: Error) => {
    logger.error('MCP Server Error:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Express Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    error: err.message,
    type: err.name
  });
});

// Add WebGL context resource
mcpServer.resource(
  "webgl-context",
  new ResourceTemplate("webgl://{contextId}", { list: undefined }),
  async (uri: URL, variables: Variables) => {
    const contextId = variables.contextId as string;
    const context = contextManager.getContext(contextId);
    
    if (!context) {
      throw new Error(`WebGL context ${contextId} not found`);
    }

    return {
      contents: [{
        uri: uri.href,
        text: `WebGL Context ${contextId}`,
        metadata: context
      }]
    };
  }
);

interface BuildAnalysisParams {
  buildPath: string;
}

interface EngineDetectionParams {
  html: string;
}

interface OptimizeWebGLParams {
  engineId: string;
  targetFPS?: number;
  memoryLimit?: number;
  optimizationGoals?: Array<'performance' | 'memory' | 'quality' | 'mobile'>;
}

interface OptimizeMobileParams {
  engineId: string;
  targetDevices?: string[];
  powerEfficient?: boolean;
}

// Add build analysis tool
mcpServer.tool(
  "analyze-build",
  {
    buildPath: z.string(),
  },
  async ({ buildPath }: BuildAnalysisParams) => {
    try {
      const analysis = await buildAnalyzer.analyzeBuild(buildPath);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(analysis, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to analyze build: ${error}`);
    }
  }
);

// Add engine detection tool
mcpServer.tool(
  "detect-engine",
  {
    html: z.string(),
  },
  async ({ html }: EngineDetectionParams) => {
    try {
      const dom = new JSDOM(html);
      const result = await engineDetector.detectEngine(dom.window.document);
      
      if (!result) {
        return {
          content: [{
            type: "text",
            text: "No game engine detected"
          }]
        };
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            engine: result.engineName,
            confidence: result.confidence,
            features: result.features,
            recommendations: result.recommendations,
            warnings: result.warnings
          }, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to detect engine: ${error}`);
    }
  }
);

// Add template modification tool
mcpServer.tool(
  "modify-template",
  {
    title: z.string().optional(),
    loadingBar: z.boolean().optional(),
    loadingText: z.boolean().optional(),
    compression: z.boolean().optional(),
    memoryLimit: z.number().optional(),
    customStyles: z.string().optional(),
    customScripts: z.array(z.string()).optional(),
  },
  async (options: TemplateOptions) => {
    try {
      await templateModifier.modifyTemplate(options);
      return {
        content: [{
          type: "text",
          text: "Template modified successfully"
        }]
      };
    } catch (error) {
      throw new Error(`Failed to modify template: ${error}`);
    }
  }
);

// Add performance metrics resource
mcpServer.resource(
  "performance-metrics",
  new ResourceTemplate("metrics://{engineId}", { list: undefined }),
  async (uri: URL, variables: Variables) => {
    const engineId = variables.engineId as string;
    const canvas = document.querySelector(`#${engineId}-canvas`) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas for engine ${engineId} not found`);
    }

    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const capabilities = context ? await engineDetector.checkWebGLCapabilities(context) : null;

    return {
      contents: [{
        uri: uri.href,
        text: `Performance Metrics for ${engineId}`,
        metadata: {
          webglCapabilities: capabilities,
          canvasSize: {
            width: canvas.width,
            height: canvas.height
          },
          devicePixelRatio: window.devicePixelRatio,
          memoryInfo: (performance as any).memory || null
        }
      }]
    };
  }
);

// Add engine analysis resource
mcpServer.resource(
  "engine-analysis",
  new ResourceTemplate("analysis://{engineId}", { list: undefined }),
  async (uri: URL, variables: Variables) => {
    const engineId = variables.engineId as string;
    const result = await engineDetector.detectEngine(document);
    
    if (!result || result.engineName !== engineId) {
      throw new Error(`Engine ${engineId} not detected`);
    }

    return {
      contents: [{
        uri: uri.href,
        text: `Engine Analysis for ${engineId}`,
        metadata: {
          engineName: result.engineName,
          confidence: result.confidence,
          features: result.features,
          recommendations: result.recommendations,
          warnings: result.warnings,
          performance: result.performance
        }
      }]
    };
  }
);

// Add template management resource
mcpServer.resource(
  "template-config",
  new ResourceTemplate("template://{engineId}", { list: undefined }),
  async (uri: URL, variables: Variables) => {
    const engineId = variables.engineId as string;
    const templates = await templateModifier.getTemplatesForEngine(engineId);
    
    return {
      contents: templates.map(template => ({
        uri: `${uri.href}/${template.name}`,
        text: template.description,
        metadata: {
          engineId,
          templateName: template.name,
          options: template.options,
          defaultValues: template.defaults
        }
      }))
    };
  }
);

// Add optimization prompt templates
mcpServer.prompt(
  "optimize-webgl",
  {
    engineId: z.string(),
    targetFPS: z.number().optional(),
    memoryLimit: z.number().optional(),
    optimizationGoals: z.array(z.enum(['performance', 'memory', 'quality', 'mobile'])).optional()
  },
  async ({ engineId, targetFPS, memoryLimit, optimizationGoals }: OptimizeWebGLParams) => {
    const analysis = await engineDetector.detectEngine(document);
    if (!analysis) {
      throw new Error('No game engine detected');
    }

    const metrics = await mcpServer.getResource(`metrics://${engineId}`);
    const capabilities = metrics.contents[0].metadata.webglCapabilities;

    let prompt = `Analyze and optimize the WebGL game built with ${analysis.engineName}.\n\n`;
    prompt += `Current Status:\n`;
    prompt += `- Engine: ${analysis.engineName} (${analysis.confidence * 100}% confidence)\n`;
    prompt += `- WebGL Version: ${capabilities.webgl2 ? '2.0' : '1.0'}\n`;
    prompt += `- Features: ${analysis.features.join(', ')}\n`;
    prompt += `- Warnings: ${analysis.warnings.join(', ')}\n\n`;

    if (targetFPS) {
      prompt += `Target FPS: ${targetFPS}\n`;
    }
    if (memoryLimit) {
      prompt += `Memory Limit: ${memoryLimit}MB\n`;
    }
    if (optimizationGoals?.length) {
      prompt += `Optimization Goals: ${optimizationGoals.join(', ')}\n`;
    }

    prompt += `\nRecommendations:\n`;
    analysis.recommendations.forEach(rec => {
      prompt += `- ${rec}\n`;
    });

    return {
      messages: [{
        role: "assistant",
        content: prompt
      }]
    };
  }
);

// Add mobile optimization prompt
mcpServer.prompt(
  "optimize-mobile",
  {
    engineId: z.string(),
    targetDevices: z.array(z.string()).optional(),
    powerEfficient: z.boolean().optional()
  },
  async ({ engineId, targetDevices, powerEfficient }: OptimizeMobileParams) => {
    const analysis = await engineDetector.detectEngine(document);
    if (!analysis) {
      throw new Error('No game engine detected');
    }

    const metrics = await mcpServer.getResource(`metrics://${engineId}`);
    const { devicePixelRatio, canvasSize } = metrics.contents[0].metadata;

    let prompt = `Optimize the WebGL game for mobile devices.\n\n`;
    prompt += `Current Setup:\n`;
    prompt += `- Engine: ${analysis.engineName}\n`;
    prompt += `- Canvas Size: ${canvasSize.width}x${canvasSize.height}\n`;
    prompt += `- Device Pixel Ratio: ${devicePixelRatio}\n\n`;

    if (targetDevices?.length) {
      prompt += `Target Devices: ${targetDevices.join(', ')}\n`;
    }
    if (powerEfficient) {
      prompt += `Optimizing for power efficiency\n`;
    }

    prompt += `\nMobile Optimization Steps:\n`;
    prompt += `1. Adjust viewport settings\n`;
    prompt += `2. Implement touch controls\n`;
    prompt += `3. Optimize asset loading\n`;
    prompt += `4. Handle device orientation changes\n`;
    prompt += `5. Manage texture memory\n`;

    return {
      messages: [{
        role: "assistant",
        content: prompt
      }]
    };
  }
);

// Handle WebSocket connections with error handling
wss.on('connection', (ws: WebSocket) => {
  const transport = new WebSocketServerTransport(ws);
  
  ws.on('error', (error: Error) => {
    logger.error('WebSocket Error:', {
      error: error.message,
      stack: error.stack
    });
  });

  mcpServer.connect(transport).catch((error: Error) => {
    logger.error('MCP Connection Error:', {
      error: error.message,
      stack: error.stack
    });
  });
});

// Create HTTP server with error handling
const server = app.listen(port, () => {
  logger.info(`WebGL MCP Server listening on port ${port}`);
});

server.on('error', (error: Error) => {
  logger.error('HTTP Server Error:', {
    error: error.message,
    stack: error.stack
  });
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Global error handling
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Promise Rejection:', {
    error: error.message,
    stack: error.stack
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack
  });
  
  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});

export { mcpServer, logger }; 