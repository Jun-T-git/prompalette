/**
 * アクセシブルなプロンプトフォーム
 * 新しいキーボードシステムを使用したフォーム実装
 */

import React, { useState, useRef, useEffect } from 'react';

import { useFormKeyboard } from '../../hooks/useKeyboardManagerV2';
import type { Prompt, CreatePromptRequest, UpdatePromptRequest } from '../../types';
import type { ShortcutActionMap } from '../../types/keyboard-v2';
import { validatePromptTitle, validatePromptContent, validateTags, validateQuickAccessKey, parseTagsString } from '../../utils';
import { ButtonWithShortcut } from '../keyboard/ShortcutDisplay';

interface AccessiblePromptFormProps {
  initialData?: Prompt;
  onSubmit: (data: CreatePromptRequest | UpdatePromptRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * アクセシブルなプロンプトフォーム
 */
export const AccessiblePromptForm: React.FC<AccessiblePromptFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  userLevel = 'intermediate'
}) => {
  // フォームデータ
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    tags: initialData?.tags?.join(', ') || '',
    quickAccessKey: initialData?.quickAccessKey || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // フィールドのref
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const quickAccessKeyRef = useRef<HTMLInputElement>(null);

  // フォーム検証
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const titleError = validatePromptTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const contentError = validatePromptContent(formData.content);
    if (contentError) newErrors.content = contentError;

    const tagsArray = parseTagsString(formData.tags);
    const tagsError = validateTags(tagsArray);
    if (tagsError) newErrors.tags = tagsError;

    const quickAccessKeyError = validateQuickAccessKey(formData.quickAccessKey);
    if (quickAccessKeyError) newErrors.quickAccessKey = quickAccessKeyError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存可能かどうか
  const canSave = Boolean(
    formData.title.trim() && 
    formData.content.trim() && 
    !isLoading &&
    Object.keys(errors).length === 0
  );

  // キーボードアクション定義
  const keyboardActions: ShortcutActionMap = {
    savePrompt: async () => {
      if (canSave) {
        await handleSubmit();
      }
    },
    saveAndClose: async () => {
      if (canSave) {
        await handleSubmit();
      }
    },
    cancelEdit: () => {
      onCancel();
    },
    closeDialog: () => {
      onCancel();
    },
    confirmAction: async () => {
      // フォーカスされている要素に応じて適切なアクションを実行
      const activeElement = document.activeElement;
      if (activeElement?.getAttribute('type') === 'submit') {
        await handleSubmit();
      }
    },
    focusNextField: () => {
      const currentElement = document.activeElement;
      const fields = [titleRef, contentRef, tagsRef, quickAccessKeyRef];
      const currentIndex = fields.findIndex(ref => ref.current === currentElement);
      
      if (currentIndex >= 0 && currentIndex < fields.length - 1) {
        const nextField = fields[currentIndex + 1];
        if (nextField?.current) {
          setFocus(nextField.current, true);
        }
      }
    },
    focusPrevField: () => {
      const currentElement = document.activeElement;
      const fields = [titleRef, contentRef, tagsRef, quickAccessKeyRef];
      const currentIndex = fields.findIndex(ref => ref.current === currentElement);
      
      if (currentIndex > 0) {
        const prevField = fields[currentIndex - 1];
        if (prevField?.current) {
          setFocus(prevField.current, true);
        }
      }
    },
    indentText: () => {
      if (contentRef.current && document.activeElement === contentRef.current) {
        insertTextAtCursor(contentRef.current, '\t');
      }
    },
    unindentText: () => {
      if (contentRef.current && document.activeElement === contentRef.current) {
        removeIndentAtCursor(contentRef.current);
      }
    }
  };

  // フォーム用キーボード管理
  const { setFocus, announce } = useFormKeyboard(keyboardActions, {
    userLevel,
    enabled: true,
    debug: false
  });

  // フォーム送信処理
  const handleSubmit = async () => {
    if (!validateForm()) {
      announce('フォームに入力エラーがあります。エラーを修正してください。', 'assertive');
      return;
    }

    const tagsArray = parseTagsString(formData.tags);

    const submitData: CreatePromptRequest | UpdatePromptRequest = {
      title: formData.title,
      content: formData.content,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      quickAccessKey: formData.quickAccessKey.trim() || undefined,
    };

    if (initialData) {
      (submitData as UpdatePromptRequest).id = initialData.id;
    }

    try {
      await onSubmit(submitData);
      announce(
        initialData ? 'プロンプトが更新されました' : 'プロンプトが作成されました',
        'polite'
      );
    } catch (error) {
      announce('保存に失敗しました。もう一度お試しください。', 'assertive');
    }
  };

  // 入力値変更処理
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);

    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // テキストエリアでのインデント操作
  const insertTextAtCursor = (textarea: HTMLTextAreaElement, text: string) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const newValue = value.substring(0, start) + text + value.substring(end);
    textarea.value = newValue;
    
    // React の状態を更新
    handleInputChange('content', newValue);
    
    // カーソル位置を調整
    const newCursorPos = start + text.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // フォーカスを維持
    textarea.focus();
  };

  const removeIndentAtCursor = (textarea: HTMLTextAreaElement) => {
    const start = textarea.selectionStart;
    const value = textarea.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineText = value.substring(lineStart, start);

    let removedChars = 0;
    let newValue = value;

    if (lineText.startsWith('\t')) {
      newValue = value.substring(0, lineStart) + value.substring(lineStart + 1);
      removedChars = 1;
    } else if (lineText.startsWith('    ')) {
      newValue = value.substring(0, lineStart) + value.substring(lineStart + 4);
      removedChars = 4;
    } else if (lineText.startsWith('  ')) {
      newValue = value.substring(0, lineStart) + value.substring(lineStart + 2);
      removedChars = 2;
    } else if (lineText.startsWith(' ')) {
      newValue = value.substring(0, lineStart) + value.substring(lineStart + 1);
      removedChars = 1;
    }

    if (removedChars > 0) {
      textarea.value = newValue;
      handleInputChange('content', newValue);
      
      const newCursorPos = Math.max(lineStart, start - removedChars);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }
  };

  // 初期フォーカス設定
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialData && contentRef.current) {
        // 編集時はコンテンツフィールドの末尾にフォーカス
        const length = contentRef.current.value.length;
        contentRef.current.setSelectionRange(length, length);
        setFocus(contentRef.current, false);
      } else if (titleRef.current) {
        // 新規作成時はタイトルフィールドにフォーカス
        setFocus(titleRef.current, false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [initialData, setFocus]);

  return (
    <div className="space-y-6">
      {/* フォーム */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} noValidate>
        {/* タイトルフィールド */}
        <div className="space-y-2">
          <label 
            htmlFor="prompt-title"
            className="block text-sm font-medium text-gray-700"
          >
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            ref={titleRef}
            id="prompt-title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="プロンプトのタイトルを入力"
            maxLength={100}
            required
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : 'title-help'}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          />
          {errors.title && (
            <p id="title-error" className="text-sm text-red-600" role="alert">
              {errors.title}
            </p>
          )}
          <p id="title-help" className="text-sm text-gray-500">
            プロンプトを識別するための分かりやすい名前を入力してください
          </p>
        </div>

        {/* コンテンツフィールド */}
        <div className="space-y-2">
          <label 
            htmlFor="prompt-content"
            className="block text-sm font-medium text-gray-700"
          >
            プロンプト内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            ref={contentRef}
            id="prompt-content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="プロンプトの内容を入力"
            rows={8}
            maxLength={10000}
            required
            aria-invalid={!!errors.content}
            aria-describedby={errors.content ? 'content-error' : 'content-help'}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm font-mono
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          />
          {errors.content && (
            <p id="content-error" className="text-sm text-red-600" role="alert">
              {errors.content}
            </p>
          )}
          <div id="content-help" className="text-sm text-gray-500 space-y-1">
            <p>実際に使用するプロンプトの内容を入力してください</p>
            <div className="flex items-center space-x-4 text-xs bg-blue-50 p-2 rounded">
              <span>💡 インデント操作:</span>
              <span>⌘] インデント</span>
              <span>⌘[ 逆インデント</span>
            </div>
          </div>
        </div>

        {/* タグフィールド */}
        <div className="space-y-2">
          <label 
            htmlFor="prompt-tags"
            className="block text-sm font-medium text-gray-700"
          >
            タグ
          </label>
          <input
            ref={tagsRef}
            id="prompt-tags"
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="例: 開発, JavaScript, React, レビュー"
            aria-invalid={!!errors.tags}
            aria-describedby={errors.tags ? 'tags-error' : 'tags-help'}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.tags ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          />
          {errors.tags && (
            <p id="tags-error" className="text-sm text-red-600" role="alert">
              {errors.tags}
            </p>
          )}
          <p id="tags-help" className="text-sm text-gray-500">
            用途・技術・対象などを自由に設定、カンマ区切りで入力（最大10個）
          </p>
        </div>

        {/* クイックアクセスキーフィールド */}
        <div className="space-y-2">
          <label 
            htmlFor="prompt-quick-access"
            className="block text-sm font-medium text-gray-700"
          >
            クイックアクセスキー
          </label>
          <input
            ref={quickAccessKeyRef}
            id="prompt-quick-access"
            type="text"
            value={formData.quickAccessKey}
            onChange={(e) => handleInputChange('quickAccessKey', e.target.value)}
            placeholder="例: rvw, code, test"
            maxLength={20}
            aria-invalid={!!errors.quickAccessKey}
            aria-describedby={errors.quickAccessKey ? 'quick-access-error' : 'quick-access-help'}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.quickAccessKey ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          />
          {errors.quickAccessKey && (
            <p id="quick-access-error" className="text-sm text-red-600" role="alert">
              {errors.quickAccessKey}
            </p>
          )}
          <p id="quick-access-help" className="text-sm text-gray-500">
            検索で一意特定するためのキー。/rvw のように検索可能（英数字のみ、2-20文字）
          </p>
        </div>

        {/* ボタンエリア */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <ButtonWithShortcut
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            shortcut={{
              id: 'cancel',
              priority: 'essential',
              context: 'form-editing',
              combination: { key: 'Escape', modifiers: [] },
              action: 'cancelEdit',
              description: 'キャンセル',
              ariaLabel: '編集をキャンセルしてフォームを閉じます。ショートカット: エスケープ',
              userLevel: 'beginner',
              customizable: false
            }}
            showHint={true}
          >
            キャンセル
          </ButtonWithShortcut>
          
          <ButtonWithShortcut
            type="submit"
            variant="primary"
            disabled={!canSave}
            shortcut={{
              id: 'save',
              priority: 'essential',
              context: 'form-editing',
              combination: { key: 's', modifiers: ['primary'] },
              action: 'savePrompt',
              description: initialData ? '更新' : '作成',
              ariaLabel: `プロンプトを${initialData ? '更新' : '作成'}します。ショートカット: Command S`,
              userLevel: 'beginner',
              customizable: false
            }}
            showHint={true}
          >
            {isLoading ? '保存中...' : (initialData ? '更新' : '作成')}
          </ButtonWithShortcut>
        </div>
      </form>

      {/* 未保存の変更警告 */}
      {isDirty && (
        <div 
          className="fixed bottom-4 right-4 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-amber-800">
              未保存の変更があります
            </span>
          </div>
        </div>
      )}
    </div>
  );
};