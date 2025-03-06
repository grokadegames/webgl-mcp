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
exports.WebGLTemplateModifier = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class WebGLTemplateModifier {
    constructor(templatesPath) {
        this.templatesPath = templatesPath;
    }
    modifyTemplate(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Read the template HTML file
                const indexPath = path_1.default.join(this.templatesPath, 'index.html');
                let html = yield fs_1.promises.readFile(indexPath, 'utf-8');
                // Apply modifications based on options
                html = yield this.applyTemplateModifications(html, options);
                // Write back the modified template
                yield fs_1.promises.writeFile(indexPath, html, 'utf-8');
                // Handle additional files if needed
                if (options.loadingBar || options.loadingText) {
                    yield this.addLoadingIndicators(options);
                }
                if (options.compression) {
                    yield this.setupCompression();
                }
            }
            catch (error) {
                console.error('Error modifying template:', error);
                throw error;
            }
        });
    }
    applyTemplateModifications(html, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
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
            if ((_a = options.customScripts) === null || _a === void 0 ? void 0 : _a.length) {
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
        });
    }
    addLoadingIndicators(options) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const stylesPath = path_1.default.join(this.templatesPath, 'loading-styles.css');
            const scriptPath = path_1.default.join(this.templatesPath, 'loading-script.js');
            yield fs_1.promises.writeFile(stylesPath, loadingStyles, 'utf-8');
            yield fs_1.promises.writeFile(scriptPath, loadingScript, 'utf-8');
        });
    }
    setupCompression() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const indexPath = path_1.default.join(this.templatesPath, 'index.html');
            let html = yield fs_1.promises.readFile(indexPath, 'utf-8');
            html = html.replace('</head>', `${compressionConfig}\n</head>`);
            yield fs_1.promises.writeFile(indexPath, html, 'utf-8');
        });
    }
    getTemplatesForEngine(engineId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementation
            return [];
        });
    }
}
exports.WebGLTemplateModifier = WebGLTemplateModifier;
