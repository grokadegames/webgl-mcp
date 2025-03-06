export interface WebGLContext {
    id: string;
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    capabilities: {
        webgl2: boolean;
        maxTextureSize: number;
        maxViewportDims: [number, number];
        extensions: string[];
    };
}
export interface WebGLContextMetadata {
    id: string;
    width: number;
    height: number;
    capabilities: {
        webgl2: boolean;
        maxTextureSize: number;
        maxViewportDims: [number, number];
        extensions: string[];
    };
    performance?: {
        fps: number;
        drawCalls: number;
        triangles: number;
        textureMemory: number;
    };
}
export declare class WebGLContextManager {
    private contexts;
    createContext(id: string, canvas: HTMLCanvasElement): WebGLContext;
    getContext(id: string): WebGLContext | undefined;
    removeContext(id: string): boolean;
    listContexts(): string[];
}
