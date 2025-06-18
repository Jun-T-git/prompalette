import { useState } from 'react';

import { getPaletteColor } from '../../constants/palette';
import { useFavoritesStore } from '../../stores';
import type { CreatePromptRequest, Prompt, UpdatePromptRequest } from '../../types';
import { ConfirmModal, PaletteDropdown, useToast } from '../common';
import { PromptForm } from '../prompt';

interface AppContentAreaProps {
  /** 選択中のプロンプト */
  selectedPrompt: Prompt | null;
  /** 新規作成フォーム表示状態 */
  showCreateForm: boolean;
  /** 編集フォーム表示状態 */
  showEditForm: boolean;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー状態 */
  error: string | null;
  /** プロンプト作成ハンドラー */
  onCreatePrompt: (data: CreatePromptRequest | UpdatePromptRequest) => Promise<void>;
  /** プロンプト更新ハンドラー */
  onUpdatePrompt: (data: CreatePromptRequest | UpdatePromptRequest) => Promise<void>;
  /** プロンプトコピーハンドラー */
  onCopyPrompt: (prompt: Prompt) => Promise<void>;
  /** プロンプト編集ハンドラー */
  onEditPrompt: (prompt: Prompt) => void;
  /** プロンプト削除ハンドラー */
  onDeletePrompt: (id: string) => Promise<void>;
  /** 新規作成フォーム表示ハンドラー */
  onShowCreateForm: () => void;
  /** 新規作成フォームキャンセルハンドラー */
  onCancelCreateForm: () => void;
  /** 編集フォームキャンセルハンドラー */
  onCancelEditForm: () => void;
  /** タグクリック時の検索ハンドラー */
  onTagClick?: (tag: string) => void;
  /** クイックアクセスキークリック時の検索ハンドラー */
  onQuickAccessKeyClick?: (key: string) => void;
}

/**
 * アプリケーションのコンテンツエリアコンポーネント
 * プロンプトの詳細表示、作成・編集フォームを含む
 */
export function AppContentArea({
  selectedPrompt,
  showCreateForm,
  showEditForm,
  isLoading,
  error,
  onCreatePrompt,
  onUpdatePrompt,
  onCopyPrompt,
  onEditPrompt,
  onDeletePrompt,
  onShowCreateForm,
  onCancelCreateForm,
  onCancelEditForm,
  onTagClick,
  onQuickAccessKeyClick,
}: AppContentAreaProps) {
  const {
    pinnedPrompts,
    unpinPrompt,
    swapOrReplacePinnedPrompt,
    isLoading: isPinLoading,
  } = useFavoritesStore();
  const { showToast } = useToast();
  const [isPinDropdownOpen, setIsPinDropdownOpen] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState<{
    show: boolean;
    position: number;
    targetPromptTitle: string;
  }>({
    show: false,
    position: 0,
    targetPromptTitle: '',
  });

  // 現在のプロンプトがピン留めされているかチェック
  const currentPinnedPosition = selectedPrompt
    ? pinnedPrompts.findIndex((pinnedPrompt) => pinnedPrompt?.id === selectedPrompt.id)
    : -1;
  const isPinned = currentPinnedPosition !== -1;
  const pinnedPosition = isPinned ? currentPinnedPosition + 1 : null;
  const paletteColor = pinnedPosition ? getPaletteColor(pinnedPosition) : null;

  /**
   * ピン留め処理（入れ替え/置き換えにも対応）
   */
  const handlePin = async (position: number) => {
    if (!selectedPrompt) return;

    const targetPrompt = pinnedPrompts[position - 1];

    // 上書きが必要な場合は確認ダイアログを表示
    if (targetPrompt && targetPrompt.id !== selectedPrompt.id) {
      setConfirmOverwrite({
        show: true,
        position,
        targetPromptTitle: targetPrompt.title,
      });
      return;
    }

    // 確認不要な場合は直接実行
    try {
      await executePinOperation(position);
    } catch (error) {
      showToast('ピン留めに失敗しました', 'error');
    }
  };

  /**
   * 実際のピン留め操作を実行
   */
  const executePinOperation = async (position: number) => {
    if (!selectedPrompt) {
      throw new Error('No prompt selected');
    }

    const success = await swapOrReplacePinnedPrompt(selectedPrompt.id, position);

    if (success) {
      const targetPrompt = pinnedPrompts[position - 1];
      if (targetPrompt && targetPrompt.id !== selectedPrompt.id) {
        if (isPinned) {
          showToast(
            `プロンプトの位置を ${pinnedPosition} から ${position} に移動しました`,
            'success',
          );
        } else {
          showToast(
            `プロンプトを位置 ${position} にピン留めしました（${targetPrompt.title} を置き換え）`,
            'success',
          );
        }
      } else {
        showToast(`プロンプトを位置 ${position} にピン留めしました`, 'success');
      }
    } else {
      throw new Error('Pin operation failed');
    }
  };

  /**
   * 上書き確認ダイアログの処理
   */
  const handleConfirmOverwrite = async () => {
    try {
      await executePinOperation(confirmOverwrite.position);
      // 成功時のみダイアログを閉じる
      setConfirmOverwrite({ show: false, position: 0, targetPromptTitle: '' });
    } catch (error) {
      // エラー時はダイアログを開いたままにして再試行を可能にする
      showToast('ピン留めに失敗しました', 'error');
    }
  };

  const handleCancelOverwrite = () => {
    setConfirmOverwrite({ show: false, position: 0, targetPromptTitle: '' });
  };

  /**
   * ピン留め解除処理
   */
  const handleUnpin = async () => {
    if (!isPinned || pinnedPosition === null) return;

    try {
      const success = await unpinPrompt({ position: pinnedPosition });

      if (success) {
        showToast(`プロンプトのピン留めを解除しました`, 'success');
      } else {
        showToast('ピン留め解除に失敗しました', 'error');
      }
    } catch (error) {
      showToast('ピン留め解除に失敗しました', 'error');
    }
  };

  return (
    <div className="content-area bg-white">
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {showCreateForm ? (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">新規プロンプト作成</h2>
          <PromptForm
            onSubmit={onCreatePrompt}
            onCancel={onCancelCreateForm}
            isLoading={isLoading}
          />
        </div>
      ) : showEditForm && selectedPrompt ? (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">プロンプト編集</h2>
          <PromptForm
            initialData={selectedPrompt}
            onSubmit={onUpdatePrompt}
            onCancel={onCancelEditForm}
            isLoading={isLoading}
          />
        </div>
      ) : selectedPrompt ? (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-none p-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-gray-900 truncate mb-1">
                  {selectedPrompt.title}
                </h2>

                {/* クイックアクセスキー */}
                {selectedPrompt.quickAccessKey && (
                  <div className="mb-2">
                    <button
                      onClick={() => onQuickAccessKeyClick?.(selectedPrompt.quickAccessKey!)}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                      title={`"/${selectedPrompt.quickAccessKey}" で検索`}
                    >
                      /{selectedPrompt.quickAccessKey}
                    </button>
                  </div>
                )}

                {/* タグ */}
                {Array.isArray(selectedPrompt.tags) && selectedPrompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedPrompt.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagClick?.(tag)}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 transition-colors cursor-pointer"
                        title={`"#${tag}" で検索`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons - アイコンのみ */}
              <div className="flex-none flex items-center gap-1">
                {/* ピン留めボタン */}
                <PaletteDropdown
                  trigger={
                    <button
                      className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                        isPinLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isPinLoading}
                      title={isPinned ? `ピン留め済み (位置 ${pinnedPosition})` : 'ピン留め'}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={isPinned && paletteColor ? paletteColor.fill : 'none'}
                        stroke={isPinned && paletteColor ? paletteColor.fill : 'currentColor'}
                        viewBox="0 0 24 24"
                        style={{
                          color: isPinned && paletteColor ? paletteColor.fill : '#6b7280',
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  }
                  pinnedPrompts={pinnedPrompts}
                  currentPromptId={selectedPrompt?.id}
                  onSelectPosition={handlePin}
                  onUnpin={handleUnpin}
                  isOpen={isPinDropdownOpen}
                  onToggle={setIsPinDropdownOpen}
                  disabled={isPinLoading}
                  currentPosition={pinnedPosition}
                />

                {/* コピーボタン */}
                <button
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => onCopyPrompt(selectedPrompt)}
                  title="コピー"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                {/* 編集ボタン */}
                <button
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => onEditPrompt(selectedPrompt)}
                  title="編集"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                {/* 削除ボタン */}
                <button
                  className="p-2 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => onDeletePrompt(selectedPrompt.id)}
                  title="削除"
                >
                  <svg
                    className="w-4 h-4 text-gray-600 hover:text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              {selectedPrompt.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">プロンプトを選択</h3>
            <p className="text-sm text-gray-500 mb-6">
              左側のリストからプロンプトを選択して内容を表示
            </p>
            <button
              onClick={onShowCreateForm}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新しいプロンプトを作成
            </button>
          </div>
        </div>
      )}

      {/* パレット上書き確認ダイアログ */}
      <ConfirmModal
        isOpen={confirmOverwrite.show}
        onConfirm={handleConfirmOverwrite}
        onCancel={handleCancelOverwrite}
        title="パレット上書き確認"
        message={`位置 ${confirmOverwrite.position} の「${confirmOverwrite.targetPromptTitle}」を上書きしますか？`}
        confirmText="上書きする"
        cancelText="キャンセル"
        confirmVariant="danger"
      />
    </div>
  );
}
