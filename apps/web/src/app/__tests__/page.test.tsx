import { vi, describe, expect, it, beforeEach } from 'vitest';

// Mock Next.js redirect
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

const mockGetUserFromSession = vi.fn();
vi.mock('@/lib/auth-utils', () => ({
  getUserFromSession: mockGetUserFromSession,
}));

const mockAuthStub = {
  isLocalDevelopment: false,
  STUB_USER_SESSION: {
    user: { username: 'stub-user' }
  } as any,
};

vi.mock('@/lib/auth-stub', () => mockAuthStub);

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // モックの状態を安定した初期値にリセット
    mockAuthStub.isLocalDevelopment = false;
    mockAuthStub.STUB_USER_SESSION = {
      user: { username: 'stub-user' }
    };
  });

  it('should redirect to user dashboard when user is authenticated', async () => {
    mockGetUserFromSession.mockResolvedValue({
      username: 'test-user',
    });
    
    const HomePage = (await import('../page')).default;
    await HomePage();
    
    expect(mockRedirect).toHaveBeenCalledWith('/test-user');
  });

  it('should redirect to login when user is not authenticated', async () => {
    mockGetUserFromSession.mockResolvedValue(null);
    
    const HomePage = (await import('../page')).default;
    await HomePage();
    
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('should use local development stub when configured', async () => {
    // isLocalDevelopmentをtrueに設定
    mockAuthStub.isLocalDevelopment = true;
    
    // モジュールキャッシュをクリアして再インポート
    vi.resetModules();
    const HomePage = (await import('../page')).default;
    await HomePage();
    
    // スタブユーザーでリダイレクト
    expect(mockRedirect).toHaveBeenCalledWith('/stub-user');
    
    // beforeEachで自動リセットされるため手動リセット不要
  });
});