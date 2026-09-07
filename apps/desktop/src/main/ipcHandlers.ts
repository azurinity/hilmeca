// src/main/ipcHandlers.ts
import { ipcMain, BrowserWindow } from 'electron';
import { setupNetworkIPC } from './ipc/network';

export function registerIpcHandlers(): void {
  setupNetworkIPC();

  ipcMain.handle('app:ping', async (): Promise<string> => {
    return 'pong';
  });
  ipcMain.on('update-titlebar', (event, colors: { color: string; symbolColor: string }) => {
    // const webContents = event.sender;
    // const win = BrowserWindow.fromWebContents(webContents);
    // if (win && !win.isDestroyed() && typeof win.setTitleBarOverlay === 'function') {
    //   win.setTitleBarOverlay({
    //     color: colors.color,
    //     symbolColor: colors.symbolColor,
    //     height: 36, // Match your initial height
    //   });
    // }
  });
  ipcMain.on('window:set-background-color', (event, color: string) => {
    if (
      typeof color !== 'string' ||
      !/^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)
    ) {
      return;
    }

    const window = BrowserWindow.fromWebContents(event.sender);
    if (window && !window.isDestroyed()) {
      window.setBackgroundColor(color);
    }
  });
  ipcMain.on('window-control:minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });

  ipcMain.on('window-control:maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.on('window-control:close', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });
}
