/**
 * 新しいキーボードシステムの使用例
 * 実装方法とベストプラクティスのデモンストレーション
 */

import React, { useState } from 'react';

import { useKeyboardManagerV2, useSimpleKeyboard, useModalKeyboard } from '../../hooks/useKeyboardManagerV2';
import { getShortcutsForUserLevel } from '../../services/keyboard/ShortcutDefinitions';
import type { ShortcutActionMap, UserLevel, ModifierKey, KeyboardContext } from '../../types/keyboard-v2';
import { AccessiblePromptForm } from '../forms/AccessiblePromptForm';
import { KeyboardHelpModal, HelpTrigger } from '../keyboard/KeyboardHelpModal';
import { ShortcutList, ButtonWithShortcut, ShortcutDisplay } from '../keyboard/ShortcutDisplay';

/**
 * 新しいキーボードシステムの使用例
 */
export const KeyboardSystemExample: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<'basic' | 'form' | 'modal' | 'advanced'>('basic');
  const [showHelp, setShowHelp] = useState(false);
  const [userLevel, setUserLevel] = useState<UserLevel>('intermediate');
  const [notifications, setNotifications] = useState<string[]>([]);

  // 通知を追加
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev.slice(-4), message]); // 最新5件のみ保持
  };

  // 基本的なアクション定義
  const basicActions: ShortcutActionMap = {
    showHelp: () => {
      setShowHelp(true);
      addNotification('ヘルプモーダルを開きました');
    },
    openSettings: () => {
      addNotification('設定画面を開きます（デモ）');
    },
    createNewPrompt: () => {
      setSelectedDemo('form');
      addNotification('新規プロンプト作成フォームを開きました');
    },
    closeDialog: () => {
      setSelectedDemo('basic');
      addNotification('ダイアログを閉じました');
    },
    focusSearch: () => {
      addNotification('検索フィールドにフォーカスしました（デモ）');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* ヘッダー */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          新しいキーボードシステム デモ
        </h1>
        <p className="text-lg text-gray-600">
          WCAG 2.1 AA準拠・ユーザビリティ重視の統一キーボード管理システム
        </p>
        
        {/* ユーザーレベル選択 */}
        <div className="flex items-center justify-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            ユーザーレベル:
          </label>
          {(['beginner', 'intermediate', 'advanced'] as UserLevel[]).map(level => (
            <button
              key={level}
              onClick={() => setUserLevel(level)}
              className={`
                px-3 py-1 text-sm rounded-md
                ${level === userLevel 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {level === 'beginner' ? '初心者' : level === 'intermediate' ? '中級者' : '上級者'}
            </button>
          ))}
        </div>
      </div>

      {/* デモ選択 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          デモンストレーション
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DemoCard
            title="基本操作"
            description="グローバルショートカットの基本的な使用例"
            isActive={selectedDemo === 'basic'}
            onClick={() => setSelectedDemo('basic')}
            shortcut={{ key: '1', modifiers: ['primary'] }}
          />
          
          <DemoCard
            title="フォーム編集"
            description="フォーム専用ショートカットとアクセシビリティ"
            isActive={selectedDemo === 'form'}
            onClick={() => setSelectedDemo('form')}
            shortcut={{ key: '2', modifiers: ['primary'] }}
          />
          
          <DemoCard
            title="モーダル"
            description="モーダル専用の制限されたショートカット"
            isActive={selectedDemo === 'modal'}
            onClick={() => setSelectedDemo('modal')}
            shortcut={{ key: '3', modifiers: ['primary'] }}
          />
          
          <DemoCard
            title="上級機能"
            description="コンテキスト管理と統計情報"
            isActive={selectedDemo === 'advanced'}
            onClick={() => setSelectedDemo('advanced')}
            shortcut={{ key: '4', modifiers: ['primary'] }}
          />
        </div>
      </div>

      {/* デモコンテンツ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[400px]">
        {selectedDemo === 'basic' && (
          <BasicDemo 
            actions={basicActions} 
            userLevel={userLevel}
            onNotification={addNotification}
          />
        )}
        
        {selectedDemo === 'form' && (
          <FormDemo 
            userLevel={userLevel}
            onNotification={addNotification}
            onClose={() => setSelectedDemo('basic')}
          />
        )}
        
        {selectedDemo === 'modal' && (
          <ModalDemo 
            onClose={() => setSelectedDemo('basic')}
            onNotification={addNotification}
          />
        )}
        
        {selectedDemo === 'advanced' && (
          <AdvancedDemo 
            userLevel={userLevel}
            onNotification={addNotification}
          />
        )}
      </div>

      {/* 通知エリア */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-40">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg max-w-sm"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-blue-800">{notification}</p>
            </div>
          ))}
        </div>
      )}

      {/* グローバルヘルプ */}
      <div className="fixed bottom-4 right-4 z-30">
        <HelpTrigger onClick={() => setShowHelp(true)} variant="icon" />
      </div>

      {/* ヘルプモーダル */}
      <KeyboardHelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        userLevel={userLevel}
        currentContext="global"
      />
    </div>
  );
};

/**
 * デモカード
 */
interface DemoCardProps {
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  shortcut: { key: string; modifiers: string[] };
}

const DemoCard: React.FC<DemoCardProps> = ({
  title,
  description,
  isActive,
  onClick,
  shortcut
}) => (
  <button
    onClick={onClick}
    className={`
      p-4 rounded-lg border-2 text-left transition-colors
      ${isActive 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 bg-white hover:border-gray-300'
      }
    `}
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <ShortcutDisplay 
        combination={{
          key: shortcut.key,
          modifiers: shortcut.modifiers as ModifierKey[]
        }}
        size="sm"
        variant="minimal"
      />
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </button>
);

/**
 * 基本操作デモ
 */
interface BasicDemoProps {
  actions: ShortcutActionMap;
  userLevel: UserLevel;
  onNotification: (message: string) => void;
}

const BasicDemo: React.FC<BasicDemoProps> = ({ actions, userLevel, onNotification }) => {
  const { isReady, currentContext, announce } = useSimpleKeyboard(actions);

  const shortcuts = getShortcutsForUserLevel(userLevel);

  if (!isReady) {
    return <div>キーボードシステムを初期化中...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          基本操作デモ
        </h3>
        <p className="text-gray-600">
          現在のコンテキスト: <code className="bg-gray-100 px-2 py-1 rounded">{currentContext}</code>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            アクション実行
          </h4>
          <div className="space-y-2">
            <ButtonWithShortcut
              onClick={() => {
                announce('新規プロンプト作成ボタンがクリックされました');
                onNotification('新規プロンプト作成');
              }}
              shortcut={{
                id: 'new',
                priority: 'essential',
                context: 'global',
                combination: { key: 'n', modifiers: ['primary'] },
                action: 'createNewPrompt',
                description: '新規作成',
                ariaLabel: '新しいプロンプトを作成します。ショートカット: Command N',
                userLevel: 'beginner',
                customizable: true
              }}
            >
              新規プロンプト作成
            </ButtonWithShortcut>

            <ButtonWithShortcut
              onClick={() => {
                announce('設定画面を開きます');
                onNotification('設定画面');
              }}
              variant="secondary"
              shortcut={{
                id: 'settings',
                priority: 'essential',
                context: 'global',
                combination: { key: ',', modifiers: ['primary'] },
                action: 'openSettings',
                description: '設定',
                ariaLabel: '設定画面を開きます。ショートカット: Command カンマ',
                userLevel: 'beginner',
                customizable: false
              }}
            >
              設定
            </ButtonWithShortcut>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            利用可能なショートカット ({userLevel})
          </h4>
          <div className="max-h-64 overflow-y-auto">
            <ShortcutList
              shortcuts={shortcuts.slice(0, 6)} // 最初の6個のみ表示
              groupBy="none"
              showDescriptions={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * フォーム編集デモ
 */
interface FormDemoProps {
  userLevel: UserLevel;
  onNotification: (message: string) => void;
  onClose: () => void;
}

const FormDemo: React.FC<FormDemoProps> = ({ userLevel, onNotification, onClose }) => {
  const handleSubmit = async (data: { title?: string }) => {
    onNotification(`プロンプトが作成されました: ${data.title || 'Untitled'}`);
    setTimeout(onClose, 1000); // 1秒後に閉じる
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          フォーム編集デモ
        </h3>
        <p className="text-gray-600">
          フォーム専用のショートカットとアクセシビリティ機能をお試しください
        </p>
      </div>

      <AccessiblePromptForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        userLevel={userLevel}
      />
    </div>
  );
};

/**
 * モーダルデモ
 */
interface ModalDemoProps {
  onClose: () => void;
  onNotification: (message: string) => void;
}

const ModalDemo: React.FC<ModalDemoProps> = ({ onClose, onNotification }) => {
  const { announce } = useModalKeyboard({
    closeDialog: () => {
      announce('モーダルを閉じます');
      onClose();
    },
    confirmAction: () => {
      announce('アクションを実行しました');
      onNotification('モーダル内アクション実行');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          モーダルデモ
        </h3>
        <p className="text-gray-600">
          モーダル内では制限されたショートカットのみが有効です
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">
          モーダルコンテンツ
        </h4>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            このモーダルではフォーカストラップが有効になっており、
            <kbd className="bg-gray-200 px-2 py-1 rounded text-sm">Tab</kbd>キーで
            フォーカスがループします。
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                announce('アクション1を実行しました');
                onNotification('アクション1実行');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              アクション1
            </button>
            
            <button
              onClick={() => {
                announce('アクション2を実行しました');
                onNotification('アクション2実行');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              アクション2
            </button>
            
            <ButtonWithShortcut
              onClick={onClose}
              variant="secondary"
              shortcut={{
                id: 'close',
                priority: 'essential',
                context: 'modal-dialog',
                combination: { key: 'Escape', modifiers: [] },
                action: 'closeDialog',
                description: '閉じる',
                ariaLabel: 'モーダルを閉じます。ショートカット: エスケープ',
                userLevel: 'beginner',
                customizable: false
              }}
            >
              閉じる
            </ButtonWithShortcut>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 上級機能デモ
 */
interface AdvancedDemoProps {
  userLevel: UserLevel;
  onNotification: (message: string) => void;
}

const AdvancedDemo: React.FC<AdvancedDemoProps> = ({ userLevel, onNotification }) => {
  const [contextSwitchCount, setContextSwitchCount] = useState(0);

  const advancedActions: ShortcutActionMap = {
    showHelp: () => onNotification('ヘルプを表示'),
    openSettings: () => onNotification('設定を開く'),
    selectQuickAccess: (_, params) => {
      onNotification(`クイックアクセス ${params?.slot || 'unknown'} を選択`);
    },
    toggleCommandPalette: () => {
      onNotification('コマンドパレットを表示（デモ）');
    }
  };

  const { 
    isReady, 
    currentContext, 
    setContext, 
    executeShortcut,
    getDebugInfo 
  } = useKeyboardManagerV2({
    userLevel,
    context: 'global',
    actions: advancedActions,
    debug: true
  });

  const debugInfo = isReady ? getDebugInfo() : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          上級機能デモ
        </h3>
        <p className="text-gray-600">
          コンテキスト管理、デバッグ情報、統計機能の確認
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* コンテキスト制御 */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            コンテキスト制御
          </h4>
          
          <div className="space-y-2">
            {['global', 'list-navigation', 'form-editing', 'modal-dialog'].map(context => (
              <button
                key={context}
                onClick={() => {
                  setContext(context as KeyboardContext);
                  setContextSwitchCount(prev => prev + 1);
                  onNotification(`コンテキストを ${context} に変更`);
                }}
                className={`
                  block w-full px-3 py-2 text-left text-sm rounded-md
                  ${currentContext === context 
                    ? 'bg-blue-100 border-blue-300 text-blue-900' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }
                  border
                `}
              >
                {context}
                {currentContext === context && (
                  <span className="ml-2 text-blue-600">←現在</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 手動ショートカット実行 */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            手動ショートカット実行
          </h4>
          
          <div className="space-y-2">
            <button
              onClick={() => executeShortcut('global-help')}
              className="block w-full px-3 py-2 text-left text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
            >
              ヘルプを表示 (F1)
            </button>
            
            <button
              onClick={() => executeShortcut('quick-access-1')}
              className="block w-full px-3 py-2 text-left text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
            >
              クイックアクセス1 (⌘1)
            </button>
            
            <button
              onClick={() => executeShortcut('expert-mode')}
              className="block w-full px-3 py-2 text-left text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
            >
              コマンドパレット (⌘K)
            </button>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">
          システム情報
        </h4>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-500">コンテキスト切り替え</dt>
              <dd className="text-gray-900">{contextSwitchCount}回</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">現在のコンテキスト</dt>
              <dd className="text-gray-900">{currentContext}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">ユーザーレベル</dt>
              <dd className="text-gray-900">{userLevel}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">システム状態</dt>
              <dd className="text-gray-900">{isReady ? '準備完了' : '初期化中'}</dd>
            </div>
          </dl>
        </div>

        {debugInfo && typeof debugInfo === 'object' ? (
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              デバッグ情報
            </summary>
            <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  );
};

export default KeyboardSystemExample;