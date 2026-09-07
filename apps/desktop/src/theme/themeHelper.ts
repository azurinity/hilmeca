// apps/desktop/src/theme/themeHelper.ts
import { Theme } from './types';

/**
 * Traverses design object structures recursively to flatten nested properties.
 * Maps keys from camelCase configurations into clean kebab-case properties.
 * Example: `brand: { primaryMuted: "#..." }` -> `--brand-primary-muted: #...`
 */
export function flattenToVariables(
  theme: Record<string, any>,
  prefix = '-',
): Record<string, string> {
  const vars: Record<string, string> = {};

  const traverse = (node: any, currentPrefix: string) => {
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        const value = node[key];

        // Match camelCase values and inject dash separator
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        const nextPrefix = `${currentPrefix}-${kebabKey}`;

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          traverse(value, nextPrefix);
        } else if (typeof value === 'string' || typeof value === 'number') {
          vars[nextPrefix] = String(value);
        }
      }
    }
  };

  traverse(theme, prefix);
  return vars;
}

/**
 * Produces the complete raw CSS variable declarations stylesheet for the DOM injection.
 */
export function buildThemeStylesheet(light: Theme, dark: Theme): string {
  const lightVars = flattenToVariables(light);
  const darkVars = flattenToVariables(dark);

  const lightRules = Object.entries(lightVars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  const darkRules = Object.entries(darkVars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  // Inject variables at root and alternate them natively when .dark class is active
  return `
:root {
${lightRules}
}

html.dark {
${darkRules}
}
  `.trim();
}
