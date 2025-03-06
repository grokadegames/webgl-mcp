"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrokadeTemplateManager = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib_1.default.gzip);
class GrokadeTemplateManager {
    constructor(templatePath) {
        this.defaultConfig = {
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
        this.templatePath = templatePath;
    }
    applyTemplate() {
        return __awaiter(this, arguments, void 0, function* (config = {}) {
            const finalConfig = Object.assign(Object.assign({}, this.defaultConfig), config);
            try {
                yield this.validateTemplate();
                yield this.injectTemplateStyles(finalConfig);
                yield this.setupLoadingIndicators(finalConfig);
                yield this.configureCompression(finalConfig);
                yield this.setupMobileSupport(finalConfig);
                yield this.injectSecurityHeaders();
            }
            catch (error) {
                console.error('Error applying template:', error);
                throw error;
            }
        });
    }
    validateTemplate() {
        return __awaiter(this, void 0, void 0, function* () {
            const indexPath = path_1.default.join(this.templatePath, 'index.html');
            if (!(yield this.fileExists(indexPath))) {
                throw new Error('Template must contain an index.html file');
            }
        });
    }
    injectTemplateStyles(config) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const indexPath = path_1.default.join(this.templatePath, 'index.html');
            let html = yield fs_1.promises.readFile(indexPath, 'utf-8');
            html = html.replace('</head>', `${styles}\n</head>`);
            yield fs_1.promises.writeFile(indexPath, html, 'utf-8');
        });
    }
    setupLoadingIndicators(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!config.showLoadingBar && !config.showLoadingText)
                return;
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
            const indexPath = path_1.default.join(this.templatePath, 'index.html');
            let html = yield fs_1.promises.readFile(indexPath, 'utf-8');
            html = html.replace('</head>', `${loadingStyles}\n${loadingScript}\n</head>`);
            html = html.replace('<body>', `<body>\n${loadingHtml}`);
            yield fs_1.promises.writeFile(indexPath, html, 'utf-8');
        });
    }
    configureCompression(config) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const indexPath = path_1.default.join(this.templatePath, 'index.html');
            let html = yield fs_1.promises.readFile(indexPath, 'utf-8');
            html = html.replace('</head>', `${compressionScript}\n</head>`);
            yield fs_1.promises.writeFile(indexPath, html, 'utf-8');
        });
    }
    setupMobileSupport(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!config.mobileOptimized)
                return;
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
            const indexPath = path_1.default.join(this.templatePath, 'index.html');
            let html = yield fs_1.promises.readFile(indexPath, 'utf-8');
            html = html.replace('</head>', `${mobileScript}\n</head>`);
            yield fs_1.promises.writeFile(indexPath, html, 'utf-8');
        });
    }
    injectSecurityHeaders() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const indexPath = path_1.default.join(this.templatePath, 'index.html');
            let html = yield fs_1.promises.readFile(indexPath, 'utf-8');
            html = html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n${headerComment}`);
            yield fs_1.promises.writeFile(indexPath, html, 'utf-8');
        });
    }
    fileExists(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs_1.promises.access(filePath);
                return true;
            }
            catch (_a) {
                return false;
            }
        });
    }
}
exports.GrokadeTemplateManager = GrokadeTemplateManager;
