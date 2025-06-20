import { useEffect, useRef } from 'react';

import { Button } from './Button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutItem[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    title: '検索機能',
    shortcuts: [
      { key: '/key', description: 'クイックアクセスキーで検索' },
      { key: '#tag', description: 'タグで検索' },
      { key: '複数条件', description: 'スペース区切りでAND検索' },
    ],
  },
  {
    title: 'プロンプト作成',
    shortcuts: [
      { key: '⌘/Ctrl + N', description: '新規プロンプト作成' },
    ],
  },
  {
    title: 'プロンプト選択',
    shortcuts: [
      { key: '⌘/Ctrl + 1-9', description: 'ピン留めプロンプト選択' },
      { key: '⌘/Ctrl + 0', description: 'ピン留めプロンプト選択 (位置10)' },
    ],
  },
  {
    title: 'ナビゲーション',
    shortcuts: [
      { key: '↑ / ↓', description: 'プロンプト選択移動' },
      { key: '文字入力', description: '検索窓にフォーカス' },
    ],
  },
  {
    title: 'アクション',
    shortcuts: [
      { key: 'Enter', description: 'プロンプトコピー&閉じる' },
      { key: 'Esc', description: '閉じる/選択解除' },
    ],
  },
  {
    title: 'その他',
    shortcuts: [
      { key: '?', description: 'このヘルプを表示' },
    ],
  },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);


  // モーダルが開いたときにフォーカスを設定
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  // キーボードイベントの処理
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // フォーカストラップの実装
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab: 最初の要素にフォーカスがある場合は最後の要素へ
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: 最後の要素にフォーカスがある場合は最初の要素へ
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      data-testid="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        aria-describedby="help-modal-description"
        tabIndex={-1}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto focus:outline-none"
        data-testid="help-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="help-modal-title" className="text-xl font-semibold text-gray-900">
            キーボードショートカット
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
            aria-label="閉じる"
            data-testid="header-close-button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div id="help-modal-description" className="p-6">
          <p className="text-gray-600 mb-6">
            PromPaletteで利用可能なキーボードショートカットの一覧です。
          </p>

          <div className="space-y-6">
            {shortcutCategories.map((category) => (
              <div key={category.title}>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {category.title}
                </h3>
                <div className="grid gap-3">
                  {category.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                    >
                      <span className="text-gray-700">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono text-gray-800 shadow-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">ヒント</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• ほとんどのショートカットは、フォーム入力中でも使用できます</li>
              <li>• 文字を入力すると自動的に検索窓にフォーカスが移動します</li>
              <li>• プロンプトをピン留めして数字キーで素早くアクセスできます</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="primary" data-testid="footer-close-button">
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}