import {
  Annotation,
  AnnotationStore,
  AnnotationGroup,
  GroupStore,
  ProjectSession,
  SessionStore,
  PromptHistoryEntry,
  PromptHistoryStore,
} from './types';

const DB_NAME = 'annoty_local_db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('annotations')) {
        db.createObjectStore('annotations', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('groups')) {
        db.createObjectStore('groups', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let result: T;

      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);

      try {
        const req = fn(store);
        if (req) {
          req.onsuccess = () => {
            result = req.result;
          };
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}

export class IndexedDBAnnotationStore implements AnnotationStore {
  private listeners: Set<() => void> = new Set();

  public async save(annotation: Annotation): Promise<void> {
    await runTransaction('annotations', 'readwrite', (store) => {
      store.put(annotation);
    });
    this.notify();
  }

  public async list(): Promise<Annotation[]> {
    const list = await runTransaction<Annotation[]>('annotations', 'readonly', (store) => {
      return store.getAll();
    });
    return list || [];
  }

  public async update(id: string, updates: Partial<Annotation>): Promise<void> {
    const existing = await runTransaction<Annotation>('annotations', 'readonly', (store) => {
      return store.get(id);
    });
    if (existing) {
      const updated = { ...existing, ...updates };
      await runTransaction('annotations', 'readwrite', (store) => {
        store.put(updated);
      });
      this.notify();
    }
  }

  public async delete(id: string): Promise<void> {
    await runTransaction('annotations', 'readwrite', (store) => {
      store.delete(id);
    });
    this.notify();
  }

  public async clear(): Promise<void> {
    await runTransaction('annotations', 'readwrite', (store) => {
      store.clear();
    });
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('[Annoty] Store listener error:', e);
      }
    });
  }
}

export class IndexedDBGroupStore implements GroupStore {
  private listeners: Set<() => void> = new Set();
  private activeGroupIdKey = 'annoty:active_group_id';

  public async create(name: string): Promise<AnnotationGroup> {
    const group: AnnotationGroup = {
      id: crypto.randomUUID ? crypto.randomUUID() : `grp_${Date.now()}_${Math.random()}`,
      name,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    await runTransaction('groups', 'readwrite', (store) => {
      store.put(group);
    });
    await this.setActive(group.id);
    this.notify();
    return group;
  }

  public async list(): Promise<AnnotationGroup[]> {
    const groups = (await runTransaction<AnnotationGroup[]>('groups', 'readonly', (store) => {
      return store.getAll();
    })) || [];

    const activeId = localStorage.getItem(this.activeGroupIdKey);
    return groups.map((g) => ({
      ...g,
      isActive: g.id === activeId,
    }));
  }

  public async rename(id: string, newName: string): Promise<void> {
    const existing = await runTransaction<AnnotationGroup>('groups', 'readonly', (store) => {
      return store.get(id);
    });
    if (existing) {
      existing.name = newName;
      await runTransaction('groups', 'readwrite', (store) => {
        store.put(existing);
      });
      this.notify();
    }
  }

  public async delete(id: string): Promise<void> {
    await runTransaction('groups', 'readwrite', (store) => {
      store.delete(id);
    });
    const activeId = localStorage.getItem(this.activeGroupIdKey);
    if (activeId === id) {
      localStorage.removeItem(this.activeGroupIdKey);
    }
    this.notify();
  }

  public async setActive(id: string): Promise<void> {
    localStorage.setItem(this.activeGroupIdKey, id);
    this.notify();
  }

  public async getActive(): Promise<AnnotationGroup | null> {
    const activeId = localStorage.getItem(this.activeGroupIdKey);
    if (!activeId) {
      const all = await this.list();
      return all[0] || null;
    }
    const found = await runTransaction<AnnotationGroup>('groups', 'readonly', (store) => {
      return store.get(activeId);
    });
    return found || null;
  }

  public async clear(): Promise<void> {
    await runTransaction('groups', 'readwrite', (store) => {
      store.clear();
    });
    localStorage.removeItem(this.activeGroupIdKey);
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('[Annoty] Group listener error:', e);
      }
    });
  }
}

export class IndexedDBPromptHistoryStore implements PromptHistoryStore {
  private listeners: Set<() => void> = new Set();

  public async add(entry: PromptHistoryEntry): Promise<void> {
    await runTransaction('history', 'readwrite', (store) => {
      store.put(entry);
    });
    this.notify();
  }

  public async list(): Promise<PromptHistoryEntry[]> {
    const all = (await runTransaction<PromptHistoryEntry[]>('history', 'readonly', (store) => {
      return store.getAll();
    })) || [];
    return all.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  public async delete(id: string): Promise<void> {
    await runTransaction('history', 'readwrite', (store) => {
      store.delete(id);
    });
    this.notify();
  }

  public async clear(): Promise<void> {
    await runTransaction('history', 'readwrite', (store) => {
      store.clear();
    });
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('[Annoty] History listener error:', e);
      }
    });
  }
}

export class IndexedDBSessionStore implements SessionStore {
  private listeners: Set<() => void> = new Set();
  private activeSessionIdKey = 'annoty:active_session_id';

  public async create(name: string, description?: string): Promise<ProjectSession> {
    const session: ProjectSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description,
    };

    await runTransaction('sessions', 'readwrite', (store) => {
      store.put(session);
    });
    await this.setActive(session.id);
    this.notify();
    return session;
  }

  public async list(): Promise<ProjectSession[]> {
    const sessions = (await runTransaction<ProjectSession[]>('sessions', 'readonly', (store) => {
      return store.getAll();
    })) || [];
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public async rename(id: string, newName: string): Promise<void> {
    const existing = await runTransaction<ProjectSession>('sessions', 'readonly', (store) => {
      return store.get(id);
    });
    if (existing) {
      existing.name = newName;
      existing.updatedAt = new Date().toISOString();
      await runTransaction('sessions', 'readwrite', (store) => {
        store.put(existing);
      });
      this.notify();
    }
  }

  public async delete(id: string): Promise<void> {
    await runTransaction('sessions', 'readwrite', (store) => {
      store.delete(id);
    });
    const activeId = localStorage.getItem(this.activeSessionIdKey);
    if (activeId === id) {
      localStorage.removeItem(this.activeSessionIdKey);
    }
    this.notify();
  }

  public async setActive(id: string): Promise<void> {
    localStorage.setItem(this.activeSessionIdKey, id);
    this.notify();
  }

  public async getActive(): Promise<ProjectSession | null> {
    const activeId = localStorage.getItem(this.activeSessionIdKey);
    if (!activeId) return null;
    const found = await runTransaction<ProjectSession>('sessions', 'readonly', (store) => {
      return store.get(activeId);
    });
    return found || null;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('[Annoty] Session listener error:', e);
      }
    });
  }
}
