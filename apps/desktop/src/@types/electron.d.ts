// src/@types/electron.d.ts
export interface IElectronAPI {
  ping: () => Promise<string>;
  updateTitleBar: (colors: { color: string; symbolColor: string }) => void;
  setBackgroundColor: (color: string) => void;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => () => void;

  getNetworkInterfaces: () => Promise<string[]>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
