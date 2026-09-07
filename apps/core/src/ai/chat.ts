import { config } from '../config.js';
import { fetchJson, isRecord } from '../lib/http.js';
import { baseUrl, defaultOptions } from './client.js';
import type { ChatRequestInput, OllamaChatResponse } from './types.js';

export async function chat(input: ChatRequestInput): Promise<OllamaChatResponse> {
  const model =
    input.model ??
    (input.messages.some((m) => Array.isArray(m.images) && m.images.length > 0)
      ? config.visionModel
      : config.textModel);

  return fetchJson<OllamaChatResponse>(
    baseUrl('/api/chat'),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        stream: false,
        keep_alive: config.keepAlive,
        think: false,
        ...input,
        model,
        options: {
          ...defaultOptions(),
          ...(isRecord(input.options) ? input.options : {}),
        },
      }),
    },
    config.requestTimeoutMs,
  );
}
