/*!
 * システムトレイ（メニューバー）の実装
 * Alfred/Clipyライクなバックグラウンド動作を提供
 */

use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    menu::{Menu, MenuItem},
    AppHandle, Manager, Emitter,
};

/// システムトレイアイコンとメニューを初期化
/// 
/// # Arguments
/// * `app` - Tauriアプリケーションハンドル
/// 
/// # Returns
/// * `Result<(), Box<dyn std::error::Error>>` - 初期化結果
pub fn init_system_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    println!("Initializing system tray...");

    // システムトレイメニューを作成
    let show_item = MenuItem::with_id(app, "show", "Show PromPalette", true, None::<&str>)?;
    let hide_item = MenuItem::with_id(app, "hide", "Hide PromPalette", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit PromPalette", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;

    // システムトレイアイコンを作成
    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(false)
        .icon(app.default_window_icon().ok_or("No default window icon found")?.clone())
        .tooltip("PromPalette - AI Prompt Manager")
        .on_tray_icon_event(|tray, event| {
            match event {
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => {
                    // 左クリックでウィンドウの表示/非表示を切り替え
                    if let Some(window) = tray.app_handle().get_webview_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
                _ => {
                    // その他のイベントは無視
                }
            }
        })
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "hide" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
                "quit" => {
                    // アプリケーションを完全に終了
                    app.exit(0);
                }
                _ => {}
            }
        })
        .build(app)?;

    println!("System tray initialized successfully");
    Ok(())
}

/// ウィンドウクローズイベントの処理
/// ウィンドウを閉じてもアプリを終了せず、システムトレイに隠す
pub fn handle_window_close_requested(app_handle: &AppHandle, window_label: &str) {
    if let Some(window) = app_handle.get_webview_window(window_label) {
        // ウィンドウを隠すだけで、アプリケーションは終了しない
        let _ = window.hide();
        
        // 初回クローズ時にユーザーに通知
        let _ = app_handle.emit("app-minimized-to-tray", ());
        
        println!("Window '{}' hidden to system tray", window_label);
    }
}

/// メインウィンドウの表示状態を切り替える
#[tauri::command]
pub fn toggle_main_window(app_handle: AppHandle) -> Result<bool, String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        let is_visible = window.is_visible().map_err(|e| e.to_string())?;
        
        if is_visible {
            window.hide().map_err(|e| e.to_string())?;
            Ok(false)
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
            Ok(true)
        }
    } else {
        Err("Main window not found".to_string())
    }
}

/// アプリケーションを完全に終了
#[tauri::command]
pub fn quit_app(app_handle: AppHandle) {
    app_handle.exit(0);
}