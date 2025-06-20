import { listen } from '@tauri-apps/api/event';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import './App.css';
import { createRealAppStores } from './adapters/RealAppStoreAdapter';
import type { AppSidebarRef } from './components';
import {
  AppContentArea,
  AppSidebarWithRef,
  Button,
  ConfirmModal,
  EnvironmentError,
  HelpModal,
  ToastProvider,
  useToast,
} from './components';
import { KeyboardDebugPanel } from './debug/KeyboardDebugPanel';
import { usePromptSearch } from './hooks';
import { KeyboardProvider, useKeyboard } from './providers/KeyboardProvider';
import { useFavoritesStore, usePromptStore } from './stores';
import type { CreatePromptRequest, Prompt, UpdatePromptRequest } from './types';
import { copyPromptToClipboard, logger } from './utils';

// Component to handle keyboard context switching
const KeyboardContextManager: React.FC<{
  showCreateForm: boolean;
  showEditForm: boolean;
  showHelpModal: boolean;
  showSettings: boolean;
}> = ({ showCreateForm, showEditForm, showHelpModal, showSettings }) => {
  const { pushContext } = useKeyboard();
  
  useEffect(() => {
    if (!showCreateForm && !showEditForm && !showHelpModal && !showSettings) {
      pushContext('list');
    } else if (showCreateForm || showEditForm) {
      pushContext('form');
    } else {
      pushContext('modal');
    }
  }, [showCreateForm, showEditForm, showHelpModal, showSettings, pushContext]);
  
  return null;
};

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
  const { pinnedPrompts, loadPinnedPrompts } = useFavoritesStore();
  
  // ピン留めプロンプトの状態をデバッグ
  useEffect(() => {
    console.log('=== PINNED PROMPTS DEBUG ===');
    console.log('pinnedPrompts state updated:', pinnedPrompts);
    console.log('pinnedPrompts length:', pinnedPrompts.length);
    console.log('pinnedPrompts type:', typeof pinnedPrompts);
    
    const nonNullEntries = pinnedPrompts.filter(p => p !== null);
    console.log('pinnedPrompts non-null entries:', nonNullEntries);
    console.log('Non-null entries count:', nonNullEntries.length);
    
    // 各位置の詳細を表示
    pinnedPrompts.forEach((prompt, index) => {
      console.log(`Array index ${index} (position ${index + 1}):`, prompt ? {
        title: prompt.title,
        id: prompt.id,
        position: prompt.position
      } : 'null');
    });
    
    // 実際のposition値も確認
    nonNullEntries.forEach(prompt => {
      console.log(`Prompt "${prompt.title}" is at array index ${prompt.position - 1}, position:`, prompt.position);
    });
    console.log('=== END DEBUG ===');
  }, [pinnedPrompts]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  // Load prompts and pinned prompts on mount
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadData = async () => {
      try {
        await Promise.all([
          loadPrompts(abortController.signal), 
          loadPinnedPrompts(abortController.signal)
        ]);
      } catch (error) {
        if (isMounted && !abortController.signal.aborted) {
          logger.error('Failed to load data:', error);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [loadPrompts, loadPinnedPrompts]);

  // 初期表示時に検索窓にフォーカス
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sidebarRef.current) {
        sidebarRef.current.focusSearchInput();
      }
    }, 100); // 少し遅延させてDOMがレンダリングされてからフォーカス

    return () => clearTimeout(timer);
  }, []);


  // Filter prompts based on search query (using custom hook for performance)
  const { results: searchResults } = usePromptSearch(prompts, searchQuery);
  
  // Extract prompts from search results for keyboard navigation
  const filteredPrompts = useMemo(() => {
    const results = searchResults?.map(result => result.item) || [];
    console.log('=== FILTERED PROMPTS DEBUG ===');
    console.log('searchQuery:', searchQuery);
    console.log('searchResults:', searchResults);
    console.log('searchResults length:', searchResults?.length || 0);
    console.log('prompts length:', prompts.length);
    console.log('filtered results length:', results.length);
    console.log('=== END FILTERED PROMPTS DEBUG ===');
    return results;
  }, [searchResults, searchQuery, prompts.length]);

  // filteredPromptsの最新値を参照するためのRef
  const filteredPromptsRef = useRef(filteredPrompts);

  // filteredPromptsRefを最新状態に同期
  useEffect(() => {
    filteredPromptsRef.current = filteredPrompts;
  }, [filteredPrompts]);

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

  // ピン留めプロンプト選択ハンドラー
  const handlePinnedPromptSelect = useCallback(
    (prompt: Prompt) => {
      setSelectedPrompt(prompt);
    },
    [setSelectedPrompt],
  );

  // Create stores for new keyboard system
  const keyboardStores = useMemo(() => createRealAppStores(
    setShowCreateForm,
    setShowEditForm,
    setShowHelpModal,
    setShowSettings,
    setSelectedPrompt,
    sidebarRef,
    setSearchQuery,
    searchQuery,
    filteredPrompts,
    selectedPrompt
  ), [searchQuery, filteredPrompts, selectedPrompt]);



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
    const prompt = prompts.find((p) => p.id === id);
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

  // Simple keyboard navigation for compatibility
  const keyboardNav = {
    selectedIndexKeyboard: -1,
    isComposing: false,
    handleKeyDown: () => {},
    setIsComposing: (_value: boolean) => {},
    handlePromptSelectEnter: () => {
      // Enter key handling is now managed by the new KeyboardProvider
      // Do nothing here to avoid conflict
    },
    handlePromptSelect: handlePromptSelect,
    resetSelection: () => {},
  };

  // New keyboard system is handled by KeyboardProvider

  // タグクリック時の検索処理
  const handleTagClick = useCallback((tag: string) => {
    const tagQuery = `#${tag}`;
    setSearchQuery(tagQuery);
    
    // 検索窓にフォーカスを当てる
    setTimeout(() => {
      if (sidebarRef.current) {
        sidebarRef.current.focusSearchInput();
      }
    }, 100);
  }, [setSearchQuery]);

  // クイックアクセスキークリック時の検索処理
  const handleQuickAccessKeyClick = useCallback((key: string) => {
    const quickAccessQuery = `/${key}`;
    setSearchQuery(quickAccessQuery);
    
    // 検索窓にフォーカスを当てる
    setTimeout(() => {
      if (sidebarRef.current) {
        sidebarRef.current.focusSearchInput();
      }
    }, 100);
  }, [setSearchQuery]);


  // 検索クエリが変わったときのみ選択をリセット
  useEffect(() => {
    if (filteredPrompts.length > 0) {
      // 最初のプロンプトを自動選択
      const firstPrompt = filteredPrompts[0];
      if (firstPrompt) {
        setSelectedPrompt(firstPrompt);
      }
    } else if (searchQuery && filteredPrompts.length === 0) {
      // 検索結果なしの場合はプレビューをクリア
      setSelectedPrompt(null);
    }
  }, [searchQuery, filteredPrompts]);

  // 環境エラーがある場合は専用画面を表示
  if (environmentError) {
    return (
      <EnvironmentError
        error={environmentError}
        onRetry={() => {
          setEnvironmentError(null);
          const retryLoadData = async () => {
            try {
              await Promise.all([loadPrompts(), loadPinnedPrompts()]);
            } catch (error) {
              logger.error('Retry load data failed:', error);
              if (
                error instanceof Error &&
                error.message.includes('Tauri environment not available')
              ) {
                setEnvironmentError(error.message);
              }
            }
          };
          retryLoadData();
        }}
      />
    );
  }

  return (
    <KeyboardProvider stores={keyboardStores}>
      <KeyboardContextManager 
        showCreateForm={showCreateForm}
        showEditForm={showEditForm}
        showHelpModal={showHelpModal}
        showSettings={showSettings}
      />
      <div className="app-layout bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 header-compact px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/prompalette_logo_1080_1080.png" alt="PromPalette" className="w-8 h-8" />
            <h1 className="header-title text-xl font-semibold text-gray-900">PromPalette</h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              onClick={() => setShowSettings(true)}
              size="sm"
              variant="ghost"
              className="flex items-center space-x-1 md:space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="hidden md:inline">設定</span>
              <span className="text-[10px] text-gray-300 font-mono ml-1 opacity-60 mobile-hide-text">
                ⌘,
              </span>
            </Button>
            <Button
              onClick={() => setShowCreateForm(true)}
              size="sm"
              className="flex items-center space-x-1 md:space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">新規作成</span>
              <span className="sm:hidden">新規</span>
              <span className="text-[10px] text-gray-300 font-mono ml-1 opacity-60 mobile-hide-text">
                ⌘N
              </span>
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
          prompts={prompts}
          filteredPrompts={filteredPrompts}
          selectedPrompt={selectedPrompt}
          selectedIndexKeyboard={keyboardNav.selectedIndexKeyboard}
          isLoading={isLoading}
          isComposing={keyboardNav.isComposing}
          onSearchFocusChange={() => {}}
          onKeyDown={keyboardNav.handleKeyDown}
          onCompositionStart={() => keyboardNav.setIsComposing(true)}
          onCompositionEnd={() => keyboardNav.setIsComposing(false)}
          onPromptSelectEnter={keyboardNav.handlePromptSelectEnter}
          onPromptSelect={keyboardNav.handlePromptSelect}
          onCopyPrompt={handleCopyPrompt}
          onShowCreateForm={() => setShowCreateForm(true)}
          onPinnedPromptSelect={handlePinnedPromptSelect}
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
          onTagClick={handleTagClick}
          onQuickAccessKeyClick={handleQuickAccessKeyClick}
        />
      </div>

      {/* ショートカットキーガイド */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 flex-wrap">
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">⌘N</kbd>
            <span>新規作成</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Enter</kbd>
            <span>コピー&amp;閉じる</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">⌘,</kbd>
            <span>設定</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Esc</kbd>
            <span>閉じる</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">?</kbd>
            <span>ヘルプ</span>
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

      {/* ヘルプモーダル */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] m-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">設定</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  キーボードショートカットのカスタマイズと設定ができます。
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">主要ショートカット</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>新規プロンプト作成</span>
                        <span className="font-mono">⌘ N</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>プロンプト編集</span>
                        <span className="font-mono">⌘ E</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>プロンプト削除</span>
                        <span className="font-mono">⌘ D</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>検索にフォーカス</span>
                        <span className="font-mono">⌘ F</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>ピン留めプロンプト選択</span>
                        <span className="font-mono">⌘ 1-9,0</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>プロンプトのピン留め</span>
                        <span className="font-mono">⌘ ⇧ 1-9,0</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>設定を開く</span>
                        <span className="font-mono">⌘ ,</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>ヘルプを表示</span>
                        <span className="font-mono">/</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">ナビゲーション</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>次のプロンプト</span>
                        <span className="font-mono">↓</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>前のプロンプト</span>
                        <span className="font-mono">↑</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>プロンプト選択・コピー</span>
                        <span className="font-mono">Enter</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>ウィンドウを閉じる</span>
                        <span className="font-mono">Esc</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">💡 スマートショートカット機能</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• 検索窓にフォーカスがあっても、重要なショートカットは使用可能です</p>
                        <p>• 新規作成（⌘N）、編集（⌘E）、設定（⌘,）、ピン留め選択（⌘1-9,0）は常に有効</p>
                        <p>• テキスト編集と競合するショートカット（⌘D, ⌘C）は自動で無効化</p>
                        <p>• 文字を入力すると自動的に検索が開始されます</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      <KeyboardDebugPanel />
    </KeyboardProvider>
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
