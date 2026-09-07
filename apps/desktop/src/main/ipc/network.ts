// apps/desktop/src/main/ipc/network.ts
import { ipcMain } from 'electron';
import os from 'os';

export function setupNetworkIPC(): void {
  ipcMain.handle('get-network-interfaces', (): string[] => {
    const interfaces = os.networkInterfaces();
    const addresses = new Set<string>(['127.0.0.1']);

    for (const name of Object.keys(interfaces)) {
      const netList = interfaces[name];
      if (!netList) continue;

      for (const net of netList) {
        // Only target active IPv4 addresses that are non-internal
        if (net.family === 'IPv4' && !net.internal) {
          addresses.add(net.address);
        }
      }
    }

    return Array.from(addresses);
  });
}
