import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth-utils', () => ({
  getUserFromSession: vi.fn(),
}));

vi.mock('@/lib/services/service-factory', () => ({
  getPromptService: vi.fn(),
}));

vi.mock('@/lib/error-handling', () => ({
  handleRouteError: vi.fn(() => {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }),
}));

const mockGetUserFromSession = vi.mocked(await import('@/lib/auth-utils')).getUserFromSession;
const mockGetPromptService = vi.mocked(await import('@/lib/services/service-factory')).getPromptService;

const mockPromptService = {
  create: vi.fn(),
  getById: vi.fn(),
  getByUserId: vi.fn(),
  getPublic: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  search: vi.fn(),
  getByUsernameAndSlug: vi.fn(),
  getByUsername: vi.fn(),
  syncFromDesktop: vi.fn(),
  getAllForSync: vi.fn(),
  getUpdatedSince: vi.fn(),
  advancedSearch: vi.fn(),
};

describe('/api/sync/download', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPromptService.mockReturnValue(mockPromptService);
  });

  describe('GET', () => {
    it('should download all prompts when no lastSync parameter', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      const mockPrompts = [
        {
          id: 'prompt-1',
          title: 'Test Prompt 1',
          content: 'Test content 1',
          tags: ['test'],
          is_public: false,
          quick_access_key: null,
          version: 1,
          desktop_id: 'desktop-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'prompt-2',
          title: 'Test Prompt 2',
          content: 'Test content 2',
          tags: ['test', 'example'],
          is_public: true,
          quick_access_key: 'key2',
          version: 2,
          desktop_id: 'desktop-2',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ];

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockPromptService.getAllForSync.mockResolvedValue(mockPrompts);

      const request = new NextRequest('http://localhost:3000/api/sync/download');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.prompts).toEqual(mockPrompts);
      expect(data.data.total).toBe(2);
      expect(mockPromptService.getAllForSync).toHaveBeenCalledWith(mockUser.id, { offset: 0, limit: 1000 });
    });

    it('should download only updated prompts when lastSync provided', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      const lastSync = '2024-01-01T12:00:00Z';
      const mockPrompts = [
        {
          id: 'prompt-2',
          title: 'Updated Prompt',
          content: 'Updated content',
          tags: ['updated'],
          is_public: true,
          quick_access_key: null,
          version: 3,
          desktop_id: 'desktop-2',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T15:00:00Z'
        }
      ];

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockPromptService.getUpdatedSince.mockResolvedValue(mockPrompts);

      const request = new NextRequest(`http://localhost:3000/api/sync/download?lastSync=${encodeURIComponent(lastSync)}`);

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.prompts).toEqual(mockPrompts);
      expect(data.data.total).toBe(1);
      expect(data.data.lastSync).toBe(lastSync);
      expect(mockPromptService.getUpdatedSince).toHaveBeenCalledWith(mockUser.id, lastSync, { offset: 0, limit: 1000 });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockGetUserFromSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/sync/download');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle invalid lastSync format', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/sync/download?lastSync=invalid-date');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid lastSync format');
    });

    it('should return empty array when no prompts exist', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockPromptService.getAllForSync.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/sync/download');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.prompts).toEqual([]);
      expect(data.data.total).toBe(0);
    });

    it('should support pagination with offset and limit', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      const mockPrompts = [
        {
          id: 'prompt-3',
          title: 'Test Prompt 3',
          content: 'Test content 3',
          tags: [],
          is_public: false,
          quick_access_key: null,
          version: 1,
          desktop_id: 'desktop-3',
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z'
        }
      ];

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockPromptService.getAllForSync.mockResolvedValue(mockPrompts);

      const request = new NextRequest('http://localhost:3000/api/sync/download?offset=10&limit=50');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.offset).toBe(10);
      expect(data.data.limit).toBe(50);
      expect(mockPromptService.getAllForSync).toHaveBeenCalledWith(mockUser.id, { offset: 10, limit: 50 });
    });
  });
});