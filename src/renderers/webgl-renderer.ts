import type { CompilationError, RendererState, RendererEvent } from '../types';

// Default Shadertoy-compatible fragment shader
export const DEFAULT_SHADER = `// Shader Studio - Shadertoy Compatible
// Use iResolution, iTime, iMouse, etc.

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;
    
    // Time varying pixel color
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));
    
    // Output to screen
    fragColor = vec4(col, 1.0);
}
`;

// Vertex shader for fullscreen quad
const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_texCoord;

void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment shader wrapper that provides Shadertoy uniforms
function createFragmentShader(userCode: string): string {
    return `#version 300 es
precision highp float;

// Shadertoy uniforms
uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform int iFrame;
uniform float iFrameRate;
uniform vec4 iMouse;
uniform vec4 iDate;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform vec3 iChannelResolution[4];
uniform float iChannelTime[4];

in vec2 v_texCoord;
out vec4 outColor;

// User shader code
${userCode}

void main() {
    vec2 fragCoord = v_texCoord * iResolution.xy;
    mainImage(outColor, fragCoord);
}
`;
}

export class WebGLRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext | null = null;
    private program: WebGLProgram | null = null;
    private vao: WebGLVertexArrayObject | null = null;

    private isPlaying = false;
    private startTime = 0;
    private pausedTime = 0;
    private lastFrameTime = 0;
    private frameCount = 0;
    private animationId: number | null = null;

    private mouse: [number, number, number, number] = [0, 0, 0, 0];
    private isMouseDown = false;

    private eventListeners: ((event: RendererEvent) => void)[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.initGL();
        this.setupMouseEvents();
    }

    private initGL(): void {
        this.gl = this.canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            preserveDrawingBuffer: false
        });

        if (!this.gl) {
            throw new Error('WebGL 2 is not supported');
        }

        // Create fullscreen quad
        const vertices = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]);

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindVertexArray(null);
    }

    private setupMouseEvents(): void {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = rect.height - (e.clientY - rect.top);
            this.mouse = [x, y, x, y];
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isMouseDown) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = rect.height - (e.clientY - rect.top);
                this.mouse[0] = x;
                this.mouse[1] = y;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.mouse[2] = -Math.abs(this.mouse[2]);
            this.mouse[3] = -Math.abs(this.mouse[3]);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
        });
    }

    public compile(shaderCode: string): boolean {
        if (!this.gl) return false;

        const gl = this.gl;

        // Compile vertex shader
        const vs = gl.createShader(gl.VERTEX_SHADER);
        if (!vs) return false;

        gl.shaderSource(vs, VERTEX_SHADER);
        gl.compileShader(vs);

        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(vs);
            console.error('Vertex shader error:', error);
            gl.deleteShader(vs);
            return false;
        }

        // Compile fragment shader
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fs) {
            gl.deleteShader(vs);
            return false;
        }

        const fragmentSource = createFragmentShader(shaderCode);
        gl.shaderSource(fs, fragmentSource);
        gl.compileShader(fs);

        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(fs) || '';
            const errors = this.parseErrors(error);
            this.emit({ type: 'compile-error', errors });
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            return false;
        }

        // Link program
        const program = gl.createProgram();
        if (!program) {
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            return false;
        }

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program) || '';
            console.error('Link error:', error);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            return false;
        }

        // Clean up old program
        if (this.program) {
            gl.deleteProgram(this.program);
        }

        this.program = program;
        gl.deleteShader(vs);
        gl.deleteShader(fs);

        this.emit({ type: 'compile-success' });
        return true;
    }

    private parseErrors(errorLog: string): CompilationError[] {
        const errors: CompilationError[] = [];
        const lines = errorLog.split('\n');

        // Error format: ERROR: 0:line: message
        const regex = /ERROR:\s*\d+:(\d+):\s*(.+)/;

        for (const line of lines) {
            const match = line.match(regex);
            if (match) {
                // Adjust line number (subtract header lines from wrapper)
                const lineNum = parseInt(match[1], 10) - 16; // Offset for our wrapper
                errors.push({
                    line: Math.max(1, lineNum),
                    message: match[2].trim()
                });
            }
        }

        return errors;
    }

    public resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.gl) {
            this.gl.viewport(0, 0, width, height);
        }
    }

    public play(): void {
        if (this.isPlaying) return;

        this.isPlaying = true;
        if (this.pausedTime > 0) {
            this.startTime = performance.now() - this.pausedTime;
        } else {
            this.startTime = performance.now();
        }
        this.lastFrameTime = performance.now();
        this.render();
    }

    public pause(): void {
        this.isPlaying = false;
        this.pausedTime = performance.now() - this.startTime;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    public restart(): void {
        this.startTime = performance.now();
        this.pausedTime = 0;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        if (!this.isPlaying) {
            this.renderFrame();
        }
    }

    public getState(): RendererState {
        const time = this.isPlaying
            ? (performance.now() - this.startTime) / 1000
            : this.pausedTime / 1000;

        return {
            isPlaying: this.isPlaying,
            time,
            frame: this.frameCount,
            fps: 0
        };
    }

    private render = (): void => {
        if (!this.isPlaying) return;

        this.renderFrame();
        this.animationId = requestAnimationFrame(this.render);
    };

    private renderFrame(): void {
        if (!this.gl || !this.program) return;

        const gl = this.gl;
        const now = performance.now();
        const time = (now - this.startTime) / 1000;
        const timeDelta = (now - this.lastFrameTime) / 1000;
        const fps = timeDelta > 0 ? 1 / timeDelta : 60;

        this.lastFrameTime = now;

        // Get current date
        const date = new Date();
        const dateSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000;

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        // Set uniforms
        const uResolution = gl.getUniformLocation(this.program, 'iResolution');
        const uTime = gl.getUniformLocation(this.program, 'iTime');
        const uTimeDelta = gl.getUniformLocation(this.program, 'iTimeDelta');
        const uFrame = gl.getUniformLocation(this.program, 'iFrame');
        const uFrameRate = gl.getUniformLocation(this.program, 'iFrameRate');
        const uMouse = gl.getUniformLocation(this.program, 'iMouse');
        const uDate = gl.getUniformLocation(this.program, 'iDate');

        gl.uniform3f(uResolution, this.canvas.width, this.canvas.height, 1.0);
        gl.uniform1f(uTime, time);
        gl.uniform1f(uTimeDelta, timeDelta);
        gl.uniform1i(uFrame, this.frameCount);
        gl.uniform1f(uFrameRate, fps);
        gl.uniform4f(uMouse, this.mouse[0], this.mouse[1], this.mouse[2], this.mouse[3]);
        gl.uniform4f(uDate, date.getFullYear(), date.getMonth(), date.getDate(), dateSeconds);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.frameCount++;

        this.emit({
            type: 'frame',
            state: {
                isPlaying: this.isPlaying,
                time,
                frame: this.frameCount,
                fps
            }
        });
    }

    public on(listener: (event: RendererEvent) => void): void {
        this.eventListeners.push(listener);
    }

    public off(listener: (event: RendererEvent) => void): void {
        const index = this.eventListeners.indexOf(listener);
        if (index !== -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    private emit(event: RendererEvent): void {
        for (const listener of this.eventListeners) {
            listener(event);
        }
    }

    public dispose(): void {
        this.pause();
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
    }
}
