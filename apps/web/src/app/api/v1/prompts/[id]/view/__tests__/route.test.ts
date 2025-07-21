import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../route';
import { createServiceSupabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createServiceSupabase: vi.fn(),
}));

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { view_count: 0, copy_count: 0 },
          error: null,
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test Prompt', view_count: 1, copy_count: 0 },
            error: null,
          })),
        })),
      })),
    })),
  })),
};

describe('POST /api/v1/prompts/:id/view', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createServiceSupabase as any).mockReturnValue(mockSupabase);
  });

  it('should increment view count for public prompt', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test Prompt', visibility: 'public', is_public: true, view_count: 0, copy_count: 0 },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test Prompt', view_count: 1, copy_count: 0 },
              error: null,
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000/view', {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.viewCount).toBe(1);
    expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
  });

  it('should not increment view count for private prompt', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test Prompt', visibility: 'private', is_public: false, view_count: 0, copy_count: 0 },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000/view', {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Cannot track views for private prompts');
  });

  it('should return 404 for non-existent prompt', async () => {
    (mockSupabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: { message: 'Not found' },
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/v1/prompts/550e8400-e29b-41d4-a716-446655440001/view', {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440001' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Prompt not found');
  });

  it('should return 400 for invalid prompt ID', async () => {
    const request = new NextRequest('http://localhost/api/v1/prompts/invalid-id/view', {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'invalid-id' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid prompt ID');
  });

  it('should handle service unavailable', async () => {
    (createServiceSupabase as any).mockReturnValue(null);

    const request = new NextRequest('http://localhost/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000/view', {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) });
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Service unavailable');
  });

  it('should handle database errors during update', async () => {
    const mockError = new Error('Database error');
    (mockSupabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test Prompt', visibility: 'public', is_public: true, view_count: 0, copy_count: 0 },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: mockError,
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/v1/prompts/550e8400-e29b-41d4-a716-446655440000/view', {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
  });
});