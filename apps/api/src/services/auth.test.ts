import { describe, it, expect } from 'vitest';

import { authService, generateApiKey, hashApiKey, generateUserId } from './auth.js';

describe('Authentication Service', () => {

  describe('API Key Generation', () => {
    it('should generate valid API keys', () => {
      const { key, hash } = generateApiKey();
      
      expect(key).toMatch(/^prm_[a-f0-9]{64}$/);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(key).not.toBe(hash);
    });

    it('should generate unique keys', () => {
      const { key: key1 } = generateApiKey();
      const { key: key2 } = generateApiKey();
      
      expect(key1).not.toBe(key2);
    });

    it('should hash keys consistently', () => {
      const key = 'prm_test_key';
      const hash1 = hashApiKey(key);
      const hash2 = hashApiKey(key);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('User ID Generation', () => {
    it('should generate valid user IDs', () => {
      const userId = generateUserId();
      
      expect(userId).toMatch(/^usr_[a-f0-9]{32}$/);
    });

    it('should generate unique user IDs', () => {
      const userId1 = generateUserId();
      const userId2 = generateUserId();
      
      expect(userId1).not.toBe(userId2);
    });
  });

  describe('API Key Validation', () => {
    it('should validate dynamically created API key', async () => {
      // Create a test user and API key
      const user = await authService.createUser('test@example.com', 'Test User', ['wsp_demo']);
      const { key } = await authService.createApiKey(user.id, 'Test Key', ['read', 'write']);
      
      const result = await authService.validateApiKey(key);
      
      expect(result).toBeDefined();
      expect(result?.user).toBeDefined();
      expect(result?.apiKey).toBeDefined();
      expect(result?.user.email).toBe('test@example.com');
    });

    it('should reject invalid API keys', async () => {
      const invalidKeys = [
        '',
        'invalid',
        'prm_invalid_key',
        'bearer_token',
        'prm_'
      ];

      for (const key of invalidKeys) {
        const result = await authService.validateApiKey(key);
        expect(result).toBeNull();
      }
    });

    it('should update last used timestamp', async () => {
      // Create a test user and API key
      const user = await authService.createUser('timestamp-test@example.com', 'Timestamp Test User', ['wsp_demo']);
      const { key } = await authService.createApiKey(user.id, 'Timestamp Test Key', ['read', 'write']);
      
      const result1 = await authService.validateApiKey(key);
      expect(result1?.apiKey.lastUsedAt).toBeDefined();
      
      const firstUsedAt = result1?.apiKey.lastUsedAt;
      
      // Wait a moment and validate again
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result2 = await authService.validateApiKey(key);
      expect(result2?.apiKey.lastUsedAt).toBeDefined();
      expect(result2?.apiKey.lastUsedAt?.getTime()).toBeGreaterThan(firstUsedAt?.getTime() || 0);
    });
  });

  describe('API Key Management', () => {
    it('should create new API keys', async () => {
      // Create a test user first
      const user = await authService.createUser('api-test@example.com', 'API Test User', ['wsp_demo']);
      const { key, apiKey } = await authService.createApiKey(user.id, 'Test Key', ['read']);
      
      expect(key).toMatch(/^prm_[a-f0-9]{64}$/);
      expect(apiKey.name).toBe('Test Key');
      expect(apiKey.permissions).toEqual(['read']);
      expect(apiKey.userId).toBe(user.id);
    });

    it('should validate newly created API keys', async () => {
      // Create a test user first
      const user = await authService.createUser('validate-test@example.com', 'Validate Test User', ['wsp_demo']);
      const { key } = await authService.createApiKey(user.id, 'Test Key 2');
      const result = await authService.validateApiKey(key);
      
      expect(result).toBeDefined();
      expect(result?.user.id).toBe(user.id);
      expect(result?.apiKey.name).toBe('Test Key 2');
    });

    it('should revoke API keys', async () => {
      // Create a test user first
      const user = await authService.createUser('revoke-test@example.com', 'Revoke Test User', ['wsp_demo']);
      const { key, apiKey } = await authService.createApiKey(user.id, 'Revoke Test');
      
      // Verify it works
      let result = await authService.validateApiKey(key);
      expect(result).toBeDefined();
      
      // Revoke it
      const revoked = await authService.revokeApiKey(apiKey.id);
      expect(revoked).toBe(true);
      
      // Verify it no longer works
      result = await authService.validateApiKey(key);
      expect(result).toBeNull();
    });
  });

  describe('User Management', () => {
    it('should create users', async () => {
      const user = await authService.createUser('test@example.com', 'Test User', ['wsp_test']);
      
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.workspaces).toEqual(['wsp_test']);
      expect(user.id).toMatch(/^usr_\d+_[a-zA-Z0-9]+$/);
    });

    it('should check permissions', async () => {
      // Create a test user with admin permissions
      const user = await authService.createUser('permission-test@example.com', 'Permission Test User', ['wsp_demo'], ['read', 'write', 'admin']);
      
      const hasRead = await authService.hasPermission(user.id, 'read');
      const hasAdmin = await authService.hasPermission(user.id, 'admin');
      const hasInvalid = await authService.hasPermission(user.id, 'invalid');
      
      expect(hasRead).toBe(true);
      expect(hasAdmin).toBe(true);
      expect(hasInvalid).toBe(true); // Admin users have all permissions
    });

    it('should check workspace access', async () => {
      // Create a test user with admin permissions
      const user = await authService.createUser('workspace-test@example.com', 'Workspace Test User', ['wsp_demo'], ['read', 'write', 'admin']);
      
      const canAccessDemo = await authService.canAccessWorkspace(user.id, 'wsp_demo');
      const canAccessOther = await authService.canAccessWorkspace(user.id, 'wsp_other');
      
      expect(canAccessDemo).toBe(true);
      expect(canAccessOther).toBe(true); // Admin users have access to all workspaces
    });
  });

  describe('Security Tests', () => {
    it('should not accept keys without prm_ prefix', async () => {
      const result = await authService.validateApiKey('demo_key_for_development_only');
      expect(result).toBeNull();
    });

    it('should handle malformed keys gracefully', async () => {
      const malformedKeys = [
        'prm_',
        'prm_short',
        'prm_' + 'x'.repeat(1000),
        'prm_\\x00\\x01\\x02',
        null as any,
        undefined as any
      ];

      for (const key of malformedKeys) {
        const result = await authService.validateApiKey(key);
        expect(result).toBeNull();
      }
    });

    it('should not leak user information for invalid keys', async () => {
      const result = await authService.validateApiKey('prm_definitely_invalid_key');
      expect(result).toBeNull();
    });
  });
});