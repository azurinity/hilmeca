// apps/desktop/src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { lightTheme, darkTheme } from './themes';
import { Theme, ThemeMode } from './types';
import { buildThemeStylesheet } from './themeHelper';

interface ThemeContextProps {
  mode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  theme: Theme; // Maintained for fallback manual access inside components
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const THEME_STORAGE_KEY = 'hilmeca-app-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  // 1. Generate and dynamically inject custom CSS stylesheet into head once on boot
  useEffect(() => {
    const cssContent = buildThemeStylesheet(lightTheme, darkTheme);
    let styleElement = document.getElementById('runtime-generated-theme-vars');

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'runtime-generated-theme-vars';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = cssContent;
  }, []);

  // 2. Track theme changes and update the document node class accordingly
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const recalculateTheme = () => {
      const activeDarkState = mode === 'system' ? mediaQuery.matches : mode === 'dark';
      setIsDark(activeDarkState);

      if (activeDarkState) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    recalculateTheme();

    mediaQuery.addEventListener('change', recalculateTheme);
    return () => mediaQuery.removeEventListener('change', recalculateTheme);
  }, [mode]);

  const activeThemeModel = useMemo<Theme>(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  // 3. Keep the native Electron title bar overlay color synchronized on Windows systems
  useEffect(() => {
    if (window.electronAPI?.updateTitleBar) {
      window.electronAPI.updateTitleBar({
        color: activeThemeModel.background.surface,
        symbolColor: activeThemeModel.text.secondary,
      });
    }

    // ADDITION: Sync native canvas background color (#050505 vs #F2F2F2)
    if (window.electronAPI?.setBackgroundColor) {
      window.electronAPI.setBackgroundColor(activeThemeModel.background.canvas);
    }
  }, [activeThemeModel]);

  const value = useMemo<ThemeContextProps>(
    () => ({
      mode,
      setThemeMode: setMode,
      theme: activeThemeModel,
      isDark,
    }),
    [mode, activeThemeModel, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider wrapper');
  }
  return context;
};
