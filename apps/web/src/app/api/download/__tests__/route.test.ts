import { NextRequest } from 'next/server';
import { vi } from 'vitest';

import { GET, OPTIONS } from '../route';

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe('Download API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/download', () => {
    it('should redirect to GitHub release when asset is found', async () => {
      const mockGitHubResponse = {
        ok: true,
        json: async () => ({
          assets: [
            {
              name: 'prompalette-1.0.0.dmg',
              browser_download_url: 'https://github.com/test/releases/download/v1.0.0/prompalette-1.0.0.dmg'
            }
          ]
        })
      };

      (global.fetch as any).mockResolvedValueOnce(mockGitHubResponse);

      const request = new NextRequest('http://localhost:3000/api/download?platform=macos', {
        headers: {
          'origin': 'http://localhost:3000'
        }
      });

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('https://github.com/test/releases/download/v1.0.0/prompalette-1.0.0.dmg');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    });

    it('should return fallback response when GitHub API fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('GitHub API error'));

      const request = new NextRequest('http://localhost:3000/api/download?platform=macos', {
        headers: {
          'origin': 'http://localhost:3000'
        }
      });

      const response = await GET(request);

      expect(response.status).toBe(202);
      
      const body = await response.json();
      expect(body.message).toBe('ダウンロードファイルを準備中です。GitHubリリースページをご確認ください。');
      expect(body.github_url).toBe('https://github.com/Jun-T-git/prompalette/releases');
    });

    it('should return fallback when no DMG asset is found', async () => {
      const mockGitHubResponse = {
        ok: true,
        json: async () => ({
          assets: [
            {
              name: 'prompalette-1.0.0.exe',
              browser_download_url: 'https://github.com/test/releases/download/v1.0.0/prompalette-1.0.0.exe'
            }
          ]
        })
      };

      (global.fetch as any).mockResolvedValueOnce(mockGitHubResponse);

      const request = new NextRequest('http://localhost:3000/api/download?platform=macos');

      const response = await GET(request);

      expect(response.status).toBe(202);
      
      const body = await response.json();
      expect(body.message).toBe('ダウンロードファイルを準備中です。GitHubリリースページをご確認ください。');
    });

    it('should return error for unsupported platform', async () => {
      const request = new NextRequest('http://localhost:3000/api/download?platform=linux');

      const response = await GET(request);

      expect(response.status).toBe(400);
      
      const body = await response.json();
      expect(body.error).toBe('Platform not supported');
      expect(body.supported_platforms).toEqual(['macos']);
    });

    it('should use default platform when not specified', async () => {
      const mockGitHubResponse = {
        ok: true,
        json: async () => ({
          assets: [
            {
              name: 'prompalette-1.0.0.dmg',
              browser_download_url: 'https://github.com/test/releases/download/v1.0.0/prompalette-1.0.0.dmg'
            }
          ]
        })
      };

      (global.fetch as any).mockResolvedValueOnce(mockGitHubResponse);

      const request = new NextRequest('http://localhost:3000/api/download');

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/Jun-T-git/prompalette/releases/latest',
        expect.objectContaining({
          headers: {
            'User-Agent': 'PromPalette-Download-Service/1.0',
            'Accept': 'application/vnd.github.v3+json'
          }
        })
      );
    });
  });

  describe('CORS handling', () => {
    it('should handle allowed origins correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/download', {
        headers: {
          'origin': 'http://localhost:3000'
        }
      });

      const response = await OPTIONS(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });

    it('should fallback to default origin for unauthorized origins', async () => {
      const request = new NextRequest('http://localhost:3000/api/download', {
        headers: {
          'origin': 'https://malicious-site.com'
        }
      });

      const response = await OPTIONS(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    });

    it('should handle missing origin header', async () => {
      const request = new NextRequest('http://localhost:3000/api/download');

      const response = await OPTIONS(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    });
  });

  describe('Error handling', () => {
    it('should handle GitHub API rate limiting', async () => {
      const mockGitHubResponse = {
        ok: false,
        status: 403,
        json: async () => ({
          message: 'API rate limit exceeded'
        })
      };

      (global.fetch as any).mockResolvedValueOnce(mockGitHubResponse);

      const request = new NextRequest('http://localhost:3000/api/download?platform=macos');

      const response = await GET(request);

      expect(response.status).toBe(202);
      const body = await response.json();
      expect(body.message).toBe('ダウンロードファイルを準備中です。GitHubリリースページをご確認ください。');
    });

    it('should handle network timeout', async () => {
      (global.fetch as any).mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Network timeout')), 100);
        });
      });

      const request = new NextRequest('http://localhost:3000/api/download?platform=macos');

      const response = await GET(request);

      expect(response.status).toBe(202);
      const body = await response.json();
      expect(body.message).toBe('ダウンロードファイルを準備中です。GitHubリリースページをご確認ください。');
    });
  });
});