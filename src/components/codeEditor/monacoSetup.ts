// ==========================================
// Monaco Editor - Vite Bundler Configuration
// ==========================================
// Configures Monaco workers for Vite compatibility.
// Without this, Monaco workers fail to load, causing infinite "Initializing..."

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// CRITICAL FIX: Configure MonacoEnvironment BEFORE any editor instance is created
// This tells Monaco how to load its web workers in the Vite bundler context
// Without this, the workers try to load from CDN and fail, causing "Initializing..." forever
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    const getWorkerModule = (moduleUrl: string, workerLabel: string) => {
      return new Worker(new URL(moduleUrl, import.meta.url), { 
        name: workerLabel,
        type: 'module' 
      });
    };

    switch (label) {
      case 'json':
        return getWorkerModule('monaco-editor/esm/vs/language/json/json.worker.js', 'json');
      case 'css':
      case 'scss':
      case 'less':
        return getWorkerModule('monaco-editor/esm/vs/language/css/css.worker.js', 'css');
      case 'html':
      case 'handlebars':
      case 'razor':
        return getWorkerModule('monaco-editor/esm/vs/language/html/html.worker.js', 'html');
      case 'typescript':
      case 'javascript':
        return getWorkerModule('monaco-editor/esm/vs/language/typescript/ts.worker.js', 'typescript');
      default:
        return getWorkerModule('monaco-editor/esm/vs/editor/editor.worker.js', 'editor');
    }
  },
};

// CRITICAL FIX: Configure @monaco-editor/react loader to use local Monaco
// instead of CDN. This eliminates the network dependency that causes delays.
loader.config({ monaco });

// Pre-initialize Monaco immediately so it's ready when the editor mounts
// This eliminates the "Initializing..." delay
loader.init().catch(() => {
  // Fallback: Monaco will be initialized on demand
});

export { monaco };