import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GuestHeader } from '@/components/GuestHeader';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

describe('GuestHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('should render guest header with logo and title', () => {
    render(
      <SessionProvider session={null}>
        <GuestHeader />
      </SessionProvider>
    );

    expect(screen.getByText('PromPalette')).toBeInTheDocument();
    expect(screen.getByText('プロンプト管理・共有プラットフォーム')).toBeInTheDocument();
  });

  it('should display guest navigation links', () => {
    render(
      <SessionProvider session={null}>
        <GuestHeader />
      </SessionProvider>
    );

    expect(screen.getAllByText('検索').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ログイン').length).toBeGreaterThan(0);
  });


  it('should navigate to search page when search link is clicked', () => {
    render(
      <SessionProvider session={null}>
        <GuestHeader />
      </SessionProvider>
    );

    const searchLink = screen.getAllByText('検索')[0];
    fireEvent.click(searchLink);

    expect(mockPush).toHaveBeenCalledWith('/search');
  });

  it('should navigate to login page when login link is clicked', () => {
    render(
      <SessionProvider session={null}>
        <GuestHeader />
      </SessionProvider>
    );

    const loginLink = screen.getAllByText('ログイン')[0];
    fireEvent.click(loginLink);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should not display authenticated user features', () => {
    render(
      <SessionProvider session={null}>
        <GuestHeader />
      </SessionProvider>
    );

    // Should not show user avatar or user menu
    expect(screen.queryByText('プロフィール')).not.toBeInTheDocument();
    expect(screen.queryByText('ダッシュボード')).not.toBeInTheDocument();
    expect(screen.queryByText('設定')).not.toBeInTheDocument();
    expect(screen.queryByText('ログアウト')).not.toBeInTheDocument();
  });

  it('should display desktop app download link', () => {
    render(
      <SessionProvider session={null}>
        <GuestHeader />
      </SessionProvider>
    );

    expect(screen.getAllByText('Desktop版').length).toBeGreaterThan(0);
  });

  it('should have responsive design classes', () => {
    render(
      <SessionProvider session={null}>
        <GuestHeader />
      </SessionProvider>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('bg-white');
  });

  it('should display call-to-action for guest users', () => {
    render(
      <SessionProvider session={null}>
        <GuestHeader />
      </SessionProvider>
    );

    expect(screen.getByText('無料で始める')).toBeInTheDocument();
  });
});