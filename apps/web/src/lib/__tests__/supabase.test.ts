import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    from: vi.fn(),
  })),
}));

describe('Supabase Singleton Pattern', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    
    // Clear module cache to reset singleton
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getSupabaseClient', () => {
    it('should return the same instance on multiple calls', async () => {
      const { getSupabaseClient } = await import('../supabase');
      
      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();
      
      expect(client1).toBe(client2);
      expect(createClient).toHaveBeenCalledTimes(1);
    });

    it('should throw error when Supabase is not configured', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      const { getSupabaseClient } = await import('../supabase');
      
      expect(() => getSupabaseClient()).toThrow('Supabase not configured');
    });

    it('should create client with correct configuration', async () => {
      const { getSupabaseClient } = await import('../supabase');
      
      getSupabaseClient();
      
      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        })
      );
    });
  });

  describe('getSupabaseServiceClient', () => {
    beforeEach(() => {
      // Server-side環境をモック（windowオブジェクトを削除）
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
    });

    it('should return the same instance on multiple calls', async () => {
      const { getSupabaseServiceClient, resetSupabaseInstances } = await import('../supabase');
      
      // Reset singleton instances to ensure clean state
      resetSupabaseInstances();
      
      // Clear only the service client test specific mocks
      vi.clearAllMocks();
      
      const client1 = getSupabaseServiceClient();
      const client2 = getSupabaseServiceClient();
      
      expect(client1).toBe(client2);
      // Service client creates its own instance
      // Since we cleared mocks, this should only be called once for the service client
      expect(createClient).toHaveBeenCalledTimes(1);
    });

    it('should throw error when service role key is not configured', async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      const { getSupabaseServiceClient } = await import('../supabase');
      
      expect(() => getSupabaseServiceClient()).toThrow('Supabase service role not configured');
    });

    it('should create service client with correct configuration', async () => {
      const { getSupabaseServiceClient } = await import('../supabase');
      
      getSupabaseServiceClient();
      
      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-key',
        expect.objectContaining({
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })
      );
    });

    it('should throw error when called from client side', async () => {
      // Client-side環境をモック
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      });
      
      const { getSupabaseServiceClient } = await import('../supabase');
      
      expect(() => getSupabaseServiceClient()).toThrow('Service role client should only be used on server side');
    });
  });

  describe('resetSupabaseInstances', () => {
    it('should reset singleton instances', async () => {
      const { getSupabaseClient, resetSupabaseInstances } = await import('../supabase');
      
      const client1 = getSupabaseClient();
      resetSupabaseInstances();
      const client2 = getSupabaseClient();
      
      expect(client1).not.toBe(client2);
      expect(createClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('backward compatibility', () => {
    it('should maintain backward compatibility with createClientSupabase', async () => {
      const { createClientSupabase, getSupabaseClient } = await import('../supabase');
      
      expect(createClientSupabase).toBe(getSupabaseClient);
    });

    it('should maintain backward compatibility with createServiceSupabase', async () => {
      const { createServiceSupabase, getSupabaseServiceClient } = await import('../supabase');
      
      expect(createServiceSupabase).toBe(getSupabaseServiceClient);
    });
  });
});