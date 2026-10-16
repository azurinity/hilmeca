import React from 'react';

import { Shell } from '../shell/Shell';
import { AppWindowProvider } from '../context/AppWindowContext';
import { TabsProvider } from '../features/tabs';

export const App: React.FC = () => {
  return (
    <AppWindowProvider>
      <TabsProvider>
        <Shell />
      </TabsProvider>
    </AppWindowProvider>
  );
};
