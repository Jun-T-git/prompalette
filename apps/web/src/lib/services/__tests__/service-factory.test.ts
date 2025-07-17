import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ServiceFactory } from '../service-factory';
import type { AppConfig } from '@/lib/config';

// Supabase モック
vi.mock('@/lib/supabase', () => ({
  getSupabaseServiceClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

describe('ServiceFactory', () => {
  let factory: ServiceFactory;

  beforeEach(() => {
    // シングルトンをリセット
    (ServiceFactory as any).instance = null;
  });

  describe('Local Development Environment', () => {
    it('should create services with stub repository for local development', () => {
      const config: AppConfig = {
        environment: 'development',
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

      factory = ServiceFactory.getInstance(config);
      const services = factory.getServices();

      expect(services.promptService).toBeDefined();
      // スタブレポジトリが使用されていることを確認
      expect(services.promptService).toHaveProperty('repository');
    });
  });

  describe('Production Environment', () => {
    it('should create services with Supabase repository for production', () => {
      const config: AppConfig = {
        environment: 'production',
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

      factory = ServiceFactory.getInstance(config);
      const services = factory.getServices();

      expect(services.promptService).toBeDefined();
    });

    it('should throw error when Supabase is not configured in production', () => {
      const config: AppConfig = {
        environment: 'production',
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
              clientId: 'test-client-id',
              clientSecret: 'test-client-secret',
            },
          },
        },
      };

      factory = ServiceFactory.getInstance(config);

      expect(() => factory.getServices()).toThrow('Supabase configuration is required for production');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance for multiple calls', () => {
      const config: AppConfig = {
        environment: 'development',
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

      const factory1 = ServiceFactory.getInstance(config);
      const factory2 = ServiceFactory.getInstance(config);

      expect(factory1).toBe(factory2);
    });

    it('should return same service container for multiple calls', () => {
      const config: AppConfig = {
        environment: 'development',
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

      factory = ServiceFactory.getInstance(config);
      const services1 = factory.getServices();
      const services2 = factory.getServices();

      expect(services1).toBe(services2);
    });
  });

  describe('Service Container', () => {
    it('should provide all required services', () => {
      const config: AppConfig = {
        environment: 'development',
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

      factory = ServiceFactory.getInstance(config);
      const services = factory.getServices();

      expect(services).toHaveProperty('promptService');
      expect(services.promptService).toBeDefined();
      expect(typeof services.promptService.create).toBe('function');
      expect(typeof services.promptService.getById).toBe('function');
      expect(typeof services.promptService.getByUserId).toBe('function');
      expect(typeof services.promptService.update).toBe('function');
      expect(typeof services.promptService.delete).toBe('function');
      expect(typeof services.promptService.search).toBe('function');
    });
  });
});