/**
 * Environment Configuration for Supabase
 * Determines whether to use local or cloud Supabase based on environment
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

// Local Supabase default configuration
const LOCAL_SUPABASE_CONFIG: SupabaseConfig = {
  url: 'http://localhost:54321',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
} as const;

const getSupabaseConfig = (): SupabaseConfig => {
  // Explicitly check for local Supabase flag
  const useLocalSupabase = process.env.NEXT_PUBLIC_USE_LOCAL_SUPABASE === 'true';

  if (useLocalSupabase) {
    // Return local configuration - no fallback to env vars
    return LOCAL_SUPABASE_CONFIG;
  }

  // Cloud Supabase configuration requires all environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate required configuration
  if (!url || !anonKey || !serviceRoleKey) {
    const missing = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    
    throw new Error(
      `Missing required Supabase configuration: ${missing.join(', ')}. ` +
      `Either set NEXT_PUBLIC_USE_LOCAL_SUPABASE=true for local development ` +
      `or provide all required environment variables for cloud Supabase.`
    );
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
};

// Export configuration with validation (lazy evaluation for tests)
export const supabaseConfig = (() => {
  try {
    return getSupabaseConfig();
  } catch (error) {
    // テスト環境やCI環境では設定がない場合がある
    // CI環境を検出（GitHub Actions、Vercel、Netlify、その他のCI）
    const isCI = process.env.CI === 'true' || 
                 process.env.VERCEL === '1' ||
                 process.env.NETLIFY === 'true' ||
                 process.env.GITHUB_ACTIONS === 'true';
    
    if (process.env.NODE_ENV === 'test' || isCI) {
      return {
        url: 'http://localhost:54321',
        anonKey: 'test-anon-key',
        serviceRoleKey: 'test-service-role-key',
      };
    }
    throw error;
  }
})();

export const isLocalSupabase = (): boolean => {
  return supabaseConfig.url.includes('localhost');
};

// Development logging with clear indication of configuration source
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Configuration:', {
    mode: isLocalSupabase() ? 'LOCAL' : 'CLOUD',
    url: supabaseConfig.url,
    hasServiceRole: !!supabaseConfig.serviceRoleKey,
  });
}