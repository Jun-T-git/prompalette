/**
 * キーボードヘルプモーダル
 * アクセシブルなヘルプ表示とショートカット学習支援
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';

import { useModalKeyboard } from '../../hooks/useKeyboardManagerV2';
import { 
  getShortcutsForUserLevel, 
  getFormEditingShortcuts,
  ESSENTIAL_SHORTCUTS 
} from '../../services/keyboard/ShortcutDefinitions';
import type { UserLevel } from '../../types/keyboard-v2';

import { ShortcutList, ShortcutDisplay } from './ShortcutDisplay';

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel?: UserLevel;
  currentContext?: string;
  className?: string;
}

/**
 * キーボードヘルプモーダル
 */
export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({
  isOpen,
  onClose,
  userLevel = 'intermediate',
  currentContext = 'global',
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'essential' | 'context'>('essential');
  
  // モーダル用キーボード管理
  const { trapFocus, announce } = useModalKeyboard({
    closeDialog: onClose,
    showHelp: onClose // ヘルプモーダル内でヘルプキーを押したら閉じる
  }, {
    trapFocus: true,
    enabled: isOpen
  });

  // ショートカット情報を取得
  const shortcuts = useMemo(() => {
    return {
      all: getShortcutsForUserLevel(userLevel),
      essential: ESSENTIAL_SHORTCUTS,
      context: currentContext === 'form-editing' 
        ? getFormEditingShortcuts(userLevel)
        : getShortcutsForUserLevel(userLevel).filter(s => 
            s.context === currentContext || s.context === 'global'
          )
    };
  }, [userLevel, currentContext]);

  // フォーカストラップの設定
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = trapFocus(modalRef.current);
      
      // モーダルが開いたことをアナウンス
      announce('キーボードショートカットヘルプが開きました。', 'assertive');
      
      return cleanup;
    }
    
    return undefined; // isOpenがfalseの場合は何もクリーンアップしない
  }, [isOpen, trapFocus, announce]);

  // ESCキーでの閉じる動作をアナウンス
  useEffect(() => {
    if (!isOpen) {
      announce('ヘルプモーダルが閉じられました。');
    }
  }, [isOpen, announce]);

  if (!isOpen) {
    return null;
  }

  // タブの定義
  const tabs = [
    { 
      id: 'essential' as const, 
      label: '基本操作', 
      count: shortcuts.essential.length,
      description: '必ず覚えるべき重要なショートカット'
    },
    { 
      id: 'context' as const, 
      label: '現在の画面', 
      count: shortcuts.context.length,
      description: '現在の画面で使用できるショートカット'
    },
    { 
      id: 'all' as const, 
      label: 'すべて', 
      count: shortcuts.all.length,
      description: '利用可能な全てのショートカット'
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-help-title"
      aria-describedby="keyboard-help-description"
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg max-w-4xl w-full max-h-[90vh] m-4 overflow-hidden shadow-xl ${className}`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 
              id="keyboard-help-title" 
              className="text-xl font-semibold text-gray-900"
            >
              キーボードショートカット
            </h2>
            <p 
              id="keyboard-help-description"
              className="text-sm text-gray-600 mt-1"
            >
              効率的な操作のためのショートカット一覧
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="ヘルプを閉じる。ショートカット: エスケープ"
            title="ヘルプを閉じる (Esc)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="ショートカットカテゴリ">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-selected={activeTab === tab.id}
                role="tab"
                aria-controls={`panel-${tab.id}`}
                title={tab.description}
              >
                {tab.label}
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* コンテンツエリア */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {tabs.map(tab => (
            <div
              key={tab.id}
              id={`panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab.id}`}
              className={`p-6 ${activeTab === tab.id ? 'block' : 'hidden'}`}
            >
              {/* タブの説明 */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  {tab.label}について
                </h3>
                <p className="text-sm text-blue-800">
                  {tab.description}
                </p>
                {tab.id === 'essential' && (
                  <p className="text-sm text-blue-700 mt-2">
                    💡 初心者の方は、まずこれらのショートカットから覚えることをお勧めします。
                  </p>
                )}
              </div>

              {/* ショートカットリスト */}
              <ShortcutList
                shortcuts={shortcuts[tab.id]}
                groupBy={tab.id === 'all' ? 'priority' : 'none'}
                showDescriptions={true}
              />

              {/* 特別な注意事項 */}
              {tab.id === 'context' && currentContext === 'form-editing' && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">
                    📝 フォーム編集時の注意
                  </h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• インデント操作は<ShortcutDisplay combination={{ key: ']', modifiers: ['primary'] }} size="sm" />と<ShortcutDisplay combination={{ key: '[', modifiers: ['primary'] }} size="sm" />で行えます</li>
                    <li>• <ShortcutDisplay combination={{ key: 'Tab', modifiers: [] }} size="sm" />と<ShortcutDisplay combination={{ key: 'Tab', modifiers: ['shift'] }} size="sm" />でフィールド間を移動できます</li>
                    <li>• 一部のショートカットは、テキスト編集との競合を避けるため無効化されています</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              ユーザーレベル: <span className="font-medium">{userLevel === 'beginner' ? '初心者' : userLevel === 'intermediate' ? '中級者' : '上級者'}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500">
                <ShortcutDisplay 
                  combination={{ key: 'F1', modifiers: [] }}
                  description="ヘルプを表示"
                  size="sm"
                  variant="minimal"
                />
                でいつでもヘルプを開けます
              </div>
              
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-keyshortcuts="Escape"
              >
                閉じる
                <span className="ml-2 text-xs opacity-75">Esc</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * コンパクトなヘルプトリガー
 */
interface HelpTriggerProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon' | 'text';
  className?: string;
}

export const HelpTrigger: React.FC<HelpTriggerProps> = ({
  onClick,
  size = 'md',
  variant = 'button',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={onClick}
        className={`
          inline-flex items-center justify-center rounded-full
          hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${sizeClasses[size]} ${className}
        `}
        aria-label="キーボードショートカットヘルプを表示。ショートカット: F1"
        title="ヘルプ (F1)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={onClick}
        className={`
          text-blue-600 hover:text-blue-800 underline
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${className}
        `}
        aria-label="キーボードショートカットヘルプを表示。ショートカット: F1"
      >
        ショートカット一覧
      </button>
    );
  }

  // variant === 'button'
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${sizeClasses[size]} ${className}
      `}
      aria-label="キーボードショートカットヘルプを表示。ショートカット: F1"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      ヘルプ
      <span className="ml-2 text-xs opacity-60">F1</span>
    </button>
  );
};