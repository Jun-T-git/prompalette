import type { ContextId } from '../types/keyboard.types';

/**
 * UI状態からキーボードコンテキストを導出する純粋関数
 * Single Source of Truth: UI状態が唯一の真実
 */
export const getKeyboardContextFromUI = (uiState: {
  showCreateForm: boolean;
  showEditForm: boolean;
  showHelpModal: boolean;
  showSettings: boolean;
}): ContextId => {
  const { showCreateForm, showEditForm, showHelpModal, showSettings } = uiState;
  
  // フォーム系が開いている場合
  if (showCreateForm || showEditForm) {
    return 'form';
  }
  
  // モーダル系が開いている場合
  if (showHelpModal || showSettings) {
    return 'modal';
  }
  
  // デフォルトはリストコンテキスト
  return 'list';
};

/**
 * 実際のUI状態オブジェクトからコンテキストを取得
 */
export interface UIState {
  showCreateForm: boolean;
  showEditForm: boolean;
  showHelpModal: boolean;
  showSettings: boolean;
}

/**
 * デバッグ用：コンテキスト変更をログ出力（開発時のみ）
 */
export const logContextChange = (
  previousContext: ContextId | null,
  newContext: ContextId,
  uiState: UIState
) => {
  if (process.env.NODE_ENV === 'development' && previousContext !== newContext) {
    console.log('🔧 Context derived from UI state:', {
      from: previousContext,
      to: newContext,
      uiState,
      timestamp: Date.now()
    });
  }
};