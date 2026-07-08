import { initializeShadowRoot } from './inject';
import {
  LocalStorageAnnotationStore,
  LocalStorageGroupStore,
  LocalStoragePromptHistoryStore
} from './annotationStore';
import {
  SupabaseStoreManager,
  CloudAnnotationStore,
  CloudGroupStore,
  CloudPromptHistoryStore
} from './supabaseStore';
import { ToggleButton } from './ui/Toggle';
import { ElementPicker } from './elementPicker';
import { Popup } from './ui/Popup';
import { Sidebar } from './ui/Sidebar';
import { Annotation, SourceMappingResult, AnnotationStore, GroupStore, PromptHistoryStore } from './types';

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

function getSyncToken(): string | null {
  const script = document.querySelector('script[data-annoty-token]');
  if (script) {
    const token = script.getAttribute('data-annoty-token');
    if (token) return token;
  }

  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const token = scripts[i].getAttribute('data-annoty-token');
    if (token) return token;
  }

  return null;
}

async function init() {
  // Security guard check
  if (!isLocalhost() && !hasDevAttribute()) {
    console.warn(
      '[Annoty] Refusing to activate: Page is not served from localhost/127.0.0.1 and script tag is missing data-annoty-mode="dev". This guard prevents loading Annoty in production environments.'
    );
    return;
  }

  console.log('[Annoty] Initializing developer overlay components...');
  
  // 1. Initialize stores
  let store: AnnotationStore;
  let groupStore: GroupStore;
  let historyStore: PromptHistoryStore;

  const token = getSyncToken();
  if (token) {
    try {
      const decoded = JSON.parse(atob(token));
      
      // Check if JWT is expired before initializing cloud sync
      if (decoded.jwt) {
        const parts = decoded.jwt.split('.');
        if (parts.length === 3) {
          let payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const pad = payloadBase64.length % 4;
          if (pad === 2) payloadBase64 += '==';
          else if (pad === 3) payloadBase64 += '=';
          const payload = JSON.parse(atob(payloadBase64));
          if (payload && typeof payload.exp === 'number') {
            if (Date.now() / 1000 > payload.exp) {
              throw new Error('Sync token has expired');
            }
          }
        }
      }

      console.log('[Annoty] Cloud sync token detected. Initializing cloud sync...');
      const manager = new SupabaseStoreManager(decoded);

      await manager.initialize();
      store = new CloudAnnotationStore(manager);
      groupStore = new CloudGroupStore(manager);
      historyStore = new CloudPromptHistoryStore(manager);
    } catch (e) {
      console.warn('[Annoty] Cloud sync token is invalid or expired. Falling back to LocalStorage:', e);
      store = new LocalStorageAnnotationStore();
      groupStore = new LocalStorageGroupStore();
      historyStore = new LocalStoragePromptHistoryStore();
    }
  } else {
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

  // Handle edit requests originating from the Sidebar list
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
      landmarkContext: anno.landmarkContext
    };

    toggle.setActive(false);
    picker.deactivate();
    popup.open(el, mappingResult, anno);
  };

  sidebar = new Sidebar(shadowRoot, store, groupStore, historyStore, handleEditAnnotation);

  popup = new Popup(shadowRoot, store, () => {
    sidebar.toggle(true);
  });

  picker = new ElementPicker(shadowRoot, async (el, mappingResult) => {
    toggle.setActive(false);
    picker.deactivate();
    sidebar.toggle(false);

    let activeGroupId = 'default';
    try {
      const activeGroup = await groupStore.getActive();
      if (activeGroup) {
        activeGroupId = activeGroup.id;
      }
    } catch (e) {
      console.error('[Annoty] Failed to get active group:', e);
    }

    try {
      popup.open(el, mappingResult, undefined, activeGroupId);
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
        sidebar.toggle(false); // Close sidebar while picking elements
      } else {
        picker.deactivate();
      }
    },
    () => {
      sidebar.toggle(); // Toggle sidebar visibility independently
    }
  );

  // 4. Add keyboard shortcuts: Alt + A (Toggle picker), Alt + S (Toggle sidebar)
  window.addEventListener('keydown', (e) => {
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
    toggle,
    picker,
    popup,
    sidebar,
    shadowRoot
  };
}

init().catch((err) => {
  console.error('[Annoty] Failed to initialize overlay:', err);
});
