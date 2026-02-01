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

import type { RendererState, CompilationError } from '../types';

export interface ControlsOptions {
    container: HTMLElement;
    onPlay: () => void;
    onPause: () => void;
    onRestart: () => void;
    onCompile: () => void;
}

export class Controls {
    private container: HTMLElement;
    private playButton: HTMLButtonElement;
    private pauseButton: HTMLButtonElement;
    private restartButton: HTMLButtonElement;
    private compileButton: HTMLButtonElement;
    private timeDisplay: HTMLSpanElement;
    private fpsDisplay: HTMLSpanElement;

    constructor(options: ControlsOptions) {
        this.container = options.container;

        // Create buttons
        this.playButton = this.createButton('▶ Play', () => options.onPlay());
        this.pauseButton = this.createButton('⏸ Pause', () => options.onPause());
        this.restartButton = this.createButton('↻ Restart', () => options.onRestart());
        this.compileButton = this.createButton('⚡ Compile', () => options.onCompile());

        // Time display
        this.timeDisplay = document.createElement('span');
        this.timeDisplay.className = 'time-display';
        this.timeDisplay.textContent = '0.00s';

        // FPS display
        this.fpsDisplay = document.createElement('span');
        this.fpsDisplay.className = 'stats';
        this.fpsDisplay.textContent = '0 FPS';

        // Add to container
        this.container.appendChild(this.playButton);
        this.container.appendChild(this.pauseButton);
        this.container.appendChild(this.restartButton);
        this.container.appendChild(this.compileButton);
        this.container.appendChild(this.timeDisplay);
        this.container.appendChild(this.fpsDisplay);

        // Initial state
        this.pauseButton.style.display = 'none';
    }

    private createButton(text: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }

    public updateState(state: RendererState): void {
        this.timeDisplay.textContent = `${state.time.toFixed(2)}s`;
        this.fpsDisplay.textContent = `${Math.round(state.fps)} FPS | Frame ${state.frame}`;

        if (state.isPlaying) {
            this.playButton.style.display = 'none';
            this.pauseButton.style.display = '';
        } else {
            this.playButton.style.display = '';
            this.pauseButton.style.display = 'none';
        }
    }
}

export interface ErrorPanelOptions {
    container: HTMLElement;
    onErrorClick: (line: number) => void;
}

export class ErrorPanel {
    private container: HTMLElement;
    private options: ErrorPanelOptions;

    constructor(options: ErrorPanelOptions) {
        this.options = options;
        this.container = options.container;
    }

    public showErrors(errors: CompilationError[]): void {
        this.container.innerHTML = '';

        if (errors.length === 0) {
            this.container.classList.remove('visible');
            return;
        }

        this.container.classList.add('visible');

        for (const error of errors) {
            const item = document.createElement('div');
            item.className = 'error-item';
            item.textContent = `Line ${error.line}: ${error.message}`;
            item.addEventListener('click', () => this.options.onErrorClick(error.line));
            this.container.appendChild(item);
        }
    }

    public clear(): void {
        this.container.innerHTML = '';
        this.container.classList.remove('visible');
    }
}
