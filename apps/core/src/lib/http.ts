import { DEFAULT_REQUEST_TIMEOUT_MS } from '../constants';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    const text = await response.text();

    if (!response.ok) {
      throw new HttpError(response.status, text || `Request failed with HTTP ${response.status}`, {
        url,
      });
    }

    if (!text) return undefined as T;

    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(502, 'Upstream request failed', {
      url,
      cause: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timeout);
  }
}
