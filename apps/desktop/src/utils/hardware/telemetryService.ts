function getBridge(): Window['hardwareAPI'] {
  // Runtime guard for the preload boundary: the types say it exists, but the
  // preload script is an external contract that can silently drift.
  if (typeof window.hardwareAPI === 'undefined') {
    throw new Error('window.hardwareAPI is unavailable. Check that preload exposes "hardwareAPI".');
  }
  return window.hardwareAPI;
}

const getCpu = async () => getBridge().getCpuInfo();
const getMemory = async () => getBridge().getMemoryInfo();
const getGpu = async () => getBridge().getGpuInfo();

export const hardwareService = {
  getCpu,
  getMemory,
  getGpu,

  async getAll() {
    const [cpu, memory, gpu] = await Promise.all([getCpu(), getMemory(), getGpu()]);
    return { cpu, memory, gpu };
  },
};

// Exported types inferred from service responses
export type CpuTelemetry = Awaited<ReturnType<typeof hardwareService.getCpu>>;
export type MemoryTelemetry = Awaited<ReturnType<typeof hardwareService.getMemory>>;
export type GpuTelemetry = Awaited<ReturnType<typeof hardwareService.getGpu>>;
