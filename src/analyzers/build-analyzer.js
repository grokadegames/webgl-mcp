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
exports.WebGLBuildAnalyzer = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib_1.default.gzip);
class WebGLBuildAnalyzer {
    analyzeBuild(buildPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = {
                totalSize: 0,
                compressedSize: 0,
                files: [],
                suggestions: []
            };
            try {
                const files = yield this.getAllFiles(buildPath);
                for (const file of files) {
                    const fileAnalysis = yield this.analyzeFile(file, buildPath);
                    analysis.files.push(fileAnalysis);
                    analysis.totalSize += fileAnalysis.size;
                    analysis.compressedSize += fileAnalysis.compressedSize;
                }
                // Analyze overall build
                this.analyzeBuildStructure(analysis);
            }
            catch (error) {
                console.error('Error analyzing build:', error);
                throw error;
            }
            return analysis;
        });
    }
    getAllFiles(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = [];
            const entries = yield fs_1.promises.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    files.push(...yield this.getAllFiles(fullPath));
                }
                else {
                    files.push(fullPath);
                }
            }
            return files;
        });
    }
    analyzeFile(filePath, buildPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield fs_1.promises.readFile(filePath);
            const compressedContent = yield gzip(content);
            const relativePath = path_1.default.relative(buildPath, filePath);
            const extension = path_1.default.extname(filePath).toLowerCase();
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
        });
    }
    getFileType(extension) {
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
    analyzeTexture(analysis, content) {
        const sizeInMB = analysis.size / (1024 * 1024);
        if (sizeInMB > 1) {
            analysis.suggestions.push('Consider using compressed texture formats (KTX/DDS)', 'Evaluate if texture resolution can be reduced');
        }
        if (analysis.path.endsWith('.png')) {
            analysis.suggestions.push('Consider using WebP format for better compression');
        }
    }
    analyzeShader(analysis, content) {
        const shaderCode = content.toString('utf-8');
        if (shaderCode.includes('pow(') || shaderCode.includes('exp(')) {
            analysis.suggestions.push('Consider optimizing expensive shader operations');
        }
        if (shaderCode.length > 1000) {
            analysis.suggestions.push('Consider splitting large shaders into smaller chunks');
        }
    }
    analyzeJavaScript(analysis, content) {
        const code = content.toString('utf-8');
        if (code.includes('console.log')) {
            analysis.suggestions.push('Remove debug console.log statements for production');
        }
        if (!code.includes('use strict')) {
            analysis.suggestions.push('Consider adding "use strict" for better optimization');
        }
    }
    analyzeBuildStructure(analysis) {
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
exports.WebGLBuildAnalyzer = WebGLBuildAnalyzer;
