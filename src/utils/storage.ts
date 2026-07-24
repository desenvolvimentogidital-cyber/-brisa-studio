import { TEMPLATE_PROJECTS } from '../constants/templates';
import { Project } from '../types';

const STORAGE_KEY = 'aistudio_mobile_builder_project_v1';
const SAVED_PROJECTS_KEY = 'aistudio_mobile_builder_saved_projects';

export interface SavedProjectMeta {
  id: string;
  name: string;
  updatedAt: string;
  screenCount: number;
}

export function loadSavedProject(): Project {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      if (parsed && parsed.screens && parsed.screens.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved project from localStorage:', e);
  }

  // Default initial project is E-Commerce template
  return TEMPLATE_PROJECTS[0].project;
}

export function saveProjectToStorage(project: Project): void {
  try {
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save project to localStorage:', e);
  }
}

export function downloadProjectJson(project: Project): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_project.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject('Clipboard API not available');
}

/**
 * Delete the current project from localStorage
 * and reset to the default template
 */
export function deleteProjectFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Storage] Projeto excluído da storage');
  } catch (e) {
    console.error('[Storage] Erro ao excluir projeto:', e);
  }
}

/**
 * Get all saved projects from localStorage
 */
export function getSavedProjects(): SavedProjectMeta[] {
  try {
    const stored = localStorage.getItem(SAVED_PROJECTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return [];
}

/**
 * Save project metadata to the saved projects list
 */
export function saveProjectToList(project: Project): void {
  try {
    const projects = getSavedProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    const meta: SavedProjectMeta = {
      id: project.id,
      name: project.name,
      updatedAt: project.updatedAt || new Date().toISOString(),
      screenCount: project.screens.length,
    };
    if (existingIndex >= 0) {
      projects[existingIndex] = meta;
    } else {
      projects.unshift(meta);
    }
    // Keep only last 20 projects
    const trimmed = projects.slice(0, 20);
    localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('[Storage] Erro ao salvar projeto na lista:', e);
  }
}
