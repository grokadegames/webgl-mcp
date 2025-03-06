import { WebGLContextMetadata } from '../webgl-context';
export interface DisplayAnalysis {
    resolution: Resolution;
    devicePixelRatio: number;
    displayCapabilities: DisplayCapabilities;
    recommendations: string[];
}
interface Resolution {
    width: number;
    height: number;
    aspectRatio: number;
}
interface DisplayCapabilities {
    maxTextureSize: number;
    maxViewportDims: [number, number];
    maxRenderBufferSize: number;
    colorBufferFormats: string[];
    hasHDR: boolean;
    hasFloatTextures: boolean;
    hasDepthTexture: boolean;
    antialiasingModes: string[];
}
export declare class WebGLDisplayAnalyzer {
    analyzeDisplay(gl: WebGLRenderingContext | WebGL2RenderingContext, contextMeta: WebGLContextMetadata): DisplayAnalysis;
    private analyzeResolution;
    private analyzeCapabilities;
    private getSupportedColorFormats;
    private checkHDRSupport;
    private checkFloatTextureSupport;
    private checkDepthTextureSupport;
    private getSupportedAntialiasingModes;
    private isFormatSupported;
    private generateRecommendations;
}
export {};
