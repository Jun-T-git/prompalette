/**
 * Supabaseプロンプトレポジトリ
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

import type { Database } from '@/lib/database.types';
import type { Prompt, PromptRepository } from '@/lib/services/prompt-service';

export class SupabasePromptRepository implements PromptRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>): Promise<Prompt> {
    const now = new Date().toISOString();
    const id = `prompt-${nanoid()}`;
    
    const newPrompt = {
      id,
      ...prompt,
      created_at: now,
      updated_at: now,
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
      .select('*')
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
      .select('*')
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
}