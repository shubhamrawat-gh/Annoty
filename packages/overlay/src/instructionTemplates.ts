import { Category } from './categoryDetector';

export const instructionTemplates: Record<Category, string> = {
  color:
    'Check for existing design tokens or CSS variables (e.g. `--primary-color`, theme config, Tailwind config colors) before introducing a new hardcoded color value. Match the new color to the existing palette\'s tone/saturation unless an exact value was specified.',
  
  size:
    'When resizing, preserve the element\'s existing responsive behavior — check for existing breakpoint-specific sizing (Tailwind `sm:`/`md:`/`lg:` prefixes or media queries) and adjust proportionally rather than only changing the base/default size.',
  
  spacing:
    'Use the codebase\'s existing spacing scale (Tailwind spacing units, a spacing token system, or consistent rem/px increments already in use) rather than an arbitrary new value, unless a specific value was given.',
  
  typography:
    'Preserve the existing font-family and font-loading setup. Only change the specific property requested (weight, size, etc.) — don\'t reset other typography properties on the element.',
  
  'layout-position':
    'Check the parent container\'s layout method (flexbox, grid, or static) before changing position, and use an approach consistent with how the rest of the codebase handles layout, rather than introducing absolute positioning as a shortcut.',
  
  visibility:
    'If hiding an element, prefer the codebase\'s existing pattern (conditional rendering, a CSS class toggle, or `display`/`visibility` properties — match what\'s already used elsewhere) rather than introducing a new ad-hoc method.',
  
  'border-shape':
    'Match the existing border-radius scale, border-width tokens, and box-shadow styles of the project. Avoid hardcoded radius values (e.g., use Tailwind `rounded-lg` or CSS custom properties if they exist).',
  
  'text-content':
    'Change only the literal text specified. If the text is sourced from a constant, i18n file, or CMS/data source rather than hardcoded JSX, update it at the source rather than overriding it inline.',
  
  responsive:
    'Apply the change at the specified breakpoint only, without altering behavior at other breakpoints, using the project\'s existing responsive approach (Tailwind prefixes, CSS media queries, or a responsive utility already in use).',
  
  'animation-transition':
    'Match the duration/easing conventions already used elsewhere in the codebase if any exist, rather than introducing a new arbitrary timing value.',
  
  alignment:
    'Ensure vertical and horizontal alignment adjustments respect the flex/grid configuration of the parent. Avoid using hacky margins or paddings to manually center or shift items unless requested.',
  
  'opacity-transparency':
    'Use the codebase\'s standard opacity classes or values (e.g., Tailwind `opacity-50` or standard CSS variables) to preserve design system consistency. Check contrast levels when reducing opacity.',
  
  'z-index-layering':
    'Avoid choosing arbitrarily high z-index numbers (e.g., `99999`). Check the existing z-index scale or stacking context in the project and use the lowest correct value relative to surrounding layers.',
  
  'interactivity-state':
    'Ensure hover, focus, and active states remain consistent with existing button or link interactions. Ensure interactive elements maintain proper focus outlines for keyboard accessibility.',
  
  'icon-image':
    'When replacing an icon or image, use the project\'s existing asset pipeline or icon library (e.g. Lucide, Heroicons, or font icons) rather than adding a raw SVG or local image file directly.',
  
  accessibility:
    'Ensure any visual-only change (e.g. color, opacity) doesn\'t reduce contrast below accessible levels, and preserve existing `aria-*`/`alt` attributes unless the change specifically requires updating them.',
  
  'component-structure':
    'When refactoring, keep component splits clean and ensure props are passed down correctly. Preserve state hooks and event listeners in their appropriate scope without causing unnecessary re-renders.',
  
  'data-content-binding':
    'When hooking up dummy data, preserve type interfaces and ensure mock datasets match real API shapes. Avoid breaking TypeScript types or model declarations.',
  
  'link-navigation':
    'Use the framework\'s router/link component (e.g., Next.js `<Link>`, React Router `<Link>`, or Nuxt `<NuxtLink>`) for internal page routing instead of a raw HTML `<a>` tag to prevent full page reloads.',
  
  'general-other':
    'Focus on clean implementation, minimizing lines changed, and maintaining existing codebase formatting and code patterns.'
};
