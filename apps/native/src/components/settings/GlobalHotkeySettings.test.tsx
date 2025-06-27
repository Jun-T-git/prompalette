import { invoke } from '@tauri-apps/api/core';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Tauri API のモック - hoisting対応
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { GlobalHotkeySettings } from './GlobalHotkeySettings';

const mockInvoke = vi.mocked(invoke);

describe('GlobalHotkeySettings', () => {
  beforeEach(() => {
    mockInvoke.mockClear();
  });

  it('正常にレンダリングされる', async () => {
    // ホットキー状態のモックデータ
    const mockStatus = {
      palette_hotkeys: {
        '1': { hotkey: 'CommandOrControl+Alt+1', registered: true, position: 1 },
        '2': { hotkey: 'CommandOrControl+Alt+2', registered: true, position: 2 },
      },
      total_hotkeys: 10,
    };

    mockInvoke.mockResolvedValueOnce(mockStatus);

    render(<GlobalHotkeySettings />);

    await waitFor(() => {
      expect(screen.getByText('グローバルホットキー設定')).toBeInTheDocument();
      expect(screen.getByText('🚀 パレット即時ペースト機能')).toBeInTheDocument();
    });
  });

  it('ローディング状態が正しく表示される', () => {
    mockInvoke.mockImplementation(() => new Promise(() => {})); // 永続的なペンディング

    render(<GlobalHotkeySettings />);

    expect(screen.getByText('ホットキー状態を確認中...')).toBeInTheDocument();
    expect(screen.getByText('ホットキー状態を確認中...')).toBeInTheDocument(); // スピナーのテキストで確認
  });

  it('ホットキー状態が正しく表示される', async () => {
    const mockStatus = {
      palette_hotkeys: {
        '1': { hotkey: 'CommandOrControl+Alt+1', registered: true, position: 1 },
        '2': { hotkey: 'CommandOrControl+Alt+2', registered: false, position: 2 },
        '10': { hotkey: 'CommandOrControl+Alt+0', registered: true, position: 10 },
      },
      total_hotkeys: 10,
    };

    mockInvoke.mockResolvedValueOnce(mockStatus);

    render(<GlobalHotkeySettings />);

    await waitFor(() => {
      expect(screen.getByText('パレット位置 1')).toBeInTheDocument();
      expect(screen.getByText('パレット位置 2')).toBeInTheDocument();
      expect(screen.getByText('パレット位置 10')).toBeInTheDocument();
    });

    // ホットキー表示の確認
    expect(screen.getByText('⌘⌃1')).toBeInTheDocument();
    expect(screen.getByText('⌘⌃2')).toBeInTheDocument();
    expect(screen.getByText('⌘⌃0')).toBeInTheDocument();

    // 登録状態の表示確認
    const registeredIndicators = screen.getAllByTitle('登録済み');
    const unregisteredIndicators = screen.getAllByTitle('未登録');
    expect(registeredIndicators).toHaveLength(2); // position 1 と 10
    expect(unregisteredIndicators).toHaveLength(1); // position 2
  });

  it('再登録ボタンが正しく動作する', async () => {
    const mockStatus = {
      palette_hotkeys: {
        '1': { hotkey: 'CommandOrControl+Alt+1', registered: true, position: 1 },
      },
      total_hotkeys: 10,
    };

    // 初回取得、解除、再登録、再取得の順でモック
    mockInvoke
      .mockResolvedValueOnce(mockStatus) // 初回取得
      .mockResolvedValueOnce(undefined) // 解除
      .mockResolvedValueOnce(undefined) // 再登録
      .mockResolvedValueOnce(mockStatus); // 再取得

    render(<GlobalHotkeySettings />);

    await waitFor(() => {
      expect(screen.getByText('パレット位置 1')).toBeInTheDocument();
    });

    const reregisterButton = screen.getByText('再登録');
    fireEvent.click(reregisterButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('unregister_palette_hotkeys');
      expect(mockInvoke).toHaveBeenCalledWith('register_palette_hotkeys');
      expect(mockInvoke).toHaveBeenCalledWith('get_palette_hotkey_status');
    });
  });

  it('エラー状態が正しく表示される', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Test error'));

    render(<GlobalHotkeySettings />);

    await waitFor(() => {
      expect(screen.getByText('ホットキーの状態取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('再登録時のエラーが正しく処理される', async () => {
    const mockStatus = {
      palette_hotkeys: {
        '1': { hotkey: 'CommandOrControl+Alt+1', registered: true, position: 1 },
      },
      total_hotkeys: 10,
    };

    mockInvoke
      .mockResolvedValueOnce(mockStatus) // 初回取得
      .mockRejectedValueOnce(new Error('Reregister error')); // 再登録失敗

    render(<GlobalHotkeySettings />);

    await waitFor(() => {
      expect(screen.getByText('パレット位置 1')).toBeInTheDocument();
    });

    const reregisterButton = screen.getByText('再登録');
    fireEvent.click(reregisterButton);

    await waitFor(() => {
      expect(screen.getByText('ホットキーの再登録に失敗しました')).toBeInTheDocument();
    });
  });

  it('使用方法セクションが表示される', async () => {
    const mockStatus = {
      palette_hotkeys: {},
      total_hotkeys: 0,
    };

    mockInvoke.mockResolvedValueOnce(mockStatus);

    render(<GlobalHotkeySettings />);

    await waitFor(() => {
      expect(screen.getByText('使用方法')).toBeInTheDocument();
      expect(screen.getByText('パレットにプロンプトを保存')).toBeInTheDocument();
      expect(screen.getByText('他のアプリで使用')).toBeInTheDocument();
      expect(screen.getByText('瞬時にペースト')).toBeInTheDocument();
    });
  });

  it('権限に関する注意事項が表示される', async () => {
    const mockStatus = {
      palette_hotkeys: {},
      total_hotkeys: 0,
    };

    mockInvoke.mockResolvedValueOnce(mockStatus);

    render(<GlobalHotkeySettings />);

    await waitFor(() => {
      expect(screen.getByText('⚠️ macOS 権限について')).toBeInTheDocument();
      expect(screen.getByText(/アクセシビリティ権限が必要/)).toBeInTheDocument();
    });
  });
});