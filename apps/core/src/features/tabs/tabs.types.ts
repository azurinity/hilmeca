import type { ResolvableIconInput, ResolvableIconProps } from '../../components/icon';

export interface TabIconParams {
  strokeWidth: number;
}

export interface TabParams {
  [key: string]: unknown;
}

export interface TabInstance {
  id: string;
  type: string;
  title: string;
  icon?: ResolvableIconInput | ResolvableIconProps;
  params: TabParams;
  closable: boolean;
  dedupeKey?: string;
}

export interface TabsState {
  tabs: TabInstance[];
  activeTabId: string | null;
  history: string[];
}

export type TabsAction =
  | {
      type: 'OPEN_TAB';
      tabType: string;
      title?: string;
      icon?: ResolvableIconInput | ResolvableIconProps;
      params?: TabParams;
      closable?: boolean;
      dedupeKey?: string;
      focus?: boolean;
    }
  | { type: 'FOCUS_TAB'; id: string }
  | { type: 'CLOSE_TAB'; id: string }
  | { type: 'CLOSE_OTHERS'; id: string }
  | { type: 'CLOSE_ALL' }
  | { type: 'PATCH_TAB'; id: string; title?: string; icon?: string; params?: TabParams }
  | { type: 'UPDATE_TAB_PARAMS'; id: string; params: TabParams }
  | { type: 'REORDER_TABS'; fromIndex: number; toIndex: number }
  | { type: 'RESTORE_SESSION'; state: TabsState };

  // --- Tab component contract -------------------------------------------
//
// What TabsViewport actually passes to a registered component:
// <Component {...tab.params} isActive={isActive} tabId={tab.id} />
// isActive/tabId are always present; params spreads on top of them.

/** The three fields every tab component receives regardless of its own
 *  params shape. Not meant to be used bare — see TabComponentProps. */
export interface TabComponentBaseProps {
  isActive: boolean;
  tabId: string;
}

/** Full prop type for a tab component: its own params shape intersected
 *  with the base props TabsViewport always supplies.
 *
 *  Usage:
 *    interface ChatViewParams extends TabParams {
 *      conversationId: string;
 *    }
 *    type ChatViewProps = TabComponentProps<ChatViewParams>;
 *
 *  Defaults to bare TabParams if the component doesn't need typed
 *  params at all — TabComponentProps<> then behaves like
 *  TabComponentBaseProps with an open params shape allowed through. */
export type TabComponentProps<TParams extends TabParams = TabParams> = TParams &
  TabComponentBaseProps;

// --- Tab activation contract --------------------------------------------
//
// What useTabActivation() returns — opt-in, delivered via Context inside
// TabPane, not as a prop. Only tabs that call the hook receive this.

export interface TabActivationValue {
  isActive: boolean;
  /** Increments right after this pane transitions from hidden to visible —
   *  see useTabActivation.ts for the full rationale. */
  activationCount: number;
}