export interface WebGLCapabilities {
  webgl2: boolean;
  floatTextures: boolean;
  anisotropicFiltering: boolean;
  maxTextureSize: number;
  maxViewportDims: [number, number];
  instancedArrays: boolean;
  multiDrawIndirect: boolean;
}

export interface EngineSignature {
  type: 'canvas' | 'webgl' | 'dom' | 'script' | 'html';
  patterns?: string[];
  size?: { width: number; height: number };
  shaders?: string[];
}

export interface EngineDetectionResult {
  engineName: string;
  confidence: number;
  features: string[];
  recommendations: string[];
  warnings: string[];
  performance?: {
    webglCapabilities?: WebGLCapabilities;
    canvasOptimizations?: string[];
    memoryUsage?: number;
    drawCalls?: number;
  };
}

export interface GameEngine {
  name: string;
  signatures: EngineSignature[];
  recommendations: string[];
  analyze: (document: Document) => Promise<string[]>;
}

export class EngineDetector {
  public async checkWebGLCapabilities(gl: WebGLRenderingContext | WebGL2RenderingContext): Promise<WebGLCapabilities> {
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
  }

  private engines: GameEngine[] = [
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
      analyze: async (document: Document) => {
        const warnings = [];
        const canvas = document.querySelector('#unity-canvas') as HTMLCanvasElement | null;
        if (canvas) {
          const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (context) {
            const capabilities = await this.checkWebGLCapabilities(context);
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
          const unityInstance = (window as any).unityInstance;
          if (unityInstance) {
            if (!unityInstance.Module?.asmLibraryArg?.memory) {
              warnings.push('WebAssembly memory management not detected');
            }
          }
        }
        return warnings;
      }
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
      analyze: async (document: Document) => {
        const warnings = [];
        const canvas = document.querySelector('#godot-canvas') as HTMLCanvasElement | null;
        if (canvas) {
          const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (context) {
            const capabilities = await this.checkWebGLCapabilities(context);
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
      }
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
      analyze: async (document: Document) => {
        const warnings = [];
        const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
        if (canvas) {
          const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (context) {
            const capabilities = await this.checkWebGLCapabilities(context);
            if (!capabilities.instancedArrays) {
              warnings.push('Instancing not supported, sprite batching will be limited');
            }
            if (!capabilities.anisotropicFiltering) {
              warnings.push('Anisotropic filtering not available, texture quality may be reduced');
            }
          } else {
            warnings.push('WebGL not available, falling back to Canvas2D');
          }

          // Check for Construct-specific optimizations
          const runtime = (window as any).cr_getC2Runtime?.() || (window as any).cr_getC3Runtime?.();
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
      }
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
      analyze: async (document: Document) => {
        const warnings = [];
        const canvas = document.querySelector('#game-canvas');
        if (canvas) {
          const context = (canvas as HTMLCanvasElement).getContext('webgl');
          if (!context) {
            warnings.push('WebGL not available, performance may be impacted');
          }
          if (!document.querySelector('meta[name="viewport"][content*="user-scalable=no"]')) {
            warnings.push('Mobile viewport not properly configured');
          }
        }
        return warnings;
      }
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
      analyze: async (document: Document) => {
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
      }
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
      analyze: async (document: Document) => {
        const warnings = [];
        const passages = document.querySelectorAll('.passage, .tw-passage');
        if (passages.length > 100) {
          warnings.push('Large number of passages may impact performance');
        }
        if (!document.querySelector('[role="main"]')) {
          warnings.push('Missing ARIA roles for accessibility');
        }
        return warnings;
      }
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
      analyze: async (document: Document) => {
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
      }
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
      analyze: async (document: Document) => {
        const warnings = [];
        const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
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
      }
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
      analyze: async (document: Document) => {
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
      }
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
      analyze: async (document: Document) => {
        const warnings = [];
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const webglContext = (canvas as HTMLCanvasElement).getContext('webgl');
          if (!webglContext && document.querySelector('script[src*="p5"]')?.textContent?.includes('WEBGL')) {
            warnings.push('WebGL mode requested but not available');
          }
          if (!document.querySelector('script[src*="p5"]')?.textContent?.includes('preload')) {
            warnings.push('preload() function not detected for asset loading');
          }
        }
        return warnings;
      }
    }
  ];

  async detectEngine(document: Document): Promise<EngineDetectionResult | null> {
    let bestMatch: EngineDetectionResult | null = null;
    let highestConfidence = 0;

    for (const engine of this.engines) {
      const confidence = await this.calculateConfidence(engine, document);
      if (confidence > highestConfidence) {
        const warnings = await engine.analyze(document);
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
  }

  private async calculateConfidence(engine: GameEngine, document: Document): Promise<number> {
    let matches = 0;
    let total = 0;

    for (const signature of engine.signatures) {
      total++;
      switch (signature.type) {
        case 'canvas':
          if (this.matchCanvas(signature, document)) matches++;
          break;
        case 'webgl':
          if (await this.matchWebGL(signature, document)) matches++;
          break;
        case 'dom':
          if (this.matchDOM(signature, document)) matches++;
          break;
        case 'script':
          if (this.matchScript(signature, document)) matches++;
          break;
        case 'html':
          if (this.matchHTML(signature, document)) matches++;
          break;
      }
    }

    return matches / total;
  }

  private matchCanvas(signature: EngineSignature, document: Document): boolean {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;

    if (signature.size) {
      return canvas.width === signature.size.width && 
             canvas.height === signature.size.height;
    }

    if (signature.patterns) {
      return signature.patterns.some(pattern => 
        canvas.id.includes(pattern) || canvas.className.includes(pattern)
      );
    }

    return true;
  }

  private async matchWebGL(signature: EngineSignature, document: Document): Promise<boolean> {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;

    const context = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!context) return false;

    if (signature.shaders) {
      // In a real implementation, we would need to check shader sources
      // This is a simplified check
      return true;
    }

    return true;
  }

  private matchDOM(signature: EngineSignature, document: Document): boolean {
    if (!signature.patterns) return false;

    return signature.patterns.some(pattern => {
      const elements = document.querySelectorAll(`.${pattern}, #${pattern}, [data-${pattern}]`);
      return elements.length > 0;
    });
  }

  private matchScript(signature: EngineSignature, document: Document): boolean {
    if (!signature.patterns) return false;

    const scripts = Array.from(document.scripts);
    return signature.patterns.some(pattern =>
      scripts.some(script => 
        script.textContent?.includes(pattern) || 
        script.src.includes(pattern)
      )
    );
  }

  private matchHTML(signature: EngineSignature, document: Document): boolean {
    if (!signature.patterns) return false;

    const html = document.documentElement.innerHTML;
    return signature.patterns.some(pattern => html.includes(pattern));
  }

  private detectFeatures(engine: GameEngine, document: Document): string[] {
    const features: string[] = [];

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
        if (canvas?.getContext('webgl') || canvas?.getContext('webgl2')) {
          features.push('WebGL rendering');
        } else {
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