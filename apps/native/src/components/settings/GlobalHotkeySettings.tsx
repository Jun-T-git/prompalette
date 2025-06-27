import { invoke } from '@tauri-apps/api/core';
import React, { useState, useEffect } from 'react';

interface GlobalHotkeyStatus {
  palette_hotkeys: Record<string, {
    hotkey: string;
    registered: boolean;
    position: number;
  }>;
  total_hotkeys: number;
}

interface GlobalHotkeySettingsProps {
  // 将来の拡張用
}

export const GlobalHotkeySettings: React.FC<GlobalHotkeySettingsProps> = () => {
  const [hotkeyStatus, setHotkeyStatus] = useState<GlobalHotkeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ホットキー状態を取得
  const fetchHotkeyStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await invoke<GlobalHotkeyStatus>('get_palette_hotkey_status');
      setHotkeyStatus(status);
    } catch (err) {
      console.error('Failed to fetch hotkey status:', err);
      setError('ホットキーの状態取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ホットキーを再登録
  const reregisterHotkeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 一度解除してから再登録
      await invoke('unregister_palette_hotkeys');
      await invoke('register_palette_hotkeys');
      
      // 状態を再取得
      await fetchHotkeyStatus();
    } catch (err) {
      console.error('Failed to reregister hotkeys:', err);
      setError('ホットキーの再登録に失敗しました');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotkeyStatus();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">ホットキー状態を確認中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">グローバルホットキー設定</h3>
        <button
          onClick={reregisterHotkeys}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          再登録
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* パレット即時ペースト機能の説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">🚀 パレット即時ペースト機能</h4>
          <p className="text-sm text-blue-800 mb-2">
            どのアプリでも <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">⌘⌃数字</kbd> を押すだけで、
            パレットに保存されたプロンプトを即座にペーストできます。
          </p>
          <p className="text-xs text-blue-600">
            例：Safari で文章を書いている時、⌘⌃1 を押すとパレット位置1のプロンプトがその場でペーストされます。
          </p>
        </div>

        {/* ホットキー一覧 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">登録済みホットキー</h4>
          
          {hotkeyStatus ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(hotkeyStatus.palette_hotkeys)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([position, info]) => (
                    <div
                      key={position}
                      className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded text-xs font-semibold flex items-center justify-center">
                          {position === '10' ? '0' : position}
                        </div>
                        <span className="text-sm text-gray-700">
                          パレット位置 {position}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                          {info.hotkey.replace('CommandOrControl+Alt+', '⌘⌃')}
                        </kbd>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            info.registered ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          title={info.registered ? '登録済み' : '未登録'}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="mt-3 text-xs text-gray-600 text-center">
                合計 {hotkeyStatus.total_hotkeys} 個のホットキーが設定されています
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              ホットキー情報を取得できませんでした
            </div>
          )}
        </div>

        {/* 権限に関する注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ macOS 権限について</h4>
          <p className="text-sm text-yellow-800 mb-2">
            グローバルホットキーが動作しない場合、macOS のアクセシビリティ権限が必要です。
          </p>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>1. システム設定 → プライバシーとセキュリティ → アクセシビリティ</p>
            <p>2. PromPalette を許可リストに追加</p>
            <p>3. アプリを再起動</p>
          </div>
        </div>

        {/* 使用方法 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">使用方法</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold flex items-center justify-center">1</div>
              <div>
                <p className="text-sm font-medium text-gray-900">パレットにプロンプトを保存</p>
                <p className="text-xs text-gray-600">アプリ内でプロンプトを作成し、パレット位置1-10に保存します</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold flex items-center justify-center">2</div>
              <div>
                <p className="text-sm font-medium text-gray-900">他のアプリで使用</p>
                <p className="text-xs text-gray-600">Safari、VSCode、Slackなど、どのアプリでも ⌘⌃数字 でペースト</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold flex items-center justify-center">3</div>
              <div>
                <p className="text-sm font-medium text-gray-900">瞬時にペースト</p>
                <p className="text-xs text-gray-600">アプリ切り替え不要で、200ms以内に高速ペーストされます</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};