## How state actually survives a tab switch

Before the implementation, it's worth being precise about *why* this works, because it determines every other design decision below.

React's reconciler decides whether to preserve or destroy a component instance based on exactly one thing: **whether the element at a given position in the tree has the same `type` and the same `key` as it did on the previous render.** If both match, React reuses the existing fiber — state, refs, effects, and any imperative object a `useRef` is holding (a WebSocket, a Three.js renderer, an `AudioContext`) all survive untouched. If either differs, React unmounts the old instance (running cleanup functions) and mounts a fresh one.

This means the "keep tabs alive" requirement has nothing to do with visibility, CSS, or any clever trick — it's satisfied entirely by:

1. Never removing a tab's element from the array you're rendering (removal = different tree shape = unmount).
2. Giving each tab a **stable `key`** across renders (a UUID assigned at creation time, not an array index — index keys break the moment tabs are reordered or one is closed).

Everything else — `display: none`, `inert`, pausing render loops — is about *efficiency and UX*, not correctness. The state-preservation guarantee is unconditional once those two rules hold. I'm calling this out explicitly because it simplifies a lot of the design below: you don't need `React.memo` gymnastics to preserve state, only to reduce wasted render calls.

## Module map

```
apps/desktop/src/features/tabs/
├── tabs.types.ts            # TabInstance, TabsState, TabsAction
├── tabsReducer.ts           # pure state transition function
├── TabsContext.tsx          # TabsProvider + useTabs() hook
├── tabRegistry.ts           # type → lazy-loaded component map
├── TabStrip.tsx             # the visual tab bar
├── TabStrip.module.css
├── TabsViewport.tsx         # the persistent-mount rendering layer
├── TabsViewport.module.css
├── TabPane.tsx              # per-tab wrapper (visibility + inert)
├── TabErrorBoundary.tsx     # per-tab fault isolation
├── useTabKeyboardShortcuts.ts
└── sessionPersistence.ts    # restore/persist open tabs across relaunch
```

## State container: reducer + Context, not an external store

| Option | Assessment |
|---|---|
| Multiple `useState` (tabs array, activeId, history separately) | Transitions like "close the active tab → activate the most-recently-used remaining one" need to read and update several pieces of state atomically. Spread across `useState` setters, this invites stale-closure bugs and makes the logic hard to unit test. |
| **`useReducer` + Context (chosen)** | All transition logic lives in one pure function you can test without rendering anything. State stays a single atomic object, so "close + reactivate" is one case in a switch statement, not three coordinated setters. No new dependency. |
| Zustand / Jotai | Better if tab state must be read outside the React tree (e.g., from an IPC handler) or if profiling shows Context re-renders are an actual bottleneck at your tab counts. For a shell-scoped concern with two consumers (`TabStrip`, `TabsViewport`), it's added surface area with no measured benefit yet. |
| Redux Toolkit | Justified only if the rest of the app already standardizes on Redux. Otherwise it's disproportionate to the problem. |

Your stack doc permits third-party dependencies "when useful or better" — this just isn't one of those cases yet. If tab count or consumer count grows enough that Context re-renders become measurable (profile before assuming), Zustand's selector-based subscriptions are the natural upgrade path, since the reducer logic ports over almost unchanged — it becomes the store's `set` implementation.

## Types and reducer

```ts
// tabs.types.ts
export interface TabParams {
  [key: string]: unknown;
}

export interface TabInstance {
  id: string;
  type: string;          // key into TAB_REGISTRY
  title: string;
  params: TabParams;      // passed as props to the tab's component
  closable: boolean;
  dedupeKey?: string;      // e.g. a conversation id — reused to avoid duplicate tabs
}

export interface TabsState {
  tabs: TabInstance[];
  activeTabId: string | null;
  history: string[];       // MRU stack of tab ids, most recent at the end
}

export type TabsAction =
  | { type: 'OPEN_TAB'; tabType: string; title: string; params?: TabParams; closable?: boolean; dedupeKey?: string; focus?: boolean }
  | { type: 'FOCUS_TAB'; id: string }
  | { type: 'CLOSE_TAB'; id: string }
  | { type: 'CLOSE_OTHERS'; id: string }
  | { type: 'CLOSE_ALL' }
  | { type: 'UPDATE_TAB_PARAMS'; id: string; params: TabParams }
  | { type: 'REORDER_TABS'; fromIndex: number; toIndex: number }
  | { type: 'RESTORE_SESSION'; state: TabsState };
```

```ts
// tabsReducer.ts
import type { TabsState, TabsAction, TabInstance } from './tabs.types';

function pushHistory(history: string[], id: string): string[] {
  return [...history.filter((h) => h !== id), id];
}

export const initialTabsState: TabsState = { tabs: [], activeTabId: null, history: [] };

export function tabsReducer(state: TabsState, action: TabsAction): TabsState {
  switch (action.type) {
    case 'OPEN_TAB': {
      if (action.dedupeKey) {
        const existing = state.tabs.find(
          (t) => t.type === action.tabType && t.dedupeKey === action.dedupeKey
        );
        if (existing) {
          if (action.focus === false) return state;
          return { ...state, activeTabId: existing.id, history: pushHistory(state.history, existing.id) };
        }
      }

      const id = crypto.randomUUID();
      const newTab: TabInstance = {
        id,
        type: action.tabType,
        title: action.title,
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
      return { ...state, activeTabId: action.id, history: pushHistory(state.history, action.id) };
    }

    case 'CLOSE_TAB': {
      const tabs = state.tabs.filter((t) => t.id !== action.id);
      const history = state.history.filter((h) => h !== action.id);
      let activeTabId = state.activeTabId;

      if (state.activeTabId === action.id) {
        // MRU reactivation (VS Code behavior): reopen whichever remaining tab
        // was viewed most recently, not necessarily the adjacent one.
        // For Chrome-style adjacent selection instead, replace this line with
        // an index lookup against `tabs` at the closed tab's former position.
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
      return { tabs, activeTabId: tabs[0]?.id ?? null, history: tabs[0] ? [tabs[0].id] : [] };
    }

    case 'UPDATE_TAB_PARAMS': {
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.id ? { ...t, params: { ...t.params, ...action.params } } : t
        ),
      };
    }

    case 'REORDER_TABS': {
      const tabs = [...state.tabs];
      const [moved] = tabs.splice(action.fromIndex, 1);
      tabs.splice(action.toIndex, 0, moved);
      return { ...state, tabs };
    }

    case 'RESTORE_SESSION':
      return action.state;

    default:
      return state;
  }
}
```

The MRU-close behavior deserves a note: Chrome activates the tab *to the right* on close (spatially predictable, but frequently reopens a tab you weren't looking at). VS Code activates the *last tab you actually viewed* (feels more correct when working across many tabs, but can feel spatially jumpy). I've implemented MRU since you referenced VS Code explicitly, and it's a one-line swap if you'd rather have Chrome's behavior — the comment marks exactly where.

## Provider

```tsx
// TabsContext.tsx
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { tabsReducer, initialTabsState } from './tabsReducer';
import { restoreSession, persistSession } from './sessionPersistence';
import type { TabsState, TabParams } from './tabs.types';

interface TabsContextValue {
  state: TabsState;
  openTab: (opts: { tabType: string; title: string; params?: TabParams; closable?: boolean; dedupeKey?: string; focus?: boolean }) => void;
  focusTab: (id: string) => void;
  closeTab: (id: string) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  updateTabParams: (id: string, params: TabParams) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    tabsReducer,
    initialTabsState,
    (init) => restoreSession() ?? init
  );

  useEffect(() => {
    persistSession(state);
  }, [state]);

  // Memoized on `state`: if TabsProvider re-renders for a reason unrelated to
  // tabs (e.g. its own parent re-rendering), this returns the same object
  // identity, so TabStrip/TabsViewport don't re-render on unrelated churn.
  const value = useMemo<TabsContextValue>(() => ({
    state,
    openTab: (opts) => dispatch({ type: 'OPEN_TAB', ...opts }),
    focusTab: (id) => dispatch({ type: 'FOCUS_TAB', id }),
    closeTab: (id) => dispatch({ type: 'CLOSE_TAB', id }),
    closeOthers: (id) => dispatch({ type: 'CLOSE_OTHERS', id }),
    closeAll: () => dispatch({ type: 'CLOSE_ALL' }),
    updateTabParams: (id, params) => dispatch({ type: 'UPDATE_TAB_PARAMS', id, params }),
    reorderTabs: (fromIndex, toIndex) => dispatch({ type: 'REORDER_TABS', fromIndex, toIndex }),
  }), [state]);

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used within a TabsProvider');
  return ctx;
}
```

I deliberately did **not** split this into a separate "list" context and "active id" context. Both `TabStrip` and `TabsViewport` — the only two consumers — need the full state on every relevant change anyway, so splitting would add indirection without reducing any actual re-render. The components that *do* need isolation from unrelated state churn are the individual tab contents, and those don't consume this context at all (see below) — that's where the real re-render boundary belongs.

## Registry and code-splitting

```ts
// tabRegistry.ts
import { lazy, type ComponentType } from 'react';

export interface TabDefinition {
  title: string;
  component: ComponentType<any>;
}

export const TAB_REGISTRY: Record<string, TabDefinition> = {
  chat: {
    title: 'Chat',
    component: lazy(() => import(/* webpackChunkName: "tab-chat" */ '../chat/ChatPanel')),
  },
  connections: {
    title: 'Connections',
    component: lazy(() => import(/* webpackChunkName: "tab-connections" */ '../connections/ConnectionsPanel')),
  },
  logs: {
    title: 'Logs',
    component: lazy(() => import(/* webpackChunkName: "tab-logs" */ '../logs/LogsPanel')),
  },
};
```

`React.lazy` + the Webpack magic comment gives each tab type its own chunk, so the initial bundle Electron parses at cold start only contains whatever tabs are open by default — not every panel the app will ever show. Adding a new tab type is a two-line registry entry; nothing else in the system needs to know it exists. That's the modularity story: `openTab({ tabType: 'logs', ... })` from anywhere in the tree is the entire integration surface.

Once a lazy chunk resolves, the module stays cached — switching away from and back to a tab never re-triggers the `import()`, only the first open pays that cost.

## Rendering layer: the actual persistence mechanism

```tsx
// TabPane.tsx
import { useEffect, useRef } from 'react';
import styles from './TabsViewport.module.css';

interface TabPaneProps {
  isActive: boolean;
  title: string;
  tabId: string;
  children: React.ReactNode;
}

export function TabPane({ isActive, title, tabId, children }: TabPaneProps) {
  const paneRef = useRef<HTMLDivElement>(null);

  // `inert` is a real DOM property in modern Chromium: when set, the subtree
  // is excluded from tab order, find-in-page, and focus — so a hidden pane
  // can't accidentally receive keyboard focus or be reached via Tab-key
  // navigation. Set imperatively via ref rather than as a JSX attribute to
  // sidestep inconsistent TS/JSX typing for boolean DOM attributes.
  useEffect(() => {
    if (paneRef.current) paneRef.current.inert = !isActive;
  }, [isActive]);

  return (
    <div
      ref={paneRef}
      id={`tabpanel-${tabId}`}
      role="tabpanel"
      aria-label={title}
      className={styles.tabPane}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
}
```

```tsx
// TabsViewport.tsx
import { Suspense } from 'react';
import { useTabs } from './TabsContext';
import { TAB_REGISTRY } from './tabRegistry';
import { TabPane } from './TabPane';
import { TabErrorBoundary } from './TabErrorBoundary';
import styles from './TabsViewport.module.css';

function TabPaneSkeleton() {
  return <div className={styles.paneSkeleton} />;
}

export function TabsViewport() {
  const { state } = useTabs();

  return (
    <div className={styles.viewport}>
      {state.tabs.map((tab) => {
        const definition = TAB_REGISTRY[tab.type];
        const isActive = tab.id === state.activeTabId;
        const Component = definition.component;

        return (
          <TabPane key={tab.id} tabId={tab.id} isActive={isActive} title={tab.title}>
            {/* Suspense scoped per-pane: a still-loading lazy chunk for tab B
                must not suspend (and blank) already-rendered tab A. */}
            <Suspense fallback={<TabPaneSkeleton />}>
              <TabErrorBoundary tabTitle={tab.title}>
                <Component {...tab.params} isActive={isActive} />
              </TabErrorBoundary>
            </Suspense>
          </TabPane>
        );
      })}
    </div>
  );
}
```

```css
/* TabsViewport.module.css */
.viewport {
  position: relative;
  flex: 1;
  min-height: 0; /* same overflow-suppression fix as .conversationList — a flex
                    child needs an explicit min-height: 0 or it refuses to
                    shrink below its content size and breaks the layout */
}
.tabPane {
  position: absolute;
  inset: 0;
  overflow: auto;
}
.paneSkeleton {
  position: absolute;
  inset: 0;
}
```

`key={tab.id}` is what guarantees instance survival (per the reconciliation rule above); `display: none` is what makes the switch visually instantaneous with zero remount cost; `inert` is what prevents a hidden pane from being reachable by keyboard while invisible. Each is doing a distinct job — none of the three substitutes for the others.

## Pausing expensive work without unmounting

`display: none` removes a pane from layout and paint, but it does **not** pause JavaScript. A `requestAnimationFrame` loop, a `setInterval`, or continuous WebGL rendering inside a hidden tab keeps consuming CPU/iGPU cycles for output nobody sees — directly relevant here given the avatar's breathing/blink/render loop sits on the iGPU render budget. That's what the `isActive` prop passed into `<Component />` above is for: it lets a tab's own content decide what to pause, distinct from what to keep running.

The distinction matters: **rendering work** should pause when hidden; **data subscriptions** generally should not, or you break things like unread-message badges for background tabs.

```tsx
// features/avatar/AvatarViewportTab.tsx — expensive render loop, should pause
import { useEffect, useRef } from 'react';
import styles from './AvatarViewportTab.module.css';

interface AvatarViewportTabProps {
  isActive: boolean;
  characterId?: string;
}

function AvatarViewportTab({ isActive, characterId }: AvatarViewportTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<{ renderFrame: () => void; dispose: () => void }>();

  // Setup is expensive (WebGL context, VRM load) and must survive tab
  // switches — this effect has no dependency on isActive, so it never tears
  // down on hide/show, only on characterId change or final unmount.
  useEffect(() => {
    rendererRef.current = createRenderer(canvasRef.current!, characterId);
    return () => rendererRef.current?.dispose();
  }, [characterId]);

  // The render loop IS gated: no requestAnimationFrame ticks at all while
  // hidden, not merely skipped work inside a still-running tick. Restarts
  // cleanly the moment the tab is refocused.
  useEffect(() => {
    if (!isActive) return;
    let rafId: number;
    const tick = () => {
      rendererRef.current?.renderFrame();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isActive]);

  return <canvas ref={canvasRef} className={styles.avatarCanvas} />;
}

export default AvatarViewportTab;
```

```tsx
// features/chat/ChatPanel.tsx — no render loop, isActive is irrelevant here
interface ChatPanelProps {
  isActive: boolean; // received, intentionally unused
  conversationId: string;
}

function ChatPanel({ conversationId }: ChatPanelProps) {
  // Keeps receiving messages regardless of visibility — this is what makes
  // unread counts and streamed responses correct for a backgrounded tab.
  const messages = useConversationMessages(conversationId);
  return <MessageList messages={messages} />;
}

export default ChatPanel;
```

Not every tab needs to consume `isActive` — `ChatPanel` ignores it entirely, and that's correct, not an oversight. Thread it through only where there's genuinely expensive continuous work to gate.

## Tab strip UI, accessibility, keyboard shortcuts

```tsx
// TabStrip.tsx
import { useTabs } from './TabsContext';
import styles from './TabStrip.module.css';

export function TabStrip() {
  const { state, focusTab, closeTab } = useTabs();

  return (
    <div className={styles.strip} role="tablist" aria-label="Open tabs">
      {state.tabs.map((tab) => {
        const isActive = tab.id === state.activeTabId;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => focusTab(tab.id)}
            onMouseDown={(e) => {
              if (e.button === 1 && tab.closable) closeTab(tab.id); // middle-click close, Chrome parity
            }}
          >
            <span className={styles.tabTitle}>{tab.title}</span>
            {tab.closable && (
              <button
                className={styles.tabClose}
                aria-label={`Close ${tab.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

```css
/* TabStrip.module.css */
.strip {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  flex-shrink: 0; /* fixed-size sibling — same pattern already established
                     for other siblings of a min-height:0 scrollable region */
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  cursor: pointer;
  user-select: none;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.tabActive {
  border-bottom-color: var(--accent-color, #10B981);
}
.tabClose {
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 1;
}
```

`overflow-x: auto` on the strip handles many-tabs scaling without a custom overflow menu — acceptable up to a few dozen tabs; beyond that a VS Code-style ">>" dropdown becomes worth building (noted below as an extension point rather than built now, since you don't have that requirement yet).

```ts
// useTabKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useTabs } from './TabsContext';

export function useTabKeyboardShortcuts() {
  const { state, focusTab, closeTab } = useTabs();

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === 'Tab') {
        e.preventDefault();
        if (state.tabs.length < 2) return;
        const idx = state.tabs.findIndex((t) => t.id === state.activeTabId);
        const next = e.shiftKey
          ? state.tabs[(idx - 1 + state.tabs.length) % state.tabs.length]
          : state.tabs[(idx + 1) % state.tabs.length];
        focusTab(next.id);
      }

      if (isMod && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (state.activeTabId) closeTab(state.activeTabId);
      }

      if (isMod && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const tab = state.tabs[Number(e.key) - 1];
        if (tab) focusTab(tab.id);
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [state, focusTab, closeTab]);
}
```

This listener re-subscribes on every state change (needed so the closure sees fresh `tabs`/`activeTabId`). At this scale (one global `keydown` listener, add/remove is cheap) that's fine; if it ever needs optimizing, the standard fix is holding `state` in a ref updated via a separate effect and reading `ref.current` inside a single, never-resubscribing listener. Not worth the indirection until profiling says otherwise. Since this listens on `window` inside the renderer, it's naturally scoped to whichever BrowserWindow has OS focus — no IPC or `globalShortcut` registration needed.

## Fault isolation

```tsx
// TabErrorBoundary.tsx
import { Component, type ReactNode } from 'react';
import styles from './TabsViewport.module.css';

interface Props {
  tabTitle: string;
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class TabErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[Tab: ${this.props.tabTitle}] render error`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.tabError}>
          <p>Something went wrong in "{this.props.tabTitle}".</p>
          <button onClick={() => this.setState({ error: null })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Without this, an uncaught render error in one tab (a failed WebSocket handshake in `ConnectionsPanel`, a malformed vision payload in an image-result tab) unmounts the entire nearest boundary — which, absent per-tab boundaries, is the whole shell, taking down every other open tab and the nav panel with it. React doesn't yet offer a hook-based equivalent, so this has to stay a class component.

## Session persistence across relaunch

```ts
// sessionPersistence.ts
import type { TabsState } from './tabs.types';

const STORAGE_KEY = 'HILM_TABS_SESSION';

export function restoreSession(): TabsState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TabsState;
    if (!Array.isArray(parsed.tabs)) return null; // defensive: corrupt/stale blob shouldn't break startup
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
      // quota exceeded or non-serializable params — non-fatal, session just won't restore
    }
  }, 300);
}
```

This mirrors the existing `HILM_LAST_SERVER_PROFILE` pattern in `NetworkContext` — same storage key convention, same "read on mount, write debounced on change" shape.

Two constraints this implies, worth stating explicitly: `tab.params` must stay JSON-serializable if you want that tab restorable (no live object references, callbacks, or class instances), and restoration only reconstructs *which tabs are open and what type/params they had* — not any internal state a tab's own component accumulated at runtime (scroll position, unsent draft text). If that needs to survive a relaunch too, the tab component persists it itself, keyed by its own id or params — out of scope for the tab system proper.

## Design review

| Requirement | How it's satisfied |
|---|---|
| **Efficient** | Hidden panes cost zero layout/paint (`display: none`); expensive per-tab work (RAF loops) fully stops rather than idling (`isActive`-gated effect, not a skip-inside-loop); lazy-loaded chunks keep cold-start bundle size down to only what's open. |
| **Effective** | Reconciliation's key+type rule gives an unconditional state-preservation guarantee — not dependent on memoization being correctly applied. |
| **Practical** | No new dependency for the core mechanism; reuses your existing localStorage/session pattern and flexbox `min-height: 0` convention rather than inventing new idioms. |
| **Modular** | Adding a tab type is a two-line registry entry plus an `openTab()` call from anywhere in the tree; the provider, viewport, and strip never change. |
| **Scalable** | Reducer centralizes all transition logic as pure, independently testable functions; horizontal-scroll strip and MRU history handle dozens of tabs without redesign. |
| **Stable** | Per-tab error boundaries stop one tab's crash from taking down the shell; defensive parsing on session restore stops a corrupted persisted blob from breaking startup. |

**Deliberately out of scope** (flagging as extension points rather than building speculatively):

| Not implemented | When to add it | Rough approach |
|---|---|---|
| Split panes / multiple tab groups (VS Code editor groups) | If you need side-by-side tabs | Generalize `TabsState` to `groups: TabGroupState[]`, each an independent `{ tabs, activeTabId, history }`; `TabsViewport` renders one region per group. |
| Drag-to-reorder gesture | If tab order matters enough to justify the UX cost | `REORDER_TABS` action already exists; wire it to a drag library (`@dnd-kit` is a reasonable fit — accessible, no CSS framework assumptions, compatible with CSS Modules). |
| Tab overflow dropdown | Once horizontal scroll feels cramped at your typical tab count | Measure strip width vs. content width; tabs beyond the visible set collapse into a `>>` menu, same as VS Code. |
| DOM-level hibernation for very high tab counts (100+) | Only if profiling shows hidden-pane DOM footprint is a real memory problem | Beyond some inactive-duration threshold, serialize `params` + minimal restoration state, then actually unmount (`CLOSE_TAB`-equivalent) rather than merely hiding; restore via `OPEN_TAB` on refocus. This is a genuine remount, but one that's rare and cheap relative to the memory it reclaims. |
| Type-safe per-tab params (currently `Record<string, unknown>`) | If the number of tab types grows and prop mismatches start causing bugs | Convert `TAB_REGISTRY` to a discriminated union keyed by `tab.type`, so `openTab({ tabType: 'chat', params: {...} })` gets compile-time-checked against `ChatPanelProps`. |

None of these are missing gaps in what you asked for — they're the correct next increments if and when the corresponding need actually shows up, rather than complexity paid for upfront.