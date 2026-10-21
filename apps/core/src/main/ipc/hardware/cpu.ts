import si from 'systeminformation';

// Static CPU details (manufacturer, brand, cores) never change at runtime,
// so they are resolved once instead of on every poll.
let staticCpuInfo: ReturnType<typeof si.cpu> | null = null;

function getStaticCpuInfo(): ReturnType<typeof si.cpu> {
  staticCpuInfo ??= si.cpu().catch((error: unknown) => {
    // Do not cache failures; allow the next call to retry.
    staticCpuInfo = null;
    throw error;
  });
  return staticCpuInfo;
}

export async function getCpuInfo() {
  const [cpu, load] = await Promise.all([getStaticCpuInfo(), si.currentLoad()]);

  return {
    manufacturer: cpu.manufacturer,
    brand: cpu.brand,
    model: cpu.model,
    speedGHz: cpu.speed,
    physicalCores: cpu.physicalCores,
    logicalCores: cpu.cores,
    load: load,
  };
}
