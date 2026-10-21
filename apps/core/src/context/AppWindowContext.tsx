import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppWindowState {
  windowTitle: string;
  windowIcon: string;
  windowTitleVisible: boolean;
  windowIconVisible: boolean;
  windowInfoVisible: boolean;
  setWindowTitle: (title: string) => void;
  setWindowIcon: (icon: string) => void;
  setWindowTitleVisible: (visible: boolean) => void;
  setWindowIconVisible: (visible: boolean) => void;
  setWindowInfoVisible: (visible: boolean) => void;
}

const AppWindowContext = createContext<AppWindowState | undefined>(undefined);

export function AppWindowProvider({ children }: { children: ReactNode }) {
  const [windowTitle, setWindowTitle] = useState('Home');
  const [windowIcon, setWindowIcon] = useState('House');
  const [windowTitleVisible, setWindowTitleVisible] = useState(true);
  const [windowIconVisible, setWindowIconVisible] = useState(true);
  const [windowInfoVisible, setWindowInfoVisible] = useState(true);

  return (
    <AppWindowContext.Provider
      value={{
        windowTitle,
        windowIcon,
        windowTitleVisible,
        windowIconVisible,
        windowInfoVisible,
        setWindowTitle,
        setWindowIcon,
        setWindowTitleVisible,
        setWindowIconVisible,
        setWindowInfoVisible,
      }}
    >
      {children}
    </AppWindowContext.Provider>
  );
}

// Custom hook to consume the Context cleanly
export function useAppWindow() {
  const context = useContext(AppWindowContext);
  if (!context) {
    throw new Error('useAppWindow must be used within an AppWindowProvider');
  }
  return context;
}
