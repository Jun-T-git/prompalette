import { SupabaseClientType } from './supabase';

/**
 * Create users table
 * Note: In MVP phase, this uses RPC functions that need to be created in Supabase
 * For development with mock client, this will always succeed
 */
export async function createUsersTable(client: SupabaseClientType): Promise<void> {
  try {
    const { error } = await client.rpc('create_users_table');
    if (error) {
      console.error('Error creating users table:', error);
      throw new Error(`Failed to create users table: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error creating users table: ${String(error)}`);
  }
}

/**
 * Create prompts table
 */
export async function createPromptsTable(client: SupabaseClientType): Promise<void> {
  const { error } = await client.rpc('create_prompts_table');
  if (error) {
    console.error('Error creating prompts table:', error);
    throw error;
  }
}

/**
 * Create tags table
 */
export async function createTagsTable(client: SupabaseClientType): Promise<void> {
  const { error } = await client.rpc('create_tags_table');
  if (error) {
    console.error('Error creating tags table:', error);
    throw error;
  }
}

/**
 * Create prompt_tags junction table
 */
export async function createPromptTagsTable(client: SupabaseClientType): Promise<void> {
  const { error } = await client.rpc('create_prompt_tags_table');
  if (error) {
    console.error('Error creating prompt_tags table:', error);
    throw error;
  }
}

/**
 * Setup Row Level Security policies
 */
export async function setupRLSPolicies(client: SupabaseClientType): Promise<void> {
  const { error } = await client.rpc('setup_rls_policies');
  if (error) {
    console.error('Error setting up RLS policies:', error);
    throw error;
  }
}

/**
 * Run all database migrations
 */
export async function runMigrations(client: SupabaseClientType): Promise<void> {
  try {
    await createUsersTable(client);
    await createPromptsTable(client);
    await createTagsTable(client);
    await createPromptTagsTable(client);
    await setupRLSPolicies(client);
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Database migrations failed:', error);
    throw error;
  }
}