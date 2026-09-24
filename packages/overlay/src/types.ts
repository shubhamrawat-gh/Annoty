export type AnnotationCategory =
  | 'bug'
  | 'visual'
  | 'feature'
  | 'responsive'
  | 'accessibility'
  | 'content'
  | 'performance'
  | 'refactor';

export type AnnotationSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AnnotationState = 'pending' | 'in-progress' | 'resolved' | 'ignored';

export interface ElementLayout {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface BoxModelStyles {
  width: string;
  height: string;
  margin: string;
  padding: string;
  borderWidth: string;
}

export interface TypographyStyles {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: string;
}

export interface LayoutStyles {
  display: string;
  position: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  gap: string;
  gridTemplateColumns: string;
}

export interface AppearanceStyles {
  color: string;
  backgroundColor: string;
  borderRadius: string;
  boxShadow: string;
  opacity: string;
  border: string;
}

export interface BehaviorStyles {
  overflow: string;
  cursor: string;
  pointerEvents: string;
  zIndex: string;
}

export interface ElementComputedStyles {
  box: BoxModelStyles;
  typography: TypographyStyles;
  layout: LayoutStyles;
  appearance: AppearanceStyles;
  behavior: BehaviorStyles;
}

export interface ViewportInfo {
  width: number;
  height: number;
  preset: 'mobile-375' | 'tablet-768' | 'desktop-1440' | 'custom';
}

export interface DOMNodeBreadcrumb {
  tagName: string;
  selector: string;
  id?: string;
  classes: string[];
  isTarget: boolean;
}

export interface UIDiagnostic {
  type: 'overflow' | 'contrast' | 'offscreen' | 'z-index' | 'layout';
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface Annotation {
  id: string;                    // generated via crypto.randomUUID()
  pinNumber?: number;            // 1, 2, 3... for visual pin display
  createdAt: string;             // ISO timestamp
  instruction: string;           // the user's raw typed text
  sourceTier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  elementSnapshot: string;       // outerHTML, truncated to ~200 chars
  textPreview: string;           // truncated textContent, ~80 chars
  selector: string;              // CSS selector path (always captured, all tiers)
  filePath?: string;             // only present for Tier 1-8
  lineNumber?: number;            
  columnNumber?: number;
  componentName?: string;
  landmarkContext?: string;      // only present for Tier 9 fallback
  groupId: string;               // every annotation belongs to a group
  sessionId?: string;            // session identifier
  category?: AnnotationCategory;
  severity?: AnnotationSeverity;
  state?: AnnotationState;
  layout?: ElementLayout;
  viewport?: ViewportInfo;
  computedStyles?: ElementComputedStyles;
  domBreadcrumbs?: DOMNodeBreadcrumb[];
  diagnostics?: UIDiagnostic[];
  screenshotBase64?: string;
  approximationDistance?: number;
  lineUnavailable?: boolean;
}

export interface AnnotationGroup {
  id: string;
  name: string;
  createdAt: string;
  isActive?: boolean;            // currently selected group
  priority?: AnnotationSeverity;
  description?: string;
}

export interface ProjectSession {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface PromptHistoryEntry {
  id: string;
  groupName: string;             // snapshot frozen at generation time
  generatedAt: string;
  markdown: string;              // compiled prompt markdown
  annotationCount: number;
  categories: string[];          // union of categories detected at generation time
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

export interface SessionStore {
  create(name: string, description?: string): Promise<ProjectSession>;
  list(): Promise<ProjectSession[]>;
  rename(id: string, newName: string): Promise<void>;
  delete(id: string): Promise<void>;
  setActive(id: string): Promise<void>;
  getActive(): Promise<ProjectSession | null>;
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
  componentName?: string;
  landmarkContext?: string;
  approximationDistance?: number;
  lineUnavailable?: boolean;
}
