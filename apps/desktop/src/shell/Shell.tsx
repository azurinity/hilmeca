import React, { useState, useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx';
import styles from './Shell.module.css';

import { useTheme } from '../theme/ThemeProvider';
import { useAppWindow } from '../context/AppWindowContext';
import { TabsViewport, useTabs } from '../features/tabs';
import { ContentScaleButton, ScaleButton } from '../components/button';
import { ResolvableIcon, type ResolvableIconInput } from '../components/icon';

import {
  NavigationPanel,
  type CategoryItemGroup,
  type ConversationItem,
  type NavBottomItem,
} from './NavigationPanel';
import { NavigationCluster } from './NavigationCluster';
import { RibbonButton } from './RibbonButton';
import { TabButton } from './TabButton';

export type RibbonItem = {
  key?: string;
  icon?: ResolvableIconInput;
  text?: string;
  selected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
};

export type TabItem = {
  key?: string;
  icon?: ResolvableIconInput;
  text?: string;
  description?: string;
  selected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
};

// Below this viewport width, NavigationPanel is always option (2) (overlay,
// no layout space) regardless of the `isDocked` preference.
const NARROW_VIEWPORT_BREAKPOINT = 840;

// Must match NavigationPanel.module.css's `.panelWrapper.collapsed`
// transition duration (240ms). Used to defer the option (1) -> (2) switch
// until the collapse animation has visually finished.
const COLLAPSE_ANIMATION_MS = 240;

export const Shell: React.FC = () => {
  const { theme } = useTheme();
  const { windowTitle, windowIcon, windowTitleVisible, windowIconVisible, windowInfoVisible } =
    useAppWindow();
  const { state, focusTab, closeTab } = useTabs();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isPanelHovered, setIsPanelHovered] = useState(false);

  const windowTitleNotEmpty = typeof windowTitle === 'string' && windowTitle.trim().length >= 1;
  const windowIconNotEmpty = typeof windowIcon === 'string' && windowIcon.trim().length >= 1;
  const finalWindowTitleVisible = windowTitleVisible && windowTitleNotEmpty;
  const finalWindowIconVisible = windowIconVisible && windowIconNotEmpty;

  // Option (1) vs option (2) preference. Only meaningful when the viewport
  // is wide enough — see `panelTakesSpace` below, which is the value that
  // actually gets consumed.
  const [isDocked, setIsDocked] = useState(true);

  const [isNarrowViewport, setIsNarrowViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < NARROW_VIEWPORT_BREAKPOINT,
  );
  const prevNarrowRef = useRef(isNarrowViewport);

  // Tracks the pending "flip to option (2) after collapse finishes"
  // timeout scheduled by handleMenuButtonClick, so a later state change
  // (reopening the panel by any means) can cancel a now-stale flip.
  const dockCollapseTimeoutRef = useRef<number | null>(null);

  const clearDockCollapseTimeout = useCallback(() => {
    if (dockCollapseTimeoutRef.current !== null) {
      window.clearTimeout(dockCollapseTimeoutRef.current);
      dockCollapseTimeoutRef.current = null;
    }
  }, []);

  const handleMinimize = () => window.electronAPI.minimizeWindow();
  const handleMaximize = () => window.electronAPI.maximizeWindow();
  const handleClose = () => window.electronAPI.closeWindow();

  // The single source of truth for "does the panel actually occupy space in
  // the Shell's flex layout right now". Narrow viewports force overlay mode
  // unconditionally; otherwise it follows the docked preference.
  const panelTakesSpace = !isNarrowViewport && isDocked;

  useEffect(() => {
    const handleResize = () => {
      const narrow = window.innerWidth < NARROW_VIEWPORT_BREAKPOINT;
      if (narrow === prevNarrowRef.current) return;

      prevNarrowRef.current = narrow;
      setIsNarrowViewport(narrow);

      if (!narrow) {
        // Returning to a wide viewport always resumes the option (1)
        // default, so a docked/overlay flag left over from narrow-mode
        // interactions doesn't leak back in unpredictably.
        setIsDocked(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Any time the panel opens — by click, peek-hover, or otherwise — a
  // previously scheduled "flip to option (2)" timeout is no longer valid
  // (it was scheduled for a panel that's since been reopened as docked).
  useEffect(() => {
    if (isPanelOpen) {
      clearDockCollapseTimeout();
    }
  }, [isPanelOpen, clearDockCollapseTimeout]);

  useEffect(() => () => clearDockCollapseTimeout(), [clearDockCollapseTimeout]);

  const handleMenuButtonClick = useCallback(() => {
    // Cancel any pending option-switch from a previous collapse click —
    // this click supersedes it regardless of which branch runs below.
    clearDockCollapseTimeout();

    if (isNarrowViewport) {
      setIsPanelOpen((prev) => !prev);
      return;
    }

    if (isPanelOpen && !isDocked) {
      // Peek overlay -> pin into option (1), stay expanded, no animation
      // (width/transform values don't change across this call).
      setIsDocked(true);
      return;
    }

    if (isPanelOpen && isDocked) {
      // Docked + expanded -> collapse. `isDocked` is deliberately left
      // `true` for the duration of the animation: this keeps
      // `panelTakesSpace` true while the width transitions to 0, so
      // `.contents` reflows gradually in step with the panel's own
      // collapse (the same width-driven-reflow mechanism used everywhere
      // else). Only once the panel has visually finished collapsing —
      // and is therefore already invisible at width: 0 — do we flip it
      // to option (2). At that point the position: static -> absolute
      // switch causes no visible jump, since a 0-width panel looks
      // identical in either layout mode.
      setIsPanelOpen(false);
      dockCollapseTimeoutRef.current = window.setTimeout(() => {
        setIsDocked(false);
        dockCollapseTimeoutRef.current = null;
      }, COLLAPSE_ANIMATION_MS);
      return;
    }

    // Collapsed -> expand directly into option (1), docked.
    setIsDocked(true);
    setIsPanelOpen(true);
  }, [isNarrowViewport, isPanelOpen, isDocked, clearDockCollapseTimeout]);

  const handleMenuHoverEnter = useCallback(() => setIsMenuHovered(true), []);
  const handleMenuHoverLeave = useCallback(() => setIsMenuHovered(false), []);
  const handlePanelHoverEnter = useCallback(() => setIsPanelHovered(true), []);
  const handlePanelHoverLeave = useCallback(() => setIsPanelHovered(false), []);

  const navCategoryItems: CategoryItemGroup[] = [
    [
      {
        icon: 'MessagesSquare',
        text: 'Conversations',
      },
      {
        icon: 'Waypoints',
        text: 'Connection',
      },
    ],
    [
      {
        icon: 'LibraryBig',
        text: 'Library',
      },
      {
        icon: 'Wrench',
        text: 'Configure',
      },
    ],
  ];

  const navConvoItemsTest: ConversationItem[] = [
    { text: 'Optimizing React Native FlatList Performance' },
    { text: 'TypeScript Discriminated Unions in AST Nodes' },
    { text: 'Debugging Electron Main vs Renderer IPC' },
    { text: 'Configuring Webpack Dev Server Custom Ports' },
    { text: 'Designing Roblox Luau ModuleScript Architecture' },
    { text: 'Building Custom Layout Engines in Canvas' },
    { text: 'Implementing AES-256-GCM Payload Encryption' },
    { text: 'State Management Trade-offs: Zustand vs Redux' },
    { text: 'Setting Up PNPM Monorepo Workspace Bundling' },
    { text: 'Wireless ADB Screen Streaming Parameters' },
    { text: 'Parsing Expressions with Pratt Parsing in TS' },
    { text: 'Roblox Day/Night Cycle and Lighting Optimization' },
    { text: 'Configuring Cloudflare Pages Serverless Routing' },
    { text: 'Local LLM Inference with Ollama & LangChain' },
    { text: 'Zustand Persistence & IPC Sync in Electron' },
    { text: 'Expo Router vs React Navigation Benchmark' },
    { text: 'Designing Modular Event Systems in Luau' },
    { text: 'Memory Leak Profiling in Chrome DevTools' },
    { text: 'Implementing Custom AST Math Layout Engines' },
    { text: 'Tailwind CSS Modules Integration in Webpack' },
    { text: 'Handling Haptic Feedback in React Native' },
    { text: 'Configuring System Tray Context Menus in Electron' },
    { text: 'Firebase Cloud Functions V2 Realtime Triggers' },
    { text: 'Designing Reusable UI Components with Radix' },
    { text: 'Implementing Chess Board State Validation in JS' },
    { text: 'Optimizing WebGL Shader Performance on Mobile' },
    { text: 'Roblox DataStore Service Error Handling Strategies' },
    { text: 'Setting Up Multi-Package Build Pipelines with Turborepo' },
    { text: 'Structuring Clean Architecture in Monorepos' },
    { text: 'Designing Custom AST Tokenizers in TypeScript' },
    { text: 'Comparing H.264 and H.265 Hardware Encoders' },
    { text: 'Implementing Custom React Hooks for Window Resizing' },
    { text: 'Electron Native Window Frame Styling & Dragging' },
    { text: 'Understanding V8 Engine JIT Compilation Layers' },
    { text: 'Roblox Custom Inventory & Grid Drag-and-Drop' },
    { text: 'Configuring ESBuild Rules in Webpack Pipelines' },
    { text: 'Designing Interactive Canvas Math Viewers' },
    { text: 'Managing Persistent Cache Files in Node.js' },
    { text: 'Optimizing SQLite Queries for Desktop Apps' },
    { text: 'TypeScript Generic Constraints & Conditional Types' },
  ];

  const ribbonItems: RibbonItem[] = [
    { text: 'File' },
    { text: 'Edit' },
    { text: 'View' },
    { text: 'Run' },
    { text: 'Help' },
  ];

  const navBottomItems: NavBottomItem[] = [
    { icon: 'Mic', status: 'success', badge: '3', useBadge: true },
    { icon: 'Video', status: 'success', badge: '1', useBadge: true },
    { icon: 'Volume2', status: 'success', badge: '3', useBadge: true },
    { icon: 'Monitor', status: 'success', badge: '1', useBadge: true },
  ];

  useEffect(() => {
    const unsubscribe = window.electronAPI.onMaximizedChange((maximizedState) => {
      setIsMaximized(maximizedState);
    });

    return () => unsubscribe();
  }, []);

  // Combined hover boundary: menu button OR panel itself. They're separate,
  // non-nested DOM nodes, so this can't be done with simple bubbling — we
  // track both independently and OR them together.
  useEffect(() => {
    if (isNarrowViewport) return;

    const isHoveringPeekBoundary = isMenuHovered || isPanelHovered;

    if (isHoveringPeekBoundary) {
      if (!isPanelOpen) {
        setIsDocked(false);
        setIsPanelOpen(true);
      }
      return;
    }

    if (!(isPanelOpen && !isDocked)) return;

    // Small grace period absorbs the brief gap between leaving the menu
    // button and entering the panel (or vice versa) so crossing between
    // the two hover zones doesn't cause a visible collapse/re-expand
    // flicker. Cancelled by the cleanup below if hover resumes in time.
    const collapseTimeout = window.setTimeout(() => {
      setIsPanelOpen(false);
    }, 100);

    return () => window.clearTimeout(collapseTimeout);
  }, [isNarrowViewport, isMenuHovered, isPanelHovered, isPanelOpen, isDocked]);

  // contentsChanged only applies when the collapsed condition is met AND the
  // panel actually occupies layout space — overlay mode never affects the
  // corner styling regardless of open/closed state, since `.contents` is
  // always full-width in that mode.
  const contentsChanged = !isPanelOpen && panelTakesSpace;

  return (
    <div className={styles.backdrop}>
      <NavigationCluster onMajorClick={() => {}} onMinorClick={handleMenuButtonClick} />
      <header className={styles.titleBar}>
        {windowInfoVisible && (finalWindowIconVisible || finalWindowTitleVisible) && (
          <div className={styles.titleInfoContainer}>
            {finalWindowIconVisible && (
              <ResolvableIcon
                icon={windowIcon}
                size="var(--space-lg)"
                color={theme.text.muted}
                strokeWidth={2.5}
              />
            )}
            {finalWindowTitleVisible && <span className={styles.titleText}>{windowTitle}</span>}
          </div>
        )}
        <div className={styles.titleBarLeft}>
          <ContentScaleButton
            scaleValue={0.85}
            className={styles.controlLeftButton}
            onMouseEnter={handleMenuHoverEnter}
            onMouseLeave={handleMenuHoverLeave}
            onClick={handleMenuButtonClick}
          >
            <ResolvableIcon
              icon={
                isMenuHovered ? (isDocked ? 'PanelLeftClose' : 'PanelLeftOpen') : 'TextAlignJustify'
              }
              size="18px"
              strokeWidth={2}
              color={theme.text.secondary}
              className={styles.controlIcon}
            />
          </ContentScaleButton>
          {ribbonItems.map((item: RibbonItem, index: number) => {
            const finalKey = typeof item?.key === 'string' ? item?.key : `${item?.text}-${index}`;

            return (
              <RibbonButton
                key={finalKey}
                icon={item?.icon}
                text={item?.text}
                selected={!!item?.selected}
                onMouseEnter={item?.onMouseEnter ?? undefined}
                onMouseLeave={item?.onMouseLeave ?? undefined}
                onClick={item?.onClick ?? undefined}
              />
            );
          })}
        </div>
        <div className={styles.controlContainer}>
          <ContentScaleButton
            scaleValue={0.82}
            className={clsx(styles.controlButton, styles.controlMinButton)}
            onClick={handleMinimize}
          >
            <ResolvableIcon
              icon="Minus"
              size="18px"
              strokeWidth={2}
              color={theme.text.secondary}
              className={styles.controlIcon}
            />
          </ContentScaleButton>
          <ContentScaleButton
            scaleValue={0.82}
            className={styles.controlButton}
            onClick={handleMaximize}
          >
            <ResolvableIcon
              icon={isMaximized ? 'Minimize2' : 'Maximize2'}
              size="16px"
              strokeWidth={2}
              color={theme.text.secondary}
              className={styles.controlIcon}
            />
          </ContentScaleButton>
          <ContentScaleButton
            scaleValue={0.82}
            hoverColor="#C62828"
            className={clsx(styles.controlButton, styles.controlButtonClose)}
            onClick={handleClose}
          >
            <ResolvableIcon
              icon="X"
              size="18px"
              strokeWidth={2}
              color={theme.text.secondary}
              className={clsx(styles.controlIcon, styles.controlIconClose)}
            />
          </ContentScaleButton>
        </div>
      </header>
      <main className={styles.restOfLayout}>
        <NavigationPanel
          isOpen={isPanelOpen}
          takesSpace={panelTakesSpace}
          categoryItems={navCategoryItems}
          conversationItems={navConvoItemsTest}
          navBottomItems={navBottomItems}
          onMouseEnter={handlePanelHoverEnter}
          onMouseLeave={handlePanelHoverLeave}
        />
        <div className={clsx(styles.contents, contentsChanged && styles.contentsChanged)}>
          <div className={styles.tabContainer}>
            {state.tabs.map((tab, index) => {
              const tabId = tab.id ?? 'noTabId';
              const finalKey = `${tabId ?? ''}-${tab.dedupeKey ?? ''}-${index}`;

              return (
                <TabButton
                  key={finalKey}
                  iconValue={tab.icon}
                  text={tab.title}
                  selected={state.activeTabId === tab.id}
                  // onMouseEnter={item?.onMouseEnter ?? undefined}
                  // onMouseLeave={item?.onMouseLeave ?? undefined}
                  onClick={() => focusTab(tab.id)}
                  onClose={() => closeTab(tab.id)}
                />
              );
            })}
          </div>
          <div className={styles.viewport}>
            <TabsViewport />
          </div>
        </div>
      </main>
    </div>
  );
};
