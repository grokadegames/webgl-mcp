export interface BuildAnalysis {
    totalSize: number;
    compressedSize: number;
    files: BuildFileAnalysis[];
    suggestions: string[];
    templateUsed?: string;
    templateConfig?: {
        scaleToFit?: boolean;
        optimizeForPixelArt?: boolean;
        hasLoadingBar?: boolean;
        mobileOptimized?: boolean;
    };
}
export interface BuildFileAnalysis {
    path: string;
    size: number;
    compressedSize: number;
    type: string;
    suggestions: string[];
}
export declare class WebGLBuildAnalyzer {
    analyzeBuild(buildPath: string): Promise<BuildAnalysis>;
    private getAllFiles;
    private analyzeHTMLTemplate;
    private analyzeFile;
    private getFileType;
    private analyzeTexture;
    private analyzeShader;
    private analyzeJavaScript;
    private analyzeBuildStructure;
}
