import { ipcMain } from 'electron';
import { getCpuInfo } from './cpu';
import { getMemoryInfo } from './mem';
import { getGpuInfo, warmUpGpuInfo } from './gpu';

export function setupHardwareIPC(): void {
  // One-time cost (synchronous nvidia-smi inside si.graphics()) paid at startup instead of on a poll.
  warmUpGpuInfo();

  ipcMain.handle('hardware:get-cpu', async () => {
    return await getCpuInfo();
  });

  ipcMain.handle('hardware:get-memory', async () => {
    return await getMemoryInfo();
  });

  ipcMain.handle('hardware:get-gpu', async () => {
    return await getGpuInfo();
  });
}
