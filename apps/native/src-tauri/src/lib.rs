/*!
 * `PromPalette` Native App - Tauri Application
 * プロンプト管理のためのデスクトップアプリケーション
 */

mod database;
mod commands;
mod shortcuts;
mod config;
mod global_hotkey;
mod hotkey_test;
mod tray;
mod app_state;

use commands::{
    copy_pinned_prompt, create_prompt, delete_prompt, get_all_prompts, get_app_info,
    get_pinned_prompts, get_prompt, init_database, pin_prompt, search_prompts,
    search_prompts_fast, unpin_prompt, update_prompt
};
use tauri::{Emitter, Manager};

/// Legacy greet command (for testing)
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust!")
}

/// Tauri アプリケーションのメインエントリーポイント
/// 
/// # Panics
/// データベース初期化失敗時やTauriアプリケーションの実行時にパニックする可能性があります
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            // アプリケーション起動時にデータベースを同期的に初期化
            // エラー時はアプリケーション起動を停止
            tauri::async_runtime::block_on(async {
                database::init_database().await
            }).map_err(|e| {
                eprintln!("Critical: Failed to initialize database: {e}");
                eprintln!("Application cannot start without database. Please check permissions and disk space.");
                e.to_string()
            })?;
            
            // システムトレイ初期化（失敗時もアプリは継続）
            if let Err(e) = tray::init_system_tray(app.handle()) {
                eprintln!("Warning: System tray initialization failed: {e}");
                eprintln!("The app will continue without system tray functionality.");
                
                // フロントエンドに通知（システムトレイなしでの動作）
                if let Err(emit_err) = app.handle().emit("system-tray-unavailable", e.to_string()) {
                    eprintln!("Failed to emit system tray unavailable event: {emit_err}");
                }
            } else {
                println!("System tray initialized successfully");
                
                // フロントエンドに成功通知
                if let Err(emit_err) = app.handle().emit("system-tray-ready", ()) {
                    eprintln!("Failed to emit system tray ready event: {emit_err}");
                }
            }
            
            // 初回起動時の処理
            app_state::handle_first_launch(app.handle());
            
            // ウィンドウクローズイベントのハンドリング設定
            if let Some(main_window) = app.get_webview_window("main") {
                let app_handle_for_close = app.handle().clone();
                main_window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        // デフォルトのクローズ動作を防ぐ
                        api.prevent_close();
                        // カスタムクローズ処理を実行
                        tray::handle_window_close_requested(&app_handle_for_close, "main");
                    }
                });
            } else {
                eprintln!("Warning: Main window not found during setup");
            }
            
            // グローバルショートカット登録
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                // 基本ショートカット登録
                match shortcuts::register_global_shortcuts(app_handle.clone()).await {
                    Ok(()) => {
                        println!("Global shortcuts registered successfully");
                    }
                    Err(e) => {
                        eprintln!("Failed to register global shortcuts: {}", e.error);
                        
                        // ショートカット登録失敗をフロントエンドに通知
                        if let Err(emit_err) = app_handle.emit("shortcut-registration-failed", e.error) {
                            eprintln!("Failed to emit shortcut registration failure event: {emit_err}");
                        }
                    }
                }
                
                // パレット用ホットキー登録
                match global_hotkey::register_palette_hotkeys(app_handle.clone()).await {
                    Ok(()) => {
                        println!("Palette hotkeys registered successfully");
                    }
                    Err(e) => {
                        eprintln!("Failed to register palette hotkeys: {}", e.error);
                        
                        // パレットホットキー登録失敗をフロントエンドに通知  
                        if let Err(emit_err) = app_handle.emit("palette-hotkey-registration-failed", e.error) {
                            eprintln!("Failed to emit palette hotkey registration failure event: {emit_err}");
                        }
                    }
                }
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            init_database,
            create_prompt,
            get_prompt,
            get_all_prompts,
            search_prompts,
            search_prompts_fast,
            update_prompt,
            delete_prompt,
            get_app_info,
            pin_prompt,
            unpin_prompt,
            get_pinned_prompts,
            copy_pinned_prompt,
            shortcuts::register_global_shortcuts,
            shortcuts::unregister_global_shortcuts,
            shortcuts::get_shortcut_status,
            shortcuts::hide_main_window,
            tray::toggle_main_window,
            tray::quit_app,
            app_state::on_app_focus,
            app_state::get_app_state,
            app_state::get_tray_help_message,
            global_hotkey::register_palette_hotkeys,
            global_hotkey::unregister_palette_hotkeys,
            global_hotkey::get_palette_hotkey_status,
            hotkey_test::test_hotkey_combinations,
            hotkey_test::cleanup_test_hotkeys
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|err| {
            eprintln!("Critical error while running Tauri application: {err}");
            eprintln!("The application will now exit.");
            
            // エラーログをファイルに保存（可能な場合）
            if let Ok(mut log_file) = std::fs::OpenOptions::new()
                .create(true)
                .append(true)
                .open("prompalette_crash.log") 
            {
                use std::io::Write;
                let _ = writeln!(log_file, "[{}] Fatal error: {}", chrono::Utc::now(), err);
            }
            
            std::process::exit(1);
        });
}
