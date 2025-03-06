"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLContextManager = void 0;
class WebGLContextManager {
    constructor() {
        this.contexts = new Map();
    }
    createContext(id, canvas) {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
            throw new Error('Failed to create WebGL context');
        }
        const context = {
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
    getContext(id) {
        return this.contexts.get(id);
    }
    removeContext(id) {
        return this.contexts.delete(id);
    }
    listContexts() {
        return Array.from(this.contexts.keys());
    }
}
exports.WebGLContextManager = WebGLContextManager;
