import { PromptSchema, type Prompt, PROMPT_STATUS, PROMPT_VISIBILITY, generateId } from '@prompalette/core';

import { logger } from '../config/logger.js';

export class InMemoryPromptStorage {
  private prompts: Map<string, Prompt> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    const samplePrompts: Prompt[] = [
      {
        id: generateId(),
        title: 'Code Review Assistant',
        content: 'Please review this code and provide suggestions for improvement:\n\n```\n[CODE_HERE]\n```\n\nFocus on:\n- Code quality and best practices\n- Performance considerations\n- Security vulnerabilities\n- Maintainability',
        description: 'A comprehensive code review assistant for various programming languages',
        workspaceId: 'default',
        tagIds: ['development', 'code-quality'],
        visibility: PROMPT_VISIBILITY.PRIVATE,
        status: PROMPT_STATUS.ACTIVE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        usageCount: 15,
      },
      {
        id: generateId(),
        title: 'Technical Documentation Writer',
        content: 'Create comprehensive technical documentation for:\n\n**Topic:** [TOPIC]\n**Audience:** [TARGET_AUDIENCE]\n**Scope:** [SCOPE]\n\nInclude:\n- Clear explanations\n- Code examples\n- Best practices\n- Troubleshooting guides',
        description: 'Generate professional technical documentation with proper structure',
        workspaceId: 'default',
        tagIds: ['documentation', 'technical-writing'],
        visibility: PROMPT_VISIBILITY.PRIVATE,
        status: PROMPT_STATUS.ACTIVE,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        usageCount: 8,
      },
    ];

    samplePrompts.forEach(prompt => {
      this.prompts.set(prompt.id, prompt);
    });

    logger.info(`Initialized storage with ${this.prompts.size} sample prompts`);
  }

  async findAll(filters?: {
    status?: string;
    visibility?: string;
    tagId?: string;
    workspaceId?: string;
  }): Promise<Prompt[]> {
    let results = Array.from(this.prompts.values());

    if (filters?.status) {
      results = results.filter(p => p.status === filters.status);
    }

    if (filters?.visibility) {
      results = results.filter(p => p.visibility === filters.visibility);
    }

    if (filters?.tagId) {
      results = results.filter(p => p.tagIds.includes(filters.tagId!));
    }

    if (filters?.workspaceId) {
      results = results.filter(p => p.workspaceId === filters.workspaceId);
    }

    return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async findById(id: string): Promise<Prompt | null> {
    return this.prompts.get(id) || null;
  }

  async create(data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Prompt> {
    const prompt = PromptSchema.parse({
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    });

    this.prompts.set(prompt.id, prompt);
    logger.info({ promptId: prompt.id }, 'Created new prompt');
    
    return prompt;
  }

  async update(id: string, data: Partial<Omit<Prompt, 'id' | 'createdAt'>>): Promise<Prompt | null> {
    const existing = this.prompts.get(id);
    if (!existing) {
      return null;
    }

    const updated = PromptSchema.parse({
      ...existing,
      ...data,
      id,
      updatedAt: new Date(),
    });

    this.prompts.set(id, updated);
    logger.info({ promptId: id }, 'Updated prompt');
    
    return updated;
  }

  async delete(id: string): Promise<Prompt | null> {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      return null;
    }

    this.prompts.delete(id);
    logger.info({ promptId: id }, 'Deleted prompt');
    
    return prompt;
  }

  async incrementUsage(id: string): Promise<Prompt | null> {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      return null;
    }

    const updated = {
      ...prompt,
      usageCount: prompt.usageCount + 1,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    };

    this.prompts.set(id, updated);
    logger.debug({ promptId: id, usageCount: updated.usageCount }, 'Incremented prompt usage');
    
    return updated;
  }
}

export const promptStorage = new InMemoryPromptStorage();