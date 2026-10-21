import si from 'systeminformation';
import { queryNvidiaStats, type NvidiaStats } from './nvidia-smi';

// Static controller details (vendor, model, VRAM, driver) are resolved once.
// si.graphics() runs a synchronous nvidia-smi plus several PowerShell processes, which
// blocks the Electron main thread, so it must never run on the polling path.
let staticGraphics: ReturnType<typeof si.graphics> | null = null;

function getStaticGraphics(): ReturnType<typeof si.graphics> {
  staticGraphics ??= si.graphics().catch((error: unknown) => {
    // Do not cache failures; allow the next call to retry.
    staticGraphics = null;
    throw error;
  });
  return staticGraphics;
}

/** Resolves the static GPU info ahead of the first poll, so the one-time cost lands at startup. */
export function warmUpGpuInfo(): void {
  getStaticGraphics().catch(() => {
    // Ignored here: getGpuInfo() surfaces the error to the caller.
  });
}

// Windows and nvidia-smi format the same ID differently (e.g. "0x17B11043" vs "17B11043").
function normalizeSubDeviceId(id: string | undefined): string {
  return (id ?? '').toLowerCase().replace(/^0x/, '').replace(/^0+/, '');
}

function findNvidiaStats(
  stats: NvidiaStats[],
  controller: { vendor: string; subDeviceId?: string },
): NvidiaStats | undefined {
  if (controller.vendor.toLowerCase() !== 'nvidia') return undefined;

  const target = normalizeSubDeviceId(controller.subDeviceId);
  if (target === '') return undefined;

  return stats.find((entry) => normalizeSubDeviceId(entry.subDeviceId) === target);
}

export async function getGpuInfo() {
  const [graphics, nvidiaStats] = await Promise.all([getStaticGraphics(), queryNvidiaStats()]);

  return graphics.controllers.map((gpu) => {
    const nvidia = findNvidiaStats(nvidiaStats, gpu);

    return {
      vendor: gpu.vendor,
      model: gpu.model,
      vramMiB: gpu.vram,
      vramDynamic: gpu.vramDynamic,
      // Live values come only from the current nvidia-smi sample, never from the
      // startup snapshot, so a failed query shows "no data" instead of stale numbers.
      utilizationPercent: nvidia?.utilizationPercent,
      memoryUsedMiB: nvidia?.memoryUsedMiB,
      memoryTotalMiB: nvidia?.memoryTotalMiB ?? gpu.memoryTotal,
      memoryFreeMiB: nvidia?.memoryFreeMiB,
      temperatureC: nvidia?.temperatureC,
      powerDrawW: nvidia?.powerDrawW,
      powerLimitW: nvidia?.powerLimitW,
      coreClockMHz: nvidia?.coreClockMHz,
      memoryClockMHz: nvidia?.memoryClockMHz,
      fanSpeedPercent: nvidia?.fanSpeedPercent,
      driverVersion: gpu.driverVersion,
    };
  });
}
