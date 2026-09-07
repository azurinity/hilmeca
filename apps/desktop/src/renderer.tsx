// src/renderer.tsx
import './styles/generated/tokens.css';
import './styles/generated/size-tiers.css';
import './index.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { ThemeProvider } from './theme/ThemeProvider';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to locate target element with id "root".');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
