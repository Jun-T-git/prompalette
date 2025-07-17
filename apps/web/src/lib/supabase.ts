import { createClient, SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

// Check if Supabase is properly configured
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!isSupabaseConfigured) {
  console.warn('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role not configured');
  }
  
  if (!serviceInstance) {
    serviceInstance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
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