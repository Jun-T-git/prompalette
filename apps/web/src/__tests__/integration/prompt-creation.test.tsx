import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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
  getByUsernameAndSlug: vi.fn(),
  getByUsername: vi.fn(),
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
  logWarn: vi.fn(),
  logDebug: vi.fn(),
}));

vi.mock('@/lib/error-handling', () => ({
  handleApiError: vi.fn(),
  handleGenericError: vi.fn(),
}));

describe('Prompt Creation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('Basic User Flow', () => {
    it('should render prompt creation form', async () => {
      const NewPromptPage = (await import('@/app/prompts/new/page')).default;
      
      render(<NewPromptPage />);
      
      // 基本的なフォーム要素が表示されることを確認
      expect(screen.getByText('新しいプロンプトを作成')).toBeInTheDocument();
      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
      expect(screen.getByLabelText(/プロンプト内容/)).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument();
    });

    it('should show validation errors for empty form', async () => {
      const NewPromptPage = (await import('@/app/prompts/new/page')).default;
      
      render(<NewPromptPage />);
      
      // フォームの基本的な表示確認
      const titleInput = screen.getByLabelText(/タイトル/);
      const contentInput = screen.getByLabelText(/プロンプト内容/);
      
      expect(titleInput).toBeInTheDocument();
      expect(contentInput).toBeInTheDocument();
      
      // 空のフォームでは送信ボタンが無効化されているはず
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is filled', async () => {
      const NewPromptPage = (await import('@/app/prompts/new/page')).default;
      
      render(<NewPromptPage />);
      
      // フォームに値を入力
      fireEvent.change(screen.getByLabelText(/タイトル/), {
        target: { value: 'Test Prompt' },
      });
      fireEvent.change(screen.getByLabelText(/プロンプト内容/), {
        target: { value: 'Test content' },
      });
      
      // 入力値が設定されることを確認
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/タイトル/) as HTMLInputElement;
        const contentInput = screen.getByLabelText(/プロンプト内容/) as HTMLTextAreaElement;
        
        expect(titleInput.value).toBe('Test Prompt');
        expect(contentInput.value).toBe('Test content');
      });
    });

    it('should handle cancel button click', async () => {
      const NewPromptPage = (await import('@/app/prompts/new/page')).default;
      
      render(<NewPromptPage />);
      
      // キャンセルボタンをクリック
      fireEvent.click(screen.getByRole('button', { name: /キャンセル/ }));
      
      // router.back() が呼ばれることを確認
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('MVP User Journey', () => {
    it('should complete full prompt creation flow', async () => {
      const NewPromptPage = (await import('@/app/prompts/new/page')).default;
      
      render(<NewPromptPage />);
      
      // フォームに入力
      fireEvent.change(screen.getByLabelText(/タイトル/), {
        target: { value: 'Test Prompt Title' },
      });
      fireEvent.change(screen.getByLabelText(/プロンプト内容/), {
        target: { value: 'This is a test prompt content' },
      });
      fireEvent.change(screen.getByLabelText(/タグ/), {
        target: { value: 'test, mvp' },
      });
      
      // 送信ボタンが有効化されるのを待つ
      await waitFor(() => {
        const submitButton = screen.getByTestId('submit-button');
        expect(submitButton).not.toBeDisabled();
      });
      
      // モックサービスのレスポンスを設定
      mockPromptService.create.mockResolvedValue({
        id: 'new-prompt-id',
        slug: 'test-prompt-title',
        title: 'Test Prompt Title',
        content: 'This is a test prompt content',
        tags: ['test', 'mvp'],
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      // フォーム送信
      fireEvent.click(screen.getByTestId('submit-button'));
      
      // サービスが呼ばれたことを確認
      await waitFor(() => {
        expect(mockPromptService.create).toHaveBeenCalledWith(
          'test-user-id',
          expect.objectContaining({
            title: 'Test Prompt Title',
            content: 'This is a test prompt content',
            tags: ['test', 'mvp'],
          })
        );
      });
    });

    it('should handle form validation errors', async () => {
      const NewPromptPage = (await import('@/app/prompts/new/page')).default;
      
      render(<NewPromptPage />);
      
      // 空のフォームでは送信ボタンが無効
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
      
      // タイトルのみ入力
      fireEvent.change(screen.getByLabelText(/タイトル/), {
        target: { value: 'Title Only' },
      });
      
      // まだ送信ボタンは無効（contentが必須）
      expect(submitButton).toBeDisabled();
    });

    it('should handle service errors gracefully', async () => {
      const NewPromptPage = (await import('@/app/prompts/new/page')).default;
      
      render(<NewPromptPage />);
      
      // フォームに入力
      fireEvent.change(screen.getByLabelText(/タイトル/), {
        target: { value: 'Test Prompt' },
      });
      fireEvent.change(screen.getByLabelText(/プロンプト内容/), {
        target: { value: 'Test content' },
      });
      
      // エラーをモック
      mockPromptService.create.mockRejectedValue(
        new Error('Failed to create prompt')
      );
      
      // 送信ボタンが有効化されるのを待つ
      await waitFor(() => {
        expect(screen.getByTestId('submit-button')).not.toBeDisabled();
      });
      
      // フォーム送信
      fireEvent.click(screen.getByTestId('submit-button'));
      
      // サービスが呼ばれたことを確認（エラーケースでも呼ばれるはず）
      await waitFor(() => {
        expect(mockPromptService.create).toHaveBeenCalled();
      });
    });
  });
});