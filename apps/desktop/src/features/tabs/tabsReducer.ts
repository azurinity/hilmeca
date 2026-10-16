import type { TabsState, TabsAction, TabInstance } from './tabs.types';
import { TAB_REGISTRY } from './tabRegistry';

function pushHistory(history: string[], id: string): string[] {
  return [...history.filter((h) => h !== id), id];
}

export const initialTabsState: TabsState = {
  tabs: [],
  activeTabId: null,
  history: [],
};

export function tabsReducer(state: TabsState, action: TabsAction): TabsState {
  switch (action.type) {
    case 'OPEN_TAB': {
      if (action.dedupeKey) {
        const existing = state.tabs.find(
          (t) => t.type === action.tabType && t.dedupeKey === action.dedupeKey,
        );

        if (existing) {
          if (action.focus === false) return state;

          return {
            ...state,
            activeTabId: existing.id,
            history: pushHistory(state.history, existing.id),
          };
        }
      }

      const definition = TAB_REGISTRY[action.tabType];

      const id = crypto.randomUUID();
      const newTab: TabInstance = {
        id,
        type: action.tabType,
        title: action.title ?? definition?.title ?? '',
        icon: action.icon ?? definition?.icon ?? undefined,
        params: action.params ?? {},
        closable: action.closable ?? true,
        dedupeKey: action.dedupeKey,
      };
      const focus = action.focus ?? true;

      return {
        tabs: [...state.tabs, newTab],
        activeTabId: focus ? id : state.activeTabId,
        history: focus ? pushHistory(state.history, id) : state.history,
      };
    }

    case 'FOCUS_TAB': {
      if (!state.tabs.some((t) => t.id === action.id)) return state;

      return {
        ...state,
        activeTabId: action.id,
        history: pushHistory(state.history, action.id),
      };
    }

    case 'CLOSE_TAB': {
      const tabs = state.tabs.filter((t) => t.id !== action.id);
      const history = state.history.filter((h) => h !== action.id);
      let activeTabId = state.activeTabId;

      if (state.activeTabId === action.id) {
        activeTabId = history.length > 0 ? history[history.length - 1] : null;
      }
      return { tabs, activeTabId, history };
    }

    case 'CLOSE_OTHERS': {
      if (!state.tabs.some((t) => t.id === action.id)) return state;

      const tabs = state.tabs.filter((t) => t.id === action.id || !t.closable);
      return { tabs, activeTabId: action.id, history: [action.id] };
    }

    case 'CLOSE_ALL': {
      const tabs = state.tabs.filter((t) => !t.closable);
      return {
        tabs,
        activeTabId: tabs[0]?.id ?? null,
        history: tabs[0] ? [tabs[0].id] : [],
      };
    }

    case 'PATCH_TAB': {
      return {
        ...state,
        tabs: state.tabs.map((t) => {
          if (t.id !== action.id) return t;
          return {
            ...t,
            ...(action.title !== undefined ? { title: action.title } : {}),
            ...(action.icon !== undefined ? { icon: action.icon } : {}),
            ...(action.params !== undefined ? { params: { ...t.params, ...action.params } } : {}),
          };
        }),
      };
    }

    case 'UPDATE_TAB_PARAMS': {
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.id ? { ...t, params: { ...t.params, ...action.params } } : t,
        ),
      };
    }

    case 'REORDER_TABS': {
      const tabs = [...state.tabs];
      const [moved] = tabs.splice(action.fromIndex, 1);

      if (moved) tabs.splice(action.toIndex, 0, moved);
      return { ...state, tabs };
    }

    case 'RESTORE_SESSION':
      return action.state;

    default:
      return state;
  }
}
