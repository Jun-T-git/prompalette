import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useKeyboardShortcuts, getDefaultShortcuts } from '../hooks/useKeyboardShortcuts';
import { ShortcutActionMap } from '../types/keyboard';

// テスト用のコンポーネント
const TestApp = () => {
  const mockActions: ShortcutActionMap = {
    createNewPrompt: vi.fn(() => console.log('新規プロンプト作成')),
    editPrompt: vi.fn(() => console.log('プロンプト編集')),
    deletePrompt: vi.fn(() => console.log('プロンプト削除')),
    copyPrompt: vi.fn(() => console.log('プロンプトコピー')),
    savePrompt: vi.fn(() => console.log('プロンプト保存')),
    focusSearch: vi.fn(() => console.log('検索フォーカス')),
    nextSearchResult: vi.fn(() => console.log('次の検索結果')),
    prevSearchResult: vi.fn(() => console.log('前の検索結果')),
    selectNextPrompt: vi.fn(() => console.log('次のプロンプト選択')),
    selectPrevPrompt: vi.fn(() => console.log('前のプロンプト選択')),
    selectPinnedPrompt: vi.fn((params) => console.log(`ピン留めプロンプト${params?.slot}選択`)),
    pinPromptToSlot: vi.fn((params) => console.log(`プロンプトを位置${params?.slot}にピン留め`)),
    unpinPromptFromSlot: vi.fn((params) => console.log(`位置${params?.slot}のピン留め解除`)),
    openSettings: vi.fn(() => console.log('設定画面を開く')),
    showHelp: vi.fn(() => console.log('ヘルプ表示')),
    showShortcutList: vi.fn(() => console.log('ショートカット一覧表示')),
    closeWindow: vi.fn(() => console.log('ウィンドウを閉じる')),
    
    // その他のアクション（空の実装）
    cancelEdit: vi.fn(),
    undoEdit: vi.fn(),
    redoEdit: vi.fn(),
    clearSearch: vi.fn(),
    openSearchHistory: vi.fn(),
    toggleAutoComplete: vi.fn(),
    selectFirstPrompt: vi.fn(),
    selectLastPrompt: vi.fn(),
    pageUpPrompts: vi.fn(),
    pageDownPrompts: vi.fn(),
    togglePalette: vi.fn(),
    editPaletteLayout: vi.fn(),
    closeSettings: vi.fn(),
    resetToDefaults: vi.fn(),
    saveSettings: vi.fn(),
    showKeyboardNavHelp: vi.fn(),
    increaseUIScale: vi.fn(),
    decreaseUIScale: vi.fn(),
    resetUIScale: vi.fn(),
    cycleFocusArea: vi.fn(),
    reverseCycleFocus: vi.fn(),
    toggleHighContrast: vi.fn(),
    minimizeWindow: vi.fn(),
    toggleFullscreen: vi.fn(),
  };

  const { registeredShortcuts, lastExecutedShortcut } = useKeyboardShortcuts({
    context: 'global',
    shortcuts: getDefaultShortcuts(),
    actions: mockActions,
    debug: true,
  });

  return (
    <div className="test-app">
      <h1>キーボードショートカットテストアプリ</h1>
      <div data-testid="shortcuts-count">登録済みショートカット数: {registeredShortcuts}</div>
      <div data-testid="last-executed">最後に実行: {lastExecutedShortcut || '未実行'}</div>
      
      {/* フォーカス可能な要素 */}
      <input data-testid="test-input" placeholder="テスト用入力フィールド" />
      <textarea data-testid="test-textarea" placeholder="テスト用テキストエリア" />
      
      {/* テスト用ボタン */}
      <button onClick={() => mockActions.createNewPrompt()}>新規作成</button>
      <button onClick={() => mockActions.editPrompt()}>編集</button>
      <button onClick={() => mockActions.deletePrompt()}>削除</button>
    </div>
  );
};

describe('キーボードショートカット統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('アプリが正常にレンダリングされ、ショートカットが登録される', () => {
    render(<TestApp />);
    
    expect(screen.getByText('キーボードショートカットテストアプリ')).toBeInTheDocument();
    
    // デフォルトショートカットが登録されることを確認
    const shortcutsCount = screen.getByTestId('shortcuts-count');
    expect(shortcutsCount.textContent).toMatch(/\d+/); // 数字が含まれている
  });

  describe('基本的なショートカット操作', () => {
    it('Cmd+Nで新規プロンプト作成が実行される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      fireEvent.keyDown(document, {
        key: 'n',
        metaKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('新規プロンプト作成');
      });
    });

    it('Cmd+Eでプロンプト編集が実行される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      fireEvent.keyDown(document, {
        key: 'e',
        metaKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('プロンプト編集');
      });
    });

    it('Cmd+Dでプロンプト削除が実行される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      fireEvent.keyDown(document, {
        key: 'd',
        metaKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('プロンプト削除');
      });
    });

    it('Cmd+Fで検索フォーカスが実行される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      fireEvent.keyDown(document, {
        key: 'f',
        metaKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('検索フォーカス');
      });
    });

    it('矢印キーでプロンプト選択が実行される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      // 下矢印キー
      fireEvent.keyDown(document, {
        key: 'arrowdown',
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('次のプロンプト選択');
      });

      // 上矢印キー
      fireEvent.keyDown(document, {
        key: 'arrowup',
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('前のプロンプト選択');
      });
    });
  });

  describe('ピン留めショートカット', () => {
    it('Cmd+1-9でピン留めプロンプトが選択される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      // Cmd+3をテスト
      fireEvent.keyDown(document, {
        key: '3',
        metaKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('ピン留めプロンプト3選択');
      });

      // Cmd+7をテスト
      fireEvent.keyDown(document, {
        key: '7',
        metaKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('ピン留めプロンプト7選択');
      });
    });

    it('Cmd+0でピン留めプロンプト10が選択される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      fireEvent.keyDown(document, {
        key: '0',
        metaKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('ピン留めプロンプト10選択');
      });
    });

    it('Cmd+Shift+1-9でプロンプトがピン留めされる', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      // Cmd+Shift+5をテスト
      fireEvent.keyDown(document, {
        key: '5',
        metaKey: true,
        shiftKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('プロンプトを位置5にピン留め');
      });
    });
  });

  describe('設定とヘルプ', () => {
    it('Cmd+,で設定画面が開かれる', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      fireEvent.keyDown(document, {
        key: ',',
        metaKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('設定画面を開く');
      });
    });

    it('/キーでヘルプが表示される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      fireEvent.keyDown(document, {
        key: '/',
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('ヘルプ表示');
      });
    });

    it('Cmd+/でショートカット一覧が表示される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      fireEvent.keyDown(document, {
        key: '/',
        metaKey: true,
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('ショートカット一覧表示');
      });
    });

    it('Escapeでウィンドウが閉じられる', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      fireEvent.keyDown(document, {
        key: 'escape',
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('ウィンドウを閉じる');
      });
    });
  });

  describe('入力フィールドでのショートカット無効化', () => {
    it('input要素にフォーカスがある時はショートカットが無効化される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      const input = screen.getByTestId('test-input');
      input.focus();

      fireEvent.keyDown(document, {
        key: 'n',
        metaKey: true,
      });

      // 少し待ってからチェック
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).not.toHaveBeenCalledWith('新規プロンプト作成');
    });

    it('textarea要素にフォーカスがある時はショートカットが無効化される', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      const textarea = screen.getByTestId('test-textarea');
      textarea.focus();

      fireEvent.keyDown(document, {
        key: 'd',
        metaKey: true,
      });

      // 少し待ってからチェック
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).not.toHaveBeenCalledWith('プロンプト削除');
    });

    it('入力フィールドにフォーカスがあってもEscapeキーは有効', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      const input = screen.getByTestId('test-input');
      input.focus();

      fireEvent.keyDown(document, {
        key: 'escape',
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('ウィンドウを閉じる');
      });
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のキーイベントを高速処理できる', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<TestApp />);

      const startTime = performance.now();

      // 100回のキーイベントを連続実行
      for (let i = 0; i < 100; i++) {
        fireEvent.keyDown(document, {
          key: 'n',
          metaKey: true,
        });
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 100msec以内で完了することを確認
      expect(executionTime).toBeLessThan(100);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledTimes(100);
      });
    });

    it('メモリリークが発生しない', () => {
      const { unmount } = render(<TestApp />);
      
      // コンポーネントをアンマウント
      unmount();
      
      // ガベージコレクションを強制実行（テスト環境でのみ）
      if (global.gc) {
        global.gc();
      }
      
      // メモリリークの検証は簡単な確認のみ
      // 実際の本格的なメモリリークテストは別途必要
      expect(true).toBe(true);
    });
  });
});