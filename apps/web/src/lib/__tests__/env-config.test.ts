import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('env-config', () => {
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh imports
    vi.resetModules();
    // Clear env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('Local Supabase Configuration', () => {
    it('should use local config when NEXT_PUBLIC_USE_LOCAL_SUPABASE is true', async () => {
      process.env.NEXT_PUBLIC_USE_LOCAL_SUPABASE = 'true';
      
      const { supabaseConfig } = await import('../env-config');
      
      expect(supabaseConfig.url).toBe('http://localhost:54321');
      expect(supabaseConfig.anonKey).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
      expect(supabaseConfig.serviceRoleKey).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
    });

    it('should ignore cloud env vars when using local mode', async () => {
      process.env.NEXT_PUBLIC_USE_LOCAL_SUPABASE = 'true';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://cloud.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'cloud-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'cloud-service-key';
      
      const { supabaseConfig } = await import('../env-config');
      
      // Should still use local config, not cloud env vars
      expect(supabaseConfig.url).toBe('http://localhost:54321');
      expect(supabaseConfig.anonKey).not.toBe('cloud-anon-key');
      expect(supabaseConfig.serviceRoleKey).not.toBe('cloud-service-key');
    });
  });

  describe('Cloud Supabase Configuration', () => {
    it('should use cloud config when all env vars are provided', async () => {
      process.env.NEXT_PUBLIC_USE_LOCAL_SUPABASE = 'false';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      
      const { supabaseConfig } = await import('../env-config');
      
      expect(supabaseConfig.url).toBe('https://test.supabase.co');
      expect(supabaseConfig.anonKey).toBe('test-anon-key');
      expect(supabaseConfig.serviceRoleKey).toBe('test-service-key');
    });

    it('should throw error when cloud config is missing required vars', async () => {
      process.env.NEXT_PUBLIC_USE_LOCAL_SUPABASE = 'false';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      // Missing ANON_KEY and SERVICE_ROLE_KEY
      
      await expect(import('../env-config')).rejects.toThrow(
        /Missing required Supabase configuration: NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY/
      );
    });

    it('should use cloud config when NEXT_PUBLIC_USE_LOCAL_SUPABASE is not set', async () => {
      // Don't set NEXT_PUBLIC_USE_LOCAL_SUPABASE
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      
      const { supabaseConfig } = await import('../env-config');
      
      expect(supabaseConfig.url).toBe('https://test.supabase.co');
    });
  });

  describe('isLocalSupabase helper', () => {
    it('should correctly identify local Supabase', async () => {
      process.env.NEXT_PUBLIC_USE_LOCAL_SUPABASE = 'true';
      
      const { isLocalSupabase } = await import('../env-config');
      
      expect(isLocalSupabase()).toBe(true);
    });

    it('should correctly identify cloud Supabase', async () => {
      process.env.NEXT_PUBLIC_USE_LOCAL_SUPABASE = 'false';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      
      const { isLocalSupabase } = await import('../env-config');
      
      expect(isLocalSupabase()).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle NEXT_PUBLIC_USE_LOCAL_SUPABASE with different values', async () => {
      // Test with various truthy/falsy values
      const testCases = [
        { value: 'TRUE', shouldBeLocal: false },  // Case sensitive
        { value: 'True', shouldBeLocal: false },
        { value: '1', shouldBeLocal: false },
        { value: 'yes', shouldBeLocal: false },
        { value: '', shouldBeLocal: false },
        { value: undefined, shouldBeLocal: false },
      ];

      for (const { value, shouldBeLocal } of testCases) {
        vi.resetModules();
        process.env = { ...originalEnv };
        
        if (value !== undefined) {
          process.env.NEXT_PUBLIC_USE_LOCAL_SUPABASE = value;
        }
        
        if (!shouldBeLocal) {
          // Provide cloud config to avoid errors
          process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
          process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
        }
        
        const { isLocalSupabase } = await import('../env-config');
        expect(isLocalSupabase()).toBe(shouldBeLocal);
      }
    });
  });
});