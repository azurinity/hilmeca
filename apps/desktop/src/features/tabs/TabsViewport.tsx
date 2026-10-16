import { Suspense, useMemo } from 'react';

import { useTheme } from '../../theme/ThemeProvider';

import { ResolvableIcon } from '../../components/icon';

import { useTabs } from './TabsContext';
import { TAB_REGISTRY } from './tabRegistry';
import { TabPane } from './TabPane';
import { TabErrorBoundary } from './TabErrorBoundary';
import styles from './TabsViewport.module.css';

function TabPaneSkeleton() {
  return <div className={styles.paneSkeleton} />;
}

export function TabsViewport() {
  const { theme } = useTheme();
  const { state } = useTabs();

  const mountedIds = useMemo(() => new Set(state.history), [state.history]);

  return (
    <div className={styles.viewport}>
      {state.tabs.map((tab) => {
        if (!mountedIds.has(tab.id)) return null;

        const definition = TAB_REGISTRY[tab.type];
        const isActive = tab.id === state.activeTabId;
        const Component = definition?.component;

        return (
          <TabPane key={tab.id} tabId={tab.id} isActive={isActive} title={tab.title}>
            <Suspense fallback={<TabPaneSkeleton />}>
              <TabErrorBoundary tabTitle={tab.title}>
                {Component ? (
                  <Component {...tab.params} isActive={isActive} tabId={tab.id} />
                ) : (
                  <div className={styles.canvas}>
                    <ResolvableIcon
                      icon="CircleQuestionMark"
                      size="calc(8 * var(--space-sm))"
                      strokeWidth={1.5}
                      color={theme.text.secondary}
                      className={styles.theImage}
                    />
                    <p className={styles.textSpan}>Unknown tab identifier '{tab.type}'.</p>
                    <span className={styles.textSpanNext}>Tab title: '{tab.title}'</span>
                  </div>
                )}
              </TabErrorBoundary>
            </Suspense>
          </TabPane>
        );
      })}
    </div>
  );
}