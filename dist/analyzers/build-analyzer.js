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
exports.WebGLBuildAnalyzer = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const zlib = __importStar(require("zlib"));
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib.gzip);
class WebGLBuildAnalyzer {
    async analyzeBuild(buildPath) {
        const analysis = {
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
        }
        catch (error) {
            console.error('Error analyzing build:', error);
            throw error;
        }
        return analysis;
    }
    async getAllFiles(dirPath) {
        const files = [];
        const entries = await fs_1.promises.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                files.push(...await this.getAllFiles(fullPath));
            }
            else {
                files.push(fullPath);
            }
        }
        return files;
    }
    async analyzeHTMLTemplate(filePath) {
        const content = await fs_1.promises.readFile(filePath, 'utf8');
        const suggestions = [];
        let templateName = 'Unknown';
        const config = {};
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
        }
        else if (content.includes('UnityLoader') || content.includes('unityInstance')) {
            templateName = 'Unity Default Template';
            suggestions.push('Consider using the Better Minimal WebGL Template for improved scaling and mobile support.');
            suggestions.push('The Better Minimal WebGL Template provides better canvas scaling and improved mobile device support.');
        }
        return { templateName, config, suggestions };
    }
    async analyzeFile(filePath, buildPath) {
        const content = await fs_1.promises.readFile(filePath);
        const compressedContent = await gzip(content);
        const relativePath = path.relative(buildPath, filePath);
        const extension = path.extname(filePath).toLowerCase();
        const analysis = {
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
    getFileType(extension) {
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
    analyzeTexture(analysis, content) {
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
    analyzeShader(analysis, content) {
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
    analyzeJavaScript(analysis, content) {
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
    analyzeBuildStructure(analysis) {
        // Group files by type
        const fileTypes = analysis.files.reduce((types, file) => {
            types[file.type] = (types[file.type] || 0) + file.size;
            return types;
        }, {});
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
        }
        else if (analysis.templateUsed === 'Unknown') {
            analysis.suggestions.push('Using an unknown HTML template. Consider using Better Minimal WebGL Template for optimal WebGL performance.');
        }
    }
}
exports.WebGLBuildAnalyzer = WebGLBuildAnalyzer;
