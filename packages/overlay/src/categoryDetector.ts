export type Category =
  | 'color'
  | 'size'
  | 'spacing'
  | 'typography'
  | 'layout-position'
  | 'visibility'
  | 'border-shape'
  | 'text-content'
  | 'responsive'
  | 'animation-transition'
  | 'alignment'
  | 'opacity-transparency'
  | 'z-index-layering'
  | 'interactivity-state'
  | 'icon-image'
  | 'accessibility'
  | 'component-structure'
  | 'data-content-binding'
  | 'link-navigation'
  | 'general-other';

const CATEGORY_RULES: Record<Exclude<Category, 'general-other'>, RegExp[]> = {
  color: [
    /\b(colou?r|shade|hue|hex|rgb|bg|background|text-color|darken|lighten|green|red|blue|yellow|orange|purple|pink|black|white|gray|grey|teal|indigo|emerald)\b/i
  ],
  size: [
    /\b(size|bigger|smaller|larger|increase|decrease|scale|width|height|shrink|enlarge|px|rem|em|fit|dimension|tall|wide)\b/i
  ],
  spacing: [
    /\b(padding|margin|gap|spacing|space|closer|apart|tighten|loosen|offset|distribute)\b/i
  ],
  typography: [
    /\b(font|bold|italic|weight|uppercase|lowercase|letter-spacing|line-height|text-align|serif|sans-serif|monospace|heading|header|title|subtitle|typography|typo)\b/i
  ],
  'layout-position': [
    /\b(move|align|center|left|right|top|bottom|position|float|order|absolute|relative|fixed|sticky)\b/i
  ],
  visibility: [
    /\b(hide|show|remove|delete|invisible|visible|display|toggle|collapse|hidden|omit)\b/i
  ],
  'border-shape': [
    /\b(border|radius|rounded|corner|outline|shadow|box-shadow|card|pill|circle|stroke)\b/i
  ],
  'text-content': [
    /\b(rename|rewrite|typo|wording|copy|label|phrase|sentence|string|text to|change the text|change text)\b/i
  ],
  responsive: [
    /\b(mobile|tablet|desktop|breakpoint|responsive|screens|devices|phone|sm|md|lg|xl|media query)\b/i
  ],
  'animation-transition': [
    /\b(animate|animation|transition|fade|slide|ease|duration|spin|bounce|hover effect|delay|keyframes)\b/i
  ],
  alignment: [
    /\b(align|justify|centered|stretch|self-align|justify-content|align-items|vertical-align|horizontal-align)\b/i
  ],
  'opacity-transparency': [
    /\b(opacity|transparent|faded|translucent|see-through|alpha|rgba)\b/i
  ],
  'z-index-layering': [
    /\b(z-index|layer|on top|behind|overlap|stacking|bring to front|send to back)\b/i
  ],
  'interactivity-state': [
    /\b(hover|active|focus|disabled|on click|click|cursor|pointer|tabindex|interactive)\b/i
  ],
  'icon-image': [
    /\b(icon|image|logo|picture|replace image|swap icon|img|svg|png|jpg|jpeg|avatar|illustration)\b/i
  ],
  accessibility: [
    /\b(accessible|aria|alt|contrast|screen reader|a11y|accessibility|wcag|reader)\b/i
  ],
  'component-structure': [
    /\b(split|extract|combine|merge|refactor|structure|wrapper|container|nested|children|parent|component)\b/i
  ],
  'data-content-binding': [
    /\b(placeholder|dummy|hook up|bind|dynamic|state|prop|variable|api|fetch|data|source|mapping)\b/i
  ],
  'link-navigation': [
    /\b(link|href|route|navigate|redirect|points to|url|anchor|navigational)\b/i
  ]
};

/**
 * Categorizes an instruction string by matching regex patterns.
 * Returns a list of Category values. If no specific category matches, returns ['general-other'].
 */
export function detectCategories(instruction: string): Category[] {
  const matchedCategories: Category[] = [];

  for (const [category, regexes] of Object.entries(CATEGORY_RULES)) {
    const isMatch = regexes.some((regex) => regex.test(instruction));
    if (isMatch) {
      matchedCategories.push(category as Category);
    }
  }

  if (matchedCategories.length === 0) {
    matchedCategories.push('general-other');
  }

  return matchedCategories;
}
