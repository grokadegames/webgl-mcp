import { promises as fs } from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

export interface BuildAnalysis {
  totalSize: number;
  compressedSize: number;
  files: BuildFileAnalysis[];
  suggestions: string[];
  templateUsed?: string;
  templateConfig?: {
    scaleToFit?: boolean;
    optimizeForPixelArt?: boolean;
    hasLoadingBar?: boolean;
    mobileOptimized?: boolean;
  };
}

export interface BuildFileAnalysis {
  path: string;
  size: number;
  compressedSize: number;
  type: string;
  suggestions: string[];
}

export class WebGLBuildAnalyzer {
  async analyzeBuild(buildPath: string): Promise<BuildAnalysis> {
    const analysis: BuildAnalysis = {
      totalSize: 0,
      compressedSize: 0,
      files: [],
      suggestions: []
    };

    try {
      const files = await this.getAllFiles(buildPath);
      
      for (const file of files) {
        const fileAnalysis = await this.analyzeFile(file, buildPath);
        analysis.files.push(fileAnalysis);
        analysis.totalSize += fileAnalysis.size;
        analysis.compressedSize += fileAnalysis.compressedSize;
      }

      // Check for HTML template usage
      const indexFile = files.find(f => path.basename(f).toLowerCase() === 'index.html');
      if (indexFile) {
        const htmlAnalysis = await this.analyzeHTMLTemplate(indexFile);
        analysis.templateUsed = htmlAnalysis.templateName;
        analysis.templateConfig = htmlAnalysis.config;
        
        // Add template-specific suggestions
        if (htmlAnalysis.suggestions.length > 0) {
          analysis.suggestions.push(...htmlAnalysis.suggestions);
        }
      }

      // Analyze overall build
      this.analyzeBuildStructure(analysis);

    } catch (error) {
      console.error('Error analyzing build:', error);
      throw error;
    }

    return analysis;
  }

  private async getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private async analyzeHTMLTemplate(filePath: string): Promise<{
    templateName: string;
    config: {
      scaleToFit?: boolean;
      optimizeForPixelArt?: boolean;
      hasLoadingBar?: boolean;
      mobileOptimized?: boolean;
    };
    suggestions: string[];
  }> {
    const content = await fs.readFile(filePath, 'utf8');
    const suggestions: string[] = [];
    let templateName = 'Unknown';
    const config: {
      scaleToFit?: boolean;
      optimizeForPixelArt?: boolean;
      hasLoadingBar?: boolean;
      mobileOptimized?: boolean;
    } = {};

    // Check for Better Minimal WebGL Template
    if (content.includes('BetterMinimal') || 
        (content.includes('scaleToFit') && content.includes('data-pixel-art'))) {
      templateName = 'Better Minimal WebGL Template';
      
      // Check for scaling configuration
      config.scaleToFit = !content.includes('scaleToFit = false');
      
      // Check for pixel art optimization
      if (content.includes('data-pixel-art="true"')) {
        config.optimizeForPixelArt = true;
      }
      
      // Check for loading bar
      if (content.includes('progressHandler') && content.includes('linear-gradient')) {
        config.hasLoadingBar = true;
      }
      
      // Check for mobile optimization
      if (content.includes('iPhone|iPad|iPod|Android')) {
        config.mobileOptimized = true;
      }
      
      // Generate template-specific suggestions
      if (!config.scaleToFit) {
        suggestions.push('Consider enabling scale-to-fit for better user experience on different screen sizes.');
      }
      
      if (!config.hasLoadingBar) {
        suggestions.push('Enable the loading bar to provide visual feedback during asset loading.');
      }
      
      if (!config.mobileOptimized) {
        suggestions.push('Enable mobile optimizations for better performance on mobile devices.');
      }
    } else if (content.includes('UnityLoader') || content.includes('unityInstance')) {
      templateName = 'Unity Default Template';
      suggestions.push('Consider using the Better Minimal WebGL Template for improved scaling and mobile support.');
      suggestions.push('The Better Minimal WebGL Template provides better canvas scaling and improved mobile device support.');
    }

    return { templateName, config, suggestions };
  }

  private async analyzeFile(filePath: string, buildPath: string): Promise<BuildFileAnalysis> {
    const content = await fs.readFile(filePath);
    const compressedContent = await gzip(content);
    const relativePath = path.relative(buildPath, filePath);
    const extension = path.extname(filePath).toLowerCase();

    const analysis: BuildFileAnalysis = {
      path: relativePath,
      size: content.length,
      compressedSize: compressedContent.length,
      type: this.getFileType(extension),
      suggestions: []
    };

    // Analyze specific file types
    switch (analysis.type) {
      case 'texture':
        this.analyzeTexture(analysis, content);
        break;
      case 'shader':
        this.analyzeShader(analysis, content);
        break;
      case 'javascript':
        this.analyzeJavaScript(analysis, content);
        break;
    }

    return analysis;
  }

  private getFileType(extension: string): string {
    switch (extension) {
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.webp':
      case '.gif':
        return 'texture';
      case '.glsl':
      case '.vert':
      case '.frag':
        return 'shader';
      case '.js':
        return 'javascript';
      case '.wasm':
        return 'webassembly';
      case '.html':
        return 'html';
      case '.css':
        return 'stylesheet';
      case '.json':
        return 'data';
      default:
        return 'other';
    }
  }

  private analyzeTexture(analysis: BuildFileAnalysis, content: Buffer): void {
    // Check texture size - large textures may need optimization
    if (content.length > 1024 * 1024) {
      analysis.suggestions.push(`Large texture (${(content.length / (1024 * 1024)).toFixed(2)} MB). Consider using compression or smaller textures.`);
    }
    
    // Check compression savings
    const compressionRatio = analysis.size / analysis.compressedSize;
    if (compressionRatio < 1.2) {
      analysis.suggestions.push('Texture has low compression ratio. Consider using WebP format for better compression.');
    }
  }

  private analyzeShader(analysis: BuildFileAnalysis, content: Buffer): void {
    const shaderText = content.toString('utf8');
    
    // Check for potential shader optimizations
    if (shaderText.includes('pow(') || shaderText.includes('exp(') || shaderText.includes('log(')) {
      analysis.suggestions.push('Shader uses expensive operations (pow, exp, log). Consider optimizing for better performance.');
    }
    
    // Check for precision qualifiers
    if (!shaderText.includes('precision ')) {
      analysis.suggestions.push('Shader missing precision qualifiers. Define precision for better performance and consistency.');
    }
  }

  private analyzeJavaScript(analysis: BuildFileAnalysis, content: Buffer): void {
    const jsText = content.toString('utf8');
    
    // Check for large JS files
    if (content.length > 5 * 1024 * 1024) {
      analysis.suggestions.push(`Large JavaScript file (${(content.length / (1024 * 1024)).toFixed(2)} MB). Consider code splitting or minification.`);
    }
    
    // Check for WebGL context creation
    if (jsText.includes('getContext("webgl")') && !jsText.includes('getContext("webgl2")')) {
      analysis.suggestions.push('Using WebGL 1.0. Consider upgrading to WebGL 2.0 for better performance and features.');
    }
    
    // Check for memory management issues
    if (jsText.includes('new Uint8Array(') || jsText.includes('new Float32Array(')) {
      if (!jsText.includes('delete') && !jsText.includes('dispose')) {
        analysis.suggestions.push('Creating typed arrays without apparent cleanup. Watch for memory leaks.');
      }
    }
  }

  private analyzeBuildStructure(analysis: BuildAnalysis): void {
    // Group files by type
    const fileTypes = analysis.files.reduce((types, file) => {
      types[file.type] = (types[file.type] || 0) + file.size;
      return types;
    }, {} as Record<string, number>);
    
    // Check total size
    if (analysis.totalSize > 100 * 1024 * 1024) {
      analysis.suggestions.push(`Large build size (${(analysis.totalSize / (1024 * 1024)).toFixed(2)} MB). Consider optimizing assets and code splitting.`);
    }
    
    // Check texture usage
    if (fileTypes['texture'] && fileTypes['texture'] > analysis.totalSize * 0.5) {
      analysis.suggestions.push(`Textures account for over 50% of build size. Consider using texture compression or lower resolution textures.`);
    }
    
    // Check JavaScript size
    if (fileTypes['javascript'] && fileTypes['javascript'] > 20 * 1024 * 1024) {
      analysis.suggestions.push(`Large JavaScript size (${(fileTypes['javascript'] / (1024 * 1024)).toFixed(2)} MB). Consider code splitting and tree shaking.`);
    }
    
    // Check WebAssembly usage
    if (!fileTypes['webassembly']) {
      analysis.suggestions.push('No WebAssembly detected. Consider using WebAssembly for performance-critical code.');
    }
    
    // Template-specific optimization suggestions
    if (analysis.templateUsed === 'Better Minimal WebGL Template') {
      analysis.suggestions.push('Using Better Minimal WebGL Template. Good choice for optimal WebGL performance and compatibility.');
    } else if (analysis.templateUsed === 'Unknown') {
      analysis.suggestions.push('Using an unknown HTML template. Consider using Better Minimal WebGL Template for optimal WebGL performance.');
    }
  }
} 