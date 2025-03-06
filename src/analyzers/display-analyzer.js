"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGLDisplayAnalyzer = void 0;
class WebGLDisplayAnalyzer {
    analyzeDisplay(gl, contextMeta) {
        const analysis = {
            resolution: this.analyzeResolution(contextMeta),
            devicePixelRatio: window.devicePixelRatio || 1,
            displayCapabilities: this.analyzeCapabilities(gl),
            recommendations: []
        };
        // Generate display-specific recommendations
        this.generateRecommendations(analysis);
        return analysis;
    }
    analyzeResolution(contextMeta) {
        const { width, height } = contextMeta;
        return {
            width,
            height,
            aspectRatio: width / height
        };
    }
    analyzeCapabilities(gl) {
        const capabilities = {
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
            colorBufferFormats: this.getSupportedColorFormats(gl),
            hasHDR: this.checkHDRSupport(gl),
            hasFloatTextures: this.checkFloatTextureSupport(gl),
            hasDepthTexture: this.checkDepthTextureSupport(gl),
            antialiasingModes: this.getSupportedAntialiasingModes(gl)
        };
        return capabilities;
    }
    getSupportedColorFormats(gl) {
        const formats = [];
        // Check standard formats
        if (this.isFormatSupported(gl, gl.RGBA))
            formats.push('RGBA8');
        if (this.isFormatSupported(gl, gl.RGB))
            formats.push('RGB8');
        // Check for sRGB support
        const ext = gl.getExtension('EXT_sRGB');
        if (ext)
            formats.push('sRGB');
        // WebGL2 specific formats
        if (gl instanceof WebGL2RenderingContext) {
            if (this.isFormatSupported(gl, gl.R8))
                formats.push('R8');
            if (this.isFormatSupported(gl, gl.RG8))
                formats.push('RG8');
            if (this.isFormatSupported(gl, gl.RGBA16F))
                formats.push('RGBA16F');
        }
        return formats;
    }
    checkHDRSupport(gl) {
        if (gl instanceof WebGL2RenderingContext) {
            const ext = gl.getExtension('EXT_color_buffer_float');
            return !!ext;
        }
        return false;
    }
    checkFloatTextureSupport(gl) {
        const ext = gl.getExtension('OES_texture_float');
        return !!ext;
    }
    checkDepthTextureSupport(gl) {
        const ext = gl.getExtension('WEBGL_depth_texture') ||
            gl.getExtension('WEBKIT_WEBGL_depth_texture') ||
            gl.getExtension('MOZ_WEBGL_depth_texture');
        return !!ext;
    }
    getSupportedAntialiasingModes(gl) {
        const modes = [];
        // Check MSAA support
        const maxSamples = gl instanceof WebGL2RenderingContext ?
            gl.getParameter(gl.MAX_SAMPLES) :
            0;
        if (maxSamples > 0) {
            modes.push(`MSAA (up to ${maxSamples}x)`);
        }
        // Check FXAA support (this is more of a technique than a capability)
        modes.push('FXAA');
        return modes;
    }
    isFormatSupported(gl, format) {
        // Create a small texture to test format support
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        const error = gl.getError();
        gl.deleteTexture(texture);
        return error === gl.NO_ERROR;
    }
    generateRecommendations(analysis) {
        const { resolution, devicePixelRatio, displayCapabilities } = analysis;
        // Resolution recommendations
        if (resolution.width * devicePixelRatio > displayCapabilities.maxTextureSize ||
            resolution.height * devicePixelRatio > displayCapabilities.maxTextureSize) {
            analysis.recommendations.push('Canvas size exceeds maximum texture size. Consider reducing resolution or implementing split-screen rendering.');
        }
        // Device pixel ratio recommendations
        if (devicePixelRatio > 1) {
            analysis.recommendations.push(`High DPI display detected (${devicePixelRatio}x). Consider implementing resolution scaling for performance.`);
        }
        // Color format recommendations
        if (displayCapabilities.hasHDR) {
            analysis.recommendations.push('HDR capable display detected. Consider implementing HDR rendering pipeline.');
        }
        // Antialiasing recommendations
        if (displayCapabilities.antialiasingModes.some(mode => mode.includes('MSAA'))) {
            analysis.recommendations.push('MSAA supported. Consider using MSAA for static scenes and FXAA for dynamic content.');
        }
        // Texture format recommendations
        if (displayCapabilities.hasFloatTextures) {
            analysis.recommendations.push('Float textures supported. Consider using for HDR effects and advanced post-processing.');
        }
        // Depth texture recommendations
        if (displayCapabilities.hasDepthTexture) {
            analysis.recommendations.push('Depth textures supported. Consider using for shadow mapping and depth-based effects.');
        }
        // Viewport recommendations
        const [maxWidth, maxHeight] = displayCapabilities.maxViewportDims;
        if (resolution.width > maxWidth || resolution.height > maxHeight) {
            analysis.recommendations.push('Viewport dimensions exceed maximum. Implement viewport splitting or reduce resolution.');
        }
        // Aspect ratio recommendations
        if (resolution.aspectRatio < 1 || resolution.aspectRatio > 2.5) {
            analysis.recommendations.push('Unusual aspect ratio detected. Ensure content scales appropriately across different screen sizes.');
        }
    }
}
exports.WebGLDisplayAnalyzer = WebGLDisplayAnalyzer;
