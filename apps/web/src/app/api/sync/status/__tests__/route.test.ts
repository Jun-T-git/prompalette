import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth-utils', () => ({
  getUserFromSession: vi.fn(),
}));

vi.mock('@/lib/services/service-factory', () => ({
  getSyncService: vi.fn(),
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
const mockGetSyncService = vi.mocked(await import('@/lib/services/service-factory')).getSyncService;

const mockSyncService = {
  getSyncStatus: vi.fn(),
  getSessionHistory: vi.fn(),
  createSession: vi.fn(),
  updateSession: vi.fn(),
};

describe('/api/sync/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSyncService.mockReturnValue(mockSyncService);
  });

  describe('GET', () => {
    it('should return sync status successfully', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      const mockSyncStatus = {
        last_sync_at: '2024-01-01T12:00:00Z',
        total_prompts: 42,
        pending_conflicts: 2,
        last_session_id: 'session-123',
        sync_enabled: true,
        desktop_connected: true
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockSyncService.getSyncStatus.mockResolvedValue(mockSyncStatus);

      const request = new NextRequest('http://localhost:3000/api/sync/status');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockSyncStatus);
      expect(mockSyncService.getSyncStatus).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return sync history when history parameter is provided', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      const mockSyncStatus = {
        last_sync_at: '2024-01-01T12:00:00Z',
        total_prompts: 42,
        pending_conflicts: 0,
        last_session_id: 'session-123',
        sync_enabled: true,
        desktop_connected: true
      };

      const mockHistory = [
        {
          session_id: 'session-123',
          started_at: '2024-01-01T12:00:00Z',
          completed_at: '2024-01-01T12:01:00Z',
          uploaded: 5,
          updated: 2,
          conflicts: 0,
          status: 'completed'
        },
        {
          session_id: 'session-122',
          started_at: '2024-01-01T11:00:00Z',
          completed_at: '2024-01-01T11:01:00Z',
          uploaded: 3,
          updated: 1,
          conflicts: 1,
          status: 'completed_with_conflicts'
        }
      ];

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockSyncService.getSyncStatus.mockResolvedValue(mockSyncStatus);
      mockSyncService.getSessionHistory.mockResolvedValue(mockHistory);

      const request = new NextRequest('http://localhost:3000/api/sync/status?history=true');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toEqual(mockSyncStatus);
      expect(data.data.history).toEqual(mockHistory);
      expect(mockSyncService.getSessionHistory).toHaveBeenCalledWith(mockUser.id, 10);
    });

    it('should support custom history limit', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      const mockSyncStatus = {
        last_sync_at: '2024-01-01T12:00:00Z',
        total_prompts: 42,
        pending_conflicts: 0,
        last_session_id: 'session-123',
        sync_enabled: true,
        desktop_connected: true
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockSyncService.getSyncStatus.mockResolvedValue(mockSyncStatus);
      mockSyncService.getSessionHistory.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/sync/status?history=true&limit=5');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSyncService.getSessionHistory).toHaveBeenCalledWith(mockUser.id, 5);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockGetUserFromSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/sync/status');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle invalid history limit', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/sync/status?history=true&limit=invalid');

      const response = await GET(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid limit parameter');
    });

    it('should handle sync service errors gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isPublic: false
      };

      mockGetUserFromSession.mockResolvedValue(mockUser);
      mockSyncService.getSyncStatus.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/sync/status');

      const response = await GET(request);

      expect((response as Response).status).toBe(500);
    });
  });
});