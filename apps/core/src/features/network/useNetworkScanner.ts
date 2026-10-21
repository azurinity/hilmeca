// apps/desktop/src/features/network/useServerScanner.ts
import { useState, useCallback, useEffect } from 'react';

export interface ActiveServer {
  ip: string;
  port: number;
  url: string;
  latencyMs: number;
  status: 'active' | 'offline';
}

export function useServerScanner(port: number = 3030) {
  const [servers, setServers] = useState<ActiveServer[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScannedAt, setLastScannedAt] = useState<Date | null>(null);

  const scanServers = useCallback(async () => {
    setIsScanning(true);
    setServers([]);

    try {
      // 1. Fetch available local IPv4 addresses via Electron IPC
      const candidateIPs = await window.electronAPI.getNetworkInterfaces();

      // 2. Query health endpoint concurrently across interfaces
      const scanPromises = candidateIPs.map(async (ip): Promise<ActiveServer | null> => {
        const targetUrl = `http://${ip}:${port}/health`;
        const startTime = performance.now();

        try {
          // Abort signal prevents long hanging connection attempts
          const response = await fetch(targetUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(1500), // 1.5 second timeout threshold
          });

          if (!response.ok) return null;

          const data = await response.json();

          // Validate that ok === true as specified
          if (data && data.ok === true) {
            const latencyMs = Math.round(performance.now() - startTime);
            return {
              ip,
              port,
              url: `http://${ip}:${port}`,
              latencyMs,
              status: 'active',
            };
          }
        } catch {
          // Interface ping failed or timed out
          return null;
        }

        return null;
      });

      const results = await Promise.all(scanPromises);
      const activeServers = results.filter((server): server is ActiveServer => server !== null);

      setServers(activeServers);
      setLastScannedAt(new Date());
    } catch (err) {
      console.error('Failed to query network interfaces:', err);
    } finally {
      setIsScanning(false);
    }
  }, [port]);

  // Initial scan on mount
  useEffect(() => {
    scanServers();
  }, [scanServers]);

  return {
    servers,
    isScanning,
    lastScannedAt,
    scanServers,
  };
}
