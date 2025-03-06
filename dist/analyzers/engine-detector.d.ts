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
    size?: {
        width: number;
        height: number;
    };
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
export declare class EngineDetector {
    checkWebGLCapabilities(gl: WebGLRenderingContext | WebGL2RenderingContext): Promise<WebGLCapabilities>;
    private engines;
    detectEngine(document: Document): Promise<EngineDetectionResult | null>;
    private calculateConfidence;
    private matchCanvas;
    private matchWebGL;
    private matchDOM;
    private matchScript;
    private matchHTML;
    private detectFeatures;
}
