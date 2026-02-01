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

import { describe, it, expect } from 'vitest';
import {
    generateId,
    createShader,
    getShader,
    updateShader,
    deleteShader,
    getAllShaders,
    getShaderMainCode,
    getOrCreateDefaultShader,
    exportShader,
    importShader
} from './shader-manager';

describe('Shader Manager - Data Format Consistency', () => {

    describe('ID Generation', () => {
        it('should generate unique IDs with correct format', () => {
            const id1 = generateId();
            const id2 = generateId();

            expect(id1).toMatch(/^shader_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^shader_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });

        it('should have timestamp component in ID', () => {
            const before = Date.now();
            const id = generateId();
            const after = Date.now();

            const match = id.match(/^shader_(\d+)_/);
            expect(match).toBeTruthy();
            const timestamp = parseInt(match![1], 10);
            expect(timestamp).toBeGreaterThanOrEqual(before);
            expect(timestamp).toBeLessThanOrEqual(after);
        });
    });

    describe('createShader - Data Format', () => {
        it('should create shader with all required fields', async () => {
            const shader = await createShader('Test Shader');

            expect(shader).toHaveProperty('id');
            expect(shader).toHaveProperty('name');
            expect(shader).toHaveProperty('files');
            expect(shader).toHaveProperty('createdAt');
            expect(shader).toHaveProperty('updatedAt');
        });

        it('should validate ID format', async () => {
            const shader = await createShader('Test Shader');
            expect(shader.id).toMatch(/^shader_\d+_[a-z0-9]+$/);
        });

        it('should have correct name field', async () => {
            const shader = await createShader('My Test Shader');
            expect(shader.name).toBe('My Test Shader');
            expect(typeof shader.name).toBe('string');
        });

        it('should initialize files array with main.glsl', async () => {
            const shader = await createShader('Test Shader');

            expect(Array.isArray(shader.files)).toBe(true);
            expect(shader.files.length).toBeGreaterThan(0);

            const mainFile = shader.files.find(f => f.name === 'main.glsl');
            expect(mainFile).toBeDefined();
            expect(mainFile!.name).toBe('main.glsl');
            expect(typeof mainFile!.code).toBe('string');
        });

        it('should accept custom code', async () => {
            const customCode = 'void mainImage(out vec4 fragColor, in vec2 fragCoord) { fragColor = vec4(1.0); }';
            const shader = await createShader('Test Shader', customCode);

            const mainFile = shader.files.find(f => f.name === 'main.glsl');
            expect(mainFile!.code).toBe(customCode);
        });

        it('should use default shader when code not provided', async () => {
            const shader = await createShader('Test Shader');
            const mainFile = shader.files.find(f => f.name === 'main.glsl');

            expect(mainFile!.code.length).toBeGreaterThan(0);
            expect(mainFile!.code).toContain('mainImage');
        });

        it('should have valid timestamps', async () => {
            const before = Date.now();
            const shader = await createShader('Test Shader');
            const after = Date.now();

            expect(typeof shader.createdAt).toBe('number');
            expect(typeof shader.updatedAt).toBe('number');
            expect(shader.createdAt).toBeGreaterThanOrEqual(before);
            expect(shader.createdAt).toBeLessThanOrEqual(after);
            expect(shader.updatedAt).toBe(shader.createdAt);
        });

        it('should equal createdAt and updatedAt on creation', async () => {
            const shader = await createShader('Test Shader');
            expect(shader.createdAt).toBe(shader.updatedAt);
        });
    });

    describe('getShader - Data Retrieval', () => {
        it('should retrieve shader by ID with complete data', async () => {
            const created = await createShader('Test Shader', 'vec4 test;');
            const retrieved = await getShader(created.id);

            expect(retrieved).toBeDefined();
            expect(retrieved!.id).toBe(created.id);
            expect(retrieved!.name).toBe(created.name);
            expect(retrieved!.createdAt).toBe(created.createdAt);
            expect(retrieved!.updatedAt).toBe(created.updatedAt);
        });

        it('should return undefined for non-existent ID', async () => {
            const result = await getShader('shader_nonexistent');
            expect(result).toBeUndefined();
        });

        it('should maintain files array structure on retrieval', async () => {
            const shader = await createShader('Test Shader');
            const retrieved = await getShader(shader.id);

            expect(Array.isArray(retrieved!.files)).toBe(true);
            expect(retrieved!.files.every(f => typeof f.name === 'string' && typeof f.code === 'string')).toBe(true);
        });
    });

    describe('updateShader - Data Consistency', () => {
        it('should update name while preserving other fields', async () => {
            const created = await createShader('Original Name', 'void test() {}');
            const originalCreatedAt = created.createdAt;

            await updateShader(created.id, { name: 'Updated Name' });
            const updated = await getShader(created.id);

            expect(updated!.name).toBe('Updated Name');
            expect(updated!.createdAt).toBe(originalCreatedAt);
            expect(updated!.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);
        });

        it('should update code in main.glsl file', async () => {
            const created = await createShader('Test', 'void original() {}');
            const newCode = 'void updated() {}';

            await updateShader(created.id, { code: newCode });
            const updated = await getShader(created.id);

            const mainFile = updated!.files.find(f => f.name === 'main.glsl');
            expect(mainFile!.code).toBe(newCode);
        });

        it('should update updatedAt timestamp on changes', async () => {
            const created = await createShader('Test');
            const originalUpdatedAt = created.updatedAt;

            // Wait a bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));
            await updateShader(created.id, { name: 'Updated' });

            const updated = await getShader(created.id);
            expect(updated!.updatedAt).toBeGreaterThan(originalUpdatedAt);
        });

        it('should update both name and code together', async () => {
            const created = await createShader('Original', 'void test() {}');

            await updateShader(created.id, { name: 'New Name', code: 'void newTest() {}' });
            const updated = await getShader(created.id);

            expect(updated!.name).toBe('New Name');
            const mainFile = updated!.files.find(f => f.name === 'main.glsl');
            expect(mainFile!.code).toBe('void newTest() {}');
        });

        it('should throw error when updating non-existent shader', async () => {
            await expect(updateShader('nonexistent', { name: 'Test' })).rejects.toThrow();
        });

        it('should maintain file array structure after update', async () => {
            const created = await createShader('Test');
            await updateShader(created.id, { code: 'updated code' });
            const updated = await getShader(created.id);

            expect(Array.isArray(updated!.files)).toBe(true);
            expect(updated!.files.length).toBeGreaterThan(0);
            expect(updated!.files.every(f => f.name && typeof f.code === 'string')).toBe(true);
        });
    });

    describe('deleteShader - Data Removal', () => {
        it('should delete shader from database', async () => {
            const shader = await createShader('To Delete');
            expect(await getShader(shader.id)).toBeDefined();

            await deleteShader(shader.id);
            expect(await getShader(shader.id)).toBeUndefined();
        });

        it('should not affect other shaders', async () => {
            const s1 = await createShader('Shader 1');
            const s2 = await createShader('Shader 2');

            await deleteShader(s1.id);

            expect(await getShader(s1.id)).toBeUndefined();
            expect(await getShader(s2.id)).toBeDefined();
        });
    });

    describe('getShaderMainCode - Code Extraction', () => {
        it('should extract main.glsl code from shader', async () => {
            const code = 'void mainImage(out vec4 fragColor, in vec2 fragCoord) {}';
            const shader = await createShader('Test', code);

            const extracted = getShaderMainCode(shader);
            expect(extracted).toBe(code);
        });

        it('should return empty string if main.glsl not found', async () => {
            const shader = await createShader('Test');
            // Manually remove main.glsl
            shader.files = [];

            const extracted = getShaderMainCode(shader);
            expect(extracted).toBe('');
        });

        it('should handle shader with multiple files', async () => {
            const shader = await createShader('Test', 'main code');
            // Add another file
            shader.files.push({ name: 'helper.glsl', code: 'helper code' });

            const extracted = getShaderMainCode(shader);
            expect(extracted).toBe('main code');
        });
    });

    describe('getOrCreateDefaultShader - Default Initialization', () => {
        it('should return shader with valid data format', async () => {
            const shader = await getOrCreateDefaultShader();

            expect(typeof shader.id).toBe('string');
            expect(typeof shader.name).toBe('string');
            expect(Array.isArray(shader.files)).toBe(true);
            expect(typeof shader.createdAt).toBe('number');
            expect(typeof shader.updatedAt).toBe('number');
        });

        it('should have main.glsl in files', async () => {
            const shader = await getOrCreateDefaultShader();
            const hasMainGlsl = shader.files.some(f => f.name === 'main.glsl');
            expect(hasMainGlsl).toBe(true);
        });

        it('should have valid ID format', async () => {
            const shader = await getOrCreateDefaultShader();
            expect(shader.id).toMatch(/^shader_\d+_[a-z0-9]+$/);
        });
    });

    describe('exportShader - Export Format', () => {
        it('should export shader as valid JSON', async () => {
            const shader = await createShader('Export Test', 'export code');
            const exported = exportShader(shader);

            expect(() => JSON.parse(exported)).not.toThrow();
        });

        it('should include name in export', async () => {
            const shader = await createShader('Export Test');
            const exported = JSON.parse(exportShader(shader));

            expect(exported.name).toBe('Export Test');
        });

        it('should include files in export', async () => {
            const shader = await createShader('Export Test', 'test code');
            const exported = JSON.parse(exportShader(shader));

            expect(Array.isArray(exported.files)).toBe(true);
            expect(exported.files.length).toBeGreaterThan(0);
            expect(exported.files[0]).toHaveProperty('name');
            expect(exported.files[0]).toHaveProperty('code');
        });

        it('should include export timestamp', async () => {
            const shader = await createShader('Export Test');
            const exported = JSON.parse(exportShader(shader));

            expect(exported).toHaveProperty('exportedAt');
            expect(typeof exported.exportedAt).toBe('string');
        });

        it('should not include creation/update timestamps in export', async () => {
            const shader = await createShader('Export Test');
            const exported = JSON.parse(exportShader(shader));

            expect(exported).not.toHaveProperty('createdAt');
            expect(exported).not.toHaveProperty('updatedAt');
            expect(exported).not.toHaveProperty('id');
        });
    });

    describe('importShader - Import Format Compatibility', () => {
        it('should import new format with files array', async () => {
            const data = {
                name: 'Imported Shader',
                files: [
                    { name: 'main.glsl', code: 'import code' },
                    { name: 'helper.glsl', code: 'helper' }
                ],
                exportedAt: new Date().toISOString()
            };
            const json = JSON.stringify(data);

            const result = importShader(json);
            expect(result).not.toBeNull();
            expect(result!.name).toBe('Imported Shader');
            expect(result!.code).toBe('import code');
        });

        it('should import old format with single code field', async () => {
            const data = {
                name: 'Old Format Shader',
                code: 'old format code'
            };
            const json = JSON.stringify(data);

            const result = importShader(json);
            expect(result).not.toBeNull();
            expect(result!.name).toBe('Old Format Shader');
            expect(result!.code).toBe('old format code');
        });

        it('should import raw GLSL code', async () => {
            const glslCode = 'void mainImage(out vec4 fragColor, in vec2 fragCoord) { fragColor = vec4(1.0); }';

            const result = importShader(glslCode);
            expect(result).not.toBeNull();
            expect(result!.code).toBe(glslCode);
            expect(result!.name).toBe('Imported Shader');
        });

        it('should handle missing file names in new format', async () => {
            const data = {
                name: 'Test',
                files: [{ code: 'some code' }]
            };
            const json = JSON.stringify(data);

            const result = importShader(json);
            expect(result).not.toBeNull();
            expect(result!.code).toBe('some code');
        });

        it('should handle files array with main.glsl first', async () => {
            const data = {
                name: 'Test',
                files: [
                    { name: 'helper.glsl', code: 'helper' },
                    { name: 'main.glsl', code: 'main code' }
                ]
            };
            const json = JSON.stringify(data);

            const result = importShader(json);
            expect(result!.code).toBe('main code');
        });

        it('should return null for invalid JSON', async () => {
            const result = importShader('not valid json at all {');
            expect(result).toBeNull();
        });

        it('should return null for invalid GLSL without markers', async () => {
            const result = importShader('{ invalid: "data" }');
            expect(result).toBeNull();
        });
    });

    describe('Export/Import Roundtrip - Data Consistency', () => {
        it('should preserve name through export/import cycle', async () => {
            const original = await createShader('Roundtrip Test');
            const exported = exportShader(original);
            const imported = importShader(exported);

            expect(imported!.name).toBe(original.name);
        });

        it('should preserve code through export/import cycle', async () => {
            const code = 'void mainImage(out vec4 fragColor, in vec2 fragCoord) { fragColor = vec4(1.0); }';
            const original = await createShader('Roundtrip Test', code);
            const exported = exportShader(original);
            const imported = importShader(exported);

            expect(imported!.code).toBe(code);
        });

        it('should handle complex shader code in roundtrip', async () => {
            const complexCode = `
                // Complex shader
                void mainImage(out vec4 fragColor, in vec2 fragCoord) {
                    vec2 uv = fragCoord / iResolution.xy;
                    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));
                    fragColor = vec4(col, 1.0);
                }
            `;
            const original = await createShader('Complex', complexCode);
            const exported = exportShader(original);
            const imported = importShader(exported);

            expect(imported!.code).toBe(complexCode);
        });

        it('should maintain all files in roundtrip export', async () => {
            const original = await createShader('Multi-file', 'main code');
            const exported = JSON.parse(exportShader(original));

            expect(Array.isArray(exported.files)).toBe(true);
            expect(exported.files.every((f: any) => f.name && f.code !== undefined)).toBe(true);
        });
    });

    describe('Data Format Edge Cases', () => {
        it('should handle shader names with special characters', async () => {
            const specialName = "Shader with !@#$%^&*() \"quotes\" and 'apostrophes'";
            const shader = await createShader(specialName);
            const retrieved = await getShader(shader.id);

            expect(retrieved!.name).toBe(specialName);
        });

        it('should handle empty code string', async () => {
            // Note: createShader treats empty code as falsy and uses DEFAULT_SHADER instead
            const shader = await createShader('Empty Code', '');
            const retrieved = await getShader(shader.id);

            const mainFile = retrieved!.files.find(f => f.name === 'main.glsl');
            // Empty code is treated as falsy, so DEFAULT_SHADER is used
            expect(mainFile!.code.length).toBeGreaterThan(0);
            expect(mainFile!.code).toContain('mainImage');
        });

        it('should handle very long shader code', async () => {
            const longCode = 'void mainImage(out vec4 fragColor, in vec2 fragCoord) { ' + 'x'.repeat(10000) + ' }';
            const shader = await createShader('Long Code', longCode);
            const retrieved = await getShader(shader.id);

            const mainFile = retrieved!.files.find(f => f.name === 'main.glsl');
            expect(mainFile!.code).toBe(longCode);
        });

        it('should handle unicode in shader names and code', async () => {
            const unicodeName = 'シェーダー 🎨 着色器';
            const unicodeCode = 'vec3 color = vec3(1.0); // Unicode test';
            const shader = await createShader(unicodeName, unicodeCode);
            const retrieved = await getShader(shader.id);

            expect(retrieved!.name).toBe(unicodeName);
            const mainFile = retrieved!.files.find(f => f.name === 'main.glsl');
            expect(mainFile!.code).toBe(unicodeCode);
        });
    });

    describe('Data Ordering and Consistency - getAllShaders', () => {
        it('should return array of shaders with valid format', async () => {
            const s1 = await createShader('Shader 1');
            const s2 = await createShader('Shader 2');

            const shaders = await getAllShaders();
            expect(Array.isArray(shaders)).toBe(true);

            shaders.forEach(shader => {
                expect(shader).toHaveProperty('id');
                expect(shader).toHaveProperty('name');
                expect(shader).toHaveProperty('files');
                expect(shader).toHaveProperty('createdAt');
                expect(shader).toHaveProperty('updatedAt');

                expect(typeof shader.id).toBe('string');
                expect(typeof shader.name).toBe('string');
                expect(Array.isArray(shader.files)).toBe(true);
                expect(typeof shader.createdAt).toBe('number');
                expect(typeof shader.updatedAt).toBe('number');
            });

            await deleteShader(s1.id);
            await deleteShader(s2.id);
        });
    });
});
