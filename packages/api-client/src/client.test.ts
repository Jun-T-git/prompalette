import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeEach } from 'vitest';

import { PromPaletteClient } from './client';
import { server } from './test/setup';

describe('PromPaletteClient', () => {
  let client: PromPaletteClient;

  beforeEach(() => {
    client = new PromPaletteClient({
      baseUrl: 'http://localhost:3000/api',
      apiKey: 'test-api-key',
    });
  });

  describe('prompts', () => {
    it('should create a prompt', async () => {
      const mockPrompt = {
        id: 'prm_123',
        title: 'Test Prompt',
        content: 'Test content',
        workspaceId: 'wsp_123',
        tagIds: [],
        visibility: 'private' as const,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
      };

      server.use(
        http.post('http://localhost:3000/api/prompts', () => {
          return HttpResponse.json({ prompt: mockPrompt }, { status: 201 });
        })
      );

      const result = await client.createPrompt({
        title: 'Test Prompt',
        content: 'Test content',
        workspaceId: 'wsp_123',
        tagIds: [],
        visibility: 'private',
        status: 'active',
      });

      expect(result).toMatchObject({
        id: 'prm_123',
        title: 'Test Prompt',
        content: 'Test content',
      });
    });

    it('should list prompts', async () => {
      const mockPrompts = [
        {
          id: 'prm_123',
          title: 'Prompt 1',
          content: 'Content 1',
          workspaceId: 'wsp_123',
          tagIds: [],
          visibility: 'private',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
        },
      ];

      server.use(
        http.get('http://localhost:3000/api/prompts', () => {
          return HttpResponse.json({ prompts: mockPrompts, total: mockPrompts.length });
        })
      );

      const result = await client.listPrompts();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'prm_123',
        title: 'Prompt 1',
      });
    });

    it('should handle errors', async () => {
      server.use(
        http.get('http://localhost:3000/api/prompts/:id', () => {
          return HttpResponse.json(
            { error: 'Prompt not found' },
            { status: 404 }
          );
        })
      );

      await expect(client.getPrompt('invalid_id')).rejects.toThrow('Prompt not found');
    });
  });
});