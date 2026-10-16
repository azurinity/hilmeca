/**
 * Calculates the approximate relative luminance of a color string.
 * Uses the standardized WCAG 2.x relative luminance formula:
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */

export function getRelativeLuminance(colorString: string): number {
  // Return -1 for transparent colors to signal fallback
  if (!colorString || colorString === 'transparent' || colorString.includes('rgba(0, 0, 0, 0)')) {
    return -1;
  }

  // Parse RGB or RGBA from browser getComputedStyle output
  const matches = colorString.match(/\d+/g);
  if (!matches || matches.length < 3) return -1;

  const r = parseInt(matches[0], 10) / 255;
  const g = parseInt(matches[1], 10) / 255;
  const b = parseInt(matches[2], 10) / 255;

  // Linearize sRGB values
  const [rL, gL, bL] = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}
