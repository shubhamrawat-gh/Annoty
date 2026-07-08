import {
  Annotation,
  AnnotationStore,
  AnnotationGroup,
  GroupStore,
  PromptHistoryEntry,
  PromptHistoryStore
} from './types';
import { detectCategories } from './categoryDetector';

export interface SyncTokenData {
  apiUrl: string;
  jwt: string;
}

function safeDecodeJWT(jwt: string): any {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    let payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = payloadBase64.length % 4;
    if (pad === 2) payloadBase64 += '==';
    else if (pad === 3) payloadBase64 += '=';
    return JSON.parse(atob(payloadBase64));
  } catch (e) {
    console.error('[Annoty] Failed to decode JWT payload safely:', e);
    return null;
  }
}

export class SupabaseStoreManager {
  public apiUrl: string;
  public jwt: string;
  public userId: string = '';
  private listeners: Set<() => void> = new Set();
  private pollInterval: any = null;

  // Scoped Caches to prevent N+1 remote database hits
  public groupsCache: any[] = [];
  public annotationsCache: any[] = [];
  public historyCache: any[] = [];

  constructor(tokenData: SyncTokenData) {
    this.apiUrl = tokenData.apiUrl;
    this.jwt = tokenData.jwt;

    const payload = safeDecodeJWT(tokenData.jwt);
    if (payload) {
      this.userId = payload.sub || '';
    }
  }

  public async initialize(): Promise<void> {
    // Initial parallel fetch of all tables to populate local memory cache
    await this.refreshAllCaches();

    // Polling cache re-sync in background instead of direct Supabase Realtime
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    this.pollInterval = setInterval(async () => {
      await this.refreshAllCaches();
      this.notify();
    }, 10000); // Poll every 10 seconds
  }

  public async refreshAllCaches(): Promise<void> {
    try {
      await Promise.all([
        this.fetchGroups(),
        this.fetchAnnotations(),
        this.fetchHistory()
      ]);
    } catch (e) {
      console.error('[Annoty] Failed to preload database caches:', e);
    }
  }

  public async fetchGroups(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/groups`, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.statusText}`);
      }
      this.groupsCache = await response.json();
    } catch (err) {
      console.error('[Annoty] Error in fetchGroups:', err);
    }
  }

  public async fetchAnnotations(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/annotations`, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch annotations: ${response.statusText}`);
      }
      this.annotationsCache = await response.json();
    } catch (err) {
      console.error('[Annoty] Error in fetchAnnotations:', err);
    }
  }

  public async fetchHistory(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/history`, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch prompt history: ${response.statusText}`);
      }
      this.historyCache = await response.json();
    } catch (err) {
      console.error('[Annoty] Error in fetchHistory:', err);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('[Annoty] Error in realtime listener:', e);
      }
    });
  }

  public destroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

/* =============================================================================
   1. Cloud Annotation Store
   ============================================================================= */
export class CloudAnnotationStore implements AnnotationStore {
  private listeners: Set<() => void> = new Set();

  constructor(private manager: SupabaseStoreManager) {
    this.manager.subscribe(() => this.notify());
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public async save(annotation: Annotation): Promise<void> {
    const cats = detectCategories(annotation.instruction);
    const dbObj = {
      id: annotation.id,
      group_id: annotation.groupId,
      user_id: this.manager.userId,
      instruction: annotation.instruction,
      source_tier: annotation.sourceTier,
      element_snapshot: annotation.elementSnapshot || null,
      text_preview: annotation.textPreview || null,
      selector: annotation.selector,
      file_path: annotation.filePath || null,
      line_number: annotation.lineNumber || null,
      column_number: annotation.columnNumber || null,
      landmark_context: annotation.landmarkContext || null,
      categories: cats,
      created_at: annotation.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Optimistic Cache Update (Instant UI render)
    const existingIdx = this.manager.annotationsCache.findIndex((a) => a.id === annotation.id);
    if (existingIdx > -1) {
      this.manager.annotationsCache[existingIdx] = dbObj;
    } else {
      this.manager.annotationsCache.push(dbObj);
    }
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/annotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.manager.jwt}`
      },
      body: JSON.stringify(dbObj)
    });

    if (!response.ok) {
      console.error('[Annoty] Error saving annotation to backend proxy API:', response.statusText);
      throw new Error(`Failed to save annotation: ${response.statusText}`);
    }
  }

  public async list(): Promise<Annotation[]> {
    // Return cached value instantly (0ms)
    return this.manager.annotationsCache.map((row: any) => ({
      id: row.id,
      createdAt: row.created_at,
      instruction: row.instruction,
      sourceTier: row.source_tier,
      elementSnapshot: row.element_snapshot || '',
      textPreview: row.text_preview || '',
      selector: row.selector,
      filePath: row.file_path || undefined,
      lineNumber: row.line_number || undefined,
      columnNumber: row.column_number || undefined,
      landmarkContext: row.landmark_context || undefined,
      groupId: row.group_id
    }));
  }

  public async update(id: string, updates: Partial<Annotation>): Promise<void> {
    const existingIdx = this.manager.annotationsCache.findIndex((a) => a.id === id);
    if (existingIdx === -1) return;

    const row = this.manager.annotationsCache[existingIdx];
    const updatedRow = {
      ...row,
      instruction: updates.instruction !== undefined ? updates.instruction : row.instruction,
      categories: updates.instruction !== undefined ? detectCategories(updates.instruction) : row.categories,
      group_id: updates.groupId !== undefined ? updates.groupId : row.group_id,
      file_path: updates.filePath !== undefined ? updates.filePath : row.file_path,
      line_number: updates.lineNumber !== undefined ? updates.lineNumber : row.line_number,
      updated_at: new Date().toISOString()
    };

    // 1. Optimistic Cache Update
    this.manager.annotationsCache[existingIdx] = updatedRow;
    this.manager.notify();

    // 2. Background Sync via API
    const dbUpdates: any = {
      updated_at: updatedRow.updated_at
    };
    if (updates.instruction !== undefined) {
      dbUpdates.instruction = updates.instruction;
      dbUpdates.categories = updatedRow.categories;
    }
    if (updates.groupId !== undefined) dbUpdates.group_id = updates.groupId;
    if (updates.filePath !== undefined) dbUpdates.file_path = updates.filePath;
    if (updates.lineNumber !== undefined) dbUpdates.line_number = updates.lineNumber;

    const response = await fetch(`${this.manager.apiUrl}/api/annotations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.manager.jwt}`
      },
      body: JSON.stringify(dbUpdates)
    });

    if (!response.ok) {
      console.error('[Annoty] Error updating annotation via backend proxy API:', response.statusText);
      throw new Error(`Failed to update annotation: ${response.statusText}`);
    }
  }

  public async delete(id: string): Promise<void> {
    // 1. Optimistic Cache Update
    this.manager.annotationsCache = this.manager.annotationsCache.filter((a) => a.id !== id);
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/annotations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.manager.jwt}`
      }
    });

    if (!response.ok) {
      console.error('[Annoty] Error deleting annotation via backend proxy API:', response.statusText);
      throw new Error(`Failed to delete annotation: ${response.statusText}`);
    }
  }

  public async clear(): Promise<void> {
    // 1. Optimistic Cache Update
    this.manager.annotationsCache = [];
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/annotations`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.manager.jwt}`
      }
    });

    if (!response.ok) {
      console.error('[Annoty] Error clearing annotations via backend proxy API:', response.statusText);
      throw new Error(`Failed to clear annotations: ${response.statusText}`);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/* =============================================================================
   2. Cloud Group Store
   ============================================================================= */
export class CloudGroupStore implements GroupStore {
  private listeners: Set<() => void> = new Set();
  private activeGroupIdKey = 'annoty:activeGroupId';

  constructor(private manager: SupabaseStoreManager) {
    this.manager.subscribe(() => this.notify());
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public async create(name: string): Promise<AnnotationGroup> {
    const newGroup = {
      id: crypto.randomUUID(),
      user_id: this.manager.userId,
      name: name.trim(),
      created_at: new Date().toISOString()
    };

    // 1. Optimistic Cache Update
    this.manager.groupsCache.push(newGroup);
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.manager.jwt}`
      },
      body: JSON.stringify(newGroup)
    });

    if (!response.ok) {
      console.error('[Annoty] Error creating group via backend proxy API:', response.statusText);
      throw new Error(`Failed to create group: ${response.statusText}`);
    }

    const created: AnnotationGroup = {
      id: newGroup.id,
      name: newGroup.name,
      createdAt: newGroup.created_at,
      isActive: true
    };

    await this.setActive(created.id);
    return created;
  }

  public async list(): Promise<AnnotationGroup[]> {
    const activeId = localStorage.getItem(this.activeGroupIdKey);

    return this.manager.groupsCache.map((row: any) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      isActive: row.id === activeId
    }));
  }

  public async rename(id: string, newName: string): Promise<void> {
    // 1. Optimistic Cache Update
    const idx = this.manager.groupsCache.findIndex((g) => g.id === id);
    if (idx > -1) {
      this.manager.groupsCache[idx].name = newName.trim();
    }
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/groups/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.manager.jwt}`
      },
      body: JSON.stringify({ name: newName.trim() })
    });

    if (!response.ok) {
      console.error('[Annoty] Error renaming group via backend proxy API:', response.statusText);
      throw new Error(`Failed to rename group: ${response.statusText}`);
    }
  }

  public async delete(id: string): Promise<void> {
    // 1. Optimistic Cache Update
    this.manager.groupsCache = this.manager.groupsCache.filter((g) => g.id !== id);
    this.manager.annotationsCache = this.manager.annotationsCache.filter((a) => a.group_id !== id);
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/groups/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.manager.jwt}`
      }
    });

    if (!response.ok) {
      console.error('[Annoty] Error deleting group via backend proxy API:', response.statusText);
      throw new Error(`Failed to delete group: ${response.statusText}`);
    }

    // Update active group if deleted
    const activeId = localStorage.getItem(this.activeGroupIdKey);
    if (activeId === id) {
      localStorage.removeItem(this.activeGroupIdKey);
      const groups = await this.list();
      if (groups.length > 0) {
        await this.setActive(groups[0].id);
      }
    }
  }

  public async setActive(id: string): Promise<void> {
    localStorage.setItem(this.activeGroupIdKey, id);
    this.notify();
  }

  public async getActive(): Promise<AnnotationGroup | null> {
    const groups = await this.list();
    if (groups.length === 0) {
      return this.create('Default Group');
    }

    const activeId = localStorage.getItem(this.activeGroupIdKey);
    const active = groups.find((g) => g.id === activeId);
    if (active) return active;

    // Default to first group
    await this.setActive(groups[0].id);
    return groups[0];
  }

  public async clear(): Promise<void> {
    // 1. Optimistic Cache Update
    this.manager.groupsCache = [];
    this.manager.annotationsCache = [];
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/groups`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.manager.jwt}`
      }
    });

    if (!response.ok) {
      console.error('[Annoty] Error clearing groups via backend proxy API:', response.statusText);
      throw new Error(`Failed to clear groups: ${response.statusText}`);
    }
    localStorage.removeItem(this.activeGroupIdKey);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/* =============================================================================
   3. Cloud Prompt History Store
   ============================================================================= */
export class CloudPromptHistoryStore implements PromptHistoryStore {
  private listeners: Set<() => void> = new Set();

  constructor(private manager: SupabaseStoreManager) {
    this.manager.subscribe(() => this.notify());
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public async add(entry: PromptHistoryEntry): Promise<void> {
    const dbObj = {
      id: entry.id,
      user_id: this.manager.userId,
      group_name: entry.groupName,
      markdown: entry.markdown,
      annotation_count: entry.annotationCount,
      categories: entry.categories || [],
      generated_at: entry.generatedAt || new Date().toISOString()
    };

    // 1. Optimistic Cache Update
    this.manager.historyCache.unshift(dbObj);
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.manager.jwt}`
      },
      body: JSON.stringify(dbObj)
    });

    if (!response.ok) {
      console.error('[Annoty] Error adding prompt history via backend proxy API:', response.statusText);
      throw new Error(`Failed to add prompt history: ${response.statusText}`);
    }
  }

  public async list(): Promise<PromptHistoryEntry[]> {
    return this.manager.historyCache.map((row: any) => ({
      id: row.id,
      groupName: row.group_name,
      generatedAt: row.generated_at,
      markdown: row.markdown,
      annotationCount: row.annotation_count,
      categories: row.categories || []
    }));
  }

  public async delete(id: string): Promise<void> {
    // 1. Optimistic Cache Update
    this.manager.historyCache = this.manager.historyCache.filter((h) => h.id !== id);
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/history/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.manager.jwt}`
      }
    });

    if (!response.ok) {
      console.error('[Annoty] Error deleting prompt history via backend proxy API:', response.statusText);
      throw new Error(`Failed to delete prompt history: ${response.statusText}`);
    }
  }

  public async clear(): Promise<void> {
    // 1. Optimistic Cache Update
    this.manager.historyCache = [];
    this.manager.notify();

    // 2. Background Sync via API
    const response = await fetch(`${this.manager.apiUrl}/api/history`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.manager.jwt}`
      }
    });

    if (!response.ok) {
      console.error('[Annoty] Error clearing prompt history via backend proxy API:', response.statusText);
      throw new Error(`Failed to clear prompt history: ${response.statusText}`);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
