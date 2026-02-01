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

import './style.css';
import { createEditor, highlightError, clearErrors, goToLine, getEditorCode, editorInstance } from './editor/editor';
import { WebGLRenderer, DEFAULT_SHADER } from './renderers/webgl-renderer';
import { Controls, ErrorPanel } from './ui/controls';
import { ProjectManager } from './ui/project-manager';
import { createGitHubBanner } from './ui/github-banner';
import { getOrCreateDefaultShader, updateShader, getShaderMainCode } from './shader-manager';
import type { ShaderProject, CompilationError } from './types';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(console.error);
}
let compileTimeout: number | null = null;
let controls: Controls | null = null;
let projectManager: ProjectManager | null = null;
let errorPanel: ErrorPanel | null = null;
let currentShader: ShaderProject | null = null;
let renderer: WebGLRenderer | null = null;

// Debounced compile
function scheduleCompile(): void {
  if (compileTimeout) {
    clearTimeout(compileTimeout);
  }
  compileTimeout = window.setTimeout(() => {
    compile();
  }, 500);
}

// Compile current shader
function compile(): void {
  if (!renderer) return;

  const code = getEditorCode();
  clearErrors();
  errorPanel?.clear();

  const success = renderer.compile(code);

  if (success && currentShader) {
    updateShader(currentShader.id, { code }).catch(console.error);
  }
}

// Handle compilation errors
function handleErrors(errors: CompilationError[]): void {
  errorPanel?.showErrors(errors);

  if (errors.length > 0) {
    highlightError(errors[0].line, errors[0].message);
  }
}

// Initialize application
async function init(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  // Create layout
  app.innerHTML = `
    <header class="header">
      <div style="display: flex; align-items: center; gap: 16px;">
        <h1>🎨 Shadertoy Editor</h1>
        <button id="projects-btn" class="secondary-btn">Projects</button>
      </div>
      <span id="shader-name">Loading...</span>
    </header>
    <div class="editor-container">
      <div id="editor"></div>
    </div>
    <div class="resizer" id="resizer"></div>
    <div class="canvas-container">
      <canvas id="canvas"></canvas>
    </div>
    <div class="controls" id="controls"></div>
    <div class="error-panel" id="error-panel"></div>
  `;

  // Add GitHub banner
  app.appendChild(createGitHubBanner());

  // Get elements
  const editorContainer = document.getElementById('editor')!;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const controlsContainer = document.getElementById('controls')!;
  const errorContainer = document.getElementById('error-panel')!;
  const shaderNameEl = document.getElementById('shader-name')!;
  const projectsBtn = document.getElementById('projects-btn')!;

  // Load or create shader
  currentShader = await getOrCreateDefaultShader();
  shaderNameEl.textContent = currentShader.name;

  // Set up canvas size with 16:9 aspect ratio
  const resizeCanvas = (): void => {
    const container = canvas.parentElement!;
    const rect = container.getBoundingClientRect();
    const aspectRatio = 16 / 9;

    let width = rect.width;
    let height = width / aspectRatio;

    // If height exceeds container, constrain by height instead
    if (height > rect.height) {
      height = rect.height;
      width = height * aspectRatio;
    }

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    renderer?.resize(width * window.devicePixelRatio, height * window.devicePixelRatio);
  };

  // Create WebGL renderer
  renderer = new WebGLRenderer(canvas);
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Resizer logic
  const resizer = document.getElementById('resizer')!;
  let isResizing = false;

  resizer.addEventListener('mousedown', () => {
    isResizing = true;
    resizer.classList.add('active');
    document.body.style.cursor = 'col-resize';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    e.preventDefault();
    const percentage = (e.clientX / window.innerWidth) * 100;
    if (percentage > 10 && percentage < 90) {
      app.style.gridTemplateColumns = `${percentage}% 4px 1fr`;
      editorInstance?.layout(); // Resize editor
      resizeCanvas(); // Resize canvas
    }
  });

  window.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('active');
      document.body.style.cursor = '';
      editorInstance?.layout(); // Ensure final layout update
      resizeCanvas();
    }
  });

  // Create error panel
  errorPanel = new ErrorPanel({
    container: errorContainer,
    onErrorClick: (line) => goToLine(line)
  });

  // Create controls
  controls = new Controls({
    container: controlsContainer,
    onPlay: () => renderer?.play(),
    onPause: () => renderer?.pause(),
    onRestart: () => renderer?.restart(),
    onCompile: () => compile()
  });

  // Listen for renderer events
  renderer.on((event) => {
    switch (event.type) {
      case 'compile-error':
        if (event.errors) {
          handleErrors(event.errors);
        }
        break;
      case 'compile-success':
        clearErrors();
        errorPanel?.clear();
        break;
      case 'frame':
        if (event.state) {
          controls?.updateState(event.state);
        }
        break;
    }
  });

  // Create Project Manager
  projectManager = new ProjectManager({
    container: document.body,
    onSelect: (shader) => {
      // Save current shader before switching
      if (currentShader && editorInstance) {
        const code = getEditorCode();
        // Only save if we have changes or just to be safe. 
        // Since we don't track dirty state, we save.
        // We must NOT use compile() here because it updates the renderer.
        // We just want to persist the text to the DB.
        updateShader(currentShader.id, { code }).catch(console.error);

        // Also clear any pending compile to avoid race conditions
        if (compileTimeout) {
          clearTimeout(compileTimeout);
          compileTimeout = null;
        }
      }

      currentShader = shader;
      shaderNameEl.textContent = shader.name;

      if (editorInstance) {
        editorInstance.setValue(getShaderMainCode(shader));
      }

      compile();
      renderer?.restart();
    }
  });

  projectsBtn.onclick = () => projectManager?.show();

  // Register header double-click to rename current project
  shaderNameEl.ondblclick = async () => {
    if (!currentShader) return;
    const newName = prompt('Rename project:', currentShader.name);
    if (newName && newName !== currentShader.name) {
      await updateShader(currentShader.id, { name: newName });
      currentShader.name = newName;
      shaderNameEl.textContent = newName;
    }
  };

  // Create editor
  createEditor({
    container: editorContainer,
    initialCode: getShaderMainCode(currentShader) || DEFAULT_SHADER,
    onChange: () => scheduleCompile()
  });

  // Initial compile and play
  compile();
  renderer.play();
}

// Start the app
init().catch(console.error);
