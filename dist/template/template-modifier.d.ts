export interface TemplateOptions {
    title?: string;
    loadingBar?: boolean;
    loadingText?: boolean;
    compression?: boolean;
    memoryLimit?: number;
    customStyles?: string;
    customScripts?: string[];
}
export interface Template {
    name: string;
    description: string;
    options: TemplateOptions;
    defaults: TemplateOptions;
}
export declare class WebGLTemplateModifier {
    private templatesPath;
    constructor(templatesPath: string);
    modifyTemplate(options: TemplateOptions): Promise<void>;
    private applyTemplateModifications;
    private addLoadingIndicators;
    private setupCompression;
    getTemplatesForEngine(engineId: string): Promise<Template[]>;
}
