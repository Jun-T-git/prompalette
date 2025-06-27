/*!
 * アプリケーションの状態管理
 * システムトレイとの連携、初回起動時の動作などを管理
 */

use tauri::{AppHandle, Emitter, Manager};
use std::sync::atomic::{AtomicBool, Ordering};

/// アプリケーションの初回起動フラグ
static FIRST_LAUNCH: AtomicBool = AtomicBool::new(true);

/// アプリケーションの初回起動時の処理
pub fn handle_first_launch(app_handle: &AppHandle) {
    if FIRST_LAUNCH.swap(false, Ordering::SeqCst) {
        println!("First launch detected");
        
        // 初回起動時にシステムトレイについての通知を送信
        let _ = app_handle.emit("first-launch", ());
        
        // メインウィンドウを表示（初回はウィンドウを表示）
        if let Some(window) = app_handle.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
            println!("Main window shown on first launch");
        }
    }
}

/// アプリケーションがフォーカスを得た時の処理
#[tauri::command]
pub fn on_app_focus(app_handle: AppHandle) -> Result<(), String> {
    println!("App received focus");
    
    if let Some(window) = app_handle.get_webview_window("main") {
        if !window.is_visible().unwrap_or(false) {
            window.show().map_err(|e| e.to_string())?;
        }
        window.set_focus().map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

/// アプリケーションの現在の状態を取得
#[tauri::command]
pub fn get_app_state(app_handle: AppHandle) -> Result<AppState, String> {
    let main_window_visible = if let Some(window) = app_handle.get_webview_window("main") {
        window.is_visible().unwrap_or(false)
    } else {
        false
    };

    Ok(AppState {
        main_window_visible,
        system_tray_enabled: true, // システムトレイは常に有効
        first_launch: FIRST_LAUNCH.load(Ordering::SeqCst),
    })
}

/// システムトレイの動作について説明するヘルプメッセージを取得
#[tauri::command]
pub fn get_tray_help_message() -> TrayHelpMessage {
    TrayHelpMessage {
        title: "PromPalette is running in the background".to_string(),
        description: "The app has been minimized to the system tray. You can:".to_string(),
        actions: vec![
            "• Click the tray icon to show/hide the window".to_string(),
            "• Right-click the tray icon for menu options".to_string(),
            "• Use global hotkeys to access prompts".to_string(),
            "• Select 'Quit' from the tray menu to exit completely".to_string(),
        ],
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct AppState {
    pub main_window_visible: bool,
    pub system_tray_enabled: bool,
    pub first_launch: bool,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct TrayHelpMessage {
    pub title: String,
    pub description: String,
    pub actions: Vec<String>,
}