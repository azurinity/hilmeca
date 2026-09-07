import {
  DEFAULT_HOST,
  DEFAULT_OLLAMA_BASE_URL,
  DEFAULT_PORT,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_TEXT_MODEL,
  DEFAULT_TOP_P,
  DEFAULT_TEMPERATURE,
  DEFAULT_NUM_CTX,
  DEFAULT_VISION_MODEL,
  DEFAULT_KEEP_ALIVE,
} from './constants.js';

function toInt(value: string | undefined, fallback: number): number {
  if (value == null || value.trim() === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toFloat(value: string | undefined, fallback: number): number {
  if (value == null || value.trim() === '') return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  host: process.env['CORE_HOST'] ?? DEFAULT_HOST,
  port: toInt(process.env['CORE_PORT'], DEFAULT_PORT),

  ollamaBaseUrl: process.env['OLLAMA_BASE_URL'] ?? DEFAULT_OLLAMA_BASE_URL,
  textModel: process.env['OLLAMA_TEXT_MODEL'] ?? DEFAULT_TEXT_MODEL,
  visionModel: process.env['OLLAMA_VISION_MODEL'] ?? DEFAULT_VISION_MODEL,

  numCtx: toInt(process.env['OLLAMA_NUM_CTX'], DEFAULT_NUM_CTX),
  temperature: toFloat(process.env['OLLAMA_TEMPERATURE'], DEFAULT_TEMPERATURE),
  topP: toFloat(process.env['OLLAMA_TOP_P'], DEFAULT_TOP_P),

  requestTimeoutMs: toInt(process.env['CORE_REQUEST_TIMEOUT_MS'], DEFAULT_REQUEST_TIMEOUT_MS),
  keepAlive: process.env['OLLAMA_KEEP_ALIVE'] ?? DEFAULT_KEEP_ALIVE,
} as const;

export type AppConfig = typeof config;
