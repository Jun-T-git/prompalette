/**
 * グローバルショートカット管理モジュール
 * 
 * `PromPaletteのキーボードショートカット機能を提供`
 * - Ctrl+Shift+P: クイックランチャー表示
 * 
 * パフォーマンス目標:
 * - ホットキー検出から UI表示まで <200ms
 * - 確実な動作保証（全OS対応）
 */
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

use crate::config;

/// エラーレスポンス
#[derive(Debug, serde::Serialize)]
pub struct ShortcutError {
    pub error: String,
}

/**
 * グローバルショートカットを登録
 * 
 * アプリケーション起動時に呼び出され、以下のショートカットを登録:
 * - Ctrl+Shift+P (Cmd+Shift+P on macOS): クイックランチャー表示
 * 
 * @param app Tauriアプリハンドル
 * @returns 登録成功時はOk(()), 失敗時はエラーメッセージ
 */
#[tauri::command]
pub async fn register_global_shortcuts(app: AppHandle) -> Result<(), ShortcutError> {
    // ショートカット登録とイベントハンドラーを同時に設定
    app.global_shortcut()
        .on_shortcut(config::shortcuts::QUICK_LAUNCHER, move |app_handle, _shortcut, _event| {
            // メインウィンドウを表示してフォーカス
            if let Some(window) = app_handle.get_webview_window("main") {
                // ウィンドウを最前面に表示
                if let Err(e) = window.show() {
                    eprintln!("Failed to show window: {e}");
                }
                if let Err(e) = window.set_focus() {
                    eprintln!("Failed to focus window: {e}");
                }
                if let Err(e) = window.unminimize() {
                    eprintln!("Failed to unminimize window: {e}");
                }
                
                // フロントエンドに検索フォーカスイベント送信
                if let Err(e) = app_handle.emit("focus-search", ()) {
                    eprintln!("Failed to emit focus-search event: {e}");
                }
            }
        })
        .map_err(|e| {
            eprintln!("Failed to register global shortcut '{}': {}", config::shortcuts::QUICK_LAUNCHER, e);
            ShortcutError {
                error: format!("ショートカットキー '{}' の登録に失敗しました: {}", config::shortcuts::QUICK_LAUNCHER, e)
            }
        })?;

    Ok(())
}

/**
 * グローバルショートカットの登録解除
 * 
 * アプリケーション終了時やショートカット設定変更時に使用
 * 
 * @param app Tauriアプリハンドル
 * @returns 解除成功時はOk(()), 失敗時はエラーメッセージ
 */
#[tauri::command]
pub async fn unregister_global_shortcuts(app: AppHandle) -> Result<(), ShortcutError> {
    app.global_shortcut()
        .unregister_all()
        .map_err(|e| {
            eprintln!("Failed to unregister global shortcuts: {e}");
            ShortcutError {
                error: format!("ショートカットキーの解除に失敗しました: {e}")
            }
        })?;

    Ok(())
}

/**
 * 登録済みショートカットの確認
 * 
 * デバッグ・診断用途で現在登録されているショートカットを確認
 * 
 * @param app Tauriアプリハンドル  
 * @returns 登録状況の情報
 */
#[tauri::command]
pub async fn get_shortcut_status(_app: AppHandle) -> Result<serde_json::Value, ShortcutError> {
    // 登録状況確認（Tauriプラグインに依存するため簡易実装）
    let status = serde_json::json!({
        "quick_launcher": {
            "shortcut": config::shortcuts::QUICK_LAUNCHER,
            "registered": true // 実際の確認ロジックは将来実装
        }
    });
    
    Ok(status)
}

/**
 * メインウィンドウを隠す
 * 
 * プロンプトコピー後にウィンドウを隠し、前のアプリケーションにフォーカスを戻す
 * 
 * @param app Tauriアプリハンドル
 * @returns 成功時はOk(()), 失敗時はエラーメッセージ
 */
#[tauri::command]
pub async fn hide_main_window(app: AppHandle) -> Result<(), ShortcutError> {
    if let Some(window) = app.get_webview_window("main") {
        // ウィンドウを隠す
        if let Err(e) = window.hide() {
            eprintln!("Failed to hide window: {e}");
            return Err(ShortcutError {
                error: format!("ウィンドウの非表示に失敗しました: {e}")
            });
        }
    }
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_shortcut_constants() {
        // ショートカット文字列の妥当性確認
        assert_eq!(config::shortcuts::QUICK_LAUNCHER, "CommandOrControl+Shift+P");
    }
    
    // 注意: グローバルショートカットの実際のテストは統合テストで実装
    // Tauriアプリコンテキストが必要なため
}