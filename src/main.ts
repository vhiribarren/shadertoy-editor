import './style.css';
import { createEditor, highlightError, clearErrors, goToLine, getEditorCode, editorInstance } from './editor/editor';
import { WebGLRenderer, DEFAULT_SHADER } from './renderers/webgl-renderer';
import { Controls, ErrorPanel } from './ui/controls';
import { getOrCreateDefaultShader, updateShader } from './shader-manager';
import type { ShaderProject, CompilationError } from './types';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(console.error);
}

// Application state
let currentShader: ShaderProject | null = null;
let renderer: WebGLRenderer | null = null;
let compileTimeout: number | null = null;
let controls: Controls | null = null;
let errorPanel: ErrorPanel | null = null;

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
      <h1>🎨 Shader Studio</h1>
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

  // Get elements
  const editorContainer = document.getElementById('editor')!;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const controlsContainer = document.getElementById('controls')!;
  const errorContainer = document.getElementById('error-panel')!;
  const shaderNameEl = document.getElementById('shader-name')!;

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

  // Create editor
  createEditor({
    container: editorContainer,
    initialCode: currentShader.code || DEFAULT_SHADER,
    onChange: () => scheduleCompile()
  });

  // Initial compile and play
  compile();
  renderer.play();
}

// Start the app
init().catch(console.error);
