import { useSyncExternalStore } from 'react';
import { BREAKPOINT_MIN_WIDTH, SCALE_FACTOR_KEYS, type ScaleFactor } from './screen-scaling';

export type SizeTier = ScaleFactor; // 'sfa' | 'sfb' | 'sfc' | 'sfd' | 'sfe'
export type SizeTierMode = 'auto' | 'manual';
export type SizeTierSetting = 'auto' | SizeTier;

// Match auto-mode width thresholds defined in generate-css-tokens.ts
function resolveAutoTier(width: number): SizeTier {
  if (width >= BREAKPOINT_MIN_WIDTH.xxl) return 'sfe';
  if (width >= BREAKPOINT_MIN_WIDTH.lg) return 'sfd';
  if (width >= BREAKPOINT_MIN_WIDTH.md) return 'sfc';
  if (width >= BREAKPOINT_MIN_WIDTH.xs) return 'sfb';
  return 'sfa';
}

/** Pure JS: Get active mode ('auto' or 'manual') */
export function getSizeTierMode(): SizeTierMode {
  if (typeof document === 'undefined') return 'manual';
  const attr = document.documentElement.getAttribute('data-size-tier');
  return attr === 'auto' ? 'auto' : 'manual';
}

/** Pure JS: Get resolved tier ('sfa'..'sfe'), evaluating window width if in auto mode */
export function getActiveSizeTier(): SizeTier {
  if (typeof window === 'undefined') return 'sfc';
  const attr = document.documentElement.getAttribute('data-size-tier');

  if (attr === 'auto') {
    return resolveAutoTier(window.innerWidth);
  }

  if (attr && (SCALE_FACTOR_KEYS as readonly string[]).includes(attr)) {
    return attr as SizeTier;
  }

  // Default fallback when attribute is missing or invalid
  return 'sfc';
}

/** Pure JS: Update active tier or set mode to 'auto' */
export function setSizeTier(setting: SizeTierSetting): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-size-tier', setting);
}

// React 18 external store subscription (handles window resizes + DOM attribute changes)
function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-size-tier') {
        callback();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-size-tier'],
  });

  window.addEventListener('resize', callback);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', callback);
  };
}

/** React Hook: Reactively consumes mode, resolved active tier, and setter */
export function useSizeTier() {
  const mode = useSyncExternalStore(subscribe, getSizeTierMode, () => 'manual' as SizeTierMode);

  const activeTier = useSyncExternalStore(subscribe, getActiveSizeTier, () => 'sfc' as SizeTier);

  return {
    mode,
    activeTier,
    setSizeTier,
  };
}
