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
exports.WebGLTemplateModifier = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
class WebGLTemplateModifier {
    constructor(templatesPath) {
        this.templatesPath = templatesPath;
    }
    async modifyTemplate(options) {
        try {
            // Read the template HTML file
            const indexPath = path.join(this.templatesPath, 'index.html');
            let html = await fs_1.promises.readFile(indexPath, 'utf-8');
            // Apply modifications based on options
            html = await this.applyTemplateModifications(html, options);
            // Write back the modified template
            await fs_1.promises.writeFile(indexPath, html, 'utf-8');
            // Handle additional files if needed
            if (options.loadingBar || options.loadingText) {
                await this.addLoadingIndicators(options);
            }
            if (options.compression) {
                await this.setupCompression();
            }
        }
        catch (error) {
            console.error('Error modifying template:', error);
            throw error;
        }
    }
    async applyTemplateModifications(html, options) {
        // Update title if provided
        if (options.title) {
            html = html.replace(/<title>.*?<\/title>/, `<title>${options.title}</title>`);
        }
        // Add custom styles
        if (options.customStyles) {
            const styleTag = `<style>${options.customStyles}</style>`;
            html = html.replace('</head>', `${styleTag}\n</head>`);
        }
        // Add custom scripts
        if (options.customScripts?.length) {
            const scriptTags = options.customScripts
                .map(script => `<script src="${script}"></script>`)
                .join('\n');
            html = html.replace('</body>', `${scriptTags}\n</body>`);
        }
        // Add memory limit configuration
        if (options.memoryLimit) {
            const memoryConfig = `
        <script>
          var TOTAL_MEMORY = ${options.memoryLimit * 1024 * 1024};
        </script>`;
            html = html.replace('</head>', `${memoryConfig}\n</head>`);
        }
        return html;
    }
    async addLoadingIndicators(options) {
        const loadingStyles = `
      .webgl-loading-bar {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: 20px;
        background: #f0f0f0;
        border: 1px solid #333;
      }
      .webgl-loading-bar-fill {
        width: 0%;
        height: 100%;
        background: #4CAF50;
        transition: width 0.3s ease;
      }
      .webgl-loading-text {
        position: absolute;
        left: 50%;
        top: calc(50% + 30px);
        transform: translateX(-50%);
        font-family: Arial, sans-serif;
        color: #333;
      }`;
        const loadingScript = `
      function updateLoadingProgress(progress) {
        ${options.loadingBar ? `
          var fill = document.querySelector('.webgl-loading-bar-fill');
          if (fill) fill.style.width = (progress * 100) + '%';
        ` : ''}
        ${options.loadingText ? `
          var text = document.querySelector('.webgl-loading-text');
          if (text) text.textContent = 'Loading: ' + Math.round(progress * 100) + '%';
        ` : ''}
      }`;
        // Write the loading indicator files
        const stylesPath = path.join(this.templatesPath, 'loading-styles.css');
        const scriptPath = path.join(this.templatesPath, 'loading-script.js');
        await fs_1.promises.writeFile(stylesPath, loadingStyles, 'utf-8');
        await fs_1.promises.writeFile(scriptPath, loadingScript, 'utf-8');
    }
    async setupCompression() {
        // Add compression-related configurations and scripts
        const compressionConfig = `
      <script>
        // Enable compression for runtime loading
        var Module = {
          compressedDataHandler: function(data) {
            // Handle compressed data
            return new Promise(function(resolve) {
              // Decompress data using WebAssembly
              resolve(data);
            });
          }
        };
      </script>`;
        const indexPath = path.join(this.templatesPath, 'index.html');
        let html = await fs_1.promises.readFile(indexPath, 'utf-8');
        html = html.replace('</head>', `${compressionConfig}\n</head>`);
        await fs_1.promises.writeFile(indexPath, html, 'utf-8');
    }
    async getTemplatesForEngine(engineId) {
        // Implementation
        return [];
    }
}
exports.WebGLTemplateModifier = WebGLTemplateModifier;
