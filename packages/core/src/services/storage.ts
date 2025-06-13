import type { Prompt, CreatePrompt, UpdatePrompt } from '../models/prompt';
import type { Tag, CreateTag, UpdateTag } from '../models/tag';
import type { Workspace, CreateWorkspace, UpdateWorkspace } from '../models/workspace';

export interface StorageAdapter {
  prompts: {
    create(data: CreatePrompt): Promise<Prompt>;
    update(id: string, data: UpdatePrompt): Promise<Prompt>;
    delete(id: string): Promise<void>;
    get(id: string): Promise<Prompt | null>;
    list(filter?: PromptFilter): Promise<Prompt[]>;
    search(query: string): Promise<Prompt[]>;
  };
  
  workspaces: {
    create(data: CreateWorkspace): Promise<Workspace>;
    update(id: string, data: UpdateWorkspace): Promise<Workspace>;
    delete(id: string): Promise<void>;
    get(id: string): Promise<Workspace | null>;
    list(): Promise<Workspace[]>;
  };
  
  tags: {
    create(data: CreateTag): Promise<Tag>;
    update(id: string, data: UpdateTag): Promise<Tag>;
    delete(id: string): Promise<void>;
    get(id: string): Promise<Tag | null>;
    list(): Promise<Tag[]>;
  };
}

export interface PromptFilter {
  workspaceId?: string;
  tagIds?: string[];
  visibility?: string;
  status?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'usageCount';
  order?: 'asc' | 'desc';
}

export abstract class BaseStorageAdapter implements StorageAdapter {
  abstract prompts: StorageAdapter['prompts'];
  abstract workspaces: StorageAdapter['workspaces'];
  abstract tags: StorageAdapter['tags'];
  
  async initialize(): Promise<void> {
    // Override in subclasses if initialization is needed
  }
  
  async close(): Promise<void> {
    // Override in subclasses if cleanup is needed
  }
}