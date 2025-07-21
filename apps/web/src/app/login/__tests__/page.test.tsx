import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import LoginPage from '../page';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

// Mock GuestLayout
vi.mock('@/components/GuestLayout', () => ({
  GuestLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="guest-layout">{children}</div>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login page with title and description', () => {
    render(<LoginPage />);

    expect(screen.getByText('PromPalette')).toBeInTheDocument();
    expect(screen.getByText('Webでも、Desktopと同じ体験を')).toBeInTheDocument();
    expect(screen.getByText('プロンプトをクラウドで同期して、どこからでもアクセス')).toBeInTheDocument();
  });

  it('should display OAuth login buttons', () => {
    // OAuth設定をテスト環境で有効にする
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    process.env.GITHUB_CLIENT_ID = 'test-github-id';
    process.env.GOOGLE_CLIENT_ID = 'test-google-id';
    
    render(<LoginPage />);

    // OAuth設定が有効な場合のみボタンが表示される
    if (process.env.GITHUB_CLIENT_ID || process.env.GOOGLE_CLIENT_ID) {
      expect(screen.getByText('GitHubでログイン')).toBeInTheDocument();
      expect(screen.getByText('Googleでログイン')).toBeInTheDocument();
      expect(screen.getByText('Appleでログイン')).toBeInTheDocument();
    } else {
      // OAuth設定がない場合は設定メッセージが表示される
      expect(screen.getByText('OAuth設定が必要です')).toBeInTheDocument();
    }
  });

  it('should call signIn when GitHub button is clicked', () => {
    render(<LoginPage />);

    const githubButton = screen.getByText('GitHubでログイン');
    fireEvent.click(githubButton);

    expect(signIn).toHaveBeenCalledWith('github', { callbackUrl: '/' });
  });

  it('should call signIn when Google button is clicked', () => {
    render(<LoginPage />);

    const googleButton = screen.getByText('Googleでログイン');
    fireEvent.click(googleButton);

    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
  });

  it('should call signIn when Apple button is clicked', () => {
    render(<LoginPage />);

    const appleButton = screen.getByText('Appleでログイン');
    fireEvent.click(appleButton);

    expect(signIn).toHaveBeenCalledWith('apple', { callbackUrl: '/' });
  });

  it('should display privacy policy and terms links', () => {
    render(<LoginPage />);

    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
    expect(screen.getByText('利用規約')).toBeInTheDocument();
  });

  it('should handle custom callback URL from search params', () => {
    const mockGet = vi.fn((key) => key === 'callbackUrl' ? '/dashboard' : null);
    vi.mocked(useSearchParams).mockReturnValue({ get: mockGet } as any);

    render(<LoginPage />);

    const githubButton = screen.getByText('GitHubでログイン');
    fireEvent.click(githubButton);

    expect(signIn).toHaveBeenCalledWith('github', { callbackUrl: '/dashboard' });
  });

  it('should display error message when error param is present', () => {
    const mockGet = vi.fn((key) => key === 'error' ? 'OAuthSignin' : null);
    vi.mocked(useSearchParams).mockReturnValue({ get: mockGet } as any);

    render(<LoginPage />);

    expect(screen.getByText('認証エラーが発生しました。もう一度お試しください。')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<LoginPage />);

    const githubButton = screen.getByText('GitHubでログイン');
    expect(githubButton).toBeEnabled();
    
    const googleButton = screen.getByText('Googleでログイン');
    expect(googleButton).toBeEnabled();
    
    const appleButton = screen.getByText('Appleでログイン');
    expect(appleButton).toBeEnabled();
  });

  it('should display desktop app promotion', () => {
    render(<LoginPage />);

    expect(screen.getByText('デスクトップアプリも利用可能')).toBeInTheDocument();
    expect(screen.getByText('ローカルファーストでより高速な体験')).toBeInTheDocument();
  });
});