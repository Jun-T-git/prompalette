import crypto from 'node:crypto';

import { z } from 'zod';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

import { fileStorage } from './fileStorage.js';

// API Key schema validation
const ApiKeySchema = z.object({
  id: z.string(),
  keyHash: z.string(),
  userId: z.string(),
  name: z.string(),
  permissions: z.array(z.string()).default(['read', 'write']),
  createdAt: z.date(),
  lastUsedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  workspaces: string[];
  permissions: string[];
  createdAt: Date;
  isActive: boolean;
}

// Secure API key generation
export const generateApiKey = (): { key: string; hash: string } => {
  const key = `prm_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, hash };
};

// Hash API key for storage/comparison
export const hashApiKey = (key: string): string => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

// Secure user ID generation
export const generateUserId = (): string => {
  return `usr_${crypto.randomBytes(16).toString('hex')}`;
};

// Auth service with file storage
class AuthService {
  constructor() {
    // AuthService is ready to use without pre-seeded demo data
  }

  async validateApiKey(key: string): Promise<{ user: AuthUser; apiKey: ApiKey } | null> {
    if (!key || !key.startsWith('prm_')) {
      return null;
    }

    const keyHash = hashApiKey(key);
    const result = await fileStorage.getApiKeyByHash(keyHash);

    if (!result) {
      logger.warn({ keyHash: keyHash.slice(0, 8) + '...' }, 'Invalid or inactive API key');
      return null;
    }

    const { user, apiKey } = result;

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      logger.warn({ keyId: apiKey.id }, 'Expired API key used');
      return null;
    }

    logger.debug({ 
      userId: user.id, 
      keyId: apiKey.id,
      permissions: apiKey.permissions 
    }, 'API key validated successfully');

    return { user, apiKey };
  }

  async createApiKey(userId: string, name: string, permissions: string[] = ['read', 'write']): Promise<{ key: string; apiKey: ApiKey }> {
    const user = await fileStorage.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { key, hash } = generateApiKey();
    const apiKey = await fileStorage.createApiKey(hash, userId, name, permissions);

    logger.info({ 
      userId, 
      keyId: apiKey.id, 
      keyName: name 
    }, 'API key created');

    return { key, apiKey };
  }

  async revokeApiKey(keyId: string): Promise<boolean> {
    const success = await fileStorage.revokeApiKey(keyId);
    
    if (success) {
      logger.info({ keyId }, 'API key revoked');
    }
    
    return success;
  }

  async createUser(email: string, name: string, workspaces: string[] = [], permissions: string[] = ['read', 'write']): Promise<AuthUser> {
    const user = await fileStorage.createUser(email, name, workspaces, permissions);

    logger.info({ 
      userId: user.id, 
      email: user.email 
    }, 'User created');

    return user;
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    return await fileStorage.getUserById(userId);
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await fileStorage.getUserById(userId);
    return user?.permissions.includes(permission) || user?.permissions.includes('admin') || false;
  }

  async canAccessWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    const user = await fileStorage.getUserById(userId);
    return user?.workspaces.includes(workspaceId) || user?.permissions.includes('admin') || false;
  }
}

export const authService = new AuthService();