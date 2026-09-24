import { initializeShadowRoot } from './inject';
import {
  LocalStorageAnnotationStore,
  LocalStorageGroupStore,
  LocalStoragePromptHistoryStore,
} from './annotationStore';
import {
  IndexedDBAnnotationStore,
  IndexedDBGroupStore,
  IndexedDBPromptHistoryStore,
} from './indexedDbStore';
import { ToggleButton } from './ui/Toggle';
import { ElementPicker } from './elementPicker';
import { Popup } from './ui/Popup';
import { Sidebar } from './ui/Sidebar';
import { PinManager } from './ui/PinManager';
import { CommandPalette, PaletteCommand } from './ui/CommandPalette';
import { mapElementToSource } from './sourceMapper';
import {
  compileToMarkdown,
  compileToJSON,
  compileToPlainText,
  downloadFile,
  copyToClipboard,
} from './promptCompiler';
import { loadProjectConfig } from './projectConfig';
import { captureElementScreenshot, downloadScreenshot } from './screenshotCapture';
import {
  Annotation,
  SourceMappingResult,
  AnnotationStore,
  GroupStore,
  PromptHistoryStore,
} from './types';

function isLocalhost(): boolean {
  const hn = window.location.hostname;
  return hn === 'localhost' || hn === '127.0.0.1' || hn === '[::1]' || hn === '';
}

function hasDevAttribute(): boolean {
  const script = document.querySelector('script[data-annoty-mode="dev"]');
  if (script) return true;

  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].getAttribute('data-annoty-mode') === 'dev') {
      return true;
    }
  }
  return false;
}

async function init() {
  // Security guard check: dev mode or localhost only
  if (!isLocalhost() && !hasDevAttribute()) {
    console.warn(
      '[Annoty] Refusing to activate: Page is not served from localhost/127.0.0.1 and script tag is missing data-annoty-mode="dev". This guard prevents loading Annoty in production environments.'
    );
    return;
  }

  console.log('[Annoty] Initializing 100% on-device developer overlay...');

  // 0. Load optional local project config (/annoty.config.json)
  const projectConfig = await loadProjectConfig();
  console.log('[Annoty] Project config loaded:', projectConfig.framework);

  // 1. Initialize 100% local stores (IndexedDB with LocalStorage fallback)
  let store: AnnotationStore;
  let groupStore: GroupStore;
  let historyStore: PromptHistoryStore;

  try {
    store = new IndexedDBAnnotationStore();
    groupStore = new IndexedDBGroupStore();
    historyStore = new IndexedDBPromptHistoryStore();
  } catch (e) {
    console.warn('[Annoty] IndexedDB unavailable, falling back to LocalStorage:', e);
    store = new LocalStorageAnnotationStore();
    groupStore = new LocalStorageGroupStore();
    historyStore = new LocalStoragePromptHistoryStore();
  }

  // 2. Initialize Shadow DOM root
  const shadowRoot = await initializeShadowRoot();

  // 3. Initialize components
  let toggle: ToggleButton;
  let picker: ElementPicker;
  let popup: Popup;
  let sidebar: Sidebar;
  let pinManager: PinManager;
  let palette: CommandPalette;

  let currentActiveGroupId = 'default';

  // Handle edit requests originating from the Sidebar list or visual pins
  const handleEditAnnotation = (anno: Annotation) => {
    let el: HTMLElement | null = null;
    try {
      if (anno.selector) {
        el = document.querySelector(anno.selector) as HTMLElement | null;
      }
    } catch {
      // Ignored
    }

    const mappingResult: SourceMappingResult = {
      sourceTier: anno.sourceTier,
      selector: anno.selector,
      elementSnapshot: anno.elementSnapshot,
      textPreview: anno.textPreview,
      filePath: anno.filePath,
      lineNumber: anno.lineNumber,
      columnNumber: anno.columnNumber,
      componentName: anno.componentName,
      landmarkContext: anno.landmarkContext,
    };

    toggle.setActive(false);
    picker.deactivate();
    popup.open(el, mappingResult, anno, currentActiveGroupId);
  };

  // Re-target element from DOM breadcrumb click
  const handleRetarget = (newEl: HTMLElement) => {
    const newMapping = mapElementToSource(newEl);
    picker.highlightElement(newEl);
    popup.open(newEl, newMapping, undefined, currentActiveGroupId);
  };

  // Initialize visual pin manager
  pinManager = new PinManager(shadowRoot, (anno) => {
    handleEditAnnotation(anno);
  });

  const syncPins = async () => {
    try {
      const all = await store.list();
      pinManager.setAnnotations(all);
    } catch (e) {
      console.error('[Annoty] Error syncing pins:', e);
    }
  };
  store.subscribe(syncPins);
  syncPins();

  sidebar = new Sidebar(shadowRoot, store, groupStore, historyStore, handleEditAnnotation);

  popup = new Popup(
    shadowRoot,
    store,
    () => {
      picker.clearHighlight();
      sidebar.toggle(true);
    },
    handleRetarget
  );

  picker = new ElementPicker(shadowRoot, async (el, mappingResult) => {
    toggle.setActive(false);
    picker.deactivate();
    sidebar.toggle(false);

    try {
      const activeGroup = await groupStore.getActive();
      if (activeGroup) {
        currentActiveGroupId = activeGroup.id;
      }
    } catch (e) {
      console.error('[Annoty] Failed to get active group:', e);
    }

    try {
      popup.open(el, mappingResult, undefined, currentActiveGroupId);
    } catch (e) {
      console.error('[Annoty] Failed to open popup dialog:', e);
    }
  });

  toggle = new ToggleButton(
    shadowRoot,
    store,
    (active) => {
      if (active) {
        picker.activate();
        popup.close();
        sidebar.toggle(false);
      } else {
        picker.deactivate();
      }
    },
    () => {
      sidebar.toggle();
    }
  );

  // Command Palette actions
  const commands: PaletteCommand[] = [
    {
      id: 'inspect-element',
      title: 'Inspect / Annotate Element',
      category: 'Inspection',
      shortcut: 'I / A',
      action: () => toggle.toggleActiveState(),
    },
    {
      id: 'toggle-pins',
      title: 'Toggle Visual Pins',
      category: 'Display',
      shortcut: 'P',
      action: () => pinManager.toggleVisibility(),
    },
    {
      id: 'toggle-sidebar',
      title: 'Toggle Annotations Sidebar',
      category: 'Sidebar',
      shortcut: 'Alt + S',
      action: () => sidebar.toggle(),
    },
    {
      id: 'capture-page-screenshot',
      title: 'Capture Element / Page Screenshot',
      category: 'Screenshot',
      shortcut: 'S',
      action: async () => {
        const root = document.body;
        const dataUrl = await captureElementScreenshot(root);
        if (dataUrl) {
          downloadScreenshot(dataUrl, `annoty-screen-${Date.now()}.png`);
        }
      },
    },
    {
      id: 'copy-markdown',
      title: 'Copy Context Prompt (Markdown)',
      category: 'Export',
      shortcut: 'C',
      action: async () => {
        const annotations = await store.list();
        const md = compileToMarkdown(annotations);
        const ok = await copyToClipboard(md);
        if (ok) alert('Context prompt copied to clipboard (Markdown)!');
      },
    },
    {
      id: 'copy-json',
      title: 'Copy Annotations as JSON',
      category: 'Export',
      action: async () => {
        const annotations = await store.list();
        const json = compileToJSON(annotations);
        const ok = await copyToClipboard(json);
        if (ok) alert('Annotations copied to clipboard as JSON!');
      },
    },
    {
      id: 'copy-plain',
      title: 'Copy Annotations (Plain Text)',
      category: 'Export',
      action: async () => {
        const annotations = await store.list();
        const txt = compileToPlainText(annotations);
        const ok = await copyToClipboard(txt);
        if (ok) alert('Annotations copied as plain text!');
      },
    },
    {
      id: 'download-md',
      title: 'Download Annotations (.md file)',
      category: 'Download',
      action: async () => {
        const annotations = await store.list();
        const md = compileToMarkdown(annotations);
        downloadFile(md, `annoty-context-${new Date().toISOString().slice(0, 10)}.md`, 'text/markdown');
      },
    },
    {
      id: 'download-json',
      title: 'Download Annotations (.json file)',
      category: 'Download',
      action: async () => {
        const annotations = await store.list();
        const json = compileToJSON(annotations);
        downloadFile(json, `annoty-annotations-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
      },
    },
    {
      id: 'download-text',
      title: 'Download Annotations (.txt file)',
      category: 'Download',
      action: async () => {
        const annotations = await store.list();
        const txt = compileToPlainText(annotations);
        downloadFile(txt, `annoty-context-${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain');
      },
    },
    {
      id: 'clear-baselines',
      title: 'Clear Stored Style Baselines',
      category: 'Diff Engine',
      action: () => {
        localStorage.removeItem('annoty:style-baselines');
        alert('All stored style diff baselines cleared.');
      },
    },
    {
      id: 'clear-all',
      title: 'Clear All Current Annotations',
      category: 'Workspace',
      action: async () => {
        if (confirm('Clear all annotations? This action cannot be undone.')) {
          await store.clear();
        }
      },
    },
  ];

  palette = new CommandPalette(shadowRoot, commands);

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement | null;
    const isTyping =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.getAttribute('contenteditable') === 'true');

    // Ctrl + K or Cmd + K: Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.toggle();
      return;
    }

    // Escape: close popup or palette or deactivate picker
    if (e.key === 'Escape') {
      palette.close();
      popup.close();
      picker.deactivate();
      toggle.setActive(false);
      return;
    }

    // Single-key shortcuts (only when not typing in an input field)
    if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggle.toggleActiveState();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        pinManager.toggleVisibility();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        const root = document.body;
        captureElementScreenshot(root).then((dataUrl) => {
          if (dataUrl) downloadScreenshot(dataUrl, `annoty-screen-${Date.now()}.png`);
        });
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        store.list().then((annos) => {
          const md = compileToMarkdown(annos);
          copyToClipboard(md).then((ok) => {
            if (ok) console.log('[Annoty] Copied Markdown prompt to clipboard');
          });
        });
      }
    }

    // Alt + A (Toggle picker), Alt + S (Toggle sidebar)
    if (e.altKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      toggle.toggleActiveState();
    }
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      sidebar.toggle();
    }
  });

  // Global debug hook
  (window as any).__Annoty__ = {
    store,
    groupStore,
    historyStore,
    projectConfig,
    toggle,
    picker,
    popup,
    sidebar,
    pinManager,
    palette,
    shadowRoot,
  };
}

init().catch((err) => {
  console.error('[Annoty] Failed to initialize overlay:', err);
});
