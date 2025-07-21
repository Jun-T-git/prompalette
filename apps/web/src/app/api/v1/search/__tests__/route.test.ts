import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../route';
import { createServiceSupabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createServiceSupabase: vi.fn(),
}));

const mockSupabase = {
  from: vi.fn((table: string) => {
    if (table === 'users') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'user-123' },
              error: null,
            })),
          })),
        })),
      };
    }
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
          ilike: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
          contains: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
          order: vi.fn(() => ({
            range: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    };
  }),
};

describe('Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createServiceSupabase as any).mockReturnValue(mockSupabase);
  });

  it('should perform general search', async () => {
    const request = new NextRequest('http://localhost/api/v1/search?q=test');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('pagination');
  });

  it.skip('should perform username search with @ prefix', async () => {
    const request = new NextRequest('http://localhost/api/v1/search?q=@testuser');
    const response = await GET(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
  });

  it('should perform tag search with # prefix', async () => {
    const request = new NextRequest('http://localhost/api/v1/search?q=%23programming');
    const response = await GET(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
  });

  it('should perform quick access key search with / prefix', async () => {
    const request = new NextRequest('http://localhost/api/v1/search?q=/quickkey');
    const response = await GET(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
  });

  it('should handle pagination parameters', async () => {
    const request = new NextRequest('http://localhost/api/v1/search?q=test&page=2&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(10);
  });

  it('should handle service unavailable when Supabase is not configured', async () => {
    (createServiceSupabase as any).mockReturnValue(null);

    const request = new NextRequest('http://localhost/api/v1/search?q=test');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({ error: 'Service unavailable' });
  });

  it('should handle database errors', async () => {
    const mockError = new Error('Database error');
    (createServiceSupabase as any).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => ({
                range: vi.fn(() => ({
                  data: null,
                  error: mockError,
                })),
              })),
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/v1/search?q=test');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });

  it('should return empty results for empty query', async () => {
    const request = new NextRequest('http://localhost/api/v1/search?q=');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });

  it('should handle special characters in search query', async () => {
    const request = new NextRequest('http://localhost/api/v1/search?q=test%20with%20spaces');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
  });

  it('should include user information in search results', async () => {
    const mockPrompts = [
      {
        id: '1',
        title: 'Test Prompt',
        content: 'Test content',
        tags: ['test'],
        users: { username: 'testuser' },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ];

    (createServiceSupabase as any).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => ({
                range: vi.fn(() => ({
                  data: mockPrompts,
                  error: null,
                })),
              })),
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/v1/search?q=test');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockPrompts);
  });
});