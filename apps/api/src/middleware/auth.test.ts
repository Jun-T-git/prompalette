import { Hono } from 'hono';
import { describe, it, expect, beforeEach } from 'vitest';

import { authMiddleware, requestIdMiddleware } from './auth.js';
import { createTestAuth, type TestAuth } from '../test/helpers/auth.js';

describe('Authentication Middleware', () => {
  let app: Hono;
  let testAuth: TestAuth;

  beforeEach(async () => {
    // Create test authentication dynamically
    testAuth = await createTestAuth(['read', 'write', 'admin']);
    
    app = new Hono();
    app.use('*', requestIdMiddleware());
  });

  describe('authMiddleware', () => {
    it('should reject requests without authorization header', async () => {
      app.use('/protected', authMiddleware());
      app.get('/protected', (c) => c.json({ success: true }));

      const res = await app.request('/protected');
      
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('AUTH_REQUIRED');
    });

    it('should reject requests with invalid authorization format', async () => {
      app.use('/protected', authMiddleware());
      app.get('/protected', (c) => c.json({ success: true }));

      const res = await app.request('/protected', {
        headers: {
          'Authorization': 'Invalid token'
        }
      });
      
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('INVALID_AUTH_FORMAT');
    });

    it('should reject requests with invalid API key', async () => {
      app.use('/protected', authMiddleware());
      app.get('/protected', (c) => c.json({ success: true }));

      const res = await app.request('/protected', {
        headers: {
          'Authorization': 'Bearer invalid_key'
        }
      });
      
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('INVALID_API_KEY');
    });

    it('should accept requests with valid dynamically generated API key', async () => {
      app.use('/protected', authMiddleware());
      app.get('/protected', (c) => {
        const auth = c.get('auth');
        return c.json({ 
          success: true, 
          userId: auth.user.id,
          keyId: auth.apiKey.id
        });
      });

      const res = await app.request('/protected', {
        headers: {
          'Authorization': `Bearer ${testAuth.apiKey}`
        }
      });
      
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.userId).toBeDefined();
      expect(body.keyId).toBeDefined();
    });

    it('should work with optional authentication', async () => {
      app.use('/optional', authMiddleware({ required: false }));
      app.get('/optional', (c) => {
        const auth = c.get('auth');
        return c.json({ 
          success: true,
          authenticated: !!auth
        });
      });

      // Without auth header
      const res1 = await app.request('/optional');
      expect(res1.status).toBe(200);
      const body1 = await res1.json();
      expect(body1.authenticated).toBe(false);

      // With valid auth header
      const res2 = await app.request('/optional', {
        headers: {
          'Authorization': `Bearer ${testAuth.apiKey}`
        }
      });
      expect(res2.status).toBe(200);
      const body2 = await res2.json();
      expect(body2.authenticated).toBe(true);
    });

    it('should include request ID in all responses', async () => {
      app.use('/test', authMiddleware());
      app.get('/test', (c) => c.json({ success: true }));

      const res = await app.request('/test');
      
      expect(res.headers.get('X-Request-ID')).toBeDefined();
      const body = await res.json();
      expect(body.requestId).toBeDefined();
    });
  });

  describe('Security Tests', () => {
    it('should log security events for invalid authentication attempts', async () => {
      app.use('/protected', authMiddleware());
      app.get('/protected', (c) => c.json({ success: true }));

      // Test multiple invalid attempts
      const attempts = [
        'Bearer invalid_key_1',
        'Bearer invalid_key_2',
        'Bearer ',
        'Bearer prm_fake_key'
      ];

      for (const auth of attempts) {
        const res = await app.request('/protected', {
          headers: { 'Authorization': auth }
        });
        expect(res.status).toBe(401);
      }
    });

    it('should not leak sensitive information in error responses', async () => {
      app.use('/protected', authMiddleware());
      app.get('/protected', (c) => c.json({ success: true }));

      const res = await app.request('/protected', {
        headers: {
          'Authorization': 'Bearer prm_very_secret_key_that_should_not_be_logged'
        }
      });
      
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(JSON.stringify(body)).not.toContain('very_secret_key');
    });
  });
});