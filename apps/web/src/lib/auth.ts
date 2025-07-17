import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import { getSupabaseServiceClient } from '@/lib/supabase';
import { logError } from '@/lib/logger';
import type { Database } from './database.types';

// Check if Supabase is properly configured
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'stub-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'stub-client-secret',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'stub-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'stub-client-secret',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // If Supabase is not configured, allow signin for development
      if (!isSupabaseConfigured) {
        // Development mode: Allow signin without Supabase configuration
        return true;
      }

      try {
        const supabase = getSupabaseServiceClient();

        // Check if user exists in Supabase
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          // Create new user using the database function
          const username = await generateUniqueUsername(user.name || user.email);
          
          const { error } = await supabase
            .from('users')
            .insert({
              email: user.email,
              name: user.name || null,
              avatar_url: user.image || null,
              username,
              is_public: true, // Default to public as per requirements
            });

          if (error) {
            logError('Error creating user', { error: error.message, email: user.email });
            return false;
          }
        }

        return true;
      } catch (error) {
        logError('Error in signIn callback', { 
          error: error instanceof Error ? error.message : String(error),
          email: user.email 
        });
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        // If Supabase is not configured, use stub data
        if (!isSupabaseConfigured) {
          token.userId = 'stub-user-id';
          token.username = 'stub-user';
          token.isPublic = true;
          return token;
        }

        try {
          const supabase = getSupabaseServiceClient();

          // Get user data from Supabase
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email!)
            .single();

          if (userData) {
            token.userId = userData.id;
            token.username = userData.username;
            token.isPublic = userData.is_public;
          }
        } catch (error) {
          logError('Error in jwt callback', { 
            error: error instanceof Error ? error.message : String(error),
            userEmail: user.email 
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string;
        session.user.isPublic = token.isPublic as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

// Generate unique username
async function generateUniqueUsername(name: string): Promise<string> {
  // If Supabase is not configured, return stub
  if (!isSupabaseConfigured) {
    return 'stub-user';
  }

  try {
    const supabase = getSupabaseServiceClient();

    // Use the database function to generate unique username
    const { data, error } = await supabase
      .rpc('generate_unique_username', { base_name: name });

    if (error) {
      logError('Error generating username via RPC', { 
        error: error.message,
        baseName: name 
      });
      // Fallback to simple logic
      const baseUsername = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      return baseUsername || 'user';
    }

    return data || 'user';
  } catch (error) {
    logError('Error generating username', { 
      error: error instanceof Error ? error.message : String(error),
      baseName: name 
    });
    return 'user';
  }
}