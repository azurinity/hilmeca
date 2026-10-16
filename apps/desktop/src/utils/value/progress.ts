export type ProgressValue = {
  min: number;
  current: number;
  max: number;
};

export type ProgressRange = {
  min: number;
  current: number;
  max: number;
  progress: number;
  progressClamped: number;
};

export type ProgressRangeInput = {
  min: number;
  current?: number;
  max: number;
  progress?: number;
};

export function newValue(): ProgressValue {
  return {
    min: 0,
    current: 0,
    max: 1,
  };
}

export function newRange(): ProgressRange {
  return {
    min: 0,
    current: 0,
    max: 1,
    progress: 0,
    progressClamped: 0,
  };
}

export function newRangeInput(): ProgressRangeInput {
  return {
    min: 0,
    current: 0,
    max: 1,
    progress: 0,
  };
}

export function isProgressValue(test: unknown): test is ProgressValue {
  if (typeof test !== 'object' || test === null) return false;

  if (!('min' in test) || typeof test.min !== 'number') return false;
  if (!('current' in test) || typeof test.current !== 'number') return false;
  if (!('max' in test) || typeof test.max !== 'number') return false;

  return true;
}

export function isProgressRange(test: unknown): test is ProgressRange {
  if (typeof test !== 'object' || test === null) return false;

  if (!('min' in test) || typeof test.min !== 'number') return false;
  if (!('current' in test) || typeof test.current !== 'number') return false;
  if (!('max' in test) || typeof test.max !== 'number') return false;
  if (!('progress' in test) || typeof test.progress !== 'number') return false;
  if (!('progressClamped' in test) || typeof test.progressClamped !== 'number') return false;

  return true;
}

export function newProgressValue(progress: ProgressValue): ProgressValue {
  const progressVl = typeof progress === 'object' ? progress : newValue();
  const minVl = typeof progressVl?.min === 'number' ? progressVl?.min : 0;
  const maxVl = typeof progressVl?.max === 'number' ? Math.max(progressVl?.max, minVl) : 1;
  const currentVl =
    typeof progressVl?.current === 'number'
      ? Math.max(Math.min(progressVl?.current, maxVl), minVl)
      : minVl;

  return {
    min: minVl,
    current: currentVl,
    max: maxVl,
  };
}

export function getProgressValueRange(progress: ProgressValue | ProgressRange): number | undefined {
  if (typeof progress !== 'object') return undefined;

  const minVl = typeof progress?.min === 'number' ? progress?.min : 0;
  const maxVl = typeof progress?.max === 'number' ? Math.max(progress?.max, minVl) : 1;

  return maxVl - minVl;
}

export function getNormalizedProgress(
  progress: ProgressValue,
  clamp?: boolean,
): number | undefined {
  if (typeof progress !== 'object') return undefined;

  const minVl = typeof progress?.min === 'number' ? progress?.min : 0;
  const maxVl = typeof progress?.max === 'number' ? Math.max(progress?.max, minVl) : 1;
  const currentVl =
    typeof progress?.current === 'number'
      ? Math.max(Math.min(progress?.current, maxVl), minVl)
      : minVl;
  const prog = (currentVl - minVl) / (maxVl - minVl);

  return clamp ? Math.max(Math.min(prog, 1), 0) : prog;
}

export function newProgressRange(input: ProgressRangeInput): ProgressRange {
  const inp = typeof input === 'object' ? input : newRangeInput();
  const minVl = typeof inp?.min === 'number' ? inp?.min : 0;
  const maxVl = typeof inp?.max === 'number' ? Math.max(inp?.max, minVl) : 1;
  const currentVl =
    typeof inp?.current === 'number' ? Math.max(Math.min(inp?.current, maxVl), minVl) : minVl;
  const progress = typeof inp?.progress === 'number' ? Math.max(Math.min(inp?.progress, 1), 0) : 0;
  const vlFromProgress = progress * (maxVl - minVl) + minVl;
  const progressNormalized =
    getNormalizedProgress({ min: minVl, current: currentVl, max: maxVl }) ?? 0;
  const progressVlClamped = Math.max(Math.min(progressNormalized, 1), 0);
  const progressClamped = Math.max(Math.min(progress, 1), 0);
  const useValueInstead = typeof inp?.current === 'number';

  return {
    min: minVl,
    current: useValueInstead ? currentVl : vlFromProgress,
    max: maxVl,
    progress: useValueInstead ? progressNormalized : progress,
    progressClamped: useValueInstead ? progressVlClamped : progressClamped,
  };
}
