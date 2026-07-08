import {
  Annotation,
  AnnotationStore,
  AnnotationGroup,
  GroupStore,
  PromptHistoryEntry,
  PromptHistoryStore
} from './types';

export class LocalStorageAnnotationStore implements AnnotationStore {
  private readonly storageKey = 'annoty:annotations';
  private listeners: Set<() => void> = new Set();

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.notify();
      }
    });
  }

  private getStored(): Annotation[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[Annoty] Failed to read annotations from localStorage:', e);
      return [];
    }
  }

  private setStored(annotations: Annotation[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(annotations));
      this.notify();
    } catch (e) {
      console.error('[Annoty] Failed to write annotations to localStorage:', e);
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('[Annoty] Error in store listener:', e);
      }
    });
  }

  public async save(annotation: Annotation): Promise<void> {
    const annotations = this.getStored();
    const index = annotations.findIndex((a) => a.id === annotation.id);
    if (index >= 0) {
      annotations[index] = annotation;
    } else {
      annotations.push(annotation);
    }
    this.setStored(annotations);
  }

  public async list(): Promise<Annotation[]> {
    return this.getStored();
  }

  public async update(id: string, updates: Partial<Annotation>): Promise<void> {
    const annotations = this.getStored();
    const index = annotations.findIndex((a) => a.id === id);
    if (index >= 0) {
      annotations[index] = { ...annotations[index], ...updates };
      this.setStored(annotations);
    }
  }

  public async delete(id: string): Promise<void> {
    const annotations = this.getStored();
    const filtered = annotations.filter((a) => a.id !== id);
    this.setStored(filtered);
  }

  public async clear(): Promise<void> {
    this.setStored([]);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export class LocalStorageGroupStore implements GroupStore {
  private readonly storageKey = 'annoty:groups';
  private listeners: Set<() => void> = new Set();

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.notify();
      }
    });
  }

  private getStored(): AnnotationGroup[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      let groups: AnnotationGroup[] = data ? JSON.parse(data) : [];
      if (groups.length === 0) {
        const defaultGroup: AnnotationGroup = {
          id: crypto.randomUUID(),
          name: 'Default Group',
          createdAt: new Date().toISOString(),
          isActive: true
        };
        groups = [defaultGroup];
        localStorage.setItem(this.storageKey, JSON.stringify(groups));
      }
      return groups;
    } catch (e) {
      console.error('[Annoty] Failed to read groups from localStorage:', e);
      return [];
    }
  }

  private setStored(groups: AnnotationGroup[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(groups));
      this.notify();
    } catch (e) {
      console.error('[Annoty] Failed to write groups to localStorage:', e);
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('[Annoty] Error in store listener:', e);
      }
    });
  }

  public async create(name: string): Promise<AnnotationGroup> {
    const groups = this.getStored();
    
    if (groups.some((g) => g.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      throw new Error(`A group with the name "${name}" already exists.`);
    }

    // Set all others to inactive
    groups.forEach((g) => (g.isActive = false));

    const newGroup: AnnotationGroup = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    groups.push(newGroup);
    this.setStored(groups);
    return newGroup;
  }

  public async list(): Promise<AnnotationGroup[]> {
    return this.getStored();
  }

  public async rename(id: string, newName: string): Promise<void> {
    const groups = this.getStored();
    const index = groups.findIndex((g) => g.id === id);
    if (index >= 0) {
      if (groups.some((g) => g.id !== id && g.name.trim().toLowerCase() === newName.trim().toLowerCase())) {
        throw new Error(`A group with the name "${newName}" already exists.`);
      }
      groups[index].name = newName.trim();
      this.setStored(groups);
    }
  }

  public async delete(id: string): Promise<void> {
    let groups = this.getStored();
    const groupToDelete = groups.find((g) => g.id === id);
    if (!groupToDelete) return;

    groups = groups.filter((g) => g.id !== id);

    // Cascade delete annotations of this group
    try {
      const annotationsKey = 'annoty:annotations';
      const rawAnnos = localStorage.getItem(annotationsKey);
      if (rawAnnos) {
        const annos: Annotation[] = JSON.parse(rawAnnos);
        const filteredAnnos = annos.filter((a) => a.groupId !== id);
        localStorage.setItem(annotationsKey, JSON.stringify(filteredAnnos));
        
        // Dispatch storage event to trigger overlay listeners on the same tab
        window.dispatchEvent(new StorageEvent('storage', { key: annotationsKey }));
      }
    } catch (e) {
      console.error('[Annoty] Failed cascade deleting annotations:', e);
    }

    // Manage active group state
    if (groupToDelete.isActive) {
      if (groups.length > 0) {
        groups[0].isActive = true;
      } else {
        // Recreate default group if no groups are left
        const defaultGroup: AnnotationGroup = {
          id: crypto.randomUUID(),
          name: 'Default Group',
          createdAt: new Date().toISOString(),
          isActive: true
        };
        groups.push(defaultGroup);
      }
    }

    this.setStored(groups);
  }

  public async setActive(id: string): Promise<void> {
    const groups = this.getStored();
    groups.forEach((g) => {
      g.isActive = g.id === id;
    });
    this.setStored(groups);
  }

  public async getActive(): Promise<AnnotationGroup | null> {
    const groups = this.getStored();
    const active = groups.find((g) => g.isActive);
    if (active) return active;

    if (groups.length > 0) {
      groups[0].isActive = true;
      this.setStored(groups);
      return groups[0];
    }
    return null;
  }

  public async clear(): Promise<void> {
    const defaultGroup: AnnotationGroup = {
      id: crypto.randomUUID(),
      name: 'Default Group',
      createdAt: new Date().toISOString(),
      isActive: true
    };
    this.setStored([defaultGroup]);

    try {
      localStorage.setItem('annoty:annotations', JSON.stringify([]));
      window.dispatchEvent(new StorageEvent('storage', { key: 'annoty:annotations' }));
    } catch (e) {
      console.error('[Annoty] Failed to clear annotations during groups clear:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export class LocalStoragePromptHistoryStore implements PromptHistoryStore {
  private readonly storageKey = 'annoty:promptHistory';
  private listeners: Set<() => void> = new Set();

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.notify();
      }
    });
  }

  private getStored(): PromptHistoryEntry[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[Annoty] Failed to read prompt history from localStorage:', e);
      return [];
    }
  }

  private setStored(entries: PromptHistoryEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
      this.notify();
    } catch (e) {
      console.error('[Annoty] Failed to write prompt history to localStorage:', e);
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('[Annoty] Error in store listener:', e);
      }
    });
  }

  public async add(entry: PromptHistoryEntry): Promise<void> {
    const entries = this.getStored();
    entries.push(entry);
    this.setStored(entries);
  }

  public async list(): Promise<PromptHistoryEntry[]> {
    const entries = this.getStored();
    // Sort reverse-chronological (newest first)
    return entries.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  public async delete(id: string): Promise<void> {
    const entries = this.getStored();
    const filtered = entries.filter((e) => e.id !== id);
    this.setStored(filtered);
  }

  public async clear(): Promise<void> {
    this.setStored([]);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
