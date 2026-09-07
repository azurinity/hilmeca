// src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktopAPI', {
  ping: () => ipcRenderer.invoke('app:ping'),
  updateTitleBar: (colors: { color: string; symbolColor: string }) => {
    ipcRenderer.send('update-titlebar', colors);
  },
  setBackgroundColor: (color: string) => {
    ipcRenderer.send('window:set-background-color', color);
  },
  minimizeWindow: () => ipcRenderer.send('window-control:minimize'),
  maximizeWindow: () => ipcRenderer.send('window-control:maximize'),
  closeWindow: () => ipcRenderer.send('window-control:close'),
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
    const subscription = (_event: any, isMaximized: boolean) => callback(isMaximized);
    ipcRenderer.on('window-control:maximized-change', subscription);

    return () => {
      ipcRenderer.removeListener('window-control:maximized-change', subscription);
    };
  },

  getNetworkInterfaces: (): Promise<string[]> => ipcRenderer.invoke('get-network-interfaces'),
});
