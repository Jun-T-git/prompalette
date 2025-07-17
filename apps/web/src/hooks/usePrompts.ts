import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createClientSupabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Prompt = Database['public']['Tables']['prompts']['Row'];
type PromptInsert = Database['public']['Tables']['prompts']['Insert'];
type PromptUpdate = Database['public']['Tables']['prompts']['Update'];

export const usePrompts = () => {
  const { data: session } = useSession();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientSupabase();

  // Fetch user's prompts
  const fetchPrompts = useCallback(async () => {
    if (!session?.user?.id || !supabase) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, supabase]);

  // Create new prompt
  const createPrompt = async (prompt: Omit<PromptInsert, 'user_id'>) => {
    if (!session?.user?.id || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert({
          ...prompt,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setPrompts(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
      return null;
    }
  };

  // Update prompt
  const updatePrompt = async (id: string, updates: PromptUpdate) => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setPrompts(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prompt');
      return null;
    }
  };

  // Delete prompt
  const deletePrompt = async (id: string) => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setPrompts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
      return false;
    }
  };

  // Search prompts
  const searchPrompts = async (query: string, options?: {
    tag?: string;
    username?: string;
    quickKey?: string;
    includePrivate?: boolean;
  }) => {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .rpc('search_prompts', {
          search_query: query,
          tag_filter: options?.tag || null,
          username_filter: options?.username || null,
          quick_key_filter: options?.quickKey || null,
          include_private: options?.includePrivate || false,
          user_id_param: session?.user?.id || null,
        });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search prompts');
      return [];
    }
  };

  // Get public prompts
  const getPublicPrompts = async (limit = 20) => {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          users:user_id (
            username,
            name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch public prompts');
      return [];
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    searchPrompts,
    getPublicPrompts,
    refetch: fetchPrompts,
  };
};