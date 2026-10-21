import { execFile } from 'child_process';
import { access, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const NVIDIA_SMI_TIMEOUT_MS = 5000;

// Order matters: it defines the column order of the CSV output parsed below.
const NVIDIA_SMI_FIELDS = [
  'pci.sub_device_id',
  'fan.speed',
  'memory.total',
  'memory.used',
  'memory.free',
  'utilization.gpu',
  'temperature.gpu',
  'power.draw',
  'power.limit',
  'clocks.gr',
  'clocks.mem',
] as const;

export interface NvidiaStats {
  subDeviceId: string | undefined;
  fanSpeedPercent: number | undefined;
  memoryTotalMiB: number | undefined;
  memoryUsedMiB: number | undefined;
  memoryFreeMiB: number | undefined;
  utilizationPercent: number | undefined;
  temperatureC: number | undefined;
  powerDrawW: number | undefined;
  powerLimitW: number | undefined;
  coreClockMHz: number | undefined;
  memoryClockMHz: number | undefined;
}

interface NvidiaSmiCandidate {
  path: string;
  ctimeMs: number;
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Same lookup order as systeminformation: System32 first, then the most recent
// nvidia-smi.exe found in the DriverStore, but fully asynchronous.
async function findNvidiaSmiWindows(): Promise<string | null> {
  const windowsDir = process.env.WINDIR ?? process.env.SystemRoot ?? 'C:\\Windows';

  const system32Path = join(windowsDir, 'System32', 'nvidia-smi.exe');
  if (await pathExists(system32Path)) return system32Path;

  const driverStoreDir = join(windowsDir, 'System32', 'DriverStore', 'FileRepository');
  try {
    const entries = await readdir(driverStoreDir, { withFileTypes: true });
    const candidates = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry): Promise<NvidiaSmiCandidate | null> => {
          const candidatePath = join(driverStoreDir, entry.name, 'nvidia-smi.exe');
          try {
            return { path: candidatePath, ctimeMs: (await stat(candidatePath)).ctimeMs };
          } catch {
            return null;
          }
        }),
    );

    const newest = candidates
      .filter((candidate): candidate is NvidiaSmiCandidate => candidate !== null)
      .reduce<NvidiaSmiCandidate | null>(
        (best, candidate) => (best === null || candidate.ctimeMs > best.ctimeMs ? candidate : best),
        null,
      );
    return newest?.path ?? null;
  } catch {
    return null;
  }
}

// Resolved once. A missing nvidia-smi is cached as `null`, so it is not re-scanned every poll.
let nvidiaSmiPath: Promise<string | null> | null = null;

function getNvidiaSmiPath(): Promise<string | null> {
  nvidiaSmiPath ??=
    process.platform === 'win32' ? findNvidiaSmiWindows() : Promise.resolve('nvidia-smi');
  return nvidiaSmiPath;
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseFloat(value);
  // "[N/A]" and "[Not Supported]" parse to NaN and become undefined.
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseRow(line: string): NvidiaStats | null {
  const values = line.split(',').map((value) => value.trim());
  if (values.length !== NVIDIA_SMI_FIELDS.length) return null;

  const [
    subDeviceId,
    fan,
    total,
    used,
    free,
    utilization,
    temperature,
    powerDraw,
    powerLimit,
    clockCore,
    clockMemory,
  ] = values;

  return {
    subDeviceId:
      subDeviceId === undefined || Number.isNaN(parseNumber(subDeviceId))
        ? subDeviceId
        : subDeviceId,
    fanSpeedPercent: parseNumber(fan),
    memoryTotalMiB: parseNumber(total),
    memoryUsedMiB: parseNumber(used),
    memoryFreeMiB: parseNumber(free),
    utilizationPercent: parseNumber(utilization),
    temperatureC: parseNumber(temperature),
    powerDrawW: parseNumber(powerDraw),
    powerLimitW: parseNumber(powerLimit),
    coreClockMHz: parseNumber(clockCore),
    memoryClockMHz: parseNumber(clockMemory),
  };
}

async function runNvidiaSmiQuery(): Promise<NvidiaStats[]> {
  const executable = await getNvidiaSmiPath();
  if (executable === null) return [];

  try {
    const { stdout } = await execFileAsync(
      executable,
      [`--query-gpu=${NVIDIA_SMI_FIELDS.join(',')}`, '--format=csv,noheader,nounits'],
      { windowsHide: true, timeout: NVIDIA_SMI_TIMEOUT_MS },
    );

    return stdout
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '')
      .map(parseRow)
      .filter((row): row is NvidiaStats => row !== null);
  } catch {
    // No NVIDIA GPU, driver unavailable, or timeout: report no live data (same as before).
    return [];
  }
}

// Single-flight: callers arriving while a query is running share its result
// instead of spawning another nvidia-smi process.
let inFlightQuery: Promise<NvidiaStats[]> | null = null;

export function queryNvidiaStats(): Promise<NvidiaStats[]> {
  inFlightQuery ??= runNvidiaSmiQuery().finally(() => {
    inFlightQuery = null;
  });
  return inFlightQuery;
}
