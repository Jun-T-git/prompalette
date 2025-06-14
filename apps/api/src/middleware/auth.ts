import { Context, Next } from 'hono';

import { ERROR_CODES, createErrorResponse } from '../config/errors.js';
import { logger } from '../config/logger.js';
import { authService, type AuthUser, type ApiKey } from '../services/auth.js';

export interface AuthContext {
  user: AuthUser;
  apiKey: ApiKey;
  requestId: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
    requestId: string;
  }
}

// Generate request ID for tracing
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const requestIdMiddleware = () => {
  return async (c: Context, next: Next) => {
    const requestId = generateRequestId();
    c.set('requestId', requestId);
    c.header('X-Request-ID', requestId);
    await next();
  };
};

export const authMiddleware = (options: { required?: boolean } = { required: true }) => {
  return async (c: Context, next: Next) => {
    const requestId = c.get('requestId') || generateRequestId();
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      if (!options.required) {
        await next();
        return;
      }
      
      logger.warn({ requestId }, 'No authorization header provided');
      return c.json(
        createErrorResponse(
          ERROR_CODES.AUTH_REQUIRED,
          'Authentication required',
          { requestId }
        ),
        401
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      logger.warn({ requestId }, 'Invalid authorization header format');
      return c.json(
        createErrorResponse(
          ERROR_CODES.INVALID_AUTH_FORMAT,
          'Invalid authorization format. Use Bearer token.',
          { requestId }
        ),
        401
      );
    }

    const apiKey = authHeader.substring(7);
    
    if (!apiKey) {
      logger.warn({ requestId }, 'Empty API key provided');
      return c.json(
        createErrorResponse(
          ERROR_CODES.INVALID_API_KEY,
          'API key required',
          { requestId }
        ),
        401
      );
    }

    try {
      const authResult = await authService.validateApiKey(apiKey);
      
      if (!authResult) {
        logger.warn({ 
          requestId,
          keyPrefix: apiKey.slice(0, 8) + '...',
          ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
        }, 'Invalid API key authentication attempt');
        
        return c.json(
          createErrorResponse(
            ERROR_CODES.INVALID_API_KEY,
            'Invalid API key',
            { requestId }
          ),
          401
        );
      }

      const { user, apiKey: validatedKey } = authResult;

      c.set('auth', { 
        user, 
        apiKey: validatedKey, 
        requestId 
      });
      
      logger.debug({ 
        requestId,
        userId: user.id,
        keyId: validatedKey.id,
        permissions: validatedKey.permissions
      }, 'User authenticated successfully');
      
      await next();
    } catch (error) {
      logger.error({ 
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'Authentication error');
      
      return c.json(
        createErrorResponse(
          ERROR_CODES.INTERNAL_SERVER_ERROR,
          'Authentication service error',
          { requestId }
        ),
        500
      );
    }
  };
};

export const requirePermission = (permission: string) => {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth');
    const requestId = c.get('requestId');
    
    if (!auth) {
      logger.error({ requestId }, 'Permission check called without authentication');
      return c.json(
        createErrorResponse(
          ERROR_CODES.AUTH_REQUIRED,
          'Authentication required',
          { requestId }
        ),
        401
      );
    }

    const hasPermission = await authService.hasPermission(auth.user.id, permission);
    
    if (!hasPermission) {
      logger.warn({ 
        requestId,
        userId: auth.user.id,
        requiredPermission: permission,
        userPermissions: auth.user.permissions
      }, 'Permission denied');
      
      return c.json(
        createErrorResponse(
          ERROR_CODES.INSUFFICIENT_PERMISSIONS || 'INSUFFICIENT_PERMISSIONS',
          `Permission '${permission}' required`,
          { requestId, requiredPermission: permission }
        ),
        403
      );
    }

    await next();
  };
};

export const requireWorkspaceAccess = (workspaceIdParam: string = 'workspaceId') => {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth');
    const requestId = c.get('requestId');
    
    if (!auth) {
      logger.error({ requestId }, 'Workspace access check called without authentication');
      return c.json(
        createErrorResponse(
          ERROR_CODES.AUTH_REQUIRED,
          'Authentication required',
          { requestId }
        ),
        401
      );
    }

    const workspaceId = c.req.param(workspaceIdParam) || c.req.query(workspaceIdParam);
    
    if (!workspaceId) {
      logger.warn({ requestId }, 'Workspace ID not provided');
      return c.json(
        createErrorResponse(
          ERROR_CODES.MISSING_REQUIRED_FIELD || 'MISSING_REQUIRED_FIELD',
          'Workspace ID required',
          { requestId }
        ),
        400
      );
    }

    const canAccess = await authService.canAccessWorkspace(auth.user.id, workspaceId);
    
    if (!canAccess) {
      logger.warn({ 
        requestId,
        userId: auth.user.id,
        workspaceId,
        userWorkspaces: auth.user.workspaces
      }, 'Workspace access denied');
      
      return c.json(
        createErrorResponse(
          ERROR_CODES.WORKSPACE_NOT_FOUND,
          'Workspace not found or access denied',
          { requestId, workspaceId }
        ),
        404
      );
    }

    await next();
  };
};

