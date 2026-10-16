import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import type { ResolvableIconInput, ResolvableIconProps } from '../../components/icon';

import { tabsReducer, initialTabsState } from './tabsReducer';
import { restoreSession, persistSession } from './sessionPersistence';
import type { TabsState, TabParams } from './tabs.types';

export interface OpenTabOptions {
  tabType: string;
  title?: string;
  icon?: ResolvableIconInput | ResolvableIconProps;
  params?: TabParams;
  closable?: boolean;
  dedupeKey?: string;
  focus?: boolean;
}

export interface TabsContextValue {
  state: TabsState;
  openTab: (opts: OpenTabOptions) => void;
  focusTab: (id: string) => void;
  closeTab: (id: string) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  patchTab: (id: string, patch: { title?: string; icon?: string; params?: TabParams }) => void;
  updateTabParams: (id: string, params: TabParams) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
}

export interface TabsProviderProps {
  children: ReactNode;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function TabsProvider({ children }: TabsProviderProps) {
  const [state, dispatch] = useReducer(
    tabsReducer,
    initialTabsState,
    (init) => restoreSession() ?? init,
  );

  useEffect(() => {
    persistSession(state);
  }, [state]);

  const value = useMemo<TabsContextValue>(
    () => ({
      state,
      openTab: (opts) => dispatch({ type: 'OPEN_TAB', ...opts }),
      focusTab: (id) => dispatch({ type: 'FOCUS_TAB', id }),
      closeTab: (id) => dispatch({ type: 'CLOSE_TAB', id }),
      closeOthers: (id) => dispatch({ type: 'CLOSE_OTHERS', id }),
      closeAll: () => dispatch({ type: 'CLOSE_ALL' }),
      patchTab: (id, patch) => dispatch({ type: 'PATCH_TAB', id, ...patch }),
      updateTabParams: (id, params) => dispatch({ type: 'UPDATE_TAB_PARAMS', id, params }),
      reorderTabs: (fromIndex, toIndex) => dispatch({ type: 'REORDER_TABS', fromIndex, toIndex }),
    }),
    [state],
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used within a TabsProvider');

  return ctx;
}
