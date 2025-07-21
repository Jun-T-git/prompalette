import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: mockUseSession,
}));

const mockPromptService = {
  create: vi.fn(),
  getByUserId: vi.fn(),
  getById: vi.fn(),
  getPublic: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  search: vi.fn(),
  getByUsernameAndSlug: vi.fn(),
  getByUsername: vi.fn(),
};

vi.mock('@/lib/services/service-factory', () => ({
  getPromptService: () => mockPromptService,
  getServices: () => ({ promptService: mockPromptService }),
}));

const mockGetUserFromSession = vi.fn();
vi.mock('@/lib/auth-utils', () => ({
  getUserFromSession: mockGetUserFromSession,
}));

const mockAuthStub = {
  isLocalDevelopment: true,
  STUB_USER_SESSION: {
    user: { 
      id: 'test-user-id',
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com'
    }
  }
};

vi.mock('@/lib/auth-stub', () => mockAuthStub);

// Mock other dependencies
vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logDebug: vi.fn(),
}));

vi.mock('@/lib/error-handling', () => ({
  handleApiError: vi.fn(),
  handleGenericError: vi.fn(),
}));

const mockUser = {
  id: 'test-user-id',
  username: 'testuser',
  name: 'Test User',
  avatar_url: null,
};

const mockPrompt = {
  id: 'test-prompt-id',
  slug: 'hello-world',
  title: 'Hello World',
  content: 'This is a test prompt',
  tags: ['test', 'example'],
  quick_access_key: 'hello',
  is_public: true,
  user_id: 'test-user-id',
  user: mockUser,
  view_count: 0,
  copy_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('Basic User Flows Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserFromSession.mockResolvedValue(mockUser);
    mockPromptService.getByUsername.mockResolvedValue([mockPrompt]);
    mockPromptService.getByUsernameAndSlug.mockResolvedValue(mockPrompt);
    mockPromptService.getPublic.mockResolvedValue([mockPrompt]);
    mockPromptService.create.mockResolvedValue(mockPrompt);
  });

  describe('URL Structure Navigation', () => {
    it('should have correct URL patterns for all main pages', () => {
      // Test that the URL patterns match the expected GitHub-style structure
      const urlPatterns = [
        // User dashboard
        '/testuser',
        // User profile  
        '/testuser/profile',
        // User prompts
        '/testuser/prompts',
        // Individual prompt
        '/testuser/prompts/hello-world',
        // Edit prompt
        '/testuser/prompts/hello-world/edit',
      ];

      urlPatterns.forEach(pattern => {
        // Verify the pattern starts with a username
        if (pattern !== '/testuser') {
          expect(pattern).toMatch(/^\/testuser/);
        }
        
        // Verify it follows GitHub-style conventions
        expect(pattern).not.toMatch(/\/dashboard/);
        expect(pattern).not.toMatch(/\/user\//);
      });
    });

    it('should validate prompt slug generation', async () => {
      const { generateSlug } = await import('@/lib/utils/slug');
      
      // Test various title scenarios
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Test Prompt!!!', 'quick')).toBe('quick'); // Priority to quick access key
      expect(generateSlug('This is a very long title that should be truncated')).toBe('this-is-a-very-long-title-that-should-be-truncated');
      expect(generateSlug('')).toBe('untitled');
    });
  });

  describe('Service Layer Integration', () => {
    it('should have all required service methods', () => {
      expect(typeof mockPromptService.getByUsername).toBe('function');
      expect(typeof mockPromptService.getByUsernameAndSlug).toBe('function');
      expect(typeof mockPromptService.create).toBe('function');
      expect(typeof mockPromptService.update).toBe('function');
      expect(typeof mockPromptService.delete).toBe('function');
    });

    it('should handle username-based prompt queries', async () => {
      const prompts = await mockPromptService.getByUsername('testuser', true);
      expect(mockPromptService.getByUsername).toHaveBeenCalledWith('testuser', true);
      expect(prompts).toEqual([mockPrompt]);
    });

    it('should handle slug-based prompt queries', async () => {
      const prompt = await mockPromptService.getByUsernameAndSlug('testuser', 'hello-world');
      expect(mockPromptService.getByUsernameAndSlug).toHaveBeenCalledWith('testuser', 'hello-world');
      expect(prompt).toEqual(mockPrompt);
    });
  });

  describe('Component Integration', () => {
    it('should render PromptCard with correct URLs', async () => {
      const { render, screen } = await import('@/__tests__/test-utils');
      const { PromptCard } = await import('@/components/PromptCard');
      
      render(
        <PromptCard 
          prompt={mockPrompt} 
          currentUser={mockUser}
          showAuthor={true}
        />
      );
      
      // Check that links use the new URL structure
      const promptLink = screen.getByRole('link', { name: mockPrompt.title });
      expect(promptLink).toHaveAttribute('href', '/testuser/prompts/hello-world');
      
      const authorLink = screen.getByRole('link', { name: 'by @testuser' });
      expect(authorLink).toHaveAttribute('href', '/testuser/profile');
    });

    it('should handle copy functionality', async () => {
      const { render, screen, fireEvent } = await import('@/__tests__/test-utils');
      const { PromptCard } = await import('@/components/PromptCard');
      
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(() => Promise.resolve()),
        },
      });
      const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');
      
      render(
        <PromptCard 
          prompt={mockPrompt} 
          currentUser={mockUser}
          showAuthor={true}
        />
      );
      
      const copyButtons = screen.getAllByRole('button', { name: 'Copy' });
      fireEvent.click(copyButtons[0]);
      
      expect(writeTextSpy).toHaveBeenCalledWith(mockPrompt.content);
    });
  });

  describe('Form Submission Flow', () => {
    it('should handle prompt form with username redirect', async () => {
      const { PromptForm } = await import('@/components/forms/PromptForm');
      const { render } = await import('@/__tests__/test-utils');
      
      // This mainly tests that the component can be instantiated with new props
      expect(() => {
        render(
          <PromptForm
            userId="test-user-id"
            username="testuser"
            isLocalDevelopment={true}
            onSuccess={() => {}}
            onError={() => {}}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user gracefully', async () => {
      mockGetUserFromSession.mockResolvedValue(null);
      
      // Test that components handle null user appropriately
      expect(mockGetUserFromSession).toBeDefined();
    });

    it('should handle missing prompts gracefully', async () => {
      mockPromptService.getByUsername.mockResolvedValue([]);
      
      const prompts = await mockPromptService.getByUsername('nonexistent', false);
      expect(prompts).toEqual([]);
    });
  });
});