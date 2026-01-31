export interface ShaderProject {
    id: string;
    name: string;
    code: string;
    createdAt: number;
    updatedAt: number;
}

export interface ShadertoyUniforms {
    iResolution: [number, number, number];
    iTime: number;
    iTimeDelta: number;
    iFrame: number;
    iFrameRate: number;
    iMouse: [number, number, number, number];
    iDate: [number, number, number, number];
    iChannelResolution: [number, number, number][];
    iChannelTime: number[];
}

export interface CompilationError {
    line: number;
    message: string;
}

export interface RendererState {
    isPlaying: boolean;
    time: number;
    frame: number;
    fps: number;
}

export type RendererEventType = 'compile-error' | 'compile-success' | 'frame';

export interface RendererEvent {
    type: RendererEventType;
    errors?: CompilationError[];
    state?: RendererState;
}
