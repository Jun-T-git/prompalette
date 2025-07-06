import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { DownloadButton } from '../DownloadButton';

// Mock fetch
global.fetch = vi.fn();

describe('DownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm for each test
    Object.defineProperty(window, 'confirm', {
      value: vi.fn().mockReturnValue(true),
      writable: true,
    });
    // Mock window.alert
    Object.defineProperty(window, 'alert', {
      value: vi.fn(),
      writable: true,
    });
  });

  it('renders with default props', () => {
    render(<DownloadButton />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('ダウンロード')).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    render(<DownloadButton>カスタムテキスト</DownloadButton>);
    
    expect(screen.getByText('カスタムテキスト')).toBeInTheDocument();
  });

  it('shows loading state during download', async () => {
    const mockOpen = vi.fn().mockReturnValue({}); // Return a valid window object
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' })
    });
    
    Object.defineProperty(window, 'open', { value: mockOpen });
    global.fetch = mockFetch;

    render(<DownloadButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Should show loading state immediately
    expect(screen.getByText('ダウンロード中...')).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(mockOpen).toHaveBeenCalledWith('/api/download?platform=macos', '_blank');
    
    // Wait for loading state to clear
    await waitFor(() => {
      expect(screen.getByText('ダウンロード')).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  it('opens download URL in new tab and performs health check', async () => {
    const mockOpen = vi.fn().mockReturnValue({}); // 正常なウィンドウオブジェクトを返す
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' })
    });
    
    Object.defineProperty(window, 'open', { value: mockOpen });
    global.fetch = mockFetch;

    render(<DownloadButton platform="macos" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    // window.openが呼ばれる
    expect(mockOpen).toHaveBeenCalledWith('/api/download?platform=macos', '_blank');
    
    // ローディング状態が即座に開始される
    expect(screen.getByText('ダウンロード中...')).toBeInTheDocument();
    
    // 健全性チェックが実行される
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/download?platform=macos&check=true');
    });
  });

  it('handles different platforms correctly', () => {
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });

    render(<DownloadButton platform="linux" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockOpen).toHaveBeenCalledWith('/api/download?platform=linux', '_blank');
  });

  it('shows platform warning for non-macOS platforms', () => {
    const mockConfirm = vi.fn().mockReturnValue(true);
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'confirm', { value: mockConfirm });
    Object.defineProperty(window, 'open', { value: mockOpen });

    render(<DownloadButton platform="windows" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockConfirm).toHaveBeenCalledWith(
      '現在、Windows版は開発中です。\nGitHubのReleasesページでmacOS版をダウンロードしますか？'
    );
    expect(mockOpen).toHaveBeenCalledWith('/api/download?platform=windows', '_blank');
  });

  it('does not download when user cancels platform warning', () => {
    const mockConfirm = vi.fn().mockReturnValue(false);
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'confirm', { value: mockConfirm });
    Object.defineProperty(window, 'open', { value: mockOpen });

    render(<DownloadButton platform="linux" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockConfirm).toHaveBeenCalled();
    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('skips platform warning when showPlatformWarning is false', () => {
    const mockConfirm = vi.fn();
    const mockOpen = vi.fn().mockReturnValue({});
    Object.defineProperty(window, 'confirm', { value: mockConfirm });
    Object.defineProperty(window, 'open', { value: mockOpen });

    render(<DownloadButton platform="windows" showPlatformWarning={false} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockOpen).toHaveBeenCalledWith('/api/download?platform=windows', '_blank');
  });

  it('handles popup blocker correctly', async () => {
    const mockOpen = vi.fn().mockReturnValue(null); // ポップアップブロック
    const mockAlert = vi.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });
    Object.defineProperty(window, 'alert', { value: mockAlert });

    render(<DownloadButton platform="macos" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('ポップアップブロッカーが有効です。ダウンロードを許可してください。');
    });
  });

  it('handles health check errors gracefully', async () => {
    const mockOpen = vi.fn().mockReturnValue({});
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'サーバーエラーが発生しました' })
    });
    const mockAlert = vi.fn();
    
    Object.defineProperty(window, 'open', { value: mockOpen });
    Object.defineProperty(window, 'alert', { value: mockAlert });
    global.fetch = mockFetch;

    render(<DownloadButton platform="macos" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('サーバーエラーが発生しました');
    });
  });

  it('handles network errors gracefully', async () => {
    const mockOpen = vi.fn().mockReturnValue({});
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const mockAlert = vi.fn();
    
    Object.defineProperty(window, 'open', { value: mockOpen });
    Object.defineProperty(window, 'alert', { value: mockAlert });
    global.fetch = mockFetch;

    render(<DownloadButton platform="macos" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('ダウンロードに問題が発生しました。しばらくしてから再度お試しください。');
    });
  });
});