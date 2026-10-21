import { useLayoutEffect, useEffect, useRef, useState, type ReactNode } from 'react';
import { TabActivationContext } from './useTabActivation';
import styles from './TabPane.module.css';

export interface TabPaneProps {
  isActive: boolean;
  title: string;
  tabId: string;
  children: ReactNode;
}

export function TabPane({ isActive, title, tabId, children }: TabPaneProps) {
  const paneRef = useRef<HTMLDivElement>(null);
  const wasActiveRef = useRef<boolean>(isActive);

  const [activationCount, setActivationCount] = useState<number>(0);
  const [enterPhase, setEnterPhase] = useState<'start' | 'active'>('active');

  useEffect(() => {
    if (paneRef.current) paneRef.current.inert = !isActive;

    if (isActive && !wasActiveRef.current) {
      requestAnimationFrame(() => setActivationCount((c) => c + 1));
    }
    wasActiveRef.current = isActive;
  }, [isActive]);

  useLayoutEffect(() => {
    if (paneRef.current) paneRef.current.inert = !isActive;

    if (isActive && !wasActiveRef.current) {
      setEnterPhase('start');
      requestAnimationFrame(() => setActivationCount((c) => c + 1));
    }
    wasActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (enterPhase !== 'start') return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEnterPhase('active'));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [enterPhase]);

  return (
    <div
      ref={paneRef}
      id={`tabpanel-${tabId}`}
      role="tabpanel"
      aria-label={title}
      className={`${styles.tabPane} ${enterPhase === 'start' ? styles.enterStart : styles.enterActive}`}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      <TabActivationContext.Provider value={{ isActive, activationCount }}>
        {children}
      </TabActivationContext.Provider>
    </div>
  );
}
