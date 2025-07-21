/**
 * Supabaseプロンプトレポジトリ
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

import type { Database } from '@/lib/database.types';
import type { Prompt, PromptRepository } from '@/lib/services/prompt-service';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';

export class SupabasePromptRepository implements PromptRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>): Promise<Prompt> {
    // Generate slug from title and quick_access_key
    const baseSlug = generateSlug(prompt.title, prompt.quick_access_key || undefined);
    
    // Get existing slugs for this user to ensure uniqueness
    const existingSlugs = await this.getUserSlugs(prompt.user_id);
    const slug = generateUniqueSlug(baseSlug, existingSlugs);
    
    // Let PostgreSQL generate UUID automatically, don't specify id, created_at, updated_at
    const newPrompt = {
      ...prompt,
      slug,
    };

    const { data, error } = await this.supabase
      .from('prompts')
      .insert(newPrompt)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create prompt: ${error.message}`);
    }

    return data;
  }

  async findById(id: string): Promise<Prompt | null> {
    const { data, error } = await this.supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find prompt: ${error.message}`);
    }

    return data;
  }

  async findByUserId(userId: string): Promise<Prompt[]> {
    const { data, error } = await this.supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find prompts by user: ${error.message}`);
    }

    return data || [];
  }

  async findPublic(): Promise<Prompt[]> {
    const { data, error } = await this.supabase
      .from('prompts')
      .select(`
        *,
        users (
          username,
          name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find public prompts: ${error.message}`);
    }

    return data || [];
  }

  async update(id: string, updates: Partial<Prompt>): Promise<Prompt | null> {
    const { data, error } = await this.supabase
      .from('prompts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to update prompt: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete prompt: ${error.message}`);
    }

    return true;
  }

  async search(query: string, userId?: string): Promise<Prompt[]> {
    let queryBuilder = this.supabase
      .from('prompts')
      .select(`
        *,
        users (
          username,
          name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    // 検索条件を追加
    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`
      );
    }

    // ユーザー固有の検索
    if (userId) {
      queryBuilder = queryBuilder.eq('user_id', userId);
    } else {
      // パブリックプロンプトのみ
      queryBuilder = queryBuilder.eq('is_public', true);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to search prompts: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all existing slugs for a user (for uniqueness check)
   */
  private async getUserSlugs(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('prompts')
      .select('slug')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user slugs: ${error.message}`);
    }

    return data?.map(item => item.slug) || [];
  }

  /**
   * Find user by username
   */
  async findUserByUsername(username: string): Promise<Database['public']['Tables']['users']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data;
  }

  /**
   * Find prompt by username and slug
   */
  async findByUsernameAndSlug(username: string, slug: string): Promise<Prompt | null> {
    // First, get the user ID from username
    const user = await this.findUserByUsername(username);
    if (!user) {
      return null;
    }

    const { data, error } = await this.supabase
      .from('prompts')
      .select(`
        *,
        users (
          username,
          name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Find prompts by username
   */
  async findByUsername(username: string, includePrivate: boolean = false): Promise<Prompt[]> {
    // First, get the user ID from username
    const user = await this.findUserByUsername(username);
    if (!user) {
      return [];
    }

    let queryBuilder = this.supabase
      .from('prompts')
      .select(`
        *,
        users (
          username,
          name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // If not including private, filter to public only
    if (!includePrivate) {
      queryBuilder = queryBuilder.eq('is_public', true);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to find prompts by username: ${error.message}`);
    }

    // Debug: Log the actual data structure
    if (data && data.length > 0) {
      console.log('🔍 Supabase prompt data structure:', JSON.stringify(data[0], null, 2));
    }

    return data || [];
  }
}