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

import * as monaco from 'monaco-editor';

interface CompletionItem {
    label: string;
    kind: monaco.languages.CompletionItemKind;
    detail?: string;
    documentation?: string;
    insertText?: string;
    insertTextRules?: monaco.languages.CompletionItemInsertTextRule;
}

// Shadertoy uniforms with documentation
const shadertoyUniforms: CompletionItem[] = [
    {
        label: 'iResolution',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'vec3',
        documentation: 'Viewport resolution in pixels (width, height, 1.0)',
        insertText: 'iResolution'
    },
    {
        label: 'iTime',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'float',
        documentation: 'Shader playback time in seconds',
        insertText: 'iTime'
    },
    {
        label: 'iTimeDelta',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'float',
        documentation: 'Render time in seconds (time since last frame)',
        insertText: 'iTimeDelta'
    },
    {
        label: 'iFrame',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'int',
        documentation: 'Shader playback frame count',
        insertText: 'iFrame'
    },
    {
        label: 'iFrameRate',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'float',
        documentation: 'Frames per second (1.0 / iTimeDelta)',
        insertText: 'iFrameRate'
    },
    {
        label: 'iMouse',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'vec4',
        documentation: 'Mouse coordinates: xy = current position (if clicking), zw = click position',
        insertText: 'iMouse'
    },
    {
        label: 'iDate',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'vec4',
        documentation: 'Date/time: (year, month, day, time in seconds)',
        insertText: 'iDate'
    },
    {
        label: 'iChannel0',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'sampler2D',
        documentation: 'Input texture channel 0',
        insertText: 'iChannel0'
    },
    {
        label: 'iChannel1',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'sampler2D',
        documentation: 'Input texture channel 1',
        insertText: 'iChannel1'
    },
    {
        label: 'iChannel2',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'sampler2D',
        documentation: 'Input texture channel 2',
        insertText: 'iChannel2'
    },
    {
        label: 'iChannel3',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'sampler2D',
        documentation: 'Input texture channel 3',
        insertText: 'iChannel3'
    },
    {
        label: 'iChannelResolution',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'vec3[4]',
        documentation: 'Resolution of each input channel in pixels',
        insertText: 'iChannelResolution'
    },
    {
        label: 'iChannelTime',
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: 'float[4]',
        documentation: 'Playback time of each input channel in seconds',
        insertText: 'iChannelTime'
    }
];

// GLSL built-in functions with signatures
const glslBuiltinFunctions: CompletionItem[] = [
    // Trigonometry
    { label: 'sin', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType sin(genType angle)', documentation: 'Returns the sine of the angle' },
    { label: 'cos', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType cos(genType angle)', documentation: 'Returns the cosine of the angle' },
    { label: 'tan', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType tan(genType angle)', documentation: 'Returns the tangent of the angle' },
    { label: 'asin', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType asin(genType x)', documentation: 'Returns the arcsine of x' },
    { label: 'acos', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType acos(genType x)', documentation: 'Returns the arccosine of x' },
    { label: 'atan', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType atan(genType y, genType x)', documentation: 'Returns the arctangent of y/x' },
    { label: 'radians', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType radians(genType degrees)', documentation: 'Converts degrees to radians' },
    { label: 'degrees', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType degrees(genType radians)', documentation: 'Converts radians to degrees' },

    // Exponential
    { label: 'pow', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType pow(genType x, genType y)', documentation: 'Returns x raised to the power y' },
    { label: 'exp', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType exp(genType x)', documentation: 'Returns e raised to the power x' },
    { label: 'log', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType log(genType x)', documentation: 'Returns the natural logarithm of x' },
    { label: 'exp2', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType exp2(genType x)', documentation: 'Returns 2 raised to the power x' },
    { label: 'log2', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType log2(genType x)', documentation: 'Returns the base-2 logarithm of x' },
    { label: 'sqrt', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType sqrt(genType x)', documentation: 'Returns the square root of x' },
    { label: 'inversesqrt', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType inversesqrt(genType x)', documentation: 'Returns 1/sqrt(x)' },

    // Common
    { label: 'abs', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType abs(genType x)', documentation: 'Returns the absolute value of x' },
    { label: 'sign', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType sign(genType x)', documentation: 'Returns -1, 0, or 1 based on sign of x' },
    { label: 'floor', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType floor(genType x)', documentation: 'Returns the largest integer <= x' },
    { label: 'ceil', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType ceil(genType x)', documentation: 'Returns the smallest integer >= x' },
    { label: 'fract', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType fract(genType x)', documentation: 'Returns x - floor(x)' },
    { label: 'mod', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType mod(genType x, genType y)', documentation: 'Returns x modulo y' },
    { label: 'min', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType min(genType x, genType y)', documentation: 'Returns the minimum of x and y' },
    { label: 'max', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType max(genType x, genType y)', documentation: 'Returns the maximum of x and y' },
    { label: 'clamp', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType clamp(genType x, genType minVal, genType maxVal)', documentation: 'Clamps x between minVal and maxVal' },
    { label: 'mix', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType mix(genType x, genType y, genType a)', documentation: 'Linear interpolation between x and y using a' },
    { label: 'step', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType step(genType edge, genType x)', documentation: 'Returns 0.0 if x < edge, else 1.0' },
    { label: 'smoothstep', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType smoothstep(genType edge0, genType edge1, genType x)', documentation: 'Hermite interpolation between 0 and 1' },

    // Geometric
    { label: 'length', kind: monaco.languages.CompletionItemKind.Function, detail: 'float length(genType x)', documentation: 'Returns the length of vector x' },
    { label: 'distance', kind: monaco.languages.CompletionItemKind.Function, detail: 'float distance(genType p0, genType p1)', documentation: 'Returns the distance between p0 and p1' },
    { label: 'dot', kind: monaco.languages.CompletionItemKind.Function, detail: 'float dot(genType x, genType y)', documentation: 'Returns the dot product of x and y' },
    { label: 'cross', kind: monaco.languages.CompletionItemKind.Function, detail: 'vec3 cross(vec3 x, vec3 y)', documentation: 'Returns the cross product of x and y' },
    { label: 'normalize', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType normalize(genType x)', documentation: 'Returns a vector with length 1 in same direction as x' },
    { label: 'reflect', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType reflect(genType I, genType N)', documentation: 'Reflects vector I around normal N' },
    { label: 'refract', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType refract(genType I, genType N, float eta)', documentation: 'Refracts vector I around normal N with ratio eta' },

    // Texture
    { label: 'texture', kind: monaco.languages.CompletionItemKind.Function, detail: 'vec4 texture(sampler2D sampler, vec2 coord)', documentation: 'Sample a texture at the given coordinates' },
    { label: 'textureLod', kind: monaco.languages.CompletionItemKind.Function, detail: 'vec4 textureLod(sampler2D sampler, vec2 coord, float lod)', documentation: 'Sample a texture with explicit LOD' },
    { label: 'textureSize', kind: monaco.languages.CompletionItemKind.Function, detail: 'ivec2 textureSize(sampler2D sampler, int lod)', documentation: 'Returns texture dimensions' },
    { label: 'texelFetch', kind: monaco.languages.CompletionItemKind.Function, detail: 'vec4 texelFetch(sampler2D sampler, ivec2 coord, int lod)', documentation: 'Fetch a single texel' },

    // Fragment
    { label: 'dFdx', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType dFdx(genType p)', documentation: 'Returns the partial derivative of p with respect to x' },
    { label: 'dFdy', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType dFdy(genType p)', documentation: 'Returns the partial derivative of p with respect to y' },
    { label: 'fwidth', kind: monaco.languages.CompletionItemKind.Function, detail: 'genType fwidth(genType p)', documentation: 'Returns abs(dFdx(p)) + abs(dFdy(p))' }
];

// GLSL types
const glslTypes: CompletionItem[] = [
    { label: 'void', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: 'No return value' },
    { label: 'bool', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: 'Boolean value' },
    { label: 'int', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: 'Signed integer' },
    { label: 'uint', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: 'Unsigned integer' },
    { label: 'float', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: 'Floating-point number' },
    { label: 'vec2', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '2-component float vector' },
    { label: 'vec3', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '3-component float vector' },
    { label: 'vec4', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '4-component float vector' },
    { label: 'ivec2', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '2-component integer vector' },
    { label: 'ivec3', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '3-component integer vector' },
    { label: 'ivec4', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '4-component integer vector' },
    { label: 'mat2', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '2x2 float matrix' },
    { label: 'mat3', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '3x3 float matrix' },
    { label: 'mat4', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '4x4 float matrix' },
    { label: 'sampler2D', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: '2D texture sampler' },
    { label: 'samplerCube', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Type', documentation: 'Cube map texture sampler' }
];

// Snippets for common patterns
const glslSnippets: CompletionItem[] = [
    {
        label: 'mainImage',
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: 'Shadertoy main function',
        documentation: 'The main entry point for Shadertoy shaders',
        insertText: 'void mainImage(out vec4 fragColor, in vec2 fragCoord) {\n\tvec2 uv = fragCoord / iResolution.xy;\n\t$0\n\tfragColor = vec4(uv, 0.0, 1.0);\n}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
        label: 'uv',
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: 'Normalized UV coordinates',
        documentation: 'Create normalized UV coordinates from fragCoord',
        insertText: 'vec2 uv = fragCoord / iResolution.xy;',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
        label: 'uv_centered',
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: 'Centered UV coordinates',
        documentation: 'Create centered UV coordinates with aspect ratio correction',
        insertText: 'vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
        label: 'for_loop',
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: 'For loop',
        documentation: 'A basic for loop',
        insertText: 'for (int i = 0; i < ${1:10}; i++) {\n\t$0\n}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
        label: 'sdf_circle',
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: 'SDF Circle',
        documentation: 'Signed distance function for a circle',
        insertText: 'float sdCircle(vec2 p, float r) {\n\treturn length(p) - r;\n}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
        label: 'sdf_box',
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: 'SDF Box',
        documentation: 'Signed distance function for a box',
        insertText: 'float sdBox(vec2 p, vec2 b) {\n\tvec2 d = abs(p) - b;\n\treturn length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);\n}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    }
];

// Combine all completions
const allCompletions = [
    ...shadertoyUniforms,
    ...glslBuiltinFunctions,
    ...glslTypes,
    ...glslSnippets
];

// Register completion provider
// Parse the code to find variable and function declarations
function getDynamicCompletions(model: monaco.editor.ITextModel, range: monaco.IRange): monaco.languages.CompletionItem[] {
    const code = model.getValue();
    const completions: monaco.languages.CompletionItem[] = [];
    const definedNames = new Set<string>();

    // Regex for variable declarations
    // Matches: type variableName
    const typeRegex = /\b(float|int|uint|bool|vec[234]|ivec[234]|bvec[234]|mat[234]|sampler2D)\s+([a-zA-Z_]\w*)/g;

    // Regex for function declarations
    // Matches: type functionName (
    const funcRegex = /\b(void|float|int|uint|bool|vec[234]|ivec[234]|bvec[234]|mat[234])\s+([a-zA-Z_]\w*)\s*\(/g;

    let match;

    // Find variables
    while ((match = typeRegex.exec(code)) !== null) {
        const type = match[1];
        const name = match[2];

        // Avoid duplicates and keywords
        if (!definedNames.has(name) && !glslBuiltinFunctions.some(f => f.label === name)) {
            definedNames.add(name);
            completions.push({
                label: name,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: type,
                documentation: `User defined variable of type ${type}`,
                insertText: name,
                range: range
            });
        }
    }

    // Find functions
    while ((match = funcRegex.exec(code)) !== null) {
        const returnType = match[1];
        const name = match[2];

        // Avoid duplicates (if mainImage is defined, we might pick it up, but that's fine)
        if (!definedNames.has(name)) {
            definedNames.add(name);
            completions.push({
                label: name,
                kind: monaco.languages.CompletionItemKind.Function,
                detail: `${returnType} ${name}(...)`,
                documentation: `User defined function returning ${returnType}`,
                insertText: name,
                range: range
            });
        }
    }

    return completions;
}

export function registerGLSLCompletionProvider(): monaco.IDisposable {
    return monaco.languages.registerCompletionItemProvider('glsl', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range: monaco.IRange = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            // Get standard completions
            const staticCompletions: monaco.languages.CompletionItem[] = allCompletions.map(item => ({
                label: item.label,
                kind: item.kind,
                detail: item.detail,
                documentation: item.documentation,
                insertText: item.insertText || item.label,
                insertTextRules: item.insertTextRules,
                range: range
            }));

            // Get dynamic completions from user code
            const dynamicCompletions = getDynamicCompletions(model, range);

            return { suggestions: [...staticCompletions, ...dynamicCompletions] };
        }
    });
}
