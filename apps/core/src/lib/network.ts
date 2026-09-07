import os from 'node:os';
import process from 'node:process';
import { select } from '@inquirer/prompts';

export interface HostOption {
  name: string;
  value: string;
}

/**
 * Discovers available network interfaces (IPv4 non-internal).
 */
export function getAvailableHostOptions(): HostOption[] {
  const options: HostOption[] = [{ name: 'Localhost (127.0.0.1)', value: '127.0.0.1' }];

  const seen = new Set<string>(['127.0.0.1']);
  const interfaces = os.networkInterfaces();

  for (const [name, netList] of Object.entries(interfaces)) {
    if (!netList) continue;

    for (const net of netList) {
      if (net.family !== 'IPv4' || net.internal) continue;
      if (seen.has(net.address)) continue;

      seen.add(net.address);

      const lowerName = name.toLowerCase();
      const interfaceName =
        lowerName.includes('wi-fi') || lowerName.includes('wifi') || lowerName.includes('wlan')
          ? 'Local Network / Wi-Fi'
          : `Local Network (${name})`;

      options.push({
        name: `${interfaceName} (${net.address})`,
        value: net.address,
      });
    }
  }

  return options;
}

/**
 * Prompts the user interactively in the terminal to select a host IP.
 * Bypasses prompt if CORE_HOST env is set or standard input is non-interactive.
 */
export async function promptHostSelection(defaultHost: string): Promise<string> {
  const isEnvSet = Boolean(process.env['CORE_HOST']);
  const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

  if (isEnvSet || !isInteractive) {
    return defaultHost;
  }

  const options = getAvailableHostOptions();
  const fallbackHost = options[0]?.value ?? '127.0.0.1';

  if (options.length === 1) {
    return fallbackHost;
  }

  console.log('\n\x1b[1m\x1b[36m┌──────────────────────────────────────────┐\x1b[0m');
  console.log('\x1b[1m\x1b[36m│   HILM-ECA Core Service Host Launcher    │\x1b[0m');
  console.log('\x1b[1m\x1b[36m└──────────────────────────────────────────┘\x1b[0m\n');

  try {
    return await select({
      message: 'Select host network interface to bind:',
      choices: options,
      default: defaultHost,
    });
  } catch {
    // Graceful exit on Ctrl+C (SIGINT)
    process.exit(0);
  }
}
