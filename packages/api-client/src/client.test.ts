import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';

import { PromPaletteClient } from './client';

// Create MSW server with default handlers
const server = setupServer();

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PromPaletteClient', () => {
  let client: PromPaletteClient;

  beforeAll(() => {
    client = new PromPaletteClient({
      baseUrl: 'http://localhost:3000/api',
      apiKey: 'test-api-key',
      timeout: 5000,
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
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
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
    }, 15000);

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
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
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