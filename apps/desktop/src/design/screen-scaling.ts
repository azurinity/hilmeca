// 1. Single Source of Truth for Scale Factors using a Const Tuple
export const SCALE_FACTOR_KEYS = ['sfa', 'sfb', 'sfc', 'sfd', 'sfe'] as const;
export type ScaleFactor = (typeof SCALE_FACTOR_KEYS)[number];

// 2. Mapped Type for ScaleFactors
export type ScaleFactors = Record<ScaleFactor, number>;

// 3. Single Source of Truth for Breakpoint Sizes
export const BREAKPOINT_KEYS = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
export type Breakpoint = (typeof BREAKPOINT_KEYS)[number];

// 4. Mapped Type for ValueScales (Partial allows optional keys)
export type ValueScales = Partial<Record<Breakpoint, ScaleFactors>>;

/**
 * Min-width thresholds (px) that drive the generated `@media` queries.
 * `xxs` intentionally has no entry — it's the unconditional `:root` base
 * (mobile-first cascade: narrowest tier applies until a wider one matches).
 *
 * These are placeholders sized for a resizable desktop window, not a phone
 * viewport — adjust to your actual minimum/typical/maximum window widths.
 */
export const BREAKPOINT_MIN_WIDTH: Record<Exclude<Breakpoint, 'xxs'>, number> = {
  xs: 480,
  sm: 640,
  md: 800,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};
