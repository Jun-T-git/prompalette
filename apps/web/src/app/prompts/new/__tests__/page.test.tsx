import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: mockUseSession,
}));

const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

const mockPromptService = {
  create: vi.fn(),
  getByUserId: vi.fn(),
  getById: vi.fn(),
  getPublic: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  search: vi.fn(),
};

vi.mock('@/lib/services/service-factory', () => ({
  getServices: () => ({
    promptService: mockPromptService,
  }),
}));

const mockAuthStub = {
  isLocalDevelopment: true,
  STUB_USER_SESSION: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser',
      isPublic: true,
    },
    expires: new Date(Date.now() + 3600000).toISOString(),
  },
};

vi.mock('@/lib/auth-stub', () => mockAuthStub);

// Mock other dependencies
vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock('@/lib/error-handling', () => ({
  handleApiError: vi.fn(),
  handleGenericError: vi.fn(),
}));

// Mock components to avoid complex rendering issues
vi.mock('@/components/WebAppLayout', () => ({
  WebAppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="web-app-layout">{children}</div>,
}));

vi.mock('@/components/ErrorDisplay', () => ({
  ErrorDisplay: ({ error }: { error: any }) => <div data-testid="error-display">{error.message}</div>,
}));

describe('NewPromptPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // モックの状態を安定した初期値にリセット
    mockAuthStub.isLocalDevelopment = true;
    mockAuthStub.STUB_USER_SESSION = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        isPublic: true,
      },
      expires: new Date(Date.now() + 3600000).toISOString(),
    };
    
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
    });
  });

  describe('Basic Rendering', () => {
    it('should render page title', async () => {
      const NewPromptPage = (await import('../page')).default;
      render(<NewPromptPage />);

      expect(screen.getByText('新しいプロンプトを作成')).toBeInTheDocument();
    });

    it('should render form fields', async () => {
      const NewPromptPage = (await import('../page')).default;
      render(<NewPromptPage />);

      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
      expect(screen.getByLabelText(/プロンプト内容/)).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument();
    });

    it('should show initial character counts', async () => {
      const NewPromptPage = (await import('../page')).default;
      render(<NewPromptPage />);

      expect(screen.getByText(/0\/200文字/)).toBeInTheDocument();
      expect(screen.getByText(/0\/100,000文字/)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update character count when typing in title', async () => {
      const NewPromptPage = (await import('../page')).default;
      render(<NewPromptPage />);
      
      const titleInput = screen.getByLabelText(/タイトル/);
      fireEvent.change(titleInput, { target: { value: 'Test' } });

      expect(screen.getByText(/4\/200文字/)).toBeInTheDocument();
    });

    it('should update character count when typing in content', async () => {
      const NewPromptPage = (await import('../page')).default;
      render(<NewPromptPage />);
      
      const contentInput = screen.getByLabelText(/プロンプト内容/);
      fireEvent.change(contentInput, { target: { value: 'Test content' } });

      expect(screen.getByText(/12\/100,000文字/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should go back when cancel button is clicked', async () => {
      const NewPromptPage = (await import('../page')).default;
      render(<NewPromptPage />);
      
      const cancelButton = screen.getByRole('button', { name: /キャンセル/ });
      fireEvent.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('MVP Authentication Flow', () => {
    it('should show login prompt when not authenticated', async () => {
      // 一時的にisLocalDevelopmentをfalseに設定
      mockAuthStub.isLocalDevelopment = false;
      mockUseSession.mockReturnValue({ data: null });
      
      // モジュールキャッシュをクリアして再インポート
      vi.resetModules();
      const NewPromptPage = (await import('../page')).default;
      render(<NewPromptPage />);

      expect(screen.getByText(/ログインが必要です/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ログイン/ })).toBeInTheDocument();
      
      // beforeEachで自動リセットされるため手動リセット不要
    });

    it('should show form when authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });
      
      const NewPromptPage = (await import('../page')).default;
      render(<NewPromptPage />);

      expect(screen.getByText('新しいプロンプトを作成')).toBeInTheDocument();
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });
});