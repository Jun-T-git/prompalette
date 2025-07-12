import { forwardRef, useImperativeHandle, useRef, useEffect, useCallback } from 'react';

import { DEFAULT_NAVIGATION_CONFIG } from '../../config/navigation';
import type { Prompt } from '../../types';
import { 
  createRapidNavigationDetector, 
  isHTMLElement, 
  isElementInView, 
  scrollElementIntoView 
} from '../../utils/scrollUtils';
import { Button } from '../common';
import { SidebarPromptPalette } from '../favorites';
import { PromptCard } from '../prompt';
import { SearchInput } from '../search';

interface AppSidebarProps {
  /** 検索クエリ */
  searchQuery: string;
  /** 検索クエリ変更ハンドラー */
  onSearchQueryChange: (query: string) => void;
  /** 全プロンプト一覧（空検索状態の分析用） */
  prompts: Prompt[];
  /** フィルタリング済みプロンプト一覧 */
  filteredPrompts: Prompt[];
  /** 選択中のプロンプト */
  selectedPrompt: Prompt | null;
  /** キーボード選択インデックス */
  selectedIndexKeyboard: number;
  /** ローディング状態 */
  isLoading: boolean;
  /** IME変換中状態 */
  isComposing: boolean;
  /** 検索フィールドのフォーカス状態変更ハンドラー */
  onSearchFocusChange: (focused: boolean) => void;
  /** キーボードイベントハンドラー */
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement | HTMLInputElement>) => void;
  /** IME変換開始ハンドラー */
  onCompositionStart: () => void;
  /** IME変換終了ハンドラー */
  onCompositionEnd: () => void;
  /** プロンプト選択Enterハンドラー */
  onPromptSelectEnter: () => void;
  /** プロンプト選択ハンドラー */
  onPromptSelect: (prompt: Prompt, index: number) => void;
  /** プロンプトコピーハンドラー */
  onCopyPrompt: (prompt: Prompt) => Promise<void>;
  /** 新規作成ボタンハンドラー */
  onShowCreateForm: () => void;
  /** ピン留めプロンプト選択ハンドラー */
  onPinnedPromptSelect: (prompt: Prompt) => void;
}

/**
 * アプリケーションのサイドバーコンポーネント
 * 
 * 検索フィールドとプロンプト一覧を含み、以下の機能を提供します：
 * - インテリジェントなキーボードナビゲーション
 * - 適応的スクロール動作（長押し検出とアクセシビリティ対応）
 * - 型安全なDOM操作
 * - エラー耐性のある実装
 * 
 * @param props - AppSidebarProps
 * @returns JSX.Element
 */
export function AppSidebar({
  searchQuery,
  onSearchQueryChange,
  prompts,
  filteredPrompts,
  selectedPrompt,
  selectedIndexKeyboard,
  isLoading,
  isComposing: _isComposing,
  onSearchFocusChange,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  onPromptSelectEnter,
  onPromptSelect,
  onCopyPrompt,
  onShowCreateForm: _onShowCreateForm,
  onPinnedPromptSelect: _onPinnedPromptSelect,
}: AppSidebarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="sidebar" data-testid="sidebar">
      <div className="p-4">
        <SearchInput
          ref={searchInputRef}
          value={searchQuery}
          onChange={onSearchQueryChange}
          placeholder="プロンプトを検索..."
          onFocus={() => onSearchFocusChange(true)}
          onBlur={() => onSearchFocusChange(false)}
          onKeyDown={onKeyDown}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          onPromptSelect={onPromptSelectEnter}
          prompts={prompts}
          enableInlineCompletion={true}
        />
      </div>

      <div className="px-4 pb-4">
        <div className="text-sm text-gray-500 mb-3">{filteredPrompts.length} 件のプロンプト</div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <div className="mt-2 text-sm text-gray-500">読み込み中...</div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? (
              <div>
                <div className="text-sm">検索結果がありません</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchQueryChange('')}
                  className="mt-2 text-xs"
                >
                  検索をクリア
                </Button>
              </div>
            ) : (
              <div>
                <div className="text-sm">プロンプトがありません</div>
                <div className="text-xs mt-1 text-gray-300">⌘+H でヘルプ</div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto prompt-list-scroll"
            data-testid="prompt-list"
          >
            {filteredPrompts.map((prompt, index) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isSelected={
                  selectedPrompt?.id === prompt.id
                    ? true
                    : selectedPrompt === null && index === selectedIndexKeyboard
                }
                onClick={() => onPromptSelect(prompt, index)}
                onCopy={() => onCopyPrompt(prompt)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AppSidebar の参照インターフェース
 * 外部からsearchInputRefにアクセスするためのインターフェース
 */
export type AppSidebarRef = {
  /** 検索フィールドにフォーカスを設定 */
  focusSearchInput: () => void;
  /** 検索フィールドにフォーカスし、テキストを選択 */
  selectSearchInput: () => void;
};

/**
 * forwardRefを使用したAppSidebarコンポーネント
 * 
 * 外部からsearchInputRefにアクセス可能にし、
 * キーボードショートカットなどからの検索フィールド操作を実現します。
 * 
 * @param props - AppSidebarProps
 * @param ref - AppSidebarRef
 * @returns JSX.Element
 */
export const AppSidebarWithRef = forwardRef<AppSidebarRef, AppSidebarProps>(
  function AppSidebarWithRef(
    {
      searchQuery,
      onSearchQueryChange,
      prompts: _prompts,
      filteredPrompts,
      selectedPrompt,
      selectedIndexKeyboard,
      isLoading,
      isComposing: _isComposing,
      onSearchFocusChange,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      onPromptSelectEnter,
      onPromptSelect,
      onCopyPrompt,
      onShowCreateForm: _onShowCreateForm,
      onPinnedPromptSelect,
    },
    ref,
  ) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const promptListRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focusSearchInput: () => {
        searchInputRef.current?.focus();
      },
      selectSearchInput: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      },
    }));

    /**
     * Adaptive scroll function with rapid navigation detection and accessibility support
     * 
     * Features:
     * - Type-safe DOM element handling
     * - Automatic rapid navigation detection
     * - Accessibility (prefers-reduced-motion) support
     * - Robust error handling
     */
    const detectRapidNavigation = useRef(
      createRapidNavigationDetector(DEFAULT_NAVIGATION_CONFIG)
    ).current;
    
    const scrollToSelected = useCallback(() => {
      // Defensive programming: ensure valid state
      if (selectedIndexKeyboard < 0 || !promptListRef.current) {
        return;
      }
      
      // Type-safe element access
      const selectedElement = promptListRef.current.children[selectedIndexKeyboard];
      if (!isHTMLElement(selectedElement)) {
        return;
      }
      
      // Check if element is already in view to avoid unnecessary scrolling
      if (!isElementInView(selectedElement, promptListRef.current)) {
        const isRapidNavigation = detectRapidNavigation();
        scrollElementIntoView(selectedElement, isRapidNavigation, DEFAULT_NAVIGATION_CONFIG);
      }
    }, [selectedIndexKeyboard, detectRapidNavigation]);

    // Auto-scroll to selected item immediately
    useEffect(() => {
      scrollToSelected();
    }, [selectedIndexKeyboard, scrollToSelected]);

    return (
      <div className="sidebar" data-testid="sidebar">
        <div className="p-4">
          <SearchInput
            ref={searchInputRef}
            value={searchQuery}
            onChange={onSearchQueryChange}
            placeholder="プロンプトを検索..."
            onFocus={() => onSearchFocusChange(true)}
            onBlur={() => onSearchFocusChange(false)}
            onKeyDown={onKeyDown}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            onPromptSelect={onPromptSelectEnter}
            prompts={_prompts}
            enableInlineCompletion={true}
          />
        </div>

        {/* ピン留めパレット */}
        <SidebarPromptPalette
          onPromptSelect={onPinnedPromptSelect}
          selectedPrompt={selectedPrompt}
        />

        <div className="px-4 pb-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <div className="mt-2 text-sm text-gray-500">読み込み中...</div>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-3">
                {filteredPrompts.length} 件のプロンプト
              </div>

              {filteredPrompts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-500">検索結果がありません</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSearchQueryChange('')}
                    className="mt-2"
                  >
                    検索をクリア
                  </Button>
                </div>
              ) : (
                <div
                  ref={promptListRef}
                  className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto prompt-list-scroll"
                  data-testid="prompt-list"
                >
                  {filteredPrompts.map((prompt, index) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      isSelected={
                        selectedPrompt?.id === prompt.id
                          ? true
                          : selectedPrompt === null && index === selectedIndexKeyboard
                      }
                      onClick={() => onPromptSelect(prompt, index)}
                      onCopy={() => onCopyPrompt(prompt)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);
