import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Type definitions for our database schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          slug: string;
          is_public: boolean;
          quick_access_key: string | null;
          view_count: number;
          like_count: number;
          // Desktop compatibility fields (essential only)
          pinned_position: number | null;
          pinned_at: string | null;
          // Core timestamps
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          slug: string;
          is_public?: boolean;
          quick_access_key?: string | null;
          view_count?: number;
          like_count?: number;
          pinned_position?: number | null;
          pinned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          slug?: string;
          is_public?: boolean;
          quick_access_key?: string | null;
          view_count?: number;
          like_count?: number;
          pinned_position?: number | null;
          pinned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      prompt_tags: {
        Row: {
          prompt_id: string;
          tag_id: string;
        };
        Insert: {
          prompt_id: string;
          tag_id: string;
        };
        Update: {
          prompt_id?: string;
          tag_id?: string;
        };
      };
    };
  };
}

export type SupabaseClientType = SupabaseClient<Database>;

/**
 * Valid database modes for the application
 */
type DatabaseMode = 'development' | 'production' | 'test';

/**
 * Configuration for database client creation
 */
interface DatabaseConfig {
  mode: DatabaseMode;
  supabaseUrl?: string;
  supabaseKey?: string;
}

/**
 * Validate and get database mode from environment
 */
function getValidatedDatabaseMode(): DatabaseMode {
  const mode = process.env.DATABASE_MODE;
  const validModes: DatabaseMode[] = ['development', 'production', 'test'];
  
  if (mode && validModes.includes(mode as DatabaseMode)) {
    return mode as DatabaseMode;
  }
  
  // Default to development for MVP phase
  return 'development';
}



/**
 * Get database configuration from environment
 */
function getDatabaseConfig(): DatabaseConfig {
  return {
    mode: getValidatedDatabaseMode(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

/**
 * Create a mock client for testing and development
 * This provides a safe development environment without requiring real database setup
 */
function createMockClient(): SupabaseClientType {
  console.warn(
    '🔶 Using mock Supabase client - configure real database for full functionality'
  );
  
  return {
    from: (_table: string) => ({
      select: (_columns?: string) => ({
        limit: (_count: number) => Promise.resolve({ data: [], error: null }),
        eq: (_column: string, _value: any) => ({
          limit: (_count: number) => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: (_values: any) => Promise.resolve({ data: null, error: null }),
      update: (_values: any) => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    rpc: (_fn: string, _params?: any) => Promise.resolve({ data: true, error: null }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  } as any;
}

/**
 * Create a Supabase client instance with proper configuration handling
 */
export function createSupabaseClient(): SupabaseClientType {
  const config = getDatabaseConfig();
  
  // In test mode, always use mock client
  if (config.mode === 'test') {
    return createMockClient();
  }
  
  // In development mode, allow mock fallback for easier setup
  if (config.mode === 'development' && (!config.supabaseUrl || !config.supabaseKey)) {
    console.warn(
      '⚠️ Supabase configuration missing. Using mock client for development.\n' +
      'To use real database:\n' +
      '1. Create a Supabase project at https://supabase.com\n' +
      '2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
    );
    return createMockClient();
  }
  
  // In production mode, fail fast if configuration is missing
  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error(
      'Database configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return createClient<Database>(config.supabaseUrl, config.supabaseKey);
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(client: SupabaseClientType): Promise<boolean> {
  try {
    // Simple test query
    const { error } = await client.from('users').select('id').limit(1);
    return error === null;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Get admin client with service role key (for schema operations)
 * WARNING: This client bypasses Row Level Security (RLS)
 * Use only for administrative operations and schema migrations
 */
export function createSupabaseAdminClient(): SupabaseClientType {
  const config = getDatabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // In test mode, return mock client
  if (config.mode === 'test') {
    return createMockClient();
  }

  // Check for required configuration
  if (!config.supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required for admin client');
  }
  
  if (!serviceRoleKey) {
    if (config.mode === 'development') {
      console.warn(
        '⚠️ Service role key missing. Using regular client for development.\n' +
        'For admin operations, add SUPABASE_SERVICE_ROLE_KEY to .env.local'
      );
      return createSupabaseClient();
    }
    
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations'
    );
  }

  return createClient<Database>(config.supabaseUrl, serviceRoleKey);
}