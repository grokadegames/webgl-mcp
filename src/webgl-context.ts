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

export class WebGLContextManager {
  private contexts: Map<string, WebGLContext> = new Map();

  public createContext(id: string, canvas: HTMLCanvasElement): WebGLContext {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      throw new Error('Failed to create WebGL context');
    }

    const context: WebGLContext = {
      id,
      canvas,
      gl,
      capabilities: {
        webgl2: gl instanceof WebGL2RenderingContext,
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        extensions: gl.getSupportedExtensions() || []
      }
    };

    this.contexts.set(id, context);
    return context;
  }

  public getContext(id: string): WebGLContext | undefined {
    return this.contexts.get(id);
  }

  public removeContext(id: string): boolean {
    return this.contexts.delete(id);
  }

  public listContexts(): string[] {
    return Array.from(this.contexts.keys());
  }
} 