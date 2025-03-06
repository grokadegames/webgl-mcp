"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrokadeTemplateManager = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const zlib = __importStar(require("zlib"));
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib.gzip);
class GrokadeTemplateManager {
    constructor(templatePath) {
        this.defaultConfig = {
            scaleToFit: true,
            optimizeForPixelArt: false,
            centerCanvas: true,
            customBackground: '#000000',
            showLoadingBar: true,
            showLoadingText: true,
            loadingBarColor: 'white',
            clickToPlay: false,
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
        this.templatePath = templatePath;
    }
    async applyTemplate(config = {}) {
        const finalConfig = { ...this.defaultConfig, ...config };
        try {
            await this.validateTemplate();
            await this.injectTemplateStyles(finalConfig);
            await this.setupLoadingIndicators(finalConfig);
            await this.configureCompression(finalConfig);
            await this.setupMobileSupport(finalConfig);
            await this.injectSecurityHeaders();
            await this.optimizeScaling(finalConfig);
        }
        catch (error) {
            console.error('Error applying template:', error);
            throw error;
        }
    }
    async validateTemplate() {
        const indexPath = path.join(this.templatePath, 'index.html');
        if (!await this.fileExists(indexPath)) {
            throw new Error('Template must contain an index.html file');
        }
    }
    async injectTemplateStyles(config) {
        const styles = `
      <style>
        html, body {
          background: ${config.customBackground};
          width: 100%;
          height: 100%;
          overflow: ${config.showScrollbars ? 'auto' : 'hidden'};
          padding: 0;
          margin: 0;
        }
        
        #gameContainer {
          background: transparent !important;
          position: absolute;
        }
        
        #gameContainer canvas {
          position: absolute;
        }
        
        #gameContainer canvas[data-pixel-art="true"] {
          position: absolute;
          image-rendering: optimizeSpeed;
          image-rendering: -webkit-crisp-edges;
          image-rendering: -moz-crisp-edges;
          image-rendering: -o-crisp-edges;
          image-rendering: crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: optimize-contrast;
          image-rendering: pixelated;
          -ms-interpolation-mode: nearest-neighbor;
        }
        
        /* Loading container styles */
        #loading-container {
          display: ${config.showLoadingText || config.showLoadingBar ? 'flex' : 'none'};
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          color: white;
          font-family: sans-serif;
          text-align: center;
        }
        
        #loading-text {
          display: ${config.showLoadingText ? 'block' : 'none'};
          margin-bottom: 10px;
        }
      </style>
    `;
        try {
            const indexPath = path.join(this.templatePath, 'index.html');
            let html = await fs_1.promises.readFile(indexPath, 'utf8');
            // Replace existing styles or add new ones
            if (html.includes('</head>')) {
                html = html.replace('</head>', `${styles}</head>`);
            }
            else {
                html = `<html><head>${styles}</head>${html}</html>`;
            }
            await fs_1.promises.writeFile(indexPath, html);
        }
        catch (error) {
            console.error('Error injecting template styles:', error);
            throw error;
        }
    }
    async setupLoadingIndicators(config) {
        if (!config.showLoadingBar && !config.showLoadingText) {
            return;
        }
        try {
            const indexPath = path.join(this.templatePath, 'index.html');
            let html = await fs_1.promises.readFile(indexPath, 'utf8');
            const loadingContainer = `
        <div id="loading-container">
          ${config.showLoadingText ? '<div id="loading-text">Loading...</div>' : ''}
        </div>
      `;
            // Add loading container to the body
            if (html.includes('<body>')) {
                html = html.replace('<body>', `<body>${loadingContainer}`);
            }
            // Modify the createUnityInstance function to handle loading progress
            const progressHandlerScript = `
        function progressHandler(progress) {
          var percent = progress * 100 + '%';
          canvas.style.background = 'linear-gradient(to right, ${config.loadingBarColor}, ${config.loadingBarColor} ' + percent + ', transparent ' + percent + ', transparent) no-repeat center';
          canvas.style.backgroundSize = '100% 1rem';
          
          // Update loading text if available
          var loadingText = document.getElementById('loading-text');
          if (loadingText) {
            loadingText.textContent = 'Loading... ' + Math.round(progress * 100) + '%';
          }
        }
      `;
            // Add progress handler to the existing JavaScript
            if (html.includes('createUnityInstance')) {
                // Add progress handler before createUnityInstance
                html = html.replace(/createUnityInstance\(/g, `${progressHandlerScript}\n    createUnityInstance(`);
                // Add progressHandler to createUnityInstance parameters if not already there
                if (!html.includes('progressHandler')) {
                    html = html.replace(/createUnityInstance\(([^,]+),\s*([^,)]+)/, 'createUnityInstance($1, $2, progressHandler');
                }
                // Hide loading container when the game is loaded
                html = html.replace(/createUnityInstance\([^)]+\).then\(function\s*\(([^)]+)\)/g, `createUnityInstance(canvas, config, progressHandler).then(function($1) {
            // Hide loading container
            var loadingContainer = document.getElementById('loading-container');
            if (loadingContainer) {
              loadingContainer.style.display = 'none';
            }
          `);
            }
            await fs_1.promises.writeFile(indexPath, html);
        }
        catch (error) {
            console.error('Error setting up loading indicators:', error);
            throw error;
        }
    }
    async optimizeScaling(config) {
        try {
            const indexPath = path.join(this.templatePath, 'index.html');
            let html = await fs_1.promises.readFile(indexPath, 'utf8');
            // Ensure we have a canvas with data-pixel-art attribute
            if (html.includes('<canvas') && !html.includes('data-pixel-art')) {
                html = html.replace(/<canvas([^>]+)>/g, `<canvas$1 data-pixel-art="${config.optimizeForPixelArt}">`);
            }
            // Add scaling functionality
            const scalingScript = `
        var scaleToFit = ${config.scaleToFit};
        
        function onResize() {
          var container = canvas.parentElement;
          var w;
          var h;

          if (scaleToFit) {
            w = window.innerWidth;
            h = window.innerHeight;

            var r = canvas.height / canvas.width;

            if (w * r > window.innerHeight) {
              w = Math.min(w, Math.ceil(h / r));
            }
            h = Math.floor(w * r);
          } else {
            w = canvas.width;
            h = canvas.height;
          }

          container.style.width = canvas.style.width = w + "px";
          container.style.height = canvas.style.height = h + "px";
          container.style.top = Math.floor((window.innerHeight - h) / 2) + "px";
          container.style.left = Math.floor((window.innerWidth - w) / 2) + "px";
          
          // Ensure focus for keyboard inputs
          window.focus();
        }
        
        window.addEventListener('resize', onResize);
        onResize();
      `;
            // Add scaling script after canvas setup
            if (html.includes('createUnityInstance') && !html.includes('onResize')) {
                // Add resize handler at the appropriate location
                html = html.replace(/createUnityInstance\([^)]+\).then\(function\s*\(([^)]+)\)\s*\{/g, `createUnityInstance(canvas, config, progressHandler).then(function($1) {
            canvas = $1.Module.canvas;
            ${scalingScript}
          `);
            }
            await fs_1.promises.writeFile(indexPath, html);
        }
        catch (error) {
            console.error('Error optimizing scaling:', error);
            throw error;
        }
    }
    async setupMobileSupport(config) {
        if (!config.mobileOptimized) {
            return;
        }
        try {
            const indexPath = path.join(this.templatePath, 'index.html');
            let html = await fs_1.promises.readFile(indexPath, 'utf8');
            // Add mobile viewport meta tag
            if (html.includes('<head>') && !html.includes('viewport')) {
                const viewportMeta = `
          <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes">
        `;
                html = html.replace('<head>', `<head>${viewportMeta}`);
            }
            // Add mobile detection code
            const mobileScript = `
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          // Mobile device detected
          ${config.forceMobileFullscreen ? `
          // Request fullscreen on first touch
          document.addEventListener('touchstart', function() {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen();
            }
          }, { once: true });
          ` : ''}
        }
      `;
            // Add mobile detection script
            if (html.includes('<script>') && !html.includes('iPhone|iPad|iPod|Android')) {
                html = html.replace('</script>', `${mobileScript}</script>`);
            }
            else {
                html = html.replace('</body>', `<script>${mobileScript}</script></body>`);
            }
            await fs_1.promises.writeFile(indexPath, html);
        }
        catch (error) {
            console.error('Error setting up mobile support:', error);
            throw error;
        }
    }
    async injectSecurityHeaders() {
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
        let html = await fs_1.promises.readFile(indexPath, 'utf-8');
        html = html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n${headerComment}`);
        await fs_1.promises.writeFile(indexPath, html, 'utf-8');
    }
    async configureCompression(config) {
        if (!config.compressionEnabled)
            return;
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
        let html = await fs_1.promises.readFile(indexPath, 'utf-8');
        html = html.replace('</head>', `${compressionScript}\n</head>`);
        await fs_1.promises.writeFile(indexPath, html, 'utf-8');
    }
    async fileExists(filePath) {
        try {
            await fs_1.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.GrokadeTemplateManager = GrokadeTemplateManager;
