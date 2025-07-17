import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { createAppConfig, validateConfig, getEnvironmentInfo } from '../config';

describe('Config Management', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 環境変数をリセット
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createAppConfig', () => {
    it('should create local development config', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const config = createAppConfig();

      expect(config.environment).toBe('development');
      expect(config.isLocalDevelopment).toBe(true);
      expect(config.supabase.enabled).toBe(false);
    });

    it('should create production config with Supabase', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.NEXTAUTH_SECRET = 'test-secret';

      const config = createAppConfig();

      expect(config.environment).toBe('production');
      expect(config.isLocalDevelopment).toBe(false);
      expect(config.supabase.enabled).toBe(true);
      expect(config.supabase.url).toBe('https://test.supabase.co');
      expect(config.supabase.anonKey).toBe('test-anon-key');
      expect(config.supabase.serviceRoleKey).toBe('test-service-key');
      expect(config.auth.secret).toBe('test-secret');
    });

    it('should create development config with Supabase (not local)', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const config = createAppConfig();

      expect(config.environment).toBe('development');
      expect(config.isLocalDevelopment).toBe(false);
      expect(config.supabase.enabled).toBe(true);
    });

    it('should handle missing environment variables', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: undefined, writable: true });
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const config = createAppConfig();

      expect(config.environment).toBe('development');
      expect(config.isLocalDevelopment).toBe(true);
      expect(config.supabase.enabled).toBe(false);
      expect(config.supabase.url).toBeNull();
      expect(config.supabase.anonKey).toBeNull();
      expect(config.auth.secret).toBeNull();
    });
  });

  describe('validateConfig', () => {
    it('should validate local development config', () => {
      const config = {
        environment: 'development' as const,
        isLocalDevelopment: true,
        supabase: {
          url: null,
          anonKey: null,
          serviceRoleKey: null,
          enabled: false,
        },
        auth: {
          secret: null,
          providers: {
            github: {
              clientId: null,
              clientSecret: null,
            },
          },
        },
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate production config with Supabase', () => {
      const config = {
        environment: 'production' as const,
        isLocalDevelopment: false,
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
          serviceRoleKey: 'test-service-key',
          enabled: true,
        },
        auth: {
          secret: 'test-secret',
          providers: {
            github: {
              clientId: 'test-client-id',
              clientSecret: 'test-client-secret',
            },
          },
        },
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail validation for production without Supabase', () => {
      const config = {
        environment: 'production' as const,
        isLocalDevelopment: false,
        supabase: {
          url: null,
          anonKey: null,
          serviceRoleKey: null,
          enabled: false,
        },
        auth: {
          secret: 'test-secret',
          providers: {
            github: {
              clientId: null,
              clientSecret: null,
            },
          },
        },
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Supabase configuration is required in production');
    });

    it('should fail validation for production without auth secret', () => {
      const config = {
        environment: 'production' as const,
        isLocalDevelopment: false,
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
          serviceRoleKey: 'test-service-key',
          enabled: true,
        },
        auth: {
          secret: null,
          providers: {
            github: {
              clientId: null,
              clientSecret: null,
            },
          },
        },
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('NEXTAUTH_SECRET is required in production');
    });

    it('should fail validation for enabled Supabase without URL', () => {
      const config = {
        environment: 'development' as const,
        isLocalDevelopment: false,
        supabase: {
          url: null,
          anonKey: 'test-anon-key',
          serviceRoleKey: null,
          enabled: true,
        },
        auth: {
          secret: null,
          providers: {
            github: {
              clientId: null,
              clientSecret: null,
            },
          },
        },
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('NEXT_PUBLIC_SUPABASE_URL is required when using Supabase');
    });
  });

  describe('getEnvironmentInfo', () => {
    it('should return environment information', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      const info = getEnvironmentInfo();

      expect(info.environment).toBe('development');
      expect(info.isLocalDevelopment).toBe(true);
      expect(info.supabaseEnabled).toBe(false);
      expect(info.configValid).toBe(true);
      expect(info.errors).toEqual([]);
    });

    it('should return validation errors in environment info', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXTAUTH_SECRET;

      // configモジュールをリロードして新しい環境変数を反映
      vi.resetModules();
      const { getEnvironmentInfo: getEnvInfo } = await import('../config');
      const info = getEnvInfo();

      expect(info.environment).toBe('production');
      expect(info.isLocalDevelopment).toBe(false);
      expect(info.configValid).toBe(false);
      expect(info.errors.length).toBeGreaterThan(0);

      // 環境変数を元に戻す
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, writable: true });
    });
  });
});