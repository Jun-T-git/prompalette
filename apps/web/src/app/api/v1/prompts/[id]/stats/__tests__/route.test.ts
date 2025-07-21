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
        single: vi.fn(() => ({
          data: { id: 'prompt-123', view_count: 1, copy_count: 1 },
          error: null,
        })),
      })),
    })),
  })),
};

describe('Prompt Statistics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createServiceSupabase as any).mockReturnValue(mockSupabase);
  });

  it('should increment view count', async () => {
    const request = new NextRequest('http://localhost/api/v1/prompts/123/stats', {
      method: 'POST',
      body: JSON.stringify({ type: 'view' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
  });

  it('should increment copy count', async () => {
    const request = new NextRequest('http://localhost/api/v1/prompts/123/stats', {
      method: 'POST',
      body: JSON.stringify({ type: 'copy' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
  });

  it('should handle invalid type', async () => {
    const request = new NextRequest('http://localhost/api/v1/prompts/123/stats', {
      method: 'POST',
      body: JSON.stringify({ type: 'invalid' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid type. Must be "view" or "copy"' });
  });

  it('should handle service unavailable', async () => {
    (createServiceSupabase as any).mockReturnValue(null);

    const request = new NextRequest('http://localhost/api/v1/prompts/123/stats', {
      method: 'POST',
      body: JSON.stringify({ type: 'view' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
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
            single: vi.fn(() => ({
              data: null,
              error: mockError,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: mockError,
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/v1/prompts/123/stats', {
      method: 'POST',
      body: JSON.stringify({ type: 'view' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });

  it('should handle missing request body', async () => {
    const request = new NextRequest('http://localhost/api/v1/prompts/123/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid type. Must be "view" or "copy"' });
  });
});