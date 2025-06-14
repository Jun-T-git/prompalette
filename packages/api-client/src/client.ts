import type {
  Prompt,
  CreatePrompt,
  UpdatePrompt,
  Workspace,
  CreateWorkspace,
  UpdateWorkspace,
  Tag,
  CreateTag,
  UpdateTag,
  PromptFilter,
} from '@prompalette/core';
import ky, { type KyInstance } from 'ky';

export interface ApiClientOptions {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export class PromPaletteClient {
  private client: KyInstance;

  constructor(options: ApiClientOptions) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }

    this.client = ky.create({
      prefixUrl: options.baseUrl,
      timeout: options.timeout ?? 30000,
      headers,
      hooks: {
        beforeRequest: [
          (_request) => {
            // Add any request interceptors here
          },
        ],
        afterResponse: [
          async (_request, _options, response) => {
            if (!response.ok) {
              const error = (await response.json().catch(() => ({ error: 'Unknown error' }))) as { error?: string; message?: string };
              throw new Error(error.error || error.message || `Request failed with status ${response.status}`);
            }
            return response;
          },
        ],
      },
    });
  }

  // Prompts
  async createPrompt(data: CreatePrompt): Promise<Prompt> {
    const response = await this.client.post('prompts', { json: data }).json<{ prompt: Prompt }>();
    return response.prompt;
  }

  async updatePrompt(id: string, data: UpdatePrompt): Promise<Prompt> {
    const response = await this.client.put(`prompts/${id}`, { json: data }).json<{ prompt: Prompt }>();
    return response.prompt;
  }

  async deletePrompt(id: string): Promise<void> {
    await this.client.delete(`prompts/${id}`);
  }

  async getPrompt(id: string): Promise<Prompt> {
    const response = await this.client.get(`prompts/${id}`).json<{ prompt: Prompt }>();
    return response.prompt;
  }

  async listPrompts(filter?: PromptFilter): Promise<Prompt[]> {
    const searchParams = filter ? new URLSearchParams(filter as Record<string, string>) : undefined;
    const response = await this.client.get('prompts', { searchParams }).json<{ prompts: Prompt[]; total: number }>();
    return response.prompts;
  }

  async searchPrompts(query: string): Promise<Prompt[]> {
    const response = await this.client.get('prompts/search', { searchParams: { q: query } }).json<Prompt[]>();
    return response;
  }

  // Workspaces
  async createWorkspace(data: CreateWorkspace): Promise<Workspace> {
    const response = await this.client.post('workspaces', { json: data }).json<{ workspace: Workspace }>();
    return response.workspace;
  }

  async updateWorkspace(id: string, data: UpdateWorkspace): Promise<Workspace> {
    const response = await this.client.patch(`workspaces/${id}`, { json: data }).json<{ workspace: Workspace }>();
    return response.workspace;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.client.delete(`workspaces/${id}`);
  }

  async getWorkspace(id: string): Promise<Workspace> {
    const response = await this.client.get(`workspaces/${id}`).json<{ workspace: Workspace }>();
    return response.workspace;
  }

  async listWorkspaces(): Promise<Workspace[]> {
    const response = await this.client.get('workspaces').json<{ workspaces: Workspace[]; total: number }>();
    return response.workspaces;
  }

  // Tags
  async createTag(data: CreateTag): Promise<Tag> {
    const response = await this.client.post('tags', { json: data }).json<{ tag: Tag }>();
    return response.tag;
  }

  async updateTag(id: string, data: UpdateTag): Promise<Tag> {
    const response = await this.client.patch(`tags/${id}`, { json: data }).json<{ tag: Tag }>();
    return response.tag;
  }

  async deleteTag(id: string): Promise<void> {
    await this.client.delete(`tags/${id}`);
  }

  async getTag(id: string): Promise<Tag> {
    const response = await this.client.get(`tags/${id}`).json<{ tag: Tag }>();
    return response.tag;
  }

  async listTags(): Promise<Tag[]> {
    const response = await this.client.get('tags').json<{ tags: Tag[]; total: number }>();
    return response.tags;
  }
}