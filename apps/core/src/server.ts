import Fastify from 'fastify';
import { config } from './config.js';
import { APP_NAME } from './constants.js';
import { HttpError } from './lib/http.js';
import { promptHostSelection } from './lib/network.js';
import { healthRoutes } from './routes/health.js';
import { aiRoutes } from './routes/ai.js';

export function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  });

  app.addHook('onSend', async (_request, reply, payload) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'content-type, authorization');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    return payload;
  });

  app.options('*', async (_request, reply) => {
    reply.code(204).send();
  });

  app.get('/', async () => {
    return {
      ok: true,
      service: APP_NAME,
      routes: ['/health', '/ready', '/v1/models', '/v1/chat', '/v1/generate'],
    };
  });

  app.register(healthRoutes);
  app.register(aiRoutes, { prefix: '/v1' });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({
        ok: false,
        error: error.message,
        details: error.details ?? null,
      });
    }

    return reply.code(500).send({
      ok: false,
      error: 'Internal server error',
    });
  });

  return app;
}

export async function startServer() {
  // Prompt user interactively for host target (defaults to config.host)
  const host = await promptHostSelection(config.host);

  const app = buildServer();

  const address = await app.listen({
    host,
    port: config.port,
  });

  app.log.info(`${APP_NAME} listening at ${address}`);
  app.log.info(`Ollama base URL: ${config.ollamaBaseUrl}`);

  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return app;
}
