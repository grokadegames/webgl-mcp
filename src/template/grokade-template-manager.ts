import { promises as fs } from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

export interface GrokadeTemplateConfig {
  // Display settings
  scaleToFit?: boolean;
  optimizeForPixelArt?: boolean;
  centerCanvas?: boolean;
  customBackground?: string;
  
  // Loading settings
  showLoadingBar?: boolean;
  showLoadingText?: boolean;
  clickToPlay?: boolean;
  fullscreenButton?: boolean;
  showScrollbars?: boolean;
  
  // Mobile settings
  mobileOptimized?: boolean;
  forceMobileFullscreen?: boolean;
  
  // Performance settings
  compressionEnabled?: boolean;
  maxFileSize?: number;
  maxTotalFiles?: number;
  maxFilenameLength?: number;
  
  // Security settings
  allowedFileTypes?: string[];
  httpsRequired?: boolean;
}

export class GrokadeTemplateManager {
  private readonly templatePath: string;
  private readonly defaultConfig: GrokadeTemplateConfig = {
    scaleToFit: true,
    optimizeForPixelArt: false,
    centerCanvas: true,
    showLoadingBar: true,
    showLoadingText: true,
    clickToPlay: true,
    fullscreenButton: true,
    showScrollbars: false,
    mobileOptimized: true,
    forceMobileFullscreen: true,
    compressionEnabled: true,
    maxFileSize: 200 * 1024 * 1024, // 200MB
    maxTotalFiles: 1000,
    maxFilenameLength: 240,
    allowedFileTypes: [
      '.html', '.js', '.css', '.wasm',
      '.jpg', '.jpeg', '.png', '.webp', '.svg',
      '.wav', '.ogg', '.mp3',
      '.glsl', '.vert', '.frag',
      '.json', '.txt'
    ],
    httpsRequired: true
  };

  constructor(templatePath: string) {
    this.templatePath = templatePath;
  }

  async applyTemplate(config: Partial<GrokadeTemplateConfig> = {}): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    try {
      await this.validateTemplate();
      await this.injectTemplateStyles(finalConfig);
      await this.setupLoadingIndicators(finalConfig);
      await this.configureCompression(finalConfig);
      await this.setupMobileSupport(finalConfig);
      await this.injectSecurityHeaders();
    } catch (error) {
      console.error('Error applying template:', error);
      throw error;
    }
  }

  private async validateTemplate(): Promise<void> {
    const indexPath = path.join(this.templatePath, 'index.html');
    if (!await this.fileExists(indexPath)) {
      throw new Error('Template must contain an index.html file');
    }
  }

  private async injectTemplateStyles(config: GrokadeTemplateConfig): Promise<void> {
    const styles = `
      <style>
        #grokade-container {
          position: absolute;
          ${config.centerCanvas ? 'left: 50%; top: 50%; transform: translate(-50%, -50%);' : ''}
          width: 100%;
          height: 100%;
          overflow: ${config.showScrollbars ? 'auto' : 'hidden'};
          background: ${config.customBackground || '#000000'};
        }
        
        #grokade-canvas {
          ${config.scaleToFit ? `
            width: 100%;
            height: 100%;
            ${config.optimizeForPixelArt ? 'image-rendering: pixelated;' : ''}
          ` : ''}
        }

        #grokade-fullscreen-button {
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 100;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          #grokade-container {
            ${config.forceMobileFullscreen ? 'position: fixed; width: 100vw; height: 100vh;' : ''}
          }
        }
      </style>
    `;

    const indexPath = path.join(this.templatePath, 'index.html');
    let html = await fs.readFile(indexPath, 'utf-8');
    html = html.replace('</head>', `${styles}\n</head>`);
    await fs.writeFile(indexPath, html, 'utf-8');
  }

  private async setupLoadingIndicators(config: GrokadeTemplateConfig): Promise<void> {
    if (!config.showLoadingBar && !config.showLoadingText) return;

    const loadingHtml = `
      <div id="grokade-loading-container">
        ${config.showLoadingBar ? `
          <div id="grokade-loading-bar">
            <div id="grokade-loading-bar-fill"></div>
          </div>
        ` : ''}
        ${config.showLoadingText ? `
          <div id="grokade-loading-text">Loading...</div>
        ` : ''}
      </div>
    `;

    const loadingStyles = `
      <style>
        #grokade-loading-container {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        #grokade-loading-bar {
          width: 200px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          overflow: hidden;
        }

        #grokade-loading-bar-fill {
          width: 0%;
          height: 100%;
          background: #4CAF50;
          transition: width 0.3s ease;
        }

        #grokade-loading-text {
          margin-top: 10px;
          color: white;
          font-family: Arial, sans-serif;
        }
      </style>
    `;

    const loadingScript = `
      <script>
        window.GrokadeLoader = {
          updateProgress: function(progress) {
            ${config.showLoadingBar ? `
              const fill = document.getElementById('grokade-loading-bar-fill');
              if (fill) fill.style.width = (progress * 100) + '%';
            ` : ''}
            ${config.showLoadingText ? `
              const text = document.getElementById('grokade-loading-text');
              if (text) text.textContent = 'Loading: ' + Math.round(progress * 100) + '%';
            ` : ''}
          }
        };
      </script>
    `;

    const indexPath = path.join(this.templatePath, 'index.html');
    let html = await fs.readFile(indexPath, 'utf-8');
    html = html.replace('</head>', `${loadingStyles}\n${loadingScript}\n</head>`);
    html = html.replace('<body>', `<body>\n${loadingHtml}`);
    await fs.writeFile(indexPath, html, 'utf-8');
  }

  private async configureCompression(config: GrokadeTemplateConfig): Promise<void> {
    if (!config.compressionEnabled) return;

    // Add compression configuration
    const compressionScript = `
      <script>
        window.GrokadeCompression = {
          enabled: true,
          async decompressData(data) {
            // Handle compressed data using WebAssembly
            return data;
          }
        };
      </script>
    `;

    const indexPath = path.join(this.templatePath, 'index.html');
    let html = await fs.readFile(indexPath, 'utf-8');
    html = html.replace('</head>', `${compressionScript}\n</head>`);
    await fs.writeFile(indexPath, html, 'utf-8');
  }

  private async setupMobileSupport(config: GrokadeTemplateConfig): Promise<void> {
    if (!config.mobileOptimized) return;

    const mobileScript = `
      <script>
        window.GrokadeMobile = {
          isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
          init() {
            if (this.isMobile) {
              document.body.classList.add('grokade-mobile');
              ${config.forceMobileFullscreen ? `
                document.documentElement.style.overflow = 'hidden';
                document.body.style.overflow = 'hidden';
              ` : ''}
            }
          }
        };
        window.GrokadeMobile.init();
      </script>
    `;

    const indexPath = path.join(this.templatePath, 'index.html');
    let html = await fs.readFile(indexPath, 'utf-8');
    html = html.replace('</head>', `${mobileScript}\n</head>`);
    await fs.writeFile(indexPath, html, 'utf-8');
  }

  private async injectSecurityHeaders(): Promise<void> {
    // These headers would typically be set by the server, but we'll document them here
    const headers = {
      'Content-Security-Policy': "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'",
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Add a comment in the HTML documenting required headers
    const headerComment = `
      <!-- 
      Required Security Headers:
      ${Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\n')}
      -->
    `;

    const indexPath = path.join(this.templatePath, 'index.html');
    let html = await fs.readFile(indexPath, 'utf-8');
    html = html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n${headerComment}`);
    await fs.writeFile(indexPath, html, 'utf-8');
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
} 