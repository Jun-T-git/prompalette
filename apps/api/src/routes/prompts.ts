import { Hono } from 'hono';

import { logger } from '../config/logger.js';
import { promptStorage } from '../lib/storage.js';

const prompts = new Hono();

prompts.get('/', async (c) => {
  try {
    const status = c.req.query('status');
    const visibility = c.req.query('visibility');
    const tagId = c.req.query('tagId');
    const workspaceId = c.req.query('workspaceId');

    const results = await promptStorage.findAll({
      status,
      visibility,
      tagId,
      workspaceId,
    });

    logger.debug({ 
      filters: { status, visibility, tagId, workspaceId },
      count: results.length 
    }, 'Retrieved prompts');

    return c.json({
      prompts: results,
      total: results.length,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to retrieve prompts');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

prompts.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const prompt = await promptStorage.findById(id);

    if (!prompt) {
      logger.warn({ promptId: id }, 'Prompt not found');
      return c.json({ error: 'Prompt not found' }, 404);
    }

    return c.json({ prompt });
  } catch (error) {
    logger.error({ error }, 'Failed to retrieve prompt');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

prompts.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    const prompt = await promptStorage.create({
      ...body,
      workspaceId: body.workspaceId || 'default',
    });

    logger.info({ promptId: prompt.id, title: prompt.title }, 'Created new prompt');
    return c.json({ prompt }, 201);
  } catch (error) {
    logger.error({ error }, 'Failed to create prompt');
    return c.json({ error: 'Invalid prompt data' }, 400);
  }
});

prompts.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const prompt = await promptStorage.update(id, body);

    if (!prompt) {
      logger.warn({ promptId: id }, 'Prompt not found for update');
      return c.json({ error: 'Prompt not found' }, 404);
    }

    logger.info({ promptId: id }, 'Updated prompt');
    return c.json({ prompt });
  } catch (error) {
    logger.error({ error }, 'Failed to update prompt');
    return c.json({ error: 'Invalid prompt data' }, 400);
  }
});

prompts.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const prompt = await promptStorage.delete(id);

    if (!prompt) {
      logger.warn({ promptId: id }, 'Prompt not found for deletion');
      return c.json({ error: 'Prompt not found' }, 404);
    }

    logger.info({ promptId: id }, 'Deleted prompt');
    return c.json({ prompt });
  } catch (error) {
    logger.error({ error }, 'Failed to delete prompt');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

prompts.post('/:id/usage', async (c) => {
  try {
    const id = c.req.param('id');
    const prompt = await promptStorage.incrementUsage(id);

    if (!prompt) {
      logger.warn({ promptId: id }, 'Prompt not found for usage increment');
      return c.json({ error: 'Prompt not found' }, 404);
    }

    return c.json({ prompt, message: 'Usage incremented' });
  } catch (error) {
    logger.error({ error }, 'Failed to increment usage');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { prompts as promptsRoute };