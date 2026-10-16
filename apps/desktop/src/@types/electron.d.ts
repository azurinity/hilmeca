// src/@types/electron.d.ts
import type { getCpuInfo } from '../main/ipc/hardware/cpu';
import type { getMemoryInfo } from '../main/ipc/hardware/mem';
import type { getGpuInfo } from '../main/ipc/hardware/gpu';

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

export interface IHardwareAPI {
  getCpuInfo: () => ReturnType<typeof getCpuInfo>;
  getMemoryInfo: () => ReturnType<typeof getMemoryInfo>;
  getGpuInfo: () => ReturnType<typeof getGpuInfo>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    hardwareAPI: IHardwareAPI;
  }
}
