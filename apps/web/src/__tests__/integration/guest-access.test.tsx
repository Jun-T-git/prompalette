import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SearchPage from '@/app/search/page';
// import { isLocalDevelopment } from '@/lib/auth-stub';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

// Mock auth-stub
vi.mock('@/lib/auth-stub', () => ({
  isLocalDevelopment: true,
  stubPromptStorage: {
    getPublic: vi.fn(() => [
      {
        id: 'prompt-1',
        user_id: 'user-123',
        title: 'Public Prompt 1',
        content: 'This is a public prompt for testing',
        tags: ['test', 'public'],
        quick_access_key: 'test1',
        slug: 'public-prompt-1',
        is_public: true,
        view_count: 10,
        copy_count: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          username: 'testuser',
          name: 'Test User',
          avatar_url: null,
        },
      },
      {
        id: 'prompt-2',
        user_id: 'user-456',
        title: 'Another Public Prompt',
        content: 'Another public prompt for testing',
        tags: ['test', 'example'],
        quick_access_key: 'test2',
        slug: 'another-public-prompt',
        is_public: true,
        view_count: 20,
        copy_count: 8,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        user: {
          username: 'anotheruser',
          name: 'Another User',
          avatar_url: null,
        },
      },
    ]),
    search: vi.fn(() => []),
  },
}));

const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

describe('Guest Access Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });


  describe('Guest Search Functionality', () => {
    it('should allow guests to search public prompts', async () => {
      render(
        <SessionProvider session={null}>
          <SearchPage />
        </SessionProvider>
      );

      // Check if search interface is displayed
      expect(screen.getByText('プロンプト検索')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('プロンプトを検索... (@username, #tag, /quickkey)')).toBeInTheDocument();

      // Check search tips are displayed
      expect(screen.getByText('検索のコツ')).toBeInTheDocument();
      expect(screen.getByText('@username')).toBeInTheDocument();
      expect(screen.getByText('#tag')).toBeInTheDocument();
      expect(screen.getByText('/quickkey')).toBeInTheDocument();
    });

    it('should show example search buttons for guests', async () => {
      render(
        <SessionProvider session={null}>
          <SearchPage />
        </SessionProvider>
      );

      // Check example search buttons
      expect(screen.getByText('@stub-user')).toBeInTheDocument();
      expect(screen.getByText('#プログラミング')).toBeInTheDocument();
      expect(screen.getByText('/review')).toBeInTheDocument();
    });
  });



});