import type { TabsState } from './tabs.types';

const STORAGE_KEY = 'TABS_SESSION_V1';
const DEBOUNCE_MS = 300;

export function restoreSession(): TabsState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TabsState;
    
    if (!parsed || !Array.isArray(parsed.tabs) || !Array.isArray(parsed.history)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

let writeTimer: ReturnType<typeof setTimeout> | undefined;

export function persistSession(state: TabsState): void {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      console.log("Quota exceeded or a tab's params is non-serializable.")
    }
  }, DEBOUNCE_MS);
}
