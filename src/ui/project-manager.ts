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

import type { ShaderProject } from '../types';
import { getAllShaders, createShader, updateShader, deleteShader } from '../shader-manager';

export interface ProjectManagerOptions {
    container: HTMLElement;
    onSelect: (shader: ShaderProject) => void;
}

export class ProjectManager {
    private options: ProjectManagerOptions;
    private modal: HTMLElement | null = null;
    private projectList: HTMLElement | null = null;

    constructor(options: ProjectManagerOptions) {
        this.options = options;
        this.createModal();
    }

    private createModal(): void {
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.style.display = 'none';

        this.modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Manage Projects</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <button id="new-project-btn" class="primary-btn">New Project</button>
                    <div class="project-list" id="project-list"></div>
                </div>
            </div>
        `;

        this.projectList = this.modal.querySelector('#project-list');

        // Event Listeners
        this.modal.querySelector('.close-btn')?.addEventListener('click', () => this.hide());
        this.modal.querySelector('#new-project-btn')?.addEventListener('click', () => this.handleCreate());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hide();
        });

        document.body.appendChild(this.modal);
    }

    public show(): void {
        this.refreshList();
        this.modal!.style.display = 'flex';
    }

    public hide(): void {
        this.modal!.style.display = 'none';
    }

    private async refreshList(): Promise<void> {
        if (!this.projectList) return;

        this.projectList.innerHTML = '<div class="loading">Loading...</div>';
        const shaders = await getAllShaders();

        this.projectList.innerHTML = '';

        if (shaders.length === 0) {
            this.projectList.innerHTML = '<div class="empty-state">No projects found. Create one!</div>';
            return;
        }

        for (const shader of shaders) {
            const item = document.createElement('div');
            item.className = 'project-item';

            const info = document.createElement('div');
            info.className = 'project-info';
            info.innerHTML = `
                <div class="project-name">${shader.name}</div>
                <div class="project-date">Updated: ${new Date(shader.updatedAt).toLocaleString()}</div>
            `;

            // Click to select - now on the item itself for better hit area
            item.addEventListener('click', () => {
                try {
                    this.options.onSelect(shader);
                } catch (err) {
                    console.error('Error selecting shader:', err);
                }
                this.hide();
            });

            const actions = document.createElement('div');
            actions.className = 'project-actions';

            const renameBtn = document.createElement('button');
            renameBtn.innerHTML = '✎';
            renameBtn.title = 'Rename';
            renameBtn.onclick = (e) => {
                e.stopPropagation();
                this.handleRename(shader);
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑';
            deleteBtn.title = 'Delete';
            deleteBtn.className = 'danger';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.handleDelete(shader);
            };

            actions.appendChild(renameBtn);
            actions.appendChild(deleteBtn);

            // Prevent clicks on actions container from triggering selection
            actions.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            item.appendChild(info);
            item.appendChild(actions);
            this.projectList.appendChild(item);
        }
    }

    private async handleCreate(): Promise<void> {
        const name = prompt('Enter project name:', 'New Project');
        if (name) {
            const newShader = await createShader(name);
            await this.refreshList();
            this.options.onSelect(newShader); // Auto-select new project
            this.hide();
        }
    }

    private async handleRename(shader: ShaderProject): Promise<void> {
        const newName = prompt('Enter new project name:', shader.name);
        if (newName && newName !== shader.name) {
            await updateShader(shader.id, { name: newName });
            this.refreshList();
            // If this is the active project, we might need to notify main app to update header
            // But main app will update header on select, so we could re-select it?
            // For now, simple list update. Main header update will happen if user re-selects or we add an event.
        }
    }

    private async handleDelete(shader: ShaderProject): Promise<void> {
        if (confirm(`Are you sure you want to delete "${shader.name}"?`)) {
            await deleteShader(shader.id);
            await this.refreshList();
            // If deleted active project, main app needs to handle it. 
            // Currently main app doesn't know. 
            // We'll leave it for now - creating a new project or selecting another will fix state.
        }
    }
}
