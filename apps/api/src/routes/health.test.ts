import { describe, expect, it } from 'vitest';

import { healthRoute } from './health.js';

describe('Health Route', () => {
  it('should return health status', async () => {
    const req = new Request('http://localhost/');
    const res = await healthRoute.fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('environment');
  });

  it('should return valid timestamp', async () => {
    const req = new Request('http://localhost/');
    const res = await healthRoute.fetch(req);
    const data = await res.json();

    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    expect(typeof data.uptime).toBe('number');
  });
});