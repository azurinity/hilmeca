import type { FastifyPluginAsync } from 'fastify';
import { chat, generate, listModels } from '../ai/index.js';
import { HttpError, isRecord, isNonEmptyString } from '../lib/http.js';

export const aiRoutes: FastifyPluginAsync = async (app) => {
  app.get('/models', async () => {
    const models = await listModels();
    return { ok: true, models: models.models };
  });

  app.post('/chat', async (request) => {
    const body = request.body;

    if (!isRecord(body) || !Array.isArray(body.messages)) {
      throw new HttpError(400, '`messages` must be an array');
    }

    for (const [index, message] of body.messages.entries()) {
      if (!isRecord(message)) {
        throw new HttpError(400, `messages[${index}] must be an object`);
      }
      if (!isNonEmptyString(message.role)) {
        throw new HttpError(400, `messages[${index}] must include non-empty \`role\``);
      }
      if (message.role === 'user' && !isNonEmptyString(message.content)) {
        throw new HttpError(
          400,
          `messages[${index}] by \`role: user\` must include non-empty \`content\``,
        );
      }
    }

    const format = body.format === 'json' || isRecord(body.format) ? body.format : undefined;
    const keep_alive =
      typeof body.keep_alive === 'string' || typeof body.keep_alive === 'number'
        ? body.keep_alive
        : undefined;
    const think =
      typeof body.think === 'boolean' ||
      body.think === 'low' ||
      body.think === 'medium' ||
      body.think === 'high' ||
      body.think === 'max'
        ? body.think
        : undefined;

    const result = await chat({
      model: isNonEmptyString(body.model) ? body.model : undefined,
      messages: body.messages,
      format,
      options: isRecord(body.options) ? body.options : undefined,
      keep_alive,
      think,
    });

    return {
      ok: true,
      model: result.model,
      message: result.message,
      metrics: {
        done: result.done,
        doneReason: result.done_reason,
        totalDuration: result.total_duration,
        promptEvalCount: result.prompt_eval_count,
        evalCount: result.eval_count,
      },
    };
  });

  app.post('/generate', async (request) => {
    const body = request.body;

    if (!isRecord(body) || !isNonEmptyString(body.prompt)) {
      throw new HttpError(400, '`prompt` must be a non-empty string');
    }

    const format = body.format === 'json' || isRecord(body.format) ? body.format : undefined;
    const keep_alive =
      typeof body.keep_alive === 'string' || typeof body.keep_alive === 'number'
        ? body.keep_alive
        : undefined;
    const think =
      typeof body.think === 'boolean' ||
      body.think === 'low' ||
      body.think === 'medium' ||
      body.think === 'high' ||
      body.think === 'max'
        ? body.think
        : undefined;

    const result = await generate({
      model: isNonEmptyString(body.model) ? body.model : undefined,
      prompt: body.prompt,
      images: Array.isArray(body.images) ? body.images : undefined,
      format,
      options: isRecord(body.options) ? body.options : undefined,
      keep_alive,
      think,
      system: isNonEmptyString(body.system) ? body.system : undefined,
    });

    return {
      ok: true,
      model: result.model,
      response: result.response,
      thinking: result.thinking,
      metrics: {
        done: result.done,
        doneReason: result.done_reason,
        totalDuration: result.total_duration,
        promptEvalCount: result.prompt_eval_count,
        evalCount: result.eval_count,
      },
    };
  });
};
