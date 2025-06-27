import { invoke } from '@tauri-apps/api/core';
import React, { useState } from 'react';

export const HotkeyTest: React.FC = () => {
  const [isTestingActive, setIsTestingActive] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const startTest = async () => {
    try {
      setIsTestingActive(true);
      setTestResults(['テスト開始中...']);
      
      await invoke('test_hotkey_combinations');
      setTestResults(prev => [...prev, 'ホットキーテスト登録完了']);
      setTestResults(prev => [...prev, '各組み合わせを試してください:']);
      setTestResults(prev => [...prev, 'Test1: Cmd+Ctrl+1']);
      setTestResults(prev => [...prev, 'Test2: Cmd+Alt+1']);
      setTestResults(prev => [...prev, 'Test3: Cmd+Shift+1']);
      setTestResults(prev => [...prev, 'Test4: Command+Control+1 (macOS)']);
      setTestResults(prev => [...prev, 'Test5: Control+Alt+1 (Win/Linux)']);
      setTestResults(prev => [...prev, 'Test6: Alt+1']);
      setTestResults(prev => [...prev, 'Test7: Control+1']);
      setTestResults(prev => [...prev, 'Test8: Cmd+1']);
      setTestResults(prev => [...prev, '']);
      setTestResults(prev => [...prev, 'ターミナルで動作確認してください']);
      
    } catch (error) {
      setTestResults(prev => [...prev, `エラー: ${error}`]);
    }
  };

  const stopTest = async () => {
    try {
      await invoke('cleanup_test_hotkeys');
      setTestResults(prev => [...prev, 'テストホットキー解除完了']);
      setIsTestingActive(false);
    } catch (error) {
      setTestResults(prev => [...prev, `解除エラー: ${error}`]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 ホットキーテスト</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={startTest}
            disabled={isTestingActive}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            テスト開始
          </button>
          
          <button
            onClick={stopTest}
            disabled={!isTestingActive}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            テスト終了
          </button>
          
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            結果クリア
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
          <p className="font-semibold">🔍 使用方法:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>「テスト開始」ボタンを押す</li>
            <li>各組み合わせのホットキーを試す</li>
            <li>ターミナルで「🎯 [SUCCESS] ホットキー検知成功」を確認</li>
            <li>動作する組み合わせを特定</li>
            <li>「テスト終了」で解除</li>
          </ol>
        </div>
      </div>
    </div>
  );
};