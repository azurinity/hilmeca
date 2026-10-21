import { freemem, totalmem } from 'os';

export async function getMemoryInfo() {
  const totalBytes = totalmem();
  const freeBytes = freemem();
  const usedBytes = totalBytes - freeBytes;

  return {
    totalBytes,
    usedBytes,
    freeBytes,
    // On Windows, systeminformation also derived available memory from os.freemem().
    availableBytes: freeBytes,
    usagePercent: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0,
  };
}
