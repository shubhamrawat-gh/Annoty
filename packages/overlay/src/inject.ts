import { CSS_STYLES } from './ui/styles';

let shadowRoot: ShadowRoot | null = null;

/**
 * Creates and appends the shadow host to the document body, then attaches
 * and returns the open shadow root populated with our CSS styles.
 */
export function getShadowRoot(): ShadowRoot {
  if (shadowRoot) {
    return shadowRoot;
  }

  const host = document.createElement('div');
  host.id = 'annoty-host';
  
  // Set explicit clean boundary so it doesn't affect host layout
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '0';
  host.style.height = '0';
  host.style.zIndex = '999999';
  host.style.overflow = 'visible';

  shadowRoot = host.attachShadow({ mode: 'open' });

  // Append the scoped CSS stylesheet
  const styleTag = document.createElement('style');
  styleTag.textContent = CSS_STYLES;
  shadowRoot.appendChild(styleTag);

  // Append to the body
  if (document.body) {
    document.body.appendChild(host);
  } else {
    // Fallback if script executes before body is parsed
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(host);
    });
  }

  return shadowRoot;
}

/**
 * Ensures the document body exists before resolving the ShadowRoot.
 */
export function initializeShadowRoot(): Promise<ShadowRoot> {
  return new Promise((resolve) => {
    if (document.body) {
      resolve(getShadowRoot());
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        resolve(getShadowRoot());
      });
    }
  });
}
