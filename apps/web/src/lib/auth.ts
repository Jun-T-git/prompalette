import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

import { getSupabaseServiceClient } from '@/lib/supabase';
import { logError } from '@/lib/logger';
import { isLocalSupabase } from '@/lib/env-config';
import { isLocalDevelopment } from '@/lib/auth-stub';

// Check if OAuth providers are configured
const isGitHubConfigured = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// Check if we should use real OAuth or skip to stub mode
// Use stub auth in development when OAuth is not configured, regardless of Supabase setup
// Set NEXT_PUBLIC_USE_SUPABASE_AUTH=true to use Supabase auth instead of stubs
const useSupabaseAuth = process.env.NEXT_PUBLIC_USE_SUPABASE_AUTH === 'true';
const useStubAuth = (process.env.NODE_ENV === 'development') && !isGitHubConfigured && !isGoogleConfigured && !useSupabaseAuth;

// Debug logging for auth configuration
if (process.env.NODE_ENV === 'development') {
  console.log('🔐 Auth Configuration:', {
    isLocalDevelopment,
    isLocalSupabase: isLocalSupabase(),
    isGitHubConfigured,
    isGoogleConfigured,
    useSupabaseAuth,
    useStubAuth,
  });
}

// Configure providers based on available configuration
const providers = [];

if (isGitHubConfigured) {
  providers.push(GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }));
}

if (isGoogleConfigured) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }));
}

// Add Supabase credentials provider for local development
if (useSupabaseAuth && process.env.NODE_ENV === 'development') {
  providers.push(CredentialsProvider({
    name: 'Local Supabase',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        const supabase = getSupabaseServiceClient();
        
        // Try to sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          console.error('Supabase auth error:', error);
          return null;
        }

        // Get user data from our users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        return {
          id: userData?.id || data.user.id,
          email: data.user.email!,
          name: userData?.name || data.user.user_metadata?.name || null,
          image: userData?.avatar_url || null,
          username: userData?.username || 'user',
          isPublic: userData?.is_public || true,
        };
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    }
  }));
}

// If no providers are configured and we're in local development, we'll handle this in the signIn callback

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user }) {
      // In stub auth mode, always allow signin
      if (useStubAuth) {
        return true;
      }

      if (!user.email) return false;

      // If using local Supabase, allow signin
      if (isLocalSupabase()) {
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
        // If using stub auth, use stub data
        if (useStubAuth) {
          token.userId = '550e8400-e29b-41d4-a716-446655440000';
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
  // If using stub auth or local Supabase, return simple username
  if (useStubAuth || isLocalSupabase()) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) || 'user';
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