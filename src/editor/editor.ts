import * as monaco from 'monaco-editor';
import { registerGLSLLanguage } from './glsl-language';
import { registerGLSLCompletionProvider } from './glsl-completion';

// Monaco Editor workers setup
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

// Configure Monaco workers
self.MonacoEnvironment = {
    getWorker: function () {
        return new editorWorker();
    }
};

export let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

export interface EditorOptions {
    container: HTMLElement;
    initialCode: string;
    onChange?: (code: string) => void;
}

export function createEditor(options: EditorOptions): monaco.editor.IStandaloneCodeEditor {
    // Register GLSL language and completions
    registerGLSLLanguage();
    registerGLSLCompletionProvider();

    // Create the editor
    editorInstance = monaco.editor.create(options.container, {
        value: options.initialCode,
        language: 'glsl',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        bracketPairColorization: { enabled: true },
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'selection',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on'
    });

    // Listen for changes
    if (options.onChange) {
        editorInstance.onDidChangeModelContent(() => {
            const code = editorInstance?.getValue() || '';
            options.onChange!(code);
        });
    }

    return editorInstance;
}

export function getEditorCode(): string {
    return editorInstance?.getValue() || '';
}

export function setEditorCode(code: string): void {
    editorInstance?.setValue(code);
}

export function highlightError(line: number, message: string): void {
    if (!editorInstance) return;

    const model = editorInstance.getModel();
    if (!model) return;

    monaco.editor.setModelMarkers(model, 'glsl', [{
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: model.getLineMaxColumn(line),
        message,
        severity: monaco.MarkerSeverity.Error
    }]);
}

export function clearErrors(): void {
    if (!editorInstance) return;
    const model = editorInstance.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(model, 'glsl', []);
}

export function goToLine(line: number): void {
    editorInstance?.revealLineInCenter(line);
    editorInstance?.setPosition({ lineNumber: line, column: 1 });
    editorInstance?.focus();
}

export function disposeEditor(): void {
    editorInstance?.dispose();
    editorInstance = null;
}
