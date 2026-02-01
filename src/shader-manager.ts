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

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ShaderProject } from './types';
import { DEFAULT_SHADER } from './renderers/webgl-renderer';

interface ShaderDB extends DBSchema {
    shaders: {
        key: string;
        value: ShaderProject;
        indexes: { 'by-updated': number };
    };
}

const DB_NAME = 'shadertoy-editor';
const DB_VERSION = 1;

let db: IDBPDatabase<ShaderDB> | null = null;

async function getDB(): Promise<IDBPDatabase<ShaderDB>> {
    if (!db) {
        db = await openDB<ShaderDB>(DB_NAME, DB_VERSION, {
            upgrade(database) {
                const store = database.createObjectStore('shaders', { keyPath: 'id' });
                store.createIndex('by-updated', 'updatedAt');
            }
        });
    }
    return db;
}

export function generateId(): string {
    return `shader_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function createShader(name: string, code?: string): Promise<ShaderProject> {
    const database = await getDB();
    const now = Date.now();

    const shader: ShaderProject = {
        id: generateId(),
        name,
        files: [
            {
                name: 'main.glsl',
                code: code || DEFAULT_SHADER
            }
        ],
        createdAt: now,
        updatedAt: now
    };

    await database.put('shaders', shader);
    return shader;
}

export async function getShader(id: string): Promise<ShaderProject | undefined> {
    const database = await getDB();
    return database.get('shaders', id);
}

export async function updateShader(id: string, updates: Partial<Pick<ShaderProject, 'name'>> & { code?: string }): Promise<void> {
    const database = await getDB();
    const tx = database.transaction('shaders', 'readwrite');
    const store = tx.objectStore('shaders');

    // Use the transaction to get then put
    const shader = await store.get(id);

    if (!shader) {
        throw new Error(`Shader with id ${id} not found`);
    }

    const updated: ShaderProject = {
        ...shader,
        ...updates,
        updatedAt: Date.now()
    };

    // If code is provided, update the main file
    if (updates.code !== undefined) {
        const mainFile = updated.files.find(f => f.name === 'main.glsl');
        if (mainFile) {
            mainFile.code = updates.code;
        }
    }

    await store.put(updated);
    await tx.done;
}

export async function deleteShader(id: string): Promise<void> {
    const database = await getDB();
    await database.delete('shaders', id);
}

export async function getAllShaders(): Promise<ShaderProject[]> {
    const database = await getDB();
    const shaders = await database.getAllFromIndex('shaders', 'by-updated');
    return shaders.reverse(); // Most recent first
}

export function getShaderMainCode(shader: ShaderProject): string {
    const mainFile = shader.files.find(f => f.name === 'main.glsl');
    return mainFile?.code || '';
}

export async function getOrCreateDefaultShader(): Promise<ShaderProject> {
    const shaders = await getAllShaders();

    if (shaders.length === 0) {
        return createShader('Untitled');
    }

    return shaders[0];
}

export function exportShader(shader: ShaderProject): string {
    return JSON.stringify({
        name: shader.name,
        files: shader.files.map(f => ({ name: f.name, code: f.code })),
        exportedAt: new Date().toISOString()
    }, null, 2);
}

export function importShader(json: string): { name: string; code: string } | null {
    try {
        const data = JSON.parse(json);
        if (data.files && Array.isArray(data.files)) {
            // New format with multiple files - find main.glsl or use the first one
            const mainFile = data.files.find((f: any) => f.name === 'main.glsl') || data.files[0];
            return {
                name: data.name || 'Imported Shader',
                code: mainFile.code || ''
            };
        }
        if (typeof data.code === 'string') {
            // Old format with single code field
            return {
                name: data.name || 'Imported Shader',
                code: data.code
            };
        }
    } catch {
        // Try to import as raw GLSL
        if (json.includes('mainImage') || json.includes('void main')) {
            return {
                name: 'Imported Shader',
                code: json
            };
        }
    }
    return null;
}
