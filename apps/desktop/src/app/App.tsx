import React from 'react';

import { Shell } from '../shell/Shell';
import { AppWindowProvider } from '../context/AppWindowContext';

export const App: React.FC = () => {
  return (
    <AppWindowProvider>
      <Shell />
    </AppWindowProvider>
  );
};
