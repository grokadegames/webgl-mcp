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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineDetector = void 0;
class EngineDetector {
    constructor() {
        this.engines = [
            {
                name: 'Unity',
                signatures: [
                    { type: 'script', patterns: ['UnityLoader', 'UnityProgress', 'buildUrl'] },
                    { type: 'webgl', patterns: ['unity-canvas', 'unityContainer'] },
                    { type: 'html', patterns: ['unity-fullscreen-button', 'unity-mobile-warning'] }
                ],
                recommendations: [
                    'Enable WebGL 2.0 for better performance and features',
                    'Implement texture compression (DXT/ASTC) for faster loading',
                    'Use Unity\'s progressive loading for large assets',
                    'Enable memory defragmentation for WebGL builds',
                    'Implement WebAssembly builds for better performance',
                    'Configure proper mobile touch input handling',
                    'Enable GPU instancing for repeated objects',
                    'Use occlusion culling for complex scenes',
                    'Implement LOD system for detailed models'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    const warnings = [];
                    const canvas = document.querySelector('#unity-canvas');
                    if (canvas) {
                        const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
                        if (context) {
                            const capabilities = yield this.checkWebGLCapabilities(context);
                            if (!capabilities.webgl2) {
                                warnings.push('WebGL 2.0 not available, falling back to WebGL 1.0');
                            }
                            if (!capabilities.instancedArrays) {
                                warnings.push('GPU instancing not supported, performance may be impacted');
                            }
                            if (capabilities.maxTextureSize < 4096) {
                                warnings.push('Limited texture size support, consider texture atlasing');
                            }
                        }
                        // Check for Unity-specific optimizations
                        const unityInstance = window.unityInstance;
                        if (unityInstance) {
                            if (!((_b = (_a = unityInstance.Module) === null || _a === void 0 ? void 0 : _a.asmLibraryArg) === null || _b === void 0 ? void 0 : _b.memory)) {
                                warnings.push('WebAssembly memory management not detected');
                            }
                        }
                    }
                    return warnings;
                })
            },
            {
                name: 'Godot',
                signatures: [
                    { type: 'script', patterns: ['GDJS', 'godot.js', 'godot.wasm'] },
                    { type: 'canvas', patterns: ['godot-canvas'] }
                ],
                recommendations: [
                    'Enable GLES3 mode for better WebGL 2.0 support',
                    'Use Godot\'s built-in compression for assets',
                    'Enable threading for WebAssembly builds',
                    'Implement proper viewport handling for mobile',
                    'Use viewport stretch mode "2d" for pixel-perfect rendering',
                    'Enable HDR when using post-processing effects',
                    'Use GPU particles for better performance',
                    'Enable texture streaming for large textures',
                    'Implement proper batching for 2D sprites'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    const warnings = [];
                    const canvas = document.querySelector('#godot-canvas');
                    if (canvas) {
                        const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
                        if (context) {
                            const capabilities = yield this.checkWebGLCapabilities(context);
                            if (!capabilities.webgl2) {
                                warnings.push('WebGL 2.0 not available, GLES3 features will be limited');
                            }
                            if (!capabilities.floatTextures) {
                                warnings.push('Float textures not supported, HDR effects will be limited');
                            }
                            if (capabilities.maxTextureSize < 8192) {
                                warnings.push('Limited texture size, consider enabling texture streaming');
                            }
                        }
                        // Check for Godot-specific optimizations
                        if (!document.querySelector('meta[name="viewport"]')) {
                            warnings.push('Viewport meta tag not found, mobile scaling may be incorrect');
                        }
                        // Check for WebAssembly threading
                        if (!crossOriginIsolated) {
                            warnings.push('Cross-Origin Isolation not enabled, threading unavailable');
                        }
                    }
                    return warnings;
                })
            },
            {
                name: 'Construct',
                signatures: [
                    { type: 'script', patterns: ['c2runtime', 'c3runtime', 'construct'] },
                    { type: 'canvas', patterns: ['construct-canvas'] }
                ],
                recommendations: [
                    'Enable WebGL renderer for better performance',
                    'Use texture atlases to reduce draw calls',
                    'Enable object pooling for particle effects',
                    'Implement proper touch controls for mobile',
                    'Use compressed textures when available',
                    'Enable worker threads for physics calculations',
                    'Implement layer effects optimization',
                    'Use zone culling for large levels',
                    'Enable background loading for assets'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    var _c, _d, _e, _f;
                    const warnings = [];
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                        const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
                        if (context) {
                            const capabilities = yield this.checkWebGLCapabilities(context);
                            if (!capabilities.instancedArrays) {
                                warnings.push('Instancing not supported, sprite batching will be limited');
                            }
                            if (!capabilities.anisotropicFiltering) {
                                warnings.push('Anisotropic filtering not available, texture quality may be reduced');
                            }
                        }
                        else {
                            warnings.push('WebGL not available, falling back to Canvas2D');
                        }
                        // Check for Construct-specific optimizations
                        const runtime = ((_d = (_c = window).cr_getC2Runtime) === null || _d === void 0 ? void 0 : _d.call(_c)) || ((_f = (_e = window).cr_getC3Runtime) === null || _f === void 0 ? void 0 : _f.call(_e));
                        if (runtime) {
                            if (!runtime.uses_loader_layout) {
                                warnings.push('Loading screen not implemented');
                            }
                            if (runtime.isInWorker && !window.Worker) {
                                warnings.push('Web Workers not supported, physics performance may be impacted');
                            }
                        }
                    }
                    return warnings;
                })
            },
            {
                name: 'GDevelop',
                signatures: [
                    { type: 'script', patterns: ['gdjs', 'runtimeGame', 'runtimeScene'] },
                    { type: 'canvas', patterns: ['game-canvas'] }
                ],
                recommendations: [
                    'Enable WebGL renderer in project settings',
                    'Use texture packing for sprites',
                    'Implement object pooling for particles',
                    'Enable multi-threading when available',
                    'Use compressed assets for faster loading',
                    'Implement proper mobile touch handling'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    const warnings = [];
                    const canvas = document.querySelector('#game-canvas');
                    if (canvas) {
                        const context = canvas.getContext('webgl');
                        if (!context) {
                            warnings.push('WebGL not available, performance may be impacted');
                        }
                        if (!document.querySelector('meta[name="viewport"][content*="user-scalable=no"]')) {
                            warnings.push('Mobile viewport not properly configured');
                        }
                    }
                    return warnings;
                })
            },
            {
                name: 'Bitsy',
                signatures: [
                    { type: 'canvas', size: { width: 512, height: 512 } },
                    { type: 'script', patterns: ['bitsy_title_text', 'bitsyOnLoad', 'exportedGameData'] },
                    { type: 'html', patterns: ['bitsy-gamedata', 'gameDataOnLoad'] }
                ],
                recommendations: [
                    'Enable pixel-perfect scaling for best visual quality',
                    'Implement touch input support for mobile devices',
                    'Verify canvas resolution matches Bitsy\'s native size (512x512)',
                    'Consider adding a loading indicator for game data'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    const warnings = [];
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                        if (canvas.width !== 512 || canvas.height !== 512) {
                            warnings.push('Non-standard Bitsy canvas size detected');
                        }
                        if (!canvas.style.imageRendering) {
                            warnings.push('Pixel-perfect scaling not enabled');
                        }
                    }
                    return warnings;
                })
            },
            {
                name: 'Twine',
                signatures: [
                    { type: 'dom', patterns: ['passage', 'tw-story', 'tw-sidebar', 'tw-passage'] },
                    { type: 'script', patterns: ['SugarCube', 'Harlowe', 'Snowman', 'Story.lookup'] }
                ],
                recommendations: [
                    'Ensure proper text rendering and scaling',
                    'Implement accessibility features (ARIA labels, keyboard navigation)',
                    'Add save/load functionality',
                    'Consider mobile-friendly UI adjustments'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    const warnings = [];
                    const passages = document.querySelectorAll('.passage, .tw-passage');
                    if (passages.length > 100) {
                        warnings.push('Large number of passages may impact performance');
                    }
                    if (!document.querySelector('[role="main"]')) {
                        warnings.push('Missing ARIA roles for accessibility');
                    }
                    return warnings;
                })
            },
            {
                name: 'PICO-8',
                signatures: [
                    { type: 'canvas', size: { width: 128, height: 128 } },
                    { type: 'script', patterns: ['_pico8_', 'pico8_gpio', 'pico8_buttons'] },
                    { type: 'webgl', shaders: ['pico8_vert', 'pico8_frag'] }
                ],
                recommendations: [
                    'Implement WebGL with Canvas 2D fallback',
                    'Enable pixel-perfect scaling for authentic look',
                    'Monitor cartridge size (stay within 32kb limit)',
                    'Add touch controls for mobile support'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    const warnings = [];
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                        const context = canvas.getContext('webgl') || canvas.getContext('webgl2');
                        if (!context) {
                            warnings.push('WebGL not available, using Canvas 2D fallback');
                        }
                        if (canvas.width !== 128 || canvas.height !== 128) {
                            warnings.push('Non-standard PICO-8 resolution detected');
                        }
                    }
                    return warnings;
                })
            },
            {
                name: 'PuzzleScript',
                signatures: [
                    { type: 'canvas', patterns: ['gameCanvas'] },
                    { type: 'script', patterns: ['levelString', 'processInput', 'titleScreen'] },
                    { type: 'html', patterns: ['gameWrapper', 'gameContainer'] }
                ],
                recommendations: [
                    'Optimize rule processing for complex puzzles',
                    'Implement undo/redo functionality',
                    'Add level select capability',
                    'Consider mobile touch controls'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    const warnings = [];
                    const canvas = document.querySelector('#gameCanvas');
                    if (canvas) {
                        const context = canvas.getContext('2d');
                        if (!context) {
                            warnings.push('Canvas 2D context not available');
                        }
                        if (!canvas.style.imageRendering) {
                            warnings.push('Pixel-perfect rendering not enabled');
                        }
                    }
                    return warnings;
                })
            },
            {
                name: 'TIC-80',
                signatures: [
                    { type: 'canvas', size: { width: 240, height: 136 } },
                    { type: 'script', patterns: ['TIC', 'tic80', 'tic'] },
                    { type: 'webgl', shaders: ['tic_vert', 'tic_frag'] }
                ],
                recommendations: [
                    'Verify 240x136 resolution compliance',
                    'Implement WebGL with Canvas 2D fallback',
                    'Add touch controls for mobile support',
                    'Monitor CPU usage for complex games'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    const warnings = [];
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                        if (canvas.width !== 240 || canvas.height !== 136) {
                            warnings.push('Non-standard TIC-80 resolution detected');
                        }
                        const context = canvas.getContext('webgl') || canvas.getContext('webgl2');
                        if (!context) {
                            warnings.push('WebGL not available, using Canvas 2D fallback');
                        }
                    }
                    return warnings;
                })
            },
            {
                name: 'p5.js',
                signatures: [
                    { type: 'script', patterns: ['p5.', 'setup()', 'draw()'] },
                    { type: 'canvas', patterns: ['defaultCanvas'] }
                ],
                recommendations: [
                    'Use WebGL mode for 3D or complex 2D graphics',
                    'Enable p5.js performance optimizations',
                    'Implement proper frame rate management',
                    'Use preload() for asset loading',
                    'Consider using instance mode for better control'
                ],
                analyze: (document) => __awaiter(this, void 0, void 0, function* () {
                    var _g, _h, _j, _k;
                    const warnings = [];
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                        const webglContext = canvas.getContext('webgl');
                        if (!webglContext && ((_h = (_g = document.querySelector('script[src*="p5"]')) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.includes('WEBGL'))) {
                            warnings.push('WebGL mode requested but not available');
                        }
                        if (!((_k = (_j = document.querySelector('script[src*="p5"]')) === null || _j === void 0 ? void 0 : _j.textContent) === null || _k === void 0 ? void 0 : _k.includes('preload'))) {
                            warnings.push('preload() function not detected for asset loading');
                        }
                    }
                    return warnings;
                })
            }
        ];
    }
    checkWebGLCapabilities(gl) {
        return __awaiter(this, void 0, void 0, function* () {
            const isWebGL2 = gl instanceof WebGL2RenderingContext;
            const ext = gl.getExtension('EXT_texture_filter_anisotropic') ||
                gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
            return {
                webgl2: isWebGL2,
                floatTextures: !!gl.getExtension('OES_texture_float'),
                anisotropicFiltering: !!ext,
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
                instancedArrays: isWebGL2 || !!gl.getExtension('ANGLE_instanced_arrays'),
                multiDrawIndirect: isWebGL2 && !!gl.getExtension('WEBGL_multi_draw_indirect')
            };
        });
    }
    detectEngine(document) {
        return __awaiter(this, void 0, void 0, function* () {
            let bestMatch = null;
            let highestConfidence = 0;
            for (const engine of this.engines) {
                const confidence = yield this.calculateConfidence(engine, document);
                if (confidence > highestConfidence) {
                    const warnings = yield engine.analyze(document);
                    bestMatch = {
                        engineName: engine.name,
                        confidence,
                        features: this.detectFeatures(engine, document),
                        recommendations: engine.recommendations,
                        warnings
                    };
                    highestConfidence = confidence;
                }
            }
            return bestMatch;
        });
    }
    calculateConfidence(engine, document) {
        return __awaiter(this, void 0, void 0, function* () {
            let matches = 0;
            let total = 0;
            for (const signature of engine.signatures) {
                total++;
                switch (signature.type) {
                    case 'canvas':
                        if (this.matchCanvas(signature, document))
                            matches++;
                        break;
                    case 'webgl':
                        if (yield this.matchWebGL(signature, document))
                            matches++;
                        break;
                    case 'dom':
                        if (this.matchDOM(signature, document))
                            matches++;
                        break;
                    case 'script':
                        if (this.matchScript(signature, document))
                            matches++;
                        break;
                    case 'html':
                        if (this.matchHTML(signature, document))
                            matches++;
                        break;
                }
            }
            return matches / total;
        });
    }
    matchCanvas(signature, document) {
        const canvas = document.querySelector('canvas');
        if (!canvas)
            return false;
        if (signature.size) {
            return canvas.width === signature.size.width &&
                canvas.height === signature.size.height;
        }
        if (signature.patterns) {
            return signature.patterns.some(pattern => canvas.id.includes(pattern) || canvas.className.includes(pattern));
        }
        return true;
    }
    matchWebGL(signature, document) {
        return __awaiter(this, void 0, void 0, function* () {
            const canvas = document.querySelector('canvas');
            if (!canvas)
                return false;
            const context = canvas.getContext('webgl') || canvas.getContext('webgl2');
            if (!context)
                return false;
            if (signature.shaders) {
                // In a real implementation, we would need to check shader sources
                // This is a simplified check
                return true;
            }
            return true;
        });
    }
    matchDOM(signature, document) {
        if (!signature.patterns)
            return false;
        return signature.patterns.some(pattern => {
            const elements = document.querySelectorAll(`.${pattern}, #${pattern}, [data-${pattern}]`);
            return elements.length > 0;
        });
    }
    matchScript(signature, document) {
        if (!signature.patterns)
            return false;
        const scripts = Array.from(document.scripts);
        return signature.patterns.some(pattern => scripts.some(script => {
            var _a;
            return ((_a = script.textContent) === null || _a === void 0 ? void 0 : _a.includes(pattern)) ||
                script.src.includes(pattern);
        }));
    }
    matchHTML(signature, document) {
        if (!signature.patterns)
            return false;
        const html = document.documentElement.innerHTML;
        return signature.patterns.some(pattern => html.includes(pattern));
    }
    detectFeatures(engine, document) {
        const features = [];
        switch (engine.name) {
            case 'Bitsy':
                if (document.querySelector('canvas[style*="image-rendering"]')) {
                    features.push('Pixel-perfect scaling');
                }
                if (document.querySelector('[ontouchstart]')) {
                    features.push('Touch input support');
                }
                break;
            case 'Twine':
                if (document.querySelector('[role]')) {
                    features.push('Accessibility support');
                }
                if (document.querySelector('[data-save]')) {
                    features.push('Save system');
                }
                break;
            case 'PICO-8':
                const canvas = document.querySelector('canvas');
                if ((canvas === null || canvas === void 0 ? void 0 : canvas.getContext('webgl')) || (canvas === null || canvas === void 0 ? void 0 : canvas.getContext('webgl2'))) {
                    features.push('WebGL rendering');
                }
                else {
                    features.push('Canvas 2D fallback');
                }
                if (document.querySelector('[ontouchstart]')) {
                    features.push('Mobile controls');
                }
                break;
            case 'PuzzleScript':
                if (document.querySelector('#gameCanvas')) {
                    features.push('Standard canvas setup');
                }
                if (document.querySelector('[data-undo]')) {
                    features.push('Undo support');
                }
                break;
            case 'TIC-80':
                if (document.querySelector('canvas[width="240"]')) {
                    features.push('Native resolution');
                }
                if (document.querySelector('[data-gamepad]')) {
                    features.push('Gamepad support');
                }
                break;
        }
        return features;
    }
}
exports.EngineDetector = EngineDetector;
