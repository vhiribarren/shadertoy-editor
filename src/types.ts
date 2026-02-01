// MIT No Attribution
//
// Copyright 2026 Vincent Hiribarren
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

export interface ShaderFile {
    name: string;
    code: string;
}

export interface ShaderProject {
    id: string;
    name: string;
    files: ShaderFile[];
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
