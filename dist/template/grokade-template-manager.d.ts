export interface GrokadeTemplateConfig {
    scaleToFit?: boolean;
    optimizeForPixelArt?: boolean;
    centerCanvas?: boolean;
    customBackground?: string;
    showLoadingBar?: boolean;
    showLoadingText?: boolean;
    loadingBarColor?: string;
    clickToPlay?: boolean;
    fullscreenButton?: boolean;
    showScrollbars?: boolean;
    mobileOptimized?: boolean;
    forceMobileFullscreen?: boolean;
    compressionEnabled?: boolean;
    maxFileSize?: number;
    maxTotalFiles?: number;
    maxFilenameLength?: number;
    allowedFileTypes?: string[];
    httpsRequired?: boolean;
}
export declare class GrokadeTemplateManager {
    private readonly templatePath;
    private readonly defaultConfig;
    constructor(templatePath: string);
    applyTemplate(config?: Partial<GrokadeTemplateConfig>): Promise<void>;
    private validateTemplate;
    private injectTemplateStyles;
    private setupLoadingIndicators;
    private optimizeScaling;
    private setupMobileSupport;
    private injectSecurityHeaders;
    private configureCompression;
    private fileExists;
}
