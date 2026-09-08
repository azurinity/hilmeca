// src/main/index.ts
import { app, BrowserWindow, Menu } from 'electron';
import { registerIpcHandlers } from './ipcHandlers';
import path from 'path';

// Forge automatically injects these webpack entry points
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

Menu.setApplicationMenu(null);

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 540,
    minHeight: 600,
    show: false,

    backgroundColor: '#050505',
    frame: false,

    icon: path.join(__dirname, '../assets/icons/app/splash/icon-splash-standard.png'),

    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true, // Enforces JS execution isolation
      nodeIntegration: false, // Disables raw Node access in UI
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Check for F12 or Ctrl+Shift+I (Cmd+Option+I on macOS)
    const isF12 = input.key === 'F12';
    const isCtrlShiftI =
      (input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i';

    if (input.type === 'keyDown' && (isF12 || isCtrlShiftI)) {
      event.preventDefault();

      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-control:maximized-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-control:maximized-change', false);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.send('window-control:maximized-change', mainWindow.isMaximized());

    // mainWindow.webContents.openDevTools();
  });
};

// Start IPC handlers and spawn window when ready
app.on('ready', () => {
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
