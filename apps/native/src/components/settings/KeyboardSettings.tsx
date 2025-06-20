import React from 'react';

interface KeyboardSettingsProps {
  // 将来の拡張用インターフェース
}

export const KeyboardSettings: React.FC<KeyboardSettingsProps> = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        キーボードショートカット一覧
      </h3>
      
      <div className="space-y-6">
        {/* 基本操作 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">基本操作</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>新規プロンプト作成</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘N</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span>プロンプト編集</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘E</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span>プロンプト削除</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘D</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span>設定を開く</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘,</kbd>
            </div>
          </div>
        </div>

        {/* ナビゲーション */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">ナビゲーション</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>次のプロンプト</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↓</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span>前のプロンプト</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↑</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span>検索にフォーカス</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘F</kbd>
            </div>
          </div>
        </div>

        {/* アクション */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">アクション</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>プロンプトをコピー&閉じる</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Enter</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span>キャンセル/閉じる</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Esc</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span>ヘルプを表示</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">?</kbd>
            </div>
          </div>
        </div>

        {/* ピン留め */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">ピン留めプロンプト</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>ピン留めプロンプト選択</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘1-9,0</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span>プロンプトをピン留め</span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">⌘⇧1-9,0</kbd>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 ヒント: ショートカットのカスタマイズ機能は今後のアップデートで追加予定です。
          </p>
        </div>
      </div>
    </div>
  );
};