// src/preload.ts
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { IElectronAPI, IHardwareAPI } from './@types/electron';

type ExposedApiKey = 'electronAPI' | 'hardwareAPI';

/**
 * Typed wrapper around contextBridge.exposeInMainWorld.
 * The key and payload are checked against the global `Window` augmentation,
 * so a name or shape mismatch with electron.d.ts fails at compile time.
 */
function exposeApi<K extends ExposedApiKey>(key: K, api: Window[K]): void {
  contextBridge.exposeInMainWorld(key, api);
}

const hardwareApi: IHardwareAPI = {
  getCpuInfo: () => ipcRenderer.invoke('hardware:get-cpu'),
  getMemoryInfo: () => ipcRenderer.invoke('hardware:get-memory'),
  getGpuInfo: () => ipcRenderer.invoke('hardware:get-gpu'),
};

const electronApi: IElectronAPI = {
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
    const subscription = (_event: IpcRendererEvent, isMaximized: boolean) => callback(isMaximized);
    ipcRenderer.on('window-control:maximized-change', subscription);

    return () => {
      ipcRenderer.removeListener('window-control:maximized-change', subscription);
    };
  },

  getNetworkInterfaces: (): Promise<string[]> => ipcRenderer.invoke('get-network-interfaces'),
};

exposeApi('hardwareAPI', hardwareApi);
exposeApi('electronAPI', electronApi);
