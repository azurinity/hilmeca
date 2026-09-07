import type { FastifyPluginAsync } from 'fastify';
import { APP_NAME } from '../constants.js';
import { config } from '../config.js';
import { isOllamaAlive } from '../ai/index.js';
import { HttpError } from '../lib/http.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => {
    return {
      ok: true,
      service: APP_NAME,
      time: new Date().toISOString(),
    };
  });

  app.get('/ready', async () => {
    const ollamaUp = await isOllamaAlive();

    if (!ollamaUp) {
      throw new HttpError(503, 'Ollama is not reachable', {
        ollamaBaseUrl: config.ollamaBaseUrl,
      });
    }

    return {
      ok: true,
      service: APP_NAME,
      ollama: {
        reachable: true,
        baseUrl: config.ollamaBaseUrl,
      },
    };
  });
};
