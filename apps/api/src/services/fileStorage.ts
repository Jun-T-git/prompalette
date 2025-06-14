import fs from 'node:fs/promises';
import path from 'node:path';

import { Prompt, type CreatePrompt, type UpdatePrompt } from '@prompalette/core';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

import type { AuthUser, ApiKey } from './auth.js';

interface DatabaseSchema {
  users: Record<string, AuthUser>;
  apiKeys: Record<string, ApiKey>;
  prompts: Record<string, Prompt>;
  auditLogs: Array<{
    id: string;
    promptId: string;
    userId: string;
    action: string;
    details?: Record<string, unknown>;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
}

export class FileStorage {
  private dataPath: string;
  private data: DatabaseSchema;
  private initialized = false;
  
  // Data limits to prevent memory exhaustion
  private readonly MAX_USERS = 10000;
  private readonly MAX_API_KEYS_PER_USER = 10;
  private readonly MAX_PROMPTS = 50000;
  private readonly MAX_AUDIT_LOGS = 10000;

  constructor(dataPath?: string) {
    this.dataPath = dataPath || env.DATABASE_PATH.replace('.db', '.json');
    this.data = {
      users: {},
      apiKeys: {},
      prompts: {},
      auditLogs: []
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure directory exists
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });

      // Load existing data if file exists
      try {
        const fileContent = await fs.readFile(this.dataPath, 'utf-8');
        if (fileContent.trim()) {
          const parsedData = JSON.parse(fileContent);
          
          // Validate data structure
          if (parsedData && typeof parsedData === 'object') {
            this.data = {
              users: parsedData.users || {},
              apiKeys: parsedData.apiKeys || {},
              prompts: parsedData.prompts || {},
              auditLogs: parsedData.auditLogs || []
            };
            
            // Convert string dates back to Date objects
            this.restoreDateFields();
            
            logger.info(`Loaded data from ${this.dataPath}`);
          } else {
            throw new Error('Invalid data format');
          }
        } else {
          throw new Error('Empty file');
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('ENOENT')) {
          logger.info(`Creating new database at ${this.dataPath}`);
        } else {
          logger.info(`Initializing new database at ${this.dataPath}`);
        }
        await this.seedSampleData();
        await this.save();
      }

      this.initialized = true;
    } catch (error) {
      logger.error({ error }, 'Failed to initialize file storage');
      throw error;
    }
  }

  private async seedSampleData(): Promise<void> {
    // Only add sample data in development or test mode
    if (env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test') {
      return;
    }

    // Add sample prompts
    const samplePrompts = [
      {
        id: 'prm_sample_1',
        title: 'Code Review Assistant',
        content: 'Please review this code and provide suggestions for improvement:\\n\\n```\\n[CODE_HERE]\\n```\\n\\nFocus on:\\n- Code quality and best practices\\n- Performance considerations\\n- Security vulnerabilities\\n- Maintainability',
        description: 'A comprehensive code review assistant for various programming languages',
        workspaceId: 'wsp_demo',
        tagIds: ['development', 'code-quality'],
        visibility: 'private' as const,
        status: 'active' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        usageCount: 15,
        lastUsedAt: new Date('2024-01-01'),
      },
      {
        id: 'prm_sample_2',
        title: 'Technical Documentation Writer',
        content: 'Create comprehensive technical documentation for:\\n\\n**Topic:** [TOPIC]\\n**Audience:** [TARGET_AUDIENCE]\\n**Scope:** [SCOPE]\\n\\nInclude:\\n- Clear explanations\\n- Code examples\\n- Best practices\\n- Troubleshooting guides',
        description: 'Generate professional technical documentation with proper structure',
        workspaceId: 'wsp_demo',
        tagIds: ['documentation', 'technical-writing'],
        visibility: 'private' as const,
        status: 'active' as const,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        usageCount: 8,
        lastUsedAt: new Date('2024-01-02'),
      },
    ];

    samplePrompts.forEach(prompt => {
      this.data.prompts[prompt.id] = prompt;
    });

    logger.info(`Seeded ${samplePrompts.length} sample prompts`);
  }

  private restoreDateFields(): void {
    // Restore Date objects for users
    for (const user of Object.values(this.data.users)) {
      if (typeof user.createdAt === 'string') {
        user.createdAt = new Date(user.createdAt);
      }
    }

    // Restore Date objects for API keys
    for (const apiKey of Object.values(this.data.apiKeys)) {
      if (typeof apiKey.createdAt === 'string') {
        apiKey.createdAt = new Date(apiKey.createdAt);
      }
      if (apiKey.lastUsedAt && typeof apiKey.lastUsedAt === 'string') {
        apiKey.lastUsedAt = new Date(apiKey.lastUsedAt);
      }
    }

    // Restore Date objects for prompts
    for (const prompt of Object.values(this.data.prompts)) {
      if (typeof prompt.createdAt === 'string') {
        prompt.createdAt = new Date(prompt.createdAt);
      }
      if (typeof prompt.updatedAt === 'string') {
        prompt.updatedAt = new Date(prompt.updatedAt);
      }
      if (prompt.lastUsedAt && typeof prompt.lastUsedAt === 'string') {
        prompt.lastUsedAt = new Date(prompt.lastUsedAt);
      }
    }
  }

  private enforceDataLimits(): void {
    // Enforce user limit
    const userIds = Object.keys(this.data.users);
    if (userIds.length > this.MAX_USERS) {
      // Remove oldest users (excluding active API keys)
      const usersWithActiveKeys = new Set(
        Object.values(this.data.apiKeys)
          .filter(key => key.isActive)
          .map(key => key.userId)
      );
      
      const usersToRemove = userIds
        .filter(id => !usersWithActiveKeys.has(id))
        .sort((a, b) => this.data.users[a].createdAt.getTime() - this.data.users[b].createdAt.getTime())
        .slice(0, userIds.length - this.MAX_USERS);
      
      usersToRemove.forEach(id => delete this.data.users[id]);
      
      if (usersToRemove.length > 0) {
        logger.warn({ removedUsers: usersToRemove.length }, 'Removed old users due to limit');
      }
    }

    // Enforce prompt limit
    const promptIds = Object.keys(this.data.prompts);
    if (promptIds.length > this.MAX_PROMPTS) {
      const promptsToRemove = promptIds
        .sort((a, b) => this.data.prompts[a].updatedAt.getTime() - this.data.prompts[b].updatedAt.getTime())
        .slice(0, promptIds.length - this.MAX_PROMPTS);
      
      promptsToRemove.forEach(id => delete this.data.prompts[id]);
      
      logger.warn({ removedPrompts: promptsToRemove.length }, 'Removed old prompts due to limit');
    }

    // Enforce audit log limit (already implemented but moved here for consistency)
    if (this.data.auditLogs.length > this.MAX_AUDIT_LOGS) {
      this.data.auditLogs = this.data.auditLogs.slice(-this.MAX_AUDIT_LOGS);
    }
  }

  private async save(): Promise<void> {
    // Enforce data limits before saving
    this.enforceDataLimits();
    
    // Use atomic write operation to prevent data corruption
    const tempPath = `${this.dataPath}.tmp.${Date.now()}.${Math.random().toString(36).substr(2, 8)}`;
    
    try {
      // Write to temporary file first
      await fs.writeFile(tempPath, JSON.stringify(this.data, null, 2));
      
      // Atomically move temporary file to final location
      await fs.rename(tempPath, this.dataPath);
      
      logger.debug({ dataPath: this.dataPath }, 'Data saved successfully');
    } catch (error) {
      // Clean up temporary file on error
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      logger.error({ error, dataPath: this.dataPath, tempPath }, 'Failed to save data to file');
      throw error;
    }
  }

  // User operations
  async createUser(email: string, name: string, workspaces: string[] = [], permissions: string[] = ['read', 'write']): Promise<AuthUser> {
    await this.initialize();
    
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: AuthUser = {
      id,
      email,
      name,
      workspaces,
      permissions,
      createdAt: new Date(),
      isActive: true,
    };

    this.data.users[id] = user;
    await this.save();
    
    return user;
  }

  async getUserById(id: string): Promise<AuthUser | null> {
    await this.initialize();
    
    const user = this.data.users[id];
    return user && user.isActive ? user : null;
  }

  // API Key operations
  async createApiKey(keyHash: string, userId: string, name: string, permissions: string[] = ['read', 'write']): Promise<ApiKey> {
    await this.initialize();
    
    // Check API key limit per user
    const userApiKeys = Object.values(this.data.apiKeys).filter(
      key => key.userId === userId && key.isActive
    );
    
    if (userApiKeys.length >= this.MAX_API_KEYS_PER_USER) {
      throw new Error(`User has reached the maximum limit of ${this.MAX_API_KEYS_PER_USER} API keys`);
    }
    
    const id = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const apiKey: ApiKey = {
      id,
      keyHash,
      userId,
      name,
      permissions,
      createdAt: new Date(),
      isActive: true,
    };

    this.data.apiKeys[keyHash] = apiKey;
    await this.save();
    
    return apiKey;
  }

  async getApiKeyByHash(keyHash: string): Promise<{ user: AuthUser; apiKey: ApiKey } | null> {
    await this.initialize();
    
    const apiKey = this.data.apiKeys[keyHash];
    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    const user = this.data.users[apiKey.userId];
    if (!user || !user.isActive) {
      return null;
    }

    // Update last used timestamp
    apiKey.lastUsedAt = new Date();
    await this.save();

    return { user, apiKey };
  }

  async revokeApiKey(keyId: string): Promise<boolean> {
    await this.initialize();
    
    for (const apiKey of Object.values(this.data.apiKeys)) {
      if (apiKey.id === keyId) {
        apiKey.isActive = false;
        await this.save();
        return true;
      }
    }
    return false;
  }

  // Prompt operations
  async createPrompt(data: CreatePrompt): Promise<Prompt> {
    await this.initialize();
    
    const id = `prm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const prompt: Prompt = {
      id,
      title: data.title,
      content: data.content,
      description: data.description,
      workspaceId: data.workspaceId,
      tagIds: data.tagIds || [],
      visibility: data.visibility || 'private' as const,
      status: data.status || 'active' as const,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      metadata: data.metadata,
    };

    this.data.prompts[id] = prompt;
    await this.save();
    
    return prompt;
  }

  async getPromptById(id: string): Promise<Prompt | null> {
    await this.initialize();
    return this.data.prompts[id] || null;
  }

  async getPrompts(filters?: {
    workspaceId?: string;
    status?: string;
    visibility?: string;
    tagId?: string;
  }): Promise<Prompt[]> {
    await this.initialize();
    
    let results = Object.values(this.data.prompts);

    if (filters?.workspaceId) {
      results = results.filter(prompt => prompt.workspaceId === filters.workspaceId);
    }

    if (filters?.status) {
      results = results.filter(prompt => prompt.status === filters.status);
    }

    if (filters?.visibility) {
      results = results.filter(prompt => prompt.visibility === filters.visibility);
    }

    if (filters?.tagId) {
      results = results.filter(prompt => prompt.tagIds.includes(filters.tagId!));
    }

    return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async updatePrompt(id: string, data: UpdatePrompt): Promise<Prompt | null> {
    await this.initialize();
    
    const existing = this.data.prompts[id];
    if (!existing) {
      return null;
    }

    const updated: Prompt = {
      ...existing,
      ...data,
      id: existing.id, // Ensure ID cannot be changed
      createdAt: existing.createdAt, // Ensure createdAt cannot be changed
      updatedAt: new Date(),
    };

    this.data.prompts[id] = updated;
    await this.save();
    
    return updated;
  }

  async deletePrompt(id: string): Promise<Prompt | null> {
    await this.initialize();
    
    const existing = this.data.prompts[id];
    if (!existing) {
      return null;
    }

    delete this.data.prompts[id];
    await this.save();
    
    return existing;
  }

  async incrementPromptUsage(id: string): Promise<Prompt | null> {
    await this.initialize();
    
    const existing = this.data.prompts[id];
    if (!existing) {
      return null;
    }

    existing.usageCount++;
    existing.lastUsedAt = new Date();
    existing.updatedAt = new Date();
    
    await this.save();
    return existing;
  }

  // Audit logging
  async logAccess(promptId: string, userId: string, action: string, details?: Record<string, unknown>, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.initialize();
    
    const auditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      promptId,
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
    };

    this.data.auditLogs.push(auditLog);
    
    // Keep only last 10000 audit logs to prevent file from growing too large
    if (this.data.auditLogs.length > 10000) {
      this.data.auditLogs = this.data.auditLogs.slice(-10000);
    }
    
    await this.save();
  }

  async getAccessLog(promptId?: string, userId?: string): Promise<Record<string, unknown>[]> {
    await this.initialize();
    
    let logs = this.data.auditLogs;
    
    if (promptId) {
      logs = logs.filter(log => log.promptId === promptId);
    }
    
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    
    return logs.slice(-100); // Return last 100 logs
  }

  close(): void {
    this.initialized = false;
    logger.info('File storage closed');
  }
}

// Global instance for the application
export const fileStorage = new FileStorage();