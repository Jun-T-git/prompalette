import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
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

describe('/api/sync/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPromptService.mockReturnValue(mockPromptService);
  });

  describe('POST', () => {
    it('should upload new prompts from desktop successfully', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };
      
      const mockSyncData = {
        prompts: [
          {
            desktop_id: 'desktop-1',
            title: 'Test Prompt',
            content: 'Test content',
            tags: ['test'],
            is_public: false,
            quick_access_key: null,
            version: 1,
            last_modified: '2024-01-01T00:00:00Z'
          }
        ],
        sync_session_id: 'session-123'
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockPromptService.syncFromDesktop.mockResolvedValue({
        uploaded: 1,
        updated: 0,
        conflicts: [],
        session_id: 'session-123'
      });

      const request = new NextRequest('http://localhost:3000/api/sync/upload', {
        method: 'POST',
        body: JSON.stringify(mockSyncData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.uploaded).toBe(1);
      expect(data.data.updated).toBe(0);
      expect(data.data.conflicts).toEqual([]);
      expect(mockPromptService.syncFromDesktop).toHaveBeenCalledWith(
        mockUser.id,
        mockSyncData.prompts,
        mockSyncData.sync_session_id
      );
    });

    it('should handle conflicts during sync', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };
      
      const mockSyncData = {
        prompts: [
          {
            desktop_id: 'desktop-1',
            title: 'Test Prompt',
            content: 'Test content',
            tags: ['test'],
            is_public: false,
            quick_access_key: null,
            version: 1,
            last_modified: '2024-01-01T00:00:00Z'
          }
        ],
        sync_session_id: 'session-123'
      };

      const mockConflicts = [
        {
          desktop_id: 'desktop-1',
          web_version: 2,
          desktop_version: 1,
          conflict_type: 'version_mismatch'
        }
      ];

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockPromptService.syncFromDesktop.mockResolvedValue({
        uploaded: 0,
        updated: 0,
        conflicts: mockConflicts,
        session_id: 'session-123'
      });

      const request = new NextRequest('http://localhost:3000/api/sync/upload', {
        method: 'POST',
        body: JSON.stringify(mockSyncData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.conflicts).toEqual(mockConflicts);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockGetUserFromSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/sync/upload', {
        method: 'POST',
        body: JSON.stringify({ prompts: [] }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate request body format', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/sync/upload', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid request body');
    });

    it('should handle empty prompts array', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };
      
      const mockSyncData = {
        prompts: [],
        sync_session_id: 'session-123'
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockPromptService.syncFromDesktop.mockResolvedValue({
        uploaded: 0,
        updated: 0,
        conflicts: [],
        session_id: 'session-123'
      });

      const request = new NextRequest('http://localhost:3000/api/sync/upload', {
        method: 'POST',
        body: JSON.stringify(mockSyncData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.uploaded).toBe(0);
    });

    it('should handle large batch uploads', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };
      
      const mockPrompts = Array.from({ length: 100 }, (_, i) => ({
        desktop_id: `desktop-${i}`,
        title: `Test Prompt ${i}`,
        content: `Test content ${i}`,
        tags: ['test'],
        is_public: false,
        quick_access_key: null,
        version: 1,
        last_modified: '2024-01-01T00:00:00Z'
      }));

      const mockSyncData = {
        prompts: mockPrompts,
        sync_session_id: 'session-123'
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockPromptService.syncFromDesktop.mockResolvedValue({
        uploaded: 100,
        updated: 0,
        conflicts: [],
        session_id: 'session-123'
      });

      const request = new NextRequest('http://localhost:3000/api/sync/upload', {
        method: 'POST',
        body: JSON.stringify(mockSyncData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.uploaded).toBe(100);
    });
  });
});