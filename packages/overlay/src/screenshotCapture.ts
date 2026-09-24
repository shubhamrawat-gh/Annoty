/**
 * Zero-dependency on-device screenshot capture engine using standard browser canvas and SVG foreignObject.
 */

/**
 * Copies computed styles from source node to target cloned node.
 */
function inlineComputedStyles(source: Element, target: HTMLElement): void {
  const computed = window.getComputedStyle(source);
  let cssText = '';
  for (let i = 0; i < computed.length; i++) {
    const prop = computed[i];
    cssText += `${prop}: ${computed.getPropertyValue(prop)}; `;
  }
  target.setAttribute('style', cssText);

  // Recursively inline children
  const sourceChildren = source.children;
  const targetChildren = target.children;
  for (let i = 0; i < sourceChildren.length; i++) {
    if (targetChildren[i] && targetChildren[i] instanceof HTMLElement) {
      inlineComputedStyles(sourceChildren[i], targetChildren[i] as HTMLElement);
    }
  }
}

/**
 * Captures an HTMLElement as a base64 PNG data URL.
 */
export async function captureElementScreenshot(element: HTMLElement): Promise<string> {
  const rect = element.getBoundingClientRect();
  const width = Math.max(Math.round(rect.width), 20);
  const height = Math.max(Math.round(rect.height), 20);

  // Clone element to avoid mutating host DOM
  const clone = element.cloneNode(true) as HTMLElement;
  inlineComputedStyles(element, clone);

  // Remove any interactive overlay attributes or cursors
  clone.style.margin = '0';
  clone.style.position = 'static';
  clone.style.transform = 'none';

  const serializer = new XMLSerializer();
  const serializedHtml = serializer.serializeToString(clone);

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; box-sizing: border-box;">
          ${serializedHtml}
        </div>
      </foreignObject>
    </svg>
  `;

  return new Promise((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve('');
          return;
        }

        // Draw solid background fallback if transparent
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (err) {
        console.warn('[Annoty] Canvas rendering failed:', err);
        URL.revokeObjectURL(url);
        resolve('');
      }
    };

    img.onerror = (err) => {
      console.warn('[Annoty] SVG image load failed during screenshot capture:', err);
      URL.revokeObjectURL(url);
      resolve('');
    };

    img.src = url;
  });
}

/**
 * Captures an element along with its immediate parent context.
 */
export async function captureElementWithParentScreenshot(element: HTMLElement): Promise<string> {
  const parent = element.parentElement || element;
  return captureElementScreenshot(parent);
}

/**
 * Downloads a screenshot data URL directly to user's disk.
 */
export function downloadScreenshot(dataUrl: string, filename: string = 'annoty-screenshot.png'): void {
  if (!dataUrl) return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
