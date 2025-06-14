import { CreatePromptSchema, UpdatePromptSchema } from '@prompalette/core';
import { Hono } from 'hono';
import { ZodError } from 'zod';

import { ERROR_CODES, createErrorResponse } from '../config/errors.js';
import { logger } from '../config/logger.js';
import { fileStorage } from '../services/fileStorage.js';

const prompts = new Hono();

// Initialize storage when the module is loaded
fileStorage.initialize().catch(error => {
  console.error('Failed to initialize file storage:', error);
});

prompts.get('/', async (c) => {
  const requestId = c.get('requestId');
  const auth = c.get('auth');
  
  try {
    const status = c.req.query('status');
    const visibility = c.req.query('visibility');
    const tagId = c.req.query('tagId');
    const workspaceId = c.req.query('workspaceId');

    const results = await fileStorage.getPrompts({
      status,
      visibility,
      tagId,
      workspaceId,
    });

    await fileStorage.logAccess('*', auth?.user?.id || 'anonymous', 'list', {
      filters: { status, visibility, tagId, workspaceId },
      resultCount: results.length
    });

    logger.debug({ 
      requestId,
      userId: auth?.user?.id,
      filters: { status, visibility, tagId, workspaceId },
      count: results.length 
    }, 'Retrieved prompts');

    return c.json({
      prompts: results,
      total: results.length,
      requestId,
    });
  } catch (error) {
    logger.error({ 
      requestId, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'Failed to retrieve prompts');
    return c.json(
      createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Failed to retrieve prompts',
        { requestId }
      ),
      500
    );
  }
});

prompts.get('/:id', async (c) => {
  const requestId = c.get('requestId');
  const auth = c.get('auth');
  
  try {
    const id = c.req.param('id');
    const prompt = await fileStorage.getPromptById(id);

    if (!prompt) {
      logger.warn({ requestId, promptId: id, userId: auth?.user?.id }, 'Prompt not found');
      return c.json(
        createErrorResponse(
          ERROR_CODES.PROMPT_NOT_FOUND,
          'Prompt not found',
          { requestId, promptId: id }
        ),
        404
      );
    }

    await fileStorage.logAccess(id, auth?.user?.id || 'anonymous', 'read');

    return c.json({ prompt, requestId });
  } catch (error) {
    logger.error({ 
      requestId, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'Failed to retrieve prompt');
    return c.json(
      createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Failed to retrieve prompt',
        { requestId }
      ),
      500
    );
  }
});

prompts.post('/', async (c) => {
  const requestId = c.get('requestId');
  const auth = c.get('auth');
  
  try {
    const body = await c.req.json();
    
    const validatedData = CreatePromptSchema.parse({
      ...body,
      workspaceId: body.workspaceId || 'wsp_demo',
    });
    
    const prompt = await fileStorage.createPrompt(validatedData);

    await fileStorage.logAccess(prompt.id, auth?.user?.id || 'anonymous', 'create', {
      title: prompt.title,
      workspaceId: prompt.workspaceId
    });

    logger.info({ 
      requestId,
      promptId: prompt.id, 
      title: prompt.title,
      userId: auth?.user?.id
    }, 'Created new prompt');
    
    return c.json({ prompt, requestId }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn({ requestId, error: error.issues }, 'Invalid request data');
      return c.json(
        createErrorResponse(
          ERROR_CODES.INVALID_REQUEST_DATA,
          'Invalid request data',
          { 
            requestId,
            details: error.issues.map(issue => ({ 
              field: issue.path.join('.'), 
              message: issue.message 
            }))
          }
        ),
        400
      );
    }
    
    if (error instanceof Error && error.message.includes('Access denied')) {
      logger.warn({ requestId, userId: auth?.user?.id, error: error.message }, 'Access denied');
      return c.json(
        createErrorResponse(
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          error.message,
          { requestId }
        ),
        403
      );
    }
    
    logger.error({ 
      requestId, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'Failed to create prompt');
    return c.json(
      createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Failed to create prompt',
        { requestId }
      ),
      500
    );
  }
});

prompts.put('/:id', async (c) => {
  const requestId = c.get('requestId');
  const auth = c.get('auth');
  
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const validatedData = UpdatePromptSchema.parse(body);
    const prompt = await fileStorage.updatePrompt(id, validatedData);

    if (!prompt) {
      logger.warn({ requestId, promptId: id, userId: auth?.user?.id }, 'Prompt not found for update');
      return c.json(
        createErrorResponse(
          ERROR_CODES.PROMPT_NOT_FOUND,
          'Prompt not found',
          { requestId, promptId: id }
        ),
        404
      );
    }

    await fileStorage.logAccess(id, auth?.user?.id || 'anonymous', 'update', {
      updatedFields: Object.keys(validatedData)
    });

    logger.info({ requestId, promptId: id, userId: auth?.user?.id }, 'Updated prompt');
    return c.json({ prompt, requestId });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn({ requestId, error: error.issues }, 'Invalid request data');
      return c.json(
        createErrorResponse(
          ERROR_CODES.INVALID_REQUEST_DATA,
          'Invalid request data',
          { 
            requestId,
            details: error.issues.map(issue => ({ 
              field: issue.path.join('.'), 
              message: issue.message 
            }))
          }
        ),
        400
      );
    }
    
    if (error instanceof Error && error.message.includes('Access denied')) {
      logger.warn({ requestId, userId: auth?.user?.id, error: error.message }, 'Access denied');
      return c.json(
        createErrorResponse(
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          error.message,
          { requestId }
        ),
        403
      );
    }
    
    logger.error({ 
      requestId, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'Failed to update prompt');
    return c.json(
      createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Failed to update prompt',
        { requestId }
      ),
      500
    );
  }
});

prompts.delete('/:id', async (c) => {
  const requestId = c.get('requestId');
  const auth = c.get('auth');
  
  try {
    const id = c.req.param('id');
    const prompt = await fileStorage.deletePrompt(id);

    if (!prompt) {
      logger.warn({ requestId, promptId: id, userId: auth?.user?.id }, 'Prompt not found for deletion');
      return c.json(
        createErrorResponse(
          ERROR_CODES.PROMPT_NOT_FOUND,
          'Prompt not found',
          { requestId, promptId: id }
        ),
        404
      );
    }

    await fileStorage.logAccess(id, auth?.user?.id || 'anonymous', 'delete', {
      title: prompt.title,
      workspaceId: prompt.workspaceId
    });

    logger.info({ requestId, promptId: id, userId: auth?.user?.id }, 'Deleted prompt');
    return c.json({ prompt, requestId });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      logger.warn({ requestId, userId: auth?.user?.id, error: error.message }, 'Access denied');
      return c.json(
        createErrorResponse(
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          error.message,
          { requestId }
        ),
        403
      );
    }
    
    logger.error({ 
      requestId, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'Failed to delete prompt');
    return c.json(
      createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Failed to delete prompt',
        { requestId }
      ),
      500
    );
  }
});

prompts.post('/:id/usage', async (c) => {
  const requestId = c.get('requestId');
  const auth = c.get('auth');
  
  try {
    const id = c.req.param('id');
    const prompt = await fileStorage.incrementPromptUsage(id);

    if (!prompt) {
      logger.warn({ requestId, promptId: id, userId: auth?.user?.id }, 'Prompt not found for usage increment');
      return c.json(
        createErrorResponse(
          ERROR_CODES.PROMPT_NOT_FOUND,
          'Prompt not found',
          { requestId, promptId: id }
        ),
        404
      );
    }

    await fileStorage.logAccess(id, auth?.user?.id || 'anonymous', 'use', {
      usageCount: prompt.usageCount
    });

    logger.info({ 
      requestId, 
      promptId: id, 
      userId: auth?.user?.id,
      usageCount: prompt.usageCount
    }, 'Incremented prompt usage');
    
    return c.json({ prompt, message: 'Usage incremented', requestId });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      logger.warn({ requestId, userId: auth?.user?.id, error: error.message }, 'Access denied');
      return c.json(
        createErrorResponse(
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          error.message,
          { requestId }
        ),
        403
      );
    }
    
    logger.error({ 
      requestId, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'Failed to increment usage');
    return c.json(
      createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        'Failed to increment usage',
        { requestId }
      ),
      500
    );
  }
});

export { prompts as promptsRoute };