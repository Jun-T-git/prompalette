import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { POST, GET } from '../route';

// Mock data and service using vi.hoisted
const mockPromptData = vi.hoisted(() => ({
  id: 'test-prompt-id',
  user_id: 'test-user-id',
  title: 'Test Prompt',
  content: 'Test content',
  tags: ['test'],
  quick_access_key: 'test-key',
  is_public: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}));

const mockPromptService = vi.hoisted(() => ({
  create: vi.fn(() => Promise.resolve(mockPromptData)),
  getByUserId: vi.fn(() => Promise.resolve([mockPromptData])),
  getById: vi.fn(),
  getPublic: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  search: vi.fn(),
}));

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

const mockValidateAuthentication = vi.hoisted(() => vi.fn(() => Promise.resolve({
  success: true,
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
})));

vi.mock('@/lib/auth-utils', () => ({
  validateAuthentication: mockValidateAuthentication,
  validateUserId: vi.fn(() => true),
}));

vi.mock('@/lib/services/service-factory', () => ({
  getServices: () => ({
    promptService: mockPromptService,
  }),
}));

const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
};

describe('/api/prompts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default success state
    mockValidateAuthentication.mockResolvedValue({
      success: true,
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  });

  describe('POST', () => {
    it('should create a new prompt with valid data', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Prompt',
          content: 'Test content',
          tags: ['test'],
          quick_access_key: 'test-key',
          is_public: true,
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        data: mockPromptData,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      (getServerSession as any).mockResolvedValue(null);
      mockValidateAuthentication.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Prompt',
          content: 'Test content',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: 'Unauthorized',
      });
    });

    it('should return 400 when title is missing', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);
      mockValidateAuthentication.mockResolvedValue({
        success: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Test content',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Invalid input',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['title'],
            code: 'invalid_type',
          }),
        ]),
      });
    });

    it('should return 400 when content is missing', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);
      mockValidateAuthentication.mockResolvedValue({
        success: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Prompt',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Invalid input',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['content'],
            code: 'invalid_type',
          }),
        ]),
      });
    });

    it('should handle whitespace-only title and content', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);
      mockValidateAuthentication.mockResolvedValue({
        success: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: '   ',
          content: '   ',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Invalid input',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: ['title'],
            code: 'too_small',
          }),
        ]),
      });
    });

    it('should handle default values correctly', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Prompt',
          content: 'Test content',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockPromptService.create).toHaveBeenCalledWith('test-user-id', {
        title: 'Test Prompt',
        content: 'Test content',
        tags: [],
        quick_access_key: null,
        is_public: false,
      });
      expect(responseData).toEqual({
        data: mockPromptData,
      });
    });

    it('should handle service errors', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);
      mockPromptService.create.mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Prompt',
          content: 'Test content',
        }),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: 'Service error',
        details: expect.objectContaining({
          stack: expect.stringContaining('Service error'),
        }),
      });
    });
  });

  describe('GET', () => {
    it('should return user prompts when authenticated', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/prompts');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        data: [mockPromptData],
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      (getServerSession as any).mockResolvedValue(null);
      mockValidateAuthentication.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const request = new NextRequest('http://localhost:3000/api/prompts');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: 'Unauthorized',
      });
    });

    it('should query with correct user_id', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/prompts');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockPromptService.getByUserId).toHaveBeenCalledWith('test-user-id');
      expect(responseData).toEqual({
        data: [mockPromptData],
      });
    });

    it('should handle service errors in GET', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);
      mockPromptService.getByUserId.mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/prompts');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: 'Service error',
        details: expect.objectContaining({
          stack: expect.stringContaining('Service error'),
        }),
      });
    });

    it('should handle malformed JSON in POST', async () => {
      (getServerSession as any).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: expect.stringContaining('not valid JSON'),
        details: expect.objectContaining({
          stack: expect.stringContaining('not valid JSON'),
        }),
      });
    });
  });
});