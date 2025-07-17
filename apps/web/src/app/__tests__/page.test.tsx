import { vi, describe, expect, it, beforeEach } from 'vitest';

// Mock Next.js redirect
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

const mockGetServerSession = vi.fn();
vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

const mockAuthStub = {
  isLocalDevelopment: false,
  STUB_USER_SESSION: null,
};

vi.mock('@/lib/auth-stub', () => mockAuthStub);

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // モックの状態を安定した初期値にリセット
    mockAuthStub.isLocalDevelopment = false;
    mockAuthStub.STUB_USER_SESSION = null;
  });

  it('should redirect to dashboard when user is authenticated', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'test-user' },
    });
    
    const HomePage = (await import('../page')).default;
    await HomePage();
    
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect to explore when user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);
    
    const HomePage = (await import('../page')).default;
    await HomePage();
    
    expect(mockRedirect).toHaveBeenCalledWith('/docs');
  });

  it('should use local development stub when configured', async () => {
    // isLocalDevelopmentをtrueに設定
    mockAuthStub.isLocalDevelopment = true;
    mockAuthStub.STUB_USER_SESSION = { user: { id: 'stub-user' } };
    
    // モジュールキャッシュをクリアして再インポート
    vi.resetModules();
    const HomePage = (await import('../page')).default;
    await HomePage();
    
    // スタブユーザーでリダイレクト
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    
    // beforeEachで自動リセットされるため手動リセット不要
  });
});