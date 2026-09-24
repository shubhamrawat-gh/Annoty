export interface ResponsivePreset {
  name: string;
  width: number;
  height: number;
}

export interface AnnotyProjectConfig {
  framework: string;
  sourceRoot: string;
  devPort: number;
  captureScreenshots: boolean;
  includeComputedStyles: boolean;
  responsivePresets: ResponsivePreset[];
}

const DEFAULT_CONFIG: AnnotyProjectConfig = {
  framework: 'react',
  sourceRoot: 'src',
  devPort: 5173,
  captureScreenshots: true,
  includeComputedStyles: true,
  responsivePresets: [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
  ],
};

const LOCAL_STORAGE_KEY = 'annoty:project-config';

let cachedConfig: AnnotyProjectConfig = { ...DEFAULT_CONFIG };

/**
 * Loads project configuration from /annoty.config.json or local fallback.
 */
export async function loadProjectConfig(): Promise<AnnotyProjectConfig> {
  // 1. Try local dev server fetch
  try {
    const res = await fetch('/annoty.config.json', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      cachedConfig = {
        ...DEFAULT_CONFIG,
        ...json,
      };
      return cachedConfig;
    }
  } catch {
    // Expected when no server-side static file exists
  }

  // 2. Try localStorage user override
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      cachedConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
      };
      return cachedConfig;
    }
  } catch (e) {
    console.warn('[Annoty] Failed to read cached config:', e);
  }

  cachedConfig = { ...DEFAULT_CONFIG };
  return cachedConfig;
}

/**
 * Returns currently cached project config.
 */
export function getProjectConfig(): AnnotyProjectConfig {
  return cachedConfig;
}

/**
 * Saves project configuration override locally.
 */
export function saveProjectConfigOverride(updates: Partial<AnnotyProjectConfig>): void {
  cachedConfig = {
    ...cachedConfig,
    ...updates,
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cachedConfig));
  } catch (e) {
    console.warn('[Annoty] Failed to save config override:', e);
  }
}
