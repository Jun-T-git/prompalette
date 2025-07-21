import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
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

describe('/api/v1/search/advanced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPromptService.mockReturnValue(mockPromptService);
  });

  describe('POST', () => {
    it('should perform advanced search successfully', async () => {
      const mockResults = [
        {
          id: 'prompt-1',
          title: 'Advanced Prompt 1',
          content: 'Advanced content 1',
          tags: ['advanced', 'search'],
          is_public: true,
          view_count: 100,
          copy_count: 50,
          user: {
            username: 'user1',
            name: 'User One',
            avatar_url: null
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      const searchCriteria = {
        query: 'advanced prompt',
        tags: ['advanced'],
        author: 'user1',
        dateRange: {
          from: '2024-01-01',
          to: '2024-12-31'
        },
        isPublic: true,
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: 20,
        offset: 0
      };

      mockPromptService.advancedSearch.mockResolvedValue({
        results: mockResults,
        total: 1,
        hasMore: false
      });

      const request = new NextRequest('http://localhost:3000/api/v1/search/advanced', {
        method: 'POST',
        body: JSON.stringify(searchCriteria),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toEqual(mockResults);
      expect(data.data.total).toBe(1);
      expect(data.data.hasMore).toBe(false);
      expect(mockPromptService.advancedSearch).toHaveBeenCalledWith(searchCriteria);
    });

    it('should handle search with minimal criteria', async () => {
      const mockResults: any[] = [];
      
      const searchCriteria = {
        query: 'test'
      };

      mockPromptService.advancedSearch.mockResolvedValue({
        results: mockResults,
        total: 0,
        hasMore: false
      });

      const request = new NextRequest('http://localhost:3000/api/v1/search/advanced', {
        method: 'POST',
        body: JSON.stringify(searchCriteria),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toEqual(mockResults);
      expect(data.data.total).toBe(0);
    });

    it('should validate request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/search/advanced', {
        method: 'POST',
        body: JSON.stringify({}), // Empty body
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid search criteria');
    });

    it('should validate search parameters', async () => {
      const invalidCriteria = {
        query: 'test',
        limit: 101, // Invalid limit
        sortBy: 'invalid', // Invalid sort field
        sortOrder: 'invalid' // Invalid sort order
      };

      const request = new NextRequest('http://localhost:3000/api/v1/search/advanced', {
        method: 'POST',
        body: JSON.stringify(invalidCriteria),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid search criteria');
    });

    it('should handle date range validation', async () => {
      const invalidCriteria = {
        query: 'test',
        dateRange: {
          from: '2024-12-31',
          to: '2024-01-01' // Invalid range (from > to)
        }
      };

      const request = new NextRequest('http://localhost:3000/api/v1/search/advanced', {
        method: 'POST',
        body: JSON.stringify(invalidCriteria),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid search criteria');
    });

    it('should handle tag filtering', async () => {
      const mockResults = [
        {
          id: 'prompt-1',
          title: 'Tagged Prompt',
          content: 'Content with tags',
          tags: ['javascript', 'react'],
          is_public: true,
          view_count: 50,
          copy_count: 25,
          user: {
            username: 'developer',
            name: 'Developer',
            avatar_url: null
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      const searchCriteria = {
        query: 'react',
        tags: ['javascript', 'react']
      };

      const expectedCriteria = {
        query: 'react',
        tags: ['javascript', 'react'],
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: 20,
        offset: 0
      };

      mockPromptService.advancedSearch.mockResolvedValue({
        results: mockResults,
        total: 1,
        hasMore: false
      });

      const request = new NextRequest('http://localhost:3000/api/v1/search/advanced', {
        method: 'POST',
        body: JSON.stringify(searchCriteria),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toEqual(mockResults);
      expect(mockPromptService.advancedSearch).toHaveBeenCalledWith(expectedCriteria);
    });

    it('should handle service errors gracefully', async () => {
      const searchCriteria = {
        query: 'test'
      };

      mockPromptService.advancedSearch.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/v1/search/advanced', {
        method: 'POST',
        body: JSON.stringify(searchCriteria),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect((response as Response).status).toBe(500);
    });

    it('should support pagination', async () => {
      const mockResults = Array.from({ length: 10 }, (_, i) => ({
        id: `prompt-${i}`,
        title: `Prompt ${i}`,
        content: `Content ${i}`,
        tags: ['test'],
        is_public: true,
        view_count: i * 10,
        copy_count: i * 5,
        user: {
          username: `user${i}`,
          name: `User ${i}`,
          avatar_url: null
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }));

      const searchCriteria = {
        query: 'test',
        limit: 10,
        offset: 20
      };

      mockPromptService.advancedSearch.mockResolvedValue({
        results: mockResults,
        total: 100,
        hasMore: true
      });

      const request = new NextRequest('http://localhost:3000/api/v1/search/advanced', {
        method: 'POST',
        body: JSON.stringify(searchCriteria),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await (response as Response).json();

      expect((response as Response).status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(10);
      expect(data.data.total).toBe(100);
      expect(data.data.hasMore).toBe(true);
    });
  });
});