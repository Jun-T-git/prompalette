import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ShortcutConfig, HotkeyConfig } from '../../types/keyboard';

import { KeyboardSettings } from './KeyboardSettings';

// モックデータ
const mockShortcuts: ShortcutConfig[] = [
  {
    id: 'create-new',
    key: 'n',
    modifiers: ['cmd'],
    action: 'createNewPrompt',
    context: 'global',
    description: '新規プロンプト作成',
    customizable: true,
  },
  {
    id: 'edit-prompt',
    key: 'e',
    modifiers: ['cmd'],
    action: 'editPrompt',
    context: 'global',
    description: 'プロンプト編集',
    customizable: true,
  },
  {
    id: 'close-window',
    key: 'escape',
    modifiers: [],
    action: 'closeWindow',
    context: 'global',
    description: 'ウィンドウを閉じる',
    customizable: false,
  },
];

const mockHotkeys: HotkeyConfig[] = [
  {
    id: 'show-app',
    hotkey: 'Cmd+Shift+P',
    action: 'selectPinnedPrompt',
    description: 'アプリを表示',
    customizable: true,
    actionParams: { slot: 1 },
    enabled: true,
  },
  {
    id: 'quick-access-2',
    hotkey: 'Cmd+Shift+2',
    action: 'selectPinnedPrompt',
    description: 'クイックアクセス2',
    customizable: true,
    actionParams: { slot: 2 },
    enabled: true,
  },
];

const mockProps = {
  shortcuts: mockShortcuts,
  hotkeys: mockHotkeys,
  onShortcutChange: vi.fn(),
  onHotkeyChange: vi.fn(),
  onResetToDefaults: vi.fn(),
  onSaveSettings: vi.fn(),
};

describe('KeyboardSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI表示', () => {
    it('ショートカット一覧が正しく表示される', () => {
      render(<KeyboardSettings {...mockProps} />);

      expect(screen.getByText('ショートカットキー設定')).toBeInTheDocument();
      expect(screen.getByText('新規プロンプト作成')).toBeInTheDocument();
      expect(screen.getByText('プロンプト編集')).toBeInTheDocument();
      expect(screen.getByText('ウィンドウを閉じる')).toBeInTheDocument();
    });

    it('グローバルホットキー一覧が正しく表示される', () => {
      render(<KeyboardSettings {...mockProps} />);

      expect(screen.getByText('グローバルホットキー設定')).toBeInTheDocument();
      expect(screen.getByText('アプリを表示')).toBeInTheDocument();
      expect(screen.getByText('クイックアクセス2')).toBeInTheDocument();
    });

    it('ショートカットキーの組み合わせが正しく表示される', () => {
      render(<KeyboardSettings {...mockProps} />);

      // macOS形式で表示される
      expect(screen.getByText('⌘ N')).toBeInTheDocument();
      expect(screen.getByText('⌘ E')).toBeInTheDocument();
      expect(screen.getByText('Esc')).toBeInTheDocument();
    });

    it('カスタマイズ不可のショートカットは編集ボタンが表示されない', () => {
      render(<KeyboardSettings {...mockProps} />);

      // ショートカットセクション内の編集ボタンのみを確認
      const shortcutSection = screen.getByRole('region', { name: 'ショートカットキー設定' });
      const editButtons = shortcutSection.querySelectorAll('button');
      const editButtonTexts = Array.from(editButtons).map(btn => btn.textContent);
      
      // カスタマイズ可能な2つのショートカットのみ編集ボタンがある
      expect(editButtonTexts.filter(text => text === '編集')).toHaveLength(2);
    });
  });

  describe('ショートカット編集', () => {
    it('編集ボタンクリックで編集モードになる', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const editButtons = screen.getAllByText('編集');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('キーを入力してください')).toBeInTheDocument();
        expect(screen.getByText('保存')).toBeInTheDocument();
        expect(screen.getByText('キャンセル')).toBeInTheDocument();
      });
    });

    it('編集モードでキー入力を受け付ける', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const shortcutSection = screen.getByRole('region', { name: 'ショートカットキー設定' });
      const editButtons = shortcutSection.querySelectorAll('button');
      const editButton = Array.from(editButtons).find(btn => btn.textContent === '編集');
      
      fireEvent.click(editButton!);

      await waitFor(() => {
        expect(screen.getByText('キーを入力してください')).toBeInTheDocument();
      });

      // キー入力をシミュレート
      fireEvent.keyDown(document, {
        key: 'j',
        metaKey: true,
      });

      await waitFor(() => {
        // 編集モード内の表示を確認
        const editingArea = screen.getByText('⌘ J').closest('.flex.items-center.gap-2');
        expect(editingArea).toBeInTheDocument();
      });
    });

    it('保存ボタンクリックでショートカットが更新される', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const shortcutSection = screen.getByRole('region', { name: 'ショートカットキー設定' });
      const editButtons = shortcutSection.querySelectorAll('button');
      const editButton = Array.from(editButtons).find(btn => btn.textContent === '編集');
      
      fireEvent.click(editButton!);

      // キー入力
      fireEvent.keyDown(document, {
        key: 'j',
        metaKey: true,
      });

      // 保存ボタンクリック
      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockProps.onShortcutChange).toHaveBeenCalledWith({
          ...mockShortcuts[0],
          key: 'j',
          modifiers: ['cmd'],
        });
      });
    });

    it('キャンセルボタンクリックで編集がキャンセルされる', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const shortcutSection = screen.getByRole('region', { name: 'ショートカットキー設定' });
      const editButtons = shortcutSection.querySelectorAll('button');
      const editButton = Array.from(editButtons).find(btn => btn.textContent === '編集');
      
      fireEvent.click(editButton!);

      // キー入力
      fireEvent.keyDown(document, {
        key: 'j',
        metaKey: true,
      });

      // キャンセルボタンクリック
      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockProps.onShortcutChange).not.toHaveBeenCalled();
        expect(screen.queryByText('キーを入力してください')).not.toBeInTheDocument();
      });
    });
  });

  describe('グローバルホットキー編集', () => {
    it('グローバルホットキーの編集ができる', async () => {
      render(<KeyboardSettings {...mockProps} />);

      // グローバルホットキーセクション内の編集ボタンを探す
      const hotkeySection = screen.getByText('グローバルホットキー設定').closest('section');
      const editButton = hotkeySection?.querySelector('button[aria-label="edit-hotkey"]');
      
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton!);

      await waitFor(() => {
        expect(screen.getByText('新しいホットキーを入力してください')).toBeInTheDocument();
      });
    });

    it('グローバルホットキーの有効/無効を切り替えられる', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const toggles = screen.getAllByRole('switch');
      expect(toggles).toHaveLength(2); // 2つのホットキー

      fireEvent.click(toggles[0]);

      await waitFor(() => {
        expect(mockProps.onHotkeyChange).toHaveBeenCalledWith({
          ...mockHotkeys[0],
          enabled: false,
        });
      });
    });
  });

  describe('競合検出', () => {
    it('既存ショートカットと競合する場合に警告が表示される', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const editButtons = screen.getAllByText('編集');
      fireEvent.click(editButtons[0]);

      // 既存のショートカット（Cmd+E）と同じキーを入力
      fireEvent.keyDown(document, {
        key: 'e',
        metaKey: true,
      });

      await waitFor(() => {
        expect(screen.getByText(/競合しています/)).toBeInTheDocument();
        expect(screen.getByText('保存')).toBeDisabled();
      });
    });

    it('予約済みキーを入力した場合に警告が表示される', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const editButtons = screen.getAllByText('編集');
      fireEvent.click(editButtons[0]);

      // 予約済みキー（Tab）を入力
      fireEvent.keyDown(document, {
        key: 'Tab',
      });

      await waitFor(() => {
        expect(screen.getByText(/予約済みキーです/)).toBeInTheDocument();
        expect(screen.getByText('保存')).toBeDisabled();
      });
    });
  });

  describe('設定のリセット', () => {
    it('デフォルト設定にリセットできる', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const resetButton = screen.getByText('デフォルトに戻す');
      fireEvent.click(resetButton);

      // 確認ダイアログが表示される
      await waitFor(() => {
        expect(screen.getByText('設定をリセットしますか？')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('リセット');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockProps.onResetToDefaults).toHaveBeenCalled();
      });
    });
  });

  describe('設定の保存', () => {
    it('設定を保存できる', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const saveButton = screen.getByText('設定を保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockProps.onSaveSettings).toHaveBeenCalled();
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('キーボードナビゲーションが機能する', () => {
      render(<KeyboardSettings {...mockProps} />);

      const shortcutSection = screen.getByRole('region', { name: 'ショートカットキー設定' });
      const editButtons = shortcutSection.querySelectorAll('button');
      const editButtonElements = Array.from(editButtons).filter(btn => btn.textContent === '編集');
      
      // 最初の編集ボタンにフォーカス
      editButtonElements[0].focus();
      expect(editButtonElements[0]).toHaveFocus();

      // フォーカスが正しく設定されていることを確認
      expect(document.activeElement).toBe(editButtonElements[0]);
    });

    it('適切なARIAラベルが設定されている', () => {
      render(<KeyboardSettings {...mockProps} />);

      expect(screen.getByRole('region', { name: 'ショートカットキー設定' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'グローバルホットキー設定' })).toBeInTheDocument();
    });
  });

  describe('検索とフィルタリング', () => {
    it('ショートカットを検索できる', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('ショートカットを検索...');
      fireEvent.change(searchInput, { target: { value: '新規' } });

      await waitFor(() => {
        expect(screen.getByText('新規プロンプト作成')).toBeInTheDocument();
        expect(screen.queryByText('プロンプト編集')).not.toBeInTheDocument();
      });
    });

    it('カテゴリでフィルタリングできる', async () => {
      render(<KeyboardSettings {...mockProps} />);

      const categoryFilter = screen.getByLabelText('カテゴリ');
      fireEvent.change(categoryFilter, { target: { value: 'カスタマイズ可能' } });

      await waitFor(() => {
        expect(screen.getByText('新規プロンプト作成')).toBeInTheDocument();
        expect(screen.getByText('プロンプト編集')).toBeInTheDocument();
        expect(screen.queryByText('ウィンドウを閉じる')).not.toBeInTheDocument();
      });
    });
  });
});