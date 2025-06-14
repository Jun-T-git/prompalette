import { Hono } from 'hono';
import { describe, expect, it, beforeEach } from 'vitest';

import { authMiddleware, requestIdMiddleware } from '../middleware/auth.js';
import { fileStorage } from '../services/fileStorage.js';
import { createTestAuth, createAuthHeaders, type TestAuth } from '../test/helpers/auth.js';

import { promptsRoute } from './prompts.js';

describe('Prompts Route', () => {
  let app: Hono;
  let testAuth: TestAuth;

  beforeEach(async () => {
    // Ensure file storage is initialized before each test
    await fileStorage.initialize();
    
    // Create test authentication dynamically
    testAuth = await createTestAuth(['read', 'write', 'admin']);
    
    app = new Hono();
    app.use('*', requestIdMiddleware());
    app.use('*', authMiddleware({ required: false })); // Optional auth for testing
    app.route('/', promptsRoute);
  });

  const getAuthHeaders = () => createAuthHeaders(testAuth.apiKey);

  it('should return list of prompts', async () => {
    const res = await app.request('/', {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    // Debug output for failed test
    if (res.status !== 200) {
      console.log('Response status:', res.status);
      console.log('Response data:', data);
    }

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('prompts');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.prompts)).toBe(true);
    expect(data.prompts.length).toBeGreaterThan(0);
  });

  it('should filter prompts by status', async () => {
    const res = await app.request('/?status=active', {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.prompts.every((p: any) => p.status === 'active')).toBe(true);
  });

  it('should filter prompts by visibility', async () => {
    const res = await app.request('/?visibility=private', {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.prompts.every((p: any) => p.visibility === 'private')).toBe(true);
  });

  it('should create a new prompt', async () => {
    const promptData = {
      title: 'Test Prompt',
      content: 'This is a test prompt',
      description: 'A test prompt for testing',
      workspaceId: 'wsp_demo',
      tagIds: ['test-tag'],
    };

    const res = await app.request('/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(promptData),
    });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toHaveProperty('prompt');
    expect(data.prompt.title).toBe(promptData.title);
    expect(data.prompt.content).toBe(promptData.content);
    expect(data.prompt).toHaveProperty('id');
    expect(data.prompt).toHaveProperty('createdAt');
  });

  it('should return 404 for non-existent prompt', async () => {
    const res = await app.request('/non-existent-id', {
      headers: getAuthHeaders()
    });

    expect(res.status).toBe(404);
  });

  it('should increment usage count', async () => {
    // First, get a prompt ID from the initial data
    const listRes = await app.request('/', {
      headers: getAuthHeaders()
    });
    const listData = await listRes.json();
    const promptId = listData.prompts[0].id;

    const res = await app.request(`/${promptId}/usage`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('prompt');
    expect(data).toHaveProperty('message', 'Usage incremented');
    expect(data.prompt).toHaveProperty('usageCount');
  });

  it('should handle validation errors gracefully', async () => {
    const invalidData = {
      title: '', // Invalid: empty title
      content: 'Test content',
    };

    const res = await app.request('/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(invalidData),
    });

    expect(res.status).toBe(400);
  });
});