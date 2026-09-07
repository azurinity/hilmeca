import { config } from '../config.js';
import { fetchJson } from '../lib/http.js';
import type { OllamaTagsResponse } from './types.js';

export function baseUrl(path: string): string {
  return new URL(path, config.ollamaBaseUrl).toString();
}

export function defaultOptions(): Record<string, unknown> {
  return {
    num_ctx: config.numCtx,
    temperature: config.temperature,
    top_p: config.topP,
  };
}

export async function listModels(): Promise<OllamaTagsResponse> {
  return fetchJson<OllamaTagsResponse>(
    baseUrl('/api/tags'),
    { method: 'GET' },
    config.requestTimeoutMs,
  );
}

export async function isOllamaAlive(): Promise<boolean> {
  try {
    const result = await listModels();
    return Array.isArray(result.models);
  } catch {
    return false;
  }
}
