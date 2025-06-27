import { invoke } from '@tauri-apps/api/core';
import React, { useState, useEffect } from 'react';

interface HotkeyConfig {
  position: number;
  enabled: boolean;
  modifier1: string;
  modifier2: string;
  key: string;
  conflicts: ConflictInfo[];
}

interface ConflictInfo {
  app_name: string;
  action: string;
  severity: 'Low' | 'Medium' | 'High';
}

interface SecuritySettings {
  require_confirmation_size: number;
  log_hotkey_usage: boolean;
}

export const GlobalHotkeySettingsImproved: React.FC = () => {
  const [hotkeyConfigs, setHotkeyConfigs] = useState<HotkeyConfig[]>([]);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    require_confirmation_size: 1000,
    log_hotkey_usage: false,
  });
  const [testMode, setTestMode] = useState(false);
  const [accessibilityGranted, setAccessibilityGranted] = useState<boolean | null>(null);

  // アクセシビリティ権限チェック
  const checkAccessibility = async () => {
    try {
      const granted = await invoke<boolean>('check_accessibility_permission');
      setAccessibilityGranted(granted);
    } catch (error) {
      console.error('Failed to check accessibility:', error);
      setAccessibilityGranted(false);
    }
  };

  useEffect(() => {
    checkAccessibility();
    loadHotkeyConfigs();
  }, []);

  const loadHotkeyConfigs = async () => {
    try {
      const configs = await invoke<HotkeyConfig[]>('get_hotkey_configs');
      setHotkeyConfigs(configs);
    } catch (error) {
      console.error('Failed to load configs:', error);
    }
  };

  // ホットキーのカスタマイズ
  const updateHotkey = async (position: number, config: Partial<HotkeyConfig>) => {
    try {
      // 衝突チェック
      const conflicts = await invoke<ConflictInfo[]>('check_hotkey_conflicts', {
        hotkey: `${config.modifier1}+${config.modifier2}+${config.key}`,
      });

      if (conflicts.length > 0 && conflicts.some(c => c.severity === 'High')) {
        if (!confirm('このキー組み合わせは他のアプリと競合する可能性があります。続行しますか？')) {
          return;
        }
      }

      await invoke('update_hotkey_config', { position, config });
      await loadHotkeyConfigs();
    } catch (error) {
      console.error('Failed to update hotkey:', error);
    }
  };

  // テストモード
  const toggleTestMode = async () => {
    setTestMode(!testMode);
    if (!testMode) {
      // テストモード開始
      await invoke('start_hotkey_test_mode');
    } else {
      // テストモード終了
      await invoke('stop_hotkey_test_mode');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* アクセシビリティ権限の警告 */}
      {accessibilityGranted === false && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">アクセシビリティ権限が必要です</h3>
              <p className="mt-1 text-sm text-red-700">
                グローバルホットキーを使用するには、システム設定でアクセシビリティ権限を許可してください。
              </p>
              <button
                onClick={() => invoke('open_accessibility_settings')}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                システム設定を開く →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* グローバル設定 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">グローバルホットキー設定</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={globalEnabled}
              onChange={(e) => setGlobalEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">機能を有効化</span>
          </label>
        </div>

        {/* テストモード */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">テストモード</p>
              <p className="text-xs text-blue-700">ホットキーが正しく動作するかテストできます</p>
            </div>
            <button
              onClick={toggleTestMode}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                testMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
              }`}
            >
              {testMode ? 'テスト終了' : 'テスト開始'}
            </button>
          </div>
          {testMode && (
            <p className="mt-2 text-xs text-blue-600">
              ホットキーを押すと、画面に通知が表示されます（実際のペーストは行われません）
            </p>
          )}
        </div>
      </div>

      {/* 個別ホットキー設定 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">パレット位置ごとの設定</h4>
        <div className="space-y-3">
          {[...Array(10)].map((_, index) => {
            const position = index + 1;
            const config = hotkeyConfigs.find(c => c.position === position);
            
            return (
              <div key={position} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                  {position === 10 ? '0' : position}
                </div>
                
                <div className="flex-1 flex items-center space-x-2">
                  <select
                    value={config?.modifier1 || 'CommandOrControl'}
                    onChange={(e) => updateHotkey(position, { modifier1: e.target.value })}
                    className="text-sm border-gray-300 rounded-md"
                    disabled={!globalEnabled}
                  >
                    <option value="CommandOrControl">⌘/Ctrl</option>
                    <option value="Alt">Alt</option>
                    <option value="Shift">Shift</option>
                  </select>
                  
                  <span className="text-gray-500">+</span>
                  
                  <select
                    value={config?.modifier2 || 'Control'}
                    onChange={(e) => updateHotkey(position, { modifier2: e.target.value })}
                    className="text-sm border-gray-300 rounded-md"
                    disabled={!globalEnabled}
                  >
                    <option value="Control">Control</option>
                    <option value="Alt">Alt</option>
                    <option value="Shift">Shift</option>
                    <option value="">なし</option>
                  </select>
                  
                  <span className="text-gray-500">+</span>
                  
                  <input
                    type="text"
                    value={config?.key || (position === 10 ? '0' : position.toString())}
                    onChange={(e) => updateHotkey(position, { key: e.target.value })}
                    className="w-12 text-sm text-center border-gray-300 rounded-md"
                    disabled={!globalEnabled}
                    maxLength={1}
                  />
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config?.enabled ?? true}
                    onChange={(e) => updateHotkey(position, { enabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                    disabled={!globalEnabled}
                  />
                  <span className="ml-2 text-sm text-gray-600">有効</span>
                </label>
                
                {config?.conflicts && config.conflicts.length > 0 && (
                  <div className="text-xs text-red-600" title="競合あり">
                    ⚠️
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* セキュリティ設定 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">セキュリティ設定</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">大きなプロンプトの確認</p>
              <p className="text-xs text-gray-500">指定サイズ以上のプロンプトをペーストする際に確認</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={securitySettings.require_confirmation_size}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  require_confirmation_size: parseInt(e.target.value) || 0
                })}
                className="w-20 text-sm border-gray-300 rounded-md"
                min="0"
                step="100"
              />
              <span className="text-sm text-gray-600">文字</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">使用履歴の記録</p>
              <p className="text-xs text-gray-500">ホットキー使用履歴をログに記録（デバッグ用）</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.log_hotkey_usage}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  log_hotkey_usage: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};