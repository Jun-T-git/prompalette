import { createClient, SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';
import { supabaseConfig } from './env-config';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseConfig.url && supabaseConfig.anonKey;

if (!isSupabaseConfigured) {
  console.warn('Supabase not configured. Please check environment configuration.');
}

// Singleton instances
let clientInstance: SupabaseClient<Database> | null = null;
let serviceInstance: SupabaseClient<Database> | null = null;

// Client-side Supabase client (Singleton)
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }
  
  if (!clientInstance) {
    clientInstance = createClient<Database>(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }
    );
  }
  
  return clientInstance;
};

// Service role client (Singleton) - SERVER SIDE ONLY
export const getSupabaseServiceClient = (): SupabaseClient<Database> => {
  // 🔒 セキュリティ: クライアントサイドでの使用を防ぐ
  if (typeof window !== 'undefined') {
    throw new Error('Service role client should only be used on server side');
  }
  
  if (!serviceInstance) {
    serviceInstance = createClient<Database>(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  
  return serviceInstance;
};

// Legacy functions for backward compatibility
export const createClientSupabase = getSupabaseClient;
export const createServiceSupabase = getSupabaseServiceClient;

// Browser client instance (for use in client components)
export const supabase = isSupabaseConfigured ? getSupabaseClient() : null;

// Reset function for testing
export const resetSupabaseInstances = () => {
  clientInstance = null;
  serviceInstance = null;
};