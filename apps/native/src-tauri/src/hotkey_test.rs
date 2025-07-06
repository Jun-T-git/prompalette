/*!
 * ホットキーテスト用モジュール
 * 様々なキー組み合わせをテストして動作するものを特定
 */
use tauri::AppHandle;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

#[derive(Debug, serde::Serialize)]
pub struct HotkeyTestError {
    pub error: String,
}

/// テスト用のホットキー組み合わせ
const TEST_HOTKEYS: &[(&str, &str)] = &[
    ("Test1", "CommandOrControl+Control+1"),
    ("Test2", "CommandOrControl+Alt+1"),
    ("Test3", "CommandOrControl+Shift+1"),
    ("Test4", "Command+Control+1"),  // macOS専用
    ("Test5", "Control+Alt+1"),      // Windows/Linux
    ("Test6", "Alt+1"),              // シンプル
    ("Test7", "Control+1"),          // シンプル
    ("Test8", "CommandOrControl+1"), // モディファイアなし
];

/**
 * 様々なホットキー組み合わせをテストして動作するものを特定
 */
#[tauri::command]
pub async fn test_hotkey_combinations(app_handle: AppHandle) -> Result<(), HotkeyTestError> {
    println!("🧪 [TEST] ホットキー組み合わせテスト開始...");
    
    for &(test_name, hotkey) in TEST_HOTKEYS {
        println!("🔬 [TEST] テスト中: {test_name} -> {hotkey}");
        
        match app_handle
            .global_shortcut()
            .on_shortcut(hotkey, {
                let test_name = test_name.to_string();
                let hotkey = hotkey.to_string();
                move |_app_handle, _shortcut, _event| {
                    println!("🎯 [SUCCESS] ホットキー検知成功: {test_name} ({hotkey})");
                }
            }) {
                Ok(()) => {
                    println!("✅ [TEST] 登録成功: {test_name} -> {hotkey}");
                }
                Err(e) => {
                    println!("❌ [TEST] 登録失敗: {test_name} -> {hotkey} (エラー: {e})");
                }
            }
    }
    
    println!("🎉 [TEST] ホットキーテスト完了。各組み合わせを試してください:");
    for &(test_name, hotkey) in TEST_HOTKEYS {
        println!("   {test_name} : {hotkey}");
    }
    
    Ok(())
}

/**
 * テストホットキーを全て解除
 */
#[tauri::command]
pub async fn cleanup_test_hotkeys(app_handle: AppHandle) -> Result<(), HotkeyTestError> {
    println!("🧹 [TEST] テストホットキー解除中...");
    
    for &(test_name, hotkey) in TEST_HOTKEYS {
        match app_handle.global_shortcut().unregister(hotkey) {
            Ok(()) => {
                println!("✅ [TEST] 解除成功: {test_name} -> {hotkey}");
            }
            Err(e) => {
                println!("⚠️ [TEST] 解除エラー: {test_name} -> {hotkey} ({e})");
            }
        }
    }
    
    println!("🎉 [TEST] テストホットキー解除完了");
    Ok(())
}