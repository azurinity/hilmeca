import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import styles from './RootLayout.module.css';

import { useTheme } from '../theme/ThemeProvider';
import { ContentScaleButton } from '../components/button';
import { ResolvableIcon } from '../components/icon';

export const RootLayout: React.FC = () => {
  const { theme } = useTheme();

  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => window.electronAPI.minimizeWindow();
  const handleMaximize = () => window.electronAPI.maximizeWindow();
  const handleClose = () => window.electronAPI.closeWindow();

  useEffect(() => {
    const unsubscribe = window.electronAPI.onMaximizedChange((maximizedState) => {
      setIsMaximized(maximizedState);
    });

    return () => unsubscribe();
  }, []);

  return <div />
}