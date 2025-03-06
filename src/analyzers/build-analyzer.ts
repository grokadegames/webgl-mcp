import { promises as fs } from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

export interface BuildAnalysis {
  totalSize: number;
  compressedSize: number;
  files: BuildFileAnalysis[];
  suggestions: string[];
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
      case '.ktx':
      case '.dds':
        return 'texture';
      case '.glsl':
      case '.vert':
      case '.frag':
        return 'shader';
      case '.js':
        return 'javascript';
      case '.wasm':
        return 'webassembly';
      default:
        return 'other';
    }
  }

  private analyzeTexture(analysis: BuildFileAnalysis, content: Buffer): void {
    const sizeInMB = analysis.size / (1024 * 1024);
    
    if (sizeInMB > 1) {
      analysis.suggestions.push(
        'Consider using compressed texture formats (KTX/DDS)',
        'Evaluate if texture resolution can be reduced'
      );
    }

    if (analysis.path.endsWith('.png')) {
      analysis.suggestions.push('Consider using WebP format for better compression');
    }
  }

  private analyzeShader(analysis: BuildFileAnalysis, content: Buffer): void {
    const shaderCode = content.toString('utf-8');
    
    if (shaderCode.includes('pow(') || shaderCode.includes('exp(')) {
      analysis.suggestions.push('Consider optimizing expensive shader operations');
    }

    if (shaderCode.length > 1000) {
      analysis.suggestions.push('Consider splitting large shaders into smaller chunks');
    }
  }

  private analyzeJavaScript(analysis: BuildFileAnalysis, content: Buffer): void {
    const code = content.toString('utf-8');
    
    if (code.includes('console.log')) {
      analysis.suggestions.push('Remove debug console.log statements for production');
    }

    if (!code.includes('use strict')) {
      analysis.suggestions.push('Consider adding "use strict" for better optimization');
    }
  }

  private analyzeBuildStructure(analysis: BuildAnalysis): void {
    // Check total build size
    const totalSizeMB = analysis.totalSize / (1024 * 1024);
    if (totalSizeMB > 50) {
      analysis.suggestions.push('Total build size exceeds 50MB, consider code splitting');
    }

    // Check compression ratio
    const compressionRatio = analysis.compressedSize / analysis.totalSize;
    if (compressionRatio > 0.8) {
      analysis.suggestions.push('Poor compression ratio, review asset optimization');
    }

    // Check file distribution
    const textureFiles = analysis.files.filter(f => f.type === 'texture');
    const textureSizeTotal = textureFiles.reduce((sum, f) => sum + f.size, 0);
    if (textureSizeTotal > analysis.totalSize * 0.5) {
      analysis.suggestions.push('Textures account for over 50% of build size, consider optimization');
    }
  }
} 