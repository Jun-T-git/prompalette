import { describe, expect, it } from 'vitest';

import { promptsRoute } from './prompts.js';

describe('Prompts Route', () => {
  it('should return list of prompts', async () => {
    const req = new Request('http://localhost/');
    const res = await promptsRoute.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('prompts');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.prompts)).toBe(true);
    expect(data.prompts.length).toBeGreaterThan(0);
  });

  it('should filter prompts by status', async () => {
    const req = new Request('http://localhost/?status=active');
    const res = await promptsRoute.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.prompts.every((p: any) => p.status === 'active')).toBe(true);
  });

  it('should filter prompts by visibility', async () => {
    const req = new Request('http://localhost/?visibility=private');
    const res = await promptsRoute.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.prompts.every((p: any) => p.visibility === 'private')).toBe(true);
  });

  it('should create a new prompt', async () => {
    const promptData = {
      title: 'Test Prompt',
      content: 'This is a test prompt',
      description: 'A test prompt for testing',
      tagIds: ['test-tag'],
    };

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData),
    });

    const res = await promptsRoute.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toHaveProperty('prompt');
    expect(data.prompt.title).toBe(promptData.title);
    expect(data.prompt.content).toBe(promptData.content);
    expect(data.prompt).toHaveProperty('id');
    expect(data.prompt).toHaveProperty('createdAt');
  });

  it('should return 404 for non-existent prompt', async () => {
    const req = new Request('http://localhost/non-existent-id');
    const res = await promptsRoute.fetch(req);

    expect(res.status).toBe(404);
  });

  it('should increment usage count', async () => {
    // First, get a prompt ID from the initial data
    const listReq = new Request('http://localhost/');
    const listRes = await promptsRoute.fetch(listReq);
    const listData = await listRes.json();
    const promptId = listData.prompts[0].id;

    const req = new Request(`http://localhost/${promptId}/usage`, {
      method: 'POST',
    });

    const res = await promptsRoute.fetch(req);
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

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    });

    const res = await promptsRoute.fetch(req);

    expect(res.status).toBe(400);
  });
});