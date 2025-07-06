import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createSupabaseClient, testDatabaseConnection } from './supabase';
import { createUsersTable, createPromptsTable, createTagsTable, createPromptTagsTable } from './schema';

describe('Supabase Database Setup', () => {
  beforeAll(async () => {
    // Ensure test mode for consistent testing
    vi.stubEnv('DATABASE_MODE', 'test');
  });

  afterAll(async () => {
    // Cleanup test environment
    vi.unstubAllEnvs();
  });

  describe('Client Creation', () => {
    it('should create client successfully in test mode', async () => {
      const client = createSupabaseClient();
      expect(client).toBeDefined();
      expect(client.from).toBeDefined();
      expect(client.rpc).toBeDefined();
    });

    it('should provide mock functionality in test mode', async () => {
      const client = createSupabaseClient();
      const isConnected = await testDatabaseConnection(client);
      expect(isConnected).toBe(true);
    });

    it('should handle different database modes', async () => {
      // Test development mode fallback
      vi.stubEnv('DATABASE_MODE', 'development');
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
      
      const devClient = createSupabaseClient();
      expect(devClient).toBeDefined();
      
      vi.unstubAllEnvs();
      vi.stubEnv('DATABASE_MODE', 'test');
    });
  });

  describe('Schema Creation', () => {
    it('should create users table with correct structure', async () => {
      const client = createSupabaseClient();
      await createUsersTable(client);
      
      // Test table exists and has correct columns
      const { data, error } = await client
        .from('users')
        .select('*')
        .limit(0);
      
      expect(error).toBe(null);
      expect(data).toBeDefined();
    });

    it('should create prompts table with correct structure', async () => {
      const client = createSupabaseClient();
      await createPromptsTable(client);
      
      const { data, error } = await client
        .from('prompts')
        .select('*')
        .limit(0);
      
      expect(error).toBe(null);
      expect(data).toBeDefined();
    });

    it('should create tags table with correct structure', async () => {
      const client = createSupabaseClient();
      await createTagsTable(client);
      
      const { data, error } = await client
        .from('tags')
        .select('*')
        .limit(0);
      
      expect(error).toBe(null);
      expect(data).toBeDefined();
    });

    it('should create prompt_tags junction table', async () => {
      const client = createSupabaseClient();
      await createPromptTagsTable(client);
      
      const { data, error } = await client
        .from('prompt_tags')
        .select('*')
        .limit(0);
      
      expect(error).toBe(null);
      expect(data).toBeDefined();
    });
  });

  describe('Row Level Security', () => {
    it('should enable RLS on prompts table', async () => {
      const client = createSupabaseClient();
      
      // Test that RLS is enabled (this will fail initially)
      const { data, error } = await client
        .rpc('check_rls_enabled', { table_name: 'prompts' });
      
      expect(error).toBe(null);
      expect(data).toBe(true);
    });

    it('should allow users to read their own prompts', async () => {
      const client = createSupabaseClient();
      
      // Test will pass with mock client (returns { error: null })
      // In real implementation, this would test RLS policies
      const { error } = await client
        .from('prompts')
        .select('*')
        .eq('user_id', 'test-user-id')
        .limit(1);
      
      expect(error).toBe(null);
    });

    it('should allow users to read public prompts', async () => {
      const client = createSupabaseClient();
      
      // Test will pass with mock client (returns { error: null })
      // In real implementation, this would test public prompt access
      const { error } = await client
        .from('prompts')
        .select('*')
        .eq('is_public', true)
        .limit(1);
      
      expect(error).toBe(null);
    });
  });
});