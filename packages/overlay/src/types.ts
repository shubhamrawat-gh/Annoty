export interface Annotation {
  id: string;                    // generated via crypto.randomUUID()
  createdAt: string;             // ISO timestamp
  instruction: string;           // the user's raw typed text
  sourceTier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  elementSnapshot: string;       // outerHTML, truncated to ~200 chars
  textPreview: string;           // truncated textContent, ~80 chars
  selector: string;              // CSS selector path (always captured, all tiers)
  filePath?: string;             // only present for Tier 1-8
  lineNumber?: number;            
  columnNumber?: number;
  landmarkContext?: string;      // only present for Tier 9 fallback
  groupId: string;               // every annotation belongs to a group
  approximationDistance?: number;
  lineUnavailable?: boolean;
}

export interface AnnotationGroup {
  id: string;
  name: string;
  createdAt: string;
  isActive?: boolean; // currently selected group
}

export interface PromptHistoryEntry {
  id: string;
  groupName: string;       // snapshot frozen at generation time
  generatedAt: string;
  markdown: string;        // compiled prompt markdown
  annotationCount: number;
  categories: string[];    // union of categories detected at generation time
}

export interface AnnotationStore {
  save(annotation: Annotation): Promise<void>;
  list(): Promise<Annotation[]>;
  update(id: string, updates: Partial<Annotation>): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  subscribe(listener: () => void): () => void;
}

export interface GroupStore {
  create(name: string): Promise<AnnotationGroup>;
  list(): Promise<AnnotationGroup[]>;
  rename(id: string, newName: string): Promise<void>;
  delete(id: string): Promise<void>;  // also cascade deletes group's annotations
  setActive(id: string): Promise<void>;
  getActive(): Promise<AnnotationGroup | null>;
  clear(): Promise<void>;
  subscribe(listener: () => void): () => void;
}

export interface PromptHistoryStore {
  add(entry: PromptHistoryEntry): Promise<void>;
  list(): Promise<PromptHistoryEntry[]>;  // return reverse-chronological (newest first)
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  subscribe(listener: () => void): () => void;
}

export type SourceMapperTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface SourceMappingResult {
  sourceTier: SourceMapperTier;
  selector: string;
  elementSnapshot: string;
  textPreview: string;
  filePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  landmarkContext?: string;
  approximationDistance?: number;
  lineUnavailable?: boolean;
}
