// WebGL MCP server for analyzing and optimizing WebGL applications
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createRequire } from "module";
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);

// Helper function to check if a path exists
async function pathExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Helper function to analyze HTML file for template features
async function analyzeTemplate(filePath) {
  if (!await pathExists(filePath)) {
    return {
      templateName: 'Unknown',
      features: [],
      recommendations: ['Could not find HTML file to analyze template.']
    };
  }

  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const features = [];
    const recommendations = [];
    let templateName = 'Unknown Template';
    
    // Check for Better Minimal WebGL Template
    if (content.includes('BetterMinimal') || 
        (content.includes('scaleToFit') && content.includes('data-pixel-art'))) {
      
      templateName = 'Better Minimal WebGL Template';
      
      // Detect features
      if (content.includes('scaleToFit')) features.push('Canvas Scaling');
      if (content.includes('data-pixel-art="true"')) features.push('Pixel Art Optimization');
      if (content.includes('progressHandler')) features.push('Loading Progress Bar');
      if (content.includes('iPhone|iPad|iPod|Android')) features.push('Mobile Detection');
      
      // Check for potential improvements
      if (!content.includes('progressHandler')) {
        recommendations.push('Add loading progress indicator for better user experience');
      }
      
      if (!content.includes('data-pixel-art')) {
        recommendations.push('Consider adding pixel art optimization for pixel art games');
      }
      
      if (!content.includes('window.focus()')) {
        recommendations.push('Add window.focus() after resize to ensure keyboard input works correctly');
      }
    } 
    // Unity Default Template
    else if (content.includes('UnityLoader') || content.includes('unityInstance')) {
      templateName = 'Unity Default Template';
      
      recommendations.push('Consider using the Better Minimal WebGL Template for improved performance and user experience');
      recommendations.push('Better Minimal WebGL Template provides automatic canvas scaling for different screen sizes');
      recommendations.push('Better Minimal WebGL Template includes mobile optimizations and loading progress visualization');
    } 
    // Unknown Template
    else {
      recommendations.push('Using an unknown template. Consider adopting Better Minimal WebGL Template for optimal WebGL performance');
    }
    
    return { templateName, features, recommendations };
  } catch (error) {
    console.error('Error analyzing template:', error);
    return {
      templateName: 'Error',
      features: [],
      recommendations: [`Error analyzing template: ${error.message}`]
    };
  }
}

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
  async ({ path: buildPath }) => {
    console.error(`Analyzing WebGL at path: ${buildPath}`);
    
    try {
      // Determine if path is a file or directory
      const stats = await fs.promises.stat(buildPath);
      const isDirectory = stats.isDirectory();
      
      // Find index.html file
      let indexPath;
      if (isDirectory) {
        indexPath = path.join(buildPath, 'index.html');
        if (!await pathExists(indexPath)) {
          // Try to find index.html in any subdirectory
          const files = await fs.promises.readdir(buildPath, { withFileTypes: true });
          for (const file of files) {
            if (file.isDirectory()) {
              const subIndexPath = path.join(buildPath, file.name, 'index.html');
              if (await pathExists(subIndexPath)) {
                indexPath = subIndexPath;
                break;
              }
            }
          }
        }
      } else if (path.basename(buildPath).toLowerCase() === 'index.html') {
        indexPath = buildPath;
      }
      
      // Analyze template if index.html was found
      const templateAnalysis = indexPath ? await analyzeTemplate(indexPath) : {
        templateName: 'Unknown',
        features: [],
        recommendations: ['No index.html file found to analyze.']
      };
      
      // Count JS and asset files if it's a directory
      let fileStats = {
        total: 0,
        js: 0,
        wasm: 0,
        textures: 0,
        other: 0
      };
      
      let largeFiles = [];
      
      if (isDirectory) {
        await countFiles(buildPath, fileStats, largeFiles);
      }
      
      // WebGL Analysis results
      const analysisText = `Analyzed WebGL at path: ${buildPath}

Template Analysis:
- Template: ${templateAnalysis.templateName}
- Features: ${templateAnalysis.features.length ? templateAnalysis.features.join(', ') : 'None detected'}

${isDirectory ? `Build Statistics:
- Total Files: ${fileStats.total} 
- JavaScript Files: ${fileStats.js}
- WebAssembly Files: ${fileStats.wasm}
- Texture/Image Files: ${fileStats.textures}
- Other Files: ${fileStats.other}` : ''}

${largeFiles.length ? `Large Files Detected (>2MB):
${largeFiles.map(f => `- ${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`).join('\n')}` : ''}

Recommendations:
${templateAnalysis.recommendations.map(r => `- ${r}`).join('\n')}
${isDirectory && fileStats.js > 10 ? '- Large number of JavaScript files detected. Consider code splitting or bundling.' : ''}
${largeFiles.length ? '- Consider optimizing large files to improve load times.' : ''}
${fileStats.wasm === 0 ? '- No WebAssembly files detected. Consider using WebAssembly for performance-critical code.' : ''}`;

      return {
        content: [{
          type: "text",
          text: analysisText
        }]
      };
    } catch (error) {
      console.error('Error analyzing WebGL:', error);
      throw new Error(`Failed to analyze WebGL at path: ${buildPath}`);
    }
  }
);

// Helper function to count files recursively
async function countFiles(dirPath, stats, largeFiles) {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      await countFiles(fullPath, stats, largeFiles);
    } else {
      stats.total++;
      
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.js') {
        stats.js++;
      } else if (ext === '.wasm') {
        stats.wasm++;
      } else if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'].includes(ext)) {
        stats.textures++;
      } else {
        stats.other++;
      }
      
      // Check for large files
      try {
        const fileStat = await fs.promises.stat(fullPath);
        if (fileStat.size > 2 * 1024 * 1024) { // Files larger than 2MB
          largeFiles.push({
            name: path.relative(dirPath, fullPath),
            size: fileStat.size
          });
        }
      } catch (error) {
        console.error(`Error checking file size: ${fullPath}`, error);
      }
    }
  }
}

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
  async ({ path: buildPath, targetFPS = 60, memoryLimit = 512, optimizationGoals = ['performance'] }) => {
    console.error(`Optimizing WebGL at path: ${buildPath}`, { targetFPS, memoryLimit, optimizationGoals });
    
    try {
      // Determine if path is a file or directory
      const stats = await fs.promises.stat(buildPath);
      const isDirectory = stats.isDirectory();
      
      // Find index.html file
      let indexPath;
      if (isDirectory) {
        indexPath = path.join(buildPath, 'index.html');
        if (!await pathExists(indexPath)) {
          // Try to find index.html in any subdirectory
          const files = await fs.promises.readdir(buildPath, { withFileTypes: true });
          for (const file of files) {
            if (file.isDirectory()) {
              const subIndexPath = path.join(buildPath, file.name, 'index.html');
              if (await pathExists(subIndexPath)) {
                indexPath = subIndexPath;
                break;
              }
            }
          }
        }
      } else if (path.basename(buildPath).toLowerCase() === 'index.html') {
        indexPath = buildPath;
      }
      
      // Analyze template if index.html was found
      const templateAnalysis = indexPath ? await analyzeTemplate(indexPath) : {
        templateName: 'Unknown',
        features: [],
        recommendations: ['No index.html file found to analyze.']
      };
      
      // Generate optimization recommendations based on goals
      const optimizationRecommendations = [];
      
      // Template-specific recommendations
      if (templateAnalysis.templateName !== 'Better Minimal WebGL Template') {
        optimizationRecommendations.push('Use the Better Minimal WebGL Template for optimized WebGL performance:');
        optimizationRecommendations.push('  - Provides automatic canvas scaling');
        optimizationRecommendations.push('  - Includes loading progress visualization');
        optimizationRecommendations.push('  - Optimizes for mobile devices');
        optimizationRecommendations.push('  - Supports pixel art optimization');
      }
      
      // Performance recommendations
      if (optimizationGoals.includes('performance')) {
        optimizationRecommendations.push('\nPerformance Optimization Recommendations:');
        optimizationRecommendations.push('  - Enable compression for all assets (gzip/Brotli)');
        optimizationRecommendations.push('  - Use WebGL 2.0 for better rendering performance');
        optimizationRecommendations.push('  - Implement texture compression (DXT/ASTC)');
        optimizationRecommendations.push('  - Use WebAssembly for performance-critical code');
        optimizationRecommendations.push('  - Implement shader minification and optimization');
        optimizationRecommendations.push('  - Reduce draw calls through batching');
        optimizationRecommendations.push('  - Implement occlusion culling for complex scenes');
      }
      
      // Memory recommendations
      if (optimizationGoals.includes('memory')) {
        optimizationRecommendations.push('\nMemory Optimization Recommendations:');
        optimizationRecommendations.push('  - Set explicit memory limit in WebGL context');
        optimizationRecommendations.push(`  - Target memory usage below ${memoryLimit}MB`);
        optimizationRecommendations.push('  - Implement asset unloading for unused resources');
        optimizationRecommendations.push('  - Use texture atlases to reduce memory fragmentation');
        optimizationRecommendations.push('  - Implement level streaming for large worlds');
        optimizationRecommendations.push('  - Use lower resolution textures with mipmaps');
      }
      
      // Mobile recommendations
      if (optimizationGoals.includes('mobile')) {
        optimizationRecommendations.push('\nMobile Optimization Recommendations:');
        optimizationRecommendations.push('  - Implement responsive design with Better Minimal WebGL Template');
        optimizationRecommendations.push('  - Use appropriate touch input handling');
        optimizationRecommendations.push('  - Reduce shader complexity for mobile GPUs');
        optimizationRecommendations.push('  - Implement progressive loading for mobile networks');
        optimizationRecommendations.push('  - Add battery-saving measures (lower FPS when inactive)');
        optimizationRecommendations.push('  - Optimize for offline usage with service workers');
      }
      
      // Quality recommendations
      if (optimizationGoals.includes('quality')) {
        optimizationRecommendations.push('\nQuality Optimization Recommendations:');
        optimizationRecommendations.push('  - Implement post-processing effects with WebGL 2.0');
        optimizationRecommendations.push('  - Use HDR rendering where supported');
        optimizationRecommendations.push('  - Enable anisotropic filtering for textures');
        optimizationRecommendations.push('  - Implement MSAA or FXAA for anti-aliasing');
        optimizationRecommendations.push('  - Use dynamic resolution scaling based on performance');
      }
      
      // Implementation guidance
      optimizationRecommendations.push('\nImplementation Notes:');
      optimizationRecommendations.push('  - For Better Minimal WebGL Template implementation:');
      optimizationRecommendations.push('    * Download from: https://seansleblanc.itch.io/better-minimal-webgl-template (external resource)');
      optimizationRecommendations.push('    * Extract WebGLTemplates folder to your Unity project\'s Assets folder');
      optimizationRecommendations.push('    * Select the template in Player Settings under WebGL > Resolution and Presentation');
      optimizationRecommendations.push('    * Configure options for scaling, pixel art optimization, and background color');
      
      // Target FPS recommendations
      optimizationRecommendations.push(`\nTarget FPS: ${targetFPS}`);
      if (targetFPS > 60) {
        optimizationRecommendations.push('  - For high FPS targets:');
        optimizationRecommendations.push('    * Reduce draw calls and batch similar materials');
        optimizationRecommendations.push('    * Simplify shaders and reduce instruction count');
        optimizationRecommendations.push('    * Consider implementing adaptive quality settings');
      }
      
      return {
        content: [{
          type: "text",
          text: `Optimization Recommendations for WebGL at path: ${buildPath}\n\n${optimizationRecommendations.join('\n')}`
        }]
      };
    } catch (error) {
      console.error('Error optimizing WebGL:', error);
      throw new Error(`Failed to optimize WebGL at path: ${buildPath}`);
    }
  }
);

// Add WebGL performance analysis tool
server.tool(
  "analyze-performance",
  {
    path: z.string().describe("Path to WebGL build folder or index.html file"),
    duration: z.number().optional().describe("Duration of performance test in seconds")
  },
  async ({ path: buildPath, duration = 10 }) => {
    console.error(`Analyzing WebGL performance at path: ${buildPath} for ${duration} seconds`);
    
    try {
      // Determine if path is a file or directory
      const stats = await fs.promises.stat(buildPath);
      const isDirectory = stats.isDirectory();
      
      // Find index.html file
      let indexPath;
      if (isDirectory) {
        indexPath = path.join(buildPath, 'index.html');
        if (!await pathExists(indexPath)) {
          // Try to find index.html in any subdirectory
          const files = await fs.promises.readdir(buildPath, { withFileTypes: true });
          for (const file of files) {
            if (file.isDirectory()) {
              const subIndexPath = path.join(buildPath, file.name, 'index.html');
              if (await pathExists(subIndexPath)) {
                indexPath = subIndexPath;
                break;
              }
            }
          }
        }
      } else if (path.basename(buildPath).toLowerCase() === 'index.html') {
        indexPath = buildPath;
      }
      
      // Analyze template if index.html was found
      const templateAnalysis = indexPath ? await analyzeTemplate(indexPath) : {
        templateName: 'Unknown',
        features: [],
        recommendations: ['No index.html file found to analyze.']
      };
      
      // Performance analysis simulation (in a real implementation, this would involve running the WebGL content)
      const performanceRecommendations = [];
      
      // Simulate/predict performance metrics
      const fps = Math.floor(Math.random() * 20) + 45; // Simulated fps between 45-65
      const drawCalls = Math.floor(Math.random() * 200) + 50; // Simulated draw calls between 50-250
      const triangles = Math.floor(Math.random() * 100000) + 10000; // Simulated triangle count
      const textureMemory = Math.floor(Math.random() * 500) + 50; // Simulated texture memory (MB)
      const jsMemory = Math.floor(Math.random() * 200) + 50; // Simulated JS memory (MB)
      
      // Generate performance recommendations
      if (fps < 60) {
        performanceRecommendations.push(`Low FPS (${fps}). Consider optimizing rendering and CPU usage.`);
      }
      
      if (drawCalls > 100) {
        performanceRecommendations.push(`High draw call count (${drawCalls}). Implement batching to reduce draw calls.`);
      }
      
      if (triangles > 50000) {
        performanceRecommendations.push(`High triangle count (${triangles}). Consider using LOD (Level of Detail) for complex models.`);
      }
      
      if (textureMemory > 200) {
        performanceRecommendations.push(`High texture memory usage (${textureMemory}MB). Optimize texture sizes and compression.`);
      }
      
      if (jsMemory > 100) {
        performanceRecommendations.push(`High JavaScript memory usage (${jsMemory}MB). Check for memory leaks and optimize object pooling.`);
      }
      
      // Template specific performance recommendations
      if (templateAnalysis.templateName !== 'Better Minimal WebGL Template') {
        performanceRecommendations.push('Using non-optimal WebGL template. The Better Minimal WebGL Template can improve rendering performance.');
      }
      
      const performanceText = `Performance Analysis for WebGL at path: ${buildPath}

Note: This is a simulated analysis. Actual performance would require running the WebGL content.

Results (Simulated):
- Average FPS: ${fps}
- Draw calls per frame: ${drawCalls}
- Triangles per frame: ${triangles.toLocaleString()}
- Texture memory usage: ${textureMemory}MB
- JavaScript memory usage: ${jsMemory}MB

Template Information:
- Template: ${templateAnalysis.templateName}
- Features: ${templateAnalysis.features.length ? templateAnalysis.features.join(', ') : 'None detected'}

Performance Recommendations:
${performanceRecommendations.map(r => `- ${r}`).join('\n')}

Better Minimal WebGL Template Benefits:
- Optimized canvas scaling for better performance
- Reduced memory usage through optimized rendering
- Improved mobile performance with proper viewport handling
- More efficient loading progress visualization`;

      return {
        content: [{
          type: "text",
          text: performanceText
        }]
      };
    } catch (error) {
      console.error('Error analyzing WebGL performance:', error);
      throw new Error(`Failed to analyze WebGL performance at path: ${buildPath}`);
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("WebGL MCP Server started and connected to transport");
