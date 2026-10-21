// src/renderer/hooks/useHardwareTelemetry.ts
import { useState, useEffect, useCallback } from 'react';
import {
  hardwareService,
  type CpuTelemetry,
  type MemoryTelemetry,
  type GpuTelemetry,
} from './telemetryService';

interface UseHardwareOptions {
  /** Polling rate in milliseconds. If omitted or 0, fetches a single snapshot on mount. */
  pollingInterval?: number;
  /** Whether telemetry fetching is active. Defaults to true. */
  enabled?: boolean;
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

export function useHardwareTelemetry(options: UseHardwareOptions = {}) {
  const { pollingInterval, enabled = true } = options;

  const [cpu, setCpu] = useState<CpuTelemetry | null>(null);
  const [memory, setMemory] = useState<MemoryTelemetry | null>(null);
  const [gpu, setGpu] = useState<GpuTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  // Stable identity (no deps), so effects can depend on it without stale closures.
  // Each source settles independently: one failing source (e.g. GPU) must not
  // discard the others. Never rejects.
  const fetchData = useCallback(async () => {
    const [cpuResult, memoryResult, gpuResult] = await Promise.allSettled([
      hardwareService.getCpu(),
      hardwareService.getMemory(),
      hardwareService.getGpu(),
    ]);

    if (cpuResult.status === 'fulfilled') setCpu(cpuResult.value);
    if (memoryResult.status === 'fulfilled') setMemory(memoryResult.value);
    if (gpuResult.status === 'fulfilled') setGpu(gpuResult.value);

    const failure = [cpuResult, memoryResult, gpuResult].find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    setError(failure ? toError(failure.reason) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // Chained timeout instead of setInterval: the next poll is scheduled only
    // after the previous one settles, so slow sources (si.graphics) cannot overlap.
    const poll = async (): Promise<void> => {
      await fetchData();
      if (cancelled || !pollingInterval || pollingInterval <= 0) return;
      timeoutId = setTimeout(() => {
        void poll();
      }, pollingInterval);
    };

    void poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [pollingInterval, enabled, fetchData]);

  return {
    cpu,
    memory,
    gpu,
    loading,
    error,
    refetch: fetchData,
  };
}
