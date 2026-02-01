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

// GLSL language definition for Monaco Editor using Monarch tokenizer
export const glslLanguageDefinition: monaco.languages.IMonarchLanguage = {
    defaultToken: '',
    tokenPostfix: '.glsl',

    keywords: [
        'attribute', 'const', 'uniform', 'varying', 'buffer', 'shared', 'coherent',
        'volatile', 'restrict', 'readonly', 'writeonly', 'layout', 'centroid', 'flat',
        'smooth', 'noperspective', 'patch', 'sample', 'break', 'continue', 'do', 'for',
        'while', 'switch', 'case', 'default', 'if', 'else', 'subroutine', 'in', 'out',
        'inout', 'true', 'false', 'invariant', 'precise', 'discard', 'return', 'struct',
        'precision', 'highp', 'mediump', 'lowp'
    ],

    typeKeywords: [
        'void', 'bool', 'int', 'uint', 'float', 'double',
        'vec2', 'vec3', 'vec4', 'dvec2', 'dvec3', 'dvec4',
        'bvec2', 'bvec3', 'bvec4', 'ivec2', 'ivec3', 'ivec4', 'uvec2', 'uvec3', 'uvec4',
        'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4',
        'mat4x2', 'mat4x3', 'mat4x4', 'dmat2', 'dmat3', 'dmat4',
        'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube', 'sampler1DShadow',
        'sampler2DShadow', 'samplerCubeShadow', 'sampler1DArray', 'sampler2DArray',
        'sampler1DArrayShadow', 'sampler2DArrayShadow', 'isampler1D', 'isampler2D',
        'isampler3D', 'isamplerCube', 'isampler1DArray', 'isampler2DArray',
        'usampler1D', 'usampler2D', 'usampler3D', 'usamplerCube', 'usampler1DArray',
        'usampler2DArray', 'sampler2DRect', 'sampler2DRectShadow', 'isampler2DRect',
        'usampler2DRect', 'samplerBuffer', 'isamplerBuffer', 'usamplerBuffer',
        'sampler2DMS', 'isampler2DMS', 'usampler2DMS', 'sampler2DMSArray',
        'isampler2DMSArray', 'usampler2DMSArray', 'samplerCubeArray',
        'samplerCubeArrayShadow', 'isamplerCubeArray', 'usamplerCubeArray',
        'image1D', 'iimage1D', 'uimage1D', 'image2D', 'iimage2D', 'uimage2D',
        'image3D', 'iimage3D', 'uimage3D', 'image2DRect', 'iimage2DRect', 'uimage2DRect',
        'imageCube', 'iimageCube', 'uimageCube', 'imageBuffer', 'iimageBuffer',
        'uimageBuffer', 'image1DArray', 'iimage1DArray', 'uimage1DArray',
        'image2DArray', 'iimage2DArray', 'uimage2DArray', 'imageCubeArray',
        'iimageCubeArray', 'uimageCubeArray', 'image2DMS', 'iimage2DMS', 'uimage2DMS',
        'image2DMSArray', 'iimage2DMSArray', 'uimage2DMSArray'
    ],

    builtinVariables: [
        // Shadertoy uniforms
        'iResolution', 'iTime', 'iTimeDelta', 'iFrame', 'iFrameRate',
        'iMouse', 'iDate', 'iSampleRate',
        'iChannel0', 'iChannel1', 'iChannel2', 'iChannel3',
        'iChannelResolution', 'iChannelTime',
        // GLSL built-ins
        'gl_FragCoord', 'gl_FrontFacing', 'gl_PointCoord', 'gl_FragDepth',
        'gl_Position', 'gl_PointSize', 'gl_ClipDistance', 'gl_VertexID',
        'gl_InstanceID', 'gl_PrimitiveID', 'gl_Layer', 'gl_ViewportIndex'
    ],

    builtinFunctions: [
        // Angle and Trigonometry
        'radians', 'degrees', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
        // Exponential
        'pow', 'exp', 'log', 'exp2', 'log2', 'sqrt', 'inversesqrt',
        // Common
        'abs', 'sign', 'floor', 'trunc', 'round', 'roundEven', 'ceil', 'fract', 'mod', 'modf', 'min', 'max', 'clamp', 'mix', 'step', 'smoothstep', 'isnan', 'isinf', 'floatBitsToInt', 'floatBitsToUint', 'intBitsToFloat', 'uintBitsToFloat', 'fma', 'frexp', 'ldexp',
        // Geometric
        'length', 'distance', 'dot', 'cross', 'normalize', 'faceforward', 'reflect', 'refract',
        // Matrix
        'matrixCompMult', 'outerProduct', 'transpose', 'determinant', 'inverse',
        // Vector Relational
        'lessThan', 'lessThanEqual', 'greaterThan', 'greaterThanEqual', 'equal', 'notEqual', 'any', 'all', 'not',
        // Texture
        'texture', 'textureProj', 'textureLod', 'textureOffset', 'texelFetch', 'texelFetchOffset', 'textureProjOffset', 'textureLodOffset', 'textureProjLod', 'textureProjLodOffset', 'textureGrad', 'textureGradOffset', 'textureProjGrad', 'textureProjGradOffset', 'textureGather', 'textureGatherOffset', 'textureGatherOffsets', 'textureSize', 'textureQueryLod', 'textureQueryLevels', 'textureSamples',
        // Fragment Processing
        'dFdx', 'dFdy', 'dFdxFine', 'dFdyFine', 'dFdxCoarse', 'dFdyCoarse', 'fwidth', 'fwidthFine', 'fwidthCoarse',
        // Noise (deprecated but commonly used)
        'noise1', 'noise2', 'noise3', 'noise4',
        // Shadertoy main function
        'mainImage'
    ],

    operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=', '%=',
        '<<=', '>>='
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
        root: [
            // Preprocessor directives
            [/#\s*\w+/, 'keyword.preprocessor'],

            // Identifiers and keywords
            [/[a-zA-Z_]\w*/, {
                cases: {
                    '@keywords': 'keyword',
                    '@typeKeywords': 'type',
                    '@builtinVariables': 'variable.predefined',
                    '@builtinFunctions': 'support.function',
                    '@default': 'identifier'
                }
            }],

            // Whitespace
            { include: '@whitespace' },

            // Delimiters and operators
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, {
                cases: {
                    '@operators': 'operator',
                    '@default': ''
                }
            }],

            // Numbers
            [/\d*\.\d+([eE][\-+]?\d+)?[fF]?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+[uU]?/, 'number.hex'],
            [/\d+[uU]?/, 'number'],

            // Delimiter
            [/[;,.]/, 'delimiter'],
        ],

        comment: [
            [/[^\/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
        ],
    }
};

// Register GLSL language
export function registerGLSLLanguage(): void {
    monaco.languages.register({ id: 'glsl' });
    monaco.languages.setMonarchTokensProvider('glsl', glslLanguageDefinition);
    monaco.languages.setLanguageConfiguration('glsl', {
        comments: {
            lineComment: '//',
            blockComment: ['/*', '*/']
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ]
    });
}
