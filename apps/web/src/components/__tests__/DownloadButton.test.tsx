import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { DownloadButton } from '../DownloadButton';

// Mock fetch
global.fetch = vi.fn();

describe('DownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    // Mock successful redirect response
    (global.fetch as any).mockResolvedValueOnce({
      status: 302,
      redirected: true,
      url: 'https://example.com/download.dmg',
    });

    render(<DownloadButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Should show loading state
    expect(screen.getByText('ダウンロード中...')).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByText('ダウンロード')).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it('handles redirect response (302)', async () => {
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });

    (global.fetch as any).mockResolvedValueOnce({
      status: 302,
      redirected: true,
      url: 'https://github.com/test/download.dmg',
    });

    render(<DownloadButton platform="macos" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/download?platform=macos');
      expect(mockOpen).toHaveBeenCalledWith('https://github.com/test/download.dmg', '_blank');
    });
  });

  it('handles pending response (202)', async () => {
    const mockOpen = vi.fn();
    const mockAlert = vi.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });
    Object.defineProperty(window, 'alert', { value: mockAlert });

    (global.fetch as any).mockResolvedValueOnce({
      status: 202,
      json: async () => ({
        message: 'ダウンロードファイルを準備中です。',
        github_url: 'https://github.com/test/releases',
      }),
    });

    render(<DownloadButton />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('ダウンロードファイルを準備中です。');
      expect(mockOpen).toHaveBeenCalledWith('https://github.com/test/releases', '_blank');
    });
  });

  it('handles error response', async () => {
    const mockAlert = vi.fn();
    Object.defineProperty(window, 'alert', { value: mockAlert });

    (global.fetch as any).mockResolvedValueOnce({
      status: 404,
      ok: false,
      json: async () => ({
        error: 'Platform not supported',
      }),
    });

    render(<DownloadButton />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('ダウンロードに失敗しました。後でもう一度お試しください。');
    });
  });

  it('handles network error', async () => {
    const mockAlert = vi.fn();
    Object.defineProperty(window, 'alert', { value: mockAlert });

    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<DownloadButton />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('ダウンロードエラーが発生しました。ネットワーク接続を確認してください。');
    });
  });
});