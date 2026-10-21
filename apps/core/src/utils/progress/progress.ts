export interface ProgressRangeInput {
  minValue?: number;
  value?: number;
  maxValue?: number;
}

export interface ProgressRange {
  minVl: number;
  vl: number;
  maxVl: number;
  /** Normalized ratio in the range 0..1. */
  progress: number;
}

const DEFAULT_MIN_VALUE = 0;
const DEFAULT_VALUE = 0;
const DEFAULT_MAX_VALUE = 1;

function toFiniteNumber(input: number | undefined, fallback: number): number {
  return typeof input === 'number' && Number.isFinite(input) ? input : fallback;
}

function clamp(input: number, min: number, max: number): number {
  return Math.min(Math.max(input, min), max);
}

/**
 * Sanitizes a min/value/max triple and computes its normalized progress.
 * Never returns NaN: invalid input falls back to defaults and an empty range yields 0.
 * Idempotent: resolving an already resolved range returns the same range.
 */
export function resolveProgressRange({
  minValue,
  value,
  maxValue,
}: ProgressRangeInput): ProgressRange {
  const minVl = toFiniteNumber(minValue, DEFAULT_MIN_VALUE);
  const maxVl = Math.max(toFiniteNumber(maxValue, DEFAULT_MAX_VALUE), minVl);
  const vl = clamp(toFiniteNumber(value, DEFAULT_VALUE), minVl, maxVl);

  const span = maxVl - minVl;
  const progress = span > 0 ? (vl - minVl) / span : 0;

  return { minVl, vl, maxVl, progress };
}

/**
 * Resolves a threshold in the same units as the range. When omitted, it falls back
 * to `defaultRatio` of the range, and the result is always clamped inside the range.
 */
export function resolveProgressThreshold(
  threshold: number | undefined,
  defaultRatio: number,
  { minVl, maxVl }: Pick<ProgressRange, 'minVl' | 'maxVl'>,
): number {
  const fallback = minVl + (maxVl - minVl) * defaultRatio;
  return clamp(toFiniteNumber(threshold, fallback), minVl, maxVl);
}
