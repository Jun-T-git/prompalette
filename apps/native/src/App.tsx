import { listen } from '@tauri-apps/api/event';
import { useCallback, useEffect, useRef, useState } from 'react';

import './App.css';
import type { AppSidebarRef } from './components';
import {
  AppContentArea,
  AppSidebarWithRef,
  Button,
  ConfirmModal,
  EnvironmentError,
  ToastProvider,
  useToast,
} from './components';
import { useKeyboardNavigation, usePromptSearch } from './hooks';
import { usePromptStore } from './stores';
import type { CreatePromptRequest, Prompt, UpdatePromptRequest } from './types';
import { copyPromptToClipboard, logger } from './utils';

function AppContent() {
  const {
    prompts,
    selectedPrompt,
    searchQuery,
    isLoading,
    error,
    setSelectedPrompt,
    setSearchQuery,
    createPrompt,
    updatePrompt,
    deletePrompt,
    loadPrompts,
  } = usePromptStore();

  const { showToast } = useToast();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [environmentError, setEnvironmentError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    promptId: string | null;
    promptTitle: string;
  }>({
    show: false,
    promptId: null,
    promptTitle: '',
  });
  const sidebarRef = useRef<AppSidebarRef>(null);
  const searchQueryRef = useRef(searchQuery);

  // searchQueryRefを最新状態に同期
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Load prompts on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        await loadPrompts();
      } catch (error) {
        if (isMounted) {
          logger.error('Failed to load prompts:', error);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [loadPrompts]);

  // 初期表示時に検索窓にフォーカス
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sidebarRef.current) {
        sidebarRef.current.focusSearchInput();
      }
    }, 100); // 少し遅延させてDOMがレンダリングされてからフォーカス

    return () => clearTimeout(timer);
  }, []);

  // グローバル文字入力で検索窓にフォーカス
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    // CmdOrCtrl+N で新規作成
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      setShowCreateForm(true);
      return;
    }

    // その他のショートカットキーは除外
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // 特殊キー（ナビゲーション）は除外
    if (
      ['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
        e.key,
      )
    ) {
      return;
    }

    // 既に検索窓にフォーカスがある場合は何もしない
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'INPUT') {
      return;
    }

    // フォーム要素にフォーカスがある場合は何もしない
    if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
      return;
    }

    // 文字入力、数字、バックスペース、削除の場合に検索窓にフォーカス
    if (
      e.key.length === 1 || // 通常の文字入力（英数字、記号、日本語など）
      e.key === 'Backspace' ||
      e.key === 'Delete'
    ) {
      e.preventDefault();

      // 検索窓にフォーカスを移動
      if (sidebarRef.current) {
        sidebarRef.current.focusSearchInput();

        // 文字入力の場合は検索クエリに追加（入力サニタイズ）
        if (e.key.length === 1) {
          // 危険な文字を除外（XSS対策）
          const dangerousChars = /[<>"'&]/;
          if (!dangerousChars.test(e.key)) {
            setSearchQuery(searchQueryRef.current + e.key);
          }
        } else if (e.key === 'Backspace') {
          setSearchQuery(searchQueryRef.current.slice(0, -1));
        }
      }
    }
  }, [sidebarRef, setSearchQuery]);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]); // 依存配列にhandleGlobalKeyDownを追加

  // グローバルショートカットでの検索フォーカス
  useEffect(() => {
    let unlistenFocus: (() => void) | null = null;
    let unlistenShortcutFailed: (() => void) | null = null;

    const setupListeners = async () => {
      try {
        unlistenFocus = await listen<void>('focus-search', () => {
          // refを使用して検索フィールドにフォーカス
          if (sidebarRef.current) {
            sidebarRef.current.selectSearchInput();
          }
          keyboardNav.resetSelection();
        });

        unlistenShortcutFailed = await listen<string>('shortcut-registration-failed', (event) => {
          logger.error('Shortcut registration failed:', event.payload);
          showToast('キーボードショートカットの登録に失敗しました', 'error');
        });
      } catch (error) {
        logger.error('Failed to setup listeners:', error);
      }
    };

    setupListeners();

    return () => {
      if (unlistenFocus) unlistenFocus();
      if (unlistenShortcutFailed) unlistenShortcutFailed();
    };
  }, []);

  // ストアのエラーを監視して環境エラーを検出
  useEffect(() => {
    if (error && error.includes('Tauri environment not available')) {
      setEnvironmentError(error);
    }
  }, [error]);

  // Filter prompts based on search query (using custom hook for performance)
  const filteredPrompts = usePromptSearch(prompts, searchQuery);

  const handleCopyPrompt = useCallback(
    async (prompt: Prompt) => {
      try {
        const result = await copyPromptToClipboard(prompt.content, prompt.id);
        if (result.success) {
          showToast(`「${prompt.title}」をコピーしました`, 'success');
        } else {
          showToast(`コピーに失敗しました: ${result.error}`, 'error');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showToast(`コピーに失敗しました: ${errorMessage}`, 'error');
        logger.error('Failed to copy prompt:', error);
      }
    },
    [showToast],
  );

  const handlePromptSelect = useCallback((prompt: Prompt, _index: number) => {
    setSelectedPrompt(prompt);
  }, []);

  // Keyboard navigation logic
  const keyboardNav = useKeyboardNavigation({
    filteredPrompts,
    onPromptSelect: handlePromptSelect,
    onCopyPrompt: handleCopyPrompt,
  });

  // 型ガード関数（強化版：全フィールドを検証）
  const isUpdateRequest = (
    data: CreatePromptRequest | UpdatePromptRequest,
  ): data is UpdatePromptRequest => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof data.id === 'string' &&
      data.id.length > 0 &&
      'title' in data &&
      typeof data.title === 'string' &&
      'content' in data &&
      typeof data.content === 'string' &&
      'tags' in data &&
      Array.isArray(data.tags)
    );
  };

  const handleCreatePrompt = async (data: CreatePromptRequest | UpdatePromptRequest) => {
    try {
      if (isUpdateRequest(data)) {
        await updatePrompt(data);
      } else {
        await createPrompt(data);
      }
      setShowCreateForm(false);
    } catch (error) {
      logger.error('Failed to create/update prompt:', error);
      showToast('プロンプトの保存に失敗しました', 'error');
    }
  };

  const handleUpdatePrompt = async (data: CreatePromptRequest | UpdatePromptRequest) => {
    try {
      if (isUpdateRequest(data)) {
        await updatePrompt(data);
      } else {
        await createPrompt(data);
      }
      setShowEditForm(false);
      setSelectedPrompt(null);
    } catch (error) {
      logger.error('Failed to update prompt:', error);
      showToast('プロンプトの更新に失敗しました', 'error');
    }
  };

  const handleDeletePrompt = async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      setDeleteConfirm({
        show: true,
        promptId: id,
        promptTitle: prompt.title,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.promptId) {
      try {
        await deletePrompt(deleteConfirm.promptId);
        showToast('プロンプトを削除しました', 'success');
      } catch (error) {
        logger.error('Failed to delete prompt:', error);
        showToast('削除に失敗しました', 'error');
      } finally {
        setDeleteConfirm({
          show: false,
          promptId: null,
          promptTitle: '',
        });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({
      show: false,
      promptId: null,
      promptTitle: '',
    });
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowEditForm(true);
  };


  // フィルター結果・キーボード選択の統合管理（競合状態を防ぐ）
  useEffect(() => {
    keyboardNav.resetSelection();
    
    const index = keyboardNav.selectedIndexKeyboard;
    
    if (filteredPrompts.length > 0) {
      // キーボード選択がある場合はそちらを優先
      if (index >= 0 && index < filteredPrompts.length) {
        const selectedPromptFromKeyboard = filteredPrompts[index];
        if (selectedPromptFromKeyboard !== undefined) {
          setSelectedPrompt(selectedPromptFromKeyboard);
          return;
        }
      }
      
      // キーボード選択がない場合は最初のプロンプトを自動選択
      const firstPrompt = filteredPrompts[0];
      if (firstPrompt) {
        setSelectedPrompt(firstPrompt);
      }
    } else if (searchQuery && filteredPrompts.length === 0) {
      // 検索結果なしの場合はプレビューをクリア
      setSelectedPrompt(null);
    }
  }, [searchQuery, filteredPrompts, keyboardNav.selectedIndexKeyboard, setSelectedPrompt]);

  // 環境エラーがある場合は専用画面を表示
  if (environmentError) {
    return (
      <EnvironmentError
        error={environmentError}
        onRetry={() => {
          setEnvironmentError(null);
          const retryLoadPrompts = async () => {
            try {
              await loadPrompts();
            } catch (error) {
              logger.error('Retry load prompts failed:', error);
              if (error instanceof Error && error.message.includes('Tauri environment not available')) {
                setEnvironmentError(error.message);
              }
            }
          };
          retryLoadPrompts();
        }}
      />
    );
  }

  return (
    <div className="app-layout bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/prompalette_logo_1080_1080.png" alt="PromPalette" className="w-8 h-8" />
            <h1 className="text-xl font-semibold text-gray-900">PromPalette</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowCreateForm(true)}
              size="sm"
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>新規作成</span>
              <span className="text-[10px] text-gray-300 font-mono ml-1 opacity-60">⌘N</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <AppSidebarWithRef
          ref={sidebarRef}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          filteredPrompts={filteredPrompts}
          selectedPrompt={selectedPrompt}
          selectedIndexKeyboard={keyboardNav.selectedIndexKeyboard}
          isLoading={isLoading}
          isComposing={keyboardNav.isComposing}
          onSearchFocusChange={() => {}}
          onKeyDown={keyboardNav.handleKeyDown}
          onCompositionStart={keyboardNav.setIsComposing.bind(null, true)}
          onCompositionEnd={keyboardNav.setIsComposing.bind(null, false)}
          onPromptSelectEnter={keyboardNav.handlePromptSelectEnter}
          onPromptSelect={keyboardNav.handlePromptSelect}
          onCopyPrompt={handleCopyPrompt}
          onDeletePrompt={handleDeletePrompt}
          onShowCreateForm={() => setShowCreateForm(true)}
        />

        {/* Content Area */}
        <AppContentArea
          selectedPrompt={selectedPrompt}
          showCreateForm={showCreateForm}
          showEditForm={showEditForm}
          isLoading={isLoading}
          error={error}
          onCreatePrompt={handleCreatePrompt}
          onUpdatePrompt={handleUpdatePrompt}
          onCopyPrompt={handleCopyPrompt}
          onEditPrompt={handleEditPrompt}
          onDeletePrompt={handleDeletePrompt}
          onShowCreateForm={() => setShowCreateForm(true)}
          onCancelCreateForm={() => setShowCreateForm(false)}
          onCancelEditForm={() => {
            setShowEditForm(false);
            setSelectedPrompt(null);
          }}
        />
      </div>

      {/* ショートカットキーガイド */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">⌘/Ctrl+N</kbd>
            <span>新規作成</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Enter</kbd>
            <span>コピー&amp;閉じる</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Esc</kbd>
            <span>閉じる</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">↑↓</kbd>
            <span>選択</span>
          </div>
        </div>
      </div>

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="プロンプトを削除"
        message={`「${deleteConfirm.promptTitle}」を削除しますか？この操作は取り消せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
