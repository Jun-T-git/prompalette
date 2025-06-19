import React from 'react';

// TODO: 新しいキーボードシステムに対応したKeyboardSettingsを実装する
// 現在は型エラーを回避するため簡素化

interface KeyboardSettingsProps {
  shortcuts?: unknown[];
  hotkeys?: unknown[];
  onShortcutChange?: (shortcut: unknown) => void;
  onHotkeyChange?: (hotkey: unknown) => void;
  onResetToDefaults?: () => void;
  onSaveSettings?: () => void;
}

export const KeyboardSettings: React.FC<KeyboardSettingsProps> = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        キーボード設定
      </h3>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          🚧 新しいキーボードシステムに対応した設定画面を実装予定です。
        </p>
        <p className="text-yellow-700 text-sm mt-2">
          現在はF1キーでヘルプを表示して、利用可能なショートカットを確認できます。
        </p>
      </div>
    </div>
  );
};